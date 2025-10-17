const express = require('express');
const router = express.Router();

const basicController = require('../controller/basicController');

router.get('/basic', basicController.getBasicMessage);

module.exports = router;
