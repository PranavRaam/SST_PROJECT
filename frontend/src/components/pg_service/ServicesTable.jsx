import React, { useState } from 'react';
import './ServicesTable.css';

// Standalone utility function for consistent sorting, completely independent of React
function getSortedTableData(data) {
  console.log('Original data:', data);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('Data is empty or invalid, returning empty array');
    return [];
  }
  
  // Create a shallow copy to avoid mutating the original data
  const sortedArray = [...data];
  
  // Apply our fixed sorting logic: 
  // 1. CPO Docs in ascending order (primary)
  // 2. New Docs in descending order (secondary)
  sortedArray.sort((a, b) => {
    // Get CPO doc values with fallback to 0 for null/undefined values
    const aCPO = Number(a.newCPODocsCreated) || 0;
    const bCPO = Number(b.newCPODocsCreated) || 0;
    
    console.log(`Comparing CPO docs: ${a.ptName || 'unknown'} (${aCPO}) vs ${b.ptName || 'unknown'} (${bCPO})`);
    
    // Compare CPO docs (primary sort - ascending)
    if (aCPO !== bCPO) {
      return aCPO - bCPO;
    }
    
    // If CPO docs are equal, compare new docs (secondary sort - descending)
    const aNewDocs = Number(a.newDocs) || 0;
    const bNewDocs = Number(b.newDocs) || 0;
    
    console.log(`Equal CPO docs, comparing New Docs: ${a.ptName || 'unknown'} (${aNewDocs}) vs ${b.ptName || 'unknown'} (${bNewDocs})`);
    
    return bNewDocs - aNewDocs;
  });
  
  console.log('Sorted data:', sortedArray);
  console.log('Sorting successful: New CPO Docs ascending, New Docs descending');
  
  return sortedArray;
}

const ServicesTable = ({ data, onSort, onSelectPatient }) => {
  // Only track UI state for user interactions
  const [userSortState, setUserSortState] = useState({
    column: null,
    direction: null
  });

  // Log when component renders
  console.log('ServicesTable rendering with data length:', data?.length);
  
  // Debug data on mount and updates
  React.useEffect(() => {
    console.log('ServicesTable mounted or data changed');
    console.log('Original data structure:', data);
    
    if (data && data.length > 0) {
      // Check key existence
      const firstItem = data[0];
      console.log('Data keys available:', Object.keys(firstItem));
      console.log('Sample values:', {
        newDocs: firstItem.newDocs,
        newCPODocsCreated: firstItem.newCPODocsCreated
      });
    }
  }, [data]);

  // Use our standalone utility function to sort the data
  const sortedData = getSortedTableData(data);
  
  // Verify sorting is correct
  React.useEffect(() => {
    if (sortedData && sortedData.length > 1) {
      console.log('Verifying sort order...');
      
      // Check if sorting is correct
      let sortCorrect = true;
      
      for (let i = 0; i < sortedData.length - 1; i++) {
        const current = sortedData[i];
        const next = sortedData[i + 1];
        
        const currentCPO = Number(current.newCPODocsCreated) || 0;
        const nextCPO = Number(next.newCPODocsCreated) || 0;
        
        // If CPO is different, it should be in ascending order
        if (currentCPO !== nextCPO) {
          if (currentCPO > nextCPO) {
            console.error('SORT ERROR: CPO docs not in ascending order!', {
              item1: current.ptName,
              cpo1: currentCPO,
              item2: next.ptName,
              cpo2: nextCPO
            });
            sortCorrect = false;
          }
        } 
        // If CPO is the same, new docs should be in descending order
        else {
          const currentDocs = Number(current.newDocs) || 0;
          const nextDocs = Number(next.newDocs) || 0;
          
          if (currentDocs < nextDocs) {
            console.error('SORT ERROR: New docs not in descending order!', {
              item1: current.ptName,
              cpo1: currentCPO,
              docs1: currentDocs,
              item2: next.ptName,
              cpo2: nextCPO,
              docs2: nextDocs
            });
            sortCorrect = false;
          }
        }
      }
      
      if (sortCorrect) {
        console.log('✅ SORTING VERIFICATION PASSED: Data is correctly sorted');
      } else {
        console.error('❌ SORTING VERIFICATION FAILED: Data is not sorted correctly');
      }
      
      // Print final sort result for easy inspection
      console.table(sortedData.map(item => ({
        name: item.ptName || 'unknown',
        cpo: item.newCPODocsCreated || 0,
        docs: item.newDocs || 0
      })));
    }
  }, [sortedData]);

  // Handle UI-only sorting for other columns
  const handleHeaderClick = (column) => {
    let direction = 'asc';
    if (userSortState.column === column && userSortState.direction === 'asc') {
      direction = 'desc';
    }
    
    setUserSortState({
      column,
      direction
    });
    
    // Call onSort if provided (for UI updates only)
    if (onSort) {
      onSort(column, direction);
    }
  };

  // Get sort icon for columns
  const getSortIcon = (column) => {
    if (column === userSortState.column) {
      return userSortState.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  // Handle row selection
  const handleRowClick = (patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
  };

  return (
    <div className="pg-docs-table-container">
      <div className="sorting-info-box">
        <div className="sorting-info-title">
          <span className="sort-info-icon">ℹ️</span> Table is automatically sorted by:
        </div>
        <ul className="sorting-info-list">
          <li>New CPO Docs in <strong>ascending</strong> order (primary)</li>
          <li>New Docs in <strong>descending</strong> order (secondary)</li>
        </ul>
      </div>
      <table className="pg-docs-table">
        <thead>
          <tr className="pg-docs-table-header-row">
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleHeaderClick('ptName')}
            >
              Pt Name {getSortIcon('ptName')}
            </th>
            <th className="pg-docs-table-header-cell">DOB</th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleHeaderClick('pg')}
            >
              PG {getSortIcon('pg')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleHeaderClick('hhah')}
            >
              HHAH {getSortIcon('hhah')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleHeaderClick('cpoMinsCaptured')}
            >
              CPO mins captured {getSortIcon('cpoMinsCaptured')}
            </th>
            <th className="pg-docs-table-header-cell">Remarks</th>
            <th className="pg-docs-table-header-cell fixed-sort">
              New Docs <span className="permanent-sort-icon">↓</span>
            </th>
            <th className="pg-docs-table-header-cell fixed-sort">
              New CPO Docs <span className="permanent-sort-icon">↑</span>
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
              <td className="pg-docs-table-data-cell highlight-cell">{row.newDocs}</td>
              <td className="pg-docs-table-data-cell highlight-cell">{row.newCPODocsCreated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;