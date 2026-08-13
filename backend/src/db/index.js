const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool pointing to our database URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper function to run query commands on the pool
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  query
};
