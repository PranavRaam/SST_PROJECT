import React, { useState, useRef } from 'react';
import { 
  regionStatistics, 
  regionToStatisticalAreas, 
  statisticalAreaStatistics,
  divisionalGroupToStatisticalAreas
} from '../utils/regionMapping';
import BarChart from './BarChart';
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
  const printRef = useRef(null);
  
  // Use the statisticalAreas prop directly
  const allStatisticalAreas = statisticalAreas;
  
  // Filter statistical areas based on search term and tab
  const filteredAreas = allStatisticalAreas.filter(area => {
    const matchesSearch = area.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    const regionNonVirginMSAs = nonVirginMSAs[divisionalGroup] || new Set();
    
    // Debug logs
    console.log('Current region:', divisionalGroup);
    console.log('Current area:', area);
    console.log('Non-virgin MSAs for region:', Array.from(regionNonVirginMSAs));
    console.log('Is area in non-virgin set:', regionNonVirginMSAs.has(area));
    
    switch (activeTab) {
      case 'non-virgin':
        return regionNonVirginMSAs.has(area);
      case 'virgin':
        return !regionNonVirginMSAs.has(area);
      case 'all':
        return true;
      default:
        return true;
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

  return (
    <div className="region-detail-view">
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
            <div className="search-container">
              <input
                type="text"
                placeholder="Search statistical areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-inputt"
              />
            </div>
            {filteredAreas.length === 0 && activeTab === 'non-virgin' ? (
              <div className="no-data-message">
                <p>No non-virgin areas in {divisionalGroup} region</p>
              </div>
            ) : (
              <table className="region-stats-table">
                <thead>
                  <tr>
                    <th>Statistical Area</th>
                    <th>No. of Patients</th>
                    <th>No. of Physician Groups</th>
                    <th>No. of Agencies</th>
                    <th>No. of Active Reactive Outcomes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAreas.map((area, index) => (
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