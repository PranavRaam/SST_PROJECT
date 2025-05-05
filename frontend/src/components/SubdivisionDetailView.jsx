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
  'West': [
    { name: 'Amarillo', pg: 1, hhah: 4 },
    { name: 'Boulder', pg: 0, hhah: 3 },
    { name: 'Broomfield', pg: 0, hhah: 1 },
    { name: 'Casper', pg: 0, hhah: 2 },
    { name: 'Chicago–Naperville–Elgin', pg: 0, hhah: 0 },
    { name: 'Cleveland–Elyria', pg: 0, hhah: 0 },
    { name: 'Clovis Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Colorado Springs', pg: 1, hhah: 9 },
    { name: 'Corpus Christi', pg: 0, hhah: 25 },
    { name: 'Dallas–Fort Worth–Arlington', pg: 0, hhah: 1 },
    { name: 'Denver-Aurora-Lakewood', pg: 0, hhah: 36 },
    { name: 'El Paso', pg: 1, hhah: 34 },
    { name: 'Fort Collins', pg: 0, hhah: 8 },
    { name: 'Fort Morgan Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Greeley', pg: 0, hhah: 1 },
    { name: 'Laredo', pg: 0, hhah: 5 },
    { name: 'Las Vegas-Henderson-Paradise', pg: 0, hhah: 1 },
    { name: 'Levelland Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Los Angeles-Long Beach-Anaheim', pg: 1, hhah: 7 },
    { name: 'Lubbock', pg: 1, hhah: 8 },
    { name: 'McAllen-Edinburg-Mission', pg: 0, hhah: 1 },
    { name: 'New York–Newark–Jersey City', pg: 0, hhah: 0 },
    { name: 'Odessa', pg: 0, hhah: 2 },
    { name: 'Ogden-Clearfield', pg: 0, hhah: 1 },
    { name: 'Pampa Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Phoenix-Mesa-Scottsdale', pg: 0, hhah: 1 },
    { name: 'Pueblo', pg: 0, hhah: 12 },
    { name: 'Salt Lake City', pg: 0, hhah: 1 },
    { name: 'Santa Barbara', pg: 0, hhah: 1 },
    { name: 'Santa Maria-Santa Barbara', pg: 0, hhah: 1 },
    { name: 'St. George', pg: 0, hhah: 1 },
    { name: 'Sterling Micropolitan Statistical Area', pg: 0, hhah: 0 }
  ],
  'East Central': [
    { name: 'Bryan-College Station', pg: 0, hhah: 0 },
    { name: 'Chicago-Naperville-Elgin', pg: 0, hhah: 1 },
    { name: 'Clarksville', pg: 1, hhah: 0 },
    { name: 'Cleveland-Elyria', pg: 1, hhah: 1 },
    { name: 'Cleveland', pg: 1, hhah: 1 },
    { name: 'Dallas-Fort Worth-Arlington', pg: 0, hhah: 0 },
    { name: 'Detroit-Warren-Dearborn', pg: 1, hhah: 0 },
    { name: 'Detroit-Warren-Flint', pg: 0, hhah: 0 },
    { name: 'Houston-The Woodlands-Sugar Land', pg: 0, hhah: 0 },
    { name: 'Indianapolis-Carmel-Anderson', pg: 1, hhah: 0 },
    { name: 'Jackson', pg: 0, hhah: 1 },
    { name: 'Lafayette', pg: 0, hhah: 16 },
    { name: 'Los Angeles-Long Beach-Anaheim', pg: 0, hhah: 0 },
    { name: 'McAllen-Edinburg-Mission', pg: 0, hhah: 0 },
    { name: 'Minneapolis-St. Paul-Bloomington', pg: 0, hhah: 0 },
    { name: 'Monroe', pg: 0, hhah: 11 },
    { name: 'Nashville-Davidson-Murfreesboro-Franklin', pg: 1, hhah: 0 },
    { name: 'New York-Newark-Jersey City', pg: 0, hhah: 1 },
    { name: 'Oklahoma City', pg: 0, hhah: 0 },
    { name: 'Philadelphia-Camden-Wilmington', pg: 0, hhah: 2 },
    { name: 'Pittsburgh', pg: 0, hhah: 1 },
    { name: 'Port St. Lucie', pg: 1, hhah: 0 },
    { name: 'Salt Lake City', pg: 0, hhah: 0 },
    { name: 'San Antonio-New Braunfels', pg: 0, hhah: 0 },
    { name: 'Sebastian-Vero Beach', pg: 0, hhah: 1 },
    { name: 'St. Louis', pg: 0, hhah: 0 },
    { name: 'Wichita Falls', pg: 0, hhah: 0 }
  ],
  'Central': [
    { name: 'Alexandria', pg: 0, hhah: 2 },
    { name: 'Alice Micropolitan Statistical Area', pg: 0, hhah: 3 },
    { name: 'Ardmore Micropolitan Statistical Area', pg: 0, hhah: 2 },
    { name: 'Ashtabula', pg: 0, hhah: 0 },
    { name: 'Austin-Round Rock', pg: 0, hhah: 27 },
    { name: 'Benavides Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Brownsville–Harlingen', pg: 0, hhah: 1 },
    { name: 'Brownwood Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Bryan-College Station', pg: 0, hhah: 3 },
    { name: 'Carlsbad Micropolitan Statistical Area', pg: 0, hhah: 0 },
    { name: 'Casper', pg: 0, hhah: 0 },
    { name: 'Chicago-Naperville-Elgin', pg: 0, hhah: 1 },
    { name: 'Cleveland', pg: 1, hhah: 1 },
    { name: 'Cleveland-Elyria', pg: 1, hhah: 1 },
    { name: 'Corpus Christi', pg: 0, hhah: 25 },
    { name: 'Dallas-Fort Worth-Arlington', pg: 10, hhah: 1 },
    { name: 'Del Rio Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Denver-Aurora-Lakewood', pg: 0, hhah: 0 },
    { name: 'Durant Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Eagle Pass Micropolitan Statistical Area', pg: 0, hhah: 2 },
    { name: 'El Paso', pg: 1, hhah: 34 },
    { name: 'Fort Worth-Arlington', pg: 0, hhah: 1 },
    { name: 'Houston-The Woodlands-Sugar Land', pg: 2, hhah: 0 },
    { name: 'Huntsville Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Jackson', pg: 0, hhah: 1 },
    { name: 'Kerrville Micropolitan Statistical Area', pg: 0, hhah: 4 },
    { name: 'Killeen-Temple', pg: 0, hhah: 2 },
    { name: 'Lafayette-Opelousas-Morgan City Combined Statistical Area', pg: 0, hhah: 1 },
    { name: 'Lafayette', pg: 0, hhah: 16 },
    { name: 'Lake Charles', pg: 0, hhah: 1 },
    { name: 'Laredo', pg: 0, hhah: 5 },
    { name: 'Laredo Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Lawton', pg: 0, hhah: 3 },
    { name: 'Livingston Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Los Angeles-Long Beach-Anaheim', pg: 0, hhah: 0 },
    { name: 'McAllen-Edinburg-Mission', pg: 0, hhah: 1 },
    { name: 'Minneapolis-St. Paul-Bloomington', pg: 0, hhah: 1 },
    { name: 'Monroe', pg: 0, hhah: 11 },
    { name: 'Nacogdoches Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Natchez Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Odessa', pg: 0, hhah: 2 },
    { name: 'Ogden-Clearfield', pg: 0, hhah: 0 },
    { name: 'Oklahoma City', pg: 0, hhah: 1 },
    { name: 'Palestine Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Paris Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Philadelphia-Camden-Wilmington', pg: 0, hhah: 0 },
    { name: 'Pittsburgh', pg: 0, hhah: 0 },
    { name: 'Salt Lake City', pg: 0, hhah: 0 },
    { name: 'San Antonio-New Braunfels', pg: 9, hhah: 104 },
    { name: 'San Marcos', pg: 0, hhah: 2 },
    { name: 'Sarasota-Bradenton-Venice', pg: 0, hhah: 0 },
    { name: 'Sebastian-Vero Beach', pg: 0, hhah: 0 },
    { name: 'Sherman-Denison', pg: 1, hhah: 11 },
    { name: 'St. George', pg: 0, hhah: 0 },
    { name: 'St. Louis', pg: 0, hhah: 1 },
    { name: 'Sweetwater Micropolitan Statistical Area', pg: 0, hhah: 1 },
    { name: 'Tyler', pg: 0, hhah: 2 },
    { name: 'Victoria', pg: 0, hhah: 2 },
    { name: 'Waco', pg: 0, hhah: 2 },
    { name: 'Wichita Falls', pg: 2, hhah: 15 },
    { name: 'Youngstown-Warren-Boardman', pg: 0, hhah: 1 }
  ],
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
      if (divisionalGroup === 'East Central' || divisionalGroup === 'West' || divisionalGroup === 'Central') {
        // Check if area matches any entry.name in the array
        return regionNonVirginMSAs.some(entry => area.toLowerCase().startsWith(entry.name.toLowerCase()));
      } else {
        return regionNonVirginMSAs.has(area);
      }
    } else {
      if (divisionalGroup === 'East Central' || divisionalGroup === 'West' || divisionalGroup === 'Central') {
        return !regionNonVirginMSAs.some(entry => area.toLowerCase().startsWith(entry.name.toLowerCase()));
      } else {
        return !regionNonVirginMSAs.has(area);
      }
    }
  });

  // Calculate totals for the filtered areas
  const areaTotals = filteredAreas.reduce((totals, area) => {
    const stats = statisticalAreaStatistics[area] || {};
    if ((divisionalGroup === 'East Central' || divisionalGroup === 'West' || divisionalGroup === 'Central') && activeTab === 'non-virgin') {
      // Find the best match in the region's array
      const match = nonVirginMSAs[divisionalGroup].find(entry => area.toLowerCase().startsWith(entry.name.toLowerCase()));
      if (match) {
        totals.physicianGroups += match.pg;
        totals.agencies += match.hhah;
      } else {
        totals.physicianGroups += 0;
        totals.agencies += 0;
      }
    } else {
      totals.physicianGroups += stats.physicianGroups || 0;
      totals.agencies += stats.agencies || 0;
    }
    totals.patients += stats.patients || 0;
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
                  {sortedAreas.map((area, index) => {
                    let pgCount = statisticalAreaStatistics[area]?.physicianGroups || 0;
                    let hhahCount = statisticalAreaStatistics[area]?.agencies || 0;
                    if ((divisionalGroup === 'East Central' || divisionalGroup === 'West' || divisionalGroup === 'Central') && activeTab === 'non-virgin') {
                      // Find the best match in the region's array
                      const match = nonVirginMSAs[divisionalGroup].find(entry => area.toLowerCase().startsWith(entry.name.toLowerCase()));
                      if (match) {
                        pgCount = match.pg;
                        hhahCount = match.hhah;
                      } else {
                        pgCount = 0;
                        hhahCount = 0;
                      }
                    }
                    return (
                      <tr key={`${area}-${index}`} onClick={() => handleStatisticalAreaClick(area)} className="clickable-row">
                        <td className="area-name">{area}</td>
                        {activeTab !== 'virgin' && (
                          <>
                            <td>{formatNumber(statisticalAreaStatistics[area]?.patients || 0)}</td>
                            <td>{formatNumber(statisticalAreaStatistics[area]?.activeOutcomes || 0)}</td>
                          </>
                        )}
                        <td>{activeTab === 'virgin' ? '0' : formatNumber(pgCount)}</td>
                        <td>{activeTab === 'virgin' ? '0' : formatNumber(hhahCount)}</td>
                      </tr>
                    );
                  })}
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