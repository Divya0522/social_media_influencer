const Company = require('../models/Company');

exports.addToFavorites = async (req, res) => {
  try {
    const company = await Company.findByUserId(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const favoriteId = await Company.addToFavorites(company.id, req.params.influencerId);
    if (favoriteId === null) {
      return res.status(400).json({ message: 'Influencer already in favorites' });
    }

    res.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const company = await Company.findByUserId(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const removed = await Company.removeFromFavorites(company.id, req.params.influencerId);
    if (!removed) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const company = await Company.findByUserId(req.user.id);
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const favorites = await Company.getFavorites(company.id);
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};