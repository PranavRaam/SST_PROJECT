import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/HHAHListingTable.css';
import combinedData from '../../assets/data/combined_data.json';

const HHAHListingTable = () => {
  const { currentArea } = useContext(FunnelDataContext);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRowClick = (hhah) => {
    navigate(`/hhah-view/${encodeURIComponent(hhah['Agency Name'])}`, {
      state: {
        hhahData: hhah
      }
    });
  };

  useEffect(() => {
    console.log('Current Area:', currentArea);
    console.log('Combined Data:', combinedData);
    
    // Extract all HHAH data from the nested structure
    const allHHAHData = [
      ...(combinedData.West_Details || []),
      ...(combinedData.East_Central_Details || []),
      ...(combinedData.Central_Details || [])
    ];

    console.log('All HHAH Data Length:', allHHAHData.length);
    console.log('First few items in HHAH data:', allHHAHData.slice(0, 3));
    
    if (currentArea) {
      setIsLoading(true);
      // Filter the data based on Metropolitan (or Micropolitan) Area with case-insensitive comparison
      const filtered = allHHAHData.filter(item => {
        const itemArea = item['Metropolitan (or Micropolitan) Area']?.toLowerCase() || '';
        const selectedArea = currentArea.toLowerCase();
        const matches = itemArea === selectedArea;
        console.log('Checking item:', {
          name: item['Agency Name'],
          itemArea,
          selectedArea,
          matches
        });
        return matches;
      });
      console.log('Filtered Data Length:', filtered.length);
      console.log('Filtered Data:', filtered);
      setFilteredData(filtered);
      setIsLoading(false);
    } else {
      setFilteredData([]);
    }
  }, [currentArea]);

  if (isLoading) {
    return <div className="loading-message">Loading HHAH data...</div>;
  }

  if (!currentArea) {
    return (
      <div className="no-data-message">
        <p>Please select a Metropolitan Statistical Area</p>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="no-data-message">
        <p>No HHAH data available for area: {currentArea}</p>
        <p className="hint">This could be because:</p>
        <ul>
          <li>The selected area name doesn't match any areas in the dataset</li>
          <li>The area name might be spelled differently in the dataset</li>
          <li>There are no HHAH agencies in this area</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="note-banner">
        <p><strong>Note:</strong> Showing HHAH agencies for {currentArea}</p>
      </div>
      <table className="hhah-table">
        <thead>
          <tr>
            <th>Agency Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((hhah, index) => (
            <tr 
              key={index} 
              className="hhah-clickable-row"
              onClick={() => handleRowClick(hhah)}
            >
              <td>{hhah['Agency Name']}</td>
              <td>{hhah['Address'] || 'N/A'}, {hhah['City'] || 'N/A'}, {hhah['State'] || 'N/A'} {hhah['Zipcode'] || 'N/A'}</td>
              <td>{hhah['Telephone'] || 'N/A'}</td>
              <td>{hhah['Agency Type'] || 'Not Specified'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HHAHListingTable;
