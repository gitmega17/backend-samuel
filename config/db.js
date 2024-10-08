const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ou a string de conexão direta
  ssl: {
    rejectUnauthorized: false // Altere para true se você estiver usando um certificado válido
  }
});

module.exports = pool;