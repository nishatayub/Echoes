import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Session, sessionAPI } from '../services/api';
import { FaPlus, FaComments, FaCalendar, FaTrash } from 'react-icons/fa';
import AppHeader from '../components/AppHeader';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newRelationshipType, setNewRelationshipType] = useState<'family' | 'friend' | 'partner' | 'pet' | 'mentor' | 'other'>('other');
  const [creating, setCreating] = useState(false);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Add custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .dashboard-container {
        font-family: 'Fredoka, Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        background-color: #f8f6f3;
        min-height: 100vh;
      }
      
      .session-card {
        transition: all 0.3s ease;
        border: none;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        height: 180px;
        display: flex;
        flex-direction: column;
      }
      
      .session-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      }
      
      .create-button {
        transition: all 0.3s ease;
        background: #2c2c2c;
        border: none;
        border-radius: 8px;
        padding: 12px 30px;
        font-weight: 600;
      }
      
      .create-button:hover {
        background: #1a1a1a;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      
      .nav-brand {
        font-family: 'Aldrich, sans-serif';
        color: #2c2c2c;
        font-size: 1.5rem;
        font-weight: bold;
      }
      
      .welcome-title {
        font-family: 'Prosto One, sans-serif';
        color: #2c2c2c;
      }
      
      .section-title {
        font-family: 'Prosto One, sans-serif';
        color: #2c2c2c;
      }
      
      .modal-content {
        border: none;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      }
      
      .btn-minimal {
        background: #2c2c2c;
        border: none;
        color: white;
        border-radius: 6px;
        transition: all 0.3s ease;
      }
      
      .btn-minimal:hover {
        background: #1a1a1a;
        color: white;
        transform: translateY(-1px);
      }
      
      .btn-outline-minimal {
        border: 2px solid #2c2c2c;
        color: #2c2c2c;
        background: transparent;
        border-radius: 6px;
        transition: all 0.3s ease;
      }
      
      .btn-outline-minimal:hover {
        background: #2c2c2c;
        color: white;
        transform: translateY(-1px);
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .stats-card {
        background: white;
        border-radius: 8px;
        padding: 1.25rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        transition: all 0.3s ease;
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .stats-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const loadSessions = useCallback(async () => {
    console.log('Loading sessions...', { user, token });
    
    // If user exists but no token, clear auth state
    if (user && !token) {
      console.warn('User exists but token is null - clearing auth state');
      navigate('/login');
      return;
    }
    
    // Don't load sessions if no user is authenticated
    if (!user || !token) {
      console.log('No authenticated user, skipping session load');
      setLoading(false);
      return;
    }
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. Please check your connection and try again.');
    }, 15000); // Increased to 15 seconds for slow connections
    
    try {
      console.log('Fetching sessions from API...');
      const sessionsData = await sessionAPI.getSessions();
      console.log('Sessions loaded successfully:', sessionsData.length, 'sessions');
      setSessions(sessionsData);
      setError(''); // Clear any previous errors
      clearTimeout(timeoutId);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      clearTimeout(timeoutId);
      
      // Type assertion for error handling
      const error = err as { response?: { status?: number; data?: { message?: string } }; code?: string; message?: string };
      
      // More specific error messages
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Optionally redirect to login
        navigate('/login');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again in a moment.');
      } else if (error.response?.status === 0 || error.code === 'NETWORK_ERROR') {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(`Failed to load sessions: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, token, navigate]);

  useEffect(() => {
    // Only load sessions if we have both user and token
    if (user && token) {
      loadSessions();
    }
  }, [user, token, loadSessions]);

  const createSession = async () => {
    if (!newPersonName.trim()) return;
    
    setCreating(true);
    try {
      const session = await sessionAPI.createSession(newPersonName.trim(), newRelationshipType);
      setSessions([session, ...sessions]);
      setShowCreateModal(false);
      setNewPersonName('');
      setNewRelationshipType('other');
      navigate(`/session/${session._id}`);
    } catch {
      setError('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }
    
    try {
      await sessionAPI.deleteSession(sessionId);
      setSessions(sessions.filter(s => s._id !== sessionId));
    } catch {
      setError('Failed to delete session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border" style={{ color: '#2c2c2c' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: '#6c757d' }}>Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <AppHeader />

      <div className="container py-5">
        {/* Welcome Section */}
        <div className="row mb-5">
          <div className="col-12 text-center animate-fadeIn">
            <h1 className="welcome-title display-4 mb-4">Welcome back, {user?.name}</h1>
            <p className="lead mb-4" style={{ color: '#6c757d', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Your safe space for healing conversations and meaningful closure
            </p>
            <button 
              className="btn create-button text-white"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="me-2" />
              Start New Conversation
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="row mb-5">
          <div className="col-md-4 mb-4">
            <div className="stats-card animate-fadeIn">
              <FaComments size={24} style={{ color: '#2c2c2c' }} className="mb-2" />
              <h4 style={{ color: '#2c2c2c', marginBottom: '0.5rem' }}>{sessions.length}</h4>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Active Conversations</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="stats-card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <FaCalendar size={24} style={{ color: '#2c2c2c' }} className="mb-2" />
              <h4 style={{ color: '#2c2c2c', marginBottom: '0.5rem' }}>
                {sessions.reduce((total, session) => total + (session.conversations?.length || 0), 0)}
              </h4>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Total Messages</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="stats-card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <FaComments size={24} style={{ color: '#2c2c2c' }} className="mb-2" />
              <h4 style={{ color: '#2c2c2c', marginBottom: '0.5rem' }}>
                {sessions.reduce((total, session) => total + (session.memories?.length || 0), 0)}
              </h4>
              <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Saved Memories</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger border-0 mb-4 d-flex justify-content-between align-items-center" role="alert" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
            <span>{error}</span>
            <div>
              <button 
                className="btn btn-sm btn-outline-danger me-2"
                onClick={() => {
                  setError('');
                  setLoading(true);
                  loadSessions();
                }}
              >
                Retry
              </button>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError('')}
              ></button>
            </div>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="row">
          <div className="col-12">
            <h3 className="section-title mb-4">Your Conversations</h3>
            
            {sessions.length === 0 ? (
              <div className="text-center py-5">
                <FaComments size={48} style={{ color: '#6c757d', marginBottom: '1.5rem' }} />
                <h4 style={{ color: '#2c2c2c', marginBottom: '1rem' }}>No conversations yet</h4>
                <p style={{ color: '#6c757d', marginBottom: '2rem' }}>Start your first healing conversation today</p>
                <button 
                  className="btn create-button text-white"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus className="me-2" />
                  Create Your First Session
                </button>
              </div>
            ) : (
              <div className="row">
                {sessions.map((session) => (
                  <div key={session._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="session-card">
                      <div className="card-body p-3">
                        <h6 className="card-title mb-2" style={{ color: '#2c2c2c', fontWeight: '600' }}>
                          {session.personName}
                        </h6>
                        <div className="d-flex align-items-center mb-2" style={{ color: '#6c757d' }}>
                          <FaCalendar className="me-2" size={12} />
                          <small style={{ fontSize: '0.8rem' }}>{formatDate(session.updatedAt)}</small>
                        </div>
                        
                        <div className="mb-2">
                          <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                            {session.memories?.length || 0} memories • {session.conversations?.length || 0} messages
                          </small>
                        </div>
                        
                        {(session.conversations?.length || 0) > 0 && (
                          <p className="card-text small mb-3" style={{ color: '#6c757d', fontSize: '0.8rem', lineHeight: '1.3' }}>
                            Last: {session.conversations?.[session.conversations.length - 1]?.message?.substring(0, 50)}...
                          </p>
                        )}
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <Link 
                            to={`/session/${session._id}`}
                            className="btn btn-minimal text-white btn-sm"
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          >
                            Continue
                          </Link>
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => deleteSession(session._id)}
                            style={{ border: 'none', color: '#6c757d', padding: '6px 8px' }}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title" style={{ color: '#2c2c2c', fontFamily: 'Prosto One, sans-serif' }}>
                  Start New Conversation
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body pt-0">
                <p style={{ color: '#6c757d' }} className="mb-4">
                  Who would you like to have a conversation with today?
                </p>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control py-3"
                    placeholder="Enter their name..."
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createSession()}
                    autoFocus
                    style={{ 
                      borderColor: '#dee2e6',
                      fontSize: '1rem',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ color: '#6c757d', fontWeight: '500' }}>
                    What was your relationship with them?
                  </label>
                  <select
                    className="form-select py-3"
                    value={newRelationshipType}
                    onChange={(e) => setNewRelationshipType(e.target.value as 'family' | 'friend' | 'partner' | 'pet' | 'mentor' | 'other')}
                    style={{ 
                      borderColor: '#dee2e6',
                      fontSize: '1rem',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="other">Other</option>
                    <option value="family">Family Member</option>
                    <option value="friend">Friend</option>
                    <option value="partner">Partner/Spouse</option>
                    <option value="pet">Pet</option>
                    <option value="mentor">Mentor/Teacher</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-minimal"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-minimal text-white"
                  onClick={createSession}
                  disabled={!newPersonName.trim() || creating}
                >
                  {creating ? 'Creating...' : 'Start Conversation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default Dashboard;
