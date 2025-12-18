
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { companyAPI } from '../services/api';
import { trackProfileView } from '../pages/InfluencerDashboard';

const InfluencerCard = ({ influencer, onSendCollaboration }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (influencer && user?.role === 'company') {
      trackProfileView(influencer.id);
    }
  }, [influencer, user]);

  const loadFavorites = async () => {
    if (user?.role === 'company') {
      try {
        const response = await companyAPI.getFavorites();
        const favorites = response.data;
        setIsFavorite(favorites.some(fav => fav.id === influencer.id));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  };

  const handleAddFavorite = async () => {
    try {
      await companyAPI.addFavorite(influencer.id);
      setIsFavorite(true);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const handleRemoveFavorite = async () => {
    try {
      await companyAPI.removeFavorite(influencer.id);
      setIsFavorite(false);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: '📷',
      youtube: '🎥',
      tiktok: '🎵',
      twitter: '🐦',
      linkedin: '💼'
    };
    return icons[platform] || '👤';
  };

  return (
    <div className="card influencer-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>{influencer.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <span style={{ 
              background: '#e9ecef', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {getPlatformIcon(influencer.platform)} {influencer.platform}
            </span>
            <span style={{ 
              background: '#e3f2fd', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '0.8rem',
              color: '#1976d2'
            }}>
              {influencer.category}
            </span>
          </div>
        </div>
        
        {user?.role === 'company' && (
          <button
            onClick={isFavorite ? handleRemoveFavorite : handleAddFavorite}
            className={`btn ${isFavorite ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '5px 10px', fontSize: '12px', minWidth: '80px' }}
          >
            {isFavorite ? '❤️ Remove' : '🤍 Favorite'}
          </button>
        )}
      </div>
      
      <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.5' }}>
        {influencer.bio || 'No bio provided.'}
      </p>
      
      <div className="influencer-stats">
        <div className="stat">
          <div className="stat-value" style={{ color: '#e91e63', fontSize: '1.3rem' }}>
            {formatNumber(influencer.followers_count)}
          </div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="stat">
          <div className="stat-value" style={{ color: '#2196f3', fontSize: '1.1rem' }}>
            {influencer.audience_gender || 'Mixed'}
          </div>
          <div className="stat-label">Audience</div>
        </div>
        <div className="stat">
          <div className="stat-value" style={{ color: '#4caf50', fontSize: '1.1rem' }}>
            {influencer.audience_age_range || 'N/A'}
          </div>
          <div className="stat-label">Age Range</div>
        </div>
      </div>

      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ fontSize: '0.9rem' }}>Audience Location:</strong>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            {influencer.audience_country || 'Not specified'}
          </span>
        </div>
        
        {influencer.contact_email && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.9rem' }}>Contact:</strong>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {influencer.contact_email}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link to={`/influencers/${influencer.id}`} className="btn btn-primary" style={{ flex: 1 }}>
          View Profile
        </Link>
        
        {user?.role === 'company' && (
          <button 
            onClick={() => onSendCollaboration(influencer.id, influencer.name, influencer.platform, influencer.category)}
            className="btn btn-success"
            style={{ flex: 1 }}
          >
            🤝 Collaborate
          </button>
        )}
        
        {influencer.contact_email && (
          <a 
            href={`mailto:${influencer.contact_email}?subject=Collaboration Request&body=Hello ${influencer.name}, I would like to discuss a collaboration opportunity.`} 
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            📧 Email
          </a>
        )}
      </div>

      {(influencer.instagram_url || influencer.youtube_url || influencer.tiktok_url || influencer.twitter_url || influencer.linkedin_url) && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
          <strong style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Social Links:</strong>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {influencer.instagram_url && (
              <a href={influencer.instagram_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>
                📷 Instagram
              </a>
            )}
            {influencer.youtube_url && (
              <a href={influencer.youtube_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>
                🎥 YouTube
              </a>
            )}
            {influencer.tiktok_url && (
              <a href={influencer.tiktok_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>
                🎵 TikTok
              </a>
            )}
            {influencer.twitter_url && (
              <a href={influencer.twitter_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>
                🐦 Twitter
              </a>
            )}
            {influencer.linkedin_url && (
              <a href={influencer.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>
                💼 LinkedIn
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerCard;