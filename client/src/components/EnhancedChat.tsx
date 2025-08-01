import React, { useState } from 'react';
import ChatInterface from './ChatInterface';
import GuidedPrompts from './GuidedPrompts';
import { Conversation } from '../services/api';

interface EnhancedChatProps {
  sessionId: string;
  conversations: Conversation[];
  personName: string;
  relationshipType?: string;
  onSendMessage: (message: string, isUser: boolean) => Promise<void>;
  onGoToMemories: () => void;
  onGoToLetter: () => void;
}

const EnhancedChat: React.FC<EnhancedChatProps> = ({
  sessionId,
  conversations,
  personName,
  relationshipType,
  onSendMessage,
  onGoToMemories,
  onGoToLetter
}) => {
  const [showPrompts, setShowPrompts] = useState(conversations.length === 0);
  const [sessionStage, setSessionStage] = useState<'beginning' | 'middle' | 'closure'>('beginning');

  const handleSelectPrompt = async (prompt: string) => {
    await onSendMessage(prompt, true);
    setShowPrompts(false);
  };

  const determineSessionStage = React.useCallback((): 'beginning' | 'middle' | 'closure' => {
    const userMessages = conversations.filter(c => c.isUser).length;
    if (userMessages < 3) return 'beginning';
    if (userMessages < 8) return 'middle';
    return 'closure';
  }, [conversations]);

  React.useEffect(() => {
    setSessionStage(determineSessionStage());
  }, [determineSessionStage]);

  return (
    <div className="enhanced-chat-container">
      {/* Guided Prompts Section */}
      {showPrompts && (
        <div className="mb-4">
          <GuidedPrompts
            relationshipType={relationshipType}
            sessionStage={sessionStage}
            onSelectPrompt={handleSelectPrompt}
          />
          
          <div className="text-center mt-3">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowPrompts(false)}
            >
              Hide Prompts
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <ChatInterface
        sessionId={sessionId}
        conversations={conversations}
        personName={personName}
        relationshipType={relationshipType}
        onSendMessage={onSendMessage}
        onGoToMemories={onGoToMemories}
        onGoToLetter={onGoToLetter}
      />

      {/* Show Prompts Button */}
      {!showPrompts && (
        <div className="text-center mt-3">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowPrompts(true)}
          >
            💡 Show Guided Prompts
          </button>
        </div>
      )}

      {/* Session Progress Indicator */}
      <div className="mt-3">
        <div className="card">
          <div className="card-body py-2 px-3">
            <div className="row align-items-center">
              <div className="col">
                <div className="d-flex align-items-center">
                  <div 
                    className={`badge me-2 ${
                      sessionStage === 'beginning' ? 'bg-info' :
                      sessionStage === 'middle' ? 'bg-warning' : 'bg-success'
                    }`}
                  >
                    {sessionStage === 'beginning' ? '🌱 Getting Started' :
                     sessionStage === 'middle' ? '🌿 Exploring' : '🌸 Finding Closure'}
                  </div>
                  <small className="text-muted">
                    {conversations.filter(c => c.isUser).length} messages shared
                  </small>
                </div>
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-outline-success btn-sm"
                  onClick={onGoToLetter}
                  disabled={conversations.filter(c => c.isUser).length === 0}
                >
                  Create Final Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChat;
