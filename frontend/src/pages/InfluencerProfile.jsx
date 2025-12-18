
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { influencerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { trackProfileView } from './InfluencerDashboard';

const InfluencerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [engagementMetrics, setEngagementMetrics] = useState({
    engagementRate: 0,
    avgViews: 0,
    audienceQuality: 0
  });

  useEffect(() => {
    loadInfluencer();
  }, [id]);

  useEffect(() => {
    if (influencer && user?.role === 'company') {
      trackProfileView(influencer.id);
    }
  }, [influencer, user]);

  useEffect(() => {
  
  const tempCompanyViewing = localStorage.getItem('tempCompanyViewing');
  if (tempCompanyViewing) {
    const viewingInfo = JSON.parse(tempCompanyViewing);
    const isExpired = Date.now() - viewingInfo.timestamp > 300000;
    if (isExpired) {
      localStorage.removeItem('tempCompanyViewing');
    }
  }
}, []);

  const loadInfluencer = async () => {
    try {
      const response = await influencerAPI.getById(id);
      const influencerData = response.data;
      setInfluencer(influencerData);
      calculateEngagementMetrics(influencerData);
    } catch (error) {
      console.error('Error loading influencer:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEngagementMetrics = (influencerData) => {
    if (!influencerData) return;

    const followers = influencerData.followers_count || 1;
    
    let engagementRate = 0;
    let avgViews = 0;
    let audienceQuality = 0;

    if (followers > 0) {
      switch (influencerData.platform) {
        case 'instagram':
          engagementRate = Math.min(10, Math.max(1, (followers / 10000) * 0.5));
          avgViews = Math.round(followers * 0.15);
          audienceQuality = Math.min(95, Math.max(60, 70 + (followers / 100000) * 10));
          break;
        case 'youtube':
          engagementRate = Math.min(8, Math.max(0.5, (followers / 50000) * 0.4));
          avgViews = Math.round(followers * 0.08);
          audienceQuality = Math.min(92, Math.max(65, 75 + (followers / 100000) * 8));
          break;
        case 'tiktok':
          engagementRate = Math.min(12, Math.max(2, (followers / 20000) * 0.6));
          avgViews = Math.round(followers * 0.25);
          audienceQuality = Math.min(88, Math.max(55, 65 + (followers / 50000) * 12));
          break;
        case 'twitter':
          engagementRate = Math.min(6, Math.max(0.3, (followers / 100000) * 0.3));
          avgViews = Math.round(followers * 0.05);
          audienceQuality = Math.min(90, Math.max(70, 75 + (followers / 200000) * 7));
          break;
        case 'linkedin':
          engagementRate = Math.min(4, Math.max(0.2, (followers / 50000) * 0.2));
          avgViews = Math.round(followers * 0.03);
          audienceQuality = Math.min(96, Math.max(80, 85 + (followers / 100000) * 6));
          break;
        default:
          engagementRate = 3.5;
          avgViews = Math.round(followers * 0.1);
          audienceQuality = 75;
      }
    }

    setEngagementMetrics({
      engagementRate: engagementRate.toFixed(1),
      avgViews: avgViews,
      audienceQuality: Math.round(audienceQuality)
    });
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

  const handleSendCollaboration = () => {
    if (!user || user.role !== 'company') {
      alert('Please login as a company to send collaboration requests');
      return;
    }
    
    const message = prompt(`Enter your collaboration message for ${influencer.name}:`);
    if (message && message.trim()) {
      const newRequest = {
        id: Date.now(),
        influencerId: influencer.id,
        influencerName: influencer.name,
        companyName: user.email.split('@')[0],
        status: 'pending',
        message: message.trim(),
        sentDate: new Date().toISOString().split('T')[0],
        platform: influencer.platform,
        category: influencer.category,
        budget: '$500 - $2,000',
        timeline: '2-4 weeks',
        receivedDate: new Date().toISOString().split('T')[0]
      };
      
      const companyRequests = JSON.parse(localStorage.getItem('companyCollaborationRequests') || '[]');
      const updatedCompanyRequests = [newRequest, ...companyRequests];
      localStorage.setItem('companyCollaborationRequests', JSON.stringify(updatedCompanyRequests));
      
      const influencerRequests = JSON.parse(localStorage.getItem(`influencerCollaborationRequests_${influencer.user_id}`) || '[]');
      const updatedInfluencerRequests = [newRequest, ...influencerRequests];
      localStorage.setItem(`influencerCollaborationRequests_${influencer.user_id}`, JSON.stringify(updatedInfluencerRequests));
      
      alert(`Collaboration request sent to ${influencer.name}!`);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!influencer) {
    return <div className="error">Influencer not found</div>;
  }

  return (
    <div>
      <div className="profile-header">
        <div className="container">
          <h1>{influencer.name}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            {getPlatformIcon(influencer.platform)} {influencer.platform.charAt(0).toUpperCase() + influencer.platform.slice(1)} • 
            {influencer.category.charAt(0).toUpperCase() + influencer.category.slice(1)} Influencer
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 0' }}>
        <div className="profile-content">
          <div>
            <div className="card">
              <h3>Audience Details</h3>
              <div style={{ marginTop: '15px' }}>
                <p><strong>Gender:</strong> {influencer.audience_gender || 'Not specified'}</p>
                <p><strong>Age Range:</strong> {influencer.audience_age_range || 'Not specified'}</p>
                <p><strong>Country:</strong> {influencer.audience_country || 'Not specified'}</p>
              </div>
            </div>

            <div className="card">
              <h3>Contact</h3>
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {influencer.contact_email && (
                  <a 
                    href={`mailto:${influencer.contact_email}?subject=Collaboration Request&body=Hello ${influencer.name}, I would like to discuss a collaboration opportunity.`} 
                    className="btn btn-primary"
                  >
                    📧 Send Email
                  </a>
                )}
                
                {user?.role === 'company' && (
                  <button 
                    onClick={handleSendCollaboration}
                    className="btn btn-success"
                  >
                    🤝 Send Collaboration Request
                  </button>
                )}
              </div>
            </div>

            <div className="card">
              <h3>Social Media Profiles</h3>
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {influencer.instagram_url && (
                  <a 
                    href={influencer.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  >
                    📷 Instagram
                  </a>
                )}
                {influencer.youtube_url && (
                  <a 
                    href={influencer.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  >
                    🎥 YouTube
                  </a>
                )}
                {influencer.tiktok_url && (
                  <a 
                    href={influencer.tiktok_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  >
                    🎵 TikTok
                  </a>
                )}
                {influencer.twitter_url && (
                  <a 
                    href={influencer.twitter_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  >
                    🐦 Twitter
                  </a>
                )}
                {influencer.linkedin_url && (
                  <a 
                    href={influencer.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  >
                    💼 LinkedIn
                  </a>
                )}
                {!influencer.instagram_url && !influencer.youtube_url && !influencer.tiktok_url && !influencer.twitter_url && !influencer.linkedin_url && (
                  <p style={{ textAlign: 'center', color: '#666' }}>No social media links available</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h2>About</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
                {influencer.bio || 'No bio provided.'}
              </p>
            </div>

            <div className="card">
              <h2>Statistics</h2>
              <div className="grid grid-3" style={{ textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                    {formatNumber(influencer.followers_count)}
                  </div>
                  <div>Followers</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                    {getPlatformIcon(influencer.platform)}
                  </div>
                  <div style={{ textTransform: 'capitalize' }}>{influencer.platform}</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6f42c1' }}>
                    {influencer.category.charAt(0).toUpperCase() + influencer.category.slice(1)}
                  </div>
                  <div>Category</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Engagement Metrics</h3>
              <div className="grid grid-3" style={{ textAlign: 'center', marginTop: '15px' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e91e63' }}>
                    {engagementMetrics.engagementRate}%
                  </div>
                  <div>Engagement Rate</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                    {formatNumber(engagementMetrics.avgViews)}
                  </div>
                  <div>Avg. Views</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                    {engagementMetrics.audienceQuality}%
                  </div>
                  <div>Audience Quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;