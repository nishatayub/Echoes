import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Session, sessionAPI, Memory, Conversation } from '../services/api';
import { FaFeatherAlt, FaComments, FaEnvelope } from 'react-icons/fa';
import AppHeader from '../components/AppHeader';
import MemoryBuilder from '../components/MemoryBuilder';
import ChatInterface from '../components/ChatInterface';
import FinalLetter from '../components/FinalLetter';

type SessionStep = 'memory' | 'chat' | 'letter';

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<SessionStep>('memory');

  // Add custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .session-container {
        font-family: 'Fredoka', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: #f8f6f3;
        min-height: 100vh;
      }
      
      .session-nav {
        background: white;
        border-bottom: 1px solid #e5e5e5;
      }
      
      .nav-brand {
        font-family: 'Aldrich', sans-serif;
        font-size: 1.5rem;
        color: #2c2c2c !important;
        text-decoration: none;
      }
      
      .btn-back {
        background: transparent;
        border: 2px solid #2c2c2c;
        color: #2c2c2c;
        border-radius: 6px;
        padding: 8px 12px;
        transition: all 0.3s ease;
      }
      
      .btn-back:hover {
        background: #2c2c2c;
        color: white;
        transform: translateY(-1px);
      }
      
      .btn-chat-memory {
        border: 2px solid #2c2c2c;
        color: #2c2c2c;
        background: transparent;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      }
      
      .btn-chat-memory:hover {
        background: #2c2c2c;
        color: white;
        transform: translateY(-1px);
      }
      
      .btn-chat-letter {
        background: linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%);
        border: none;
        color: white;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      }
      
      .btn-chat-letter:hover {
        background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
        transform: translateY(-1px);
        color: white;
      }
      
      .progress-steps {
        background: white;
        border-bottom: 1px solid #e5e5e5;
        padding: 1.5rem 0;
      }
      
      .step-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s ease;
        color: #6c757d;
      }
      
      .step-item.active {
        color: #2c2c2c;
        background: #f8f6f3;
      }
      
      .step-item:hover {
        background: #f0f0f0;
      }
      
      .step-connector {
        height: 2px;
        width: 60px;
        background: #e5e5e5;
      }
      
      .step-connector.active {
        background: #2c2c2c;
      }
      
      .session-title {
        font-family: 'Prosto One', cursive;
        color: #2c2c2c;
        font-weight: 400;
      }
      
      .content-area {
        flex: 1;
        padding: 2rem 0;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      if (!id) return;
      
      try {
        const sessionData = await sessionAPI.getSession(id);
        setSession(sessionData);
        
        // Determine which step to show based on existing data
        if (sessionData.conversations.length > 0) {
          setCurrentStep('chat');
        } else if (sessionData.memories.length > 0) {
          setCurrentStep('chat');
        } else {
          setCurrentStep('memory');
        }
      } catch {
        setError('Failed to load session');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSession();
    }
  }, [id, navigate]);

  const saveSession = async (updatedData: { memories?: Memory[]; conversations?: Conversation[]; finalLetter?: string }) => {
    if (!session || !id) return;
    
    try {
      // Save to backend but DON'T overwrite local state
      await sessionAPI.updateSession(id, updatedData);
      // Local state is already updated in addMessage, addMemory, etc.
      // No need to setSession here as it would overwrite our current state
    } catch {
      setError('Failed to save changes');
    }
  };

  const addMemory = async (content: string) => {
    if (!session) return;
    
    const newMemory: Memory = {
      content,
      timestamp: new Date().toISOString()
    };
    
    const updatedMemories = [...session.memories, newMemory];
    await saveSession({ memories: updatedMemories });
  };

  const addMessage = async (message: string, isUser: boolean) => {
    if (!session) return;
    
    const newConversation: Conversation = {
      message,
      isUser,
      timestamp: new Date().toISOString()
    };
    
    // Check if message already exists to prevent duplicates
    const messageExists = session.conversations.some(conv => 
      conv.message === message && 
      conv.isUser === isUser && 
      Math.abs(new Date(conv.timestamp).getTime() - new Date(newConversation.timestamp).getTime()) < 5000
    );
    
    if (messageExists) {
      console.log('Message already exists, skipping duplicate');
      return;
    }
    
    const updatedConversations = [...session.conversations, newConversation];
    
    // Update session state immediately for better UX
    setSession(prev => prev ? {
      ...prev,
      conversations: updatedConversations
    } : null);
    
    // Save to backend (but don't overwrite local state)
    await saveSession({ conversations: updatedConversations });
  };

  const saveFinalLetter = async (letter: string) => {
    await saveSession({ finalLetter: letter });
  };

  if (loading) {
    return (
      <div className="session-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border" style={{ color: '#2c2c2c' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: '#6c757d' }}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="session-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3 style={{ color: '#2c2c2c' }}>Session not found</h3>
          <Link to="/dashboard" className="btn btn-back mt-3">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="session-container">
      {/* Header */}
      <AppHeader 
        showBackButton={true} 
        backLink="/dashboard"
        title={session ? `Conversation with ${session.personName}` : ''}
      />

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center">
            <div 
              className={`step-item ${currentStep === 'memory' ? 'active' : ''}`}
              onClick={() => setCurrentStep('memory')}
            >
              <FaFeatherAlt className="me-2" />
              <span>Memories</span>
            </div>
            
            <div className={`step-connector ${currentStep !== 'memory' ? 'active' : ''}`}></div>
            
            <div 
              className={`step-item ${currentStep === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentStep('chat')}
            >
              <FaComments className="me-2" />
              <span>Conversation</span>
            </div>
            
            <div className={`step-connector ${currentStep === 'letter' ? 'active' : ''}`}></div>
            
            <div 
              className={`step-item ${currentStep === 'letter' ? 'active' : ''}`}
              onClick={() => setCurrentStep('letter')}
            >
              <FaEnvelope className="me-2" />
              <span>Letter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mt-3">
          <div className="alert alert-danger border-0" role="alert" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
            ></button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="content-area">
        {currentStep === 'memory' && (
          <MemoryBuilder
            memories={session.memories}
            personName={session.personName}
            onAddMemory={addMemory}
            onNext={() => setCurrentStep('chat')}
          />
        )}
        
        {currentStep === 'chat' && (
          <ChatInterface
            sessionId={session._id}
            conversations={session.conversations}
            personName={session.personName}
            relationshipType={session.relationshipType}
            onSendMessage={addMessage}
            onGoToMemories={() => setCurrentStep('memory')}
            onGoToLetter={() => setCurrentStep('letter')}
          />
        )}
        
        {currentStep === 'letter' && (
          <FinalLetter
            sessionId={session._id}
            memories={session.memories}
            conversations={session.conversations}
            personName={session.personName}
            relationshipType={session.relationshipType}
            existingLetter={session.finalLetter}
            onSaveLetter={saveFinalLetter}
            onBackToChat={() => setCurrentStep('chat')}
          />
        )}
      </div>
    </div>
  );
};

export default SessionPage;
