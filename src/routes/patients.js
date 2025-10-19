const express = require('express');
const { ulid } = require('ulid');
const { patientSchema, updatePatientSchema, searchQuerySchema, createErrorResponse, ERROR_CODES } = require('../utils/validation');
const { generateETag } = require('../utils/encryption');
const patientDAL = require('../dal/patientDAL');

const router = express.Router();

// POST /patients - Create a new patient
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validationResult = patientSchema.safeParse(req.body);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map(err => ({
        path: err.path.join('.'),
        msg: err.message
      }));
      
      return res.status(400).json(createErrorResponse(
        ERROR_CODES.VALIDATION_FAILED,
        'Validation failed',
        details
      ));
    }
    
    const patientData = validationResult.data;
    patientData.id = ulid();
    
    // Create patient in database
    const createdPatient = await patientDAL.create(patientData);
    
    // Decrypt PHI for response
    const decryptedPatient = await patientDAL.getById(createdPatient.id);
    
    // Generate ETag
    const etag = generateETag(decryptedPatient);
    
    // Log audit
    await patientDAL.logAudit(
      req.actor,
      'CREATE_PATIENT',
      createdPatient.id,
      req.ip,
      req.get('User-Agent'),
      { created: decryptedPatient }
    );
    
    // Format response
    const response = {
      data: {
        id: decryptedPatient.id,
        mrn: decryptedPatient.mrn,
        firstName: decryptedPatient.first_name,
        lastName: decryptedPatient.last_name,
        dob: decryptedPatient.dob,
        sex: decryptedPatient.sex,
        phone: decryptedPatient.phone,
        email: decryptedPatient.email,
        addressLine1: decryptedPatient.address_line1,
        city: decryptedPatient.city,
        postalCode: decryptedPatient.postal_code,
        countryCode: decryptedPatient.country_code,
        createdAt: decryptedPatient.created_at,
        updatedAt: decryptedPatient.updated_at
      },
      _links: {
        self: `/api/v1/patients/${decryptedPatient.id}`
      }
    };
    
    res.set('ETag', `"${etag}"`);
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Error creating patient:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json(createErrorResponse(
        ERROR_CODES.CONFLICT,
        'Patient with this information already exists',
        []
      ));
    }
    
    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      'Internal server error',
      []
    ));
  }
});

// GET /patients/:id - Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check If-None-Match header
    const ifNoneMatch = req.get('if-none-match');
    
    const patient = await patientDAL.getById(id);
    if (!patient) {
      return res.status(404).json(createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Patient not found',
        []
      ));
    }
    
    const etag = generateETag(patient);
    console.log('Generated ETag:', etag); // Debug log
    
    // Return 304 if ETag matches
    if (ifNoneMatch && ifNoneMatch === `"${etag}"`) {
      return res.status(304).end();
    }
    
    // Format response
    const response = {
      data: {
        id: patient.id,
        mrn: patient.mrn,
        firstName: patient.first_name,
        lastName: patient.last_name,
        dob: patient.dob,
        sex: patient.sex,
        phone: patient.phone,
        email: patient.email,
        addressLine1: patient.address_line1,
        city: patient.city,
        postalCode: patient.postal_code,
        countryCode: patient.country_code,
        createdAt: patient.created_at,
        updatedAt: patient.updated_at
      },
      _links: {
        self: `/api/v1/patients/${patient.id}`
      }
    };
    
    res.set('ETag', `"${etag}"`);
    console.log('Setting ETag header:', `"${etag}"`); // Debug log
    res.json(response);
    
  } catch (error) {
    console.error('Error getting patient:', error);
    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      'Internal server error',
      []
    ));
  }
});

