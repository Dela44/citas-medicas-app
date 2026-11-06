const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar a la base de datos MySQL:', err);
    return;
  }
  connection.release();
  console.log('Pool conectado a la base de datos MySQL');
});

module.exports = db;