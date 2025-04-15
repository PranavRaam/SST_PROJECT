// servicestable.jsx

import React, { useState, useMemo, useCallback } from 'react';
import './ServicesTable.css';

const ServicesTable = ({ data, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({
    primaryKey: 'daysLeftForBilling',
    primaryDirection: 'asc',
    secondaryKey: 'docsToBeSignedCount',
    secondaryDirection: 'desc'
  });

  // Create a stable sort function
  const sortData = useCallback((dataToSort, config) => {
    const { primaryKey, primaryDirection, secondaryKey, secondaryDirection } = config;
    
    return [...dataToSort].sort((a, b) => {
      // Handle primary sort
      if (primaryKey === 'daysLeftForBilling' || primaryKey === 'docsToBeSignedCount') {
        // Numeric comparison for numeric fields
        if (a[primaryKey] !== b[primaryKey]) {
          return primaryDirection === 'asc'
            ? a[primaryKey] - b[primaryKey]
            : b[primaryKey] - a[primaryKey];
        }
      } else if (typeof a[primaryKey] === 'string' && typeof b[primaryKey] === 'string') {
        // String comparison
        const compareResult = a[primaryKey].localeCompare(b[primaryKey]);
        if (compareResult !== 0) {
          return primaryDirection === 'asc' ? compareResult : -compareResult;
        }
      } else {
        // Generic comparison for other types
        if (a[primaryKey] !== b[primaryKey]) {
          if (primaryDirection === 'asc') {
            return a[primaryKey] > b[primaryKey] ? 1 : -1;
          } else {
            return a[primaryKey] < b[primaryKey] ? 1 : -1;
          }
        }
      }
      
      // Handle secondary sort if we have one and primary keys were equal
      if (secondaryKey) {
        if (secondaryKey === 'daysLeftForBilling' || secondaryKey === 'docsToBeSignedCount') {
          return secondaryDirection === 'asc'
            ? a[secondaryKey] - b[secondaryKey]
            : b[secondaryKey] - a[secondaryKey];
        } else if (typeof a[secondaryKey] === 'string' && typeof b[secondaryKey] === 'string') {
          const compareResult = a[secondaryKey].localeCompare(b[secondaryKey]);
          return secondaryDirection === 'asc' ? compareResult : -compareResult;
        } else {
          if (secondaryDirection === 'asc') {
            return a[secondaryKey] > b[secondaryKey] ? 1 : -1;
          } else {
            return a[secondaryKey] < b[secondaryKey] ? 1 : -1;
          }
        }
      }
      
      return 0; // If we got here, both primary and secondary keys were equal
    });
  }, []);

  // Sort the data whenever it changes or sort config changes
  const sortedData = useMemo(() => {
    return sortData(data, sortConfig);
  }, [data, sortConfig, sortData]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => {
      const direction = 
        prevConfig.primaryKey === key && prevConfig.primaryDirection === 'asc' 
          ? 'desc' 
          : 'asc';
      
      return {
        primaryKey: key,
        primaryDirection: direction,
        secondaryKey: key === 'daysLeftForBilling' ? 'docsToBeSignedCount' : null,
        secondaryDirection: key === 'daysLeftForBilling' ? 'desc' : null
      };
    });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.primaryKey === columnName) {
      return sortConfig.primaryDirection === 'asc' ? '↑' : '↓';
    }
    if (sortConfig.secondaryKey === columnName) {
      return sortConfig.secondaryDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <div className="hhah-services-table-container">
      <table className="hhah-services-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('ptName')}>
              Pt.Name {getSortIcon('ptName')}
            </th>
            <th>DOB</th>
            <th>SOC</th>
            <th>From - To date</th>
            <th>485 SIGNED</th>
            <th onClick={() => handleSort('docsToBeSignedCount')}>
              Doc to be signed {getSortIcon('docsToBeSignedCount')}
            </th>
            <th onClick={() => handleSort('daysLeftForBilling')}>
              Days left (to be billed) {getSortIcon('daysLeftForBilling')}
            </th>
            <th onClick={() => handleSort('pg')}>
              PG {getSortIcon('pg')}
            </th>
            <th onClick={() => handleSort('physician')}>
              Physician {getSortIcon('physician')}
            </th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr 
              key={index}
              onClick={() => onRowClick(row)}
              className="clickable-row"
            >
              <td>{row.ptName}</td>
              <td>{row.dob}</td>
              <td>{row.soc}</td>
              <td>{row.fromToDate}</td>
              <td>
                <button 
                  className={`status-toggle ${row.is485Signed ? 'signed' : 'unsigned'}`}
                >
                  {row.is485Signed ? '✓' : '✗'}
                </button>
              </td>
              <td>{row.docsToBeSignedCount}</td>
              <td className={row.daysLeftForBilling <= 7 ? 'urgent' : ''}>{row.daysLeftForBilling}</td>
              <td>{row.pg}</td>
              <td>{row.physician}</td>
              <td>{row.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable; 