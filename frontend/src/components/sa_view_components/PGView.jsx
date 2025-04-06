import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../sa_view_css/PGView.css';
import './StaffList.css';
import './proactiveoutcomes.css';
import './InteractionLog.css';
import './ValueCommunication.css';
import StaffList from './StaffList';
import ReactiveOutcomes from './reactiveoc';
import InteractionLog from './InteractionLog';

const PGView = () => {
  const navigate = useNavigate();
  const { pgName } = useParams();
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
    npi: "",
    specialty: "",
    onboarded: false,
    analysis: ""
  });
  const [newHHA, setNewHHA] = useState({
    name: "",
    location: "",
    contact: "",
    onboarded: false
  });
  const [newReactiveOutcome, setNewReactiveOutcome] = useState({
    title: "",
    status: "Improved",
    change: "+0%"
  });
  const [showPhysicianForm, setShowPhysicianForm] = useState(false);
  const [showHHAForm, setShowHHAForm] = useState(false);
  const [showReactiveOutcomeForm, setShowReactiveOutcomeForm] = useState(false);
  const [editingPhysician, setEditingPhysician] = useState(null);
  const [editingHHA, setEditingHHA] = useState(null);
  
  // Mock data - in a real app, this would come from an API
  const [pgData, setPgData] = useState({
    name: pgName ? pgName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "PG Name",
    contact: {
      address: "123 Healthcare Ave, Medical District",
      phone: "(555) 123-4567",
      email: "contact@pggroup.com"
    },
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: "New York, NY"
    },
    recentActivity: [
      { 
        id: 1,
        type: 'claim',
        description: 'New claim filed for patient John Doe',
        time: '2 hours ago',
        icon: '📋'
      },
      {
        id: 2,
        type: 'onboarding',
        description: 'Dr. Sarah Johnson completed onboarding',
        time: '3 hours ago',
        icon: '✓'
      },
      {
        id: 3,
        type: 'report',
        description: 'Monthly performance report generated',
        time: '5 hours ago',
        icon: '📊'
      },
      {
        id: 4,
        type: 'meeting',
        description: 'Staff meeting scheduled for tomorrow',
        time: '6 hours ago',
        icon: '📅'
      },
      {
        id: 5,
        type: 'alert',
        description: 'Patient satisfaction scores updated',
        time: 'Yesterday',
        icon: '📈'
      }
    ],
    physicians: [
      { id: 1, name: "Dr. Sarah Johnson", npi: "1234567890", specialty: "Primary Care", onboarded: true, analysis: "Excellent communication with patients. Consistently follows up on treatment plans. High patient satisfaction scores." },
      { id: 2, name: "Dr. Robert Chen", npi: "2345678901", specialty: "Cardiology", onboarded: false, analysis: "Recently joined. Extensive experience in complex cardiac procedures. Pending completion of EMR training." },
      { id: 3, name: "Dr. Maria Garcia", npi: "3456789012", specialty: "Neurology", onboarded: true, analysis: "Strong diagnostic skills. Pioneering new treatment protocols. Active in research programs." },
      { id: 4, name: "Dr. James Wilson", npi: "4567890123", specialty: "Oncology", onboarded: false, analysis: "Specializes in innovative cancer treatments. Building strong rapport with long-term patients." },
      { id: 5, name: "Dr. Emily Brown", npi: "5678901234", specialty: "Pediatrics", onboarded: true, analysis: "Great with young patients and families. Implements preventive care programs effectively." },
      { id: 6, name: "Dr. Michael Lee", npi: "6789012345", specialty: "Orthopedics", onboarded: false, analysis: "Expert in minimally invasive procedures. Needs to improve on documentation timeliness." },
      { id: 7, name: "Dr. Lisa Patel", npi: "7890123456", specialty: "Dermatology", onboarded: true, analysis: "High patient retention rate. Excellent at explaining treatment plans. Regular presenter at medical conferences." },
      { id: 8, name: "Dr. David Kim", npi: "8901234567", specialty: "Endocrinology", onboarded: false, analysis: "Specializes in diabetes management. Working on implementing new patient education programs." }
    ],
    staff: [
      { id: 1, name: "John Smith", position: "Office Manager", department: "Administration" },
      { id: 2, name: "Lisa Jones", position: "Nurse", department: "Clinical" },
      { id: 3, name: "Mark Davis", position: "Medical Assistant", department: "Clinical" }
    ],
    npp: [
      { id: 1, name: "Nancy White", position: "Nurse Practitioner", specialty: "Primary Care", npi: "7654321098" },
      { id: 2, name: "Tom Brown", position: "Physician Assistant", specialty: "Orthopedics", npi: "8765432109" }
    ],
    hhahs: [
      { id: 1, name: "HomeHealth Plus", location: "Los Angeles, CA", contact: "(555) 111-2222", onboarded: true },
      { id: 2, name: "CaringHands HHA", location: "San Francisco, CA", contact: "(555) 222-3333", onboarded: false },
      { id: 3, name: "Comfort Care Services", location: "San Diego, CA", contact: "(555) 333-4444", onboarded: true },
      { id: 4, name: "Elite Home Health", location: "Sacramento, CA", contact: "(555) 444-5555", onboarded: false }
    ],
    proactiveOutcomes: [
      { id: 1, title: "Physician Onboarding", progress: 60, status: "In Progress" },
      { id: 2, title: "HHAH Integration", progress: 75, status: "On Track" },
      { id: 3, title: "Patient Engagement", progress: 45, status: "Needs Attention" }
    ],
    reactiveOutcomes: [
      { id: 1, title: "Emergency Response Time", status: "Open", change: "+15%" },
      { id: 2, title: "Patient Satisfaction", status: "Analysing", change: "0%" },
      { id: 3, title: "Treatment Adherence", status: "Analysed", change: "-5%" },
      { id: 4, title: "Medication Compliance", status: "Catalysed", change: "+8%" },
      { id: 5, title: "Patient Followup", status: "Open", change: "-3%" }
    ],
    claims: [
      { 
        id: 1, 
        patientName: "John Doe", 
        claimId: "CLM-001", 
        amount: 1500, 
        date: "2024-03-15", 
        status: "Approved", 
        certDate: "2024-03-01", 
        recertDate: "2024-09-01", 
        cpoStatus: "Completed", 
        cpoDate: "2024-03-10",
        certStatus: "Document Prepared",
        recertStatus: "Document not received"
      },
      { 
        id: 2, 
        patientName: "Jane Smith", 
        claimId: "CLM-002", 
        amount: 2000, 
        date: "2024-03-20", 
        status: "Pending", 
        certDate: "2024-03-15", 
        recertDate: "2024-09-15", 
        cpoStatus: "In Progress", 
        cpoDate: "2024-03-18",
        certStatus: "Not Prepared",
        recertStatus: "Document Prepared"
      },
      { 
        id: 3, 
        patientName: "Robert Johnson", 
        claimId: "CLM-003", 
        amount: 1800, 
        date: "2024-03-25", 
        status: "Denied", 
        certDate: "2024-03-20", 
        recertDate: "2024-09-20", 
        cpoStatus: "Not Started", 
        cpoDate: null,
        certStatus: "Document not received",
        recertStatus: "Document not received"
      }
    ],
    valueCommunication: [
      { id: 1, metric: "Patient Satisfaction", score: 4.5, trend: "up", lastUpdate: "2024-03-15" },
      { id: 2, metric: "Care Quality", score: 4.2, trend: "stable", lastUpdate: "2024-03-10" },
      { id: 3, metric: "Response Time", score: 3.8, trend: "down", lastUpdate: "2024-03-05" }
    ],
    rapport: {
      overall: 85,
      metrics: [
        { id: 1, name: "Communication", score: 90 },
        { id: 2, name: "Trust", score: 85 },
        { id: 3, name: "Reliability", score: 80 }
      ]
    }
  });

  const [valueCommunicationState, setValueCommunicationState] = useState({
    reports: [
      { id: 1, fileName: "March_2024_Communication.pdf", notes: "Monthly communication summary", date: "03/15/2024" },
      { id: 2, fileName: "Weekly_Update_12.pdf", notes: "Weekly progress report", date: "03/10/2024" },
      { id: 3, fileName: "Patient_Feedback_Q1.pdf", notes: "Quarterly patient feedback", date: "03/05/2024" }
    ],
    interactions: [
      { id: 1, summary: "Discussed patient engagement strategies with Dr. Johnson", date: "03/15/2024", author: "Admin" },
      { id: 2, summary: "Review of care quality metrics with staff", date: "03/10/2024", author: "Manager" },
      { id: 3, summary: "Team meeting about response time improvement", date: "03/05/2024", author: "Coordinator" }
    ],
    mdrTasks: [
      { id: 1, task: "Prepare monthly data analysis", completed: true, dueDate: "03/20/2024" },
      { id: 2, task: "Collect physician feedback", completed: false, dueDate: "03/18/2024" },
      { id: 3, task: "Update patient satisfaction metrics", completed: false, dueDate: "03/25/2024" }
    ],
    mbrsDone: 12,
    mbrsUpcoming: 5,
    weeklyReportsSent: 24,
    weeklyReportsUpcoming: 3,
    newInteraction: "",
    newReportNote: "",
    newMBRTask: "",
    newMBRTaskDate: "",
    newWeeklyTask: "",
    newWeeklyTaskDate: "",
    showAllInteractions: false,
    selectedReport: null,
    isEditingReport: false
  });

  const [rapportState, setRapportState] = useState({
    records: [
      { id: 1, name: "John Smith", designation: "Physician", score: "9", understanding: "Excellent understanding of processes", date: "03/15/2024" },
      { id: 2, name: "Sarah Johnson", designation: "Nurse Practitioner", score: "7", understanding: "Good grasp of core concepts", date: "03/14/2024" },
      { id: 3, name: "Michael Brown", designation: "Physician Assistant", score: "8", understanding: "Strong clinical knowledge", date: "03/13/2024" },
      { id: 4, name: "Emily Davis", designation: "Registered Nurse", score: "6", understanding: "Basic understanding, needs more training", date: "03/12/2024" },
      { id: 5, name: "David Wilson", designation: "Medical Director", score: "10", understanding: "Expert level understanding", date: "03/11/2024" }
    ],
    searchTerm: "",
    sortConfig: { key: "date", direction: "desc" },
    showAnalytics: false,
    newRecord: {
      name: "",
      designation: "",
      score: "",
      understanding: ""
    },
    showForm: false
  });

  // Add a useEffect to check for physician updates from StaffList
  useEffect(() => {
    // When pgData.physicians changes, update proactiveOutcomes
    const physicianIds = pgData.physicians.map(physician => physician.id);
    
    // Find physicians that are in physicians list but not in proactiveOutcomes
    const newProactivePhysicians = pgData.physicians
      .filter(physician => {
        const existingPhysician = pgData.proactiveOutcomes.find(p => p.id === physician.id && p.type === 'physician');
        return !existingPhysician;
      })
      .map(physician => ({
        id: physician.id,
        name: physician.name,
        npi: physician.npi,
        specialty: physician.specialty,
        onboarded: true,
        type: 'physician', // Ensure type is specified
        dateAdded: new Date().toISOString()
      }));
    
    if (newProactivePhysicians.length > 0) {
      setPgData(prev => ({
        ...prev,
        proactiveOutcomes: [...prev.proactiveOutcomes, ...newProactivePhysicians]
      }));
    }
  }, [pgData.physicians]);

  const handleOnboardingToggle = (type, id) => {
    setPgData(prev => {
      // Update in the proactiveOutcomes array
      const updatedOutcomes = prev.proactiveOutcomes.map(item => {
        if (item.id === id && item.type === type) {
          return { ...item, onboarded: !item.onboarded };
        }
        return item;
      });
      
      // If it's a physician, also update in the physicians array
      let updatedPhysicians = [...prev.physicians];
      if (type === 'physician') {
        updatedPhysicians = prev.physicians.map(physician => {
          if (physician.id === id) {
            return { ...physician, onboarded: !physician.onboarded };
          }
          return physician;
        });
      }
      
      // If it's an HHA, also update in the hhahs array
      let updatedHHAs = [...prev.hhahs];
      if (type === 'hha') {
        updatedHHAs = prev.hhahs.map(hha => {
          if (hha.id === id) {
            return { ...hha, onboarded: !hha.onboarded };
          }
          return hha;
        });
      }
      
      return {
        ...prev,
        proactiveOutcomes: updatedOutcomes,
        physicians: updatedPhysicians,
        hhahs: updatedHHAs
      };
    });
  };

  const handleSortClick = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setSelectedDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    setSelectedPeriod('custom');
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const today = new Date();
    let startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    } else if (period === 'all') {
      setSelectedDateRange({ start: '', end: '' });
      return;
    }
    
    setSelectedDateRange({
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    const [year, month] = e.target.value.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    setSelectedDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    setSelectedPeriod('custom');
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setSelectedDateRange({
      start: `${year}-01-01`,
      end: `${year}-12-31`
    });
    setSelectedPeriod('custom');
  };

  const [filteredClaims, setFilteredClaims] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Dummy claims data from PatientFormComponent
  const [dummyClaims, setDummyClaims] = useState([
    {
      id: 1,
      patientId: 'P001',
      patientName: 'John A Smith',
      patientDOB: '05-15-1980',
      contactNumber: '555-123-4567',
      physicianName: 'Dr. Sarah Johnson',
      pg: 'ABC Medical Group',
      hhah: 'Home Health Care Plus',
      patientInsurance: 'Medicare',
      patientInEHR: 'yes',
      patientSOC: '08-30-2024',
      patientEpisodeFrom: '08-30-2024',
      patientEpisodeTo: '10-28-2024',
      renderingPractitioner: 'Dr. Michael Chen',
      primaryDiagnosisCodes: ['E11.9', 'I10'],
      secondaryDiagnosisCodes: ['M17.9', 'E78.5'],
      certStatus: 'Document Signed',
      certSignedDate: '09-15-2024',
      recertStatus: 'Document Prepared',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Regular follow-up required',
      cpoMinsCaptured: 120,
      newDocs: 2,
      newCpoDocsCreated: 1
    },
    {
      id: 2,
      patientId: 'P002',
      patientName: 'Emily R Johnson',
      patientDOB: '07-22-1975',
      contactNumber: '555-234-5678',
      physicianName: 'Dr. Robert Williams',
      pg: 'Premier Care Medical',
      hhah: 'Golden Age Home Health',
      patientInsurance: 'BlueCross',
      patientInEHR: 'yes',
      patientSOC: '08-14-2024',
      patientEpisodeFrom: '08-14-2024',
      patientEpisodeTo: '10-12-2024',
      renderingPractitioner: 'Dr. Lisa Park',
      primaryDiagnosisCodes: ['I48.91', 'E78.5'],
      secondaryDiagnosisCodes: ['J44.9', 'N18.3'],
      certStatus: 'Document Signed',
      certSignedDate: '08-25-2024',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Patient has mobility issues',
      cpoMinsCaptured: 95,
      newDocs: 3,
      newCpoDocsCreated: 2
    },
    {
      id: 3,
      patientId: 'P003',
      patientName: 'Robert J Williams',
      patientDOB: '11-03-1968',
      contactNumber: '555-345-6789',
      physicianName: 'Dr. Jessica Miller',
      pg: 'Wellness Medical Associates',
      hhah: 'Comfort Care Services',
      patientInsurance: 'Aetna',
      patientInEHR: 'no',
      patientSOC: '12-03-2023',
      patientEpisodeFrom: '09-28-2024',
      patientEpisodeTo: '11-26-2024',
      renderingPractitioner: 'Dr. David Thompson',
      primaryDiagnosisCodes: ['K21.9', 'E11.9'],
      secondaryDiagnosisCodes: ['I10', 'M81.0'],
      certStatus: 'Document Prepared',
      certSignedDate: '',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'no',
      patientRemarks: 'Needs assistance with medication management',
      cpoMinsCaptured: 25,
      newDocs: 1,
      newCpoDocsCreated: 0
    },
    {
      id: 4,
      patientId: 'P004',
      patientName: 'Michael T Brown',
      patientDOB: '02-28-1985',
      contactNumber: '555-456-7890',
      physicianName: 'Dr. Thomas Anderson',
      pg: 'United Medical Partners',
      hhah: 'Premier Home Health',
      patientInsurance: 'UnitedHealthcare',
      patientInEHR: 'yes',
      patientSOC: '07-04-2024',
      patientEpisodeFrom: '09-02-2024',
      patientEpisodeTo: '10-31-2024',
      renderingPractitioner: 'Dr. Patricia White',
      primaryDiagnosisCodes: ['J45.909', 'R05.9'],
      secondaryDiagnosisCodes: ['E03.9', 'M54.5'],
      certStatus: 'Document Signed',
      certSignedDate: '09-15-2024',
      recertStatus: 'Document Billed',
      recertSignedDate: '10-01-2024',
      f2fEligibility: 'yes',
      patientRemarks: 'Post-surgical care needed',
      cpoMinsCaptured: 150,
      newDocs: 4,
      newCpoDocsCreated: 2
    },
    {
      id: 5,
      patientId: 'P005',
      patientName: 'Jennifer L Davis',
      patientDOB: '09-17-1972',
      contactNumber: '555-567-8901',
      physicianName: 'Dr. Christopher Lee',
      pg: 'Community Health Partners',
      hhah: 'Caring Hands Home Health',
      patientInsurance: 'Cigna',
      patientInEHR: 'no',
      patientSOC: '08-24-2024',
      patientEpisodeFrom: '08-24-2024',
      patientEpisodeTo: '10-22-2024',
      renderingPractitioner: 'Dr. Elizabeth Martinez',
      primaryDiagnosisCodes: ['F41.9', 'G47.00'],
      secondaryDiagnosisCodes: ['E66.9', 'M17.0'],
      certStatus: 'Document Prepared',
      certSignedDate: '',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Weekly mental health check-ins',
      cpoMinsCaptured: 20,
      newDocs: 2,
      newCpoDocsCreated: 1
    },
    {
      id: 6,
      patientId: 'P006',
      patientName: 'David W Miller',
      patientDOB: '04-09-1990',
      contactNumber: '555-678-9012',
      physicianName: 'Dr. Andrew Wilson',
      pg: 'Pinnacle Medical Group',
      hhah: 'Elite Home Health Services',
      patientInsurance: 'Humana',
      patientInEHR: 'yes',
      patientSOC: '08-22-2024',
      patientEpisodeFrom: '08-22-2024',
      patientEpisodeTo: '10-20-2024',
      renderingPractitioner: 'Dr. Michelle Brown',
      primaryDiagnosisCodes: ['S72.001A', 'M17.11'],
      secondaryDiagnosisCodes: ['I10', 'E11.9'],
      certStatus: 'Document Signed',
      certSignedDate: '09-05-2024',
      recertStatus: 'Document Prepared',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Physical therapy 3x weekly',
      cpoMinsCaptured: 85,
      newDocs: 3,
      newCpoDocsCreated: 2
    },
    {
      id: 7,
      patientId: 'P007',
      patientName: 'Susan E Wilson',
      patientDOB: '08-12-1965',
      contactNumber: '555-789-0123',
      physicianName: 'Dr. Kevin Barnes',
      pg: 'Integrated Health Systems',
      hhah: 'Harmony Home Health',
      patientInsurance: 'Medicare Advantage',
      patientInEHR: 'yes',
      patientSOC: '08-28-2024',
      patientEpisodeFrom: '08-28-2024',
      patientEpisodeTo: '10-26-2024',
      renderingPractitioner: 'Dr. Richard Taylor',
      primaryDiagnosisCodes: ['I50.9', 'I48.91'],
      secondaryDiagnosisCodes: ['E78.5', 'N18.3'],
      certStatus: 'Document Billed',
      certSignedDate: '09-10-2024',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Cardiac monitoring required',
      cpoMinsCaptured: 110,
      newDocs: 4,
      newCpoDocsCreated: 2
    },
    {
      id: 8,
      patientId: 'P008',
      patientName: 'James H Moore',
      patientDOB: '06-25-1958',
      contactNumber: '555-890-1234',
      physicianName: 'Dr. Olivia Green',
      pg: 'Advanced Medical Care',
      hhah: 'Quality Home Health',
      patientInsurance: 'TRICARE',
      patientInEHR: 'no',
      patientSOC: '08-15-2024',
      patientEpisodeFrom: '08-15-2024',
      patientEpisodeTo: '10-13-2024',
      renderingPractitioner: 'Dr. William Adams',
      primaryDiagnosisCodes: ['G20', 'R26.2'],
      secondaryDiagnosisCodes: ['I10', 'E03.9'],
      certStatus: 'Document Signed',
      certSignedDate: '08-30-2024',
      recertStatus: 'Document Prepared',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Needs assistance with daily activities',
      cpoMinsCaptured: 95,
      newDocs: 2,
      newCpoDocsCreated: 1
    },
    {
      id: 9,
      patientId: 'P009',
      patientName: 'Patricia M Taylor',
      patientDOB: '12-03-1979',
      contactNumber: '555-901-2345',
      physicianName: 'Dr. Jonathan Harris',
      pg: 'Regional Medical Associates',
      hhah: 'Sunlight Home Health',
      patientInsurance: 'Blue Shield',
      patientInEHR: 'yes',
      patientSOC: '08-23-2024',
      patientEpisodeFrom: '08-23-2024',
      patientEpisodeTo: '10-21-2024',
      renderingPractitioner: 'Dr. Sandra Jackson',
      primaryDiagnosisCodes: ['M54.5', 'M51.26'],
      secondaryDiagnosisCodes: ['E66.01', 'F41.1'],
      certStatus: 'Document Signed',
      certSignedDate: '09-01-2024',
      recertStatus: 'Document Billed',
      recertSignedDate: '09-25-2024',
      f2fEligibility: 'yes',
      patientRemarks: 'Pain management protocol in place',
      cpoMinsCaptured: 130,
      newDocs: 3,
      newCpoDocsCreated: 2
    },
    {
      id: 10,
      patientId: 'P010',
      patientName: 'Thomas B Anderson',
      patientDOB: '03-17-1982',
      contactNumber: '555-012-3456',
      physicianName: 'Dr. Margaret Davis',
      pg: 'Pacific Health Alliance',
      hhah: 'Compassionate Care',
      patientInsurance: 'Kaiser',
      patientInEHR: 'no',
      patientSOC: '08-05-2024',
      patientEpisodeFrom: '08-05-2024',
      patientEpisodeTo: '10-03-2024',
      renderingPractitioner: 'Dr. Joseph Wilson',
      primaryDiagnosisCodes: ['J44.9', 'J96.90'],
      secondaryDiagnosisCodes: ['I10', 'E78.5'],
      certStatus: 'Document Prepared',
      certSignedDate: '',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Oxygen therapy monitoring',
      cpoMinsCaptured: 30,
      newDocs: 1,
      newCpoDocsCreated: 1
    },
    {
      id: 11,
      patientId: 'P011',
      patientName: 'Barbara K Jackson',
      patientDOB: '10-05-1970',
      contactNumber: '555-123-7890',
      physicianName: 'Dr. Edward Thompson',
      pg: 'Valley Medical Group',
      hhah: 'Trustworthy Home Health',
      patientInsurance: 'Medicare',
      patientInEHR: 'yes',
      patientSOC: '06-13-2024',
      patientEpisodeFrom: '10-11-2024',
      patientEpisodeTo: '12-09-2024',
      renderingPractitioner: 'Dr. Rebecca Nelson',
      primaryDiagnosisCodes: ['C50.911', 'Z51.11'],
      secondaryDiagnosisCodes: ['D64.9', 'E03.9'],
      certStatus: 'Document Signed',
      certSignedDate: '10-15-2024',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Post-chemotherapy care',
      cpoMinsCaptured: 140,
      newDocs: 5,
      newCpoDocsCreated: 3
    },
    {
      id: 12,
      patientId: 'P012',
      patientName: 'Richard D White',
      patientDOB: '07-30-1963',
      contactNumber: '555-234-8901',
      physicianName: 'Dr. Carol Martin',
      pg: 'Heritage Medical Partners',
      hhah: 'Reliable Home Health',
      patientInsurance: 'Anthem',
      patientInEHR: 'no',
      patientSOC: '02-26-2024',
      patientEpisodeFrom: '08-24-2024',
      patientEpisodeTo: '10-22-2024',
      renderingPractitioner: 'Dr. Brian Clark',
      primaryDiagnosisCodes: ['I63.9', 'I69.30'],
      secondaryDiagnosisCodes: ['I10', 'E11.9'],
      certStatus: 'Document Signed',
      certSignedDate: '09-01-2024',
      recertStatus: 'Document Prepared',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Speech therapy sessions required',
      cpoMinsCaptured: 90,
      newDocs: 3,
      newCpoDocsCreated: 2
    },
    {
      id: 13,
      patientId: 'P013',
      patientName: 'Elizabeth S Harris',
      patientDOB: '01-12-1987',
      contactNumber: '555-345-9012',
      physicianName: 'Dr. Daniel Robinson',
      pg: 'Summit Medical Center',
      hhah: 'Dedicated Home Health',
      patientInsurance: 'Medicaid',
      patientInEHR: 'yes',
      patientSOC: '09-21-2023',
      patientEpisodeFrom: '09-15-2024',
      patientEpisodeTo: '11-13-2024',
      renderingPractitioner: 'Dr. Jennifer Lopez',
      primaryDiagnosisCodes: ['O90.4', 'Z39.0'],
      secondaryDiagnosisCodes: ['F53.0', 'D64.9'],
      certStatus: 'Document Billed',
      certSignedDate: '09-25-2024',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Postpartum care with newborn monitoring',
      cpoMinsCaptured: 105,
      newDocs: 4,
      newCpoDocsCreated: 2
    },
    {
      id: 14,
      patientId: 'P014',
      patientName: 'Charles P Martin',
      patientDOB: '05-20-1955',
      contactNumber: '555-456-0123',
      physicianName: 'Dr. Susan Baker',
      pg: 'Cornerstone Health Group',
      hhah: 'Professional Home Health',
      patientInsurance: 'United Healthcare',
      patientInEHR: 'no',
      patientSOC: '10-12-2023',
      patientEpisodeFrom: '08-07-2024',
      patientEpisodeTo: '10-05-2024',
      renderingPractitioner: 'Dr. Robert Johnson',
      primaryDiagnosisCodes: ['Z96.651', 'M96.89'],
      secondaryDiagnosisCodes: ['M17.0', 'E66.01'],
      certStatus: 'Document Signed',
      certSignedDate: '08-15-2024',
      recertStatus: 'Document Signed',
      recertSignedDate: '09-30-2024',
      f2fEligibility: 'yes',
      patientRemarks: 'Joint replacement rehabilitation',
      cpoMinsCaptured: 125,
      newDocs: 3,
      newCpoDocsCreated: 2
    },
    {
      id: 15,
      patientId: 'P015',
      patientName: 'Linda G Thompson',
      patientDOB: '09-08-1978',
      contactNumber: '555-567-1234',
      physicianName: 'Dr. James Wright',
      pg: 'Metropolitan Medical Associates',
      hhah: 'First Choice Home Health',
      patientInsurance: 'Aetna',
      patientInEHR: 'yes',
      patientSOC: '08-06-2024',
      patientEpisodeFrom: '08-06-2024',
      patientEpisodeTo: '10-04-2024',
      renderingPractitioner: 'Dr. Mary Wilson',
      primaryDiagnosisCodes: ['L89.314', 'E44.0'],
      secondaryDiagnosisCodes: ['E11.9', 'I10'],
      certStatus: 'Document Prepared',
      certSignedDate: '',
      recertStatus: 'Document not received',
      recertSignedDate: '',
      f2fEligibility: 'yes',
      patientRemarks: 'Wound care and nutritional support',
      cpoMinsCaptured: 25,
      newDocs: 2,
      newCpoDocsCreated: 1
    }
  ]);

  const handleMonthYearSubmit = () => {
    if (!selectedMonth || !selectedYear) return;

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);

    const filtered = dummyClaims.filter(claim => {
      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [month, day, year] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      };

      let isSignedInMonth = false;

      if (filterType === 'cert') {
        // Check cert/recert dates
        const certSignedDate = claim.certStatus === 'Document Signed' || claim.certStatus === 'Document Billed' 
          ? parseDate(claim.certSignedDate)
          : null;
        const recertSignedDate = claim.recertStatus === 'Document Signed' || claim.recertStatus === 'Document Billed' 
          ? parseDate(claim.recertSignedDate)
          : null;

        isSignedInMonth = (certSignedDate && certSignedDate >= startDate && certSignedDate <= endDate) ||
                         (recertSignedDate && recertSignedDate >= startDate && recertSignedDate <= endDate);
      } else {
        // Check CPO documents
        const cpoDocuments = [
          { date: claim.certSignedDate, status: claim.certStatus },
          { date: claim.recertSignedDate, status: claim.recertStatus }
        ];

        // Count documents signed in the selected month
        const signedDocsInMonth = cpoDocuments.filter(doc => {
          const signedDate = doc.status === 'Document Signed' || doc.status === 'Document Billed'
            ? parseDate(doc.date)
            : null;
          return signedDate && signedDate >= startDate && signedDate <= endDate;
        }).length;

        // Calculate CPO minutes (2 minutes per document)
        const cpoMinutes = signedDocsInMonth * 2;

        isSignedInMonth = signedDocsInMonth > 0 && cpoMinutes >= 30;
      }

      // Check if total ICD codes >= 3
      const totalIcdCodes = [...(claim.primaryDiagnosisCodes || []), ...(claim.secondaryDiagnosisCodes || [])].length;
      const hasEnoughIcdCodes = totalIcdCodes >= 3;

      // Check if EHR is yes
      const hasEhr = claim.patientInEHR === 'yes';

      return isSignedInMonth && hasEnoughIcdCodes && hasEhr;
    });

    setFilteredClaims(filtered);
    setShowMonthPicker(false);
  };

  const handleDownloadClaims = (format) => {
    const filteredClaims = getFilteredClaims();
    
    if (format === 'csv') {
      const csvContent = [
        ["Patient Name", "Claim ID", "Amount", "Status", "Date Filed"],
        ...filteredClaims.map(claim => [
          claim.patientName,
          claim.claimId,
          `$${claim.amount}`,
          claim.status,
          claim.date
        ])
      ].map(row => row.join(",")).join("\\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claims-${pgData.name}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // In a real application, you would use a library like jsPDF to generate the PDF
      alert('PDF export functionality would be implemented here with jsPDF or similar library');
    }
  };

  const renderMap = () => (
    <div className="pg-map-container">
      <div className="mock-map">
        <div className="map-placeholder">
          <h3>PG Location Map</h3>
          <p>Location: {pgData.location.address}</p>
          <p>Coordinates: {pgData.location.lat}, {pgData.location.lng}</p>
        </div>
      </div>
    </div>
  );

  const renderClaimsSection = () => (
    <div className="claims-section">
      <div className="claims-header">
        <h4>Claims</h4>
        <div className="claims-filters">
          <div className="filter-group">
            <button 
              className="filter-button"
              onClick={() => {
                setFilterType('cert');
                setShowMonthPicker(true);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Filter by Cert/Recert
            </button>
          </div>

          <div className="filter-group">
            <button 
              className="filter-button"
              onClick={() => {
                setFilterType('cpo');
                setShowMonthPicker(true);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Filter by CPO Documents
            </button>
          </div>

          {showMonthPicker && (
            <div className="modal-overlay">
              <div className="modal-content" data-type="month-year">
                <div className="modal-header">
                  <h2>Select Month and Year</h2>
                  <button className="close-button" onClick={() => setShowMonthPicker(false)}>×</button>
                </div>
                <div className="form-group">
                  <label>Month</label>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="">Select Month</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
            <select 
              value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
            >
                    <option value="">Select Year</option>
                    {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
                <div className="form-actions">
                  <button 
                    className="submit-button"
                    onClick={handleMonthYearSubmit}
                    disabled={!selectedMonth || !selectedYear}
                  >
                    Filter Claims
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedMonth && selectedYear && (
            <div className="filtered-results" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {filteredClaims.length > 0 ? (
                <>
                  <h3 style={{ margin: 0 }}>Filtered Claims: {filteredClaims.length}</h3>
                  <div className="export-buttons" style={{ display: 'flex', gap: '10px' }}>
            <button className="download-button" onClick={() => handleDownloadClaims('csv')}>
              Download CSV
            </button>
            <button className="download-button" onClick={() => handleDownloadClaims('pdf')}>
              Download PDF
            </button>
          </div>
                </>
              ) : (
                <h3 className="no-results">
                  No claims found for {filterType === 'cert' ? 'Cert/Recert' : 'CPO Documents'} in {new Date(2000, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
                </h3>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="claims-table">
          <thead>
            <tr>
              <th onClick={() => handleSortClick('patientName')}>
                Patient Name {sortConfig.key === 'patientName' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSortClick('patientId')}>
                Patient ID {sortConfig.key === 'patientId' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSortClick('patientInsurance')}>
                Insurance {sortConfig.key === 'patientInsurance' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSortClick('certStatus')}>
                Cert Status {sortConfig.key === 'certStatus' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSortClick('patientSOC')}>
                SOC Date {sortConfig.key === 'patientSOC' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSortClick('certSignedDate')}>
                Cert Date {sortConfig.key === 'certSignedDate' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSortClick('recertSignedDate')}>
                Recert Date {sortConfig.key === 'recertSignedDate' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSortClick('cpoMinsCaptured')}>
                CPO Status {sortConfig.key === 'cpoMinsCaptured' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {(filteredClaims.length > 0 ? filteredClaims : dummyClaims).map(claim => (
              <tr key={`claim-${claim.id}`}>
                <td>{claim.patientName}</td>
                <td>{claim.patientId}</td>
                <td>{claim.patientInsurance}</td>
                <td>
                  <span className={`claims-status-badge ${claim.certStatus.toLowerCase().replace(' ', '-')}`}>
                    {claim.certStatus}
                  </span>
                </td>
                <td>{claim.patientSOC ? new Date(claim.patientSOC).toLocaleDateString() : '-'}</td>
                <td>{claim.certSignedDate ? new Date(claim.certSignedDate).toLocaleDateString() : '-'}</td>
                <td>{claim.recertSignedDate ? new Date(claim.recertSignedDate).toLocaleDateString() : '-'}</td>
                <td>
                  <span className={`claims-status-badge ${claim.cpoMinsCaptured > 0 ? 'active' : 'inactive'}`}>
                    {claim.cpoMinsCaptured > 0 ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProactiveOutcomes = () => (
    <div className="proactive-outcomes-section outcomes-section">
      <div className="section-header">
        <h2>Proactive Outcomes</h2>
      </div>
      
      <div className="proactive-tables">
        {/* Physicians Table */}
        <div className="table-section physicians-section">
          <div className="section-header-with-actions">
            <h3>Physician Onboarding Status</h3>
            <div className="table-actions">
              <input
                type="text"
                placeholder="Search physicians..."
                className="search-input"
                onChange={(e) => {
                  // Add physician search functionality - could be added in future
                }}
              />
              <button className="action-button" onClick={() => setShowPhysicianForm(!showPhysicianForm)}>
                <span className="icon">+</span> Add Physician
              </button>
            </div>
          </div>
          
          {showPhysicianForm && (
            <div className="add-form">
              <h3>{editingPhysician ? 'Edit Physician' : 'Add New Physician'}</h3>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newPhysician.name}
                  onChange={(e) => setNewPhysician(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter physician name"
                />
              </div>
              <div className="form-group">
                <label>NPI:</label>
                <input
                  type="text"
                  value={newPhysician.npi}
                  onChange={(e) => setNewPhysician(prev => ({ ...prev, npi: e.target.value }))}
                  placeholder="Enter NPI number"
                />
              </div>
              <div className="form-group">
                <label>Specialty:</label>
                <input
                  type="text"
                  value={newPhysician.specialty}
                  onChange={(e) => setNewPhysician(prev => ({ ...prev, specialty: e.target.value }))}
                  placeholder="Enter specialty"
                />
              </div>
              <div className="form-group">
                <label>Analysis:</label>
                <textarea
                  value={newPhysician.analysis}
                  onChange={(e) => setNewPhysician(prev => ({ ...prev, analysis: e.target.value }))}
                  placeholder="Enter analysis notes"
                  rows="3"
                  className="analysis-textarea"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newPhysician.onboarded}
                    onChange={(e) => setNewPhysician(prev => ({ ...prev, onboarded: e.target.checked }))}
                  />
                  Onboarded
                </label>
              </div>
              <div className="form-actions">
                <button className="submit-button" onClick={() => {
                  if (!newPhysician.name || !newPhysician.npi || !newPhysician.specialty) {
                    alert("Please fill in all required fields");
                    return;
                  }

                  if (editingPhysician) {
                    // Update existing physician
                    setPgData(prev => {
                      // Update in physicians array
                      const updatedPhysicians = prev.physicians.map(p => 
                        p.id === editingPhysician.id ? { ...p, ...newPhysician } : p
                      );
                      
                      // Update in proactiveOutcomes array
                      const updatedOutcomes = prev.proactiveOutcomes.map(outcome => {
                        if (outcome.id === editingPhysician.id && outcome.type === 'physician') {
                          return {
                            ...outcome,
                            name: newPhysician.name,
                            npi: newPhysician.npi,
                            specialty: newPhysician.specialty,
                            onboarded: newPhysician.onboarded,
                            analysis: newPhysician.analysis
                          };
                        }
                        return outcome;
                      });
                      
                      return {
                        ...prev,
                        physicians: updatedPhysicians,
                        proactiveOutcomes: updatedOutcomes
                      };
                    });
                    
                    // Reset editing state
                    setEditingPhysician(null);
                  } else {
                    // Add new physician
                    const newPhysicianObj = {
                      id: pgData.physicians.length + 1,
                      ...newPhysician
                    };

                    setPgData(prev => ({
                      ...prev,
                      physicians: [
                        ...prev.physicians,
                        newPhysicianObj
                      ],
                      // Also add to proactiveOutcomes
                      proactiveOutcomes: [
                        ...prev.proactiveOutcomes,
                        {
                          id: newPhysicianObj.id,
                          name: newPhysicianObj.name,
                          npi: newPhysicianObj.npi,
                          specialty: newPhysicianObj.specialty,
                          onboarded: newPhysicianObj.onboarded,
                          type: 'physician',
                          dateAdded: new Date().toISOString()
                        }
                      ]
                    }));
                  }

                  // Reset the form
                  setNewPhysician({
                    name: "",
                    npi: "",
                    specialty: "",
                    onboarded: false,
                    analysis: ""
                  });
                  setShowPhysicianForm(false);
                }}>{editingPhysician ? 'Update Physician' : 'Add Physician'}</button>
                <button className="cancel-button" onClick={() => {
                  setShowPhysicianForm(false);
                  setEditingPhysician(null);
                  setNewPhysician({
                    name: "",
                    npi: "",
                    specialty: "",
                    onboarded: false,
                    analysis: ""
                  });
                }}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Physician Name</th>
                  <th>NPI</th>
                  <th>Specialty</th>
                  <th>Onboarded</th>
                  <th>Analysis</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgData.proactiveOutcomes
                  .filter(outcome => outcome.type === 'physician')
                  .map((physician, index) => {
                    const physicianData = pgData.physicians.find(p => p.id === physician.id) || physician;
                    return (
                      <tr key={`p-outcome-physician-${physician.id}-${index}`}>
                        <td>
                          <span className="physician-name-link" onClick={() => navigate(`/physician/${physician.id}`, { state: { physician: physicianData } })}>
                            {physician.name}
                          </span>
                        </td>
                        <td>{physician.npi}</td>
                        <td>{physician.specialty}</td>
                        <td>
                          <button 
                            className={`onboarding-toggle ${physician.onboarded ? 'onboarded' : 'not-onboarded'}`}
                            onClick={() => handleOnboardingToggle('physician', physician.id)}
                          >
                            {physician.onboarded ? '✓' : '✗'}
                          </button>
                        </td>
                        <td>
                          <div className="analysis-content">
                            {physicianData.analysis || '-'}
                          </div>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button 
                              className="action-icon edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPhysician(physicianData);
                                setNewPhysician(physicianData);
                                setShowPhysicianForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="action-icon delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to remove ${physician.name}?`)) {
                                  setPgData(prev => ({
                                    ...prev,
                                    physicians: prev.physicians.filter(p => p.id !== physician.id),
                                    proactiveOutcomes: prev.proactiveOutcomes.filter(p => p.id !== physician.id)
                                  }));
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* HHAHs Table */}
        <div className="table-section hhahs-section">
          <div className="section-header-with-actions">
            <h3>HHAH Onboarding Status</h3>
            <div className="table-actions">
              <input
                type="text"
                placeholder="Search HHAHs..."
                className="search-input"
                onChange={(e) => {
                  // Add HHAH search functionality - could be added in future
                }}
              />
              <button className="action-button" onClick={() => setShowHHAForm(!showHHAForm)}>
                <span className="icon">+</span> Add HHAH
              </button>
            </div>
          </div>
          
          {showHHAForm && (
            <div className="form-container">
              <h4>{editingHHA ? 'Edit HHAH' : 'Add New HHAH'}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newHHA.name} 
                    onChange={(e) => setNewHHA(prev => ({
                      ...prev,
                      name: e.target.value
                    }))} 
                    placeholder="Enter HHAH name"
                  />
                </div>
                <div className="form-group">
                  <label>Statistical Area:</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={newHHA.location} 
                    onChange={(e) => setNewHHA(prev => ({
                      ...prev,
                      location: e.target.value
                    }))} 
                    placeholder="Enter statistical area"
                  />
                </div>
                <div className="form-group">
                  <label>Contact:</label>
                  <input 
                    type="text" 
                    name="contact" 
                    value={newHHA.contact} 
                    onChange={(e) => setNewHHA(prev => ({
                      ...prev,
                      contact: e.target.value
                    }))} 
                    placeholder="Enter contact information"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="submit-button" onClick={() => {
                  if (!newHHA.name || !newHHA.location || !newHHA.contact) {
                    alert("Please fill in all required fields");
                    return;
                  }

                  if (editingHHA) {
                    // Update existing HHAH
                    setPgData(prev => ({
                      ...prev,
                      hhahs: prev.hhahs.map(h => 
                        h.id === editingHHA.id ? { ...h, ...newHHA } : h
                      )
                    }));
                    
                    // Reset editing state
                    setEditingHHA(null);
                  } else {
                    // Add new HHAH
                    setPgData(prev => ({
                      ...prev,
                      hhahs: [
                        ...prev.hhahs,
                        {
                          id: prev.hhahs.length + 1,
                          ...newHHA
                        }
                      ]
                    }));
                  }

                  // Reset the form
                  setNewHHA({
                    name: "",
                    location: "",
                    contact: "",
                    onboarded: false
                  });
                  setShowHHAForm(false);
                }}>{editingHHA ? 'Update HHAH' : 'Add HHAH'}</button>
                <button className="cancel-button" onClick={() => {
                  setShowHHAForm(false);
                  setEditingHHA(null);
                  setNewHHA({
                    name: "",
                    location: "",
                    contact: "",
                    onboarded: false
                  });
                }}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>HHAH Name</th>
                  <th>Statistical Area</th>
                  <th>Contact</th>
                  <th>Analysis</th>
                  <th>Onboarded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgData.hhahs.map(hhah => (
                  <tr key={`hhah-entry-${hhah.id}`}>
                    <td>{hhah.name}</td>
                    <td>{hhah.location}</td>
                    <td>{hhah.contact}</td>
                    <td>{hhah.analysis || "Pending analysis"}</td>
                    <td>
                      <button 
                        className={`onboarding-toggle ${hhah.onboarded ? 'onboarded' : 'not-onboarded'}`}
                        onClick={() => handleOnboardingToggle('hha', hhah.id)}
                      >
                        {hhah.onboarded ? '✓' : '✗'}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="action-icon edit" onClick={() => handleEditHHA(hhah)}>Edit</button>
                        <button className="action-icon delete" onClick={() => handleDeleteHHA(hhah.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReactiveOutcomes = () => (
    <div className="reactive-outcomes-section full-width">
      <div className="section-header">
        <h2>Reactive Outcomes</h2>
      </div>
      <ReactiveOutcomes />
    </div>
  );

  const renderInteractionLog = () => (
    <div className="interaction-log-section">
      <InteractionLog />
    </div>
  );

  const renderStaffList = () => (
    <div className="staff-list-section">
      <div className="section-header">
        <h2>Staff Management</h2>
        <p className="section-description">Manage physicians, NPPs, and office staff members</p>
      </div>
      <StaffList pgData={pgData} setPgData={setPgData} />
    </div>
  );

  const renderValueCommunication = () => (
    <div className="value-communication-section">
      <div className="section-header">
        <h2>Value Communication</h2>
      </div>

      <div className="value-comm-grid">
        {/* Communication Reports Panel - Now separated into MBRs and Weekly Reports */}
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
                .filter(report => report.fileName.toLowerCase().includes('communication') || report.fileName.toLowerCase().includes('mbr'))
                .map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-icon">
                      <span className="document-icon">📊</span>
                    </div>
                    <div className="report-details">
                      <h4 className="report-filename">{report.fileName}</h4>
                      <p className="report-notes">{report.notes}</p>
                      <div className="report-meta">
                        {report.date}
                      </div>
                    </div>
                    <div className="report-actions">
                      <button className="icon-button" onClick={() => handleViewReport(report)}>
                        <span className="action-icon">👁️</span>
                      </button>
                      <button className="icon-button" onClick={() => handleDownloadReport(report)}>
                        <span className="action-icon">⬇️</span>
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
                .filter(report => report.fileName.toLowerCase().includes('weekly'))
                .map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-icon">
                      <span className="document-icon">📝</span>
                    </div>
                    <div className="report-details">
                      <h4 className="report-filename">{report.fileName}</h4>
                      <p className="report-notes">{report.notes}</p>
                      <div className="report-meta">
                        {report.date}
                      </div>
                    </div>
                    <div className="report-actions">
                      <button className="icon-button" onClick={() => handleViewReport(report)}>
                        <span className="action-icon">👁️</span>
                      </button>
                      <button className="icon-button" onClick={() => handleDownloadReport(report)}>
                        <span className="action-icon">⬇️</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* MBR Tasks and Weekly Reports in the same row */}
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
              .filter(task => task.task.toLowerCase().includes('data') || task.task.toLowerCase().includes('metrics'))
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
              value={valueCommunicationState.newMBRTask}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newMBRTask: e.target.value
              }))}
              className="task-input"
            />
            <input
              type="date"
              value={valueCommunicationState.newMBRTaskDate}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newMBRTaskDate: e.target.value
              }))}
              className="task-date-input"
            />
            <button 
              className="submit-button"
              onClick={() => {
                if (valueCommunicationState.newMBRTask && valueCommunicationState.newMBRTaskDate) {
                  handleAddMDRTask(
                    valueCommunicationState.newMBRTask,
                    valueCommunicationState.newMBRTaskDate
                  );
                  setValueCommunicationState(prev => ({
                    ...prev,
                    newMBRTask: "",
                    newMBRTaskDate: ""
                  }));
                } else {
                  alert("Please fill in both the task description and due date");
                }
              }}
            >
              Add MBR Task
            </button>
          </div>
        </div>

        {/* Weekly Reports Panel converted to Interaction Summaries Panel */}
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

          <div className="weekly-report-stats">
            <div className="weekly-stat-item">
              <span className="stat-label">Reports Sent:</span>
              <span className="stat-value">{valueCommunicationState.weeklyReportsSent}</span>
            </div>
            <div className="weekly-stat-item">
              <span className="stat-label">Reports Upcoming:</span>
              <span className="stat-value">{valueCommunicationState.weeklyReportsUpcoming}</span>
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
                onChange={(e) => handleRapportSearch(e)}
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
                onChange={(e) => handleNewRapportChange(e)}
              />
            </div>
            <div className="rapport-form-group">
              <label>Designation</label>
              <input 
                type="text" 
                placeholder="Enter designation" 
                name="designation"
                value={rapportState.newRecord.designation}
                onChange={(e) => handleNewRapportChange(e)}
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
                onChange={(e) => handleNewRapportChange(e)}
              />
            </div>
            <div className="rapport-form-group">
              <label>Analysis</label>
              <textarea 
                placeholder="Enter analysis" 
                name="understanding"
                value={rapportState.newRecord.understanding}
                onChange={(e) => handleNewRapportChange(e)}
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

  // Value Communication Handlers
  const handleAddInteraction = () => {
    if (!valueCommunicationState.newInteraction.trim()) return;

    setValueCommunicationState(prev => ({
      ...prev,
      interactions: [
        {
          id: prev.interactions.length + 1,
          summary: prev.newInteraction,
          date: new Date().toISOString().split('T')[0],
          author: "Current User"
        },
        ...prev.interactions
      ],
      newInteraction: ""
    }));
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      setValueCommunicationState(prev => ({
        ...prev,
        reports: prev.reports.filter(report => report.id !== reportId)
      }));
    }
  };

  const handleEditReport = (report) => {
    setValueCommunicationState(prev => ({
      ...prev,
      selectedReport: report,
      isEditingReport: true,
      newReportNote: report.notes
    }));
  };

  const handleSaveReport = () => {
    setValueCommunicationState(prev => ({
      ...prev,
      reports: prev.reports.map(report =>
        report.id === prev.selectedReport.id
          ? { ...report, notes: prev.newReportNote }
          : report
      ),
      selectedReport: null,
      isEditingReport: false,
      newReportNote: ""
    }));
  };

  const handleToggleMDRTask = (taskId) => {
    setValueCommunicationState(prev => ({
      ...prev,
      mdrTasks: prev.mdrTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleAddMDRTask = (taskName, dueDate) => {
    setValueCommunicationState(prev => ({
      ...prev,
      mdrTasks: [
        ...prev.mdrTasks,
        {
          id: prev.mdrTasks.length + 1,
          task: taskName,
          completed: false,
          dueDate
        }
      ],
      // Increment mbrsUpcoming if it's an MBR task
      mbrsUpcoming: taskName.toLowerCase().includes('data') || taskName.toLowerCase().includes('metrics') 
        ? prev.mbrsUpcoming + 1 
        : prev.mbrsUpcoming,
      // Increment weeklyReportsUpcoming if it's a weekly report task
      weeklyReportsUpcoming: taskName.toLowerCase().includes('feedback') || taskName.toLowerCase().includes('collect')
        ? prev.weeklyReportsUpcoming + 1
        : prev.weeklyReportsUpcoming
    }));
  };

  // New function to add a report
  const handleAddReport = () => {
    const reportType = window.prompt("Select report type (MBR or Weekly):", "MBR");
    if (!reportType) return;
    
    const fileName = reportType.toLowerCase() === "mbr" 
      ? `MBR_Report_${new Date().toISOString().split('T')[0]}.pdf`
      : `Weekly_Update_${new Date().getDate()}.pdf`;
      
    const notes = window.prompt("Enter report notes:", 
      reportType.toLowerCase() === "mbr" ? "Monthly business review" : "Weekly progress report");
    if (!notes) return;
    
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
  };

  // New function to download a report
  const handleDownloadReport = (report) => {
    // Create mock report content based on report type
    let content = '';
    
    if (report.fileName.toLowerCase().includes('communication') || report.fileName.toLowerCase().includes('mbr')) {
      // MBR report content
      content = `
# ${report.fileName.replace('.pdf', '')}
Date: ${report.date}
Type: Monthly Business Review

## Summary
${report.notes}

## Performance Metrics
- Patient Satisfaction: 87%
- Care Quality: 92%
- Response Time: 4.3 hours (average)

## Physician Engagement
- Dr. Sarah Johnson: High engagement
- Dr. Robert Chen: Medium engagement
- Dr. Maria Garcia: High engagement

## Action Items
1. Improve response time for urgent cases
2. Schedule follow-up meeting with key physicians
3. Review patient feedback for Q1

## Prepared by
Healthcare Analytics Team
`;
    } else {
      // Weekly report content
      content = `
# ${report.fileName.replace('.pdf', '')}
Date: ${report.date}
Type: Weekly Progress Report

## Summary
${report.notes}

## Weekly Metrics
- New Patients: 12
- Follow-up Appointments: 28
- Emergency Cases: 3

## Notable Events
- Staff meeting on Tuesday
- New equipment training on Thursday
- Patient satisfaction survey distributed

## Next Week Focus
- Complete patient outreach program
- Finalize schedule for next month
- Review inventory needs

## Prepared by
Operations Team
`;
    }
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.fileName.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Fix for Rapport record editing
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
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (!validateRapportScore(score)) {
      showNotification('Score must be between 0 and 10', 'error');
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

  // Fix for Rapport record deletion
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
  
  // Fix for adding new Rapport record
  const handleAddRapportRecord = () => {
    const name = window.prompt("Enter name:");
    if (!name) return;
    
    const designation = window.prompt("Enter designation:");
    if (!designation) return;
    
    const score = window.prompt("Enter score (0-10):");
    if (!score || !validateRapportScore(score)) {
      alert("Score must be between 0 and 10");
      return;
    }
    
    const understanding = window.prompt("Enter understanding/feedback:");
    if (!understanding) return;
    
    setRapportState(prev => ({
      ...prev,
      records: [
        ...prev.records,
        {
          id: prev.records.length + 1,
          name,
          designation,
          score,
          understanding,
          date: new Date().toISOString().split('T')[0]
        }
      ],
      notification: { message: "Record added successfully", type: "success" }
    }));
    
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const validateRapportScore = (score) => {
    const numScore = parseFloat(score);
    return !isNaN(numScore) && numScore >= 0 && numScore <= 10;
  };

  const handleRapportSearch = (e) => {
    setRapportState(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };

  const handleSubmitRapport = () => {
    const { newRecord } = rapportState;
    
    if (!newRecord.name || !newRecord.designation || !newRecord.score || !newRecord.understanding) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (!validateRapportScore(newRecord.score)) {
      showNotification('Score must be between 0 and 10', 'error');
      return;
    }

    setRapportState(prev => {
      const newRecordWithId = {
        id: prev.records.length + 1,
        ...newRecord,
        date: new Date().toISOString().split('T')[0]
      };

      // Check if score is low for notification
      if (parseFloat(newRecord.score) < 5) {
        showNotification(`Low score alert: ${newRecord.name} needs improvement`, 'warning');
      }

      return {
        ...prev,
        records: [newRecordWithId, ...prev.records],
        newRecord: {
          name: "",
          designation: "",
          score: "",
          understanding: ""
        }
      };
    });

    showNotification('Rapport record added successfully');
  };

  const showNotification = (message, type = 'success') => {
    setRapportState(prev => ({
      ...prev,
      notification: { message, type }
    }));
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const calculateAverageScore = () => {
    const scores = rapportState.records.map(record => parseFloat(record.score));
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return isNaN(average) ? 0 : average.toFixed(1);
  };

  // Calculate physician onboarding success rate
  const calculatePhysicianOnboardingRate = () => {
    if (pgData.physicians.length === 0) return 0;
    const onboardedCount = pgData.physicians.filter(physician => physician.onboarded).length;
    return Math.round((onboardedCount / pgData.physicians.length) * 100);
  };

  // Calculate HHAH onboarding success rate
  const calculateHHAHOnboardingRate = () => {
    if (pgData.hhahs.length === 0) return 0;
    const onboardedCount = pgData.hhahs.filter(hhah => hhah.onboarded).length;
    return Math.round((onboardedCount / pgData.hhahs.length) * 100);
  };

  // Count reactive outcomes by status
  const countReactiveOutcomesByStatus = () => {
    const statusCounts = {
      Open: 0,
      Analysing: 0,
      Analysed: 0,
      Catalysed: 0
    };
    
    pgData.reactiveOutcomes.forEach(outcome => {
      if (statusCounts.hasOwnProperty(outcome.status)) {
        statusCounts[outcome.status]++;
      }
    });
    
    return statusCounts;
  };

  const handleExportRapport = (format) => {
    const records = getFilteredAndSortedRapportRecords();
    
    if (format === 'csv') {
      const csvContent = [
        ["Name", "Designation", "Score", "Understanding", "Date"],
        ...records.map(record => [
          record.name,
          record.designation,
          record.score,
          record.understanding,
          record.date
        ])
      ].map(row => row.join(",")).join("\\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showNotification('Report exported as CSV');
    } else if (format === 'pdf') {
      showNotification('PDF export functionality coming soon', 'info');
    }
  };

  const getFilteredAndSortedRapportRecords = () => {
    let filteredRecords = [...rapportState.records];
    
    // Apply search filter
    if (rapportState.searchTerm) {
      const searchTerm = rapportState.searchTerm.toLowerCase();
      filteredRecords = filteredRecords.filter(record =>
        record.name.toLowerCase().includes(searchTerm) ||
        record.designation.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
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

  const handleNewRapportChange = (e) => {
    const { name, value } = e.target;
    setRapportState(prev => ({
      ...prev,
      newRecord: {
        ...prev.newRecord,
        [name]: value
      }
    }));
  };

  const renderOverviewSection = () => (
    <div className="overview-section">
      {/* Section Summary Cards - Clickable to navigate to tabs */}
      <h3 className="section-summaries-title">Section Summaries</h3>
      <div className="section-summaries">
        {/* Staff List Summary */}
        <div className="summary-card" onClick={() => setActiveSection('staff')}>
          <div className="summary-header">
            <h4>Staff List</h4>
            <span className="summary-icon">👥</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{pgData.physicians.length} Physicians</p>
            <p className="summary-stat">{pgData.npp.length} NPPs</p>
            <p className="summary-stat">{pgData.staff.length} Staff Members</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Proactive Outcomes Summary */}
        <div className="summary-card" onClick={() => setActiveSection('proactive-outcomes')}>
          <div className="summary-header">
            <h4>Proactive Outcomes</h4>
            <span className="summary-icon">📈</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">Physician Onboarding: {calculatePhysicianOnboardingRate()}%</p>
            <p className="summary-stat">HHAH Onboarding: {calculateHHAHOnboardingRate()}%</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Reactive Outcomes Summary */}
        <div className="summary-card" onClick={() => setActiveSection('reactive-outcomes')}>
          <div className="summary-header">
            <h4>Reactive Outcomes</h4>
            <span className="summary-icon">🚨</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">
              Open: {countReactiveOutcomesByStatus().Open}
            </p>
            <p className="summary-stat">
              Analysing: {countReactiveOutcomesByStatus().Analysing}, 
              Analysed: {countReactiveOutcomesByStatus().Analysed}, 
              Catalysed: {countReactiveOutcomesByStatus().Catalysed}
            </p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Interaction Log Summary */}
        <div className="summary-card" onClick={() => setActiveSection('interaction-log')}>
          <div className="summary-header">
            <h4>Interaction Log</h4>
            <span className="summary-icon">📝</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">Recent Interactions</p>
            <p className="summary-stat">View interaction history</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Claims Summary */}
        <div className="summary-card" onClick={() => setActiveSection('claims')}>
          <div className="summary-header">
            <h4>Claims</h4>
            <span className="summary-icon">📊</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">Total number of 179 claims: 3</p>
            <p className="summary-stat">Total number of 180 claims: 2</p>
            <p className="summary-stat">Total number of 181 claims: 2</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Value Communication Summary */}
        <div className="summary-card" onClick={() => setActiveSection('value-communication')}>
          <div className="summary-header">
            <h4>Value Communication</h4>
            <span className="summary-icon">💬</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">MBRs: {valueCommunicationState.mbrsDone} Done, {valueCommunicationState.mbrsUpcoming} Upcoming</p>
            <p className="summary-stat">Weekly Reports: {valueCommunicationState.weeklyReportsSent} Sent, {valueCommunicationState.weeklyReportsUpcoming} Upcoming</p>
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
            <p className="summary-stat">{rapportState.records ? rapportState.records.filter(record => parseFloat(record.score) >= 8).length : 0} High Rapport Relationships</p>
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
      case 'proactive-outcomes':
        return renderProactiveOutcomes();
      case 'staff':
        return renderStaffList();
      case 'communication':
        return renderValueCommunication();
      case 'reactive-outcomes':
        return renderReactiveOutcomes();
      case 'interaction-log':
        return renderInteractionLog();
      case 'claims':
        return renderClaimsSection();
      case 'value-communication':
        return renderValueCommunication();
      case 'rapport':
        return renderRapportManagement();
      default:
        return renderOverviewSection();
    }
  };

  const renderHeader = () => (
    <div className="pg-header">
      <div className="pg-title">
        <button 
          className="back-button" 
          onClick={handleBackNavigation}
        >
          <span className="back-arrow">←</span> 
          {fromPhysician 
            ? `Back to Dr. ${physicianContext?.name?.split(' ').pop() || 'Physician'}` 
            : 'Back'
          }
        </button>
        <h2>{pgData.name}</h2>
        <p className="pg-subtitle">
          {fromPhysician 
            ? `Viewing as associated with physician: ${physicianContext?.name}` 
            : 'Manage and monitor performance with Physician Group.'
          }
        </p>
      </div>
      <div className="pg-actions">
        <button className="action-button primary" onClick={() => {
          const format = window.prompt("Select export format (csv or pdf):", "csv");
          if (format === "csv" || format === "pdf") {
            handleExportRapport(format);
          }
        }}>
          <span className="icon">📊</span> Export Data
        </button>
        <button className="action-button" onClick={() => {
          alert("Settings functionality will be implemented in a future update.");
        }}>
          <span className="icon">⚙️</span> Settings
        </button>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="navigation-tabs">
      <button
        className={`nav-tab ${activeSection === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveSection('overview')}
      >
        Overview
      </button>
      <button
        className={`nav-tab ${activeSection === 'staff' ? 'active' : ''}`}
        onClick={() => setActiveSection('staff')}
      >
        Staff List
      </button>
      <button
        className={`nav-tab ${activeSection === 'proactive-outcomes' ? 'active' : ''}`}
        onClick={() => setActiveSection('proactive-outcomes')}
      >
        Proactive Outcomes
      </button>
      <button
        className={`nav-tab ${activeSection === 'reactive-outcomes' ? 'active' : ''}`}
        onClick={() => setActiveSection('reactive-outcomes')}
      >
        Reactive Outcomes
      </button>
      <button
        className={`nav-tab ${activeSection === 'interaction-log' ? 'active' : ''}`}
        onClick={() => setActiveSection('interaction-log')}
      >
        Interaction Log
      </button>
      <button
        className={`nav-tab ${activeSection === 'claims' ? 'active' : ''}`}
        onClick={() => setActiveSection('claims')}
      >
        Claims
      </button>
      <button
        className={`nav-tab ${activeSection === 'value-communication' ? 'active' : ''}`}
        onClick={() => setActiveSection('value-communication')}
      >
        Value Communication
      </button>
      <button
        className={`nav-tab ${activeSection === 'rapport' ? 'active' : ''}`}
        onClick={() => setActiveSection('rapport')}
      >
        Rapport
      </button>
    </div>
  );

  // Add functions to handle editing and deleting proactive outcomes
  const handleEditPhysician = (physician) => {
    // Find the full physician data from pgData.physicians
    const physicianData = pgData.physicians.find(p => p.id === physician.id) || physician;
    
    setEditingPhysician(physician);
    setNewPhysician({
      name: physician.name,
      npi: physician.npi,
      specialty: physician.specialty,
      onboarded: physician.onboarded,
      analysis: physician.analysis
    });
    setShowPhysicianForm(true);
  };

  const handleDeletePhysician = (id) => {
    if (window.confirm("Are you sure you want to delete this physician?")) {
      setPgData(prev => ({
        ...prev,
        physicians: prev.physicians.filter(physician => physician.id !== id),
        proactiveOutcomes: prev.proactiveOutcomes.filter(
          outcome => !(outcome.id === id && outcome.type === 'physician')
        )
      }));
    }
  };

  const handleEditHHA = (hhah) => {
    setEditingHHA(hhah);
    setNewHHA({
      name: hhah.name,
      location: hhah.location,
      contact: hhah.contact,
      onboarded: hhah.onboarded
    });
    setShowHHAForm(true);
  };

  const handleDeleteHHA = (id) => {
    if (window.confirm("Are you sure you want to delete this HHAH?")) {
      setPgData(prev => ({
        ...prev,
        hhahs: prev.hhahs.filter(hhah => hhah.id !== id)
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
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

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setShowMonthPicker(true);
  };

  const handleFilterMonthChange = (e) => {
    setSelectedFilterMonth(e.target.value);
    // Here you would implement the actual filtering logic
    // based on the selected month and filter type (cert/recert/CPO)
  };

  return (
    <div className="pg-view-container">
      {renderHeader()}
      {renderNavigation()}
      <div className="pg-main-content">
        {renderMainContent()}
      </div>
      {rapportState.notification && (
        <div className={`notification ${rapportState.notification.type}`}>
          {rapportState.notification.message}
        </div>
      )}
    </div>
  );
};

export default PGView; 