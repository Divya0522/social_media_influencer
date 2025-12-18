const express = require('express');
const router = express.Router();
const influencerController = require('../controllers/influencerController');
const auth = require('../middleware/auth');
const { 
  influencerValidation, 
  influencerUpdateValidation, 
  handleValidationErrors 
} = require('../middleware/validation');

router.get('/', auth, influencerController.getAllInfluencers);
router.get('/:id', auth, influencerController.getInfluencerById);

router.post('/', auth, influencerValidation, handleValidationErrors, influencerController.createInfluencer);
router.put('/:id', auth, influencerUpdateValidation, handleValidationErrors, influencerController.updateInfluencer);

module.exports = router;