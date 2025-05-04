import React, { useState, useRef, useEffect } from 'react';
import { 
  subdivisionToMSAs,
  statisticalAreaStatistics,
  subdivisionColors
} from '../utils/regionMapping';
import './RegionDetailView.css'; // Reuse the styling from RegionDetailView
import './SubdivisionDetailView.css'; // Import subdivision-specific styles

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

const SubdivisionDetailView = ({ 
  divisionalGroup, 
  subdivision, 
  onBack, 
  onSelectStatisticalArea 
}) => {
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
  const filterRef = useRef(null);
  const printRef = useRef(null);
  
  // Get all MSAs for this subdivision
  const allStatisticalAreas = subdivisionToMSAs[subdivision] || [];

  // Metadata for metrics
  const metricLabels = {
    patients: 'Total Patients',
    physicianGroups: 'Physician Groups',
    agencies: 'Agencies',
    activeOutcomes: 'Active Reactive Outcomes'
  };

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
  
  // Filter MSAs based on virgin/non-virgin status
  const filteredAreas = allStatisticalAreas.filter(area => {
    const matchesSearch = area.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const regionNonVirginMSAs = nonVirginMSAs[divisionalGroup] || new Set();
    
    // Filter by tab (virgin/non-virgin)
    if (activeTab === 'non-virgin') {
      return regionNonVirginMSAs.has(area);
    } else {
      return !regionNonVirginMSAs.has(area);
    }
  });

  // Calculate totals for the filtered areas
  const areaTotals = filteredAreas.reduce((totals, area) => {
    const stats = statisticalAreaStatistics[area] || {};
    
    totals.patients += stats.patients || 0;
    totals.physicianGroups += stats.physicianGroups || 0;
    totals.agencies += stats.agencies || 0;
    totals.activeOutcomes += stats.activeOutcomes || 0;
    
    return totals;
  }, {
    patients: 0,
    physicianGroups: 0,
    agencies: 0,
    activeOutcomes: 0
  });

  // Sort areas based on selected field and order
  const sortedAreas = [...filteredAreas].sort((a, b) => {
    const aValue = statisticalAreaStatistics[a]?.[sortField] || 0;
    const bValue = statisticalAreaStatistics[b]?.[sortField] || 0;
    
    if (selectedSortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Prepare chart data for top areas
  const areaChartData = sortedAreas.map(area => ({
    name: area,
    ...statisticalAreaStatistics[area]
  }));

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Get color for metric
  const getMetricColor = (metric) => {
    switch (metric) {
      case 'patients': return '#4F46E5';
      case 'physicianGroups': return '#7C3AED';
      case 'agencies': return '#10B981';
      case 'activeOutcomes': return '#F59E0B';
      default: return '#4F46E5';
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle print view
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${subdivision} Report</title>
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
          <h1>${subdivision} Healthcare Report</h1>
          <p>Part of ${divisionalGroup} Division</p>
          
          <div class="summary">
            ${Object.entries(areaTotals).map(([key, value]) => `
              <div class="metric">
                <h3>${metricLabels[key]}</h3>
                <p class="metric-value">${formatNumber(value)}</p>
              </div>
            `).join('')}
          </div>
          
          <h2>Statistical Areas in ${subdivision}</h2>
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
            <p>Healthcare Services Dashboard</p>
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
    link.setAttribute('download', `${subdivision}_Data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle statistical area click
  const handleStatisticalAreaClick = (areaName) => {
    onSelectStatisticalArea(areaName);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (field === sortField) {
      // Toggle sort order if clicking the same field
      setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // Set the new sort field and default to descending
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Toggle a filter selection
  const toggleFilter = (category, value) => {
    setSelectedFilters(prevFilters => {
      const currentFilters = [...prevFilters[category]];
      const index = currentFilters.indexOf(value);
      
      if (index === -1) {
        // Add filter
        return {
          ...prevFilters,
          [category]: [...currentFilters, value]
        };
      } else {
        // Remove filter
        currentFilters.splice(index, 1);
        return {
          ...prevFilters,
          [category]: currentFilters
        };
      }
    });
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
          <h2>{subdivision}</h2>
          <div className="subdivision-parent">
            <span>Part of {divisionalGroup} Division</span>
          </div>
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
                <p className="metric-subtext">Total in {subdivision}</p>
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
            Non-virgin Areas
          </button>
          <button 
            className={`tab-button ${activeTab === 'virgin' ? 'active' : ''}`}
            onClick={() => setActiveTab('virgin')}
          >
            Virgin Areas
          </button>
        </div>
        
        {/* Content area */}
        <div className="region-content">
          {/* Search and filter controls */}
          <div className="controls-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search Statistical Areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-inputt"
              />
              <button 
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filters
                {(selectedFilters.size.length > 0 || selectedFilters.agencies.length > 0 || selectedFilters.outcomes.length > 0) && 
                  <span className="filter-badge"></span>
                }
              </button>
              
              {showFilters && (
                <div className="filter-panel" ref={filterRef}>
                  <h3>Advanced Filters</h3>
                  
                  <div className="filter-group">
                    <h4>Patient Size</h4>
                    <div className="filter-options">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.size.includes('small')}
                          onChange={() => toggleFilter('size', 'small')}
                        />
                        Small (&lt;5,000)
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.size.includes('medium')}
                          onChange={() => toggleFilter('size', 'medium')}
                        />
                        Medium (5,000-20,000)
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.size.includes('large')}
                          onChange={() => toggleFilter('size', 'large')}
                        />
                        Large (&gt;20,000)
                      </label>
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <h4>Agency Count</h4>
                    <div className="filter-options">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.agencies.includes('low')}
                          onChange={() => toggleFilter('agencies', 'low')}
                        />
                        Low (&lt;50)
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.agencies.includes('medium')}
                          onChange={() => toggleFilter('agencies', 'medium')}
                        />
                        Medium (50-150)
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.agencies.includes('high')}
                          onChange={() => toggleFilter('agencies', 'high')}
                        />
                        High (&gt;150)
                      </label>
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <h4>Active Reactive Outcomes</h4>
                    <div className="filter-options">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.outcomes.includes('low')}
                          onChange={() => toggleFilter('outcomes', 'low')}
                        />
                        Low (&lt;200)
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.outcomes.includes('medium')}
                          onChange={() => toggleFilter('outcomes', 'medium')}
                        />
                        Medium (200-1,000)
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedFilters.outcomes.includes('high')}
                          onChange={() => toggleFilter('outcomes', 'high')}
                        />
                        High (&gt;1,000)
                      </label>
                    </div>
                  </div>
                  
                  <div className="filter-actions">
                    <button 
                      className="clear-filters"
                      onClick={() => setSelectedFilters({
                        size: [],
                        agencies: [],
                        outcomes: []
                      })}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Table view */}
          <div className="data-view">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Statistical Area</th>
                    {activeTab !== 'virgin' && (
                      <>
                        <th onClick={() => handleSortChange('patients')} className="sortable-header">
                          No. of Patients
                          {sortField === 'patients' && (
                            <span className="sort-arrow">{selectedSortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th onClick={() => handleSortChange('activeOutcomes')} className="sortable-header">
                          No. of Active Reactive Outcomes
                          {sortField === 'activeOutcomes' && (
                            <span className="sort-arrow">{selectedSortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </th>
                      </>
                    )}
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
                  </tr>
                </thead>
                <tbody>
                  {sortedAreas.map((area, index) => (
                    <tr key={`${area}-${index}`} onClick={() => handleStatisticalAreaClick(area)} className="clickable-row">
                      <td className="area-name">{area}</td>
                      {activeTab !== 'virgin' && (
                        <>
                          <td>{formatNumber(statisticalAreaStatistics[area]?.patients || 0)}</td>
                          <td>{formatNumber(statisticalAreaStatistics[area]?.activeOutcomes || 0)}</td>
                        </>
                      )}
                      <td>{activeTab === 'virgin' ? '0' : formatNumber(statisticalAreaStatistics[area]?.physicianGroups || 0)}</td>
                      <td>{activeTab === 'virgin' ? '0' : formatNumber(statisticalAreaStatistics[area]?.agencies || 0)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>Totals</strong></td>
                    {activeTab !== 'virgin' && (
                      <>
                        <td><strong>{formatNumber(areaTotals.patients)}</strong></td>
                        <td><strong>{formatNumber(areaTotals.activeOutcomes)}</strong></td>
                      </>
                    )}
                    <td><strong>{activeTab === 'virgin' ? '0' : formatNumber(areaTotals.physicianGroups)}</strong></td>
                    <td><strong>{activeTab === 'virgin' ? '0' : formatNumber(areaTotals.agencies)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubdivisionDetailView; 