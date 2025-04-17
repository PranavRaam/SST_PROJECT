import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// Explicitly import the CSS file to ensure it's properly processed in the build
import './VivIntegratedServicesStatusMatrix.css';

const mockData = [
  {
    id: "pt-001",
    ptName: "John Smith",
    dob: "1945-05-15",
    pg: "Sunshine Medical",
    hhah: "HomeHealth Plus",
    renderingProvider: "Dr. Sarah Johnson",
    soc: "2024-01-15",
    episodeFrom: "2024-01-15",
    episodeTo: "2024-03-15",
    remarks: "Regular follow-up",
    pgServices: {
      docsPrepared: true,
      cpoDocsCreated: true,
      cpoMinsCaptured: 32
    },
    hhahServices: {
      signed485: true,
      docsSigned: false
    }
  },
  {
    id: "pt-002",
    ptName: "Mary Johnson",
    dob: "1938-08-22",
    pg: "Wellness Care",
    hhah: "ComfortCare Services",
    renderingProvider: "Dr. Michael Chen",
    soc: "2024-02-01",
    episodeFrom: "2024-02-01",
    episodeTo: "2024-04-01",
    remarks: "New admission",
    pgServices: {
      docsPrepared: true,
      cpoDocsCreated: false,
      cpoMinsCaptured: 20
    },
    hhahServices: {
      signed485: false,
      docsSigned: false
    }
  },
  {
    id: "pt-003",
    ptName: "Robert Davis",
    dob: "1952-03-10",
    pg: "Premier Health",
    hhah: "HomeHealth Plus",
    renderingProvider: "Dr. Emily White",
    soc: "2024-01-20",
    episodeFrom: "2024-01-20",
    episodeTo: "2024-03-20",
    remarks: "Chronic care",
    pgServices: {
      docsPrepared: true,
      cpoDocsCreated: true,
      cpoMinsCaptured: 45
    },
    hhahServices: {
      signed485: true,
      docsSigned: true
    }
  },
  {
    id: "pt-004",
    ptName: "Patricia Brown",
    dob: "1960-11-28",
    pg: "Sunshine Medical",
    hhah: "CarePlus Services",
    renderingProvider: "Dr. Sarah Johnson",
    soc: "2024-02-05",
    episodeFrom: "2024-02-05",
    episodeTo: "2024-04-05",
    remarks: "Post-surgery care",
    pgServices: {
      docsPrepared: true,
      cpoDocsCreated: true,
      cpoMinsCaptured: 28
    },
    hhahServices: {
      signed485: true,
      docsSigned: true
    }
  },
  {
    id: "pt-005",
    ptName: "James Wilson",
    dob: "1955-07-14",
    pg: "Premier Health",
    hhah: "ComfortCare Services",
    renderingProvider: "Dr. David Lee",
    soc: "2024-01-25",
    episodeFrom: "2024-01-25",
    episodeTo: "2024-03-25",
    remarks: "Medication review",
    pgServices: {
      docsPrepared: false,
      cpoDocsCreated: false,
      cpoMinsCaptured: 15
    },
    hhahServices: {
      signed485: false,
      docsSigned: false
    }
  },
  {
    id: "pt-006",
    ptName: "Linda Martinez",
    dob: "1948-09-03",
    pg: "Wellness Care",
    hhah: "HomeHealth Plus",
    renderingProvider: "Dr. Michael Chen",
    soc: "2024-02-10",
    episodeFrom: "2024-02-10",
    episodeTo: "2024-04-10",
    remarks: "Routine checkup",
    pgServices: {
      docsPrepared: true,
      cpoDocsCreated: true,
      cpoMinsCaptured: 35
    },
    hhahServices: {
      signed485: true,
      docsSigned: true
    }
  },
  {
    id: "pt-007",
    ptName: "William Taylor",
    dob: "1942-12-18",
    pg: "Sunshine Medical",
    hhah: "CarePlus Services",
    renderingProvider: "Dr. Emily White",
    soc: "2024-01-30",
    episodeFrom: "2024-01-30",
    episodeTo: "2024-03-30",
    remarks: "Follow-up required",
    pgServices: {
      docsPrepared: true,
      cpoDocsCreated: false,
      cpoMinsCaptured: 22
    },
    hhahServices: {
      signed485: true,
      docsSigned: false
    }
  },
  {
    id: "pt-008",
    ptName: "Elizabeth Anderson",
    dob: "1957-04-25",
    pg: "Premier Health",
    hhah: "HomeHealth Plus",
    renderingProvider: "Dr. David Lee",
    soc: "2024-02-15",
    episodeFrom: "2024-02-15",
    episodeTo: "2024-04-15",
    remarks: "Initial assessment",
    pgServices: {
      docsPrepared: true,
      cpoDocsCreated: true,
      cpoMinsCaptured: 40
    },
    hhahServices: {
      signed485: false,
      docsSigned: false
    }
  }
];

// Backup inline styles for production deployments
const backupStyles = {
  container: {
    margin: '20px 0',
    padding: '0 24px',
    fontFamily: "'Inter', sans-serif",
    overflowX: 'auto',
    width: '100%'
  },
  tableWrapper: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
    minWidth: '100%'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    fontSize: '14px'
  },
  th: {
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    color: '#374151',
    padding: '16px',
    textAlign: 'center',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '12px',
    textAlign: 'center',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle'
  },
  serviceHeader: {
    backgroundColor: '#f3f4f6',
    textAlign: 'center',
    position: 'relative',
    padding: '16px 8px 45px'
  },
  pgServicesHeader: {
    color: '#2563eb',
    borderLeft: '1px solid #e5e7eb',
    minWidth: '300px'
  },
  hhahServicesHeader: {
    color: '#9333ea',
    minWidth: '200px'
  },
  successIcon: {
    color: '#22c55e',
    fontSize: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '24px',
    margin: '0 auto'
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '24px',
    margin: '0 auto'
  },
  statusNumber: {
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    display: 'inline-block',
    minWidth: '45px',
    textAlign: 'center',
    margin: '0 auto'
  },
  successNumber: {
    color: '#15803d',
    backgroundColor: '#dcfce7'
  },
  warningNumber: {
    color: '#b45309',
    backgroundColor: '#fef3c7'
  },
  tr: {
    cursor: 'pointer'
  }
};

