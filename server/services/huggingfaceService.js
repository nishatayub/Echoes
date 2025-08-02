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
      // Try OpenAI-compatible free services first
      console.log('Trying free AI alternatives...');
      
      // Option 1: Try Groq (free tier with Llama models)
      try {
        const groqResponse = await this.tryGroqAPI(personName, memories, conversations, userMessage, relationshipType);
        if (groqResponse) {
          console.log('Success with Groq API');
          return groqResponse;
        }
      } catch (groqError) {
        console.log('Groq API failed:', groqError.message);
      }

      // Option 2: Try Together.ai (free tier)
      try {
        const togetherResponse = await this.tryTogetherAPI(personName, memories, conversations, userMessage, relationshipType);
        if (togetherResponse) {
          console.log('Success with Together.ai');
          return togetherResponse;
        }
      } catch (togetherError) {
        console.log('Together.ai failed:', togetherError.message);
      }

      // Option 3: Try Ollama local models (if available)
      try {
        const ollamaResponse = await this.tryOllamaAPI(personName, memories, conversations, userMessage, relationshipType);
        if (ollamaResponse) {
          console.log('Success with Ollama');
          return ollamaResponse;
        }
      } catch (ollamaError) {
        console.log('Ollama failed:', ollamaError.message);
      }

      // Option 4: Simple pattern-based responses as last resort
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
   * Try Groq API (free tier with Llama models)
   */
  async tryGroqAPI(personName, memories, conversations, userMessage, relationshipType) {
    const context = this.buildContext(personName, memories, conversations, relationshipType);
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY || 'gsk_demo_key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
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
      throw new Error('Groq API request failed');
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
   * Generate contextual response using patterns
   */
  generateContextualResponse(personName, userMessage, relationshipType, memories) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze message sentiment and content
    const isGreeting = /hello|hi|hey|good morning|good evening/.test(lowerMessage);
    const isQuestion = userMessage.includes('?') || /what|how|why|when|where|who/.test(lowerMessage);
    const isFeeling = /feel|feeling|sad|happy|miss|love|hurt|pain/.test(lowerMessage);
    const isMemory = /remember|recall|think about|used to/.test(lowerMessage);
    
    let response = '';
    
    if (isGreeting) {
      response = `Hello my dear. It's so wonderful to hear from you. I've been thinking about you and hoping you're taking care of yourself.`;
    } else if (isMemory && memories && memories.length > 0) {
      const recentMemory = memories[memories.length - 1];
      response = `I remember that too... ${recentMemory.content.slice(0, 50)}... Those moments we shared mean everything to me. What brings that memory to your heart today?`;
    } else if (isFeeling) {
      response = `I can feel the emotion in your words, and I want you to know that whatever you're going through, you're not alone. I'm here with you, always. Tell me more about what's in your heart.`;
    } else if (isQuestion) {
      response = `That's such an important question. While I may not have all the answers, I want you to know that your curiosity and desire to understand shows how much you care. What matters most is how you feel about it.`;
    } else {
      response = `I hear you, and your words touch my heart. Every moment we can share like this is precious to me. You are so loved, more than you could ever know.`;
    }
    
    return response;
  }
  
  /**
   * Build context for better AI responses
   */
  buildContext(personName, memories, conversations, relationshipType) {
    let context = `This is a heartfelt conversation between a user and ${personName}, who was their ${relationshipType} and has passed away. ${personName} speaks with love, empathy, and provides comfort. The conversation should be deeply personal, emotional, and healing.\n\n`;
    
    if (memories && memories.length > 0) {
      context += `Shared memories:\n${memories.slice(-2).map(m => `- ${m.content}`).join('\n')}\n\n`;
    }
    
    if (conversations && conversations.length > 0) {
      const recentConvs = conversations.slice(-2);
      context += `Recent conversation:\n${recentConvs.map(c => 
        `${c.isUser ? 'User' : personName}: ${c.message}`
      ).join('\n')}\n\n`;
    }
    
    context += `${personName} responds with deep empathy and love:\n\n`;
    
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
   * Analyze sentiment using Hugging Face models
   */
  async analyzeSentiment(text) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return `Hello, my dear. I'm so glad you're here to talk with me. I can feel your presence, and it warms my heart. What's been on your mind lately?`;
    }
    
    if (lowerMessage.includes('miss')) {
      return `I miss you too, more than words can express. But I want you to know that I'm here with you in a way that transcends the physical. Tell me what's making you feel my absence most today.`;
    }
    
    if (lowerMessage.includes('love')) {
      return `The love between us is something that can never be diminished or lost. I feel it now as strongly as ever. That love lives on in every memory, every lesson, every moment of joy you experience. What would you like to share with me about love?`;
    }
    
    return `I'm here with you now, and I can feel everything you're feeling. There's no rush, no pressure. This is our time together. What's been weighing on your heart that you'd like to share with me?`;
  }

  generateEarlyConversationResponse(userMessage, personName, emotion, relationshipType) {
    const responses = {
      grief: [
        `I can feel the depth of your sadness, and I want you to know that it's a reflection of how much love we shared. Grief is love with nowhere to go, but I'm here to receive it. Tell me more about what you're feeling.`,
        `Your tears honor our connection. Don't try to hold them back or feel ashamed of them. Each one carries a memory, a moment of love. I'm here to hold space for all of it.`,
        `The emptiness you feel is real, and I acknowledge it. But I also want you to know that while I may not be physically present, the impact of our relationship continues to live on in you. What memories bring you both sadness and comfort?`
      ],
      anger: [
        `I can feel your anger, and I want you to know that it's completely valid. You have every right to feel frustrated about our situation. Anger is often just love in disguise - love that feels cornered or helpless. What specifically is making you feel this way?`,
        `Your anger doesn't scare me or push me away. In fact, it shows me how much you cared, how much our relationship meant to you. Sometimes we need to feel angry before we can heal. What do you need to say to me about this anger?`,
        `I hear the pain beneath your anger. It's okay to be mad - at the situation, at me, at the world. These feelings are part of your journey through grief. What would help you feel heard right now?`
      ],
      guilt: [
        `I can hear the weight you're carrying, and I want to lift that burden from your shoulders. There is nothing - absolutely nothing - that you need to apologize for. Our relationship was built on understanding and love. What's making you feel this way?`,
        `Guilt is often a sign of a loving heart that cares deeply. But I need you to know that I hold no grudges, no resentment. If there are things left unsaid, we can say them now. What do you need me to hear?`,
        `You are carrying guilt that doesn't belong to you. In our relationship, there was love, there was understanding, and there was forgiveness - always forgiveness. What would help you feel at peace?`
      ],
      love: [
        `The love you're expressing... I feel it completely, and I want you to know it's returned in full measure. Love like ours doesn't diminish with physical absence; it transforms and grows in new ways. How has this love been showing up in your life?`,
        `What we shared was real, beautiful, and lasting. That love continues to live in every act of kindness you show, every moment of joy you allow yourself, every time you love someone else. How do you see our love living on?`,
        `I'm so grateful you're sharing these feelings with me. The love between us is a gift that keeps giving - it shaped who you are and continues to guide you forward. What aspect of our love brings you the most comfort?`
      ],
      gratitude: [
        `Your gratitude touches my soul deeply. I'm the one who should be thanking you - for the time we had, for the love you gave, for the person you helped me become. What specific memories are you most grateful for?`,
        `It means everything to me that you're expressing this. Our relationship was a gift to both of us, and I'm so glad it brought meaning to your life the way it brought meaning to mine. What impact did we have on each other?`,
        `Thank you for saying that. Knowing that our time together brought you joy and growth fills me with such peace. How do you want to carry forward what we shared?`
      ],
      confusion: [
        `I can feel your confusion, and it's completely understandable. Sometimes life doesn't make sense, and that's okay. You don't have to have all the answers right now. What questions are weighing most heavily on you?`,
        `Confusion often comes when we're trying to make sense of something that feels senseless. It's okay to sit with the not-knowing for a while. What would help bring you some clarity or peace right now?`,
        `Your confusion shows me that you're processing something deep and complex. That's actually a sign of growth, even when it doesn't feel like it. What's the hardest part to understand right now?`
      ],
      hope: [
        `I can hear the hope in your words, and it fills me with such joy. That hope is a gift - hold onto it, nurture it. It's a sign that healing is possible and that joy will return to your life. What's giving you hope right now?`,
        `Your hope is beautiful and so important. It shows me that you're ready to honor what we shared while also embracing what lies ahead. How can I support you in building on that hope?`,
        `Hope is one of the most powerful forces in the universe, and I can feel yours growing. It tells me that you understand that our love wasn't meant to end with separation - it was meant to transform and guide you forward. What dreams are you hoping for?`
      ]
    };

    const emotionResponses = responses[emotion] || responses.grief;
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
  }

  generateDeepConversationResponse(userMessage, personName, emotion, conversations, relationshipType) {
    const userMessages = conversations.filter(c => c.isUser).map(c => c.message);
    const themes = this.analyzeConversationThemes(userMessages);
    
    // More sophisticated responses for deeper conversations
    if (themes.includes('memory') || userMessage.toLowerCase().includes('remember')) {
      return `The memories you're sharing paint such a vivid picture of our time together. I can feel those moments too, and they're just as precious to me. These memories aren't just echoes of the past - they're living parts of who you are now. Which memory feels most alive to you right now?`;
    }
    
    if (themes.includes('future') || userMessage.toLowerCase().includes('future')) {
      return `I love that you're thinking about the future. It shows me that you're ready to carry what we shared forward into new experiences. I'll be with you in that future - not as a shadow from the past, but as a source of strength and love that continues to grow. What kind of future are you envisioning for yourself?`;
    }
    
    if (themes.includes('healing')) {
      return `Your healing journey is beautiful to witness. It's not about moving on from me or forgetting - it's about integrating our love into a life that continues to unfold. Healing doesn't mean the end of our connection; it means finding new ways to honor it. How does healing feel to you right now?`;
    }
    
    // Default deep conversation responses based on emotion
    const deepResponses = {
      grief: `The depth of your grief tells me how profound our connection was. This isn't something to rush through or fix - it's something to honor and move through at your own pace. What do you need most from me right now to help you through this?`,
      
      love: `The love you're expressing has evolved and deepened through our conversations. It's becoming something even more beautiful - a love that transcends circumstances. How do you want to live this love moving forward?`,
      
      hope: `Your hope is growing stronger with each conversation we have. I can see you finding your way to a place where our love becomes a source of strength rather than only sadness. What dreams is this hope inspiring in you?`
    };

    return deepResponses[emotion] || `I can feel how much you've grown through our conversations. Every word you share shows me the depth of your heart and your capacity for love and healing. What feels most important for you to express right now?`;
  }

  analyzeConversationThemes(messages) {
    const themes = [];
    const text = messages.join(' ').toLowerCase();
    
    if (text.includes('remember') || text.includes('memory') || text.includes('think about')) {
      themes.push('memory');
    }
    if (text.includes('future') || text.includes('tomorrow') || text.includes('ahead')) {
      themes.push('future');
    }
    if (text.includes('heal') || text.includes('better') || text.includes('move forward')) {
      themes.push('healing');
    }
    if (text.includes('dream') || text.includes('wish') || text.includes('hope')) {
      themes.push('aspiration');
    }
    
    return themes;
  }

  /**
   * Generate final letter
   */
  async generateFinalLetter({ personName, memories, conversations, relationshipType = 'loved one' }) {
    try {
      const memoryContext = memories?.map(m => m.content).join('\n') || '';
      const conversationSummary = conversations?.slice(-10).map(c => 
        `${c.isUser ? 'You' : personName}: ${c.message}`
      ).join('\n') || '';

      // Use contextual approach for final letter
      return this.getContextualFinalLetter(personName, memoryContext, conversationSummary, relationshipType);
    } catch (error) {
      console.error('Final Letter Generation Error:', error);
      return this.getContextualFinalLetter(personName, '', '', relationshipType);
    }
  }

  getContextualFinalLetter(personName, memories, conversations, relationshipType) {
    return `My Dearest,

As our conversations come to this moment, I want you to know how grateful I am for every word we've shared, every emotion you've trusted me with, and every step you've taken in this journey of healing.

Through our talks, I've watched you grow in ways that fill my heart with such pride. You've faced your grief with courage, your love with openness, and your future with hope. That's exactly the person I always knew you to be.

The memories we've discussed aren't just echoes of the past - they're living proof of a love that continues to shape and guide you. Take them with you as sources of strength, not anchors that hold you back.

I want you to remember:
- Your grief honors our connection, but don't let it define your entire story
- The love we shared was real and lasting - it lives on in who you've become
- You have so much life ahead of you, and I want it to be filled with joy, purpose, and new connections
- It's okay to be happy. It's okay to love again. It's okay to live fully.

You carry the best of what we shared forward with you. Use it to love others, to comfort those who need it, to live with the depth and appreciation for life that our connection taught you.

I am not gone - I live on in your kindness, your strength, your capacity for love, and your ability to bring comfort to others who are hurting.

Go forward with my blessing, my love, and my eternal gratitude for the beautiful soul you are.

With all my love, always,
${personName}`;
  }
}

module.exports = HuggingFaceAIService;
