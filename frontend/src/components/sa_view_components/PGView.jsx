import React, { useState, useEffect } from 'react';
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

const PGView = () => {
  const navigate = useNavigate();
  const { pgName } = useParams();
  const location = useLocation();
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

  // Fix date format conversion for the date inputs
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    
    // Store date internally in ISO format for form inputs
    setSelectedDateRange(prev => ({
      ...prev,
      [name]: value // Keep ISO format for the HTML date input
    }));
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

  const getFilteredClaims = () => {
    // If there are no filtered claims yet, use the dummy claims
    if (filteredClaims.length === 0) {
      return dummyClaims;
    }
    return filteredClaims;
  };

  const filterClaimsByDateRange = () => {
    // Convert dates from ISO or American format to proper Date objects
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Handle ISO format (from date input)
      if (dateStr.includes('-')) {
        return new Date(dateStr);
      }
      
      // Handle American format (MM/DD/YYYY)
      const [month, day, year] = dateStr.split('/');
      return new Date(year, month - 1, day);
    };

    const startDate = parseDate(selectedDateRange.start);
    const endDate = parseDate(selectedDateRange.end);
    
    if (!startDate || !endDate) {
      alert("Please select valid episode start dates");
      return;
    }
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);
    
    const filtered = dummyClaims.filter(claim => {
      // Parse episode start date which could be in either format
      const episodeStartDate = parseDate(claim.episodeFrom);
      if (!episodeStartDate) return false;
      
      return episodeStartDate >= startDate && episodeStartDate <= endDate;
    });
    
    setFilteredClaims(filtered);
    setShowDateRangeFilter(false);
  };

  const formatDownloadDate = (dateStr) => {
    if (!dateStr) return '';
    try {
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
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Format month names
      const shortMonthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const currentShortMonth = shortMonthNames[currentMonth - 1];
      
      // Prepare claims based on business rules
      const preparedClaims = filteredClaims.length > 0 ? filteredClaims : dummyClaims;
      
      // Generate filename
      const fileName = `${currentShortMonth} ${currentYear} Billing - ${pgName || 'Sample PG'} - Data`;
      
      if (format === 'csv') {
        // Prepare CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        const headers = [
          "Remarks", "S. No.", "FULL Name", "First Name", "Middle Name", "Last Name", "DOB",
          "HHA NAME", "INSURANCE TYPE", "PRIMARY DIAGNOSIS CODE", 
          "SOC", "Episode From", "Episode To",
          "CPO Minutes Captured", "Billing Code", "LINE 1 DOS FROM", "LINE 1 DOS TO", 
          "Line 1 $Charges", "Line 1 POS", "Line 1 Units", "Provider's Name"
        ];
        
        csvContent += headers.join(",") + "\r\n";
        
        // Add data rows
        preparedClaims.forEach(claim => {
          const row = [
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
            `"${formatDownloadDate(claim.soc)}"`,
            `"${formatDownloadDate(claim.episodeFrom)}"`,
            `"${formatDownloadDate(claim.episodeTo)}"`,
            `"${claim.cpoMinutesCaptured || ''}"`,
            `"${claim.billingCode || ''}"`,
            `"${formatDownloadDate(claim.line1DosFrom)}"`,
            `"${formatDownloadDate(claim.line1DosTo)}"`,
            `"${claim.line1Charges || ''}"`,
            `"${claim.line1Pos || ''}"`,
            `"${claim.line1Units || ''}"`,
            `"${claim.providersName || ''}"`,
          ];
          
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
        
        // Prepare data for table
        const headers = [
          ["S.No", "Patient Name", "DOB", "HHA", "Insurance", "Primary DX", 
           "SOC", "Episode From", "Episode To",
           "CPO Min", "Billing Code", "$Charges"]
        ];
        
        const data = preparedClaims.map(claim => [
          claim.sNo || '',
          claim.fullName || '',
          formatDownloadDate(claim.dob),
          claim.hhaName || '',
          claim.insuranceType || '',
          claim.primaryDiagnosisCode || '',
          formatDownloadDate(claim.soc),
          formatDownloadDate(claim.episodeFrom),
          formatDownloadDate(claim.episodeTo),
          claim.cpoMinutesCaptured || '',
          claim.billingCode || '',
          claim.line1Charges || ''
        ]);
        
        // Generate table
        doc.autoTable({
          head: headers,
          body: data,
          startY: 25,
          theme: 'grid',
          styles: { 
            fontSize: 7,
            cellPadding: 1,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          columnStyles: {
            0: { cellWidth: 10 }, // S.No
            1: { cellWidth: 35 }, // Patient Name
            2: { cellWidth: 20 }, // DOB
            3: { cellWidth: 25 }, // HHA
            4: { cellWidth: 20 }, // Insurance
            5: { cellWidth: 15 }, // Primary DX
            6: { cellWidth: 20 }, // SOC
            7: { cellWidth: 20 }, // Episode From
            8: { cellWidth: 20 }, // Episode To
            9: { cellWidth: 15 }, // CPO Min
            10: { cellWidth: 15 }, // Billing Code
            11: { cellWidth: 15 }  // $Charges
          },
          headStyles: {
            fillColor: [71, 85, 119],
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold'
          }
        });
        
        // Save PDF
        doc.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Error in handleDownloadClaims:', error);
      alert('Failed to download claims. Please try again.');
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
              onClick={() => setShowDateRangeFilter(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Date Range Filter
            </button>
          </div>
          
          {showDateRangeFilter && (
            <div className="modal-overlay">
              <div className="modal-content" data-type="date-range">
                <div className="modal-header">
                  <h2>Filter Episodes by Date Range</h2>
                  <button className="close-button" onClick={() => setShowDateRangeFilter(false)}>×</button>
                </div>
                <div className="form-group">
                  <label>Episode Start Date (From)</label>
                  <input
                    type="date"
                    className="date-input"
                    name="start"
                    value={selectedDateRange.start}
                    onChange={handleDateRangeChange}
                  />
                </div>
                <div className="form-group">
                  <label>Episode Start Date (To)</label>
                  <input
                    type="date"
                    className="date-input"
                    name="end"
                    value={selectedDateRange.end}
                    onChange={handleDateRangeChange}
                  />
                </div>
                <div className="form-group">
                  <label>Quick Select</label>
                  <div className="button-group">
                    <button 
                      className={`period-button ${selectedPeriod === 'all' ? 'active' : ''}`}
                      onClick={() => handlePeriodChange('all')}
                    >
                      All Episodes
                    </button>
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    className="submit-button"
                    onClick={filterClaimsByDateRange}
                    disabled={!selectedDateRange.start || !selectedDateRange.end}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Always show filtered results count and export buttons */}
          <div className="filtered-results" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ margin: 0 }}>
              {filteredClaims.length > 0 
                ? `Filtered Claims: ${filteredClaims.length}` 
                : `Total Claims: ${dummyClaims.length}`}
            </h3>
            <div className="export-buttons" style={{ display: 'flex', gap: '10px' }}>
              <button className="download-button" onClick={() => handleDownloadClaims('csv')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CSV
              </button>
              <button className="download-button" onClick={() => handleDownloadClaims('pdf')}>
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

      <div className="table-container" style={{ maxWidth: '100%', overflowX: 'auto', position: 'relative' }}>
        <table className="claims-table" style={{ tableLayout: 'fixed', minWidth: '1500px' }}>
          <thead>
            <tr>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('remarks')}>
                Remarks {sortConfig.key === 'remarks' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '80px' }} onClick={() => handleSortClick('sNo')}>
                S. No. {sortConfig.key === 'sNo' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '200px' }} onClick={() => handleSortClick('fullName')}>
                FULL Name {sortConfig.key === 'fullName' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('firstName')}>
                First Name {sortConfig.key === 'firstName' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('middleName')}>
                Middle Name {sortConfig.key === 'middleName' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('lastName')}>
                Last Name {sortConfig.key === 'lastName' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('dob')}>
                DOB {sortConfig.key === 'dob' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '120px' }} onClick={() => handleSortClick('hhaName')}>
                HHA NAME {sortConfig.key === 'hhaName' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('insuranceType')}>
                Insurance {sortConfig.key === 'insuranceType' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('primaryDiagnosisCode')}>
                Primary DX {sortConfig.key === 'primaryDiagnosisCode' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('soc')}>
                SOC {sortConfig.key === 'soc' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('episodeFrom')}>
                Episode From {sortConfig.key === 'episodeFrom' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('episodeTo')}>
                Episode To {sortConfig.key === 'episodeTo' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('minutesCaptured')}>
                Minutes {sortConfig.key === 'minutesCaptured' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('billingCode')}>
                Billing Code {sortConfig.key === 'billingCode' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('line1DosFrom')}>
                DOS From {sortConfig.key === 'line1DosFrom' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('line1DosTo')}>
                DOS To {sortConfig.key === 'line1DosTo' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '100px' }} onClick={() => handleSortClick('line1Charges')}>
                Charges {sortConfig.key === 'line1Charges' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '80px' }} onClick={() => handleSortClick('line1Pos')}>
                POS {sortConfig.key === 'line1Pos' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '80px' }} onClick={() => handleSortClick('line1Units')}>
                Units {sortConfig.key === 'line1Units' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th style={{ width: '150px' }} onClick={() => handleSortClick('providersName')}>
                Provider {sortConfig.key === 'providersName' && <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {(filteredClaims.length > 0 ? filteredClaims : dummyClaims).map(claim => (
              <tr key={`claim-${claim.id}`}>
                <td>{claim.remarks}</td>
                <td>{claim.sNo}</td>
                <td>{claim.fullName}</td>
                <td>{claim.firstName}</td>
                <td>{claim.middleName}</td>
                <td>{claim.lastName}</td>
                <td>{claim.dob}</td>
                <td>{claim.hhaName}</td>
                <td>{claim.insuranceType}</td>
                <td>{claim.primaryDiagnosisCode}</td>
                <td>{claim.soc}</td>
                <td>{claim.episodeFrom}</td>
                <td>{claim.episodeTo}</td>
                <td>{claim.minutesCaptured}</td>
                <td>{claim.billingCode}</td>
                <td>{claim.line1DosFrom}</td>
                <td>{claim.line1DosTo}</td>
                <td>{claim.line1Charges}</td>
                <td>{claim.line1Pos}</td>
                <td>{claim.line1Units}</td>
                <td>{claim.providersName}</td>
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
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
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