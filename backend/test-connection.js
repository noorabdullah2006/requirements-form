const { Client } = require('pg');
require('dotenv').config();

console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    client.end();
  })
  .catch(err => {
    console.error('Connection failed! Full error details:');
    console.error(err);
    process.exit(1);
  });
