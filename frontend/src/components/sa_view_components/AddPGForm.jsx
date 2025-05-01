import React, { useState } from 'react';
import { PG_STAGES } from './FunnelDataContext';
import '../sa_view_css/AddForm.css';

const AddPGForm = ({ onClose, currentArea, onAddPG }) => {
  const [pgName, setPgName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState(PG_STAGES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!pgName || !address || !contact) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new PG object
    const newPg = {
      name: pgName,
      address: address,
      city: currentArea,
      state: "State not available",
      zipcode: "Zip not available",
      phone: contact,
      status: status
    };
    
    // Pass the new PG to the parent component
    onAddPG(newPg);
    
    // Close the form
    onClose();
  };

  return (
    <div className="add-form-overlay">
      <div className="add-form-container">
        <h3>Add New Physician Group</h3>
        <button className="close-button" onClick={onClose}>×</button>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>PG Name</label>
            <input 
              type="text" 
              value={pgName} 
              onChange={(e) => setPgName(e.target.value)}
              placeholder="Enter PG name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Address</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Contact</label>
            <input 
              type="text" 
              value={contact} 
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter contact number"
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              {PG_STAGES.map((stage, index) => (
                <option key={index} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button">Add PG</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPGForm; 