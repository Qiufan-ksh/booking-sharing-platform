const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, interactionController.trackInteraction);

module.exports = router;