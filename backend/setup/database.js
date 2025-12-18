
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;

  try {
   
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    console.log('Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'influencer_platform';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
   
    await connection.end();

    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
    });
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('influencer', 'company') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS influencers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        platform ENUM('instagram', 'youtube', 'tiktok', 'twitter', 'linkedin') NOT NULL,
        followers_count INT,
        category ENUM('fashion', 'fitness', 'tech', 'travel', 'gaming', 'food', 'lifestyle', 'beauty', 'business') NOT NULL,
        audience_gender ENUM('male', 'female', 'mixed') DEFAULT 'mixed',
        audience_age_range VARCHAR(50),
        audience_country VARCHAR(100),
        instagram_url VARCHAR(500),
        youtube_url VARCHAR(500),
        tiktok_url VARCHAR(500),
        twitter_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        profile_image VARCHAR(500),
        banner_image VARCHAR(500),
        contact_email VARCHAR(255),
        is_approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
   
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        company_name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        description TEXT,
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        website VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
   
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        company_id INT,
        influencer_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (company_id, influencer_id)
      );
    `);
   
    return db;

  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
