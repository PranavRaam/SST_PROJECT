import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelDataContext, PG_STAGES } from './FunnelDataContext';
import '../sa_view_css/PGListingTable.css';

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
  const { currentArea, isLoading, pgData, pgAssignments } = useContext(FunnelDataContext);
  const [displayData, setDisplayData] = useState(dummyPGData);
  const navigate = useNavigate();

  // Get PG funnel stage (status) from assignments
  const getPgStage = (pgName) => {
    if (!pgAssignments) return "Not assigned";
    
    for (const [stage, pgs] of Object.entries(pgAssignments)) {
      if (pgs.includes(pgName)) {
        return stage;
      }
    }
    
    return PG_STAGES[0]; // Default to first stage if not found
  };

  useEffect(() => {
    // Build the real PG data from pgData and pgAssignments
    if (pgData && pgData.length > 0) {
      const realPgData = pgData.map(pg => ({
        name: pg['Agency Name'],
        address: pg['Address'] || "123 Business Rd",
        city: pg['City'] || "Health City",
        state: pg['State'] || "TX",
        zipcode: pg['Zipcode'] || "12345",
        phone: pg['Telephone'] || "(555) 123-4567",
        status: getPgStage(pg['Agency Name'])
      }));
      
      setDisplayData(realPgData.length > 0 ? realPgData : dummyPGData);
    }
  }, [pgData, pgAssignments]);

  const handleRowClick = (pg) => {
    navigate(`/pg-view/${encodeURIComponent(pg.name)}`, {
      state: {
        pgData: pg
      }
    });
  };

  useEffect(() => {
    console.log('PGListingTable rendered with:', {
      currentArea,
      isLoading,
      pgDataCount: pgData?.length,
      hasAssignments: !!pgAssignments
    });
  }, [currentArea, isLoading, pgData, pgAssignments]);

  // Helper function to get the stage class
  const getStageClass = (stageName) => {
    const stageIndex = PG_STAGES.indexOf(stageName);
    if (stageIndex === -1) return "pg-stage-unknown";
    return `pg-stage-${stageIndex + 1}`;
  };

  // Get a shorter display name for the status
  const getShortStatusName = (stageName) => {
    const stageMap = {
      "They exist but they haven't heard of us": "Haven't heard of us",
      "They've now heard of us but that's it": "Heard of us",
      "Enough interest that they're interacting with our content": "Interacting with content",
      "Enough interest that they're now talking to us": "Talking to us",
      "They've had a demo": "Had demo",
      "In the buying process": "Buying process",
      "Deal is so hot your hands will burn if you touch it": "Hot deal",
      "On the platform": "On platform",
      "In the upselling zone": "Upselling zone",
      "Upsold to CPOs/CCMs/RPMs/other services": "Upsold"
    };

    return stageMap[stageName] || stageName;
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
                <div className={`pg-status ${getStageClass(pg.status)}`}>
                  {getShortStatusName(pg.status)}
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
