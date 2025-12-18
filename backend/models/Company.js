const pool = require('../config/database');

class Company {
  static async create(companyData) {
    const {
      userId,
      companyName,
      industry,
      description,
      contactPerson,
      contactEmail,
      website
    } = companyData;

    const [result] = await pool.execute(
      `INSERT INTO companies (
        user_id, company_name, industry, description, contact_person, contact_email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, companyName, industry, description, contactPerson, contactEmail, website]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM companies WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  static async addToFavorites(companyId, influencerId) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO favorites (company_id, influencer_id) VALUES (?, ?)',
        [companyId, influencerId]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return null; 
      }
      throw error;
    }
  }

  static async removeFromFavorites(companyId, influencerId) {
    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE company_id = ? AND influencer_id = ?',
      [companyId, influencerId]
    );
    return result.affectedRows > 0;
  }

  static async getFavorites(companyId) {
    const [rows] = await pool.execute(
      `SELECT i.*, u.email 
       FROM favorites f 
       JOIN influencers i ON f.influencer_id = i.id 
       JOIN users u ON i.user_id = u.id 
       WHERE f.company_id = ?`,
      [companyId]
    );
    return rows;
  }
}

module.exports = Company;