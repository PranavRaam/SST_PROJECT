import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/PGListingTable.css';

// Dummy data for PG listing
const dummyPGData = [
  {
    name: "PG Alpha",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipcode: "10001",
    phone: "(555) 123-4567",
    status: "Active"
  },
  {
    name: "PG Beta",
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    zipcode: "90001",
    phone: "(555) 234-5678",
    status: "Active"
  },
  {
    name: "PG Gamma",
    address: "789 Pine St",
    city: "Chicago",
    state: "IL",
    zipcode: "60601",
    phone: "(555) 345-6789",
    status: "Inactive"
  },
  {
    name: "PG Delta",
    address: "321 Elm St",
    city: "Houston",
    state: "TX",
    zipcode: "77001",
    phone: "(555) 456-7890",
    status: "Active"
  },
  {
    name: "PG Epsilon",
    address: "654 Maple Ave",
    city: "Phoenix",
    state: "AZ",
    zipcode: "85001",
    phone: "(555) 567-8901",
    status: "Active"
  }
];

const PGListingTable = () => {
  const { currentArea, isLoading } = useContext(FunnelDataContext);
  const navigate = useNavigate();

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
      isLoading
    });
  }, [currentArea, isLoading]);

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
          {dummyPGData.map((pg, index) => (
            <tr 
              key={index} 
              className="pg-clickable-row"
              onClick={() => handleRowClick(pg)}
            >
              <td>{pg.name}</td>
              <td>{pg.address}, {pg.city}, {pg.state} {pg.zipcode}</td>
              <td>{pg.phone}</td>
              <td>{pg.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PGListingTable;
