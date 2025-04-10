import React, { useContext, useEffect } from 'react';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/HHAHListingTable.css';

const HHAHListingTable = () => {
  const { hhahData, isLoading, currentArea } = useContext(FunnelDataContext);

  useEffect(() => {
    console.log('HHAHListingTable rendered with data:', {
      hhahDataLength: hhahData?.length || 0,
      isLoading,
      currentArea
    });
  }, [hhahData, isLoading, currentArea]);

  if (isLoading) {
    return <div className="loading-message">Loading HHAH data...</div>;
  }

  if (!hhahData || hhahData.length === 0) {
    return (
      <div className="no-data-message">
        <p>No HHAH data available for area: {currentArea || 'None selected'}</p>
        <p className="hint">This could be because:</p>
        <ul>
          <li>The selected statistical area doesn't match any areas in the dataset</li>
          <li>The statistical area name might be spelled differently in the CSV file</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="note-banner">
        <p><strong>Note:</strong> All agencies in this data set are from the provided CSV file.</p>
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
          {hhahData.map((hhah, index) => (
            <tr key={index} className="hhah-clickable-row">
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
