
import React, { useState, useEffect } from 'react';
import { companyAPI, influencerAPI } from '../services/api';
import InfluencerCard from '../components/InfluencerCard';
import SearchFilters from '../components/SearchFilters';
import { useAuth } from '../context/AuthContext';
import { trackProfileView } from './InfluencerDashboard';
import { useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [collaborationRequests, setCollaborationRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, [appliedFilters]);

  useEffect(() => {
    if (user?.role === 'company' && influencers.length > 0) {
      influencers.forEach(influencer => {
        trackProfileView(influencer.id);
      });
    }
  }, [influencers, user]);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [influencersResponse, favoritesResponse] = await Promise.all([
        influencerAPI.getAll(appliedFilters),
        companyAPI.getFavorites()
      ]);
      setInfluencers(influencersResponse.data);
      setFavorites(favoritesResponse.data);
      
      const companyRequestsKey = `companyCollaborationRequests_${user?.id}`;
      const savedRequests = localStorage.getItem(companyRequestsKey);
      if (savedRequests) {
        setCollaborationRequests(JSON.parse(savedRequests));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleSendCollaboration = (influencerId, influencerName, platform, category) => {
    const message = prompt(`Enter your collaboration message for ${influencerName}:`);
    if (message && message.trim()) {
      const requestId = Date.now();
      const newRequest = {
        id: requestId,
        influencerId,
        influencerName,
        companyId: user.id,
        companyName: user.email.split('@')[0],
        companyEmail: user.email,
        status: 'pending',
        message: message.trim(),
        sentDate: new Date().toISOString().split('T')[0],
        platform,
        category,
        budget: '$500 - $2,000',
        timeline: '2-4 weeks'
      };
      
      // Save to company's requests
      const companyRequestsKey = `companyCollaborationRequests_${user.id}`;
      const updatedCompanyRequests = [newRequest, ...collaborationRequests];
      setCollaborationRequests(updatedCompanyRequests);
      localStorage.setItem(companyRequestsKey, JSON.stringify(updatedCompanyRequests));
      
      // Save to influencer's requests with same ID for tracking
      const influencerRequest = {
        ...newRequest,
        receivedDate: new Date().toISOString().split('T')[0]
      };
      
      const influencerRequestsKey = `influencerCollaborationRequests_${influencerId}`;
      const existingInfluencerRequests = JSON.parse(localStorage.getItem(influencerRequestsKey) || '[]');
      const updatedInfluencerRequests = [influencerRequest, ...existingInfluencerRequests];
      localStorage.setItem(influencerRequestsKey, JSON.stringify(updatedInfluencerRequests));
      
      alert(`Collaboration request sent to ${influencerName}!`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#ffc107', text: 'Pending' },
      accepted: { color: '#28a745', text: 'Accepted' },
      rejected: { color: '#dc3545', text: 'Rejected' },
      completed: { color: '#007bff', text: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span style={{
        padding: '4px 8px',
        backgroundColor: config.color,
        color: 'white',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
      }}>
        {config.text}
      </span>
    );
  };

  const handleFollowUp = (requestId, influencerName, companyEmail) => {
    const subject = `Follow-up: Collaboration Request for ${influencerName}`;
    const body = `Hello ${influencerName},\n\nI wanted to follow up on my previous collaboration request. Please let me know if you're interested in working together.\n\nBest regards,\n${companyEmail.split('@')[0]}`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleViewProfile = (influencerId) => {
 
  const companyViewingInfo = {
    companyId: user.id,
    timestamp: Date.now()
  };
  localStorage.setItem('tempCompanyViewing', JSON.stringify(companyViewingInfo));
 
  navigate(`/influencers/${influencerId}`);
};

  const updateRequestStatus = (requestId, newStatus) => {
    const updatedRequests = collaborationRequests.map(request => 
      request.id === requestId ? { ...request, status: newStatus } : request
    );
    
    setCollaborationRequests(updatedRequests);
    localStorage.setItem(`companyCollaborationRequests_${user.id}`, JSON.stringify(updatedRequests));
    
    // Also update in influencer's storage to keep sync
    const requestToUpdate = collaborationRequests.find(req => req.id === requestId);
    if (requestToUpdate) {
      const influencerRequestsKey = `influencerCollaborationRequests_${requestToUpdate.influencerId}`;
      const influencerRequests = JSON.parse(localStorage.getItem(influencerRequestsKey) || '[]');
      const updatedInfluencerRequests = influencerRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      );
      localStorage.setItem(influencerRequestsKey, JSON.stringify(updatedInfluencerRequests));
    }
  };

  const handleStartCollaboration = (requestId) => {
    updateRequestStatus(requestId, 'completed');
    alert('Collaboration started! Marked as completed.');
  };

  const handleViewResults = (requestId, influencerName) => {
    alert(`Viewing results for collaboration with ${influencerName}`);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Company Dashboard</h1>
          <p style={{ color: '#666' }}>Find and collaborate with the best influencers</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge" style={{ background: '#007bff', color: 'white', padding: '5px 10px', borderRadius: '15px' }}>
            {influencers.length} Influencers
          </span>
          <span className="badge" style={{ background: '#28a745', color: 'white', padding: '5px 10px', borderRadius: '15px' }}>
            {favorites.length} Favorites
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('discover')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'discover' ? '#007bff' : 'transparent',
            color: activeTab === 'discover' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          🔍 Discover Influencers
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'favorites' ? '#007bff' : 'transparent',
            color: activeTab === 'favorites' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          ⭐ My Favorites ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('collaborations')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'collaborations' ? '#007bff' : 'transparent',
            color: activeTab === 'collaborations' ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          🤝 Collaboration Requests ({collaborationRequests.length})
        </button>
      </div>

      {activeTab === 'discover' && (
        <div>
          <SearchFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />
          
          <div className="grid grid-2">
            {influencers.map(influencer => (
              <InfluencerCard 
                key={influencer.id} 
                influencer={influencer} 
                onSendCollaboration={() => handleSendCollaboration(
                  influencer.id, 
                  influencer.name,
                  influencer.platform,
                  influencer.category
                )}
              />
            ))}
          </div>

          {influencers.length === 0 && (
            <div className="text-center" style={{ padding: '40px' }}>
              <h3>No influencers found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⭐</div>
              <h3>No favorites yet</h3>
              <p>Start exploring influencers and add them to your favorites!</p>
              <button 
                onClick={() => setActiveTab('discover')}
                className="btn btn-primary mt-2"
              >
                Discover Influencers
              </button>
            </div>
          ) : (
            <div className="grid grid-2">
              {favorites.map(influencer => (
                <InfluencerCard 
                  key={influencer.id} 
                  influencer={influencer} 
                  onSendCollaboration={() => handleSendCollaboration(
                    influencer.id, 
                    influencer.name,
                    influencer.platform,
                    influencer.category
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'collaborations' && (
        <div>
          <div className="card">
            <h2>Collaboration Requests</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Track all your collaboration requests and their status
            </p>
            
            {collaborationRequests.length === 0 ? (
              <div className="text-center" style={{ padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤝</div>
                <h3>No collaboration requests yet</h3>
                <p>Start sending collaboration requests to influencers you're interested in!</p>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="btn btn-primary mt-2"
                >
                  Discover Influencers
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {collaborationRequests.map(request => (
                    <div key={request.id} className="card" style={{ 
                      borderLeft: `4px solid ${
                        request.status === 'accepted' ? '#28a745' : 
                        request.status === 'rejected' ? '#dc3545' : 
                        request.status === 'completed' ? '#007bff' : '#ffc107'
                      }` 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0 }}>{request.influencerName}</h4>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <p style={{ margin: '5px 0', color: '#555', fontStyle: 'italic' }}>
                            "{request.message}"
                          </p>
                          
                          <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#666', marginTop: '10px', flexWrap: 'wrap' }}>
                            <span>Platform: <strong>{request.platform}</strong></span>
                            <span>Category: <strong>{request.category}</strong></span>
                            <span>Budget: <strong>{request.budget}</strong></span>
                            <span>Timeline: <strong>{request.timeline}</strong></span>
                            <span>Sent: <strong>{request.sentDate}</strong></span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                          {request.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleFollowUp(request.id, request.influencerName, request.companyEmail)}
                                className="btn btn-success btn-sm"
                              >
                                Follow Up
                              </button>
                              <button 
                                onClick={() => handleViewProfile(request.influencerId)}
                                className="btn btn-secondary btn-sm"
                              >
                                View Profile
                              </button>
                            </>
                          )}
                          {request.status === 'accepted' && (
                            <button 
                              onClick={() => handleStartCollaboration(request.id)}
                              className="btn btn-primary btn-sm"
                            >
                              Start Collaboration
                            </button>
                          )}
                          {request.status === 'completed' && (
                            <button 
                              onClick={() => handleViewResults(request.id, request.influencerName)}
                              className="btn btn-info btn-sm"
                            >
                              View Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-4" style={{ marginTop: '30px' }}>
                  <div className="card text-center">
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                      {collaborationRequests.length}
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
                      {collaborationRequests.filter(r => r.status === 'accepted').length}
                    </div>
                    <div>Accepted</div>
                  </div>
                  <div className="card text-center">
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                      {collaborationRequests.filter(r => r.status === 'rejected').length}
                    </div>
                    <div>Rejected</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;