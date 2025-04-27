import React, { useState, useRef, useEffect } from 'react';
import { 
  regionStatistics, 
  regionToStatisticalAreas, 
  statisticalAreaStatistics,
  divisionalGroupToStatisticalAreas
} from '../utils/regionMapping';
import BarChart from './BarChart';
import SubdivisionFilter from './SubdivisionFilter';
import './RegionDetailView.css';
import { FunnelDataProvider } from './sa_view_components/FunnelDataContext';

// List of non-virgin MSAs for each region
const nonVirginMSAs = {
  'West': new Set([
    'Amarillo',
    'Boulder',
    'Broomfield',
    'Casper',
    'Chicago–Naperville–Elgin',
    'Cleveland–Elyria',
    'Clovis Micropolitan Statistical Area',
    'Colorado Springs',
    'Corpus Christi',
    'Dallas–Fort Worth–Arlington',
    'Denver-Aurora-Lakewood',
    'El Paso',
    'Fort Collins',
    'Fort Morgan Micropolitan Statistical Area',
    'Greeley',
    'Laredo',
    'Las Vegas-Henderson-Paradise',
    'Levelland Micropolitan Statistical Area',
    'Los Angeles-Long Beach-Anaheim',
    'Lubbock',
    'McAllen-Edinburg-Mission',
    'New York–Newark–Jersey City',
    'Odessa',
    'Ogden-Clearfield',
    'Pampa Micropolitan Statistical Area',
    'Phoenix-Mesa-Scottsdale',
    'Pueblo',
    'Salt Lake City',
    'Santa Barbara',
    'Santa Maria-Santa Barbara',
    'St. George',
    'Sterling Micropolitan Statistical Area'
  ]),
  'East Central': new Set([
    'Bryan-College Station',
    'Chicago-Naperville-Elgin',
    'Clarksville',
    'Cleveland-Elyria',
    'Cleveland',
    'Dallas-Fort Worth-Arlington',
    'Detroit-Warren-Dearborn',
    'Detroit-Warren-Flint',
    'Houston-The Woodlands-Sugar Land',
    'Indianapolis-Carmel-Anderson',
    'Jackson',
    'Lafayette',
    'Los Angeles-Long Beach-Anaheim',
    'McAllen-Edinburg-Mission',
    'Minneapolis-St. Paul-Bloomington',
    'Monroe',
    'Nashville-Davidson-Murfreesboro-Franklin',
    'New York-Newark-Jersey City',
    'Oklahoma City',
    'Philadelphia-Camden-Wilmington',
    'Pittsburgh',
    'Port St. Lucie',
    'Salt Lake City',
    'San Antonio-New Braunfels',
    'Sebastian-Vero Beach',
    'St. Louis',
    'Wichita Falls'
  ]),
  'Central': new Set([
    'Alexandria',
    'Alice Micropolitan Statistical Area',
    'Ardmore Micropolitan Statistical Area',
    'Ashtabula',
    'Austin-Round Rock',
    'Benavides Micropolitan Statistical Area',
    'Brownsville–Harlingen',
    'Brownwood Micropolitan Statistical Area',
    'Bryan-College Station',
    'Carlsbad Micropolitan Statistical Area',
    'Casper',
    'Chicago-Naperville-Elgin',
    'Cleveland',
    'Cleveland-Elyria',
    'Corpus Christi',
    'Dallas-Fort Worth-Arlington',
    'Del Rio Micropolitan Statistical Area',
    'Denver-Aurora-Lakewood',
    'Durant Micropolitan Statistical Area',
    'Eagle Pass Micropolitan Statistical Area',
    'El Paso',
    'Fort Worth-Arlington',
    'Houston-The Woodlands-Sugar Land',
    'Huntsville Micropolitan Statistical Area',
    'Jackson',
    'Kerrville Micropolitan Statistical Area',
    'Killeen-Temple',
    'Lafayette-Opelousas-Morgan City Combined Statistical Area',
    'Lafayette',
    'Lake Charles',
    'Laredo',
    'Laredo Micropolitan Statistical Area',
    'Lawton',
    'Livingston Micropolitan Statistical Area',
    'Los Angeles-Long Beach-Anaheim',
    'McAllen-Edinburg-Mission',
    'Minneapolis-St. Paul-Bloomington',
    'Monroe',
    'Nacogdoches Micropolitan Statistical Area',
    'Natchez Micropolitan Statistical Area',
    'Odessa',
    'Ogden-Clearfield',
    'Oklahoma City',
    'Palestine Micropolitan Statistical Area',
    'Paris Micropolitan Statistical Area',
    'Philadelphia-Camden-Wilmington',
    'Pittsburgh',
    'Salt Lake City',
    'San Antonio-New Braunfels',
    'San Marcos',
    'Sarasota-Bradenton-Venice',
    'Sebastian-Vero Beach',
    'Sherman-Denison',
    'St. George',
    'St. Louis',
    'Sweetwater Micropolitan Statistical Area',
    'Tyler',
    'Victoria',
    'Waco',
    'Wichita Falls',
    'Youngstown-Warren-Boardman'
  ]),
  'East': new Set([]) // Empty set for East region as all areas are virgin
};

