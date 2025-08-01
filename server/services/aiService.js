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
        model: "gpt-3.5-turbo",
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
      const memoryContext = memories && memories.length > 0 
        ? memories.map(memory => memory.content).join('\n')
        : 'No specific memories were shared during this session.';
        
      const userMessages = conversations
        .filter(conv => conv.isUser)
        .map(conv => conv.message);
      
      const conversationSummary = userMessages.length > 0 
        ? userMessages.join('\n') 
        : 'This was a brief conversation.';
      
      // Extract emotional themes from conversations
      const emotionalThemes = userMessages.length > 0 
        ? this.extractEmotionalThemes(userMessages)
        : 'connection and reflection';

      const prompt = `You are helping someone write a deeply personal and healing final letter to ${personName}. This letter should feel authentic and unique to their specific situation.

MEMORIES SHARED:
${memoryContext}

WHAT THE USER HAS EXPRESSED:
${conversationSummary}

RELATIONSHIP TYPE: ${relationshipType}

Create a heartfelt, personalized letter that:
- Uses the SPECIFIC memories and feelings they shared (don't be generic)
- Reflects their unique emotional journey and what they've expressed
- Addresses ${personName} directly and personally
- Acknowledges their specific pain, joy, gratitude, or unresolved feelings
- Incorporates the emotional themes: ${emotionalThemes}
- Offers closure while honoring the relationship's unique nature
- Feels genuine and written BY this person, not a template

Make this letter deeply personal and specific to what they've actually shared. If they only said a little, work with that authentically rather than making assumptions. Write in first person as if the user is speaking directly to ${personName}.

The letter should start with "Dear ${personName}," and end with a personal closing.`;

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a compassionate writing assistant helping people create deeply personal healing letters. Focus on authenticity and specific details rather than generic language." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Final Letter Generation Error:', error);
      throw new Error('Failed to generate final letter');
    }
  }

  /**
   * Extract emotional themes from user messages
   */
  extractEmotionalThemes(messages) {
    const text = messages.join(' ').toLowerCase();
    const themes = [];
    
    if (text.includes('miss') || text.includes('lonely') || text.includes('alone')) {
      themes.push('missing them deeply');
    }
    if (text.includes('angry') || text.includes('mad') || text.includes('frustrated')) {
      themes.push('unresolved anger');
    }
    if (text.includes('sorry') || text.includes('regret') || text.includes('wish')) {
      themes.push('regret and things left unsaid');
    }
    if (text.includes('love') || text.includes('care') || text.includes('special')) {
      themes.push('deep love and appreciation');
    }
    if (text.includes('thank') || text.includes('grateful')) {
      themes.push('gratitude');
    }
    if (text.includes('forgive') || text.includes('hurt')) {
      themes.push('forgiveness and healing');
    }
    
    return themes.length > 0 ? themes.join(', ') : 'love, loss, and healing';
  }

  /**
   * Analyze sentiment and emotional needs of a message
   * @param {string} message - The message to analyze
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
