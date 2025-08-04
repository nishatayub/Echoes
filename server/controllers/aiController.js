const HuggingFaceAIService = require('../services/huggingfaceService');
const Session = require('../models/Session');

// Create an instance of the HuggingFace service
const huggingfaceService = new HuggingFaceAIService();

/**
 * Generate AI response for conversation
 */
const generateResponse = async (req, res) => {
  try {
    const { sessionId, message, relationshipType } = req.body;
    
    console.log('AI Request received:', { sessionId, message, relationshipType, userId: req.user.userId });

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
    if (session.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't add user message here - frontend handles it
    // The session conversations will be used for context only

    // Analyze sentiment using free Hugging Face service
    let sentiment;
    try {
      sentiment = await huggingfaceService.analyzeSentiment(message);
    } catch (error) {
      console.log('Sentiment analysis failed, using fallback');
      sentiment = {
        emotion: 'processing',
        intensity: 5,
        needsSupport: true,
        supportType: 'comfort'
      };
    }
    console.log('Sentiment analyzed:', sentiment);

    // Generate AI response using the current conversations for context
    let aiResponse;
    try {
      console.log('Trying AI response generation...');
      
      // Map relationship types for better context
      let mappedRelationshipType = relationshipType || session.relationshipType || 'other';
      
      // Map basic relationship types - keep them simple for AI service
      const relationshipMapping = {
        'family': 'family',
        'friend': 'friend', 
        'partner': 'partner',
        'pet': 'pet',
        'mentor': 'mentor',
        'other': 'other'
      };
      
      const contextualRelationship = relationshipMapping[mappedRelationshipType] || mappedRelationshipType;
      
      aiResponse = await huggingfaceService.generateResponse({
        personName: session.personName,
        memories: session.memories,
        conversations: session.conversations, // Use existing conversations for context
        userMessage: message,
        relationshipType: contextualRelationship
      });
      console.log('AI response successful:', aiResponse);
      
      // Only proceed if we got a valid AI response
      if (!aiResponse || aiResponse.trim().length === 0) {
        throw new Error('Empty AI response received');
      }
      
    } catch (error) {
      console.log('AI service failed:', error.message);
      
      return res.status(500).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again.',
        error: error.message
      });
    }
    
    console.log('AI Response generated:', aiResponse);

    // Add ONLY the AI response to conversation history
    // (User message was already added by frontend)
    session.conversations.push({
      message: aiResponse,
      isUser: false,
      timestamp: new Date()
    });

    // Save the session with the AI response
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

    const prompts = await huggingfaceService.generateGuidedPrompts(
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
    const { sessionId, relationshipType, regenerate } = req.body;

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
    if (session.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user information for the letter
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    const userName = user ? user.name : null;

    // If regenerate is true or no final letter exists, generate a new one
    if (regenerate || !session.finalLetter) {
      console.log(`${regenerate ? 'Regenerating' : 'Generating'} final letter using AI...`);
      
      // Map relationship type for better context - keep simple for AI service
      let mappedRelationshipType = relationshipType || session.relationshipType || 'other';
      const relationshipMapping = {
        'family': 'family',
        'friend': 'friend', 
        'partner': 'partner',
        'pet': 'pet',
        'mentor': 'mentor',
        'other': 'other'
      };
      const contextualRelationship = relationshipMapping[mappedRelationshipType] || mappedRelationshipType;

      // Generate the final letter using AI service
      const finalLetter = await huggingfaceService.generateFinalLetter({
        personName: session.personName,
        memories: session.memories,
        conversations: session.conversations,
        relationshipType: contextualRelationship,
        userName: userName,
        forceRegenerate: regenerate || false
      });

      // Save the final letter to the session
      session.finalLetter = finalLetter;
      session.isCompleted = true;
      await session.save();

      console.log('Final letter generated and saved successfully');

      res.json({
        success: true,
        data: {
          finalLetter,
          session: session,
          isRegenerated: regenerate || false,
          generatedFor: userName
        }
      });
    } else {
      // Return existing final letter
      res.json({
        success: true,
        data: {
          finalLetter: session.finalLetter,
          session: session,
          isRegenerated: false,
          generatedFor: userName
        }
      });
    }

  } catch (error) {
    console.error('Generate Final Letter Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate final letter',
      error: error.message
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

    const sentiment = await huggingfaceService.analyzeSentiment(message);

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
