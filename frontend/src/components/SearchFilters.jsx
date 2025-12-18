import React from 'react';

const SearchFilters = ({ filters, onFilterChange, onSearch }) => {
  const platforms = ['instagram', 'youtube', 'tiktok', 'twitter'];
  const categories = ['fashion', 'fitness', 'tech', 'travel', 'gaming', 'food', 'lifestyle'];

  return (
    <div className="search-filters">
      <div className="filter-row">
        <div className="form-group">
          <label>Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or bio..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Platform</label>
          <select
            className="form-select"
            value={filters.platform || ''}
            onChange={(e) => onFilterChange('platform', e.target.value)}
          >
            <option value="">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            className="form-select"
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Min Followers</label>
          <input
            type="number"
            className="form-control"
            placeholder="0"
            value={filters.minFollowers || ''}
            onChange={(e) => onFilterChange('minFollowers', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Max Followers</label>
          <input
            type="number"
            className="form-control"
            placeholder="1000000"
            value={filters.maxFollowers || ''}
            onChange={(e) => onFilterChange('maxFollowers', e.target.value)}
          />
        </div>

        <div className="form-group">
          <button onClick={onSearch} className="btn btn-primary" style={{ height: '42px' }}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;