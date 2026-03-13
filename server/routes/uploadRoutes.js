const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const path = require('path');

// Configure multer for temp storage
const upload = multer({ dest: 'uploads/' });

router.post('/upload-cutoffs', upload.single('file'), uploadController.uploadCutoffs);

module.exports = router;
