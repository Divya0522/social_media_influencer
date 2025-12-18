

const Influencer = require('../models/Influencer');

exports.getAllInfluencers = async (req, res) => {
  try {
    const filters = {
      platform: req.query.platform,
      category: req.query.category,
      minFollowers: req.query.minFollowers ? parseInt(req.query.minFollowers) : null,
      maxFollowers: req.query.maxFollowers ? parseInt(req.query.maxFollowers) : null,
      search: req.query.search,
      
      excludeUserId: req.user && req.user.role === 'influencer' ? req.user.id : null
    };

    const influencers = await Influencer.findAll(filters);
    res.json(influencers);
  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInfluencerById = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    res.json(influencer);
  } catch (error) {
    console.error('Get influencer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createInfluencer = async (req, res) => {
  try {
   
    const existingProfile = await Influencer.findByUserId(req.user.id);
    if (existingProfile) {
      return res.status(400).json({ message: 'Influencer profile already exists for this user' });
    }

    const influencerId = await Influencer.create({
      userId: req.user.id,
      ...req.body
    });
    
    const influencer = await Influencer.findById(influencerId);
    res.status(201).json(influencer);
  } catch (error) {
    console.error('Create influencer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateInfluencer = async (req, res) => {
  try {
   
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    if (influencer.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updated = await Influencer.update(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const updatedInfluencer = await Influencer.findById(req.params.id);
    res.json(updatedInfluencer);
  } catch (error) {
    console.error('Update influencer error:', error);
    res.status(500).json({ 
      message: 'Server error during update',
      error: error.message 
    });
  }
};