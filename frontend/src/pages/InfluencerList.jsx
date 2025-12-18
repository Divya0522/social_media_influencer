import React, { useState, useEffect } from 'react';
import { influencerAPI } from '../services/api';
import InfluencerCard from '../components/InfluencerCard';
import SearchFilters from '../components/SearchFilters';

const InfluencerList = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    loadInfluencers();
  }, [appliedFilters]);

  const loadInfluencers = async () => {
    try {
      setLoading(true);
      const response = await influencerAPI.getAll(appliedFilters);
      setInfluencers(response.data);
    } catch (error) {
      console.error('Error loading influencers:', error);
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

  if (loading) {
    return <div className="loading">Loading influencers...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Find Influencers</h1>
      <p>Discover the perfect influencers for your brand campaigns</p>

      <SearchFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      <div className="grid grid-2">
        {influencers.map(influencer => (
          <InfluencerCard key={influencer.id} influencer={influencer} />
        ))}
      </div>

      {influencers.length === 0 && (
        <div className="text-center" style={{ padding: '40px' }}>
          <h3>No influencers found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
};

export default InfluencerList;