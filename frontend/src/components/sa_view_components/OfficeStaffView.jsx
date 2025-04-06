import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './OfficeStaffView.css';

const OfficeStaffView = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [staffData, setStaffData] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [analysisEntries, setAnalysisEntries] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // If we have state from navigation, use it
    if (location.state?.staff) {
      // Make sure we have all required fields
      const staff = location.state.staff;
      setStaffData({
        id: staff.id || staffId,
        name: staff.name || 'Unknown',
        staffId: staff.staffId || `SA${staff.id || staffId}`,
        npi: staff.npi || 'Not provided',
        contact: staff.contact || 'Not provided',
        position: staff.position || 'Not specified',
        designation: staff.designation || 'Not specified',
        helperAccountDetails: staff.helperAccountDetails || 'Not provided',
        department: staff.department || 'Not specified',
        status: staff.status || 'Active'
      });
      // Load saved analysis entries if they exist
      const savedEntries = localStorage.getItem(`staff_analysis_entries_${staff.id || staffId}`);
      if (savedEntries) {
        setAnalysisEntries(JSON.parse(savedEntries));
      }
    } else {
      // Fetch Staff data based on ID (replace with actual API call)
      // For now, use mock data
      const mockStaffData = {
        id: staffId || 'SA001',
        name: 'Staff Name A',
        staffId: `SA${staffId || '001'}`,
        npi: '1234567890',
        contact: '(124) 2076107',
        position: 'Medical Assistant',
        designation: 'Designation 1',
        helperAccountDetails: 'Helper Account Details 1',
        department: 'Administration',
        status: 'Active'
      };
      setStaffData(mockStaffData);
      // Load saved analysis entries if they exist
      const savedEntries = localStorage.getItem(`staff_analysis_entries_${staffId || 'SA001'}`);
      if (savedEntries) {
        setAnalysisEntries(JSON.parse(savedEntries));
      }
    }
  }, [staffId, location.state]);

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const updateAnalysis = (e) => {
    setAnalysis(e.target.value);
  };

  const saveAnalysis = () => {
    if (analysis.trim() === '') {
      showNotificationMessage('Please enter some analysis before saving.');
      return;
    }

    const newEntry = {
      id: Date.now(),
      text: analysis,
      date: new Date().toLocaleString()
    };

    const updatedEntries = [newEntry, ...analysisEntries];
    setAnalysisEntries(updatedEntries);
    localStorage.setItem(`staff_analysis_entries_${staffData.id}`, JSON.stringify(updatedEntries));
    setAnalysis('');
    showNotificationMessage('Analysis saved successfully!');
  };

  return (
    <div className="office-staff-view-container">
      {showNotification && (
        <div className="notification">
          {notificationMessage}
        </div>
      )}
      <div className="office-staff-header">
        <button className="back-button" onClick={handleBackClick}>
          <span className="back-arrow">←</span> Back
        </button>
        <h1>Office Staff Details</h1>
      </div>

      {staffData ? (
        <>
          <div className="office-staff-details-card">
            <h2 className="office-staff-title">Office Staff Listing</h2>
            <div className="office-staff-details-grid">
              <div className="detail-item">
                <div className="detail-label">ID:</div>
                <div className="detail-value">{staffData.staffId}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{staffData.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact:</div>
                <div className="detail-value">{staffData.contact}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">NPI:</div>
                <div className="detail-value">{staffData.npi}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Staff:</div>
                <div className="detail-value">{staffData.designation}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Helper Account Details:</div>
                <div className="detail-value">{staffData.helperAccountDetails}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Position:</div>
                <div className="detail-value">{staffData.position}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Department:</div>
                <div className="detail-value">{staffData.department}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge ${staffData.status ? staffData.status.toLowerCase() : 'unknown'}`}>
                    {staffData.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="office-staff-analysis-card">
            <h2 className="office-staff-subtitle">Office Staff Analysis</h2>
            <div className="analysis-content">
              <textarea 
                className="analysis-textarea"
                value={analysis}
                onChange={updateAnalysis}
                placeholder="Enter new analysis notes for this staff member..."
              />
              <button className="save-analysis-button" onClick={saveAnalysis}>
                Save Analysis
              </button>
              
              {analysisEntries.length > 0 && (
                <div className="analysis-entries">
                  <h3>Analysis History</h3>
                  <div className="entries-list">
                    {analysisEntries.map(entry => (
                      <div key={entry.id} className="analysis-entry">
                        <div className="entry-date">{entry.date}</div>
                        <div className="entry-text">{entry.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="loading">Loading Office Staff data...</div>
      )}
    </div>
  );
};

export default OfficeStaffView; 