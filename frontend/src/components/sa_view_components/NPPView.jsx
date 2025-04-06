import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './NPPView.css';

const NPPView = () => {
  const { nppId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [nppData, setNppData] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [analysisEntries, setAnalysisEntries] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // If we have state from navigation, use it
    if (location.state?.npp) {
      // Make sure we have all required fields
      const npp = location.state.npp;
      setNppData({
        id: npp.id || nppId,
        name: npp.name || 'Unknown',
        nppId: npp.nppId || `NPP${npp.id || nppId}`,
        npi: npp.npi || 'Not provided',
        contact: npp.contact || 'Not provided',
        specialty: npp.specialty || 'Not specified',
        email: npp.email || 'Not provided',
        affiliation: npp.affiliation || 'Not specified',
        certification: npp.certification || 'Not specified',
        status: npp.status || 'Active'
      });
      // Load saved analysis entries if they exist
      const savedEntries = localStorage.getItem(`npp_analysis_entries_${npp.id || nppId}`);
      if (savedEntries) {
        setAnalysisEntries(JSON.parse(savedEntries));
      }
    } else {
      // Fetch NPP data based on ID (replace with actual API call)
      // For now, use mock data
      const mockNppData = {
        id: nppId || 'NPP1001',
        name: 'WRIGHT, ALEXIS K. FNP',
        nppId: `NPP${nppId || '1001'}`,
        npi: '1437668845',
        contact: '(806) 355-9355',
        specialty: 'Family Nurse Practitioner',
        email: 'awright@healthcare.com',
        affiliation: 'Amarillo Medical Group',
        certification: 'AANP Certified',
        status: 'Active'
      };
      setNppData(mockNppData);
      // Load saved analysis entries if they exist
      const savedEntries = localStorage.getItem(`npp_analysis_entries_${nppId || 'NPP1001'}`);
      if (savedEntries) {
        setAnalysisEntries(JSON.parse(savedEntries));
      }
    }
  }, [nppId, location.state]);

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
    localStorage.setItem(`npp_analysis_entries_${nppData.id}`, JSON.stringify(updatedEntries));
    setAnalysis('');
    showNotificationMessage('Analysis saved successfully!');
  };

  return (
    <div className="npp-view-container">
      {showNotification && (
        <div className="notification">
          {notificationMessage}
        </div>
      )}
      <div className="npp-header">
        <button className="back-button" onClick={handleBackClick}>
          <span className="back-arrow">←</span> Back
        </button>
        <h1>NPP Details</h1>
      </div>

      {nppData ? (
        <>
          <div className="npp-details-card">
            <h2 className="npp-title">NPP Listing</h2>
            <div className="npp-details-grid">
              <div className="detail-item">
                <div className="detail-label">NPP ID:</div>
                <div className="detail-value">{nppData.nppId}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{nppData.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">NPI:</div>
                <div className="detail-value">{nppData.npi}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact:</div>
                <div className="detail-value">{nppData.contact}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Specialty:</div>
                <div className="detail-value">{nppData.specialty}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{nppData.email}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Affiliation:</div>
                <div className="detail-value">{nppData.affiliation}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Certification:</div>
                <div className="detail-value">{nppData.certification}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge ${nppData.status ? nppData.status.toLowerCase() : 'unknown'}`}>
                    {nppData.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="npp-analysis-card">
            <h2 className="npp-subtitle">NPP Analysis</h2>
            <div className="analysis-content">
              <textarea 
                className="analysis-textarea"
                value={analysis}
                onChange={updateAnalysis}
                placeholder="Enter new analysis notes for this NPP..."
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
        <div className="loading">Loading NPP data...</div>
      )}
    </div>
  );
};

export default NPPView; 