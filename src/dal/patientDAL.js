const { pool } = require('../config/database');
const { generateMRN, encryptPHI, decryptPHI, generateETag } = require('../utils/encryption');

class PatientDAL {
  constructor() {
    this.pool = pool;
    this.cryptoKey = process.env.CRYPTO_KEY || 'change-me-min-32-chars-encryption-key';
  }

  // Create a new patient
  async create(patientData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Generate MRN
      const mrn = await generateMRN(this.pool);
      
      // Encrypt PHI data
      const encryptedData = await encryptPHI(this.pool, {
        phone: patientData.phone,
        email: patientData.email
      }, this.cryptoKey);
      
      // Insert patient
      const result = await client.query(`
        INSERT INTO patients (
          id, mrn, first_name, last_name, dob, sex, 
          phone, email, address_line1, city, postal_code, country_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        patientData.id,
        mrn,
        patientData.firstName,
        patientData.lastName,
        patientData.dob,
        patientData.sex,
        encryptedData.phone,
        encryptedData.email,
        patientData.addressLine1,
        patientData.city,
        patientData.postalCode,
        patientData.countryCode
      ]);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get patient by ID
  async getById(id) {
    const result = await this.pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Decrypt PHI data
    const decryptedPatient = await decryptPHI(this.pool, result.rows[0], this.cryptoKey);
    return decryptedPatient;
  }

  // Update patient
  async update(id, updateData, expectedETag) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get current patient for ETag validation
      const currentPatient = await this.getById(id);
      if (!currentPatient) {
        throw new Error('NOT_FOUND');
      }
      
      // Validate ETag
      const currentETag = generateETag(currentPatient);
      const quotedETag = `"${currentETag}"`;
      if (expectedETag && quotedETag !== expectedETag) {
        throw new Error('PRECONDITION_FAILED');
      }
      
      // Encrypt PHI data if provided
      let encryptedData = {};
      if (updateData.phone !== undefined || updateData.email !== undefined) {
        encryptedData = await encryptPHI(this.pool, {
          phone: updateData.phone,
          email: updateData.email
        }, this.cryptoKey);
      }
      
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCount = 1;
      
      const fieldMappings = {
        firstName: 'first_name',
        lastName: 'last_name',
        phone: 'phone',
        email: 'email',
        addressLine1: 'address_line1',
        city: 'city',
        postalCode: 'postal_code',
        countryCode: 'country_code'
      };
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && fieldMappings[key]) {
          const dbField = fieldMappings[key];
          updateFields.push(`${dbField} = $${paramCount}`);
          
          if (key === 'phone' || key === 'email') {
            values.push(encryptedData[key] || null);
          } else {
            values.push(updateData[key]);
          }
          paramCount++;
        }
      });
      
      if (updateFields.length === 0) {
        throw new Error('VALIDATION_FAILED');
      }
      
      // Add updated_at
      updateFields.push(`updated_at = NOW()`);
      
      values.push(id);
      
      const result = await client.query(`
        UPDATE patients 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Search patients
  async search(searchTerm, limit = 20, cursor = null, mrn = null, lastName = null) {
    let query = `
      SELECT * FROM patients 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    // Handle general search term (backward compatibility)
    if (searchTerm) {
      query += ` AND (
        LOWER(last_name) LIKE LOWER($${paramCount}) OR
        mrn LIKE $${paramCount}
      )`;
      params.push(`%${searchTerm}%`);
      paramCount++;
    }
    
    // Handle specific MRN filter
    if (mrn) {
      query += ` AND mrn LIKE $${paramCount}`;
      params.push(`%${mrn}%`);
      paramCount++;
    }
    
    // Handle specific last name filter
    if (lastName) {
      query += ` AND LOWER(last_name) LIKE LOWER($${paramCount})`;
      params.push(`%${lastName}%`);
      paramCount++;
    }
    
    if (cursor) {
      query += ` AND id > $${paramCount}`;
      params.push(cursor);
      paramCount++;
    }
    
    query += ` ORDER BY id LIMIT $${paramCount}`;
    params.push(limit + 1); // Get one extra to check if there are more results
    
    const result = await this.pool.query(query, params);
    
    const patients = result.rows.slice(0, limit);
    const hasMore = result.rows.length > limit;
    const nextCursor = hasMore ? patients[patients.length - 1].id : null;
    
    // Decrypt PHI data for all patients
    const decryptedPatients = await Promise.all(
      patients.map(patient => decryptPHI(this.pool, patient, this.cryptoKey))
    );
    
    return {
      patients: decryptedPatients,
      nextCursor,
      hasMore
    };
  }

  // Log audit entry
  async logAudit(actor, action, patientId, ip, userAgent, diff) {
    await this.pool.query(`
      INSERT INTO audit_log (actor, action, patient_id, ip, user_agent, diff)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [actor, action, patientId, ip, userAgent, diff]);
  }
}

module.exports = new PatientDAL();
