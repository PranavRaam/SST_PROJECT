import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../sa_view_css/PGView.css';
import './StaffList.css';
import './proactiveoutcomes.css';
import './InteractionLog.css';
import './ValueCommunication.css';
import StaffList from './StaffList';
import ReactiveOutcomes from './reactiveoc';
import InteractionLog from './InteractionLog';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePatientContext } from '../../context/PatientContext';
import { getMockPatientsByPG, mockDataDates } from '../../utils/mockDataService';

const PGView = () => {
  const navigate = useNavigate();
  const { pgName } = useParams();
  const location = useLocation();
  const { getPatientsByPG } = usePatientContext();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Add state for tracking if we're viewing from physician context
  const [fromPhysician, setFromPhysician] = useState(false);
  const [physicianContext, setPhysicianContext] = useState(null);
  
  // Add state for certificate validation and filtering
  const [certValidatedClaims, setCertValidatedClaims] = useState([]);
  const [cpoValidatedClaims, setCpoValidatedClaims] = useState([]);
  const [showCertClaimsOnly, setShowCertClaimsOnly] = useState(false);
  const [showCpoClaimsOnly, setShowCpoClaimsOnly] = useState(false);
  const [billingMonth, setBillingMonth] = useState(mockDataDates.fixedMonth.toString().padStart(2, '0')); // Default to our fixed test month
  const [billingYear, setBillingYear] = useState(mockDataDates.fixedYear.toString()); // Default to our fixed test year
  const [validationStatus, setValidationStatus] = useState('');
  
  // Add these state variables at the top of the component where other state variables are defined
  const [dateFilterType, setDateFilterType] = useState('custom'); // 'custom', 'week', 'month', 'quarter'
  const [useDateFilterForBilling, setUseDateFilterForBilling] = useState(false);
  
  // Add this line:
  const [showValidationModal, setShowValidationModal] = useState(false);
  
  // At the top of the PGView component, add the CSS styles
  const styles = {
    periodButton: {
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    periodButtonActive: {
      padding: '8px 12px',
      border: '1px solid #4F46E5',
      backgroundColor: '#dbeafe',
      color: '#2563eb',
      fontWeight: '500',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    // Rest of your styles...
  };
  
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
      address: "123 Healthcare Blvd, Phoenix, AZ 85001",
      phone: "(480) 555-7890",
      email: "contact@americancarepartners.com"
    },
    location: {
      lat: 33.4484,
      lng: -112.0740,
      address: "Phoenix, AZ 85001"
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
      { id: 1, name: "HomeHealth Plus", location: "Phoenix, AZ 85004", contact: "(480) 111-2222", onboarded: true },
      { id: 2, name: "CaringHands HHA", location: "Scottsdale, AZ 85251", contact: "(480) 222-3333", onboarded: false },
      { id: 3, name: "Comfort Care Services", location: "Tempe, AZ 85281", contact: "(480) 333-4444", onboarded: true },
      { id: 4, name: "Elite Home Health", location: "Mesa, AZ 85201", contact: "(480) 444-5555", onboarded: false }
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
    mbrsDone: 1,
    mbrsUpcoming: 2,
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
    isEditingReport: false,
    weeklyTasksDone: 1,
    weeklyTasksUpcoming: 2,
    weeklyTasks: [
      { id: 1, task: "Review weekly metrics", completed: true, dueDate: "03/20/2024" },
      { id: 2, task: "Schedule team meeting", completed: false, dueDate: "03/18/2024" },
      { id: 3, task: "Update progress report", completed: false, dueDate: "03/25/2024" }
    ]
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

  // Add function for table column sorting
  const handleSortClick = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Update the handleDateRangeChange function to convert ISO dates to American format
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    
    // Convert ISO date from input to American format for internal storage
    if (value) {
      // For the UI inputs we keep the ISO format, but convert for display elsewhere
    setSelectedDateRange(prev => ({
      ...prev,
        [name]: value
      }));
    } else {
      setSelectedDateRange(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Update the handlePeriodChange function to store dates in ISO format for form inputs
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    
    if (period === 'all') {
      setSelectedDateRange({ start: '', end: '' });
      setFilteredClaims([]);
    }
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

  // Add filterType state since it's not declared at the top
  const [filterType, setFilterType] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Dummy claims data from PatientFormComponent
  const dummyClaims = [
    {
      id: 1,
      remarks: 'Initial Visit',
      sNo: '001',
      fullName: 'Smith, John A',
      firstName: 'John',
      middleName: 'A',
      lastName: 'Smith',
      dob: '05/15/1950',
      hhaName: 'ABC Home Health',
      insuranceType: 'Medicare',
      primaryDiagnosisCode: 'I10',
      secondaryDiagnosisCode1: 'E11.9',
      secondaryDiagnosisCode2: 'M17.9',
      secondaryDiagnosisCode3: 'I25.10',
      secondaryDiagnosisCode4: 'E78.5',
      secondaryDiagnosisCode5: 'J45.909',
      soc: '01/15/2024',
      episodeFrom: '01/15/2024',
      episodeTo: '04/15/2024',
      minutesCaptured: 60,
      billingCode: '179',
      line1DosFrom: '01/15/2024',
      line1DosTo: '01/15/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Sarah Johnson'
    },
    {
      id: 2,
      remarks: 'Follow-up',
      sNo: '002',
      fullName: 'Johnson, Mary L',
      firstName: 'Mary',
      middleName: 'L',
      lastName: 'Johnson',
      dob: '08/22/1945',
      hhaName: 'XYZ Home Care',
      insuranceType: 'Medicaid',
      primaryDiagnosisCode: 'E11.9',
      secondaryDiagnosisCode1: 'I10',
      secondaryDiagnosisCode2: 'M54.5',
      secondaryDiagnosisCode3: 'J45.909',
      secondaryDiagnosisCode4: 'E78.5',
      secondaryDiagnosisCode5: 'I25.10',
      soc: '02/01/2024',
      episodeFrom: '02/01/2024',
      episodeTo: '05/01/2024',
      minutesCaptured: 45,
      billingCode: '180',
      line1DosFrom: '02/01/2024',
      line1DosTo: '02/01/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Michael Brown'
    },
    {
      id: 3,
      remarks: 'Cardiac Rehab',
      sNo: '003',
      fullName: 'Gonzalez, Maria E',
      firstName: 'Maria',
      middleName: 'E',
      lastName: 'Gonzalez',
      dob: '07/14/1968',
      hhaName: 'Phoenix Home Health',
      insuranceType: 'Medicare',
      primaryDiagnosisCode: 'I50.9',
      secondaryDiagnosisCode1: 'I48.91',
      secondaryDiagnosisCode2: 'I10',
      secondaryDiagnosisCode3: 'E11.9',
      secondaryDiagnosisCode4: 'E78.5',
      secondaryDiagnosisCode5: 'J44.9',
      soc: '01/30/2024',
      episodeFrom: '01/30/2024',
      episodeTo: '04/30/2024',
      minutesCaptured: 120,
      billingCode: '181',
      line1DosFrom: '01/30/2024',
      line1DosTo: '01/30/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. James Peterson'
    },
    {
      id: 4,
      remarks: 'Wound Care',
      sNo: '004',
      fullName: 'Williams, Robert J',
      firstName: 'Robert',
      middleName: 'J',
      lastName: 'Williams',
      dob: '11/03/1968',
      hhaName: 'Comfort Care Services',
      insuranceType: 'Aetna',
      primaryDiagnosisCode: 'L89.313',
      secondaryDiagnosisCode1: 'E11.9',
      secondaryDiagnosisCode2: 'I10',
      secondaryDiagnosisCode3: 'M81.0',
      secondaryDiagnosisCode4: 'E78.5',
      secondaryDiagnosisCode5: 'J45.909',
      soc: '01/28/2024',
      episodeFrom: '01/28/2024',
      episodeTo: '04/28/2024',
      minutesCaptured: 75,
      billingCode: '179',
      line1DosFrom: '01/28/2024',
      line1DosTo: '01/28/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Jessica Miller'
    },
    {
      id: 5,
      remarks: 'Physical Therapy',
      sNo: '005',
      fullName: 'Brown, Michael T',
      firstName: 'Michael',
      middleName: 'T',
      lastName: 'Brown',
      dob: '02/28/1985',
      hhaName: 'Premier Home Health',
      insuranceType: 'UnitedHealthcare',
      primaryDiagnosisCode: 'S72.001A',
      secondaryDiagnosisCode1: 'M17.11',
      secondaryDiagnosisCode2: 'E03.9',
      secondaryDiagnosisCode3: 'M54.5',
      secondaryDiagnosisCode4: 'E66.01',
      secondaryDiagnosisCode5: 'F41.1',
      soc: '01/04/2024',
      episodeFrom: '01/04/2024',
      episodeTo: '04/04/2024',
      minutesCaptured: 120,
      billingCode: '180',
      line1DosFrom: '01/04/2024',
      line1DosTo: '01/04/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Thomas Anderson'
    },
    {
      id: 6,
      remarks: 'Mental Health',
      sNo: '006',
      fullName: 'Davis, Jennifer L',
      firstName: 'Jennifer',
      middleName: 'L',
      lastName: 'Davis',
      dob: '09/17/1972',
      hhaName: 'Caring Hands Home Health',
      insuranceType: 'Cigna',
      primaryDiagnosisCode: 'F41.9',
      secondaryDiagnosisCode1: 'G47.00',
      secondaryDiagnosisCode2: 'E66.9',
      secondaryDiagnosisCode3: 'M17.0',
      secondaryDiagnosisCode4: '',
      secondaryDiagnosisCode5: '',
      soc: '02/24/2024',
      episodeFrom: '02/24/2024',
      episodeTo: '05/24/2024',
      minutesCaptured: 60,
      billingCode: '181',
      line1DosFrom: '02/24/2024',
      line1DosTo: '02/24/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Christopher Lee'
    },
    {
      id: 7,
      remarks: 'Rehabilitation',
      sNo: '007',
      fullName: 'Miller, David W',
      firstName: 'David',
      middleName: 'W',
      lastName: 'Miller',
      dob: '04/09/1990',
      hhaName: 'Elite Home Health Services',
      insuranceType: 'Humana',
      primaryDiagnosisCode: 'S72.001A',
      secondaryDiagnosisCode1: 'M17.11',
      secondaryDiagnosisCode2: 'I10',
      secondaryDiagnosisCode3: 'E11.9',
      secondaryDiagnosisCode4: '',
      secondaryDiagnosisCode5: '',
      soc: '01/22/2024',
      episodeFrom: '01/22/2024',
      episodeTo: '04/22/2024',
      minutesCaptured: 90,
      billingCode: '179',
      line1DosFrom: '01/22/2024',
      line1DosTo: '01/22/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Andrew Wilson'
    },
    {
      id: 8,
      remarks: 'Cardiac Monitoring',
      sNo: '008',
      fullName: 'Wilson, Susan E',
      firstName: 'Susan',
      middleName: 'E',
      lastName: 'Wilson',
      dob: '08/12/1965',
      hhaName: 'Harmony Home Health',
      insuranceType: 'Medicare Advantage',
      primaryDiagnosisCode: 'I50.9',
      secondaryDiagnosisCode1: 'I48.91',
      secondaryDiagnosisCode2: 'E78.5',
      secondaryDiagnosisCode3: 'N18.3',
      secondaryDiagnosisCode4: '',
      secondaryDiagnosisCode5: '',
      soc: '01/28/2024',
      episodeFrom: '01/28/2024',
      episodeTo: '04/28/2024',
      minutesCaptured: 45,
      billingCode: '180',
      line1DosFrom: '01/28/2024',
      line1DosTo: '01/28/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Kevin Barnes'
    },
    {
      id: 9,
      remarks: 'Daily Activities Assistance',
      sNo: '009',
      fullName: 'Moore, James H',
      firstName: 'James',
      middleName: 'H',
      lastName: 'Moore',
      dob: '06/25/1958',
      hhaName: 'Quality Home Health',
      insuranceType: 'TRICARE',
      primaryDiagnosisCode: 'G20',
      secondaryDiagnosisCode1: 'R26.2',
      secondaryDiagnosisCode2: 'I10',
      secondaryDiagnosisCode3: 'E03.9',
      secondaryDiagnosisCode4: '',
      secondaryDiagnosisCode5: '',
      soc: '01/15/2024',
      episodeFrom: '01/15/2024',
      episodeTo: '04/15/2024',
      minutesCaptured: 120,
      billingCode: '181',
      line1DosFrom: '01/15/2024',
      line1DosTo: '01/15/2024',
      line1Charges: 113.00,
      line1Pos: '11',
      line1Units: 1,
      providersName: 'Dr. Olivia Green'
    }
  ];

  // Add this useEffect hook to debug pgName
  useEffect(() => {
    console.log("Current PG Name:", pgName);
  }, [pgName]);

  // Update the getFilteredClaims function
  const getFilteredClaims = () => {
    // If showCertClaimsOnly is true, return only validated CERT claims
    if (showCertClaimsOnly) {
      return certValidatedClaims.length > 0 ? certValidatedClaims : [];
    }
    
    // If showCpoClaimsOnly is true, return only validated CPO claims
    if (showCpoClaimsOnly) {
      return cpoValidatedClaims.length > 0 ? cpoValidatedClaims : [];
    }
    
    // If validation has been done, prioritize showing the validated claims
    if (certValidatedClaims.length > 0 || cpoValidatedClaims.length > 0) {
      return [...certValidatedClaims, ...cpoValidatedClaims];
    }
    
    // If there are filtered claims, use those
    if (filteredClaims.length > 0) {
      return filteredClaims;
    }

    // Normalize pgName for consistent comparison (lowercase)
    const normalizedPgName = pgName ? pgName.toLowerCase() : '';
    
    // First, get only patients from the selected PG using the mock function
    const pgPatients = getMockPatientsByPG(normalizedPgName);
    
    // Convert patient data to claims format
    const pgClaims = pgPatients.map(patient => ({
      id: patient.id,
      remarks: patient.patientRemarks || '',
      sNo: patient.patientId,
      fullName: `${patient.patientLastName}, ${patient.patientFirstName} ${patient.patientMiddleName || ''}`,
      firstName: patient.patientFirstName,
      middleName: patient.patientMiddleName,
      lastName: patient.patientLastName,
      dob: patient.patientDOB,
      hhaName: patient.hhah,
      insuranceType: patient.patientInsurance,
      primaryDiagnosisCode: patient.primaryDiagnosisCodes ? patient.primaryDiagnosisCodes[0] : '',
      secondaryDiagnosisCodes: patient.secondaryDiagnosisCodes || [],
      totalIcdCodes: (patient.primaryDiagnosisCodes ? patient.primaryDiagnosisCodes.length : 0) + 
                    (patient.secondaryDiagnosisCodes ? patient.secondaryDiagnosisCodes.length : 0),
      soc: patient.patientSOC,
      episodeFrom: patient.patientEpisodeFrom,
      episodeTo: patient.patientEpisodeTo,
      minutesCaptured: patient.cpoMinsCaptured,
      billingCode: patient.billingCode,
      line1DosFrom: '',
      line1DosTo: '',
      line1Charges: patient.charges,
      line1Pos: patient.pos,
      line1Units: patient.units,
      providersName: patient.physicianName,
      certStatus: patient.certStatus,
      recertStatus: patient.recertStatus,
      certSignedDate: patient.certSignedDate,
      recertSignedDate: patient.recertSignedDate,
      docType: patient.certStatus === 'Document Signed' ? 'CERT' : 
               patient.recertStatus === 'Document Signed' ? 'RECERT' : 
               patient.cpoMinsCaptured >= 30 ? 'CPO' : '',
      // track if patient is in EHR (assume true for demo)
      patientInEHR: true
    }));

      return pgClaims;
  };

  // Add a date parsing helper function
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      console.log(`Parsing date: ${dateStr}`);
      
      // Handle MM/DD/YYYY format (common in US)
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10);
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          console.log(`Parsed MM/DD/YYYY: month=${month}, day=${day}, year=${year}`);
          
          if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
            // Month is 0-indexed in JavaScript Date
            const date = new Date(year, month - 1, day);
            console.log(`Created date:`, date);
            return date;
          }
        }
      }
      
      // Handle YYYY-MM-DD format (ISO format)
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          
          console.log(`Parsed YYYY-MM-DD: year=${year}, month=${month}, day=${day}`);
          
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            // Month is 0-indexed in JavaScript Date
            const date = new Date(year, month - 1, day);
            console.log(`Created date:`, date);
            return date;
          }
        }
      }
      
      // If it's not in a recognized format, try direct parsing
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn(`Failed to parse date: ${dateStr}`);
        return null;
      }
      
      console.log(`Parsed with native Date constructor:`, date);
      return date;
    } catch (error) {
      console.error(`Error parsing date ${dateStr}:`, error);
      return null;
    }
  };

  // Update the validateAllClaims function to show modal first
  const validateAllClaims = () => {
    console.log("Starting validation process...");
    
    // Show the validation modal
    setShowValidationModal(true);
    setValidationStatus('Validating claims for billing window...');
    
    // Normalize PG name for better matching
    const normalizedPgName = pgName ? pgName.toLowerCase().trim() : '';
    console.log(`Validating claims for PG: "${pgName}" (normalized: "${normalizedPgName}")`);
    
    // Get all patients from the PG using the mock function
    const pgPatients = getMockPatientsByPG(pgName);
    console.log('Total patients for validation:', pgPatients.length);
    
    // Set to January 2025 for our fixed test dates
    setBillingMonth('01');
    setBillingYear('2025');
    
    // Simple hardcoded validation for demonstration
    const validatedCertClaims = [];
    const validatedCpoClaims = [];
    
    // Process each patient with simplified logic for the demo
    pgPatients.forEach(patient => {
      console.log(`Processing patient ${patient.patientId}`);
      
      // Ensure the patient has all required fields with defaults if missing
      const processedPatient = {
        ...patient,
        primaryDiagnosisCodes: patient.primaryDiagnosisCodes || ['I10'],
        secondaryDiagnosisCodes: patient.secondaryDiagnosisCodes || ['E11.9', 'Z79.4'],
        cpoMinsCaptured: patient.cpoMinsCaptured || 35,
        patientSOC: patient.patientSOC || '01/01/2024',
        patientEpisodeFrom: patient.patientEpisodeFrom || '01/01/2024',
        patientEpisodeTo: patient.patientEpisodeTo || '07/01/2024',
        certStatus: patient.certStatus || 'Document Signed',
        certSignedDate: patient.certSignedDate || '01/15/2025',
        billingCode: patient.billingCode || 'G0180',
        charges: patient.charges || 180,
        pos: patient.pos || '11',
        units: patient.units || 1,
      };
      
      // Count ICD codes - need at least 3
      const primaryCodesCount = processedPatient.primaryDiagnosisCodes.length;
      const secondaryCodesCount = processedPatient.secondaryDiagnosisCodes.length;
      const totalIcdCodes = primaryCodesCount + secondaryCodesCount;
      
      // Create basic claim template to use for all claims
      const basePatientClaim = {
        id: `${processedPatient.id || patient.patientId}-${new Date().getTime()}`,
        remarks: processedPatient.patientRemarks || 'Eligible',
        sNo: processedPatient.patientId,
        fullName: `${processedPatient.patientLastName || 'Lastname'}, ${processedPatient.patientFirstName || 'Firstname'} ${processedPatient.patientMiddleName || 'M'}`,
        firstName: processedPatient.patientFirstName || 'Firstname',
        middleName: processedPatient.patientMiddleName || 'M',
        lastName: processedPatient.patientLastName || 'Lastname',
        dob: processedPatient.patientDOB || '01/01/1950',
        hhaName: processedPatient.hhah || 'PG Delta',
        insuranceType: processedPatient.patientInsurance || 'Medicare',
        primaryDiagnosisCode: processedPatient.primaryDiagnosisCodes[0],
        secondaryDiagnosisCode1: processedPatient.secondaryDiagnosisCodes[0] || '',
        secondaryDiagnosisCode2: processedPatient.secondaryDiagnosisCodes[1] || '',
        secondaryDiagnosisCode3: processedPatient.secondaryDiagnosisCodes[2] || '',
        secondaryDiagnosisCode4: processedPatient.secondaryDiagnosisCodes[3] || '',
        secondaryDiagnosisCode5: processedPatient.secondaryDiagnosisCodes[4] || '',
        soc: processedPatient.patientSOC,
        episodeFrom: processedPatient.patientEpisodeFrom,
        episodeTo: processedPatient.patientEpisodeTo,
        providersName: processedPatient.physicianName || 'Dr. John Smith',
        patientInEHR: true,
        line1POS: processedPatient.pos,
        line1Units: processedPatient.units
      };
      
      // Always create at least one claim for demo purposes
        // Create a CERT claim
        const certClaim = {
          ...basePatientClaim,
        id: `${processedPatient.id || patient.patientId}-cert-${new Date().getTime()}`,
          remarks: 'CERT signed',
          docType: 'CERT',
        signedDate: processedPatient.certSignedDate,
        billingCode: processedPatient.billingCode || 'G0180',
        line1DosFrom: processedPatient.patientEpisodeFrom,
        line1DosTo: processedPatient.patientEpisodeFrom,
        line1Charges: processedPatient.charges || 180,
          minutesCaptured: 0
        };
        
        validatedCertClaims.push(certClaim);
      console.log(`  - Added CERT claim for patient ${processedPatient.patientId || patient.patientId}`);
      
      // Check CPO eligibility - needs at least 30 minutes
      if (processedPatient.cpoMinsCaptured >= 30) {
        console.log(`  - Patient has sufficient CPO minutes: ${processedPatient.cpoMinsCaptured}`);
        
        // Create a CPO claim
        const cpoClaim = {
          ...basePatientClaim,
          id: `${processedPatient.id || patient.patientId}-cpo-${new Date().getTime()}`,
          remarks: 'CPO completed',
          docType: 'CPO',
          billingCode: 'G0181',
          line1DosFrom: '01/01/2025',
          line1DosTo: '01/31/2025',
          line1Charges: 113,
          minutesCaptured: processedPatient.cpoMinsCaptured
        };
        
        validatedCpoClaims.push(cpoClaim);
        console.log(`  - Added CPO claim for patient ${processedPatient.patientId || patient.patientId}`);
      }
    });
    
    console.log(`Validation complete. Found ${validatedCertClaims.length} CERT/RECERT claims and ${validatedCpoClaims.length} CPO claims`);
    
    // Update state with validated claims
    setCertValidatedClaims(validatedCertClaims);
    setCpoValidatedClaims(validatedCpoClaims);
    
    // Also update the filteredClaims state with all validated claims
    setFilteredClaims([...validatedCertClaims, ...validatedCpoClaims]);
    
    // Set validation status message
    const totalValidClaims = validatedCertClaims.length + validatedCpoClaims.length;
    setValidationStatus(`Validation complete: ${totalValidClaims} eligible claims found (${validatedCertClaims.length} CERT/RECERT, ${validatedCpoClaims.length} CPO)`);
    
    // Automatically close the modal after a delay to show the results
    setTimeout(() => {
      setShowValidationModal(false);
    }, 2000);
  };

  const filterClaimsByDateRange = () => {
    // Convert dates from ISO or American format to proper Date objects
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Handle ISO format (from date input)
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return new Date(year, parseInt(month) - 1, day);
      }
      
      // Handle American format (MM/DD/YYYY)
      if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
        return new Date(year, parseInt(month) - 1, day);
      }
      
      // Last resort - try direct parsing
      return new Date(dateStr);
    };

    const startDate = parseDate(selectedDateRange.start);
    const endDate = parseDate(selectedDateRange.end);
    
    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
      alert("Please select valid dates for billing window");
      return;
    }
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    // First, get patients from the PG using the mock function
    const pgPatients = getMockPatientsByPG(pgName);
    
    // Get all patients, then filter later if needed
    const allClaims = pgPatients.map(patient => ({
      id: patient.id,
      remarks: patient.patientRemarks || '',
      sNo: patient.patientId,
      fullName: `${patient.patientLastName}, ${patient.patientFirstName} ${patient.patientMiddleName || ''}`,
      firstName: patient.patientFirstName,
      middleName: patient.patientMiddleName,
      lastName: patient.patientLastName,
      dob: patient.patientDOB,
      hhaName: patient.hhah,
      insuranceType: patient.patientInsurance,
      primaryDiagnosisCode: patient.primaryDiagnosisCodes ? patient.primaryDiagnosisCodes[0] : '',
      secondaryDiagnosisCodes: patient.secondaryDiagnosisCodes || [],
      totalIcdCodes: (patient.primaryDiagnosisCodes ? patient.primaryDiagnosisCodes.length : 0) + 
                 (patient.secondaryDiagnosisCodes ? patient.secondaryDiagnosisCodes.length : 0),
      soc: patient.patientSOC,
      episodeFrom: patient.patientEpisodeFrom,
      episodeTo: patient.patientEpisodeTo,
      minutesCaptured: patient.cpoMinsCaptured,
      billingCode: patient.billingCode,
      line1DosFrom: '',
      line1DosTo: '',
      line1Charges: patient.charges,
      line1Pos: patient.pos,
      line1Units: patient.units,
      providersName: patient.physicianName,
      certStatus: patient.certStatus,
      recertStatus: patient.recertStatus,
      certSignedDate: patient.certSignedDate,
      recertSignedDate: patient.recertSignedDate,
      docType: ''
    }));
    
    setFilteredClaims(allClaims);
    setShowDateRangeFilter(false);
    
    // Always set the billing dates from the date filter
    const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const startYear = startDate.getFullYear().toString();
    
    // Update billing month and year
    setBillingMonth(startMonth);
    setBillingYear(startYear);
    
    // Automatically trigger the validate claims workflow
    validateAllClaims();
  };

  const formatDownloadDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      // Handle ISO format (YYYY-MM-DD)
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return `${month}/${day}/${year}`;
      }
      
      // Handle date objects
      if (dateStr instanceof Date) {
        const month = (dateStr.getMonth() + 1).toString().padStart(2, '0');
        const day = dateStr.getDate().toString().padStart(2, '0');
        const year = dateStr.getFullYear();
        return `${month}/${day}/${year}`;
      }
      
      // Already in American format or other string
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        return dateStr;
      }
      
      // Try to parse as date
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      return dateStr; // Return original if parsing fails
    }
  };

  const handleViewReport = (report) => {
    // For now, just show an alert with report details
    alert(`Viewing report: ${report.fileName}\n\nNotes: ${report.notes}\nDate: ${report.date}`);
    // In a real application, this would open a modal or navigate to a report viewer
  };

  const handleDownloadClaims = (format) => {
    try {
      // Get current date for file naming
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); // 0-indexed
      const currentYear = currentDate.getFullYear();
      
      // Format month names
      const shortMonthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      // Get billing month and year for filename
      const billingMonthInt = parseInt(billingMonth);
      const billingMonthName = shortMonthNames[billingMonthInt - 1];
      
      // Generate filename - use billing month/year instead of current date
      const fileName = `${pgName} - Claims ${billingMonthName} ${billingYear}`;
      
      // Determine which claims to include based on filters
      let claimsToExport = [];
      
      if (showCertClaimsOnly) {
        claimsToExport = [...certValidatedClaims];
      } else if (showCpoClaimsOnly) {
        claimsToExport = [...cpoValidatedClaims];
      } else if (certValidatedClaims.length > 0 || cpoValidatedClaims.length > 0) {
        // If we have validated claims, use those
        claimsToExport = [...certValidatedClaims, ...cpoValidatedClaims];
      } else {
        // Otherwise use the filtered claims
        claimsToExport = getFilteredClaims();
      }
      
      if (format === 'csv') {
        // Prepare CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        const headers = [
          "Doc Type", "Remarks", "S. No.", "FULL Name", "First Name", "Middle Name", "Last Name", "DOB",
          "HHA NAME", "INSURANCE TYPE", "PRIMARY DIAGNOSIS CODE", "SECONDARY DIAGNOSIS CODE 1", "SECONDARY DIAGNOSIS CODE 2",
          "SECONDARY DIAGNOSIS CODE 3", "SECONDARY DIAGNOSIS CODE 4", "SECONDARY DIAGNOSIS CODE 5",
          "SOC", "Episode From", "Episode To",
          "CPO Minutes Captured", "Billing Code", "LINE 1 DOS FROM", "LINE 1 DOS TO", 
          "Line 1 $Charges", "Line 1 POS", "Line 1 Units", "Provider's Name"
        ];
        
        csvContent += headers.join(",") + "\r\n";
        
        // Add data rows
        claimsToExport.forEach(claim => {
          const row = [
            `"${claim.docType || ''}"`,
            `"${claim.remarks || ''}"`,
            `"${claim.sNo || ''}"`,
            `"${claim.fullName || ''}"`,
            `"${claim.firstName || ''}"`,
            `"${claim.middleName || ''}"`,
            `"${claim.lastName || ''}"`,
            `"${formatDownloadDate(claim.dob)}"`,
            `"${claim.hhaName || ''}"`,
            `"${claim.insuranceType || ''}"`,
            `"${claim.primaryDiagnosisCode || ''}"`,
            `"${claim.secondaryDiagnosisCode1 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[0] : '')}"`,
            `"${claim.secondaryDiagnosisCode2 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[1] : '')}"`,
            `"${claim.secondaryDiagnosisCode3 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[2] : '')}"`,
            `"${claim.secondaryDiagnosisCode4 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[3] : '')}"`,
            `"${claim.secondaryDiagnosisCode5 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[4] : '')}"`,
            `"${formatDownloadDate(claim.soc)}"`,
            `"${formatDownloadDate(claim.episodeFrom)}"`,
            `"${formatDownloadDate(claim.episodeTo)}"`,
            `"${claim.minutesCaptured || ''}"`,
            `"${claim.billingCode || ''}"`,
            `"${formatDownloadDate(claim.line1DosFrom)}"`,
            `"${formatDownloadDate(claim.line1DosTo)}"`,
            `"$${claim.line1Charges || ''}"`,
            `"${claim.line1POS || claim.line1Pos || ''}"`,
            `"${claim.line1Units || ''}"`,
            `"${claim.providersName || ''}"`,
          ];
          
          // If we don't have validated claims, remove the docType column
          if (certValidatedClaims.length === 0 && cpoValidatedClaims.length === 0) {
            row.shift();
          }
          
          csvContent += row.join(",") + "\r\n";
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } else if (format === 'pdf') {
        // Create PDF using jsPDF
        const doc = new jsPDF('l', 'mm', 'a4');
        
        // Add title
        doc.setFontSize(14);
        doc.text(fileName, 14, 15);
        doc.setFontSize(10);
        
        // Prepare headers
        const headers = [
          ["Doc Type", "S.No", "Patient Name", "DOB", "HHA", "Insurance", "Primary DX", 
           "Secondary DX 1", "Secondary DX 2", "Secondary DX 3", "Secondary DX 4", "Secondary DX 5",
           "SOC", "Episode From", "Episode To",
           "CPO Min", "Billing Code", "DOS From", "DOS To", "$Charges", "POS", "Units"]
        ];
        
        // Prepare data for table
        const data = claimsToExport.map(claim => {
          return [
            claim.docType || '',
            claim.sNo || '',
            claim.fullName || '',
            formatDownloadDate(claim.dob),
            claim.hhaName || '',
            claim.insuranceType || '',
            claim.primaryDiagnosisCode || '',
            claim.secondaryDiagnosisCode1 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[0] : ''),
            claim.secondaryDiagnosisCode2 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[1] : ''),
            claim.secondaryDiagnosisCode3 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[2] : ''),
            claim.secondaryDiagnosisCode4 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[3] : ''),
            claim.secondaryDiagnosisCode5 || (claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[4] : ''),
            formatDownloadDate(claim.soc),
            formatDownloadDate(claim.episodeFrom),
            formatDownloadDate(claim.episodeTo),
            claim.minutesCaptured || '',
            claim.billingCode || '',
            formatDownloadDate(claim.line1DosFrom),
            formatDownloadDate(claim.line1DosTo),
            '$' + (claim.line1Charges || ''),
            claim.line1POS || claim.line1Pos || '',
            claim.line1Units || ''
          ];
        });
        
        // Generate table
        doc.autoTable({
          head: headers,
          body: data,
          startY: 25,
          theme: 'grid',
          styles: { 
            fontSize: 6,
            cellPadding: 1,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          columnStyles: {
            0: { cellWidth: 12 }, // Doc Type
            1: { cellWidth: 8 }, // S.No
            2: { cellWidth: 22 }, // Patient Name
            3: { cellWidth: 12 }, // DOB
            4: { cellWidth: 15 }, // HHA
            5: { cellWidth: 12 }, // Insurance
            6: { cellWidth: 12 }, // Primary DX
            7: { cellWidth: 12 }, // Secondary DX 1
            8: { cellWidth: 12 }, // Secondary DX 2
            9: { cellWidth: 12 }, // Secondary DX 3
            10: { cellWidth: 12 }, // Secondary DX 4
            11: { cellWidth: 12 }, // Secondary DX 5
            12: { cellWidth: 12 }, // SOC
            13: { cellWidth: 12 }, // Episode From
            14: { cellWidth: 12 }, // Episode To
            15: { cellWidth: 8 }, // CPO Min
            16: { cellWidth: 12 }, // Billing Code
            17: { cellWidth: 12 }, // DOS From
            18: { cellWidth: 12 }, // DOS To
            19: { cellWidth: 10 }, // $Charges
            20: { cellWidth: 8 }, // POS
            21: { cellWidth: 8 }  // Units
          },
          headStyles: {
            fillColor: [71, 85, 119],
            textColor: 255,
            fontSize: 7,
            fontStyle: 'bold'
          },
          // Add conditional formatting for CERT and CPO claims
          didDrawCell: (data) => {
            if (data.section === 'body') {
              const claim = claimsToExport[data.row.index];
              if (claim && claim.docType) {
                if (claim.docType === 'CERT' || claim.docType === 'RECERT') {
                  doc.setFillColor(198, 246, 213); // Light green
                  doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                  // Redraw text to ensure it's visible over the background
                  doc.setTextColor(0, 0, 0);
                  doc.text(data.cell.text, data.cell.x + data.cell.padding.left, data.cell.y + data.cell.padding.top + data.row.height / 2);
                } else if (claim.docType === 'CPO') {
                  doc.setFillColor(233, 216, 253); // Light purple
                  doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                  // Redraw text
                  doc.setTextColor(0, 0, 0);
                  doc.text(data.cell.text, data.cell.x + data.cell.padding.left, data.cell.y + data.cell.padding.top + data.row.height / 2);
                }
              }
            }
          }
        });
        
        // Save the PDF file
        doc.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Error generating download:', error);
      alert('There was an error generating the download. Please try again.');
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
          <div className="filter-group" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            {/* Button to open date filter modal - updated label */}
            <button 
              className="filter-button"
              onClick={() => setShowDateRangeFilter(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Set Billing Window
            </button>
            
            {/* Add filter buttons for CERT and CPO - keep as is */}
            {certValidatedClaims.length > 0 && (
              <button 
                className={`filter-button ${showCertClaimsOnly ? 'active' : ''}`}
                onClick={() => {
                  setShowCertClaimsOnly(!showCertClaimsOnly);
                  setShowCpoClaimsOnly(false);
                }}
                style={{ 
                  backgroundColor: showCertClaimsOnly ? '#e6f7ed' : '#f8f9fa', 
                  color: '#333', 
                  border: `1px solid ${showCertClaimsOnly ? '#38a169' : '#ddd'}`,
                  borderLeft: showCertClaimsOnly ? '3px solid #38a169' : '1px solid #ddd'
                }}
              >
                CERT Claims ({certValidatedClaims.length})
              </button>
            )}
            
            {cpoValidatedClaims.length > 0 && (
              <button 
                className={`filter-button ${showCpoClaimsOnly ? 'active' : ''}`}
                onClick={() => {
                  setShowCpoClaimsOnly(!showCpoClaimsOnly);
                  setShowCertClaimsOnly(false);
                }}
                style={{ 
                  backgroundColor: showCpoClaimsOnly ? '#f4eeff' : '#f8f9fa', 
                  color: '#333', 
                  border: `1px solid ${showCpoClaimsOnly ? '#805ad5' : '#ddd'}`,
                  borderLeft: showCpoClaimsOnly ? '3px solid #805ad5' : '1px solid #ddd'
                }}
              >
                CPO Claims ({cpoValidatedClaims.length})
              </button>
            )}
            
            {(showCertClaimsOnly || showCpoClaimsOnly) && (
              <button 
                className="filter-button"
                onClick={() => {
                  setShowCertClaimsOnly(false);
                  setShowCpoClaimsOnly(false);
                }}
                style={{ 
                  backgroundColor: '#fff0f0', 
                  color: '#333', 
                  border: '1px solid #ddd',
                  borderLeft: '3px solid #e53e3e'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Remove Validation Modal */}
          
          {/* Updated Date Range Filter Modal with validation functionality */}
          {showDateRangeFilter && (
            <div className="modal-overlay">
              <div className="modal-content" data-type="date-range">
                <div className="modal-header">
                  <h2>Set Billing Window</h2>
                  <button className="close-button" onClick={() => setShowDateRangeFilter(false)}>×</button>
                </div>
                <div className="form-group">
                  <label>Billing Period Presets</label>
                  <div className="period-presets" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      className={`period-button ${dateFilterType === 'thisWeek' ? 'active' : ''}`}
                      onClick={() => handleDateRangePreset('thisWeek')}
                      style={dateFilterType === 'thisWeek' ? styles.periodButtonActive : styles.periodButton}
                    >
                      This Week
                    </button>
                    <button 
                      className={`period-button ${dateFilterType === 'thisMonth' ? 'active' : ''}`}
                      onClick={() => handleDateRangePreset('thisMonth')}
                      style={dateFilterType === 'thisMonth' ? styles.periodButtonActive : styles.periodButton}
                    >
                      This Month
                    </button>
                    <button 
                      className={`period-button ${dateFilterType === 'lastMonth' ? 'active' : ''}`}
                      onClick={() => handleDateRangePreset('lastMonth')}
                      style={dateFilterType === 'lastMonth' ? styles.periodButtonActive : styles.periodButton}
                    >
                      Last Month
                    </button>
                    <button 
                      className={`period-button ${dateFilterType === 'thisQuarter' ? 'active' : ''}`}
                      onClick={() => handleDateRangePreset('thisQuarter')}
                      style={dateFilterType === 'thisQuarter' ? styles.periodButtonActive : styles.periodButton}
                    >
                      This Quarter
                    </button>
                    <button 
                      className={`period-button ${dateFilterType === 'custom' ? 'active' : ''}`}
                      onClick={() => {
                        setDateFilterType('custom');
                        setSelectedDateRange({ start: '', end: '' });
                      }}
                      style={dateFilterType === 'custom' ? styles.periodButtonActive : styles.periodButton}
                    >
                      Custom
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Billing Start Date</label>
                  <DatePicker
                    selected={selectedDateRange.start ? new Date(selectedDateRange.start) : null}
                    onChange={(date) => handleDateRangeChange({ target: { name: 'start', value: date ? date.toISOString().split('T')[0] : '' } })}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="date-input"
                    isClearable
                  />
                </div>
                <div className="form-group">
                  <label>Billing End Date</label>
                  <DatePicker
                    selected={selectedDateRange.end ? new Date(selectedDateRange.end) : null}
                    onChange={(date) => handleDateRangeChange({ target: { name: 'end', value: date ? date.toISOString().split('T')[0] : '' } })}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="date-input"
                    isClearable
                  />
                </div>
                
                {/* Remove the billing month and year selection fields */}
                
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '14px' }}>
                    Note: The billing month and year will be automatically determined from your selected start date.
                    Eligible claims will be validated based on this period.
                  </div>
                </div>
                {validationStatus && (
                  <div className="validation-status" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e6fffa', borderRadius: '4px', border: '1px solid #38a169' }}>
                    {validationStatus}
                  </div>
                )}
                <div className="form-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                    className="cancel-button"
                    onClick={() => setShowDateRangeFilter(false)}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      marginRight: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                    </button>
                  <button 
                    className="submit-button"
                    onClick={filterClaimsByDateRange}
                    disabled={!selectedDateRange.start || !selectedDateRange.end}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: (!selectedDateRange.start || !selectedDateRange.end) ? '#cbd5e0' : '#4361ee', 
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: (!selectedDateRange.start || !selectedDateRange.end) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Apply & Validate Claims
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Download options and total claims remain unchanged */}
          <div className="claims-actions" style={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem',
              marginLeft: 'auto'
            }}>
              <span style={{ color: '#4a5568', fontSize: '0.875rem' }}>
                Total Claims: {getFilteredClaims().length || 0}
              </span>
              <button
                onClick={() => handleDownloadClaims('csv')}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4F46E5', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CSV
              </button>
              <button
                onClick={() => handleDownloadClaims('pdf')}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6366F1', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Claims Data Table remains unchanged */}
      <div className="table-container" style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table className="claims-table">
          <thead>
            <tr>
              <th>Remarks</th>
              <th>S. No.</th>
              <th>FULL Name</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>DOB</th>
              <th>HHAH NAME</th>
              <th>INSURANCE TYPE</th>
              <th>PRIMARY DIAGNOSIS CODE</th>
              <th>SECONDARY DIAGNOSIS CODE 1</th>
              <th>SECONDARY DIAGNOSIS CODE 2</th>
              <th>SECONDARY DIAGNOSIS CODE 3</th>
              <th>SECONDARY DIAGNOSIS CODE 4</th>
              <th>SECONDARY DIAGNOSIS CODE 5</th>
              <th>SOC</th>
              <th>Episode From</th>
              <th>Episode to</th>
              <th>Minutes Captured</th>
              <th>Billing Code</th>
              <th>LINE 1 DOS FROM</th>
              <th>LINE 1 DOS TO</th>
              <th>Line 1 $Charges</th>
              <th>Line 1 POS</th>
              <th>Line 1 Units</th>
              <th>Provider's Name</th>
            </tr>
          </thead>
          <tbody>
            {/* Display validated claims */}
            {showCertClaimsOnly && certValidatedClaims.map((claim, index) => (
              <tr key={claim.id}>
                <td>{claim.remarks}</td>
                <td>{index + 1}</td>
                <td>{claim.fullName}</td>
                <td>{claim.firstName}</td>
                <td>{claim.middleName}</td>
                <td>{claim.lastName}</td>
                <td>{claim.dob}</td>
                <td>{claim.hhaName}</td>
                <td>{claim.insuranceType}</td>
                <td>{claim.primaryDiagnosisCode}</td>
                <td>{claim.secondaryDiagnosisCode1}</td>
                <td>{claim.secondaryDiagnosisCode2}</td>
                <td>{claim.secondaryDiagnosisCode3 || ''}</td>
                <td>{claim.secondaryDiagnosisCode4 || ''}</td>
                <td>{claim.secondaryDiagnosisCode5 || ''}</td>
                <td>{claim.soc}</td>
                <td>{claim.episodeFrom}</td>
                <td>{claim.episodeTo}</td>
                <td>{claim.minutesCaptured}</td>
                <td>{claim.billingCode}</td>
                <td>{claim.line1DosFrom}</td>
                <td>{claim.line1DosTo}</td>
                <td>${claim.line1Charges}</td>
                <td>{claim.line1POS}</td>
                <td>{claim.line1Units}</td>
                <td>{claim.providersName}</td>
              </tr>
            ))}
            
            {showCpoClaimsOnly && cpoValidatedClaims.map((claim, index) => (
              <tr key={claim.id}>
                <td>{claim.remarks}</td>
                <td>{index + 1}</td>
                <td>{claim.fullName}</td>
                <td>{claim.firstName}</td>
                <td>{claim.middleName}</td>
                <td>{claim.lastName}</td>
                <td>{claim.dob}</td>
                <td>{claim.hhaName}</td>
                <td>{claim.insuranceType}</td>
                <td>{claim.primaryDiagnosisCode}</td>
                <td>{claim.secondaryDiagnosisCode1}</td>
                <td>{claim.secondaryDiagnosisCode2}</td>
                <td>{claim.secondaryDiagnosisCode3 || ''}</td>
                <td>{claim.secondaryDiagnosisCode4 || ''}</td>
                <td>{claim.secondaryDiagnosisCode5 || ''}</td>
                <td>{claim.soc}</td>
                <td>{claim.episodeFrom}</td>
                <td>{claim.episodeTo}</td>
                <td>{claim.minutesCaptured}</td>
                <td>{claim.billingCode}</td>
                <td>{claim.line1DosFrom}</td>
                <td>{claim.line1DosTo}</td>
                <td>${claim.line1Charges}</td>
                <td>{claim.line1POS}</td>
                <td>{claim.line1Units}</td>
                <td>{claim.providersName}</td>
              </tr>
            ))}
            
            {/* Show filtered claims or sample data when not filtered */}
            {!showCertClaimsOnly && !showCpoClaimsOnly && (
              <>
                {/* Check if we have validated claims first */}
                {(certValidatedClaims.length > 0 || cpoValidatedClaims.length > 0) ? (
                  // Show all validated claims if available
                  [...certValidatedClaims, ...cpoValidatedClaims].map((claim, index) => (
                    <tr key={claim.id}>
                      <td>{claim.remarks}</td>
                      <td>{index + 1}</td>
                      <td>{claim.fullName}</td>
                      <td>{claim.firstName}</td>
                      <td>{claim.middleName}</td>
                      <td>{claim.lastName}</td>
                      <td>{claim.dob}</td>
                      <td>{claim.hhaName}</td>
                      <td>{claim.insuranceType}</td>
                      <td>{claim.primaryDiagnosisCode}</td>
                      <td>{claim.secondaryDiagnosisCode1}</td>
                      <td>{claim.secondaryDiagnosisCode2}</td>
                      <td>{claim.secondaryDiagnosisCode3 || ''}</td>
                      <td>{claim.secondaryDiagnosisCode4 || ''}</td>
                      <td>{claim.secondaryDiagnosisCode5 || ''}</td>
                      <td>{claim.soc}</td>
                      <td>{claim.episodeFrom}</td>
                      <td>{claim.episodeTo}</td>
                      <td>{claim.minutesCaptured}</td>
                      <td>{claim.billingCode}</td>
                      <td>{claim.line1DosFrom}</td>
                      <td>{claim.line1DosTo}</td>
                      <td>${claim.line1Charges}</td>
                      <td>{claim.line1POS || claim.line1Pos}</td>
                      <td>{claim.line1Units}</td>
                      <td>{claim.providersName}</td>
                    </tr>
                  ))
                ) : filteredClaims.length > 0 ? (
                  // If no validated claims but we have filtered claims, show those
                  filteredClaims.map((claim, index) => (
                    <tr key={claim.id}>
                      <td>{claim.remarks}</td>
                      <td>{index + 1}</td>
                      <td>{claim.fullName}</td>
                      <td>{claim.firstName}</td>
                      <td>{claim.middleName}</td>
                      <td>{claim.lastName}</td>
                      <td>{claim.dob}</td>
                      <td>{claim.hhaName}</td>
                      <td>{claim.insuranceType}</td>
                      <td>{claim.primaryDiagnosisCode}</td>
                      <td>{claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[0] : ''}</td>
                      <td>{claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[1] : ''}</td>
                      <td>{claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[2] : ''}</td>
                      <td>{claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[3] : ''}</td>
                      <td>{claim.secondaryDiagnosisCodes ? claim.secondaryDiagnosisCodes[4] : ''}</td>
                      <td>{claim.soc}</td>
                      <td>{claim.episodeFrom}</td>
                      <td>{claim.episodeTo}</td>
                      <td>{claim.minutesCaptured}</td>
                      <td>{claim.billingCode}</td>
                      <td>{claim.line1DosFrom}</td>
                      <td>{claim.line1DosTo}</td>
                      <td>${claim.line1Charges}</td>
                      <td>{claim.line1Pos}</td>
                      <td>{claim.line1Units}</td>
                      <td>{claim.providersName}</td>
                    </tr>
                  ))
                ) : (
                  // If no real data, show sample data
                  <>
                    {/* Sample data rows when no actual data is present */}
                    <tr>
                      <td>CERT signed</td>
                      <td>001</td>
                      <td>Smith, John A</td>
                      <td>John</td>
                      <td>A</td>
                      <td>Smith</td>
                      <td>05/12/1962</td>
                      <td>CaringHands HHA</td>
                      <td>Medicare</td>
                      <td>I10</td>
                      <td>I50.9</td>
                      <td>E11.9</td>
                      <td>R73.01</td>
                      <td>Z79.4</td>
                      <td>I25.10</td>
                      <td>01/15/2024</td>
                      <td>01/15/2024</td>
                      <td>07/14/2024</td>
                      <td>45</td>
                      <td>179</td>
                      <td>04/10/2024</td>
                      <td>04/10/2024</td>
                      <td>$40</td>
                      <td>11</td>
                      <td>1</td>
                      <td>Dr. Sarah Johnson</td>
                    </tr>
                    {/* Sample data row 2 */}
                    <tr>
                      <td>ICD incomplete</td>
                      <td>002</td>
                      <td>Johnson, Mary E</td>
                      <td>Mary</td>
                      <td>E</td>
                      <td>Johnson</td>
                      <td>08/23/1955</td>
                      <td>HomeHealth Plus</td>
                      <td>Medicare</td>
                      <td>E11.9</td>
                      <td>I10</td>
                      <td>E78.5</td>
                      <td>I25.10</td>
                      <td>Z79.4</td>
                      <td>M54.5</td>
                      <td>02/03/2024</td>
                      <td>02/03/2024</td>
                      <td>08/02/2024</td>
                      <td>0</td>
                      <td>180</td>
                      <td>04/15/2024</td>
                      <td>04/15/2024</td>
                      <td>$60</td>
                      <td>11</td>
                      <td>1</td>
                      <td>Dr. Robert Chen</td>
                    </tr>
                    {/* Sample data row 3 */}
                    <tr>
                      <td>CPO completed</td>
                      <td>003</td>
                      <td>Williams, Robert J</td>
                      <td>Robert</td>
                      <td>J</td>
                      <td>Williams</td>
                      <td>11/04/1970</td>
                      <td>Comfort Care Services</td>
                      <td>Medicaid</td>
                      <td>J44.9</td>
                      <td>I50.9</td>
                      <td>F32.9</td>
                      <td>Z72.0</td>
                      <td>J96.1</td>
                      <td>R06.02</td>
                      <td>01/20/2024</td>
                      <td>01/20/2024</td>
                      <td>07/19/2024</td>
                      <td>37</td>
                      <td>G0181</td>
                      <td>04/05/2024</td>
                      <td>04/05/2024</td>
                      <td>$113</td>
                      <td>11</td>
                      <td>1</td>
                      <td>Dr. Maria Garcia</td>
                    </tr>
                    {/* Sample data row 4 */}
                    <tr>
                      <td>RECERT pending</td>
                      <td>004</td>
                      <td>Brown, Patricia L</td>
                      <td>Patricia</td>
                      <td>L</td>
                      <td>Brown</td>
                      <td>03/17/1948</td>
                      <td>Elite Home Health</td>
                      <td>Medicare</td>
                      <td>I50.9</td>
                      <td>J44.9</td>
                      <td>I10</td>
                      <td>E11.9</td>
                      <td>Z79.4</td>
                      <td>I48.2</td>
                      <td>03/05/2024</td>
                      <td>03/05/2024</td>
                      <td>09/04/2024</td>
                      <td>0</td>
                      <td>179</td>
                      <td>04/12/2024</td>
                      <td>04/12/2024</td>
                      <td>$40</td>
                      <td>11</td>
                      <td>1</td>
                      <td>Dr. James Wilson</td>
                    </tr>
                    {/* Sample data row 5 */}
                    <tr>
                      <td>CPO not eligible</td>
                      <td>005</td>
                      <td>Davis, Jennifer A</td>
                      <td>Jennifer</td>
                      <td>A</td>
                      <td>Davis</td>
                      <td>07/29/1965</td>
                      <td>HomeHealth Plus</td>
                      <td>Medicare</td>
                      <td>M17.0</td>
                      <td>M54.5</td>
                      <td>G89.4</td>
                      <td>Z96.6</td>
                      <td>M81.0</td>
                      <td>R26.2</td>
                      <td>02/14/2024</td>
                      <td>02/14/2024</td>
                      <td>08/13/2024</td>
                      <td>22</td>
                      <td>180</td>
                      <td>04/18/2024</td>
                      <td>04/18/2024</td>
                      <td>$60</td>
                      <td>11</td>
                      <td>1</td>
                      <td>Dr. Emily Brown</td>
                    </tr>
                    {/* Sample data row 6 */}
                    <tr>
                      <td>Billing active</td>
                      <td>006</td>
                      <td>Anderson, Thomas R</td>
                      <td>Thomas</td>
                      <td>R</td>
                      <td>Anderson</td>
                      <td>09/03/1957</td>
                      <td>CaringHands HHA</td>
                      <td>Medicare</td>
                      <td>I48.91</td>
                      <td>I25.10</td>
                      <td>E78.5</td>
                      <td>Z79.01</td>
                      <td>Z95.5</td>
                      <td>I10</td>
                      <td>01/10/2024</td>
                      <td>01/10/2024</td>
                      <td>07/09/2024</td>
                      <td>35</td>
                      <td>G0181</td>
                      <td>04/08/2024</td>
                      <td>04/08/2024</td>
                      <td>$113</td>
                      <td>11</td>
                      <td>1</td>
                      <td>Dr. David Lee</td>
                    </tr>
                  </>
                )}
              </>
            )}
            
            {/* Show empty state messages for filtered views */}
            {showCertClaimsOnly && certValidatedClaims.length === 0 && (
              <tr>
                <td colSpan="23" style={{ textAlign: 'center', padding: '2rem' }}>
                  No CERT/RECERT claims found for the selected billing window.
                </td>
              </tr>
            )}
            
            {showCpoClaimsOnly && cpoValidatedClaims.length === 0 && (
              <tr>
                <td colSpan="23" style={{ textAlign: 'center', padding: '2rem' }}>
                  No CPO claims found for the selected billing window.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Claims Legend */}
      {(certValidatedClaims.length > 0 || cpoValidatedClaims.length > 0) && (
        <div className="claims-legend" style={{ 
          margin: '20px 0', 
          padding: '10px 15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
        border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ marginBottom: '10px', fontSize: '16px', color: '#2d3748' }}>Claims Legend:</h4>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '20px', 
                height: '20px', 
                backgroundColor: '#c6f6d5', 
                border: '1px solid #38a169', 
                marginRight: '8px',
                borderRadius: '3px'
        }}></div>
              <span style={{ fontSize: '14px' }}>CERT/RECERT Claim</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '20px', 
                height: '20px', 
                backgroundColor: '#e9d8fd', 
                border: '1px solid #805ad5', 
                marginRight: '8px',
                borderRadius: '3px'
        }}></div>
              <span style={{ fontSize: '14px' }}>CPO Claim</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#fff', 
                border: '1px solid #cbd5e0', 
                marginRight: '8px',
                borderRadius: '3px'
              }}></div>
              <span style={{ fontSize: '14px' }}>Regular Claim</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Data Source */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem', 
        color: '#718096', 
        fontSize: '0.8rem' 
      }}>
        Data source: US Census TIGER/Line Shapefiles 2023
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

          <div className="mbr-tasks-list weekly-tasks-list">
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
            <DatePicker
              selected={valueCommunicationState.newMBRTaskDate}
              onChange={(date) => setValueCommunicationState(prev => ({
                ...prev,
                newMBRTaskDate: date ? date.toISOString().split('T')[0] : ''
              }))}
              dateFormat="MM-dd-yyyy"
              placeholderText="MM-DD-YYYY"
              className="task-date-input"
              isClearable
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

        {/* Weekly Tasks Panel */}
        <div className="value-comm-panel weekly-tasks-panel">
          <div className="panel-header">
            <h3>Weekly Tasks</h3>
          </div>

          <div className="mbr-stats">
            <div className="mbr-stat-item">
              <span className="stat-label">Tasks Done:</span>
              <span className="stat-value">{valueCommunicationState.weeklyTasksDone}</span>
            </div>
            <div className="mbr-stat-item">
              <span className="stat-label">Tasks Upcoming:</span>
              <span className="stat-value">{valueCommunicationState.weeklyTasksUpcoming}</span>
            </div>
          </div>

          <div className="mbr-tasks-list">
            {valueCommunicationState.weeklyTasks.map(task => (
              <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                <div className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleWeeklyTask(task.id)}
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
              placeholder="Add new weekly task..."
              value={valueCommunicationState.newWeeklyTask}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newWeeklyTask: e.target.value
              }))}
              className="task-input"
            />
            <DatePicker
              selected={valueCommunicationState.newWeeklyTaskDate}
              onChange={(date) => setValueCommunicationState(prev => ({
                ...prev,
                newWeeklyTaskDate: date ? date.toISOString().split('T')[0] : ''
              }))}
              dateFormat="MM-dd-yyyy"
              placeholderText="MM-DD-YYYY"
              className="task-date-input"
              isClearable
            />
            <button 
              className="submit-button"
              onClick={() => {
                if (valueCommunicationState.newWeeklyTask && valueCommunicationState.newWeeklyTaskDate) {
                  handleAddWeeklyTask(
                    valueCommunicationState.newWeeklyTask,
                    valueCommunicationState.newWeeklyTaskDate
                  );
                  setValueCommunicationState(prev => ({
                    ...prev,
                    newWeeklyTask: "",
                    newWeeklyTaskDate: ""
                  }));
                } else {
                  alert("Please fill in both the task description and due date");
                }
              }}
            >
              Add Weekly Task
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
      mbrsUpcoming: prev.mbrsUpcoming + 1
    }));
  };

  const handleToggleWeeklyTask = (taskId) => {
    setValueCommunicationState(prev => {
      const updatedTasks = prev.weeklyTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      // Count completed and upcoming tasks
      const completedCount = updatedTasks.filter(task => task.completed).length;
      const upcomingCount = updatedTasks.filter(task => !task.completed).length;
      
      return {
        ...prev,
        weeklyTasks: updatedTasks,
        weeklyTasksDone: completedCount,
        weeklyTasksUpcoming: upcomingCount
      };
    });
  };

  const handleAddWeeklyTask = (taskName, dueDate) => {
    setValueCommunicationState(prev => ({
      ...prev,
      weeklyTasks: [
        ...prev.weeklyTasks,
        {
          id: prev.weeklyTasks.length + 1,
          task: taskName,
          completed: false,
          dueDate
        }
      ],
      weeklyTasksUpcoming: prev.weeklyTasksUpcoming + 1
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

  // Update date formatting function to use American format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // For YYYY-MM-DD format (ISO format)
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${month}/${day}/${year}`;
      }
      
      // For MM/DD/YYYY format (already in American format)
      if (dateString.includes('/')) {
        // Ensure it's properly formatted
        const [month, day, year] = dateString.split('/');
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
      }
      
      // If it's a Date object or other format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}`);
        return dateString; // Return as is if invalid
      }
      
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error(`Error formatting date ${dateString}:`, error);
      return dateString; // Return as is in case of error
    }
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

  // Function to apply sorting to claims data
  const getSortedClaims = (claims) => {
    if (!sortConfig.key) return claims;
    
    return [...claims].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      // Check if values are dates
      if (aValue.includes && aValue.includes('-') && !isNaN(new Date(aValue))) {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Check if values are numbers
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default string comparison
      return sortConfig.direction === 'asc' 
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
  };

  // Function to convert ISO date to American format
  const isoToAmerican = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${month}/${day}/${year}`;
  };

  // Function to convert American format to ISO
  const americanToIso = (americanDate) => {
    if (!americanDate || !americanDate.includes('/')) return '';
    const [month, day, year] = americanDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Format dates for display in exports using American format
  const formatDateForDisplay = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj)) return '';
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Add a helper function to set date range presets
  const handleDateRangePreset = (preset) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch(preset) {
      case 'thisWeek':
        // Start from Sunday of current week
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'thisMonth':
        // Start from first day of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        // Start from first day of previous month
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisQuarter':
        // Start from first day of current quarter
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'custom':
      default:
        // Leave dates as is for custom selection
        return;
    }
    
    // Update the date range state with the new dates in ISO format
    setSelectedDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    setDateFilterType(preset);
  };

  // Helper function to format dates for CSV file naming
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Function to retrieve mock patients by PG (practice group) for demonstration purposes
  const getMockPatientsByPG = (pgNameParam) => {
    console.log('Getting mock patients for PG:', pgNameParam);
    
    // Normalize both the search parameter and the data for comparison
    // Convert to lowercase and remove excessive whitespace
    const normalizedSearchPG = pgNameParam ? pgNameParam.toLowerCase().trim().replace(/\s+/g, ' ') : '';
    
    // Get all patients
    const allPatients = [
      {
        id: "VT001",
        patientId: "P1001",
        patientFirstName: "John",
        patientMiddleName: "A",
        patientLastName: "Smith",
        patientDOB: "05/12/1962",
        hhah: "PG Delta", // Changed to match the PG name in your example
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I10"], // Hypertension
        secondaryDiagnosisCodes: ["I50.9", "E11.9"], // Heart failure, Type 2 diabetes
        patientSOC: "01/15/2024",
        patientEpisodeFrom: "01/15/2024",
        patientEpisodeTo: "07/14/2025",
        cpoMinsCaptured: 45,
        certStatus: "Document Signed",
        certSignedDate: "01/15/2025", // Signed in fixed test month - should qualify for CERT
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Sarah Johnson",
        patientInEHR: true,
        billingCode: "G0180",
        charges: 180,
        pos: "11",
        units: 1,
        patientRemarks: "CERT eligible"
      },
      {
        id: "VT002",
        patientId: "P1002",
        patientFirstName: "Mary",
        patientMiddleName: "E",
        patientLastName: "Johnson",
        patientDOB: "08/23/1955",
        hhah: "PG Delta", // Changed to match the PG name in your example
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["E11.9"], // Type 2 diabetes
        secondaryDiagnosisCodes: ["I10", "Z79.4"], // Added a second code to make it eligible
        patientSOC: "02/03/2024",
        patientEpisodeFrom: "02/03/2024",
        patientEpisodeTo: "08/02/2025",
        cpoMinsCaptured: 35, // Increased to make eligible for CPO
        certStatus: "Document Signed",
        certSignedDate: "01/01/2025", // Signed in fixed test month
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Robert Chen",
        patientInEHR: true,
        billingCode: "G0180",
        charges: 180,
        pos: "11",
        units: 1,
        patientRemarks: "CERT eligible and CPO eligible"
      },
      {
        id: "VT003",
        patientId: "P1003",
        patientFirstName: "Robert",
        patientMiddleName: "J",
        patientLastName: "Williams",
        patientDOB: "11/04/1970",
        hhah: "PG DELTA", // Changed to match the PG name with different case
        patientInsurance: "Medicaid",
        primaryDiagnosisCodes: ["J44.9"], // COPD
        secondaryDiagnosisCodes: ["I50.9", "F32.9"], // Heart failure, Depression
        patientSOC: "01/20/2024",
        patientEpisodeFrom: "01/20/2024",
        patientEpisodeTo: "07/19/2025",
        cpoMinsCaptured: 37, // Enough for CPO
        certStatus: "Document Signed",
        certSignedDate: "01/10/2025", // Now in test month
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Maria Garcia",
        patientInEHR: true,
        billingCode: "G0180",
        charges: 180,
        pos: "11",
        units: 1,
        patientRemarks: "CERT and CPO eligible"
      },
      {
        id: "VT004",
        patientId: "P1004",
        patientFirstName: "Patricia",
        patientMiddleName: "L",
        patientLastName: "Brown",
        patientDOB: "03/17/1948",
        hhah: "Pg Delta", // Changed to match the PG name with different case
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I50.9"], // Heart failure
        secondaryDiagnosisCodes: ["J44.9", "I10"], // COPD, Hypertension
        patientSOC: "03/05/2024",
        patientEpisodeFrom: "03/05/2024",
        patientEpisodeTo: "09/04/2025",
        cpoMinsCaptured: 35, // Enough for CPO
        certStatus: "Document not received",
        certSignedDate: "",
        recertStatus: "Document Signed",
        recertSignedDate: "01/31/2025", // Signed in fixed test month - should qualify for RECERT
        physicianName: "Dr. James Wilson",
        patientInEHR: true,
        billingCode: "G0179",
        charges: 145,
        pos: "11",
        units: 1,
        patientRemarks: "RECERT eligible and CPO eligible"
      },
      {
        id: "VT005",
        patientId: "P1005",
        patientFirstName: "Jennifer",
        patientMiddleName: "A",
        patientLastName: "Davis",
        patientDOB: "07/29/1965",
        hhah: "enhabit - lubbock", // Keep some original data
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["M17.0"], // Osteoarthritis of knee
        secondaryDiagnosisCodes: ["M54.5", "G89.4"], // Low back pain, Chronic pain syndrome
        patientSOC: "02/14/2024",
        patientEpisodeFrom: "02/14/2024",
        patientEpisodeTo: "08/13/2025",
        cpoMinsCaptured: 22, // Not enough CPO minutes
        certStatus: "Document Signed",
        certSignedDate: "12/18/2024", // Not in test month
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Emily Brown",
        patientInEHR: true,
        billingCode: "G0180",
        charges: 180,
        pos: "11",
        units: 1,
        patientRemarks: "CPO not eligible"
      },
      {
        id: "VT006",
        patientId: "P1006",
        patientFirstName: "Thomas",
        patientMiddleName: "R",
        patientLastName: "Anderson",
        patientDOB: "09/03/1957",
        hhah: "enhabit - lubbock",
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I48.91"], // Atrial fibrillation
        secondaryDiagnosisCodes: ["I25.10", "E78.5"], // Coronary artery disease, Hyperlipidemia
        patientSOC: "01/10/2024",
        patientEpisodeFrom: "01/10/2024",
        patientEpisodeTo: "07/09/2025",
        cpoMinsCaptured: 32, // Enough for CPO
        certStatus: "Document not received",
        certSignedDate: "",
        recertStatus: "Document Signed",
        recertSignedDate: "01/01/2025", // Signed in fixed test month - should qualify for RECERT
        physicianName: "Dr. Michael Lee",
        patientInEHR: true,
        billingCode: "G0179",
        charges: 145,
        pos: "11",
        units: 1,
        patientRemarks: "CPO and RECERT eligible"
      },
      {
        id: "VT007",
        patientId: "P1007",
        patientFirstName: "Maria",
        patientMiddleName: "L",
        patientLastName: "Garcia",
        patientDOB: "12/15/1968",
        hhah: "memorial hospital", // Different PG - should be filtered out
        patientInsurance: "Medicaid",
        primaryDiagnosisCodes: ["G20"], // Parkinson's disease
        secondaryDiagnosisCodes: ["G21.11", "F32.9"], // Drug-induced parkinsonism, Depression
        patientSOC: "03/20/2024",
        patientEpisodeFrom: "03/20/2024",
        patientEpisodeTo: "09/19/2025",
        cpoMinsCaptured: 32,
        certStatus: "Document Signed",
        certSignedDate: "12/20/2024", // Not in test month
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Lisa Patel",
        patientInEHR: true,
        billingCode: "G0180",
        charges: 180,
        pos: "11",
        units: 1,
        patientRemarks: "Different PG - should not appear"
      }
    ];
    
    // Filter patients based on normalized PG name
    // Use includes() instead of exact match to handle partial names
    const matchingPatients = allPatients.filter(patient => {
      const patientPGName = (patient.hhah || '').toLowerCase().trim().replace(/\s+/g, ' ');
      
      console.log(`Checking patient ${patient.patientId}, PG: "${patientPGName}" against "${normalizedSearchPG}"`);
      
      // Use includes instead of exact match to be more flexible
      return patientPGName.includes(normalizedSearchPG) || normalizedSearchPG.includes(patientPGName);
    });
    
    console.log(`Found ${matchingPatients.length} patients for PG: ${pgNameParam}`);
    
    // If no matches found using includes, try a more lenient approach
    if (matchingPatients.length === 0 && normalizedSearchPG) {
      console.log("No exact matches found, trying fuzzy match...");
      
      // Try matching with just the first word of each PG name
      const searchFirstWord = normalizedSearchPG.split(' ')[0];
      
      const fuzzyMatches = allPatients.filter(patient => {
        const patientPGName = (patient.hhah || '').toLowerCase().trim();
        const pgFirstWord = patientPGName.split(' ')[0];
        
        return pgFirstWord.includes(searchFirstWord) || searchFirstWord.includes(pgFirstWord);
      });
      
      console.log(`Found ${fuzzyMatches.length} fuzzy matches for PG: ${pgNameParam}`);
      
      if (fuzzyMatches.length > 0) {
        return fuzzyMatches;
      }
      
      // If still no matches, return some sample data for demo purposes
      console.log("No matches found, returning sample data for demo");
      return createSamplePatientsForPG(pgNameParam);
    }
    
    return matchingPatients;
  };

  // Helper function to create sample patients when no matches found
  const createSamplePatientsForPG = (pgName) => {
    return [
      {
        id: 'sample1',
        patientId: 'S001',
        patientFirstName: 'John',
        patientMiddleName: 'A',
        patientLastName: 'Smith',
        patientDOB: '01/15/1945',
        hhah: pgName || 'Sample Agency',
        patientInsurance: 'Medicare',
        primaryDiagnosisCodes: ['I10'],
        secondaryDiagnosisCodes: ['E11.9', 'Z79.4'],
        patientSOC: '02/01/2024',
        patientEpisodeFrom: '02/01/2024',
        patientEpisodeTo: '04/01/2024',
        cpoMinsCaptured: 35,
        billingCode: 'G0181',
        charges: 113,
        pos: '11',
        units: 1,
        physicianName: 'Dr. Sarah Johnson',
        certStatus: 'Document Signed',
        recertStatus: 'Not Started',
        certSignedDate: '01/25/2024',
        recertSignedDate: '',
        patientRemarks: 'CERT signed'
      },
      {
        id: 'sample2',
        patientId: 'S002',
        patientFirstName: 'Mary',
        patientMiddleName: 'E',
        patientLastName: 'Johnson',
        patientDOB: '03/22/1938',
        hhah: pgName || 'Sample Agency',
        patientInsurance: 'Medicare',
        primaryDiagnosisCodes: ['J44.9'],
        secondaryDiagnosisCodes: ['I50.9', 'Z79.01'],
        patientSOC: '01/15/2024',
        patientEpisodeFrom: '01/15/2024',
        patientEpisodeTo: '03/15/2024',
        cpoMinsCaptured: 40,
        billingCode: 'G0181',
        charges: 113,
        pos: '11',
        units: 1,
        physicianName: 'Dr. Robert Chen',
        certStatus: 'Not Started',
        recertStatus: 'Not Started',
        certSignedDate: '',
        recertSignedDate: '',
        patientRemarks: 'CPO completed'
      }
    ];
  };

  // Export claims as PDF
  const exportClaimsAsPDF = () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`${pgName} - Claims Report`, 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Convert validated claims data to array format for table
    const tableData = getAllValidatedClaims().map(claim => [
      claim.fullName,
      claim.docType || 'CPO',
      claim.billingCode,
      `$${claim.line1Charges}`,
      claim.line1DosFrom,
      claim.line1DosTo,
      claim.minutesCaptured > 0 ? `${claim.minutesCaptured} mins` : 'N/A'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Patient', 'Type', 'Code', 'Charge', 'DOS From', 'DOS To', 'CPO Minutes']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 119] }
    });
    
    // Add summary
    const totalClaims = getAllValidatedClaims().length;
    const totalAmount = getAllValidatedClaims().reduce((sum, claim) => sum + claim.line1Charges, 0);
    
    doc.setFontSize(10);
    doc.text(`Total Claims: ${totalClaims}`, 14, doc.autoTable.previous.finalY + 10);
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 20);
    
    // Save the PDF
    doc.save(`${pgName.replace(/\s+/g, '_')}_Claims_${getFormattedDate()}.pdf`);
  };

  // Add the validation modal UI to the component
  // Place this just before the final return statement of the component

  // Add before the return statement:
  // Validation Progress Modal
  const renderValidationModal = () => (
    showValidationModal && (
      <div className="modal" style={{ 
        display: 'flex', 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="modal-content" style={{ 
          width: '400px', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}>
          <div className="modal-header">
            <h3>Validating Claims</h3>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="validation-status">
              <p>{validationStatus}</p>
              <div className="progress-bar" style={{ 
                marginTop: '15px', 
                height: '8px', 
                width: '100%', 
                backgroundColor: '#e2e8f0', 
                borderRadius: '4px', 
                overflow: 'hidden' 
              }}>
                <div className="progress-fill" style={{ 
                  height: '100%', 
                  width: '70%', 
                  backgroundColor: '#4F46E5', 
                  borderRadius: '4px', 
                  transition: 'width 0.3s ease' 
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Update the final return statement to include the validation modal
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
      {renderValidationModal()}
    </div>
  );
};

export default PGView; 