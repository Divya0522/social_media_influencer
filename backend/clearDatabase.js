const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'influencer_platform',
  });

  try {
    console.log('Connected to database. Clearing all data...');

    // Disable foreign key checks temporarily
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate all tables
    await connection.query('TRUNCATE TABLE favorites');
    await connection.query('TRUNCATE TABLE companies');
    await connection.query('TRUNCATE TABLE influencers');
    await connection.query('TRUNCATE TABLE users');

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ All tables cleared successfully.');
  } catch (err) {
    console.error('❌ Error clearing database:', err);
  } finally {
    await connection.end();
  }
}

clearDatabase();
