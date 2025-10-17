const express = require('express');
const router = express.Router();
const { contactUs } = require('../controller/contactController');

// POST /api/v1/contact
router.post('/contact', contactUs);

module.exports = router;
