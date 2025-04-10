import React, { useContext, useEffect } from 'react';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/PGListingTable.css';

const PGListingTable = () => {
  const { pgData, isLoading, currentArea } = useContext(FunnelDataContext);

  useEffect(() => {
    console.log('PGListingTable rendered with data:', {
      pgDataLength: pgData?.length || 0,
      isLoading,
      currentArea
    });
  }, [pgData, isLoading, currentArea]);

  if (isLoading) {
    return <div className="loading-message">Loading PG data...</div>;
  }

  if (!pgData || pgData.length === 0) {
    return (
      <div className="no-data-message">
        <p>No PG data available for area: {currentArea || 'None selected'}</p>
        <p className="hint">This could be because:</p>
        <ul>
          <li>The selected statistical area doesn't match any areas in the dataset</li>
          <li>There are no PG agencies in this statistical area</li>
          <li>PG agencies in this demo are derived from HHAH agencies with type 'Freemium', 'Order360 Lite', or 'Order360 Full'</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="note-banner">
        <p><strong>Note:</strong> In this demo, PGs are derived from HHAH agencies with type 'Freemium', 'Order360 Lite', or 'Order360 Full'</p>
      </div>
      <table className="pg-table">
        <thead>
          <tr>
            <th>Agency Name (as PG)</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {pgData.map((pg, index) => (
            <tr key={index} className="pg-clickable-row">
              <td>{pg['Agency Name']} (PG)</td>
              <td>{pg['Address'] || 'N/A'}, {pg['City'] || 'N/A'}, {pg['State'] || 'N/A'} {pg['Zipcode'] || 'N/A'}</td>
              <td>{pg['Telephone'] || 'N/A'}</td>
              <td>{pg['Agency Type'] || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PGListingTable;
