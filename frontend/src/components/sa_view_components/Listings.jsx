import React, { useState, useContext } from 'react';
import PGListingTable from './PGListingTable';
import HHAHListingTable from './HHAHListingTable';
import AddPGForm from './AddPGForm';
import AddHHAHForm from './AddHHAHForm';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/Listings.css';

const Listings = () => {
  const [showAddPGForm, setShowAddPGForm] = useState(false);
  const [showAddHHAHForm, setShowAddHHAHForm] = useState(false);
  const { currentArea, isLoading } = useContext(FunnelDataContext);

  if (isLoading) {
    return (
      <div className="listings-container loading">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Loading agency data...</p>
        </div>
      </div>
    );
  }

  if (!currentArea) {
    return (
      <div className="listings-container no-area">
        <div className="no-area-message">
          <p>No statistical area selected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="listings-container">
      <div className="pg-section">
        <div className="section-header">
          <h2 className="table-title">PG Listing for {currentArea}</h2>
          <button 
            className="add-button"
            onClick={() => setShowAddPGForm(true)}
          >
            + Add New PG
          </button>
        </div>
        <PGListingTable />
        {showAddPGForm && (
          <AddPGForm onClose={() => setShowAddPGForm(false)} />
        )}
      </div>
      
      <div className="hhah-section">
        <div className="section-header">
          <h2 className="table-title">HHAH Listing for {currentArea}</h2>
          <button 
            className="add-button"
            onClick={() => setShowAddHHAHForm(true)}
          >
            + Add New HHAH
          </button>
        </div>
        <HHAHListingTable />
        {showAddHHAHForm && (
          <AddHHAHForm onClose={() => setShowAddHHAHForm(false)} />
        )}
      </div>
    </div>
  );
};

export default Listings;
