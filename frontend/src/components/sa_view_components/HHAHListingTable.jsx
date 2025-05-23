import React, { useContext, useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelDataContext, HHAH_STAGES } from './FunnelDataContext';
import '../sa_view_css/HHAHListingTable.css';
import combinedData from '../../assets/data/combined_data.json';

const HHAHListingTable = memo(() => {
  const { currentArea, hhahData, hhahAssignments } = useContext(FunnelDataContext);
  const [filteredData, setFilteredData] = useState([]);
  const [hhahNames, setHhahNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRowClick = useCallback((hhah) => {
    navigate(`/hhah-view/${encodeURIComponent(hhah['Agency Name'])}`, {
      state: {
        hhahData: hhah
      }
    });
  }, [navigate]);

  // Get an agency's current funnel stage from the assignments
  const getAgencyStage = useCallback((agencyName) => {
    if (!hhahAssignments) return "Not Using"; // Default value
    
    for (const [stage, agencies] of Object.entries(hhahAssignments)) {
      if (agencies.includes(agencyName)) {
        return stage;
      }
    }
    
    return "Not Using"; // Default if not found in any stage
  }, [hhahAssignments]);

  // Memoize the getStatusClass function to prevent unnecessary calculations
  const getStatusClass = useCallback((status) => {
    const statusMap = {
      "Freemium": "status-freemium",
      "Not Using": "status-not-using",
      "Order360 Lite": "status-lite",
      "Order360 Full": "status-full",
      "Upsold (Fully subscribed)": "status-upsold"
    };
    
    return statusMap[status] || "status-default";
  }, []);

  // Memoize the getShortStatusName function
  const getShortStatusName = useCallback((status) => {
    const nameMap = {
      "Upsold (Fully subscribed)": "Fully Subscribed"
    };
    
    return nameMap[status] || status;
  }, []);

  useEffect(() => {
    console.log('HHAHListingTable: Data changed, re-filtering', {
      currentArea,
      hhahDataLength: hhahData?.length,
      hhahAssignments
    });
    
    // Check if we have data from the context first (preferred source)
    if (currentArea && hhahData && hhahData.length > 0) {
      console.log('Using HHAH data from context');
      const dataWithSyncedStatus = hhahData.map(agency => {
        // Make a copy of the agency data
        const updatedAgency = { ...agency };
        
        // Check if this agency has an assignment in the funnel
        const currentStage = getAgencyStage(agency['Agency Name']);
        if (currentStage && currentStage !== agency['Agency Type']) {
          // Update the agency type to match its funnel stage
          updatedAgency['Agency Type'] = currentStage;
        }
        
        return updatedAgency;
      });
      
      setFilteredData(dataWithSyncedStatus);
      // Store HHAH names
      setHhahNames(dataWithSyncedStatus.map(agency => agency['Agency Name']));
      return;
    }
    
    // Fallback to combined data if context data not available
    console.log('Falling back to combined data source');
    // Extract all HHAH data from the nested structure
    const allHHAHData = [
      ...(combinedData.West_Details || []),
      ...(combinedData.East_Central_Details || []),
      ...(combinedData.Central_Details || [])
    ];

    console.log('All HHAH Data Length:', allHHAHData.length);
    
    if (currentArea) {
      setIsLoading(true);
      // Filter the data based on Metropolitan (or Micropolitan) Area with case-insensitive comparison
      const filtered = allHHAHData.filter(item => {
        const itemArea = item['Metropolitan (or Micropolitan) Area']?.toLowerCase() || '';
        const selectedArea = currentArea.toLowerCase();
        return itemArea === selectedArea;
      });
      console.log('Filtered Data Length:', filtered.length);
      setFilteredData(filtered);
      // Store HHAH names
      setHhahNames(filtered.map(agency => agency['Agency Name']));
      setIsLoading(false);
    } else {
      setFilteredData([]);
      setHhahNames([]);
    }
  }, [currentArea, hhahData, hhahAssignments, getAgencyStage]);

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
              key={`agency-${hhah['Agency Name']}-${index}`} 
              className="hhah-clickable-row"
              onClick={() => handleRowClick(hhah)}
            >
              <td>{hhah['Agency Name']}</td>
              <td>{hhah['Address'] || 'N/A'}, {hhah['City'] || 'N/A'}, {hhah['State'] || 'N/A'} {hhah['Zipcode'] || 'N/A'}</td>
              <td>{hhah['Telephone'] || 'N/A'}</td>
              <td>
                <div className={getStatusClass(hhah['Agency Type'])}>
                  {getShortStatusName(hhah['Agency Type'] || 'Not Specified')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default HHAHListingTable;
