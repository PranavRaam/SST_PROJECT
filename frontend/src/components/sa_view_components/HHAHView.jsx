import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../sa_view_css/HHAHView.css';
import './StaffList.css';
import './Patients.css';
import './InteractionLog.css';
import './ValueCommunication.css';
import '../sa_view_css/Rapport.css';
import StaffList from './StaffList';
import Patients from './Patients';
import ReactiveOutcomes from './reactiveoc';
import InteractionLog from './InteractionLog';

const HHAHView = () => {
  const navigate = useNavigate();
  const { hhahName } = useParams();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Add state for tracking if we're viewing from physician context
  const [fromPhysician, setFromPhysician] = useState(false);
  const [physicianContext, setPhysicianContext] = useState(null);
  
  // Add useEffect to check if we're coming from a physician view
  useEffect(() => {
    if (location.state?.fromPhysician) {
      setFromPhysician(true);
      setPhysicianContext({
        id: location.state.physicianId,
        name: location.state.physicianName
      });
    }
  }, [location]);

  // Add function to handle back navigation
  const handleBackNavigation = () => {
    if (fromPhysician && physicianContext) {
      navigate(`/physician/${physicianContext.id}`);
    } else {
      navigate('/');
    }
  };
  
  // Add new state for form inputs
  const [newPhysician, setNewPhysician] = useState({
    name: "",
    specialty: "",
    practice: "",
    location: "",
    status: "active"
  });

  // Add state for HHAH data
  const [hhahData, setHhahData] = useState({
    name: hhahName,
    type: "HHAH",
    status: "Active",
    contact: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "(555) 123-4567"
    },
    patients: [
      {
        id: 1,
        name: "John Smith",
        socDate: "2024-03-01",
        episodeFrom: "2024-03-05",
        episodeTo: "2024-04-05",
        billed: true
      },
      {
        id: 2,
        name: "Jane Doe",
        socDate: "2024-03-05",
        episodeFrom: "2024-03-10",
        episodeTo: "2024-05-10",
        billed: false
      },
      {
        id: 3,
        name: "Robert Johnson",
        socDate: "2024-03-10",
        episodeFrom: "2024-03-15",
        episodeTo: "2024-04-15",
        billed: true
      },
      {
        id: 4,
        name: "Emily Davis",
        socDate: "2024-03-15",
        episodeFrom: "2024-03-20",
        episodeTo: "2024-05-20",
        billed: false
      }
    ],
    recentActivities: [
      { date: "2024-03-15", type: "Meeting", description: "Quarterly review" },
      { date: "2024-03-10", type: "Call", description: "Follow-up on outcomes" },
      { date: "2024-03-05", type: "Email", description: "New partnership proposal" }
    ],
    staff: [
      {
        id: 1,
        name: "Sarah Johnson",
        position: "Office Manager",
        department: "Administration",
        status: "Active"
      },
      {
        id: 2,
        name: "Michael Chen",
        position: "Medical Records Specialist",
        department: "Clinical",
        status: "Active"
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        position: "Billing Coordinator",
        department: "Finance",
        status: "Active"
      },
      {
        id: 4,
        name: "David Wilson",
        position: "Patient Care Coordinator",
        department: "Clinical",
        status: "Active"
      },
      {
        id: 5,
        name: "Lisa Anderson",
        position: "Administrative Assistant",
        department: "Administration",
        status: "Active"
      },
      {
        id: 6,
        name: "Robert Taylor",
        position: "IT Support Specialist",
        department: "IT",
        status: "Active"
      },
      {
        id: 7,
        name: "Jennifer Lee",
        position: "Quality Assurance Coordinator",
        department: "Clinical",
        status: "Active"
      },
      {
        id: 8,
        name: "Thomas Brown",
        position: "Human Resources Manager",
        department: "HR",
        status: "Active"
      }
    ],
    proactiveOutcomes: [
      { id: 1, type: "Training", date: "2024-03-01", status: "Completed", value: 5000 },
      { id: 2, type: "Equipment", date: "2024-02-15", status: "In Progress", value: 3000 },
      { id: 3, type: "Process Improvement", date: "2024-02-01", status: "Planned", value: 2000 }
    ],
    reactiveOutcomes: [
      { id: 1, type: "Issue Resolution", date: "2024-03-10", status: "Resolved", impact: "High" },
      { id: 2, type: "Complaint", date: "2024-03-05", status: "Pending", impact: "Medium" },
      { id: 3, type: "Feedback", date: "2024-02-28", status: "Addressed", impact: "Low" }
    ],
    interactionLog: [
      { id: 1, date: "2024-03-15", type: "Meeting", notes: "Quarterly review discussion", outcome: "Positive" },
      { id: 2, date: "2024-03-10", type: "Call", notes: "Follow-up on previous issues", outcome: "Neutral" },
      { id: 3, date: "2024-03-05", type: "Email", notes: "New partnership details", outcome: "Positive" }
    ],
    valueCommunication: {
      metrics: {
        patientSatisfaction: 92,
        responseTime: 85,
        qualityScore: 88
      },
      improvements: [
        { area: "Response Time", current: 85, target: 90 },
        { area: "Patient Care", current: 88, target: 95 },
        { area: "Staff Training", current: 75, target: 85 }
      ]
    }
  });

  // Add value communication state
  const [valueCommunicationState, setValueCommunicationState] = useState({
    reports: [
      // MBR Reports
      {
        id: 1,
        fileName: "MBR_Report_2024-03-01.pdf",
        notes: "Monthly business review focusing on patient outcomes and staff performance",
        date: "2024-03-01"
      },
      {
        id: 2,
        fileName: "MBR_Report_2024-02-01.pdf",
        notes: "Monthly review of operational metrics and quality improvements",
        date: "2024-02-01"
      },
      // Weekly Reports
      {
        id: 3,
        fileName: "Weekly_Update_2024-03-15.pdf",
        notes: "Weekly progress report highlighting new patient admissions and care plans",
        date: "2024-03-15"
      },
      {
        id: 4,
        fileName: "Weekly_Update_2024-03-08.pdf",
        notes: "Weekly update on staff training and patient satisfaction metrics",
        date: "2024-03-08"
      }
    ],
    isEditingReport: false,
    selectedReport: null,
    newReportNote: '',
    newInteraction: '',
    interactions: [
      {
        id: 1,
        summary: "Discussed new care protocols with nursing staff and implemented changes"
      },
      {
        id: 2,
        summary: "Reviewed patient feedback and addressed concerns about response times"
      },
      {
        id: 3,
        summary: "Coordinated with physicians for improved patient care coordination"
      },
      {
        id: 4,
        summary: "Conducted staff training on new documentation requirements"
      }
    ],
    showAllInteractions: false,
    mbrsDone: 2,
    mbrsUpcoming: 1,
    mdrTasks: [
      {
        id: 1,
        task: "Prepare patient satisfaction metrics for next MBR",
        completed: false,
        dueDate: "2024-03-20"
      },
      {
        id: 2,
        task: "Review and update care protocols documentation",
        completed: true,
        dueDate: "2024-03-15"
      },
      {
        id: 3,
        task: "Compile staff performance data for quarterly review",
        completed: false,
        dueDate: "2024-03-25"
      },
      {
        id: 4,
        task: "Update quality improvement metrics dashboard",
        completed: false,
        dueDate: "2024-03-22"
      }
    ],
    newMBRTask: ''
  });

  // Add rapport state
  const [rapportState, setRapportState] = useState({
    records: [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        designation: "Chief Medical Officer",
        score: "8.5",
        understanding: "Strong understanding of operational needs and patient care requirements"
      },
      {
        id: 2,
        name: "Michael Chen",
        designation: "Clinical Director",
        score: "7.2",
        understanding: "Good grasp of clinical protocols and staff management"
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        designation: "Quality Assurance Manager",
        score: "9.0",
        understanding: "Excellent understanding of quality metrics and improvement strategies"
      },
      {
        id: 4,
        name: "David Wilson",
        designation: "Patient Care Coordinator",
        score: "6.8",
        understanding: "Strong focus on patient satisfaction and care coordination"
      },
      {
        id: 5,
        name: "Lisa Anderson",
        designation: "Administrative Assistant",
        score: "5.5",
        understanding: "Basic understanding of office procedures and documentation"
      }
    ],
    searchTerm: '',
    showAnalytics: false,
    showForm: false,
    newRecord: {
      name: '',
      designation: '',
      score: '',
      understanding: ''
    },
    editingRecord: null,
    sortConfig: {
      key: 'name',
      direction: 'asc'
    },
    notification: null
  });

  const handleOnboardingToggle = (type, id) => {
    // Implementation for toggling onboarding status
  };

  const handleSortClick = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setSelectedDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const getFilteredClaims = () => {
    // Implementation for filtering claims
    return [];
  };

  const handleDownloadClaims = (format) => {
    // Implementation for downloading claims
  };

  const renderMap = () => (
    <div className="hhah-map-container">
      {/* Map implementation */}
    </div>
  );

  const renderClaimsSection = () => (
    <div className="hhah-claims-section">
      {/* Claims section implementation */}
    </div>
  );

  const renderProactiveOutcomes = () => (
    <div className="section-container">
      <h2 className="section-title">Proactive Outcomes</h2>
      <div className="hhah-proactive-outcomes">
        {/* Proactive outcomes implementation */}
      </div>
    </div>
  );

  const renderReactiveOutcomes = () => (
    <div className="section-container">
      <h2 className="section-title">Reactive Outcomes</h2>
      <ReactiveOutcomes data={hhahData} setData={setHhahData} />
    </div>
  );

  const renderInteractionLog = () => (
    <div className="section-container">
      <h2 className="section-title">Interaction Log</h2>
      <InteractionLog data={hhahData.interactionLog} />
    </div>
  );

  const renderStaffList = () => (
    <div className="hhah-staff-list">
      <StaffList pgData={hhahData} setPgData={setHhahData} showOnlyOfficeStaff={true} />
    </div>
  );

  const renderValueCommunication = () => (
    <div className="section-container">
      <h2 className="section-title">Value Communication</h2>
      <div className="value-communication-section">
        <div className="value-comm-grid">
          {/* Communication Reports Panel */}
          <div className="value-comm-panel reports-panel">
            <div className="panel-header">
              <h3>Communication Reports</h3>
            </div>
            
            {/* MBR Reports Section */}
            <div className="reports-section">
              <div className="reports-section-header">
                <h4 className="reports-section-title">MBR Reports</h4>
                <button className="action-button" onClick={() => {
                  const fileName = `MBR_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                  const notes = window.prompt("Enter MBR report notes:", "Monthly business review");
                  if (notes) {
                    setValueCommunicationState(prev => ({
                      ...prev,
                      reports: [
                        ...prev.reports,
                        {
                          id: prev.reports.length + 1,
                          fileName,
                          notes,
                          date: new Date().toISOString().split('T')[0]
                        }
                      ]
                    }));
                  }
                }}>
                  <span className="icon">+</span> Add MBR Report
                </button>
              </div>
              <div className="reports-list">
                {valueCommunicationState.reports
                  .filter(report => report.fileName.toLowerCase().includes('communication') || 
                                  report.fileName.toLowerCase().includes('feedback') || 
                                  report.fileName.includes('mbr'))
                  .map(report => (
                    <div key={report.id} className="report-card">
                      <div className="report-icon">
                        <span className="document-icon">📄</span>
                      </div>
                      <div className="report-details">
                        <h4 className="report-filename">{report.fileName}</h4>
                        {valueCommunicationState.isEditingReport && valueCommunicationState.selectedReport?.id === report.id ? (
                          <div className="edit-report">
                            <input
                              type="text"
                              value={valueCommunicationState.newReportNote}
                              onChange={(e) => setValueCommunicationState(prev => ({
                                ...prev,
                                newReportNote: e.target.value
                              }))}
                              className="interaction-input"
                            />
                            <button onClick={handleSaveReport} className="submit-button">
                              Save
                            </button>
                          </div>
                        ) : (
                          <p className="report-notes">{report.notes}</p>
                        )}
                        <div className="report-meta">
                          <span className="report-date">{report.date}</span>
                        </div>
                      </div>
                      <div className="report-actions">
                        <button className="icon-button edit" title="Edit Report" onClick={() => handleEditReport(report)}>
                          <span className="action-icon">✏️</span>
                        </button>
                        <button className="icon-button download" title="Download Report" onClick={() => handleDownloadReport(report)}>
                          <span className="action-icon">⬇️</span>
                        </button>
                        <button className="icon-button delete" title="Delete Report" onClick={() => handleDeleteReport(report.id)}>
                          <span className="action-icon">🗑️</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Weekly Reports Section */}
            <div className="reports-section">
              <div className="reports-section-header">
                <h4 className="reports-section-title">Weekly Reports</h4>
                <button className="action-button" onClick={() => {
                  const fileName = `Weekly_Update_${new Date().getDate()}.pdf`;
                  const notes = window.prompt("Enter weekly report notes:", "Weekly progress report");
                  if (notes) {
                    setValueCommunicationState(prev => ({
                      ...prev,
                      reports: [
                        ...prev.reports,
                        {
                          id: prev.reports.length + 1,
                          fileName,
                          notes,
                          date: new Date().toISOString().split('T')[0]
                        }
                      ]
                    }));
                  }
                }}>
                  <span className="icon">+</span> Add Weekly Report
                </button>
              </div>
              <div className="reports-list">
                {valueCommunicationState.reports
                  .filter(report => report.fileName.toLowerCase().includes('weekly') || 
                                  report.fileName.toLowerCase().includes('update'))
                  .map(report => (
                    <div key={report.id} className="report-card">
                      <div className="report-icon">
                        <span className="document-icon">📄</span>
                      </div>
                      <div className="report-details">
                        <h4 className="report-filename">{report.fileName}</h4>
                        {valueCommunicationState.isEditingReport && valueCommunicationState.selectedReport?.id === report.id ? (
                          <div className="edit-report">
                            <input
                              type="text"
                              value={valueCommunicationState.newReportNote}
                              onChange={(e) => setValueCommunicationState(prev => ({
                                ...prev,
                                newReportNote: e.target.value
                              }))}
                              className="interaction-input"
                            />
                            <button onClick={handleSaveReport} className="submit-button">
                              Save
                            </button>
                          </div>
                        ) : (
                          <p className="report-notes">{report.notes}</p>
                        )}
                        <div className="report-meta">
                          <span className="report-date">{report.date}</span>
                        </div>
                      </div>
                      <div className="report-actions">
                        <button className="icon-button edit" title="Edit Report" onClick={() => handleEditReport(report)}>
                          <span className="action-icon">✏️</span>
                        </button>
                        <button className="icon-button download" title="Download Report" onClick={() => handleDownloadReport(report)}>
                          <span className="action-icon">⬇️</span>
                        </button>
                        <button className="icon-button delete" title="Delete Report" onClick={() => handleDeleteReport(report.id)}>
                          <span className="action-icon">🗑️</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Interaction Summaries Panel */}
          <div className="value-comm-panel interactions-panel">
            <div className="panel-header">
              <h3>Interaction Summaries</h3>
            </div>

            <div className="add-interaction-form">
              <input
                type="text"
                placeholder="Add new interaction summary..."
                value={valueCommunicationState.newInteraction}
                onChange={(e) => setValueCommunicationState(prev => ({
                  ...prev,
                  newInteraction: e.target.value
                }))}
                className="interaction-input"
              />
              <button 
                onClick={handleAddInteraction} 
                className="submit-button"
                disabled={!valueCommunicationState.newInteraction.trim()}
              >
                Add
              </button>
            </div>

            <div className="interactions-list">
              {(valueCommunicationState.showAllInteractions
                ? valueCommunicationState.interactions
                : valueCommunicationState.interactions.slice(0, 3)
              ).map(interaction => (
                <div key={interaction.id} className="interaction-card">
                  <div className="interaction-content">
                    <p className="interaction-text">{interaction.summary}</p>
                  </div>
                </div>
              ))}
              
              {valueCommunicationState.interactions.length > 3 && (
                <button 
                  onClick={() => setValueCommunicationState(prev => ({
                    ...prev,
                    showAllInteractions: !prev.showAllInteractions
                  }))}
                  className="toggle-button"
                >
                  {valueCommunicationState.showAllInteractions
                    ? "Show Less"
                    : `Show ${valueCommunicationState.interactions.length - 3} More`}
                </button>
              )}
            </div>
          </div>

          {/* MBR Tasks Panel */}
          <div className="value-comm-panel mbr-panel">
            <div className="panel-header">
              <h3>MBR Tasks</h3>
            </div>

            <div className="mbr-stats">
              <div className="mbr-stat-item">
                <span className="stat-label">MBRs Done:</span>
                <span className="stat-value">{valueCommunicationState.mbrsDone}</span>
              </div>
              <div className="mbr-stat-item">
                <span className="stat-label">MBRs Upcoming:</span>
                <span className="stat-value">{valueCommunicationState.mbrsUpcoming}</span>
              </div>
            </div>

            <div className="mbr-tasks-list">
              {valueCommunicationState.mdrTasks
                .map(task => (
                  <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                    <div className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleMDRTask(task.id)}
                        id={`task-${task.id}`}
                      />
                      <label htmlFor={`task-${task.id}`}></label>
                    </div>
                    <div className="task-content">
                      <p className="task-text">{task.task}</p>
                      <div className="task-meta">
                        <span className="task-due-date">Due: {task.dueDate}</span>
                        <span className={`task-status ${task.completed ? 'completed' : 'pending'}`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="add-task-form">
              <input
                type="text"
                placeholder="Add new MBR task..."
                className="task-input"
                value={valueCommunicationState.newMBRTask || ''}
                onChange={(e) => setValueCommunicationState(prev => ({
                  ...prev,
                  newMBRTask: e.target.value
                }))}
              />
              <button 
                onClick={() => {
                  if (valueCommunicationState.newMBRTask.trim()) {
                    setValueCommunicationState(prev => {
                      const newTask = {
                        id: prev.mdrTasks.length + 1,
                        task: prev.newMBRTask,
                        completed: false,
                        dueDate: new Date().toISOString().split('T')[0]
                      };
                      
                      return {
                        ...prev,
                        mdrTasks: [...prev.mdrTasks, newTask],
                        newMBRTask: '',
                        mbrsUpcoming: prev.mbrsUpcoming + 1 // Increment upcoming count
                      };
                    });
                  }
                }}
                className="submit-button"
                disabled={!valueCommunicationState.newMBRTask.trim()}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRapportManagement = () => {
    return (
      <div className="rapport-section">
        <div className="rapport-header">
          <h2 className="rapport-title">Rapport Summary</h2>
          <div className="rapport-actions">
            <div className="rapport-search">
              <input
                type="text"
                placeholder="Search by name or designation..."
                className="rapport-search-input"
                onChange={(e) => setRapportState(prev => ({
                  ...prev,
                  searchTerm: e.target.value
                }))}
                value={rapportState.searchTerm || ''}
              />
            </div>
            <button className="rapport-export-btn" onClick={() => handleExportRapport('csv')}>Export CSV</button>
            <button className="rapport-export-btn" onClick={() => handleExportRapport('pdf')}>Export PDF</button>
          </div>
        </div>

        <div className="rapport-score">
          <div className="rapport-score-value">{calculateAverageScore()}</div>
          <div className="rapport-score-label">/10 Average Rapport Score</div>
        </div>

        <button 
          className="rapport-analytics-toggle"
          onClick={() => setRapportState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }))}
        >
          {rapportState.showAnalytics ? "Hide Analytics" : "Show Analytics"}
        </button>

        {rapportState.showAnalytics && (
          <div className="rapport-analytics">
            <h3>Rapport Analytics</h3>
            <div className="rapport-analytics-item">
              <span className="rapport-analytics-label">High Rapport (8-10)</span>
              <span className="rapport-analytics-value rapport-analytics-high">{getHighRapportCount()}</span>
            </div>
            <div className="rapport-analytics-item">
              <span className="rapport-analytics-label">Medium Rapport (5-7)</span>
              <span className="rapport-analytics-value rapport-analytics-medium">{getMediumRapportCount()}</span>
            </div>
            <div className="rapport-analytics-item">
              <span className="rapport-analytics-label">Low Rapport (0-4)</span>
              <span className="rapport-analytics-value rapport-analytics-low">{getLowRapportCount()}</span>
            </div>
          </div>
        )}

        <button 
          className="add-rapport-btn"
          onClick={() => setRapportState(prev => ({ ...prev, showForm: !prev.showForm }))}
        >
          {rapportState.showForm ? "Cancel" : "Add Rapport"}
        </button>

        {rapportState.showForm && (
          <div className="add-rapport-form">
            <div className="rapport-form-group">
              <label>Person Name</label>
              <input 
                type="text" 
                placeholder="Enter name" 
                name="name"
                value={rapportState.newRecord.name}
                onChange={(e) => setRapportState(prev => ({
                  ...prev,
                  newRecord: { ...prev.newRecord, name: e.target.value }
                }))}
              />
            </div>
            <div className="rapport-form-group">
              <label>Designation</label>
              <input 
                type="text" 
                placeholder="Enter designation" 
                name="designation"
                value={rapportState.newRecord.designation}
                onChange={(e) => setRapportState(prev => ({
                  ...prev,
                  newRecord: { ...prev.newRecord, designation: e.target.value }
                }))}
              />
            </div>
            <div className="rapport-form-group">
              <label>Score (0-10)</label>
              <input 
                type="number" 
                min="0" 
                max="10" 
                placeholder="Enter score" 
                name="score"
                value={rapportState.newRecord.score}
                onChange={(e) => setRapportState(prev => ({
                  ...prev,
                  newRecord: { ...prev.newRecord, score: e.target.value }
                }))}
              />
            </div>
            <div className="rapport-form-group">
              <label>Analysis</label>
              <textarea 
                placeholder="Enter analysis" 
                name="understanding"
                value={rapportState.newRecord.understanding}
                onChange={(e) => setRapportState(prev => ({
                  ...prev,
                  newRecord: { ...prev.newRecord, understanding: e.target.value }
                }))}
              ></textarea>
            </div>
            <button className="add-record-btn" onClick={handleSubmitRapport}>Add Record</button>
          </div>
        )}

        <div className="rapport-table-container">
          <table className="rapport-table">
            <thead>
              <tr>
                <th onClick={() => handleRapportSort('name')} style={{ textAlign: 'left' }}>
                  PERSONA NAME
                  {rapportState.sortConfig.key === 'name' && (
                    <span>{rapportState.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th onClick={() => handleRapportSort('designation')} style={{ textAlign: 'left' }}>
                  DESIGNATION
                  {rapportState.sortConfig.key === 'designation' && (
                    <span>{rapportState.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th onClick={() => handleRapportSort('score')} style={{ textAlign: 'left' }}>
                  SCORE
                  {rapportState.sortConfig.key === 'score' && (
                    <span>{rapportState.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th style={{ textAlign: 'left' }}>ANALYSIS</th>
                <th style={{ textAlign: 'left' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedRapportRecords().map(record => (
                <tr key={`rapport-${record.id}`}>
                  {rapportState.editingRecord?.id === record.id ? (
                    <>
                      <td style={{ textAlign: 'left' }}>
                        <input
                          type="text"
                          name="name"
                          value={rapportState.editingRecord.name}
                          onChange={handleEditChange}
                          className="rapport-edit-input"
                        />
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <input
                          type="text"
                          name="designation"
                          value={rapportState.editingRecord.designation}
                          onChange={handleEditChange}
                          className="rapport-edit-input"
                        />
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <input
                          type="number"
                          name="score"
                          min="0"
                          max="10"
                          value={rapportState.editingRecord.score}
                          onChange={handleEditChange}
                          className="rapport-edit-input"
                        />
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <textarea
                          name="understanding"
                          value={rapportState.editingRecord.understanding}
                          onChange={handleEditChange}
                          className="rapport-edit-textarea"
                        />
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <div className="rapport-action-buttons">
                          <button className="rapport-save-btn" onClick={handleSaveEdit}>Save</button>
                          <button className="rapport-cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ textAlign: 'left' }}>{record.name}</td>
                      <td style={{ textAlign: 'left' }}>{record.designation}</td>
                      <td style={{ textAlign: 'left' }}>
                        <span className={`rapport-score-badge ${parseFloat(record.score) >= 8 ? 'high' : parseFloat(record.score) >= 5 ? 'medium' : 'low'}`}>
                          {record.score}/10
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>{record.understanding}</td>
                      <td style={{ textAlign: 'left' }}>
                        <div className="rapport-action-buttons">
                          <button className="rapport-edit-btn" onClick={() => handleEditRapportRecord(record.id)}>Edit</button>
                          <button className="rapport-delete-btn" onClick={() => handleDeleteRapportRecord(record.id)}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const calculateAverageScore = () => {
    if (rapportState.records.length === 0) return '0.0';
    const total = rapportState.records.reduce((sum, record) => sum + parseFloat(record.score), 0);
    return (total / rapportState.records.length).toFixed(1);
  };

  const getHighRapportCount = () => {
    return rapportState.records.filter(record => parseFloat(record.score) >= 8).length;
  };

  const getMediumRapportCount = () => {
    return rapportState.records.filter(record => parseFloat(record.score) >= 5 && parseFloat(record.score) < 8).length;
  };

  const getLowRapportCount = () => {
    return rapportState.records.filter(record => parseFloat(record.score) < 5).length;
  };

  const getFilteredAndSortedRapportRecords = () => {
    let filteredRecords = [...rapportState.records];
    
    if (rapportState.searchTerm) {
      const searchTerm = rapportState.searchTerm.toLowerCase();
      filteredRecords = filteredRecords.filter(record =>
        record.name.toLowerCase().includes(searchTerm) ||
        record.designation.toLowerCase().includes(searchTerm)
      );
    }

    filteredRecords.sort((a, b) => {
      const aValue = a[rapportState.sortConfig.key];
      const bValue = b[rapportState.sortConfig.key];

      if (rapportState.sortConfig.key === 'score') {
        return rapportState.sortConfig.direction === 'asc'
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }

      if (rapportState.sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    return filteredRecords;
  };

  const handleRapportSort = (key) => {
    setRapportState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  };

  const handleSubmitRapport = () => {
    const { name, designation, score, understanding } = rapportState.newRecord;
    
    if (!name || !designation || !score || !understanding) {
      setRapportState(prev => ({
        ...prev,
        notification: { message: 'Please fill in all fields', type: 'error' }
      }));
      return;
    }

    if (parseFloat(score) < 0 || parseFloat(score) > 10) {
      setRapportState(prev => ({
        ...prev,
        notification: { message: 'Score must be between 0 and 10', type: 'error' }
      }));
      return;
    }

    const newRecord = {
      id: Date.now(),
      name,
      designation,
      score,
      understanding
    };

    setRapportState(prev => ({
      ...prev,
      records: [...prev.records, newRecord],
      newRecord: {
        name: '',
        designation: '',
        score: '',
        understanding: ''
      },
      showForm: false,
      notification: { message: "Record added successfully", type: "success" }
    }));

    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const handleEditRapportRecord = (recordId) => {
    const record = rapportState.records.find(r => r.id === recordId);
    if (!record) return;
    
    setRapportState(prev => ({
      ...prev,
      editingRecord: { ...record }
    }));
  };

  const handleSaveEdit = () => {
    if (!rapportState.editingRecord) return;

    const { name, designation, score, understanding } = rapportState.editingRecord;
    
    if (!name || !designation || !score || !understanding) {
      setRapportState(prev => ({
        ...prev,
        notification: { message: 'Please fill in all fields', type: 'error' }
      }));
      return;
    }

    if (parseFloat(score) < 0 || parseFloat(score) > 10) {
      setRapportState(prev => ({
        ...prev,
        notification: { message: 'Score must be between 0 and 10', type: 'error' }
      }));
      return;
    }

    setRapportState(prev => ({
      ...prev,
      records: prev.records.map(r => 
        r.id === prev.editingRecord.id 
          ? { ...prev.editingRecord }
          : r
      ),
      editingRecord: null,
      notification: { message: "Record updated successfully", type: "success" }
    }));

    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const handleCancelEdit = () => {
    setRapportState(prev => ({
      ...prev,
      editingRecord: null
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setRapportState(prev => ({
      ...prev,
      editingRecord: {
        ...prev.editingRecord,
        [name]: value
      }
    }));
  };

  const handleDeleteRapportRecord = (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    setRapportState(prev => ({
      ...prev,
      records: prev.records.filter(r => r.id !== recordId),
      notification: { message: "Record deleted successfully", type: "success" }
    }));
    
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const handleExportRapport = (format) => {
    // Implementation for exporting rapport data
    console.log(`Exporting rapport data in ${format} format`);
  };

  const handleAddInteraction = () => {
    if (valueCommunicationState.newInteraction.trim()) {
      setValueCommunicationState(prev => ({
        ...prev,
        interactions: [
          ...prev.interactions,
          {
            id: prev.interactions.length + 1,
            summary: prev.newInteraction.trim()
          }
        ],
        newInteraction: ''
      }));
    }
  };

  const handleDeleteReport = (reportId) => {
    setValueCommunicationState(prev => ({
      ...prev,
      reports: prev.reports.filter(report => report.id !== reportId)
    }));
  };

  const handleEditReport = (report) => {
    setValueCommunicationState(prev => ({
      ...prev,
      isEditingReport: true,
      selectedReport: report,
      newReportNote: report.notes
    }));
  };

  const handleSaveReport = () => {
    if (valueCommunicationState.selectedReport) {
      setValueCommunicationState(prev => ({
        ...prev,
        reports: prev.reports.map(report => 
          report.id === prev.selectedReport.id
            ? { ...report, notes: prev.newReportNote }
            : report
        ),
        isEditingReport: false,
        selectedReport: null,
        newReportNote: ''
      }));
    }
  };

  const handleToggleMDRTask = (taskId) => {
    setValueCommunicationState(prev => {
      const updatedTasks = prev.mdrTasks.map(task => 
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      );
      
      // Count completed and upcoming tasks
      const completedCount = updatedTasks.filter(task => task.completed).length;
      const upcomingCount = updatedTasks.filter(task => !task.completed).length;
      
      return {
        ...prev,
        mdrTasks: updatedTasks,
        mbrsDone: completedCount,
        mbrsUpcoming: upcomingCount
      };
    });
  };

  const handleDownloadReport = (report) => {
    // Create a blob with the report content
    const blob = new Blob([`Report: ${report.fileName}\nNotes: ${report.notes}\nDate: ${report.date}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddMDRTask = (taskName, dueDate) => {
    // Implementation for adding MDR task
  };

  const handleAddReport = () => {
    // Implementation for adding report
  };

  const handleEditPhysician = (physician) => {
    // Implementation for editing physician
  };

  const handleDeletePhysician = (id) => {
    // Implementation for deleting physician
  };

  const handleEditHHA = (hhah) => {
    // Implementation for editing HHA
  };

  const handleDeleteHHA = (id) => {
    // Implementation for deleting HHA
  };

  const formatDate = (dateString) => {
    // Implementation for formatting date
    return new Date(dateString).toLocaleDateString();
  };

  const renderOverviewSection = () => (
    <div className="overview-section">
      <h3 className="section-summaries-title">Section Summaries</h3>
      <div className="section-summaries">
        {/* Staff List Summary */}
        <div className="summary-card" onClick={() => setActiveSection('staff')}>
          <div className="summary-header">
            <h4>Staff List</h4>
            <span className="summary-icon">👥</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{hhahData.staff.length} Staff Members</p>
            <p className="summary-stat">{hhahData.staff.filter(s => s.department === 'Clinical').length} Clinical Staff</p>
            <p className="summary-stat">{hhahData.staff.filter(s => s.department === 'Administration').length} Administrative Staff</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Patients Summary */}
        <div className="summary-card" onClick={() => setActiveSection('patients')}>
          <div className="summary-header">
            <h4>Patients</h4>
            <span className="summary-icon">👨‍⚕️</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{hhahData.patients.length} Total Patients</p>
            <p className="summary-stat">{hhahData.patients.filter(p => p.status === 'Active').length} Active Patients</p>
            <p className="summary-stat">{hhahData.patients.filter(p => p.status === 'Discharged').length} Discharged Patients</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Reactive Outcomes Summary */}
        <div className="summary-card" onClick={() => setActiveSection('reactive')}>
          <div className="summary-header">
            <h4>Reactive Outcomes</h4>
            <span className="summary-icon">📊</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{hhahData.reactiveOutcomes.length} Total Outcomes</p>
            <p className="summary-stat">{hhahData.reactiveOutcomes.filter(ro => ro.status === 'Completed').length} Completed</p>
            <p className="summary-stat">{hhahData.reactiveOutcomes.filter(ro => ro.status === 'In Progress').length} In Progress</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Interaction Log Summary */}
        <div className="summary-card" onClick={() => setActiveSection('interaction')}>
          <div className="summary-header">
            <h4>Interaction Log</h4>
            <span className="summary-icon">📝</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{hhahData.interactionLog.length} Total Interactions</p>
            <p className="summary-stat">{hhahData.interactionLog.filter(il => il.outcome === 'Positive').length} Positive Outcomes</p>
            <p className="summary-stat">{hhahData.interactionLog.filter(il => il.outcome === 'Negative').length} Negative Outcomes</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Value Communication Summary */}
        <div className="summary-card" onClick={() => setActiveSection('value')}>
          <div className="summary-header">
            <h4>Value Communication</h4>
            <span className="summary-icon">💬</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{hhahData.valueCommunication.metrics.patientSatisfaction}% Patient Satisfaction</p>
            <p className="summary-stat">{hhahData.valueCommunication.metrics.responseTime}ms Average Response Time</p>
            <p className="summary-stat">{hhahData.valueCommunication.metrics.qualityScore}% Quality Score</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Rapport Summary */}
        <div className="summary-card" onClick={() => setActiveSection('rapport')}>
          <div className="summary-header">
            <h4>Rapport</h4>
            <span className="summary-icon">🤝</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{calculateAverageScore()}/10 Average Score</p>
            <p className="summary-stat">{hhahData.interactionLog.filter(record => record.outcome === 'Positive').length} Positive Interactions</p>
            <p className="summary-stat">{hhahData.recentActivities.length} Recent Activities</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'patients':
        return (
          <div className="section-container">
            <h2 className="section-title">Patients</h2>
            <Patients data={hhahData} setData={setHhahData} />
          </div>
        );
      case 'staff':
        return (
          <div className="section-container">
            <h2 className="section-title">Staff List</h2>
            <StaffList pgData={hhahData} setPgData={setHhahData} showOnlyOfficeStaff={true} />
          </div>
        );
      case 'reactive':
        return renderReactiveOutcomes();
      case 'interaction':
        return renderInteractionLog();
      case 'value':
        return renderValueCommunication();
      case 'rapport':
        return renderRapportManagement();
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <div className="hhah-header">
      <div className="hhah-header-left">
        <button className="hhah-back-button" onClick={handleBackNavigation}>
          ← Back
        </button>
        <h1>{hhahData.name}</h1>
      </div>
      <div className="hhah-header-right">
        <span className="hhah-status">{hhahData.status}</span>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="hhah-navigation">
      <button
        className={`navv-button ${activeSection === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveSection('overview')}
      >
        Overview
      </button>
      <button
        className={`navv-button ${activeSection === 'staff' ? 'active' : ''}`}
        onClick={() => setActiveSection('staff')}
      >
        Staff
      </button>
      <button
        className={`navv-button ${activeSection === 'patients' ? 'active' : ''}`}
        onClick={() => setActiveSection('patients')}
      >
        Patients
      </button>
      <button
        className={`navv-button ${activeSection === 'reactive' ? 'active' : ''}`}
        onClick={() => setActiveSection('reactive')}
      >
        Reactive Outcomes
      </button>
      <button
        className={`navv-button ${activeSection === 'interaction' ? 'active' : ''}`}
        onClick={() => setActiveSection('interaction')}
      >
        Interaction Log
      </button>
      <button
        className={`navv-button ${activeSection === 'value' ? 'active' : ''}`}
        onClick={() => setActiveSection('value')}
      >
        Value Communication
      </button>
      <button
        className={`navv-button ${activeSection === 'rapport' ? 'active' : ''}`}
        onClick={() => setActiveSection('rapport')}
      >
        Rapport
      </button>
    </div>
  );

  return (
    <div className="hhah-view">
      {renderHeader()}
      {renderNavigation()}
      {renderMainContent()}
    </div>
  );
};

export default HHAHView;