import React from 'react';
import { 
  divisionalGroupToSubdivisions,
  subdivisionColors,
  subdivisionToMSAs,
  getSubdivisionStatistics
} from '../utils/regionMapping';
import './RegionDetailView.css'; // Reuse the styling
import './DivisionalGroupView.css'; // Import specific styling

const DivisionalGroupView = ({ divisionalGroup, onBack, onSelectSubdivision }) => {
  const subdivisions = divisionalGroupToSubdivisions[divisionalGroup] || [];

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Get statistics for a subdivision
  const getStats = (subdivision) => {
    return getSubdivisionStatistics(subdivision);
  };

  return (
    <div className="region-detail-view">
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
      
      <div className="detail-header">
        <h2>Subdivisions in {divisionalGroup} Division</h2>
        <p className="subdivision-help">Click on a subdivision to view its MSAs</p>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SUBDIVISION</th>
              <th>NO. OF PATIENTS</th>
              <th>NO. OF PHYSICIAN GROUPS</th>
              <th>NO. OF AGENCIES</th>
              <th>NO. OF ACTIVE REACTIVE OUTCOMES</th>
            </tr>
          </thead>
          <tbody>
            {subdivisions.map(subdivision => {
              const stats = getStats(subdivision);
              
              return (
                <tr 
                  key={subdivision} 
                  onClick={() => onSelectSubdivision(subdivision)} 
                  className="clickable-row"
                >
                  <td className="group-column">
                    <div className="subdivision-name-container">
                      <span 
                        className="subdivision-color-dot" 
                        style={{ backgroundColor: subdivisionColors[subdivision] }}
                      ></span>
                      {subdivision}
                      <span className="view-details-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h13M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </td>
                  <td>{formatNumber(stats.patients)}</td>
                  <td>{formatNumber(stats.physicianGroups)}</td>
                  <td>{formatNumber(stats.agencies)}</td>
                  <td>{formatNumber(stats.activeOutcomes)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DivisionalGroupView; 