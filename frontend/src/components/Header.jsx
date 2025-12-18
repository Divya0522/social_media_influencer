
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo2.jpg';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    
    if (user.role === 'influencer') {
      return '/influencer-dashboard';
    } else if (user.role === 'company') {
      return '/company-dashboard';
    }
    return null;
  };

  const handleBrowseInfluencers = () => {
    if (!user) {
      alert('Please login as a company to browse influencers');
      navigate('/login');
      return;
    }
    if (user.role !== 'company') {
      alert('Only companies can browse influencers');
      return;
    }
    navigate('/influencers');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
           {/* <img src={logo} alt="InfluencerHub Logo" className="logo-img" /> */}
            <span>InfluencerHub</span>
          </Link>
          <nav className="nav">
            
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
           
            {user && user.role === 'company' && (
              <button
                onClick={handleBrowseInfluencers}
                className={`nav-link ${isActive('/influencers') ? 'active' : ''}`}
                style={{ 
                  border: 'none', 
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit'
                }}
              >
                Find Influencers
              </button>
            )}
            
            {user ? (
              <>
                {getDashboardLink() && (
                  <Link 
                    to={getDashboardLink()} 
                    className={`nav-link ${isActive(getDashboardLink()) ? 'active' : ''}`}
                  >
                    Dashboard
                  </Link>
                )}
                <div className="user-section">
                  <span className="welcome-text">
                    Welcome, {user.email}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-secondary logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-section">
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;