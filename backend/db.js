const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos MySQL:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

module.exports = db;