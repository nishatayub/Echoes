const aiService = require('../services/aiService');
const Session = require('../models/Session');

/**
 * Generate AI response for conversation
 */
const generateResponse = async (req, res) => {
  try {
    const { sessionId, message, relationshipType } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    // Get the session to provide context
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Analyze sentiment of user's message
    const sentiment = await aiService.analyzeSentiment(message);

    // Generate AI response
    const aiResponse = await aiService.generateResponse({
      personName: session.personName,
      memories: session.memories,
      conversations: session.conversations,
      userMessage: message,
      relationshipType: relationshipType || 'loved one'
    });

    // Add both user message and AI response to conversation history
    session.conversations.push({
      message: message,
      isUser: true,
      timestamp: new Date()
    });

    session.conversations.push({
      message: aiResponse,
      isUser: false,
      timestamp: new Date()
    });

    await session.save();

    res.json({
      success: true,
      data: {
        response: aiResponse,
        sentiment: sentiment,
        conversation: {
          userMessage: message,
          aiResponse: aiResponse,
          timestamp: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Generate Response Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response'
    });
  }
};

/**
 * Get guided conversation prompts
 */
const getGuidedPrompts = async (req, res) => {
  try {
    const { relationshipType, sessionStage } = req.query;

    const prompts = await aiService.generateGuidedPrompts(
      relationshipType || 'loved one',
      sessionStage || 'beginning'
    );

    res.json({
      success: true,
      data: {
        prompts,
        stage: sessionStage || 'beginning'
      }
    });

  } catch (error) {
    console.error('Get Guided Prompts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get guided prompts'
    });
  }
};

/**
 * Generate final letter for closure
 */
const generateFinalLetter = async (req, res) => {
  try {
    const { sessionId, relationshipType } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Get the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate the final letter
    const finalLetter = await aiService.generateFinalLetter({
      personName: session.personName,
      memories: session.memories,
      conversations: session.conversations,
      relationshipType: relationshipType || 'loved one'
    });

    // Save the final letter to the session
    session.finalLetter = finalLetter;
    session.isCompleted = true;
    await session.save();

    res.json({
      success: true,
      data: {
        finalLetter,
        session: session
      }
    });

  } catch (error) {
    console.error('Generate Final Letter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate final letter'
    });
  }
};

/**
 * Analyze sentiment of a message
 */
const analyzeSentiment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const sentiment = await aiService.analyzeSentiment(message);

    res.json({
      success: true,
      data: {
        sentiment,
        message
      }
    });

  } catch (error) {
    console.error('Analyze Sentiment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze sentiment'
    });
  }
};

module.exports = {
  generateResponse,
  getGuidedPrompts,
  generateFinalLetter,
  analyzeSentiment
};
