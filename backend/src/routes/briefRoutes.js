const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { submitBrief } = require('../controllers/briefController');

// POST /api/projects
// Public — no authentication required (clients submit without an account)
// upload.array('files', 5) — multer middleware processes up to 5 files with field name "files"
router.post('/', upload.array('files', 5), submitBrief);

module.exports = router;
