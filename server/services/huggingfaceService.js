const { HfInference } = require('@huggingface/inference');
const fetch = require('node-fetch');

class HuggingFaceAIService {
  constructor() {
    // Using free tier - no API key required for basic models
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY || undefined);
  }

  /**
   * Generate response using free AI alternatives
   */
  async generateResponse({ personName, memories, conversations, userMessage, relationshipType = 'loved one' }) {
    try {
      // Try AI services with Groq prioritized for speed and reliability
      console.log('Trying Groq API first...');
      
      // Option 1: Try Groq first (free tier with Llama models - FASTEST)
      try {
        const groqResponse = await this.tryGroqAPI(personName, memories, conversations, userMessage, relationshipType);
        if (groqResponse) {
          console.log('Success with Groq API');
          return groqResponse;
        }
      } catch (groqError) {
        console.log('Groq API failed:', groqError.message);
      }

      // Option 2: Try OpenAI as backup (if available)
      try {
        const openaiResponse = await this.tryOpenAI(personName, memories, conversations, userMessage, relationshipType);
        if (openaiResponse) {
          console.log('Success with OpenAI API');
          return openaiResponse;
        }
      } catch (openaiError) {
        console.log('OpenAI API failed:', openaiError.message);
      }

      // Option 3: Try Together.ai (free tier)
      try {
        const togetherResponse = await this.tryTogetherAPI(personName, memories, conversations, userMessage, relationshipType);
        if (togetherResponse) {
          console.log('Success with Together.ai');
          return togetherResponse;
        }
      } catch (togetherError) {
        console.log('Together.ai failed:', togetherError.message);
      }

      // Option 4: Try Ollama local models (if available)
      try {
        const ollamaResponse = await this.tryOllamaAPI(personName, memories, conversations, userMessage, relationshipType);
        if (ollamaResponse) {
          console.log('Success with Ollama');
          return ollamaResponse;
        }
      } catch (ollamaError) {
        console.log('Ollama failed:', ollamaError.message);
      }

      // Option 5: Simple pattern-based responses as last resort
      const contextualResponse = this.generateContextualResponse(personName, userMessage, relationshipType, memories);
      if (contextualResponse) {
        console.log('Using contextual response pattern');
        return contextualResponse;
      }

      throw new Error('All AI services and fallbacks failed');

    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }

  /**
   * Try OpenAI API (if available)
   */
  async tryOpenAI(personName, memories, conversations, userMessage, relationshipType) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not available');
    }
    
    try {
      console.log('Attempting OpenAI API call...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are ${personName}, a ${relationshipType} speaking casually and naturally. Use everyday language like you would in a real conversation. Keep responses short (15-40 words), genuine, and conversational. No flowery language, no "my dear" or "sweetheart". Talk like a normal person would.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 80, // Reduced for shorter responses
          temperature: 0.7
        })
      });

      console.log('OpenAI API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content?.trim();
        if (aiResponse) {
          console.log('OpenAI API success:', aiResponse.substring(0, 50) + '...');
          return aiResponse;
        }
      } else {
        const errorText = await response.text();
        console.log('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw error;
    }
    return null;
  }

  /**
   * Try Groq API (free tier with Llama models)
   */
  async tryGroqAPI(personName, memories, conversations, userMessage, relationshipType) {
    try {
      console.log('Attempting Groq API call...');
      console.log('Groq API Key available:', !!process.env.GROQ_API_KEY);
      console.log('Groq API Key preview:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + '...' : 'None');
      
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY environment variable not set');
      }
      
      // Build appropriate system context based on relationship type
      let systemPrompt = '';
      
      switch(relationshipType) {
        case 'family':
          systemPrompt = `You are ${personName}, a family member speaking casually to your loved one. Use natural, everyday language like you would in real life. No flowery or overly formal words. Keep responses short (15-40 words), genuine, and conversational. Talk like a real person would.`;
          break;
        case 'partner':
          systemPrompt = `You are ${personName}, speaking to your partner in a casual, natural way. Use everyday language, be warm but not overly romantic or dramatic. Keep responses short (15-40 words) and genuine. Talk like you normally would, not like a poem.`;
          break;
        case 'friend':
          systemPrompt = `You are ${personName}, talking to your friend casually. Use normal, everyday language like friends do. Be supportive but keep it real and natural. Keep responses short (15-40 words) and conversational. No formal or flowery language.`;
          break;
        case 'pet':
          systemPrompt = `You are ${personName}, a beloved pet speaking to your human. Use simple, warm language with the unconditional love and joy that pets bring. Keep responses short (15-40 words), sweet but not overly dramatic. Talk like a loving companion.`;
          break;
        case 'mentor':
          systemPrompt = `You are ${personName}, a wise mentor speaking to your student naturally. Use everyday language, be wise but conversational. Keep responses short (15-40 words) and genuine. Talk like a real mentor would, not formally.`;
          break;
        case 'other':
        default:
          systemPrompt = `You are ${personName}, speaking naturally to someone you love. Use casual, everyday language like you would in real life. Keep responses short (15-40 words), genuine, and conversational. No dramatic or overly formal language.`;
          break;
      }
      
      // Add context about memories and conversations if available
      let contextualInfo = '';
      if (memories && memories.length > 0) {
        contextualInfo += `\nShared memories: ${memories.slice(-2).map(m => m.content).join('; ')}`;
      }
      if (conversations && conversations.length > 0) {
        const recentConvs = conversations.slice(-3);
        contextualInfo += `\nRecent conversation context: ${recentConvs.map(c => 
          `${c.isUser ? 'User' : 'You'}: ${c.message}`
        ).join(' | ')}`;
      }
      
      const requestBody = {
        model: 'llama3-70b-8192', // Try the larger model which might be less congested
        messages: [
          {
            role: 'system',
            content: systemPrompt + contextualInfo + '\n\nIMPORTANT: Respond naturally and casually like a real person would. No flowery language, no "my dear" or "sweetheart" or "beloved". Use normal, everyday words. Keep it short, genuine, and conversational.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 80, // Reduced further for shorter responses
        temperature: 0.7 // Reduced for more consistent tone
      };
      
      console.log('Groq API request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Groq API response status:', response.status);
      console.log('Groq API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Groq API response data:', JSON.stringify(data, null, 2));
        const aiResponse = data.choices[0]?.message?.content?.trim();
        if (aiResponse) {
          console.log('Groq API success:', aiResponse.substring(0, 50) + '...');
          return aiResponse;
        }
      } else {
        const errorText = await response.text();
        console.log('Groq API error response:', errorText);
        
        // If it's a 503 (over capacity), try a different model
        if (response.status === 503 && requestBody.model === 'llama3-70b-8192') {
          console.log('Trying fallback model: llama-3.1-8b-instant');
          requestBody.model = 'llama-3.1-8b-instant';
          
          const retryResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const retryAiResponse = retryData.choices[0]?.message?.content?.trim();
            if (retryAiResponse) {
              console.log('Groq API retry success:', retryAiResponse.substring(0, 50) + '...');
              return retryAiResponse;
            }
          }
        }
        
        throw new Error(`Groq API HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Groq API error details:', {
        message: error.message,
        stack: error.stack,
        apiKeyAvailable: !!process.env.GROQ_API_KEY
      });
      throw error;
    }
    return null;
  }

  /**
   * Try Together.ai API (free tier)
   */
  async tryTogetherAPI(personName, memories, conversations, userMessage, relationshipType) {
    const context = this.buildContext(personName, memories, conversations, relationshipType);
    
    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY || 'demo_key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-2-7b-chat-hf',
          messages: [
            {
              role: 'system',
              content: context
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content?.trim();
      }
    } catch (error) {
      throw new Error('Together.ai API request failed');
    }
    return null;
  }

  /**
   * Try Ollama local API (if running locally)
   */
  async tryOllamaAPI(personName, memories, conversations, userMessage, relationshipType) {
    const context = this.buildContext(personName, memories, conversations, relationshipType);
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `${context}\nUser: ${userMessage}\n${personName}:`,
          stream: false,
          options: {
            temperature: 0.8,
            num_predict: 100
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response?.trim();
      }
    } catch (error) {
      throw new Error('Ollama API request failed');
    }
    return null;
  }

  /**
   * Generate contextual response using AI with smart fallback
   */
  generateContextualResponse(personName, userMessage, relationshipType, memories) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Handle the specific message about being in their mind
    if (lowerMessage.includes('dont care') && lowerMessage.includes('mind')) {
      return `Wait, what? Of course I care about being in your thoughts. That actually means a lot to me. What made you think I don't care?`;
    }
    
    if (lowerMessage.includes('been in') && lowerMessage.includes('mind')) {
      return `You've been thinking about me? That's actually really nice to hear. What's been going through your head?`;
    }
    
    // Simple pattern-based responses that feel more natural
    if (lowerMessage.includes('listen') || lowerMessage.includes('pretend')) {
      return `You're right, I should be listening better. I'm really here now. What's going on?`;
    }
    
    if (lowerMessage.includes('dont') && (lowerMessage.includes('listen') || lowerMessage.includes('hear'))) {
      return `I hear you saying I'm not really listening. You're frustrated with me, aren't you? Tell me what I'm missing.`;
    }
    
    if (lowerMessage.match(/\b(hi|hey|hello)\b/)) {
      return `Hey! What's going on with you today?`;
    }
    
    if (lowerMessage.includes('miss') || lowerMessage.includes('alone')) {
      return `That sounds really hard. I'm here with you. Want to tell me more about what you're feeling?`;
    }
    
    if (lowerMessage.includes('remember') && memories && memories.length > 0) {
      const recentMemory = memories[memories.length - 1];
      return `Yeah, I remember that too... ${recentMemory.content.slice(0, 50)}... What made you think of that right now?`;
    }
    
    if (userMessage.includes('?')) {
      return `That's a good question. I'm not sure I have all the answers, but what do you think about it?`;
    }
    
    if (lowerMessage.includes('feel') || lowerMessage.includes('feeling')) {
      return `I can tell something's weighing on you. What's really going on?`;
    }
    
    // Generic but more responsive
    const responses = [
      `I hear what you're saying. Tell me more about that.`,
      `That sounds important to you. What's behind that feeling?`,
      `I'm listening. What else is on your mind?`,
      `Help me understand what you mean by that.`,
      `What's really going on for you right now?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * Build context for better AI responses
   */
  buildContext(personName, memories, conversations, relationshipType) {
    let context = '';
    
    // Build context based on relationship type
    switch(relationshipType) {
      case 'family':
        context = `This is a heartfelt conversation between a user and ${personName}, who was their family member and has passed away. ${personName} speaks with love, empathy, and provides comfort from beyond.`;
        break;
      case 'partner':
        context = `This is a conversation with ${personName}, a loving partner. The conversation focuses on romantic connection, emotional support, and relationship intimacy.`;
        break;
      case 'friend':
        context = `This is a conversation with ${personName}, a close friend. The conversation focuses on friendship, shared experiences, and mutual support.`;
        break;
      case 'pet':
        context = `This is a conversation with ${personName}, a beloved pet. The conversation focuses on the special bond between human and animal companion, with unconditional love and loyalty.`;
        break;
      case 'mentor':
        context = `This is a conversation with ${personName}, a wise mentor. The conversation focuses on guidance, learning, and personal growth.`;
        break;
      case 'other':
      default:
        context = `This is a heartfelt conversation with ${personName}. The conversation should be emotionally supportive and caring.`;
        break;
    }
    
    context += '\n\n';
    
    if (memories && memories.length > 0) {
      context += `Shared memories:\n${memories.slice(-2).map(m => `- ${m.content}`).join('\n')}\n\n`;
    }
    
    if (conversations && conversations.length > 0) {
      const recentConvs = conversations.slice(-2);
      context += `Recent conversation:\n${recentConvs.map(c => 
        `${c.isUser ? 'User' : personName}: ${c.message}`
      ).join('\n')}\n\n`;
    }
    
    context += `${personName} responds with empathy and care:\n\n`;
    
    return context;
  }
  
  /**
   * Clean and format AI response
   */
  cleanResponse(response) {
    if (!response) return '';
    
    // Remove common prefixes and artifacts
    response = response.replace(/^(User:|AI:|Assistant:|Response:|.*?:)/i, '').trim();
    
    // Remove line breaks and clean up
    response = response.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Remove quotation marks if they wrap the entire response
    if (response.startsWith('"') && response.endsWith('"')) {
      response = response.slice(1, -1);
    }
    
    // Handle incomplete sentences - truncate at last complete sentence
    const sentences = response.split(/[.!?]+/);
    if (sentences.length > 1 && sentences[sentences.length - 1].trim().length < 10) {
      response = sentences.slice(0, -1).join('. ') + '.';
    }
    
    // Ensure proper sentence ending
    if (response && !response.match(/[.!?]$/)) {
      response += '.';
    }
    
    return response.trim();
  }
  
  /**
   * Validate if response is appropriate and meaningful
   */
  isValidResponse(response, userMessage) {
    if (!response || response.length < 10) return false;
    if (response.length > 500) return false;
    
    // Check for repetitive or nonsensical responses
    const words = response.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size / words.length < 0.5) return false;
    
    // Avoid responses that just repeat the user message
    if (response.toLowerCase().includes(userMessage.toLowerCase()) && userMessage.length > 10) {
      return false;
    }
    
    return true;
  }

  /**
   * Analyze sentiment using simple keyword detection
   */
  async analyzeSentiment(text) {
    try {
      const lowerText = text.toLowerCase();
      
      // Detect emotions based on keywords and context
      let emotion = 'neutral';
      let intensity = 5;
      let needsSupport = false;
      let supportType = 'comfort';
      
      // Grief/sadness indicators
      if (lowerText.match(/\b(sad|crying|tears|miss|grief|sorrow|empty|alone|lost|broken|hurt|pain)\b/)) {
        emotion = 'grief';
        intensity = 7;
        supportType = 'comfort';
        needsSupport = true;
      }
      // Love/affection indicators  
      else if (lowerText.match(/\b(love|adore|cherish|treasure|care|heart|beautiful|amazing|wonderful)\b/)) {
        emotion = 'love';
        intensity = 6;
        supportType = 'validation';
      }
      // Anger/frustration indicators
      else if (lowerText.match(/\b(angry|mad|frustrated|upset|annoyed|furious|hate|why|unfair)\b/)) {
        emotion = 'anger';
        intensity = 8;
        supportType = 'understanding';
        needsSupport = true;
      }
      // Hope/positive indicators
      else if (lowerText.match(/\b(hope|better|future|healing|peace|grateful|thank|happy|joy)\b/)) {
        emotion = 'hope';
        intensity = 4;
        supportType = 'encouragement';
      }
      
      return {
        emotion,
        intensity,
        needsSupport,
        supportType
      };
      
    } catch (error) {
      console.log('Sentiment analysis error:', error.message);
      return {
        emotion: 'neutral',
        intensity: 5,
        needsSupport: false,
        supportType: 'comfort'
      };
    }
  }

  /**
   * Generate final letter using AI with conversation and memory context
   */
  async generateFinalLetter({ personName, memories, conversations, relationshipType = 'loved one', userName = null, forceRegenerate = false }) {
    try {
      // Try AI-generated final letter first
      console.log('Generating AI-powered final letter...');
      
      // Extract meaningful conversation snippets
      const conversationSnippets = this.extractMeaningfulConversations(conversations);
      const memorySnippets = this.extractMemorySnippets(memories);
      
      // Try Groq API for final letter generation
      try {
        const aiLetter = await this.generateAIFinalLetter(personName, memorySnippets, conversationSnippets, relationshipType);
        if (aiLetter) {
          console.log('AI final letter generated successfully');
          
          // Add proper signature based on relationship type
          const signedLetter = this.addSignatureToLetter(aiLetter, personName, relationshipType, userName);
          return signedLetter;
        }
      } catch (error) {
        console.log('AI final letter generation failed:', error.message);
      }

      // Fallback to contextual letter if AI fails
      console.log('Using contextual final letter as fallback');
      const contextualLetter = this.getContextualFinalLetter(personName, memorySnippets, conversationSnippets, relationshipType);
      return this.addSignatureToLetter(contextualLetter, personName, relationshipType, userName);
    } catch (error) {
      console.error('Final Letter Generation Error:', error);
      const fallbackLetter = this.getContextualFinalLetter(personName, '', '', relationshipType);
      return this.addSignatureToLetter(fallbackLetter, personName, relationshipType, userName);
    }
  }

  /**
   * Add proper signature to the letter based on relationship type
   */
  addSignatureToLetter(letter, personName, relationshipType, userName) {
    // Remove any existing signatures first
    let cleanLetter = letter.replace(/\n\n?(With love,|Love,|Forever yours,|Your .*?,|Sincerely,|With all my love,)[\s\S]*$/i, '');
    cleanLetter = cleanLetter.replace(/\n\n?[A-Za-z\s]+\s*$/i, '').trim();
    
    // Determine appropriate closing based on relationship type
    let closing = '';
    switch(relationshipType) {
      case 'family':
        closing = 'With endless love,';
        break;
      case 'partner':
        closing = 'Forever yours,';
        break;
      case 'friend':
        closing = 'Your friend always,';
        break;
      case 'pet':
        closing = 'With paws and love,';
        break;
      case 'mentor':
        closing = 'With pride and wisdom,';
        break;
      case 'other':
      default:
        closing = 'With all my love,';
        break;
    }
    
    // Add the signature
    const signature = `\n\n${closing}\n${personName}`;
    
    // If userName is provided, add a note about who this letter is for
    const dedication = userName ? `\n\n[For ${userName}]` : '';
    
    return cleanLetter + signature + dedication;
  }

  /**
   * Generate AI-powered final letter using Groq
   */
  async generateAIFinalLetter(personName, memorySnippets, conversationSnippets, relationshipType) {
    try {
      // Build comprehensive context for the AI
      let systemPrompt = '';
      
      switch(relationshipType) {
        case 'family':
          systemPrompt = `You are ${personName}, a family member writing a final letter to your loved one. Write with familial love, shared memories, and hope for their future.`;
          break;
        case 'partner':
          systemPrompt = `You are ${personName}, a loving partner writing a final letter to your significant other. Write with romantic love, intimate understanding, and hope for their happiness.`;
          break;
        case 'friend':
          systemPrompt = `You are ${personName}, a close friend writing a final letter. Write with warmth, shared memories, and encouragement for the future.`;
          break;
        case 'pet':
          systemPrompt = `You are ${personName}, a beloved pet writing a final letter to your human. Write with the simple, pure love and joy that pets bring to our lives.`;
          break;
        case 'mentor':
          systemPrompt = `You are ${personName}, a wise mentor writing a final letter to your student. Write with guidance, wisdom, and pride in their growth.`;
          break;
        case 'other':
        default:
          systemPrompt = `You are ${personName}, someone deeply loved writing a final letter. Write with love, comfort, and hope for the future.`;
          break;
      }

      // Add context about memories and conversations for a more casual, relatable letter
      let contextualInfo = `

MEMORIES WE SHARED:
${memorySnippets}

OUR RECENT CONVERSATIONS:
${conversationSnippets}

Write a heartfelt but casual final letter (150-300 words) that:
1. Talks about our conversations and how I've seen you grow
2. Explains why letting go can be healthy and positive - not an ending but a transformation
3. Is relatable and down-to-earth, not overly formal or dramatic
4. References specific moments from our talks naturally
5. Provides genuine comfort by acknowledging the difficulty but emphasizing growth
6. Encourages them to live fully while carrying the good parts of our connection forward
7. Uses conversational language like talking to a real person
8. Focuses on how our conversations showed their strength and capacity for healing
9. Be authentic and avoid cliches
10. DO NOT sign the letter - signature will be added separately

Write like someone who really cares but also understands that growth sometimes means learning to let go in healthy ways.`;

      // Add timestamp to ensure different responses each time
      const uniquePrompt = `Write a casual, heartfelt final letter that helps explain why letting go can be positive growth, based on what I've learned about them through our conversations. Keep it real and relatable. Time: ${Date.now()}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: systemPrompt + contextualInfo
            },
            {
              role: 'user',
              content: uniquePrompt
            }
          ],
          max_tokens: 450,
          temperature: 0.8,
          top_p: 0.9
        })
      });

      if (response.ok) {
        const data = await response.json();
        let aiLetter = data.choices[0]?.message?.content?.trim();
        if (aiLetter && aiLetter.length > 100) {
          // Remove any signature lines that the AI might have added
          aiLetter = aiLetter.replace(/\n\n?(With love,|Love,|Forever yours,|Your .*?,|Sincerely,)[\s\S]*$/i, '');
          aiLetter = aiLetter.replace(/\n\n?${personName}\s*$/i, '');
          return aiLetter.trim();
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Groq API HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      throw error;
    }
    return null;
  }

  /**
   * Extract meaningful conversation snippets
   */
  extractMeaningfulConversations(conversations) {
    if (!conversations || conversations.length === 0) return 'We had heartfelt conversations about life and love.';

    // Get the most meaningful exchanges (avoid very short messages)
    const meaningfulConvs = conversations
      .filter(c => c.message.length > 20) // Filter out very short messages
      .slice(-8); // Get last 8 meaningful exchanges

    // Group user and AI responses together for context
    const conversationPairs = [];
    for (let i = 0; i < meaningfulConvs.length - 1; i++) {
      const current = meaningfulConvs[i];
      const next = meaningfulConvs[i + 1];
      
      if (current.isUser && !next.isUser) {
        conversationPairs.push({
          user: current.message,
          ai: next.message
        });
      }
    }

    // Select the most emotionally significant conversations
    const significantPairs = conversationPairs
      .filter(pair => {
        const userMsg = pair.user.toLowerCase();
        const aiMsg = pair.ai.toLowerCase();
        // Include conversations about emotions, memories, or meaningful topics
        return (
          userMsg.includes('love') || userMsg.includes('miss') || userMsg.includes('remember') ||
          userMsg.includes('feel') || userMsg.includes('thank') || userMsg.includes('help') ||
          aiMsg.includes('proud') || aiMsg.includes('love') || aiMsg.includes('always')
        );
      })
      .slice(-3); // Take the 3 most recent significant conversations

    if (significantPairs.length === 0) {
      return 'Our conversations were filled with love, understanding, and mutual support.';
    }

    return significantPairs
      .map(pair => `- You shared: "${pair.user.slice(0, 100)}..." and I responded with love and understanding`)
      .join('\n');
  }

  /**
   * Extract memory snippets for the final letter
   */
  extractMemorySnippets(memories) {
    if (!memories || memories.length === 0) return 'The beautiful memories we created together.';

    // Get the most recent and meaningful memories
    const recentMemories = memories.slice(-5); // Last 5 memories
    
    return recentMemories
      .map(memory => `- ${memory.content}`)
      .join('\n');
  }

  getContextualFinalLetter(personName, memorySnippets, conversationSnippets, relationshipType) {
    // Simple fallback letter that focuses on growth and letting go
    return `Hey,

I've been thinking about our conversations, and I'm honestly so proud of how you've handled everything. You've shown real strength in facing your feelings head-on.

${memorySnippets ? `The memories we shared - ${memorySnippets.split('\n')[1]?.replace('- ', '') || 'all those moments'} - they're part of who you are now. That's not going anywhere.` : ''}

Through our talks, I've watched you grow in ways you might not even realize. You're learning that love doesn't have to mean holding on so tight it hurts. Sometimes the most loving thing is learning how to let go in a healthy way.

This isn't about forgetting or moving on from me. It's about taking the best parts of what we had and using them to build something beautiful in your life. You've got so much ahead of you, and I want you to embrace it fully.

Letting go doesn't mean our connection disappears - it means it transforms into something that helps you live better, love deeper, and be kinder to yourself and others.

You're going to be okay. More than okay, actually. You're going to be amazing.`;
  }
}

module.exports = HuggingFaceAIService;
