import React, { useState, useContext, useCallback } from 'react';
import { FunnelDataContext, HHAH_STAGES } from './FunnelDataContext';
import '../sa_view_css/AddForm.css';

const AddHHAHForm = React.memo(({ onClose }) => {
  const [hhahName, setHhahName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [telephone, setTelephone] = useState('');
  const [patients, setPatients] = useState('');
  const [unbilled, setUnbilled] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [funnelStage, setFunnelStage] = useState(HHAH_STAGES[0]);
  const { currentArea, hhahData, setHhahData, hhahFunnelData, updateHhahFunnelData } = useContext(FunnelDataContext) || {};

  // Use the stages from the FunnelDataContext
  const hhahStages = HHAH_STAGES;

  // Use useCallback to prevent recreation of handler functions on each render
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate form and context
    if (!hhahName || !address || !city || !state || !zipcode || !telephone) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!hhahData || !setHhahData || !hhahFunnelData || !updateHhahFunnelData) {
      alert('Context data is not available. Please try again later.');
      return;
    }

    // Add new HHAH to list with field names matching the HHAHListingTable expectations
    const newHhah = {
      'Agency Name': hhahName,
      'Address': address,
      'City': city,
      'State': state,
      'Zipcode': zipcode,
      'Telephone': telephone,
      'Agency Type': funnelStage,
      'Metropolitan (or Micropolitan) Area': currentArea,
      // Include other fields for internal use
      'patients': parseInt(patients || '0'),
      'unbilled': parseInt(unbilled || '0'),
      'outcomes': parseInt(outcomes || '0')
    };
    
    // Use functional updates to avoid stale closures
    setHhahData(prevData => [...prevData, newHhah]);
    
    // Update funnel data
    const newFunnelData = [...hhahFunnelData];
    const stageIndex = hhahStages.indexOf(funnelStage);
    
    if (stageIndex !== -1) {
      // Update the value for the stage
      newFunnelData[stageIndex].value += 1;
      
      // Update funnel assignments (add the new HHAH to its stage)
      updateHhahFunnelData(newFunnelData, hhahName, funnelStage);
    }
    
    // Close the form
    onClose();
  }, [
    hhahName, address, city, state, zipcode, telephone, 
    patients, unbilled, outcomes, funnelStage, 
    currentArea, hhahData, setHhahData, 
    hhahFunnelData, updateHhahFunnelData, hhahStages
  ]);

  // Optimize field change handlers
  const handleInputChange = useCallback((setter) => (e) => {
    setter(e.target.value);
  }, []);

  return (
    <div className="add-form-overlay">
      <div className="add-form-container">
        <h3>Add New HHAH Agency</h3>
        <button className="close-button" onClick={onClose}>×</button>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4 className="section-title">Basic Information</h4>
            
            <div className="form-group">
              <label>Agency Name</label>
              <input 
                type="text" 
                value={hhahName} 
                onChange={handleInputChange(setHhahName)}
                placeholder="Enter agency name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Telephone</label>
              <input 
                type="text" 
                value={telephone} 
                onChange={handleInputChange(setTelephone)}
                placeholder="(xxx) xxx-xxxx"
                required
              />
            </div>
          </div>
          
          <div className="form-section">
            <h4 className="section-title">Address Information</h4>
            
            <div className="form-group">
              <label>Street Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={handleInputChange(setAddress)}
                placeholder="Street address"
                required
              />
            </div>
            
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                value={city} 
                onChange={handleInputChange(setCity)}
                placeholder="City"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label>State</label>
                <input 
                  type="text" 
                  value={state} 
                  onChange={handleInputChange(setState)}
                  placeholder="State"
                  required
                />
              </div>
              
              <div className="form-group half">
                <label>Zipcode</label>
                <input 
                  type="text" 
                  value={zipcode} 
                  onChange={handleInputChange(setZipcode)}
                  placeholder="Zipcode"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h4 className="section-title">Business Details <span className="optional-tag">(Optional)</span></h4>
            
            <div className="form-row">
              <div className="form-group half">
                <label className="optional">Total Patients</label>
                <input 
                  type="number" 
                  value={patients} 
                  onChange={handleInputChange(setPatients)}
                  placeholder="Number of patients"
                  min="1"
                />
              </div>
              
              <div className="form-group half">
                <label className="optional">Unbilled Episodes</label>
                <input 
                  type="number" 
                  value={unbilled} 
                  onChange={handleInputChange(setUnbilled)}
                  placeholder="Unbilled episodes"
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="optional">Active/Reactive OC</label>
              <input 
                type="number" 
                value={outcomes} 
                onChange={handleInputChange(setOutcomes)}
                placeholder="Number of outcomes"
                min="0"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h4 className="section-title">Platform Status</h4>
            
            <div className="form-group">
              <label>Funnel Stage</label>
              <select 
                value={funnelStage} 
                onChange={handleInputChange(setFunnelStage)}
                required
              >
                {hhahStages.map((stage, index) => (
                  <option key={index} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add HHAH Agency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AddHHAHForm; 