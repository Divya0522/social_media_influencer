const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Influencer = require('../models/Influencer');
const Company = require('../models/Company');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || '1234567890', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;

    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userId = await User.create(email, password, role);

    if (role === 'influencer') {
      await Influencer.create({ userId, ...profileData });
    } 
    else if(role==='company'){
      await Company.create({
    userId,
    companyName: profileData.companyName,
    industry: profileData.industry,
    description: profileData.description,
    contactPerson: profileData.contactPerson,
    contactEmail: profileData.contactEmail,
    website: profileData.website
  });
    }

    const token = generateToken(userId);
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let profile = null;
    if (user.role === 'influencer') {
      profile = await Influencer.findByUserId(user.id);
    } else if (user.role === 'company') {
      profile = await Company.findByUserId(user.id);
    }

    const token = generateToken(user.id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'influencer') {
      profile = await Influencer.findByUserId(req.user.id);
    } else if (req.user.role === 'company') {
      profile = await Company.findByUserId(req.user.id);
    }

    res.json({
      user: req.user,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};