const crypto = require('crypto');

// Generate ETag from patient data
const generateETag = (patient) => {
  // Create a canonical JSON string (sorted keys, no secrets)
  const canonicalData = {
    id: patient.id,
    mrn: patient.mrn,
    firstName: patient.first_name,
    lastName: patient.last_name,
    dob: patient.dob,
    sex: patient.sex,
    addressLine1: patient.address_line1,
    city: patient.city,
    postalCode: patient.postal_code,
    countryCode: patient.country_code,
    createdAt: patient.created_at,
    updatedAt: patient.updated_at
  };
  
  const sortedKeys = Object.keys(canonicalData).sort();
  const sortedData = {};
  sortedKeys.forEach(key => {
    sortedData[key] = canonicalData[key];
  });
  const jsonString = JSON.stringify(sortedData);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
};

// Encrypt PHI data using pgcrypto
const encryptPHI = async (pool, data, cryptoKey) => {
  const encrypted = {};
  
  if (data.phone) {
    const phoneResult = await pool.query(
      'SELECT pgp_sym_encrypt($1, $2) as encrypted',
      [data.phone, cryptoKey]
    );
    encrypted.phone = phoneResult.rows[0].encrypted;
  }
  
  if (data.email && data.email.trim() !== '') {
    const emailResult = await pool.query(
      'SELECT pgp_sym_encrypt($1, $2) as encrypted',
      [data.email, cryptoKey]
    );
    encrypted.email = emailResult.rows[0].encrypted;
  }
  
  return encrypted;
};

// Decrypt PHI data using pgcrypto
const decryptPHI = async (pool, patient, cryptoKey) => {
  const decrypted = { ...patient };
  
  if (patient.phone) {
    const phoneResult = await pool.query(
      'SELECT pgp_sym_decrypt($1, $2) as decrypted',
      [patient.phone, cryptoKey]
    );
    decrypted.phone = phoneResult.rows[0].decrypted;
  }
  
  if (patient.email) {
    const emailResult = await pool.query(
      'SELECT pgp_sym_decrypt($1, $2) as decrypted',
      [patient.email, cryptoKey]
    );
    decrypted.email = emailResult.rows[0].decrypted;
  }
  
  return decrypted;
};

// Generate MRN (Medical Record Number)
const generateMRN = async (pool) => {
  const year = new Date().getFullYear();
  const prefix = `HOS-${year}`;
  
  // Get the highest number for this year
  const result = await pool.query(
    'SELECT mrn FROM patients WHERE mrn LIKE $1 ORDER BY mrn DESC LIMIT 1',
    [`${prefix}%`]
  );
  
  let nextNumber = 1;
  if (result.rows.length > 0) {
    const lastMRN = result.rows[0].mrn;
    const lastNumber = parseInt(lastMRN.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

module.exports = {
  generateETag,
  encryptPHI,
  decryptPHI,
  generateMRN
};
