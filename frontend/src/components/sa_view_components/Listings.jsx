import React, { useState, useContext, useCallback, memo } from 'react';
import PGListingTable from './PGListingTable';
import HHAHListingTable from './HHAHListingTable';
import AddPGForm from './AddPGForm';
import AddHHAHForm from './AddHHAHForm';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/Listings.css';

// Memoize the form components to prevent unnecessary re-renders
const MemoizedAddPGForm = memo(AddPGForm);
const MemoizedAddHHAHForm = memo(AddHHAHForm);

const Listings = () => {
  const [showAddPGForm, setShowAddPGForm] = useState(false);
  const [showAddHHAHForm, setShowAddHHAHForm] = useState(false);
  const { currentArea, isLoading } = useContext(FunnelDataContext);

  // Use callbacks for handlers to prevent recreation on each render
  const handleOpenPGForm = useCallback(() => {
    setShowAddPGForm(true);
  }, []);

  const handleClosePGForm = useCallback(() => {
    setShowAddPGForm(false);
  }, []);

  const handleOpenHHAHForm = useCallback(() => {
    setShowAddHHAHForm(true);
  }, []);

  const handleCloseHHAHForm = useCallback(() => {
    setShowAddHHAHForm(false);
  }, []);

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
            onClick={handleOpenPGForm}
          >
            + Add New PG
          </button>
        </div>
        <PGListingTable />
        {showAddPGForm && (
          <MemoizedAddPGForm onClose={handleClosePGForm} />
        )}
      </div>
      
      <div className="hhah-section">
        <div className="section-header">
          <h2 className="table-title">HHAH Listing for {currentArea}</h2>
          <button 
            className="add-button"
            onClick={handleOpenHHAHForm}
          >
            + Add New HHAH
          </button>
        </div>
        <HHAHListingTable />
        {showAddHHAHForm && (
          <MemoizedAddHHAHForm onClose={handleCloseHHAHForm} />
        )}
      </div>
    </div>
  );
};

// Memoize the entire Listings component to prevent unnecessary re-renders
export default memo(Listings);
