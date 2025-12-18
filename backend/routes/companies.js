const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../middleware/auth');

router.post('/favorites/:influencerId', auth, companyController.addToFavorites);
router.delete('/favorites/:influencerId', auth, companyController.removeFromFavorites);
router.get('/favorites', auth, companyController.getFavorites);

module.exports = router;