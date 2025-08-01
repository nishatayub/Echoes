const express = require('express');
const { 
  createSession, 
  getSessions, 
  getSession, 
  updateSession, 
  deleteSession 
} = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All session routes require authentication
router.use(authenticateToken);

// Session routes
router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;
