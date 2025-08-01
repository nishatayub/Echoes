import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Session, sessionAPI } from '../services/api';
import { FaHeart, FaPlus, FaComments, FaCalendar, FaSignOutAlt, FaTrash } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionsData = await sessionAPI.getSessions();
      setSessions(sessionsData);
    } catch {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!newPersonName.trim()) return;
    
    setCreating(true);
    try {
      const session = await sessionAPI.createSession(newPersonName.trim());
      setSessions([session, ...sessions]);
      setShowCreateModal(false);
      setNewPersonName('');
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
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
            <FaHeart className="text-primary me-2" />
            <span className="fw-light">Echoes</span>
          </Link>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button 
                className="btn btn-outline-secondary dropdown-toggle" 
                data-bs-toggle="dropdown"
              >
                {user?.name}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={logout}>
                    <FaSignOutAlt className="me-2" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        {/* Welcome Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="text-center">
              <h1 className="display-4 fw-light mb-3">Welcome back, {user?.name}</h1>
              <p className="lead text-muted mb-4">
                Your safe space for healing conversations and closure
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className="me-2" />
                Start New Conversation
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="row">
          <div className="col-12">
            <h3 className="mb-4">Your Conversations</h3>
            
            {sessions.length === 0 ? (
              <div className="text-center py-5">
                <FaComments size={64} className="text-muted mb-3" />
                <h4 className="text-muted">No conversations yet</h4>
                <p className="text-muted">Start your first healing conversation</p>
                <button 
                  className="btn btn-primary"
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
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title">{session.personName}</h5>
                        <div className="d-flex align-items-center text-muted mb-2">
                          <FaCalendar className="me-2" />
                          <small>{formatDate(session.updatedAt)}</small>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">
                            {session.memories.length} memories • {session.conversations.length} messages
                          </small>
                        </div>
                        
                        {session.conversations.length > 0 && (
                          <p className="card-text text-muted small">
                            Last message: {session.conversations[session.conversations.length - 1]?.message.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                      
                      <div className="card-footer bg-transparent d-flex justify-content-between">
                        <Link 
                          to={`/session/${session._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Continue
                        </Link>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteSession(session._id)}
                        >
                          <FaTrash />
                        </button>
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
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Start New Conversation</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3">
                  Who would you like to have a conversation with today?
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter their name..."
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createSession()}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
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
