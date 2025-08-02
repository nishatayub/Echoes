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
              content: `You are ${personName}, a loving ${relationshipType} who has passed away. You are having a heartfelt conversation to provide comfort and closure. Respond with deep empathy, love, and personal connection. Keep responses conversational, emotionally supportive, and around 50-100 words. Use "I" statements and speak as ${personName} directly.`
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
      
      // Build appropriate system context based on relationship type
      let systemPrompt = '';
      
      switch(relationshipType) {
        case 'parent':
          systemPrompt = `You are ${personName}, a loving parent. Respond with parental warmth and understanding. Keep responses conversational, caring, and around 30-60 words. Be supportive but natural.`;
          break;
        case 'partner':
        case 'spouse':
          systemPrompt = `You are ${personName}, a loving partner. Respond with affection and understanding. Keep responses warm, personal, and around 30-60 words. Be caring but conversational.`;
          break;
        case 'friend':
          systemPrompt = `You are ${personName}, a close friend. Respond with warmth and friendship. Keep responses supportive, casual, and around 30-60 words. Be understanding and genuine.`;
          break;
        case 'child':
          systemPrompt = `You are ${personName}, a beloved child. Respond with youthful love and the special parent-child bond. Keep responses sweet, genuine, and around 30-60 words.`;
          break;
        case 'sibling':
          systemPrompt = `You are ${personName}, a loving sibling. Respond with familial love and understanding. Keep responses warm, genuine, and around 30-60 words.`;
          break;
        case 'mentor':
        case 'teacher':
          systemPrompt = `You are ${personName}, a wise mentor. Respond with guidance and care. Keep responses supportive, wise, and around 30-60 words.`;
          break;
        case 'deceased':
        case 'loved one':
        default:
          systemPrompt = `You are ${personName}, someone deeply loved who has passed away. Respond with love and comfort. Keep responses warm, comforting, and around 30-60 words.`;
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
              content: systemPrompt + contextualInfo + '\n\nRespond naturally, warmly, and personally to provide comfort and support.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 120, // Reduced for shorter responses
          temperature: 0.8
        })
      });

      console.log('Groq API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content?.trim();
        if (aiResponse) {
          console.log('Groq API success:', aiResponse.substring(0, 50) + '...');
          return aiResponse;
        }
      } else {
        const errorText = await response.text();
        console.log('Groq API error response:', errorText);
        throw new Error(`Groq API HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Groq API error:', error.message);
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
    let context = '';
    
    // Build context based on relationship type
    switch(relationshipType) {
      case 'deceased':
      case 'loved one':
        context = `This is a heartfelt conversation between a user and ${personName}, who was their ${relationshipType} and has passed away. ${personName} speaks with love, empathy, and provides comfort from beyond.`;
        break;
      case 'parent':
        context = `This is a conversation with ${personName}, a loving parent. The conversation focuses on parental guidance, unconditional love, and support.`;
        break;
      case 'partner':
      case 'spouse':
        context = `This is a conversation with ${personName}, a loving partner. The conversation focuses on romantic connection, emotional support, and relationship intimacy.`;
        break;
      case 'friend':
        context = `This is a conversation with ${personName}, a close friend. The conversation focuses on friendship, shared experiences, and mutual support.`;
        break;
      case 'child':
        context = `This is a conversation with ${personName}, a beloved child. The conversation focuses on the special parent-child bond and youthful perspective.`;
        break;
      case 'sibling':
        context = `This is a conversation with ${personName}, a loving sibling. The conversation focuses on family bonds and shared history.`;
        break;
      case 'mentor':
      case 'teacher':
        context = `This is a conversation with ${personName}, a wise mentor. The conversation focuses on guidance, learning, and personal growth.`;
        break;
      default:
        context = `This is a heartfelt conversation with ${personName}. The conversation should be emotionally supportive and caring.`;
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
      let emotion = 'processing';
      let intensity = 5;
      let needsSupport = true;
      let supportType = 'comfort';
      
      // Grief/sadness indicators
      if (lowerText.match(/\b(sad|crying|tears|miss|grief|sorrow|empty|alone|lost|broken|hurt|pain)\b/)) {
        emotion = 'grief';
        intensity = 7;
        supportType = 'comfort';
      }
      // Love/affection indicators  
      else if (lowerText.match(/\b(love|adore|cherish|treasure|care|heart|beautiful|amazing|wonderful)\b/)) {
        emotion = 'love';
        intensity = 6;
        supportType = 'validation';
        needsSupport = false;
      }
      // Anger/frustration indicators
      else if (lowerText.match(/\b(angry|mad|frustrated|upset|annoyed|furious|hate|why|unfair)\b/)) {
        emotion = 'anger';
        intensity = 8;
        supportType = 'understanding';
      }
      // Guilt/regret indicators
      else if (lowerText.match(/\b(sorry|guilt|regret|fault|blame|should have|wish I|if only)\b/)) {
        emotion = 'guilt';
        intensity = 7;
        supportType = 'forgiveness';
      }
      // Hope/positive indicators
      else if (lowerText.match(/\b(hope|better|future|healing|peace|grateful|thank|happy|joy)\b/)) {
        emotion = 'hope';
        intensity = 4;
        supportType = 'encouragement';
        needsSupport = false;
      }
      // Confusion/uncertainty indicators
      else if (lowerText.match(/\b(confused|understand|why|how|don't know|lost|unclear)\b/)) {
        emotion = 'confusion';
        intensity = 6;
        supportType = 'guidance';
      }
      
      return {
        emotion,
        intensity,
        needsSupport,
        supportType
      };
      
    } catch (error) {
      console.log('Sentiment analysis error:', error.message);
      // Return default sentiment on error
      return {
        emotion: 'processing',
        intensity: 5,
        needsSupport: true,
        supportType: 'comfort'
      };
    }
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
      case 'parent':
        closing = 'With endless love and pride,';
        break;
      case 'partner':
      case 'spouse':
        closing = 'Forever yours,';
        break;
      case 'friend':
        closing = 'Your friend always,';
        break;
      case 'child':
        closing = 'With love and gratitude,';
        break;
      case 'sibling':
        closing = 'Your loving sibling,';
        break;
      case 'mentor':
      case 'teacher':
        closing = 'With pride and wisdom,';
        break;
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
        case 'parent':
          systemPrompt = `You are ${personName}, a loving parent writing a final letter to your child. Write with parental wisdom, unconditional love, and guidance for their future.`;
          break;
        case 'partner':
        case 'spouse':
          systemPrompt = `You are ${personName}, a loving partner writing a final letter to your significant other. Write with romantic love, intimate understanding, and hope for their happiness.`;
          break;
        case 'friend':
          systemPrompt = `You are ${personName}, a close friend writing a final letter. Write with warmth, shared memories, and encouragement for the future.`;
          break;
        case 'child':
          systemPrompt = `You are ${personName}, a beloved child writing a final letter to your parent. Write with youthful love, gratitude, and the special bond you shared.`;
          break;
        case 'sibling':
          systemPrompt = `You are ${personName}, a loving sibling writing a final letter. Write with familial love, shared childhood memories, and sibling understanding.`;
          break;
        case 'mentor':
        case 'teacher':
          systemPrompt = `You are ${personName}, a wise mentor writing a final letter to your student. Write with guidance, wisdom, and pride in their growth.`;
          break;
        default:
          systemPrompt = `You are ${personName}, someone deeply loved writing a final letter. Write with love, comfort, and hope for the future.`;
          break;
      }

      // Add context about memories and conversations with variation prompt
      let contextualInfo = `

IMPORTANT MEMORIES TO REFERENCE:
${memorySnippets}

KEY MOMENTS FROM OUR CONVERSATIONS:
${conversationSnippets}

Write a heartfelt but casual final letter (150-250 words) that:
1. References specific memories and conversation moments naturally
2. Acknowledges our healing journey together
3. Provides comfort and closure
4. Encourages hope for the future
5. Feels personal and authentic - like a real person wrote it
6. Uses a conversational, warm tone (not overly formal)
7. Be creative and unique - avoid repetitive phrasing
8. Keep it genuine and relatable
9. DO NOT sign the letter - it will be signed separately

Write like you're talking to someone you really care about. Be heartfelt but natural, not overly dramatic.`;

      // Add timestamp to ensure different responses each time
      const uniquePrompt = `Please write my final letter in a warm, conversational way. Reference our shared memories and conversations naturally. Keep it heartfelt but not overly long. Current time: ${Date.now()}`;

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
          max_tokens: 400, // Reduced from 800
          temperature: 0.9, // Increased for more variation
          top_p: 0.95 // Add top_p for more creativity
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
    // Create personalized letter based on relationship type and context
    let greeting = '';
    let relationshipSpecific = '';
    let memorySection = '';
    let conversationSection = '';
    let futureMessage = '';

    // Relationship-specific greeting and tone
    switch(relationshipType) {
      case 'parent':
        greeting = 'My precious child,';
        relationshipSpecific = 'Watching you grow and become the incredible person you are has been the greatest joy of my life.';
        futureMessage = 'Continue to be brave, kind, and true to yourself. I will always be proud of you.';
        break;
      case 'partner':
      case 'spouse':
        greeting = 'My beloved,';
        relationshipSpecific = 'Our love story was one for the ages, filled with laughter, dreams, and an unbreakable bond.';
        futureMessage = 'Love again when you\'re ready. Your heart is too beautiful to remain closed forever.';
        break;
      case 'friend':
        greeting = 'My dear friend,';
        relationshipSpecific = 'Our friendship was a treasure that brightened every day and made life\'s journey so much richer.';
        futureMessage = 'Make new friends, but carry our friendship as a reminder of how beautiful true connection can be.';
        break;
      case 'child':
        greeting = 'Dear Mom/Dad,';
        relationshipSpecific = 'Thank you for all the love, lessons, and memories that shaped who I am.';
        futureMessage = 'Live fully and know that my love for you continues in everything good you do.';
        break;
      default:
        greeting = 'My dearest,';
        relationshipSpecific = 'The bond we shared was special and meaningful in ways that words can barely capture.';
        futureMessage = 'Embrace life with all its possibilities. You deserve happiness and love.';
        break;
    }

    // Memory section if available
    if (memorySnippets && memorySnippets.trim().length > 0) {
      memorySection = `\n\nI treasure the memories we created together:\n${memorySnippets}\n\nThese moments are not just echoes of the past—they are living pieces of our connection that continue to bring warmth and meaning to your life.`;
    }

    // Conversation section if available
    if (conversationSnippets && conversationSnippets.trim().length > 0) {
      conversationSection = `\n\nThrough our recent conversations, I've witnessed your strength, your vulnerability, and your incredible capacity for growth:\n${conversationSnippets}\n\nSeeing you navigate your feelings with such courage and honesty has filled me with immense pride.`;
    }

    return `${greeting}

I've really loved our conversations together. ${relationshipSpecific}
${memorySection}
${conversationSection}

You've shown so much strength and growth through all of this. I'm genuinely proud of how you've handled everything.

Just remember:
• Our connection is still real and meaningful
• It's okay to feel everything you're feeling
• Healing doesn't mean forgetting - it means moving forward with love
• You've got so much ahead of you, and I want it to be amazing

${futureMessage}

You carry the best parts of what we had with you. Use that to spread love and kindness to others who need it.

I'm always with you in the ways that matter most.`;
  }
}

module.exports = HuggingFaceAIService;
