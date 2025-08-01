import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

interface AppHeaderProps {
  showBackButton?: boolean;
  backLink?: string;
  title?: string;
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  showBackButton = false, 
  backLink = '/dashboard',
  title,
  children 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container">
        <div className="d-flex align-items-center">
          {showBackButton && (
            <Link 
              to={backLink} 
              className="btn btn-outline-secondary me-3"
              style={{
                borderColor: '#2c2c2c',
                color: '#2c2c2c',
                borderRadius: '6px',
                padding: '8px 12px',
                textDecoration: 'none'
              }}
            >
              ← Back
            </Link>
          )}
          <Link 
            to="/" 
            className="navbar-brand nav-brand text-decoration-none"
            style={{
              fontFamily: 'Aldrich, sans-serif',
              color: '#2c2c2c',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            Echoes
          </Link>
          {title && (
            <span 
              className="ms-3"
              style={{
                color: '#6c757d',
                fontSize: '1.1rem',
                fontFamily: 'Fredoka, sans-serif'
              }}
            >
              {title}
            </span>
          )}
        </div>
        
        <div className="d-flex align-items-center">
          {children}
          
          <div className="nav-item dropdown ms-3">
            <button 
              className="btn btn-outline-secondary dropdown-toggle" 
              data-bs-toggle="dropdown"
              style={{
                borderColor: '#2c2c2c',
                color: '#2c2c2c',
                borderRadius: '6px'
              }}
            >
              {user?.name}
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
