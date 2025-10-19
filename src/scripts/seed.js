const { ulid } = require('ulid');
const { pool } = require('../config/database');
const { encryptPHI } = require('../utils/encryption');

const samplePatients = [
  {
    firstName: 'John',
    lastName: 'Smith',
    dob: '1985-03-15',
    sex: 'male',
    phone: '+1234567890',
    email: 'john.smith@email.com',
    addressLine1: '123 Main St',
    city: 'New York',
    postalCode: '10001',
    countryCode: 'US'
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    dob: '1990-07-22',
    sex: 'female',
    phone: '+1987654321',
    email: 'sarah.j@email.com',
    addressLine1: '456 Oak Ave',
    city: 'Los Angeles',
    postalCode: '90210',
    countryCode: 'US'
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    dob: '1978-12-03',
    sex: 'male',
    phone: '+1555123456',
    email: '', // No email
    addressLine1: '789 Pine St',
    city: 'Chicago',
    postalCode: '60601',
    countryCode: 'US'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    dob: '1992-02-29', // Leap year
    sex: 'female',
    phone: '+1444555666',
    email: 'emily.davis@email.com',
    addressLine1: '321 Elm St',
    city: 'Boston',
    postalCode: '02101',
    countryCode: 'US'
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    dob: '1983-11-18',
    sex: 'male',
    phone: '+1777888999',
    email: 'david.wilson@email.com',
    addressLine1: '654 Maple Ave',
    city: 'Seattle',
    postalCode: '98101',
    countryCode: 'US'
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    dob: '1987-05-10',
    sex: 'female',
    phone: '+1666777888',
    email: 'lisa.anderson@email.com',
    addressLine1: '987 Cedar St',
    city: 'Miami',
    postalCode: '33101',
    countryCode: 'US'
  },
  {
    firstName: 'Robert',
    lastName: 'Taylor',
    dob: '1975-09-25',
    sex: 'male',
    phone: '+1333444555',
    email: '', // No email
    addressLine1: '147 Birch Ln',
    city: 'Denver',
    postalCode: '80201',
    countryCode: 'US'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Martinez',
    dob: '1991-01-14',
    sex: 'female',
    phone: '+1222333444',
    email: 'jennifer.martinez@email.com',
    addressLine1: '258 Spruce Dr',
    city: 'Phoenix',
    postalCode: '85001',
    countryCode: 'US'
  },
  {
    firstName: 'Christopher',
    lastName: 'Garcia',
    dob: '1989-08-07',
    sex: 'male',
    phone: '+1111222333',
    email: 'chris.garcia@email.com',
    addressLine1: '369 Willow Way',
    city: 'Austin',
    postalCode: '73301',
    countryCode: 'US'
  },
  {
    firstName: 'Amanda',
    lastName: 'Lee',
    dob: '1986-04-12',
    sex: 'female',
    phone: '+1999888777',
    email: 'amanda.lee@email.com',
    addressLine1: '741 Poplar St',
    city: 'Portland',
    postalCode: '97201',
    countryCode: 'US'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    const cryptoKey = process.env.CRYPTO_KEY || 'change-me-min-32-chars-encryption-key';
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await pool.query('DELETE FROM audit_log');
    await pool.query('DELETE FROM patients');
    
    // Reset MRN sequence by dropping and recreating the table
    // (In a real app, you'd use a sequence table)
    console.log('🔄 Resetting MRN sequence...');
    
    // Insert sample patients
    console.log('👥 Inserting sample patients...');
    
    for (let i = 0; i < samplePatients.length; i++) {
      const patient = samplePatients[i];
      const id = ulid();
      
      // Generate MRN
      const year = new Date().getFullYear();
      const mrn = `HOS-${year}${(i + 1).toString().padStart(4, '0')}`;
      
      // Encrypt PHI data
      const encryptedData = await encryptPHI(pool, {
        phone: patient.phone,
        email: patient.email
      }, cryptoKey);
      
      // Insert patient
      await pool.query(`
        INSERT INTO patients (
          id, mrn, first_name, last_name, dob, sex, 
          phone, email, address_line1, city, postal_code, country_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        id,
        mrn,
        patient.firstName,
        patient.lastName,
        patient.dob,
        patient.sex,
        encryptedData.phone,
        encryptedData.email,
        patient.addressLine1,
        patient.city,
        patient.postalCode,
        patient.countryCode
      ]);
      
      console.log(`✅ Created patient: ${patient.firstName} ${patient.lastName} (${mrn})`);
    }
    
    console.log(`🎉 Successfully seeded ${samplePatients.length} patients`);
    console.log('📊 Sample MRNs:');
    for (let i = 0; i < Math.min(5, samplePatients.length); i++) {
      const year = new Date().getFullYear();
      const mrn = `HOS-${year}${(i + 1).toString().padStart(4, '0')}`;
      console.log(`   - ${mrn} (${samplePatients[i].firstName} ${samplePatients[i].lastName})`);
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Database seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
