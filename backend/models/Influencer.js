
const pool = require('../config/database');

class Influencer {
  static async create(influencerData) {
    const {
      userId,
      name,
      bio,
      platform,
      followersCount,
      category,
      audienceGender,
      audienceAgeRange,
      audienceCountry,
      instagramUrl,
      youtubeUrl,
      tiktokUrl,
      twitterUrl,
      linkedinUrl,
      contactEmail
    } = influencerData;

    const [result] = await pool.execute(
      `INSERT INTO influencers (
        user_id, name, bio, platform, followers_count, category,
        audience_gender, audience_age_range, audience_country,
        instagram_url, youtube_url, tiktok_url, twitter_url, linkedin_url,
        contact_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, name, bio, platform, followersCount, category,
        audienceGender, audienceAgeRange, audienceCountry,
        instagramUrl, youtubeUrl, tiktokUrl, twitterUrl, linkedinUrl,
        contactEmail
      ]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM influencers WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT i.*, u.email 
       FROM influencers i 
       JOIN users u ON i.user_id = u.id 
       WHERE i.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT i.*, u.email 
      FROM influencers i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.is_approved = TRUE
    `;
    const params = [];

    if (filters.excludeUserId) {
      query += ' AND i.user_id != ?';
      params.push(filters.excludeUserId);
    }

    if (filters.platform) {
      query += ' AND i.platform = ?';
      params.push(filters.platform);
    }

    if (filters.category) {
      query += ' AND i.category = ?';
      params.push(filters.category);
    }

    if (filters.minFollowers) {
      query += ' AND i.followers_count >= ?';
      params.push(filters.minFollowers);
    }

    if (filters.maxFollowers) {
      query += ' AND i.followers_count <= ?';
      params.push(filters.maxFollowers);
    }

    if (filters.search) {
      query += ' AND (i.name LIKE ? OR i.bio LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY i.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE influencers SET ${fields} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
}

module.exports = Influencer;