import React, { useState } from 'react';
import { 
  divisionalGroupToSubdivisions,
  subdivisionColors,
  subdivisionToMSAs
} from '../utils/regionMapping';
import './SubdivisionFilter.css';

const SubdivisionFilter = ({ 
  divisionalGroup, 
  onSubdivisionFilterChange 
}) => {
  const [selectedSubdivisions, setSelectedSubdivisions] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const subdivisions = divisionalGroupToSubdivisions[divisionalGroup] || [];

  const handleSubdivisionClick = (subdivision) => {
    let newSelected;
    if (selectedSubdivisions.includes(subdivision)) {
      // Deselect this subdivision
      newSelected = selectedSubdivisions.filter(s => s !== subdivision);
    } else {
      // Select this subdivision
      newSelected = [...selectedSubdivisions, subdivision];
    }
    
    setSelectedSubdivisions(newSelected);
    
    // Call parent handler with the subdivision-filtered MSAs
    const filteredMSAs = newSelected.length > 0 
      ? newSelected.flatMap(sub => subdivisionToMSAs[sub] || [])
      : null; // null means no filter (show all)
    
    onSubdivisionFilterChange(filteredMSAs);
  };

  const handleSelectAll = () => {
    if (selectedSubdivisions.length === subdivisions.length) {
      // Deselect all
      setSelectedSubdivisions([]);
      onSubdivisionFilterChange(null);
    } else {
      // Select all
      setSelectedSubdivisions([...subdivisions]);
      const allMSAs = subdivisions.flatMap(sub => subdivisionToMSAs[sub] || []);
      onSubdivisionFilterChange(allMSAs);
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (!subdivisions.length) {
    return null;
  }

  return (
    <div className="subdivision-filter">
      <div className="subdivision-header" onClick={toggleExpanded}>
        <h3>
          <span className={`arrow ${expanded ? 'expanded' : 'collapsed'}`}>▼</span>
          {divisionalGroup} Subdivisions
        </h3>
        <button 
          className="select-all-btn" 
          onClick={(e) => { 
            e.stopPropagation();
            handleSelectAll();
          }}
        >
          {selectedSubdivisions.length === subdivisions.length 
            ? 'Deselect All' 
            : 'Select All'}
        </button>
      </div>
      
      {expanded && (
        <div className="subdivisions-list">
          {subdivisions.map(subdivision => (
            <div 
              key={subdivision}
              className={`subdivision-item ${selectedSubdivisions.includes(subdivision) ? 'selected' : ''}`}
              onClick={() => handleSubdivisionClick(subdivision)}
            >
              <span 
                className="subdivision-color-indicator" 
                style={{ backgroundColor: subdivisionColors[subdivision] }}
              ></span>
              <span className="subdivision-name">{subdivision}</span>
              <span className="subdivision-count">
                ({subdivisionToMSAs[subdivision]?.length || 0} MSAs)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubdivisionFilter; 