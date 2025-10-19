const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'demo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123brinz',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Check if pgcrypto extension is available
const checkPgcrypto = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM pg_extension WHERE extname = $1', ['pgcrypto']);
    client.release();
    return result.rows.length > 0;
  } catch (err) {
    console.error('❌ Failed to check pgcrypto extension:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  checkPgcrypto
};
