import React, { useState, useMemo } from 'react';
import './ServicesTable.css';

// ... (keep the getSortedTableData function exactly as is) ...

const ServicesTable = ({ data, onSort, onSelectPatient }) => {
  const [userSortState, setUserSortState] = useState({
    column: null,
    direction: null
  });
  
  // State to track if table is reversed
  const [isReversed, setIsReversed] = useState(false);
  const [reversedColumn, setReversedColumn] = useState(null);

  // Use useMemo to optimize sorting
  const sortedData = useMemo(() => {
    let result = [...data];
    
    // Apply user sorting if any
    if (userSortState.column) {
      result.sort((a, b) => {
        const aValue = a[userSortState.column];
        const bValue = b[userSortState.column];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return userSortState.direction === 'asc' 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        const stringA = String(aValue).toLowerCase();
        const stringB = String(bValue).toLowerCase();
        
        return userSortState.direction === 'asc'
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      });
    }
    
    // Reverse the array if isReversed is true
    if (isReversed) {
      result = result.reverse();
    }
    
    return result;
  }, [data, isReversed, userSortState]);

  // Modify handleHeaderClick to handle reversing the table
  const handleHeaderClick = (column) => {
    if (column === 'newCPODocsCreated' || column === 'newDocs') {
      // If clicking the same column, toggle reverse state
      if (reversedColumn === column) {
        setIsReversed(prev => !prev);
      } else {
        // If clicking a different column, set it as the reversed column
        setIsReversed(true);
        setReversedColumn(column);
      }
      
      // Update the sort state for UI feedback
      setUserSortState({
        column,
        direction: isReversed ? 'asc' : 'desc'
      });
      return;
    }
    
    // Original logic for other columns
    let direction = 'asc';
    if (userSortState.column === column && userSortState.direction === 'asc') {
      direction = 'desc';
    }
    
    setUserSortState({
      column,
      direction
    });
    
    if (onSort) {
      onSort(column, direction);
    }
  };

  // Update getSortIcon to show proper icon for reversed columns
  const getSortIcon = (column) => {
    if (column === 'newCPODocsCreated' || column === 'newDocs') {
      if (reversedColumn === column) {
        return isReversed ? '↓' : '↑';
      }
      return '';
    }
    
    if (column === userSortState.column) {
      return userSortState.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  // ... (keep the rest of the component exactly the same, including the JSX) ...
  
  return (
    <div className="pg-docs-table-container">
      {/* ... (existing JSX remains the same) ... */}
      <table className="pg-docs-table">
        <thead>
          <tr className="pg-docs-table-header-row">
            {/* ... (other headers remain the same) ... */}
            <th 
              className="pg-docs-table-header-cell fixed-sort"
              onClick={() => handleHeaderClick('newCPODocsCreated')}
            >
              New CPO Docs <span className="permanent-sort-icon">
                {getSortIcon('newCPODocsCreated')}
              </span>
            </th>
            <th 
              className="pg-docs-table-header-cell fixed-sort"
              onClick={() => handleHeaderClick('newDocs')}
            >
              New Docs <span className="permanent-sort-icon">
                {getSortIcon('newDocs')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className="pg-docs-table-data-row">
              {/* ... (other cells remain the same) ... */}
              <td className="pg-docs-table-data-cell">
                {row.newCPODocsCreated}
              </td>
              <td className="pg-docs-table-data-cell">
                {row.newDocs}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;