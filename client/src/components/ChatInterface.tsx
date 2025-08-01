import React, { useState, useEffect, useRef } from 'react';
import { Conversation, aiAPI } from '../services/api';
import { FaComments, FaPaperPlane } from 'react-icons/fa';

interface ChatInterfaceProps {
  sessionId: string;
  conversations: Conversation[];
  personName: string;
  relationshipType?: string;
  onSendMessage: (message: string, isUser: boolean) => Promise<void>;
  onGoToMemories: () => void;
  onGoToLetter: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  conversations,
  personName,
  relationshipType,
  onSendMessage
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .chat-container {
        font-family: 'Fredoka', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: #f8f6f3;
        height: calc(100vh - 200px);
        display: flex;
        flex-direction: column;
      }
      
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        background: #f8f6f3;
      }
      
      .message-user {
        background: linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%);
        color: white;
        border-radius: 20px 20px 5px 20px;
        max-width: 70%;
        margin-left: auto;
        margin-bottom: 1rem;
        padding: 1rem 1.5rem;
        box-shadow: 0 2px 10px rgba(44, 44, 44, 0.2);
      }
      
      .message-ai {
        background: white;
        color: #2c2c2c;
        border-radius: 20px 20px 20px 5px;
        max-width: 70%;
        margin-right: auto;
        margin-bottom: 1rem;
        padding: 1rem 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      }
      
      .message-content {
        white-space: pre-line;
        line-height: 1.5;
        margin-bottom: 0.5rem;
      }
      
      .message-time {
        font-size: 0.8rem;
        opacity: 0.7;
      }
      
      .chat-input-area {
        background: white;
        border-top: 1px solid #e5e5e5;
        padding: 1.5rem 2rem;
      }
      
      .chat-input {
        border: 2px solid #e5e5e5;
        border-radius: 25px;
        padding: 12px 20px;
        font-size: 1rem;
        transition: all 0.3s ease;
      }
      
      .chat-input:focus {
        border-color: #2c2c2c;
        box-shadow: 0 0 0 0.2rem rgba(44, 44, 44, 0.25);
        outline: none;
      }
      
      .btn-send {
        background: linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%);
        border: none;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        color: white;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .btn-send:hover {
        background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(44, 44, 44, 0.3);
        color: white;
      }
      
      .btn-send:disabled {
        opacity: 0.6;
        transform: none;
        box-shadow: none;
      }
      
      .starter-prompt {
        background: white;
        border: 2px dashed #d6d6d6;
        border-radius: 15px;
        padding: 0.75rem 1rem;
        margin: 0.25rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }
      
      .starter-prompt:hover {
        border-color: #2c2c2c;
        background: #f0f0f0;
      }
      
      .thinking-indicator {
        background: white;
        border-radius: 20px 20px 20px 5px;
        max-width: 70%;
        margin-right: auto;
        margin-bottom: 1rem;
        padding: 1rem 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || sending) return;
    
    const userMessage = currentMessage;
    setCurrentMessage('');
    setSending(true);
    
    try {
      console.log('Sending message:', userMessage);
      
      // Call AI API to get response (this will handle storing both user and AI messages)
      console.log('Calling AI API with:', { sessionId, userMessage, relationshipType });
      const aiResponse = await aiAPI.generateResponse(
        sessionId, 
        userMessage, 
        relationshipType
      );
      
      console.log('AI API Response:', aiResponse);
      
      // Since the backend handles message storage, we need to trigger a refresh
      // by calling onSendMessage with special parameters to indicate a refresh is needed
      if (onSendMessage) {
        // Call with a special flag to indicate this is a refresh request
        await onSendMessage('__REFRESH_SESSION__', false);
      }
      
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // Add fallback response on error
      await onSendMessage(
        `I'm here with you. Please tell me more about ${personName}.`, 
        false
      );
    } finally {
      setSending(false);
    }
  };

  const conversationStarters = [
    "I've been thinking about you a lot lately...",
    "I wish I could have told you...",
    "I'm sorry for...",
    "Thank you for..."
  ];

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="chat-messages">
        {conversations.length === 0 && (
          <div className="text-center" style={{ color: '#6c757d', marginTop: '3rem' }}>
            <FaComments size={48} style={{ color: '#d6d6d6', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>This is a safe space. Take your time and share what's in your heart.</p>
          </div>
        )}
        
        {conversations.map((conv, index) => (
          <div key={index} className={conv.isUser ? 'message-user' : 'message-ai'}>
            <div className="message-content">{conv.message}</div>
            <div className="message-time">
              {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {sending && (
          <div className="thinking-indicator">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" style={{ color: '#2c2c2c' }} role="status"></div>
              <span style={{ color: '#6c757d' }}>Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        {conversations.length === 0 && (
          <div className="mb-3">
            <small style={{ color: '#6c757d' }} className="mb-2 d-block">Need help getting started? Try one of these:</small>
            <div className="d-flex flex-wrap">
              {conversationStarters.map((starter, index) => (
                <div 
                  key={index}
                  className="starter-prompt"
                  onClick={() => setCurrentMessage(starter)}
                >
                  "{starter}"
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="d-flex align-items-center gap-3">
          <input
            type="text"
            className="chat-input flex-grow-1"
            placeholder="Share what's in your heart..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={sending}
          />
          <button 
            className="btn btn-send" 
            onClick={sendMessage} 
            disabled={!currentMessage.trim() || sending}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
