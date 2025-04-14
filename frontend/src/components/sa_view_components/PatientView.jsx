import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../sa_view_css/PatientView.css';

const PatientView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const patientData = location.state?.patientData;

  if (!patientData) {
    return (
      <div className="patient-view-container error">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <div className="error-message">
          <h2>Patient Not Found</h2>
          <p>The requested patient information could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-view-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      
      <div className="patient-header">
        <h1>{patientData.ptName}</h1>
        <div className="patient-basic-info">
          <span>DOB: {patientData.dob}</span>
          <span>ID: {patientData.id}</span>
        </div>
      </div>

      <div className="patient-details-grid">
        <div className="detail-section">
          <h2>Provider Information</h2>
          <div className="detail-item">
            <label>PG:</label>
            <span>{patientData.pg}</span>
          </div>
          <div className="detail-item">
            <label>HHAH:</label>
            <span>{patientData.hhah}</span>
          </div>
          <div className="detail-item">
            <label>Rendering Provider:</label>
            <span>{patientData.renderingProvider}</span>
          </div>
        </div>

        <div className="detail-section">
          <h2>Episode Information</h2>
          <div className="detail-item">
            <label>SOC:</label>
            <span>{patientData.soc}</span>
          </div>
          <div className="detail-item">
            <label>Episode From:</label>
            <span>{patientData.episodeFrom}</span>
          </div>
          <div className="detail-item">
            <label>Episode To:</label>
            <span>{patientData.episodeTo}</span>
          </div>
          <div className="detail-item">
            <label>Remarks:</label>
            <span>{patientData.remarks}</span>
          </div>
        </div>

        <div className="detail-section">
          <h2>PG Services Status</h2>
          <div className="detail-item">
            <label>Documents Prepared:</label>
            <span className={patientData.pgServices.docsPrepared ? 'status-success' : 'status-pending'}>
              {patientData.pgServices.docsPrepared ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="detail-item">
            <label>CPO Documents Created:</label>
            <span className={patientData.pgServices.cpoDocsCreated ? 'status-success' : 'status-pending'}>
              {patientData.pgServices.cpoDocsCreated ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="detail-item">
            <label>CPO Minutes Captured:</label>
            <span className={patientData.pgServices.cpoMinsCaptured >= 30 ? 'status-success' : 'status-warning'}>
              {patientData.pgServices.cpoMinsCaptured} minutes
            </span>
          </div>
        </div>

        <div className="detail-section">
          <h2>HHAH Services Status</h2>
          <div className="detail-item">
            <label>485 Signed:</label>
            <span className={patientData.hhahServices.signed485 ? 'status-success' : 'status-pending'}>
              {patientData.hhahServices.signed485 ? 'Signed' : 'Pending'}
            </span>
          </div>
          <div className="detail-item">
            <label>Documents Signed:</label>
            <span className={patientData.hhahServices.docsSigned ? 'status-success' : 'status-pending'}>
              {patientData.hhahServices.docsSigned ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientView; 