const StatusIcon = ({ status, value }) => {
  if (typeof value === 'number') {
    const style = {
      ...backupStyles.statusNumber,
      ...(value >= 30 ? backupStyles.successNumber : backupStyles.warningNumber)
    };
    
    return (
      <span 
        className={`viv-ism-status-number ${value >= 30 ? 'success' : 'warning'}`}
        style={style}
      >
        {value}
      </span>
    );
  }
  
  return status ? (
    <FaCheck 
      className="viv-ism-icon success" 
      style={backupStyles.successIcon}
    />
  ) : (
    <FaTimes 
      className="viv-ism-icon error" 
      style={backupStyles.errorIcon}
    />
  );
};

const VivIntegratedServicesStatusMatrix = () => {
  const navigate = useNavigate();

  const handlePatientClick = (patient) => {
    // Transform the patient data to match the format expected by PatientDetailView
    const transformedPatient = {
      id: patient.id,
      ptName: patient.ptName,
      patientFirstName: patient.ptName.split(' ')[0],
      patientLastName: patient.ptName.split(' ')[1] || '',
      dob: patient.dob,
      pg: patient.pg,
      hhah: patient.hhah,
      renderingProvider: patient.renderingProvider,
      renderingPractitioner: patient.renderingProvider,
      patientSOC: patient.soc,
      patientEpisodeFrom: patient.episodeFrom,
      patientEpisodeTo: patient.episodeTo,
      patientRemarks: patient.remarks,
      cpoMinsCaptured: patient.pgServices.cpoMinsCaptured,
      docsPrepared: patient.pgServices.docsPrepared,
      newCpoDocsCreated: patient.pgServices.cpoDocsCreated,
      signed485: patient.hhahServices.signed485,
      docsSigned: patient.hhahServices.docsSigned
    };
    
    // Navigate to the appropriate service view with the transformed patient data
    if (patient.pg.includes('Premier') || patient.pg.includes('Sunshine')) {
      // Navigate to PG service view with this patient
      navigate('/pg-services', { state: { selectedPatient: transformedPatient } });
    } else {
      // Navigate to HHAH service view with this patient
      navigate('/hhah-services', { state: { selectedPatient: transformedPatient } });
    }
  };

  return (
    <div className="viv-ism-container" style={backupStyles.container}>
      <div className="viv-ism-table-wrapper" style={backupStyles.tableWrapper}>
        <table className="viv-ism-table" style={backupStyles.table}>
          <thead>
            <tr>
              <th style={backupStyles.th}>Pt name</th>
              <th style={backupStyles.th}>DOB</th>
              <th style={backupStyles.th}>PG</th>
              <th style={backupStyles.th}>HHAH</th>
              <th style={backupStyles.th}>Rendering Provider</th>
              <th style={backupStyles.th}>SOC</th>
              <th style={backupStyles.th}>Episode From</th>
              <th style={backupStyles.th}>Episode To</th>
              <th style={backupStyles.th}>Remarks</th>
              <th 
                colSpan="3" 
                className="viv-ism-service-header pg-services"
                style={{
                  ...backupStyles.serviceHeader,
                  ...backupStyles.pgServicesHeader
                }}
              >
                PG Services
                <div className="viv-ism-subheaders">
                  <span>Docs prepared</span>
                  <span>15 CPO docs</span>
                  <span>30 CPO mins</span>
                </div>
              </th>
              <th 
                colSpan="2" 
                className="viv-ism-service-header hhah-services"
                style={{
                  ...backupStyles.serviceHeader,
                  ...backupStyles.hhahServicesHeader
                }}
              >
                HHAH Services
                <div className="viv-ism-subheaders">
                  <span>485 signed</span>
                  <span>Docs signed</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((row, index) => (
              <tr 
                key={index} 
                onClick={() => handlePatientClick(row)}
                style={{ cursor: 'pointer', ...backupStyles.tr }}
                className="viv-ism-row"
              >
                <td style={backupStyles.td}>{row.ptName}</td>
                <td style={backupStyles.td}>{row.dob}</td>
                <td style={backupStyles.td}>{row.pg}</td>
                <td style={backupStyles.td}>{row.hhah}</td>
                <td style={backupStyles.td}>{row.renderingProvider}</td>
                <td style={backupStyles.td}>{row.soc}</td>
                <td style={backupStyles.td}>{row.episodeFrom}</td>
                <td style={backupStyles.td}>{row.episodeTo}</td>
                <td style={backupStyles.td}>{row.remarks}</td>
                <td style={backupStyles.td}><StatusIcon status={row.pgServices.docsPrepared} /></td>
                <td style={backupStyles.td}><StatusIcon status={row.pgServices.cpoDocsCreated} /></td>
                <td style={backupStyles.td}><StatusIcon value={row.pgServices.cpoMinsCaptured} /></td>
                <td style={backupStyles.td}><StatusIcon status={row.hhahServices.signed485} /></td>
                <td style={backupStyles.td}><StatusIcon status={row.hhahServices.docsSigned} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VivIntegratedServicesStatusMatrix;