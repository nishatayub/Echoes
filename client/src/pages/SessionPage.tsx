import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Session, sessionAPI, Memory, Conversation } from '../services/api';
import { FaHeart, FaArrowLeft, FaFeatherAlt, FaComments, FaEnvelope } from 'react-icons/fa';
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
  const [saving, setSaving] = useState(false);

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
    
    setSaving(true);
    try {
      const updatedSession = await sessionAPI.updateSession(id, updatedData);
      setSession(updatedSession);
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
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
    
    const updatedConversations = [...session.conversations, newConversation];
    await saveSession({ conversations: updatedConversations });
  };

  const saveFinalLetter = async (letter: string) => {
    await saveSession({ finalLetter: letter });
  };

  const renderStepIcon = (step: SessionStep, currentStep: SessionStep) => {
    const isActive = step === currentStep;
    const iconClass = isActive ? 'text-primary' : 'text-muted';
    
    switch (step) {
      case 'memory':
        return <FaFeatherAlt className={iconClass} />;
      case 'chat':
        return <FaComments className={iconClass} />;
      case 'letter':
        return <FaEnvelope className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>Session not found</h3>
          <Link to="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container">
          <div className="d-flex align-items-center">
            <Link to="/dashboard" className="btn btn-outline-secondary me-3">
              <FaArrowLeft />
            </Link>
            <div className="navbar-brand d-flex align-items-center mb-0">
              <FaHeart className="text-primary me-2" />
              <span className="fw-light">Echoes</span>
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">Conversation with {session.personName}</span>
            {saving && (
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white border-bottom">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-center py-3">
                <div className="d-flex align-items-center">
                  <div 
                    className={`d-flex align-items-center me-4 ${currentStep === 'memory' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCurrentStep('memory')}
                  >
                    {renderStepIcon('memory', currentStep)}
                    <span className="ms-2">Memories</span>
                  </div>
                  
                  <div className="border-top" style={{ width: '50px' }}></div>
                  
                  <div 
                    className={`d-flex align-items-center mx-4 ${currentStep === 'chat' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCurrentStep('chat')}
                  >
                    {renderStepIcon('chat', currentStep)}
                    <span className="ms-2">Conversation</span>
                  </div>
                  
                  <div className="border-top" style={{ width: '50px' }}></div>
                  
                  <div 
                    className={`d-flex align-items-center ms-4 ${currentStep === 'letter' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCurrentStep('letter')}
                  >
                    {renderStepIcon('letter', currentStep)}
                    <span className="ms-2">Letter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mt-3">
          <div className="alert alert-danger alert-dismissible" role="alert">
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
      <div className="flex-grow-1">
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
