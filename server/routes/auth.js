const express = require('express');
const { register, login, getUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/user', authenticateToken, getUser);

module.exports = router;
