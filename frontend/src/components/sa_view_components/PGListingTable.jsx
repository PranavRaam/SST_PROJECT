import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../sa_view_css/PGListingTable.css';
import westPGData from '../../assets/data/west_pg_data.json';
import centralPGData from '../../assets/data/central_pg_data.json';
import eastCentralPGData from '../../assets/data/east_central_pg_data.json';

const PGListingTable = ({ currentArea, newPGs = [] }) => {
  const [displayData, setDisplayData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentArea) {
      // Get PGs from JSON files
      const westPGs = westPGData.West[currentArea] || [];
      const centralPGs = centralPGData.Central[currentArea] || [];
      const eastCentralPGs = eastCentralPGData.East_Central[currentArea] || [];
      
      // Combine PGs from all regions
      const allPGs = [...westPGs, ...centralPGs, ...eastCentralPGs];
      
      if (allPGs.length > 0) {
        // Transform the data to match the display format
        const transformedData = allPGs.map(pgName => {
          // Check if the PG is one of the special cases
          const isUpsoldPG = pgName === "HouseCall MD" || pgName === "Brownfield Family Physicians";
          
          return {
            name: pgName,
            address: "Address not available",
            city: currentArea,
            state: "State not available",
            zipcode: "Zip not available",
            phone: "Phone not available",
            status: isUpsoldPG ? "Upsold to CPO/etc..." : "On the platform"
          };
        });
        
        // Add any new PGs that were added through the form
        const combinedData = [...transformedData, ...newPGs];
        setDisplayData(combinedData);
      } else {
        setDisplayData(newPGs);
      }
    }
  }, [currentArea, newPGs]);

  const handleRowClick = (pg) => {
    navigate(`/pg-view/${encodeURIComponent(pg.name)}`, {
      state: {
        pgData: pg
      }
    });
  };

  if (!currentArea) {
    return (
      <div className="no-data-message">
        <p>Please select a Metropolitan Statistical Area</p>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="no-data-message">
        <p>No PGs available for {currentArea}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="note-banner">
        <p><strong>Note:</strong> Showing PG agencies for {currentArea}</p>
      </div>
      <table className="pg-table">
        <thead>
          <tr>
            <th>PG Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((pg, index) => (
            <tr 
              key={`pg-${pg.name}-${index}`} 
              className="pg-clickable-row"
              onClick={() => handleRowClick(pg)}
            >
              <td>{pg.name}</td>
              <td>{pg.address}, {pg.city}, {pg.state} {pg.zipcode}</td>
              <td>{pg.phone}</td>
              <td>
                <div className="pg-status pg-stage-unknown">
                  {pg.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PGListingTable;
