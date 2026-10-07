const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', bookController.getAllBooks);
router.post('/', verifyToken, bookController.createBook);

module.exports = router;