
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'influencer') {
        navigate('/influencer-dashboard');
      } else if (user.role === 'company') {
        navigate('/company-dashboard');
      }
    } else {
      navigate('/register');
    }
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

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Connect with the Right Influencers</h1>
          <p>
            Connect with real influencers who can help promote your products and reach more people online.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleGetStarted} className="btn btn-primary" style={{ padding: '12px 30px' }}>
              {user ? 'Go to Dashboard' : 'Get Started'}
            </button>
            <button onClick={handleBrowseInfluencers} className="btn btn-secondary" style={{ padding: '12px 30px' }}>
              Browse Influencers
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="text-center mb-3">Why Choose InfluencerHub?</h2>
          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>For Influencers</h3>
              <p>Showcase your profile to top brands and get collaboration opportunities that match your niche and audience.</p>
              {!user && (
                <Link to="/register?role=influencer" className="btn btn-primary mt-2">
                  Join as Influencer
                </Link>
              )}
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>For Companies</h3>
              <p>Find the perfect influencers for your campaigns with advanced filtering and detailed analytics.</p>
              {!user && (
                <Link to="/register?role=company" className="btn btn-primary mt-2">
                  Join as Company
                </Link>
              )}
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Grow Together</h3>
              <p>Build meaningful partnerships that drive growth for both influencers and brands.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <h2 className="text-center mb-3">How It Works</h2>
          <div className="grid grid-3">
            <div className="feature-card">
              <h3>1. Create Profile</h3>
              <p>Influencers create detailed profiles showcasing their stats, audience, and content niche.</p>
            </div>
            <div className="feature-card">
              <h3>2. Discover & Connect</h3>
              <p>Brands search and filter through influencers to find the perfect match for their campaigns.</p>
            </div>
            <div className="feature-card">
              <h3>3. Collaborate</h3>
              <p>Connect directly and start building successful marketing partnerships.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;