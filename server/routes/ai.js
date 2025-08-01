const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// All AI routes require authentication
router.use(authenticateToken);

// POST /api/ai/chat - Generate AI response for conversation
router.post('/chat', aiController.generateResponse);

// GET /api/ai/prompts - Get guided conversation prompts
router.get('/prompts', aiController.getGuidedPrompts);

// POST /api/ai/final-letter - Generate final letter for closure
router.post('/final-letter', aiController.generateFinalLetter);

// POST /api/ai/sentiment - Analyze sentiment of a message
router.post('/sentiment', aiController.analyzeSentiment);

module.exports = router;
