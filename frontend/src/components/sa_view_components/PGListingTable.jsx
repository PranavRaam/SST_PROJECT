import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelDataContext, PG_STAGES } from './FunnelDataContext';
import '../sa_view_css/PGListingTable.css';
import westPGData from '../../assets/data/west_pg_data.json';
import centralPGData from '../../assets/data/central_pg_data.json';
import eastCentralPGData from '../../assets/data/east_central_pg_data.json';

// Dummy data fallback for PG listing
const dummyPGData = [
  {
    name: "PG Alpha",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipcode: "10001",
    phone: "(555) 123-4567",
    status: "They exist but they haven't heard of us"
  },
  {
    name: "PG Beta",
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    zipcode: "90001",
    phone: "(555) 234-5678",
    status: "They've now heard of us but that's it"
  },
  {
    name: "PG Gamma",
    address: "789 Pine St",
    city: "Chicago",
    state: "IL",
    zipcode: "60601",
    phone: "(555) 345-6789",
    status: "Enough interest that they're interacting with our content"
  },
  {
    name: "PG Delta",
    address: "321 Elm St",
    city: "Houston",
    state: "TX",
    zipcode: "77001",
    phone: "(555) 456-7890",
    status: "On the platform"
  },
  {
    name: "PG Epsilon",
    address: "654 Maple Ave",
    city: "Phoenix",
    state: "AZ",
    zipcode: "85001",
    phone: "(555) 567-8901",
    status: "Deal is so hot your hands will burn if you touch it"
  }
];

const PGListingTable = () => {
  const { currentArea, isLoading } = useContext(FunnelDataContext);
  const [displayData, setDisplayData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentArea) {
      // Check all three regions for PGs
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
        
        setDisplayData(transformedData);
      } else {
        setDisplayData([]);
      }
    }
  }, [currentArea]);

  const handleRowClick = (pg) => {
    navigate(`/pg-view/${encodeURIComponent(pg.name)}`, {
      state: {
        pgData: pg
      }
    });
  };

  if (isLoading) {
    return <div className="loading-message">Loading PG data...</div>;
  }

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
