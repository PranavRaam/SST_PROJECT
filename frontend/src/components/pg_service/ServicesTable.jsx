import React, { useState, useEffect } from 'react';
import './ServicesTable.css';

const ServicesTable = ({ data, onSort, onSelectPatient }) => {
  const [sortConfig, setSortConfig] = useState({
    primaryKey: 'newCPODocsCreated',
    primaryDirection: 'asc',
    secondaryKey: 'newDocs',
    secondaryDirection: 'desc'
  });

  // Apply initial sort
  useEffect(() => {
    onSort?.('newCPODocsCreated', 'asc');
  }, []);

  // Sort data based on current sort configuration
  const sortedData = [...data].sort((a, b) => {
    // Get values for the primary sorting key
    let aValue, bValue;
    
    if (sortConfig.primaryKey === 'newCPODocsCreated') {
      aValue = Number(a.newCPODocsCreated) || 0;
      bValue = Number(b.newCPODocsCreated) || 0;
    } else if (sortConfig.primaryKey === 'newDocs') {
      aValue = Number(a.newDocs) || 0;
      bValue = Number(b.newDocs) || 0;
    } else {
      aValue = a[sortConfig.primaryKey] || '';
      bValue = b[sortConfig.primaryKey] || '';
    }
    
    // Compare primary values
    if (aValue !== bValue) {
      return sortConfig.primaryDirection === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    }
    
    // If primary values are equal and we have a secondary key, use it
    if (sortConfig.secondaryKey) {
      const aSecondary = Number(a[sortConfig.secondaryKey]) || 0;
      const bSecondary = Number(b[sortConfig.secondaryKey]) || 0;
      
      return sortConfig.secondaryDirection === 'asc'
        ? (aSecondary > bSecondary ? 1 : -1)
        : (aSecondary < bSecondary ? 1 : -1);
    }
    
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.primaryKey === key && sortConfig.primaryDirection === 'asc') {
      direction = 'desc';
    }
    
    // For newDocs, default to descending order on first click
    if (key === 'newDocs' && sortConfig.primaryKey !== 'newDocs') {
      direction = 'desc';
    }
    
    setSortConfig({
      primaryKey: key,
      primaryDirection: direction,
      secondaryKey: key === 'newCPODocsCreated' ? 'newDocs' : null,
      secondaryDirection: key === 'newCPODocsCreated' ? 'desc' : null
    });
    onSort?.(key, direction);
  };

  const getSortIcon = (columnName) => {
    // Primary sort icon
    if (columnName === sortConfig.primaryKey) {
      return sortConfig.primaryDirection === 'asc' ? '↑' : '↓';
    }
    // Secondary sort icon - smaller
    if (columnName === sortConfig.secondaryKey) {
      return sortConfig.secondaryDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const handleRowClick = (patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
  };

  return (
    <div className="pg-docs-table-container">
      <table className="pg-docs-table">
        <thead>
          <tr className="pg-docs-table-header-row">
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('ptName')}
            >
              Pt Name {getSortIcon('ptName')}
            </th>
            <th className="pg-docs-table-header-cell">DOB</th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('pg')}
            >
              PG {getSortIcon('pg')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('hhah')}
            >
              HHAH {getSortIcon('hhah')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('cpoMinsCaptured')}
            >
              CPO mins captured {getSortIcon('cpoMinsCaptured')}
            </th>
            <th className="pg-docs-table-header-cell">Remarks</th>
            <th 
              className="pg-docs-table-header-cell"
              onClick={() => handleSort('newDocs')}
            >
              Newdocs {getSortIcon('newDocs')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('newCPODocsCreated')}
            >
              New CPO Docs Created {getSortIcon('newCPODocsCreated')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr 
              key={index} 
              className="pg-docs-table-data-row"
              onClick={() => handleRowClick(row)}
            >
              <td className="pg-docs-table-data-cell">{row.ptName}</td>
              <td className="pg-docs-table-data-cell">{row.dob}</td>
              <td className="pg-docs-table-data-cell">{row.pg}</td>
              <td className="pg-docs-table-data-cell">{row.hhah}</td>
              <td className="pg-docs-table-data-cell">{row.cpoMinsCaptured}</td>
              <td className="pg-docs-table-data-cell">{row.remarks}</td>
              <td className="pg-docs-table-data-cell">{row.newDocs}</td>
              <td className="pg-docs-table-data-cell">{row.newCPODocsCreated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;