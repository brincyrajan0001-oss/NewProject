const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Read and execute the initial schema
    const schemaPath = path.join(__dirname, '001_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 All migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
