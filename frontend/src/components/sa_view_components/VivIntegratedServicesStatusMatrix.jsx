import React from 'react';
import './VivIntegratedServicesStatusMatrix.css';
import { FaCheck, FaTimes } from 'react-icons/fa';

const mockData = [
  {
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

const StatusIcon = ({ status, value }) => {
  if (typeof value === 'number') {
    return <span className={`viv-ism-status-number ${value >= 30 ? 'success' : 'warning'}`}>{value}</span>;
  }
  return status ? 
    <FaCheck className="viv-ism-icon success" /> : 
    <FaTimes className="viv-ism-icon error" />;
};

const VivIntegratedServicesStatusMatrix = () => {
  return (
    <div className="viv-ism-container">
      <div className="viv-ism-table-wrapper">
        <table className="viv-ism-table">
          <thead>
            <tr>
              <th>Pt name</th>
              <th>DOB</th>
              <th>PG</th>
              <th>HHAH</th>
              <th>Rendering Provider</th>
              <th>SOC</th>
              <th>Episode From</th>
              <th>Episode To</th>
              <th>Remarks</th>
              <th colSpan="3" className="viv-ism-service-header pg-services">
                PG Services
                <div className="viv-ism-subheaders">
                  <span>Docs prepared</span>
                  <span>15 CPO docs</span>
                  <span>30 CPO mins</span>
                </div>
              </th>
              <th colSpan="2" className="viv-ism-service-header hhah-services">
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
              <tr key={index}>
                <td>{row.ptName}</td>
                <td>{row.dob}</td>
                <td>{row.pg}</td>
                <td>{row.hhah}</td>
                <td>{row.renderingProvider}</td>
                <td>{row.soc}</td>
                <td>{row.episodeFrom}</td>
                <td>{row.episodeTo}</td>
                <td>{row.remarks}</td>
                <td><StatusIcon status={row.pgServices.docsPrepared} /></td>
                <td><StatusIcon status={row.pgServices.cpoDocsCreated} /></td>
                <td><StatusIcon value={row.pgServices.cpoMinsCaptured} /></td>
                <td><StatusIcon status={row.hhahServices.signed485} /></td>
                <td><StatusIcon status={row.hhahServices.docsSigned} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VivIntegratedServicesStatusMatrix;