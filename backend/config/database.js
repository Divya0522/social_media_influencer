// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });


// module.exports = pool;


const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,          // trolley.proxy.rlwy.net
  user: process.env.DB_USER,          // root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,      // railway
  port: Number(process.env.DB_PORT),  // 55070

  // 🔥 REQUIRED FOR RAILWAY + RENDER
  ssl: {
    rejectUnauthorized: false
  },

  connectTimeout: 20000,  
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

module.exports = pool;
