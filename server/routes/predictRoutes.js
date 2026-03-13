const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

// POST /api/predict
router.post('/predict', predictController.predictColleges);

// GET /api/predict/branches
router.get('/predict/branches', predictController.getBranches);

module.exports = router;
