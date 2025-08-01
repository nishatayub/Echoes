const { HfInference } = require('@huggingface/inference');

class HuggingFaceAIService {
  constructor() {
    // Using free tier - no API key required for basic models
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY || undefined);
  }

  /**
   * Generate response using Hugging Face models with intelligent fallbacks
   */
  async generateResponse({ personName, memories, conversations, userMessage, relationshipType = 'loved one' }) {
    try {
      // Try using Hugging Face API first
      try {
        const response = await this.hf.textGeneration({
          model: 'microsoft/DialoGPT-medium',
          inputs: userMessage,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        });

        let aiResponse = response.generated_text || response;
        if (typeof aiResponse === 'object' && aiResponse.generated_text) {
          aiResponse = aiResponse.generated_text;
        }
        
        aiResponse = aiResponse.replace(/^(User:|AI:|Assistant:)/i, '').trim();
        
        if (aiResponse && aiResponse.length > 10) {
          return aiResponse;
        }
      } catch (error) {
        console.log('Hugging Face API Error:', error.message);
      }

      // Enhanced intelligent fallback responses
      return this.generateIntelligentResponse(userMessage, personName, conversations, memories, relationshipType);

    } catch (error) {
      console.error('Generate Response Error:', error);
      return this.generateIntelligentResponse(userMessage, personName, conversations, memories, relationshipType);
    }
  }

  /**
   * Generate intelligent contextual responses based on conversation analysis
   */
  generateIntelligentResponse(userMessage, personName, conversations, memories, relationshipType) {
    const lowerMessage = userMessage.toLowerCase();
    const conversationCount = conversations.length;
    
    // Analyze recent conversation patterns
    const recentUserMessages = conversations
      .filter(c => c.isUser)
      .slice(-3)
      .map(c => c.message.toLowerCase())
      .join(' ');
    
    // Determine emotional context
    const emotionalKeywords = {
      grief: ['miss', 'gone', 'lost', 'empty', 'alone', 'sad', 'cry', 'tears'],
      anger: ['angry', 'mad', 'furious', 'hate', 'unfair', 'why', 'frustrated'],
      guilt: ['sorry', 'fault', 'should have', 'regret', 'forgive', 'mistake'],
      love: ['love', 'care', 'special', 'heart', 'beautiful', 'wonderful'],
      gratitude: ['thank', 'grateful', 'appreciate', 'helped', 'glad'],
      confusion: ['confused', 'understand', 'why', 'how', 'explain', 'lost'],
      hope: ['hope', 'future', 'better', 'heal', 'forward', 'strength']
    };

    let dominantEmotion = 'neutral';
    let maxMatches = 0;
    
    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        dominantEmotion = emotion;
      }
    }

    // Generate responses based on conversation stage and emotion
    if (conversationCount <= 2) {
      return this.generateGreetingResponse(userMessage, personName, relationshipType);
    } else if (conversationCount <= 6) {
      return this.generateEarlyConversationResponse(userMessage, personName, dominantEmotion, relationshipType);
    } else {
      return this.generateDeepConversationResponse(userMessage, personName, dominantEmotion, conversations, relationshipType);
    }
  }

  generateGreetingResponse(userMessage, personName, relationshipType) {
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
