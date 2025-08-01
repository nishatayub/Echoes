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
  onSendMessage,
  onGoToMemories,
  onGoToLetter
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || sending) return;
    
    setSending(true);
    try {
      // Send user message first
      await onSendMessage(currentMessage, true);
      
      // Generate AI response using the API
      const userMessage = currentMessage;
      setCurrentMessage('');
      
      const aiResponse = await aiAPI.generateResponse(
        sessionId, 
        userMessage, 
        relationshipType
      );
      
      // Send AI response
      await onSendMessage(aiResponse.response, false);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to simple response if AI fails
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
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-12">
          <div className="d-flex flex-column" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="bg-light p-3 border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FaComments className="text-primary me-2" />
                  <h5 className="mb-0">Conversation with {personName}</h5>
                </div>
                <div>
                  <button className="btn btn-outline-secondary btn-sm me-2" onClick={onGoToMemories}>
                    Add Memories
                  </button>
                  <button className="btn btn-outline-success btn-sm" onClick={onGoToLetter}>
                    Create Letter
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-grow-1 p-3 overflow-auto">
              {conversations.length === 0 && (
                <div className="text-center text-muted mt-5">
                  <p>This is a safe space. Take your time and share what's in your heart.</p>
                </div>
              )}
              
              {conversations.map((conv, index) => (
                <div key={index} className={`mb-3 d-flex ${conv.isUser ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div 
                    className={`card ${conv.isUser ? 'bg-primary text-white' : 'bg-light'}`}
                    style={{ maxWidth: '70%' }}
                  >
                    <div className="card-body p-3">
                      <p className="card-text mb-1" style={{ whiteSpace: 'pre-line' }}>{conv.message}</p>
                      <small className={conv.isUser ? 'text-white-50' : 'text-muted'}>
                        {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="mb-3 d-flex justify-content-start">
                  <div className="card bg-light">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        <span className="text-muted">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-top bg-white">
              {conversations.length === 0 && (
                <div className="mb-3">
                  <small className="text-muted mb-2 d-block">Need help getting started? Try one of these:</small>
                  <div className="d-flex flex-wrap gap-2">
                    {conversationStarters.map((starter, index) => (
                      <button 
                        key={index}
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setCurrentMessage(starter)}
                      >
                        "{starter}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Share what's in your heart..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={sending}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={sendMessage} 
                  disabled={!currentMessage.trim() || sending}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
