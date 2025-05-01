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
  const [newPGs, setNewPGs] = useState([]);
  const { 
    currentArea, 
    isLoading, 
    movePgToStage, 
    pgFunnelData, 
    setPgFunnelData,
    pgAssignments,
    setPgAssignments
  } = useContext(FunnelDataContext);

  // Use callbacks for handlers to prevent recreation on each render
  const handleOpenPGForm = useCallback(() => {
    setShowAddPGForm(true);
  }, []);

  const handleClosePGForm = useCallback(() => {
    setShowAddPGForm(false);
  }, []);

  const handleAddPG = useCallback((newPg) => {
    // Add to newPGs state for table display
    setNewPGs(prevPGs => [...prevPGs, newPg]);

    // Update funnel data and assignments
    if (movePgToStage) {
      // Update pgAssignments to include the new PG in its stage
      const updatedAssignments = { ...pgAssignments };
      if (!updatedAssignments[newPg.status]) {
        updatedAssignments[newPg.status] = [];
      }
      updatedAssignments[newPg.status].push(newPg.name);
      setPgAssignments(updatedAssignments);

      // Update funnel data counts
      const updatedFunnelData = pgFunnelData.map(stage => {
        if (stage.name === newPg.status) {
          return {
            ...stage,
            value: stage.value + 1
          };
        }
        return stage;
      });
      setPgFunnelData(updatedFunnelData);
    }
  }, [movePgToStage, pgFunnelData, setPgFunnelData, pgAssignments, setPgAssignments]);

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
        <PGListingTable currentArea={currentArea} newPGs={newPGs} />
        {showAddPGForm && (
          <MemoizedAddPGForm 
            onClose={handleClosePGForm} 
            currentArea={currentArea}
            onAddPG={handleAddPG}
          />
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