const RegionDetailView = ({ divisionalGroup, regions, statisticalAreas, onBack, onSelectStatisticalArea }) => {
  const [activeTab, setActiveTab] = useState('non-virgin');
  const [selectedMetric, setSelectedMetric] = useState('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSortOrder, setSortOrder] = useState('desc');
  const [sortField, setSortField] = useState('patients');
  const [selectedFilters, setSelectedFilters] = useState({
    size: [], // small, medium, large
    agencies: [], // low, medium, high
    outcomes: [], // low, medium, high
  });
  const [subdivisionFilteredMSAs, setSubdivisionFilteredMSAs] = useState(null);
  const filterRef = useRef(null);
  const printRef = useRef(null);
  
  // Use the statisticalAreas prop directly
  const allStatisticalAreas = statisticalAreas;

  // Close filter panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSubdivisionFilterChange = (filteredMSAs) => {
    setSubdivisionFilteredMSAs(filteredMSAs);
  };
  
  // Filter statistical areas based on search term, tab, and advanced filters
  const filteredAreas = allStatisticalAreas.filter(area => {
    const matchesSearch = area.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    const regionNonVirginMSAs = nonVirginMSAs[divisionalGroup] || new Set();
    
    // First filter by tab (virgin/non-virgin/all)
    let matchesTab = true;
    switch (activeTab) {
      case 'non-virgin':
        matchesTab = regionNonVirginMSAs.has(area);
        break;
      case 'virgin':
        matchesTab = !regionNonVirginMSAs.has(area);
        break;
      case 'all':
        matchesTab = true;
        break;
      default:
        matchesTab = true;
    }

    if (!matchesTab) return false;
    
    // Apply subdivision filter if active
    if (subdivisionFilteredMSAs !== null && !subdivisionFilteredMSAs.includes(area)) {
      return false;
    }

    // Then apply advanced filters
    if (selectedFilters.size.length > 0) {
      const patients = statisticalAreaStatistics[area]?.patients || 0;
      const isSmall = patients < 5000;
      const isMedium = patients >= 5000 && patients < 20000;
      const isLarge = patients >= 20000;

      if (
        (selectedFilters.size.includes('small') && !isSmall) &&
        (selectedFilters.size.includes('medium') && !isMedium) &&
        (selectedFilters.size.includes('large') && !isLarge)
      ) {
        return false;
      }
    }

    if (selectedFilters.agencies.length > 0) {
      const agencies = statisticalAreaStatistics[area]?.agencies || 0;
      const isLow = agencies < 50;
      const isMedium = agencies >= 50 && agencies < 150;
      const isHigh = agencies >= 150;

      if (
        (selectedFilters.agencies.includes('low') && !isLow) &&
        (selectedFilters.agencies.includes('medium') && !isMedium) &&
        (selectedFilters.agencies.includes('high') && !isHigh)
      ) {
        return false;
      }
    }

    if (selectedFilters.outcomes.length > 0) {
      const outcomes = statisticalAreaStatistics[area]?.activeOutcomes || 0;
      const isLow = outcomes < 1000;
      const isMedium = outcomes >= 1000 && outcomes < 5000;
      const isHigh = outcomes >= 5000;

      if (
        (selectedFilters.outcomes.includes('low') && !isLow) &&
        (selectedFilters.outcomes.includes('medium') && !isMedium) &&
        (selectedFilters.outcomes.includes('high') && !isHigh)
      ) {
        return false;
      }
    }
    
    return true;
  });

  // Sort the filtered areas
  const sortedAreas = [...filteredAreas].sort((a, b) => {
    const valueA = statisticalAreaStatistics[a]?.[sortField] || 0;
    const valueB = statisticalAreaStatistics[b]?.[sortField] || 0;
    
    if (selectedSortOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Calculate totals for this divisional group based on statistical areas
  const areaTotals = allStatisticalAreas.reduce((acc, area) => {
    if (statisticalAreaStatistics[area]) {
      acc.patients += statisticalAreaStatistics[area].patients || 0;
      acc.physicianGroups += statisticalAreaStatistics[area].physicianGroups || 0;
      acc.agencies += statisticalAreaStatistics[area].agencies || 0;
      acc.activeOutcomes += statisticalAreaStatistics[area].activeOutcomes || 0;
    }
    return acc;
  }, { patients: 0, physicianGroups: 0, agencies: 0, activeOutcomes: 0 });

  // Prepare data for bar chart of statistical areas
  const areaChartData = allStatisticalAreas.map(area => ({
    name: area,
    patients: statisticalAreaStatistics[area]?.patients || 0,
    physicianGroups: statisticalAreaStatistics[area]?.physicianGroups || 0,
    agencies: statisticalAreaStatistics[area]?.agencies || 0,
    activeOutcomes: statisticalAreaStatistics[area]?.activeOutcomes || 0
  })).sort((a, b) => b[selectedMetric] - a[selectedMetric]); // Sort by selected metric, descending

  // Get color for metric cards
  const getMetricColor = (metric) => {
    const colors = {
      patients: '#4F46E5',
      physicianGroups: '#0EA5E9',
      agencies: '#10B981',
      activeOutcomes: '#F59E0B'
    };
    return colors[metric] || '#6B7280';
  };

  // Labels for the metrics
  const metricLabels = {
    patients: 'Patients',
    physicianGroups: 'Physician Groups',
    agencies: 'Agencies',
    activeOutcomes: 'Active Reactive Outcomes'
  };
  
  // Handle printing the data
  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${divisionalGroup} Division Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4F46E5; font-size: 24px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #E5E7EB; padding: 10px; text-align: left; }
            th { background-color: #F9FAFB; font-weight: bold; }
            .summary { margin-bottom: 30px; display: flex; gap: 20px; flex-wrap: wrap; }
            .metric { background: #F9FAFB; padding: 15px; border-radius: 8px; min-width: 180px; }
            .metric h3 { margin: 0 0 10px 0; font-size: 14px; color: #4B5563; }
            .metric-value { font-size: 22px; font-weight: bold; margin: 0; }
            .footer { margin-top: 40px; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${divisionalGroup} Division Healthcare Report</h1>
          
          <div class="summary">
            ${Object.entries(areaTotals).map(([key, value]) => `
              <div class="metric">
                <h3>${metricLabels[key]}</h3>
                <p class="metric-value">${formatNumber(value)}</p>
              </div>
            `).join('')}
          </div>
          
          <h2>Statistical Areas in ${divisionalGroup} Division</h2>
          <table>
            <thead>
              <tr>
                <th>Statistical Area</th>
                <th>Patients</th>
                <th>Physician Groups</th>
                <th>Agencies</th>
                <th>Active Outcomes</th>
              </tr>
            </thead>
            <tbody>
              ${allStatisticalAreas.map((area, index) => `
                <tr data-key="${area}-${index}">
                  <td>${area}</td>
                  <td>${formatNumber(statisticalAreaStatistics[area]?.patients || 0)}</td>
                  <td>${formatNumber(statisticalAreaStatistics[area]?.physicianGroups || 0)}</td>
                  <td>${formatNumber(statisticalAreaStatistics[area]?.agencies || 0)}</td>
                  <td>${formatNumber(statisticalAreaStatistics[area]?.activeOutcomes || 0)}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold; background-color: #EEF2FF;">
                <td>Totals</td>
                <td>${formatNumber(areaTotals.patients)}</td>
                <td>${formatNumber(areaTotals.physicianGroups)}</td>
                <td>${formatNumber(areaTotals.agencies)}</td>
                <td>${formatNumber(areaTotals.activeOutcomes)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Healthcare Services Dashboard - Data source: US Census TIGER/Line Shapefiles 2023</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for resources to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Handle downloading as CSV
  const handleDownloadCSV = () => {
    // Create CSV content
    let csvContent = "Statistical Area,Patients,Physician Groups,Agencies,Active Outcomes\n";
    
    // Add data for each statistical area
    allStatisticalAreas.forEach(area => {
      const stats = statisticalAreaStatistics[area] || {};
      csvContent += `"${area}",${stats.patients || 0},${stats.physicianGroups || 0},${stats.agencies || 0},${stats.activeOutcomes || 0}\n`;
    });
    
    // Add totals row
    csvContent += `"TOTALS",${areaTotals.patients},${areaTotals.physicianGroups},${areaTotals.agencies},${areaTotals.activeOutcomes}\n`;
    
    // Create downloadable file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${divisionalGroup}_Division_Data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle statistical area click
  const handleStatisticalAreaClick = (areaName) => {
    // Wrap the call in the FunnelDataProvider
    onSelectStatisticalArea(areaName);
  };

  // Toggle a filter selection
  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => {
      const newFilters = {...prev};
      
      if (newFilters[category].includes(value)) {
        // Remove filter if already selected
        newFilters[category] = newFilters[category].filter(v => v !== value);
      } else {
        // Add filter if not already selected
        newFilters[category] = [...newFilters[category], value];
      }
      
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({
      size: [],
      agencies: [],
      outcomes: []
    });
    setSearchTerm('');
    setSortOrder('desc');
    setSortField('patients');
  };

  // Get count of active filters
  const getActiveFilterCount = () => {
    return selectedFilters.size.length + 
           selectedFilters.agencies.length + 
           selectedFilters.outcomes.length +
           (searchTerm ? 1 : 0);
  };

  // Handle sort selection
  const handleSortChange = (field) => {
    if (sortField === field) {
      // If already sorting by this field, toggle the order
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // If changing field, default to descending order
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="region-detail-view" ref={printRef}>
      <div className="region-header">
        <div className="region-header-top">
          <button className="back-button" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
          <h2>{divisionalGroup} Division</h2>
        </div>
      </div>
      
      {/* Add Subdivision Filter component */}
      <SubdivisionFilter 
        divisionalGroup={divisionalGroup}
        onSubdivisionFilterChange={handleSubdivisionFilterChange}
      />
      
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Overview
        </button>
        <h2>{divisionalGroup} Division Details</h2>
        <div className="detail-actions">
          <button className="action-button" onClick={handlePrint}>
            <span className="action-icon">🖨️</span>
            Print Report
          </button>
          <button className="action-button" onClick={handleDownloadCSV}>
            <span className="action-icon">📊</span>
            Export CSV
          </button>
        </div>
      </div>
      
      <div ref={printRef}>
        {/* Summary cards */}
        <div className="metric-cards">
          {Object.entries(areaTotals).map(([key, value]) => (
            <div 
              key={key} 
              className={`metric-card ${selectedMetric === key ? 'metric-card-active' : ''}`}
              onClick={() => setSelectedMetric(key)}
              style={{ borderColor: selectedMetric === key ? getMetricColor(key) : '' }}
            >
              <div className="metric-icon" style={{ backgroundColor: getMetricColor(key) }}>
                {key === 'patients' && '👥'}
                {key === 'physicianGroups' && '👨‍⚕️'}
                {key === 'agencies' && '🏢'}
                {key === 'activeOutcomes' && '📈'}
              </div>
              <div className="metric-content">
                <h3>{metricLabels[key]}</h3>
                <p className="metric-value">{formatNumber(value)}</p>
                <p className="metric-subtext">Total in {divisionalGroup}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Tab navigation */}
        <div className="detail-tabs">
          <button 
            className={`tab-button ${activeTab === 'non-virgin' ? 'active' : ''}`}
            onClick={() => setActiveTab('non-virgin')}
          >
            Non-virgin Area
          </button>
          <button 
            className={`tab-button ${activeTab === 'virgin' ? 'active' : ''}`}
            onClick={() => setActiveTab('virgin')}
          >
            Virgin Area
          </button>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Statistical Area
          </button>
          <button 
            className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Comparison
          </button>
        </div>
        
        {/* Statistical Areas Table view */}
        {activeTab !== 'comparison' && (
          <div className="region-stats-container animate-fade-in">
            <div className="filter-toolbar">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Search statistical areas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search" 
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </button>
                )}
                <span className="search-icon">🔍</span>
              </div>
              
              <div className="filter-actions">
                <div className="filter-dropdown-container" ref={filterRef}>
                  <button 
                    className={`filter-button ${showFilters ? 'active' : ''} ${getActiveFilterCount() > 0 ? 'has-filters' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <span className="filter-icon">🔍</span>
                    Filter
                    {getActiveFilterCount() > 0 && (
                      <span className="filter-badge">{getActiveFilterCount()}</span>
                    )}
                  </button>
                  
                  {showFilters && (
                    <div className="filter-dropdown">
                      <div className="filter-header">
                        <h4>Filter Options</h4>
                        <button className="clear-filters" onClick={clearAllFilters}>
                          Clear All
                        </button>
                      </div>
                      
                      <div className="filter-group">
                        <h5>Area Size (Patients)</h5>
                        <div className="filter-options">
                          <label className={`filter-checkbox ${selectedFilters.size.includes('small') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.size.includes('small')}
                              onChange={() => toggleFilter('size', 'small')}
                            />
                            <span className="checkmark"></span>
                            Small (&lt;5,000)
                          </label>
                          <label className={`filter-checkbox ${selectedFilters.size.includes('medium') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.size.includes('medium')}
                              onChange={() => toggleFilter('size', 'medium')}
                            />
                            <span className="checkmark"></span>
                            Medium (5,000-20,000)
                          </label>
                          <label className={`filter-checkbox ${selectedFilters.size.includes('large') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.size.includes('large')}
                              onChange={() => toggleFilter('size', 'large')}
                            />
                            <span className="checkmark"></span>
                            Large (&gt;20,000)
                          </label>
                        </div>
                      </div>
                      
                      <div className="filter-group">
                        <h5>Agencies</h5>
                        <div className="filter-options">
                          <label className={`filter-checkbox ${selectedFilters.agencies.includes('low') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.agencies.includes('low')}
                              onChange={() => toggleFilter('agencies', 'low')}
                            />
                            <span className="checkmark"></span>
                            Low (&lt;50)
                          </label>
                          <label className={`filter-checkbox ${selectedFilters.agencies.includes('medium') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.agencies.includes('medium')}
                              onChange={() => toggleFilter('agencies', 'medium')}
                            />
                            <span className="checkmark"></span>
                            Medium (50-150)
                          </label>
                          <label className={`filter-checkbox ${selectedFilters.agencies.includes('high') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.agencies.includes('high')}
                              onChange={() => toggleFilter('agencies', 'high')}
                            />
                            <span className="checkmark"></span>
                            High (&gt;150)
                          </label>
                        </div>
                      </div>
                      
                      <div className="filter-group">
                        <h5>Active Outcomes</h5>
                        <div className="filter-options">
                          <label className={`filter-checkbox ${selectedFilters.outcomes.includes('low') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.outcomes.includes('low')}
                              onChange={() => toggleFilter('outcomes', 'low')}
                            />
                            <span className="checkmark"></span>
                            Low (&lt;1,000)
                          </label>
                          <label className={`filter-checkbox ${selectedFilters.outcomes.includes('medium') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.outcomes.includes('medium')}
                              onChange={() => toggleFilter('outcomes', 'medium')}
                            />
                            <span className="checkmark"></span>
                            Medium (1,000-5,000)
                          </label>
                          <label className={`filter-checkbox ${selectedFilters.outcomes.includes('high') ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters.outcomes.includes('high')}
                              onChange={() => toggleFilter('outcomes', 'high')}
                            />
                            <span className="checkmark"></span>
                            High (&gt;5,000)
                          </label>
                        </div>
                      </div>
                      
                      <div className="filter-group">
                        <h5>Sort By</h5>
                        <div className="sort-options">
                          <select 
                            value={`${sortField}-${selectedSortOrder}`}
                            onChange={(e) => {
                              const [field, order] = e.target.value.split('-');
                              setSortField(field);
                              setSortOrder(order);
                            }}
                            className="sort-select"
                          >
                            <option value="patients-desc">Patients (High to Low)</option>
                            <option value="patients-asc">Patients (Low to High)</option>
                            <option value="physicianGroups-desc">Physician Groups (High to Low)</option>
                            <option value="physicianGroups-asc">Physician Groups (Low to High)</option>
                            <option value="agencies-desc">Agencies (High to Low)</option>
                            <option value="agencies-asc">Agencies (Low to High)</option>
                            <option value="activeOutcomes-desc">Active Outcomes (High to Low)</option>
                            <option value="activeOutcomes-asc">Active Outcomes (Low to High)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="results-count">
                  Showing <strong>{sortedAreas.length}</strong> of <strong>{allStatisticalAreas.length}</strong> areas
                </div>
              </div>
            </div>
            
            {/* Filter chips - show active filters */}
            {getActiveFilterCount() > 0 && (
              <div className="filter-chips">
                {searchTerm && (
                  <div className="filter-chip">
                    <span>Search: {searchTerm}</span>
                    <button className="chip-remove" onClick={() => setSearchTerm('')}>×</button>
                  </div>
                )}
                
                {selectedFilters.size.map(size => (
                  <div className="filter-chip" key={`size-${size}`}>
                    <span>Size: {size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    <button className="chip-remove" onClick={() => toggleFilter('size', size)}>×</button>
                  </div>
                ))}
                
                {selectedFilters.agencies.map(level => (
                  <div className="filter-chip" key={`agencies-${level}`}>
                    <span>Agencies: {level.charAt(0).toUpperCase() + level.slice(1)}</span>
                    <button className="chip-remove" onClick={() => toggleFilter('agencies', level)}>×</button>
                  </div>
                ))}
                
                {selectedFilters.outcomes.map(level => (
                  <div className="filter-chip" key={`outcomes-${level}`}>
                    <span>Outcomes: {level.charAt(0).toUpperCase() + level.slice(1)}</span>
                    <button className="chip-remove" onClick={() => toggleFilter('outcomes', level)}>×</button>
                  </div>
                ))}
                
                <button className="clear-all-chip" onClick={clearAllFilters}>
                  Clear All
                </button>
              </div>
            )}
            
            {sortedAreas.length === 0 ? (
              <div className="no-data-message">
                <p>No areas match your current filters</p>
                <button className="reset-filters-button" onClick={clearAllFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="region-stats-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSortChange('name')} className="sortable-header">
                        Statistical Area
                        {sortField === 'name' && (
                          <span className="sort-arrow">{selectedSortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th onClick={() => handleSortChange('patients')} className="sortable-header">
                        No. of Patients
                        {sortField === 'patients' && (
                          <span className="sort-arrow">{selectedSortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th onClick={() => handleSortChange('physicianGroups')} className="sortable-header">
                        No. of Physician Groups
                        {sortField === 'physicianGroups' && (
                          <span className="sort-arrow">{selectedSortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th onClick={() => handleSortChange('agencies')} className="sortable-header">
                        No. of Agencies
                        {sortField === 'agencies' && (
                          <span className="sort-arrow">{selectedSortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th onClick={() => handleSortChange('activeOutcomes')} className="sortable-header">
                        No. of Active Reactive Outcomes
                        {sortField === 'activeOutcomes' && (
                          <span className="sort-arrow">{selectedSortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAreas.map((area, index) => (
                      <tr key={`${area}-${index}`} onClick={() => handleStatisticalAreaClick(area)} className="clickable-row">
                        <td className="area-name">{area}</td>
                        <td>{formatNumber(statisticalAreaStatistics[area]?.patients || 0)}</td>
                        <td>{formatNumber(statisticalAreaStatistics[area]?.physicianGroups || 0)}</td>
                        <td>{formatNumber(statisticalAreaStatistics[area]?.agencies || 0)}</td>
                        <td>{formatNumber(statisticalAreaStatistics[area]?.activeOutcomes || 0)}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td><strong>Totals</strong></td>
                      <td><strong>{formatNumber(areaTotals.patients)}</strong></td>
                      <td><strong>{formatNumber(areaTotals.physicianGroups)}</strong></td>
                      <td><strong>{formatNumber(areaTotals.agencies)}</strong></td>
                      <td><strong>{formatNumber(areaTotals.activeOutcomes)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Comparison view */}
        {activeTab === 'comparison' && (
          <div className="comparison-container animate-fade-in">
            <div className="comparison-header">
              <h3>Statistical Areas Comparison</h3>
              <p className="comparison-subtitle">Compare metrics across statistical areas in {divisionalGroup} Division</p>
            </div>
            
            <div className="comparison-grid">
              <div className="comparison-card">
                <h4>Distribution by Size</h4>
                <div className="pie-chart-container">
                  <div className="distribution-bar">
                    {areaChartData.slice(0, 6).map((area, index) => {
                      const percentage = (area[selectedMetric] / areaTotals[selectedMetric] * 100).toFixed(1);
                      return (
                        <div 
                          key={`chart-segment-${area.name}-${index}`}
                          className="pie-segment" 
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: `var(--chart-color-${index + 1})`
                          }}
                          title={`${area.name}: ${percentage}%`}
                          onClick={() => handleStatisticalAreaClick(area.name)}
                        ></div>
                      );
                    })}
                  </div>
                  <div className="pie-legend">
                    {areaChartData.slice(0, 6).map((area, index) => (
                      <div 
                        className="legend-item" 
                        key={`legend-${area.name}-${index}`}
                        onClick={() => handleStatisticalAreaClick(area.name)}
                      >
                        <div className="legend-color" style={{ backgroundColor: `var(--chart-color-${index + 1})` }}></div>
                        <div className="legend-label">{area.name}</div>
                        <div className="legend-value">
                          {formatNumber(area[selectedMetric])} ({((area[selectedMetric] / areaTotals[selectedMetric]) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    ))}
                    {allStatisticalAreas.length > 6 && (
                      <div className="legend-item others">
                        <div className="legend-color" style={{ backgroundColor: `#9CA3AF` }}></div>
                        <div className="legend-label">Others</div>
                        <div className="legend-value">
                          {formatNumber(areaTotals[selectedMetric] - areaChartData.slice(0, 6).reduce((sum, item) => sum + item[selectedMetric], 0))} 
                          ({(100 - areaChartData.slice(0, 6).reduce((sum, item) => sum + ((item[selectedMetric] / areaTotals[selectedMetric]) * 100), 0)).toFixed(1)}%)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="comparison-card">
                <h4>Metric Ratios</h4>
                <div className="metrics-ratio-grid">
                  <div className="ratio-card">
                    <div className="ratio-header">
                      <span className="ratio-icon">👥</span>
                      <span className="ratio-title">Patients per Physician Group</span>
                    </div>
                    <div className="ratio-value">
                      {formatNumber(Math.round(areaTotals.patients / areaTotals.physicianGroups))}
                    </div>
                    <div className="ratio-bar">
                      <div className="ratio-fill" style={{ width: '100%', backgroundColor: getMetricColor('patients') }}></div>
                    </div>
                  </div>
                  
                  <div className="ratio-card">
                    <div className="ratio-header">
                      <span className="ratio-icon">👥</span>
                      <span className="ratio-title">Patients per Agency</span>
                    </div>
                    <div className="ratio-value">
                      {formatNumber(Math.round(areaTotals.patients / areaTotals.agencies))}
                    </div>
                    <div className="ratio-bar">
                      <div className="ratio-fill" style={{ width: '100%', backgroundColor: getMetricColor('agencies') }}></div>
                    </div>
                  </div>
                  
                  <div className="ratio-card">
                    <div className="ratio-header">
                      <span className="ratio-icon">📊</span>
                      <span className="ratio-title">No. of Active Reactive Outcomes</span>
                    </div>
                    <div className="ratio-value">
                      {formatNumber(areaTotals.activeOutcomes)}
                    </div>
                    <div className="ratio-bar">
                      <div 
                        className="ratio-fill" 
                        style={{ 
                          width: `${Math.min(100, (areaTotals.activeOutcomes / areaTotals.patients * 100))}%`, 
                          backgroundColor: getMetricColor('activeOutcomes') 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="comparison-card">
                <h4>Top Statistical Areas</h4>
                <div className="top-areas-container">
                  {Object.entries(metricLabels).map(([metricKey, metricLabel], index) => {
                    const topArea = [...areaChartData].sort((a, b) => b[metricKey] - a[metricKey])[0];
                    return (
                      <div className="top-area-item" key={`top-area-${metricKey}-${index}`} onClick={() => handleStatisticalAreaClick(topArea.name)}>
                        <div className="top-area-metric" style={{ backgroundColor: getMetricColor(metricKey) }}>
                          {metricLabel}
                        </div>
                        <div className="top-area-details">
                          <div className="top-area-name">{topArea.name}</div>
                          <div className="top-area-value">{formatNumber(topArea[metricKey])}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionDetailView; 