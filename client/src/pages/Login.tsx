import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Add animation styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out;
      }
      
      .animate-slideUp {
        animation: slideUp 0.6s ease-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .form-control:focus {
        border-color: #2c2c2c;
        box-shadow: 0 0 0 0.2rem rgba(44, 44, 44, 0.25);
      }
      
      .btn:hover {
        transform: translateY(-2px);
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ 
        backgroundColor: '#f8f6f3',
        fontFamily: 'Fredoka, Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center mb-5 animate-fadeIn">
              <Link to="/" className="text-decoration-none">
                <h1 className="display-4 fw-bold mb-3" style={{ 
                  color: '#2c2c2c', 
                  fontFamily: 'Aldrich, sans-serif' 
                }}>
                  Echoes
                </h1>
              </Link>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                Welcome back to your safe space
              </p>
            </div>
            
            <div className="card border-0 shadow-sm animate-slideUp" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-5">
                <h3 className="text-center mb-4 fw-bold" style={{ 
                  color: '#2c2c2c',
                  fontFamily: 'Prosto One, sans-serif'
                }}>
                  Sign In
                </h3>
                
                {error && (
                  <div className="alert alert-danger border-0" role="alert" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold" style={{ color: '#2c2c2c' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control py-3"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      style={{ 
                        borderColor: '#dee2e6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#2c2c2c' }}>
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control py-3"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        style={{ 
                          borderColor: '#dee2e6',
                          fontSize: '1rem'
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderColor: '#dee2e6' }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn w-100 py-3 mb-4 fw-semibold"
                    disabled={loading}
                    style={{ 
                      backgroundColor: '#2c2c2c',
                      borderColor: '#2c2c2c',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                
                <div className="text-center">
                  <p className="mb-0" style={{ color: '#6c757d' }}>
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-decoration-none fw-semibold"
                      style={{ color: '#2c2c2c' }}
                    >
                      Create one here
                    </Link>
                  </p>
                  <Link 
                    to="/" 
                    className="text-decoration-none mt-3 d-inline-block"
                    style={{ color: '#6c757d', fontSize: '0.9rem' }}
                  >
                    ← Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
