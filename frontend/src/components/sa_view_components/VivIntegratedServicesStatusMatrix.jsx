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
    remarks: "CERT signed",
    primaryDiagnosis: ["I10 ", "E11.9 "],
    secondaryDiagnosis: ["E78.5 ", "I25.10 "],
    insurance: "Medicare",
    physician: "Dr. Sarah Johnson",
    patientContact: {
      phone: "(555) 123-4567",
      email: "john.smith@example.com",
      address: "123 Main St, Indianapolis, IN 46201"
    },
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
    remarks: "ICD incomplete",
    primaryDiagnosis: ["I50.9 ", "J44.9 "],
    secondaryDiagnosis: ["I27.0 ", "E87.2 "],
    insurance: "Medicare Advantage",
    physician: "Dr. Michael Chen",
    patientContact: {
      phone: "(555) 234-5678",
      email: "mary.johnson@example.com",
      address: "456 Oak Ave, Carmel, IN 46032"
    },
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
    remarks: "CPO completed",
    primaryDiagnosis: ["M17.9 ", "M81.0 "],
    secondaryDiagnosis: ["M54.5 "],
    insurance: "Private Insurance",
    physician: "Dr. Emily White",
    patientContact: {
      phone: "(555) 345-6789",
      email: "robert.davis@example.com",
      address: "789 Pine St, Fishers, IN 46038"
    },
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
    remarks: "RECERT pending",
    primaryDiagnosis: ["Z47.1 ", "M17.9 "],
    secondaryDiagnosis: ["Z79.899 "],
    insurance: "Medicare",
    physician: "Dr. Sarah Johnson",
    patientContact: {
      phone: "(555) 456-7890",
      email: "patricia.brown@example.com",
      address: "321 Elm St, Noblesville, IN 46060"
    },
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
    remarks: "CPO not eligible",
    primaryDiagnosis: ["G20 ", "G25.0 "],
    secondaryDiagnosis: ["F02.80 "],
    insurance: "Medicare",
    physician: "Dr. David Lee",
    patientContact: {
      phone: "(555) 567-8901",
      email: "james.wilson@example.com",
      address: "654 Maple Dr, Westfield, IN 46074"
    },
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
    remarks: "Billing active",
    primaryDiagnosis: ["N18.9 "],
    secondaryDiagnosis: ["D64.9 ", "E87.2 "],
    insurance: "Medicare",
    physician: "Dr. Michael Chen",
    patientContact: {
      phone: "(555) 678-9012",
      email: "linda.martinez@example.com",
      address: "987 Cedar Ln, Zionsville, IN 46077"
    },
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
    remarks: "CERT signed",
    primaryDiagnosis: ["G30.9 "],
    secondaryDiagnosis: ["F03.90 ", "F32.9 "],
    insurance: "Medicare Advantage",
    physician: "Dr. Emily White",
    patientContact: {
      phone: "(555) 789-0123",
      email: "william.taylor@example.com",
      address: "741 Birch St, Brownsburg, IN 46112"
    },
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
    remarks: "CPO completed",
    primaryDiagnosis: ["I63.9 ", "I10 "],
    secondaryDiagnosis: ["I69.90 "],
    insurance: "Private Insurance",
    physician: "Dr. David Lee",
    patientContact: {
      phone: "(555) 890-1234",
      email: "elizabeth.anderson@example.com",
      address: "852 Walnut Dr, Avon, IN 46123"
    },
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
    navigate('/integrated-services', {
      state: { patientData: patient }
    });
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
              <th style={backupStyles.th}>Primary Diagnosis</th>
              <th style={backupStyles.th}>Secondary Diagnosis</th>
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
                <td style={backupStyles.td}>{Array.isArray(row.primaryDiagnosis) ? row.primaryDiagnosis.join(', ') : row.primaryDiagnosis}</td>
                <td style={backupStyles.td}>{Array.isArray(row.secondaryDiagnosis) ? row.secondaryDiagnosis.join(', ') : row.secondaryDiagnosis}</td>
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