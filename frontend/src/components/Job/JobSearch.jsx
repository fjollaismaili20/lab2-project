import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const JobSearch = ({ onSearch, onClear, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryType, setSalaryType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Graphics & Design',
    'Mobile App Development',
    'Frontend Web Development',
    'Account & Finance',
    'Artificial Intelligence',
    'Video Animation',
    'MEAN Stack Development',
    'MEVN Stack Development',
    'Computer network',
    'Data Entry Operator'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = {
      search: searchTerm.trim(),
      category: category || undefined,
      company: company.trim() || undefined,
      country: country.trim() || undefined,
      salaryMin: salaryMin || undefined,
      salaryMax: salaryMax || undefined,
      salaryType: salaryType !== 'all' ? salaryType : undefined
    };
    
    // Remove undefined values
    Object.keys(searchParams).forEach(key => 
      searchParams[key] === undefined && delete searchParams[key]
    );
    
    onSearch(searchParams);
  };

  const handleClear = () => {
    setSearchTerm('');
    setCategory('');
    setCompany('');
    setCountry('');
    setSalaryMin('');
    setSalaryMax('');
    setSalaryType('all');
    onClear();
  };

  const hasActiveFilters = searchTerm || category || company || country || salaryMin || salaryMax || salaryType !== 'all';

  return (
    <div className="job-search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-bar">
          <div className="search-input-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search jobs by title, description, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            type="button" 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filters
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
          <button type="submit" className="search-btn" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Company</label>
                <input
                  type="text"
                  placeholder="Company name..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Country</label>
                <input
                  type="text"
                  placeholder="Country..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Salary Type</label>
                <select
                  value={salaryType}
                  onChange={(e) => setSalaryType(e.target.value)}
                >
                  <option value="all">All Salary Types</option>
                  <option value="fixed">Fixed Salary</option>
                  <option value="ranged">Ranged Salary</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Min Salary</label>
                <input
                  type="number"
                  placeholder="Min salary..."
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label>Max Salary</label>
                <input
                  type="number"
                  placeholder="Max salary..."
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button type="button" onClick={handleClear} className="clear-btn">
                <FaTimes />
                Clear All
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobSearch;
