const express = require('express');
const { 
  createSession, 
  getSessions, 
  getSession, 
  updateSession, 
  deleteSession,
  addMemory,
  updateMemory,
  deleteMemory
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

// Memory management routes
router.post('/:id/memories', addMemory);
router.put('/:id/memories/:memoryId', updateMemory);
router.delete('/:id/memories/:memoryId', deleteMemory);

module.exports = router;
