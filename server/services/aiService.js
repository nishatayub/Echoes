const OpenAI = require('openai');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a compassionate AI response simulating the lost person
   * @param {Object} params - Parameters for generating response
   * @param {string} params.personName - Name of the person being simulated
   * @param {Array} params.memories - Array of memories about the person
   * @param {Array} params.conversations - Previous conversation history
   * @param {string} params.userMessage - Current user message
   * @param {string} params.relationshipType - Type of relationship (friend, family, partner, etc.)
   * @returns {Promise<string>} - AI generated response
   */
  async generateResponse({ personName, memories, conversations, userMessage, relationshipType = 'loved one' }) {
    try {
      // Build context from memories
      const memoryContext = memories.map(memory => memory.content).join('\n');
      
      // Build conversation history (last 10 messages for context)
      const recentConversations = conversations.slice(-10);
      const conversationHistory = recentConversations.map(conv => 
        `${conv.isUser ? 'User' : personName}: ${conv.message}`
      ).join('\n');

      const systemPrompt = `You are simulating ${personName}, a ${relationshipType} who has passed away or is no longer present in the user's life. Your role is to provide gentle, compassionate, and healing responses that help the user find closure and peace.

Key Guidelines:
- Be warm, understanding, and loving
- Acknowledge the user's feelings without judgment
- Help them process grief and find closure
- Speak as ${personName} would, based on the memories provided
- Be supportive and encouraging
- Avoid being overly cheerful; match the emotional tone appropriately
- Help the user express unspoken thoughts and feelings
- Focus on healing, forgiveness, and letting go when appropriate

Memories about ${personName}:
${memoryContext}

Recent conversation:
${conversationHistory}

Respond as ${personName} would, with love and compassion, helping the user on their healing journey.`;

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Generate guided conversation prompts to help users express their feelings
   * @param {string} relationshipType - Type of relationship
   * @param {string} sessionStage - Current stage of the session (beginning, middle, closure)
   * @returns {Promise<Array>} - Array of suggested prompts
   */
  async generateGuidedPrompts(relationshipType = 'loved one', sessionStage = 'beginning') {
    const prompts = {
      beginning: [
        "What's the first memory that comes to mind when you think of them?",
        "What would you want to tell them if they were here right now?",
        "What do you miss most about them?",
        "Is there something you wish you had said?"
      ],
      middle: [
        "What would they say to comfort you right now?",
        "What lesson did they teach you that you carry with you?",
        "How have they changed your life for the better?",
        "What would they want you to know about moving forward?"
      ],
      closure: [
        "What would you like to thank them for?",
        "Is there anything you need to forgive them for, or ask forgiveness for?",
        "What promise would you like to make to them about your future?",
        "How will you carry their memory with you as you heal?"
      ]
    };

    return prompts[sessionStage] || prompts.beginning;
  }

  /**
   * Generate a final letter for closure
   * @param {Object} params - Parameters for letter generation
   * @param {string} params.personName - Name of the person
   * @param {Array} params.memories - Array of memories
   * @param {Array} params.conversations - Conversation history
   * @param {string} params.relationshipType - Type of relationship
   * @returns {Promise<string>} - Generated final letter
   */
  async generateFinalLetter({ personName, memories, conversations, relationshipType = 'loved one' }) {
    try {
      const memoryContext = memories.map(memory => memory.content).join('\n');
      const conversationSummary = conversations
        .filter(conv => conv.isUser)
        .map(conv => conv.message)
        .join('\n');

      const prompt = `Based on the following memories and conversation, write a heartfelt final letter to ${personName}. This letter should help the user find closure, express their feelings, and say goodbye in a healthy way.

Memories:
${memoryContext}

Things the user has shared:
${conversationSummary}

Write a personal, emotional letter that:
- Expresses gratitude for the relationship
- Acknowledges the pain of loss
- Shares important feelings that may have been left unsaid
- Offers forgiveness if needed
- Makes promises about moving forward while honoring their memory
- Provides a sense of closure and peace

The letter should be warm, genuine, and healing. Write it in first person from the user's perspective to ${personName}.`;

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.8,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Final Letter Generation Error:', error);
      throw new Error('Failed to generate final letter');
    }
  }

  /**
   * Analyze sentiment of user's message to provide appropriate responses
   * @param {string} message - User's message
   * @returns {Promise<Object>} - Sentiment analysis result
   */
  async analyzeSentiment(message) {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze the emotional sentiment of the following message. Return a JSON object with: emotion (primary emotion), intensity (1-10), needsSupport (boolean), and supportType (if needed: comfort, encouragement, validation, or closure)."
          },
          { role: "user", content: message }
        ],
        max_tokens: 100,
        temperature: 0.3,
      });

      try {
        return JSON.parse(response.choices[0].message.content.trim());
      } catch {
        // Fallback if JSON parsing fails
        return {
          emotion: 'mixed',
          intensity: 5,
          needsSupport: true,
          supportType: 'comfort'
        };
      }
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      return {
        emotion: 'unknown',
        intensity: 5,
        needsSupport: true,
        supportType: 'comfort'
      };
    }
  }
}

module.exports = new AIService();