// PUT /patients/:id - Update patient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ifMatch = req.get('if-match');
    
    if (!ifMatch) {
      return res.status(428).json(createErrorResponse(
        ERROR_CODES.PRECONDITION_REQUIRED,
        'If-Match header is required for updates',
        []
      ));
    }
    
    // Validate request body
    const validationResult = updatePatientSchema.safeParse(req.body);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map(err => ({
        path: err.path.join('.'),
        msg: err.message
      }));
      
      return res.status(400).json(createErrorResponse(
        ERROR_CODES.VALIDATION_FAILED,
        'Validation failed',
        details
      ));
    }
    
    const updateData = validationResult.data;
    
    // Get current patient for audit logging
    const currentPatient = await patientDAL.getById(id);
    if (!currentPatient) {
      return res.status(404).json(createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Patient not found',
        []
      ));
    }
    
    // Update patient
    const updatedPatient = await patientDAL.update(id, updateData, ifMatch);
    
    // Decrypt PHI for response
    const decryptedPatient = await patientDAL.getById(id);
    
    // Generate new ETag
    const etag = generateETag(decryptedPatient);
    
    // Log audit
    const diff = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbField = key === 'firstName' ? 'first_name' : 
                       key === 'lastName' ? 'last_name' :
                       key === 'addressLine1' ? 'address_line1' :
                       key === 'postalCode' ? 'postal_code' :
                       key === 'countryCode' ? 'country_code' : key;
        diff[dbField] = {
          from: currentPatient[dbField],
          to: decryptedPatient[dbField]
        };
      }
    });
    
    await patientDAL.logAudit(
      req.actor,
      'UPDATE_PATIENT',
      id,
      req.ip,
      req.get('User-Agent'),
      diff
    );
    
    // Format response
    const response = {
      data: {
        id: decryptedPatient.id,
        mrn: decryptedPatient.mrn,
        firstName: decryptedPatient.first_name,
        lastName: decryptedPatient.last_name,
        dob: decryptedPatient.dob,
        sex: decryptedPatient.sex,
        phone: decryptedPatient.phone,
        email: decryptedPatient.email,
        addressLine1: decryptedPatient.address_line1,
        city: decryptedPatient.city,
        postalCode: decryptedPatient.postal_code,
        countryCode: decryptedPatient.country_code,
        createdAt: decryptedPatient.created_at,
        updatedAt: decryptedPatient.updated_at
      },
      _links: {
        self: `/api/v1/patients/${decryptedPatient.id}`
      }
    };
    
    res.set('ETag', `"${etag}"`);
    res.json(response);
    
  } catch (error) {
    console.error('Error updating patient:', error);
    
    if (error.message === 'PRECONDITION_FAILED') {
      return res.status(412).json(createErrorResponse(
        ERROR_CODES.PRECONDITION_FAILED,
        'ETag mismatch - patient was modified by another request',
        []
      ));
    }
    
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json(createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Patient not found',
        []
      ));
    }
    
    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      'Internal server error',
      []
    ));
  }
});

// GET /patients - Search patients
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = searchQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      const details = validationResult.error.errors.map(err => ({
        path: err.path.join('.'),
        msg: err.message
      }));
      
      return res.status(400).json(createErrorResponse(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid query parameters',
        details
      ));
    }
    
    const { search, mrn, lastName, limit = 20, cursor } = validationResult.data;
    
    // Search patients
    const result = await patientDAL.search(search, limit, cursor, mrn, lastName);
    
    // Format response
    const patients = result.patients.map(patient => ({
      id: patient.id,
      mrn: patient.mrn,
      firstName: patient.first_name,
      lastName: patient.last_name,
      dob: patient.dob,
      sex: patient.sex,
      phone: patient.phone,
      email: patient.email,
      addressLine1: patient.address_line1,
      city: patient.city,
      postalCode: patient.postal_code,
      countryCode: patient.country_code,
      createdAt: patient.created_at,
      updatedAt: patient.updated_at
    }));
    
    const response = {
      data: patients,
      _links: {
        self: `/api/v1/patients${req.url}`
      }
    };
    
    if (result.nextCursor) {
      response._links.next = `/api/v1/patients?${new URLSearchParams({
        ...req.query,
        cursor: result.nextCursor
      }).toString()}`;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      'Internal server error',
      []
    ));
  }
});

module.exports = router;
