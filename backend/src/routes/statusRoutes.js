const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

// Map GET / to controller getStatus function
router.get('/', statusController.getStatus);

module.exports = router;
