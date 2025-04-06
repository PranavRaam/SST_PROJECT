import React, { useState } from 'react';
import ChevronRightIcon from './icons/ChevronRightIcon';
import './DataTable.css';

const DataTable = ({ data, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Filter data based on search term
  const filteredData = data.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    return row.group.toLowerCase().includes(searchLower);
  });

  return (
    <div className="data-table-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search statistical areas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Divisional Group</th>
            <th>No. of Patients</th>
            <th>No. of Physician Groups</th>
            <th>No. of Agencies</th>
            <th>No. of Active Reactive Outcomes</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index} onClick={() => onRowClick(row.group)} className="clickable-row">
              <td className="group-column">
                {row.group}
                <span className="view-details-icon">
                  <ChevronRightIcon />
                </span>
              </td>
              <td>{formatNumber(row.patients)}</td>
              <td>{formatNumber(row.physicianGroups)}</td>
              <td>{formatNumber(row.agencies)}</td>
              <td>{formatNumber(row.activeOutcomes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; 