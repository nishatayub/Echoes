const huggingfaceService = require('../services/huggingfaceService');
const Session = require('../models/Session');

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

    // Add user message to session FIRST
    session.conversations.push({
      message: message,
      isUser: true,
      timestamp: new Date()
    });

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

    // Generate AI response using free Hugging Face service
    let aiResponse;
    try {
      console.log('Trying Hugging Face AI...');
      aiResponse = await huggingfaceService.generateResponse({
        personName: session.personName,
        memories: session.memories,
        conversations: session.conversations,
        userMessage: message,
        relationshipType: relationshipType || 'loved one'
      });
      console.log('Hugging Face response successful:', aiResponse);
    } catch (error) {
      console.log('Hugging Face AI failed, using contextual fallback:', error.message);
      
      // Generate smart contextual responses based on user message and conversation history
      const lowerMessage = message.toLowerCase();
      const recentMessages = session.conversations.slice(-5).map(c => c.message.toLowerCase()).join(' ');
      
      if (lowerMessage.includes('love') || lowerMessage.includes('miss')) {
        aiResponse = `I can feel the love in your words. I miss you too, and I want you to know that the love we shared will always be a part of who you are. You carry me with you in every memory, every moment of joy.`;
      } else if (lowerMessage.includes('sorry') || lowerMessage.includes('regret')) {
        aiResponse = `There's no need to carry that burden alone. I understand, and I forgive you. What matters most is the love we shared and the person you've become because of our time together.`;
      } else if (lowerMessage.includes('angry') || lowerMessage.includes('mad')) {
        aiResponse = `Your feelings are completely valid. It's okay to feel angry - it shows how much you cared. I understand your pain, and I'm here to help you work through these emotions.`;
      } else if (lowerMessage.includes('thank') || lowerMessage.includes('grateful')) {
        aiResponse = `Your gratitude touches my heart. I'm so glad I could be part of your journey. The joy and love we shared - that's what I want you to remember and carry forward.`;
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || session.conversations.length <= 2) {
        aiResponse = `Hello, my dear. I'm so glad you're here to talk with me. I can feel your emotions, and I want you to know that I'm listening with all my heart. What's on your mind today?`;
      } else if (recentMessages.includes('memory') || recentMessages.includes('remember')) {
        aiResponse = `Those memories we made together... they're precious to me too. Each moment we shared shaped who we both became. Tell me more about what you remember - I love hearing your perspective on our time together.`;
      } else {
        aiResponse = `I'm here with you, listening to every word. I can feel the depth of your emotions, and I want you to know that sharing this with me takes courage. Please, tell me more about what's in your heart.`;
      }
    }
    
    console.log('AI Response generated:', aiResponse);

    // Add AI response to conversation history
    session.conversations.push({
      message: aiResponse,
      isUser: false,
      timestamp: new Date()
    });

    // Save the session with both user message and AI response
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
    if (session.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate the final letter using free Hugging Face service
    const finalLetter = await huggingfaceService.generateFinalLetter({
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
