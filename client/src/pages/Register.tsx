import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name);
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center"
      style={{ 
        backgroundColor: '#f8f6f3',
        fontFamily: 'Fredoka, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        minHeight: '100vh',
        padding: '2rem 0'
      }}
    >
      <div className="container px-4">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-6">
            <div className="text-center mb-3            GROQ_API_KEY=your_actual_groq_key_here animate-fadeIn">
              <Link to="/" className="text-decoration-none">
                <h1 className="display-5 fw-bold mb-3" style={{ 
                  color: '#2c2c2c', 
                  fontFamily: 'Aldrich, sans-serif' 
                }}>
                  Echoes
                </h1>
              </Link>
              <p className="mb-3" style={{ color: '#6c757d', fontSize: '1rem' }}>
                Create your safe space for healing
              </p>
            </div>
            
            <div className="card border-0 shadow-sm animate-slideUp" style={{ backgroundColor: 'white' }}>
              <div className="card-body p-5">
                <h3 className="text-center mb-5 fw-bold" style={{ 
                  color: '#2c2c2c',
                  fontFamily: 'Prosto One, sans-serif'
                }}>
                  Create Account
                </h3>
                
                {error && (
                  <div className="alert alert-danger border-0 mb-4" role="alert" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label fw-semibold mb-2" style={{ color: '#2c2c2c' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control py-3 px-3"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        style={{ 
                          borderColor: '#dee2e6',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label fw-semibold mb-2" style={{ color: '#2c2c2c' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control py-3 px-3"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        style={{ 
                          borderColor: '#dee2e6',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label htmlFor="password" className="form-label fw-semibold mb-2" style={{ color: '#2c2c2c' }}>
                        Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control py-3 px-3"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Create a password"
                          minLength={6}
                          style={{ 
                            borderColor: '#dee2e6',
                            fontSize: '0.95rem'
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ borderColor: '#dee2e6' }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <small className="form-text text-muted mt-1">Min. 6 characters</small>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold mb-2" style={{ color: '#2c2c2c' }}>
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control py-3 px-3"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                        style={{ 
                          borderColor: '#dee2e6',
                          fontSize: '0.95rem'
                        }}
                      />
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
                      fontSize: '1rem',
                      marginTop: '1rem'
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
                
                <div className="text-center">
                  <p className="mb-2" style={{ color: '#6c757d' }}>
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-decoration-none fw-semibold"
                      style={{ color: '#2c2c2c' }}
                    >
                      Sign in here
                    </Link>
                  </p>
                  <Link 
                    to="/" 
                    className="text-decoration-none mt-2 d-inline-block"
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

export default Register;
