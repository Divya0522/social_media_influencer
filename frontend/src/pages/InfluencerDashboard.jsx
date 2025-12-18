
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { influencerAPI, authAPI } from '../services/api';

export const trackProfileView = (influencerId) => {
  const currentViews = parseInt(localStorage.getItem(`profileViews_${influencerId}`) || '0');
  const newViews = currentViews + 1;
  localStorage.setItem(`profileViews_${influencerId}`, newViews.toString());
  
  return newViews;
};

const InfluencerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    profileViews: 0,
    collaborationRequests: 0,
    acceptedCollaborations: 0,
    profileCompletion: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'influencer') {
      navigate('/company-dashboard');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      let profileData;
      if (user?.profile) {
        profileData = user.profile;
        setProfile(profileData);
        setFormData(profileData);
      } else {
        const response = await authAPI.getProfile();
        if (response.data.profile) {
          profileData = response.data.profile;
          setProfile(profileData);
          setFormData(profileData);
          updateProfile(profileData);
        }
      }

      loadCollaborationRequests();
      
      if (profileData) {
        calculateDashboardStats(profileData);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborationRequests = () => {
    const savedRequests = localStorage.getItem(`influencerCollaborationRequests_${user?.id}`);
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      setCollaborationRequests(requests);
    }
  };

  const calculateDashboardStats = (profileData) => {
    if (!profileData) return;

    const requiredFields = [
      'name', 'platform', 'category', 'followers_count', 'bio'
    ];
    
    const filledFields = requiredFields.filter(field => {
      const value = profileData[field];
      return value !== null && value !== undefined && value !== '' && value !== 0;
    });
    
    const profileCompletion = Math.round((filledFields.length / requiredFields.length) * 100);

    const profileViews = parseInt(localStorage.getItem(`profileViews_${profileData.id}`) || '0');

    const collaborationRequestsCount = collaborationRequests.length;
    const acceptedCollaborationsCount = collaborationRequests.filter(req => req.status === 'accepted').length;

    setDashboardStats({
      profileViews,
      collaborationRequests: collaborationRequestsCount,
      acceptedCollaborations: acceptedCollaborationsCount,
      profileCompletion
    });
  };

  useEffect(() => {
    if (profile) {
      calculateDashboardStats(profile);
    }
  }, [collaborationRequests, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'followers_count' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdateLoading(true);

    try {
      const cleanedData = {
        name: formData.name || '',
        bio: formData.bio || '',
        platform: formData.platform || '',
        followers_count: formData.followers_count || 0,
        category: formData.category || '',
        audience_gender: formData.audience_gender || '',
        audience_age_range: formData.audience_age_range || '',
        audience_country: formData.audience_country || '',
        instagram_url: formData.instagram_url || '',
        youtube_url: formData.youtube_url || '',
        tiktok_url: formData.tiktok_url || '',
        twitter_url: formData.twitter_url || '',
        linkedin_url: formData.linkedin_url || '',
        contact_email: formData.contact_email || ''
      };

      const response = await influencerAPI.update(profile.id, cleanedData);
      const updatedProfile = response.data;
      setProfile(updatedProfile);
      updateProfile(updatedProfile);
      setEditing(false);
      
      calculateDashboardStats(updatedProfile);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.errors 
        ? error.response.data.errors.map(err => err.msg).join(', ')
        : error.response?.data?.message || 'Error updating profile';
      setError(errorMessage);
    } finally {
      setUpdateLoading(false);
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

  const handleCreateProfile = async () => {
    try {
      setUpdateLoading(true);
      const response = await influencerAPI.create(formData);
      const newProfile = response.data;
      setProfile(newProfile);
      updateProfile(newProfile);
      
      localStorage.setItem(`profileViews_${newProfile.id}`, '0');
      
      calculateDashboardStats(newProfile);
      
      alert('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      setError(error.response?.data?.message || 'Error creating profile');
    } finally {
      setUpdateLoading(false);
    }
  };

const handleCollaborationAction = (requestId, action) => {
  const updatedRequests = collaborationRequests.map(request => {
    if (request.id === requestId) {
      return { ...request, status: action };
    }
    return request;
  });
  
  setCollaborationRequests(updatedRequests);
  localStorage.setItem(`influencerCollaborationRequests_${user?.id}`, JSON.stringify(updatedRequests));
  
  const requestToUpdate = collaborationRequests.find(req => req.id === requestId);
  if (requestToUpdate && requestToUpdate.companyId) {
    const companyRequestsKey = `companyCollaborationRequests_${requestToUpdate.companyId}`;
    const companyRequests = JSON.parse(localStorage.getItem(companyRequestsKey) || '[]');
    const updatedCompanyRequests = companyRequests.map(req => 
      req.id === requestId ? { ...req, status: action } : req
    );
    localStorage.setItem(companyRequestsKey, JSON.stringify(updatedCompanyRequests));
  }
  
  alert(`Collaboration ${action} successfully!`);
};

  const getRecentActivity = () => {
    const activities = [];
    
    collaborationRequests.slice(0, 3).forEach(request => {
      activities.push({
        id: request.id,
        type: 'collaboration_request',
        message: `New request from ${request.companyName}`,
        date: request.receivedDate,
        status: request.status
      });
    });
    
    if (dashboardStats.profileViews > 0) {
      activities.push({
        id: 'profile_view',
        type: 'profile_view',
        message: 'Your profile was viewed by companies',
        date: new Date().toISOString().split('T')[0],
        status: 'info'
      });
    }
    
    if (dashboardStats.profileCompletion === 100) {
      activities.push({
        id: 'profile_complete',
        type: 'profile_complete',
        message: 'Profile completed! You are now visible to companies',
        date: new Date().toISOString().split('T')[0],
        status: 'success'
      });
    }
    
    return activities.slice(0, 3);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!profile) {
    return (
      <div className="container dashboard">
        <h1>Influencer Dashboard</h1>
        {error && <div className="error">{error}</div>}
        <div className="card">
          <h3>Complete Your Profile</h3>
          <p>Create your influencer profile to start appearing in brand searches and get collaboration opportunities.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h4>Profile Information</h4>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateProfile(); }}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Primary Platform *</label>
                  <select
                    name="platform"
                    className="form-select"
                    value={formData.platform || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Platform</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Bio *</label>
                <textarea
                  name="bio"
                  className="form-control"
                  rows="4"
                  placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                  value={formData.bio || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="fashion">Fashion</option>
                      <option value="fitness">Fitness</option>
                      <option value="tech">Tech</option>
                      <option value="travel">Travel</option>
                      <option value="gaming">Gaming</option>
                      <option value="food">Food</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="beauty">Beauty</option>
                      <option value="business">Business</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Followers Count *</label>
                    <input
                      type="number"
                      name="followers_count"
                      className="form-control"
                      placeholder="50000"
                      value={formData.followers_count || ''}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      className="form-control"
                      placeholder="for collaboration inquiries"
                      value={formData.contact_email || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Creating Profile...' : 'Create Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container dashboard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>Influencer Dashboard</h1>
            <p style={{ color: '#666' }}>Manage your profile and collaborations</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                setActiveTab('profile');
                setEditing(true);
              }}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="dashboard-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('collaborations')}
            className={`tab-button ${activeTab === 'collaborations' ? 'active' : ''}`}
          >
            🤝 Collaboration Requests ({dashboardStats.collaborationRequests})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-4" style={{ marginBottom: '30px' }}>
              <div className="card text-center">
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                  {formatNumber(dashboardStats.profileViews)}
                </div>
                <div>Profile Views</div>
              </div>
              <div className="card text-center">
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                  {dashboardStats.collaborationRequests}
                </div>
                <div>Collaboration Requests</div>
              </div>
              <div className="card text-center">
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6f42c1' }}>
                  {dashboardStats.acceptedCollaborations}
                </div>
                <div>Accepted</div>
              </div>
              <div className="card text-center">
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fd7e14' }}>
                  {dashboardStats.profileCompletion}%
                </div>
                <div>Profile Completion</div>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h3>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-primary"
                  >
                    Update Profile
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('profile');
                      setEditing(true);
                    }}
                    className="btn btn-secondary"
                  >
                    Edit Social Links
                  </button>
                  <button 
                    onClick={() => setActiveTab('collaborations')}
                    className="btn btn-info"
                  >
                    View Collaborations
                  </button>
                </div>
              </div>

              <div className="card">
                <h3>Recent Activity</h3>
                <div style={{ marginTop: '15px' }}>
                  {getRecentActivity().length > 0 ? (
                    getRecentActivity().map(activity => (
                      <div key={activity.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                        <strong>{activity.message}</strong>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                      No recent activity. Complete your profile to get noticed!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          editing ? (
            <div className="card">
              <h2>Edit Profile</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Platform *</label>
                    <select
                      name="platform"
                      className="form-select"
                      value={formData.platform || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio *</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    rows="4"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="fashion">Fashion</option>
                      <option value="fitness">Fitness</option>
                      <option value="tech">Tech</option>
                      <option value="travel">Travel</option>
                      <option value="gaming">Gaming</option>
                      <option value="food">Food</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="beauty">Beauty</option>
                      <option value="business">Business</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Followers Count *</label>
                    <input
                      type="number"
                      name="followers_count"
                      className="form-control"
                      value={formData.followers_count || ''}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      className="form-control"
                      value={formData.contact_email || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h4 style={{ margin: '25px 0 15px 0' }}>Social Media Links</h4>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input
                      type="url"
                      name="instagram_url"
                      className="form-control"
                      placeholder="https://instagram.com/yourusername"
                      value={formData.instagram_url || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>YouTube URL</label>
                    <input
                      type="url"
                      name="youtube_url"
                      className="form-control"
                      placeholder="https://youtube.com/c/yourchannel"
                      value={formData.youtube_url || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>TikTok URL</label>
                    <input
                      type="url"
                      name="tiktok_url"
                      className="form-control"
                      placeholder="https://tiktok.com/@yourusername"
                      value={formData.tiktok_url || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Twitter URL</label>
                    <input
                      type="url"
                      name="twitter_url"
                      className="form-control"
                      placeholder="https://twitter.com/yourusername"
                      value={formData.twitter_url || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      name="linkedin_url"
                      className="form-control"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedin_url || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h4 style={{ margin: '25px 0 15px 0' }}>Audience Demographics</h4>
                <div className="grid grid-3">
                  <div className="form-group">
                    <label>Audience Gender</label>
                    <select
                      name="audience_gender"
                      className="form-select"
                      value={formData.audience_gender || ''}
                      onChange={handleChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Audience Age Range</label>
                    <input
                      type="text"
                      name="audience_age_range"
                      className="form-control"
                      placeholder="18-35"
                      value={formData.audience_age_range || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Audience Country</label>
                    <input
                      type="text"
                      name="audience_country"
                      className="form-control"
                      value={formData.audience_country || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="profile-content">
              <div>
                <div className="card">
                  <h3>Profile Overview</h3>
                  <div style={{ marginTop: '15px' }}>
                    <p><strong>Platform:</strong> {profile.platform}</p>
                    <p><strong>Category:</strong> {profile.category}</p>
                    <p><strong>Followers:</strong> {formatNumber(profile.followers_count)}</p>
                    <p><strong>Status:</strong> 
                      <span style={{ 
                        color: profile.is_approved ? '#28a745' : '#dc3545',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {profile.is_approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="card">
                  <h3>Audience Details</h3>
                  <div style={{ marginTop: '15px' }}>
                    <p><strong>Gender:</strong> {profile.audience_gender || 'Not specified'}</p>
                    <p><strong>Age Range:</strong> {profile.audience_age_range || 'Not specified'}</p>
                    <p><strong>Country:</strong> {profile.audience_country || 'Not specified'}</p>
                  </div>
                </div>

                <div className="card">
                  <h3>Social Media Links</h3>
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {profile.instagram_url && (
                      <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        Instagram
                      </a>
                    )}
                    {profile.youtube_url && (
                      <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        YouTube
                      </a>
                    )}
                    {profile.tiktok_url && (
                      <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        TikTok
                      </a>
                    )}
                    {profile.twitter_url && (
                      <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        Twitter
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        LinkedIn
                      </a>
                    )}
                    {!profile.instagram_url && !profile.youtube_url && !profile.tiktok_url && !profile.twitter_url && !profile.linkedin_url && (
                      <p style={{ textAlign: 'center', color: '#666' }}>No social media links added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="card">
                  <h2>{profile.name}</h2>
                  <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '20px' }}>
                    {profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)} • 
                    {profile.category.charAt(0).toUpperCase() + profile.category.slice(1)} Influencer
                  </p>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h4>About Me</h4>
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: '#555' }}>
                      {profile.bio || 'No bio provided.'}
                    </p>
                  </div>

                  {profile.contact_email && (
                    <div>
                      <h4>Contact Information</h4>
                      <p>Email: {profile.contact_email}</p>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3>Profile Visibility</h3>
                  <p>Your profile is {profile.is_approved ? 'visible to companies' : 'under review'}.</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'collaborations' && (
          <div className="card">
            <h2>Collaboration Requests</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Manage collaboration requests from companies
            </p>
            
            {collaborationRequests.length === 0 ? (
              <div className="text-center" style={{ padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤝</div>
                <h3>No collaboration requests yet</h3>
                <p>When companies send you collaboration requests, they will appear here.</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  Complete your profile and add social media links to increase your visibility!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {collaborationRequests.map(request => (
                  <div key={request.id} className="card" style={{ 
                    borderLeft: `4px solid ${
                      request.status === 'accepted' ? '#28a745' : 
                      request.status === 'rejected' ? '#dc3545' : 
                      '#ffc107'
                    }` 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, color: '#2c3e50' }}>{request.companyName}</h4>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: 
                              request.status === 'accepted' ? '#28a745' : 
                              request.status === 'rejected' ? '#dc3545' : '#ffc107',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        
                        <p style={{ margin: '5px 0', color: '#555', fontStyle: 'italic' }}>
                          "{request.message}"
                        </p>
                        
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#666', marginTop: '10px', flexWrap: 'wrap' }}>
                          <span><strong>Budget:</strong> {request.budget}</span>
                          <span><strong>Timeline:</strong> {request.timeline}</span>
                          <span><strong>Received:</strong> {request.receivedDate}</span>
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                          <button 
                            onClick={() => handleCollaborationAction(request.id, 'accepted')}
                            className="btn btn-success btn-sm"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleCollaborationAction(request.id, 'rejected')}
                            className="btn btn-danger btn-sm"
                          >
                            Decline
                          </button>
                          <button className="btn btn-secondary btn-sm">
                            Message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-4" style={{ marginTop: '30px' }}>
              <div className="card text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                  {dashboardStats.collaborationRequests}
                </div>
                <div>Total Requests</div>
              </div>
              <div className="card text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                  {collaborationRequests.filter(r => r.status === 'pending').length}
                </div>
                <div>Pending</div>
              </div>
              <div className="card text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                  {dashboardStats.acceptedCollaborations}
                </div>
                <div>Accepted</div>
              </div>
              <div className="card text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                  {collaborationRequests.filter(r => r.status === 'rejected').length}
                </div>
                <div>Declined</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default InfluencerDashboard;