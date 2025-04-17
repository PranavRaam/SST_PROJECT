import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './PatientDetailView.css';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaHeartbeat,
  FaPills,
  FaAllergies,
  FaUserMd,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPauseCircle,
  FaClipboardCheck,
  FaArrowLeft,
  FaPrint,
  FaDownload,
  FaUpload,
  FaCog,
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaFilter,
  FaEye,
  FaFileUpload,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHistory,
  FaFileMedical,
  FaUserCircle,
  FaClipboardList,
  FaFileMedicalAlt,
  FaHashtag,
  FaCalendar,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFile,
  FaTrash,
  FaLink,
  FaChartLine,
  FaUserCheck,
  FaBell,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSignature,
  FaCommentMedical,
  FaHospital,
  FaShareAlt,
  FaPlus,
  FaStethoscope,
  FaProcedures,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaFileSignature,
  FaCheck,
  FaArrowCircleRight,
  FaExclamationCircle,
  FaSearchPlus,
  FaSearchMinus,
  FaRedo
} from 'react-icons/fa';

// Helper functions
const getStatusIcon = (status) => {
  switch (status) {
    case 'active':
      return <FaCheckCircle className="status-icon active" />;
    case 'discharged':
      return <FaArrowCircleRight className="status-icon discharged" />;
    case 'on-hold':
      return <FaPauseCircle className="status-icon on-hold" />;
    case 'evaluation':
      return <FaExclamationCircle className="status-icon evaluation" />;
    default:
      return <FaInfoCircle className="status-icon" />;
  }
};

const getStatusMessage = (status) => {
  switch (status) {
    case 'active':
      return 'Patient is actively receiving care';
    case 'discharged':
      return 'Patient has been discharged from care';
    case 'on-hold':
      return 'Patient care is temporarily on hold';
    case 'evaluation':
      return 'Patient is being evaluated for care plan';
    default:
      return 'Status information unavailable';
  }
};

const getNextReviewDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // Next review in 7 days
  return date.toLocaleDateString();
};

const getTodayMinusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
};

const getTimelineIcon = (eventType) => {
  switch (eventType) {
    case 'admission':
      return <FaHospital className="timeline-icon" />;
    case 'evaluation':
      return <FaClipboardCheck className="timeline-icon" />;
    case 'document':
      return <FaFileAlt className="timeline-icon" />;
    case 'status':
      return <FaUserCheck className="timeline-icon" />;
    case 'treatment':
      return <FaStethoscope className="timeline-icon" />;
    default:
      return <FaInfoCircle className="timeline-icon" />;
  }
};

// Generate some mock timeline data for demonstration
const generateMockTimelineData = () => {
  return [
    {
      id: 1,
      type: 'admission',
      title: 'Patient Admitted',
      date: getTodayMinusDays(30),
      description: 'Initial admission to care program',
      provider: 'Dr. Sarah Johnson',
      location: 'General Ward',
      tags: ['Admission', 'Initial Assessment']
    },
    {
      id: 2,
      type: 'evaluation',
      title: 'Initial Evaluation',
      date: getTodayMinusDays(28),
      description: 'Full physical evaluation completed',
      provider: 'Dr. Robert Chen',
      tags: ['Evaluation', 'Completed']
    },
    {
      id: 3,
      type: 'document',
      title: 'Care Plan Created',
      date: getTodayMinusDays(26),
      description: 'Initial care plan documented and approved',
      provider: 'Care Team',
      tags: ['Care Plan', 'Documentation']
    },
    {
      id: 4,
      type: 'treatment',
      title: 'Treatment Started',
      date: getTodayMinusDays(25),
      description: 'Treatment regimen initiated',
      provider: 'Dr. Sarah Johnson',
      tags: ['Treatment', 'Medication']
    },
    {
      id: 5,
      type: 'status',
      title: 'Status Updated',
      date: getTodayMinusDays(15),
      description: 'Patient status updated to Active',
      provider: 'Care Team',
      tags: ['Status Change', 'Active']
    },
    {
      id: 6,
      type: 'evaluation',
      title: 'Follow-up Evaluation',
      date: getTodayMinusDays(10),
      description: 'Regular follow-up evaluation',
      provider: 'Dr. Robert Chen',
      tags: ['Evaluation', 'Follow-up']
    },
    {
      id: 7,
      type: 'document',
      title: 'Progress Report Filed',
      date: getTodayMinusDays(5),
      description: 'Monthly progress report completed',
      provider: 'Care Team',
      tags: ['Progress Report', 'Documentation']
    }
  ];
};

// DocIdInput component for better user experience
const DocIdInput = ({ docId, onUpdate }) => {
  const [value, setValue] = useState(docId);
  const [isEditing, setIsEditing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const inputRef = useRef(null);
  
  // Reset value if docId changes from outside
  useEffect(() => {
    setValue(docId);
    validateDocId(docId);
  }, [docId]);
  
  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Simple validation for doc IDs
  const validateDocId = (id) => {
    // Check if empty
    if (!id.trim()) {
      setIsValid(false);
      setValidationMessage('ID cannot be empty');
      return false;
    }
    
    // Check if follows common pattern for backoffice IDs (e.g., DOC-123)
    const backofficePattern = /^[A-Z]+-\d+$/;
    if (!backofficePattern.test(id)) {
      setIsValid(false);
      setValidationMessage('Recommended format: PREFIX-123');
      return false;
    }
    
    setIsValid(true);
    setValidationMessage('');
    return true;
  };
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    validateDocId(newValue);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    setIsFocused(false);
    
    // Auto-format the ID if not valid but not empty
    if (!isValid && value.trim()) {
      // If it's just missing the dash, try to format it
      if (/^[A-Za-z]+\d+$/.test(value)) {
        // Extract prefix and number, then format
        const match = value.match(/^([A-Za-z]+)(\d+)$/);
        if (match) {
          const formattedId = `${match[1].toUpperCase()}-${match[2]}`;
          setValue(formattedId);
          onUpdate(docId, formattedId);
          return;
        }
      }
    }
    
    if (value !== docId) {
      // Even if not valid format, still update if not empty
      if (value.trim()) {
        onUpdate(docId, value);
      } else {
        // Reset to original if empty
        setValue(docId);
      }
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
    } else if (e.key === 'Escape') {
      setValue(docId);
      setIsEditing(false);
      setIsFocused(false);
    }
  };
  
  return (
    <div 
      className={`doc-id-field ${isEditing ? 'editing' : ''} ${isFocused ? 'focused' : ''} ${!isValid ? 'invalid' : ''}`} 
      onClick={handleClick}
      title={validationMessage || 'Click to edit document ID'}
    >
      <FaHashtag className="doc-id-icon" />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="doc-id-input"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="PREFIX-123"
        />
      ) : (
        <div className="doc-id-display">
          <span>{docId}</span>
          <div className="edit-indicator">
            <FaEdit className="edit-icon" />
          </div>
        </div>
      )}
      {isEditing && validationMessage && (
        <div className="validation-message">{validationMessage}</div>
      )}
    </div>
  );
};

// Add this function to filter episodes by date range
const filterEpisodesByDateRange = (episodes, startDate, endDate) => {
  if (!startDate && !endDate) return episodes;
  
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  
  return episodes.filter(episode => {
    const episodeStart = new Date(episode.startDate);
    return episodeStart >= start && episodeStart <= end;
  });
};

// Add function to format CPO minutes
const formatCPOMinutes = (minutes) => {
  if (!minutes) return '0 min';
  return `${minutes} min`;
};

// Add function to calculate CPO percentage
const calculateCPOPercentage = (captured, total) => {
  if (!total) return 0;
  const percentage = (captured / total) * 100;
  return Math.min(100, percentage);
};

// Add function to create mock documents for episodes
const createMockDocumentsForEpisode = (episodeId) => {
  const documentTypes = ['Evaluation', 'Treatment Plan', 'Progress Report', 'Discharge Summary'];
  const randomCount = Math.floor(Math.random() * 3) + 1; // 1-3 documents
  const documents = [];

  for (let i = 0; i < randomCount; i++) {
    const type = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    documents.push({
      id: `DOC-EP${episodeId}-${i + 1}`,
      type: type,
      fileName: `${type.toLowerCase().replace(/\s/g, '_')}_episode${episodeId}.pdf`,
      createdDate: date.toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      status: Math.random() > 0.5 ? 'Signed' : 'New'
    });
  }
  
  return documents;
};

// Add episode data structure
const generateEpisodeData = () => {
  return [
    {
      id: 1,
      startDate: '2023-04-01',
      socDate: '2023-03-28',  // SOC date should be a few days before the start date
      endDate: '2023-06-30',
      status: 'complete',
      diagnosis: 'Hypertension',
      provider: 'Dr. Sarah Johnson',
      notes: 'Patient completed first episode successfully.',
      documents: createMockDocumentsForEpisode(1)
    },
    {
      id: 2,
      startDate: '2023-07-01',
      socDate: '2023-06-28',  // SOC date should be a few days before the start date
      endDate: '2023-09-30',
      status: 'active',
      diagnosis: 'Type 2 Diabetes',
      provider: 'Dr. Robert Chen',
      notes: 'Patient is currently in this episode.',
      documents: createMockDocumentsForEpisode(2)
    }
  ];
};

const PatientDetailView = ({ patient: propPatient }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routePatient = location.state?.patientData;
  
  // Use route patient data if available, otherwise use prop patient data
  const patient = routePatient || propPatient;

  // State for active tab and document type select
  const [activeTab, setActiveTab] = useState('patientInfo');
  const [activeDocumentTab, setActiveDocumentTab] = useState('newPrepared');
  const [documentDate, setDocumentDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('receivedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [timelinePeriod, setTimelinePeriod] = useState('all');
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [fileTypes, setFileTypes] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Refs
  const fileInputRef = useRef(null);
  
  // State for editable patient info
  const [isEditing, setIsEditing] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    id: patient?.id || '',
    name: patient?.patientFirstName ? `${patient.patientLastName || ''}, ${patient.patientFirstName} ${patient.patientMiddleName || ''}` : patient?.ptName || '',
    dob: patient?.patientDOB || patient?.dob || '',
    gender: patient?.gender || 'Not specified',
    status: patient?.status || 'active',
    phone: patient?.patientContact?.phone || patient?.contactNumber || '',
    email: patient?.patientContact?.email || patient?.email || '',
    address: patient?.patientContact?.address || patient?.address || '',
    insurance: patient?.insurance || patient?.patientInsurance || '',
    insuranceId: patient?.insuranceId || '',
    pg: patient?.pg || '',
    hhah: patient?.hhah || '',
    admissionDate: patient?.patientSOC || patient?.soc || '',
    episodeFrom: patient?.patientEpisodeFrom || patient?.episodeFrom || '',
    episodeTo: patient?.patientEpisodeTo || patient?.episodeTo || '',
    dischargeDate: patient?.dischargeDate || '',
    primaryDiagnosis: patient?.primaryDiagnosis || (patient?.primaryDiagnosisCodes ? patient.primaryDiagnosisCodes.join(", ") : ''),
    secondaryDiagnosis: patient?.secondaryDiagnosis || (patient?.secondaryDiagnosisCodes ? patient.secondaryDiagnosisCodes.join(", ") : ''),
    primaryPhysician: patient?.physician || patient?.physicianName || '',
    specialist: patient?.specialist || '',
    allergies: patient?.allergies || '',
    medications: patient?.medications || '',
    renderingPractitioner: patient?.renderingProvider || patient?.renderingPractitioner || '',
    hasEHR: patient?.patientInEHR === 'yes' || false,
    cpoMinsCaptured: patient?.cpoMinsCaptured || 0,
    newDocs: patient?.newDocs || 0,
    newCPODocsCreated: patient?.newCpoDocsCreated || 0,
    certStatus: patient?.certStatus || '',
    recertStatus: patient?.recertStatus || '',
    f2fEligibility: patient?.f2fEligibility || '',
    remarks: patient?.patientRemarks || patient?.remarks || '',
  });
  
  // Timeline data
  const [timelineData, setTimelineData] = useState(generateMockTimelineData());
  
  // Dummy data for documents
  const [newPreparedDocs, setNewPreparedDocs] = useState([
    { 
      id: 'DOC-001', 
      type: 'Evaluation', 
      status: 'New', 
      receivedDate: '2023-05-10',
      fileName: 'initial_evaluation.pdf',
      size: '1.2 MB',
      uploadedBy: 'Dr. Johnson'
    },
    { 
      id: 'DOC-002', 
      type: '', 
      status: 'New', 
      receivedDate: '2023-05-12',
      fileName: 'lab_results.pdf',
      size: '0.8 MB',
      uploadedBy: 'Lab Technician'
    },
    { 
      id: 'DOC-003', 
      type: 'Position Order', 
      status: 'Prepared', 
      receivedDate: '2023-05-15',
      fileName: 'position_order.docx',
      size: '0.5 MB',
      uploadedBy: 'Dr. Chen'
    }
  ]);
  
  const [signedDocs, setSignedDocs] = useState([
    { 
      id: 'DOC-004', 
      type: 'Re-evaluation', 
      signedDate: '2023-04-28',
      fileName: 're_evaluation_signed.pdf',
      size: '1.5 MB',
      signedBy: 'Dr. Johnson'
    },
    { 
      id: 'DOC-005', 
      type: 'Position Order', 
      signedDate: '2023-04-30',
      fileName: 'position_order_signed.pdf',
      size: '0.7 MB',
      signedBy: 'Dr. Chen'
    }
  ]);

  // CPO allocation data
  const [cpoDocuments, setCpoDocuments] = useState([
    {
      id: 'CPO-001',
      name: 'Initial Care Plan',
      creationDate: '2023-04-05',
      minutes: 15,
      status: 'Completed',
      provider: 'Dr. Sarah Johnson'
    },
    {
      id: 'CPO-002',
      name: 'Medication Review',
      creationDate: '2023-04-15',
      minutes: 10,
      status: 'Completed',
      provider: 'Dr. Robert Chen'
    },
    {
      id: 'CPO-003',
      name: 'Progress Report',
      creationDate: '2023-05-01',
      minutes: 20,
      status: 'In Progress',
      provider: 'Dr. Sarah Johnson'
    },
    {
      id: 'CPO-004',
      name: 'Care Coordination',
      creationDate: '2023-05-10',
      minutes: 30,
      status: 'Completed',
      provider: 'Care Team'
    }
  ]);
  
  // Add cpoDocs state before it's used in other functions
  const [cpoDocs, setCpoDocs] = useState([
    {
      id: "CPO_001",
      fileName: "CPO_Document_001.pdf",
      type: "CPO Assessment",
      creationDate: "2023-04-05",
      size: "1.2 MB"
    },
    {
      id: "CPO_002",
      fileName: "CPO_Document_002.pdf",
      type: "CPO Evaluation",
      creationDate: "2023-05-10",
      size: "0.9 MB"
    }
  ]);

  // Function to filter documents
  const filterDocuments = (docs) => {
    return docs.filter(doc => {
      // Apply search term filtering
      const matchesSearch = searchTerm === '' || 
        doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.fileName && doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply status filtering (for new/prepared docs only)
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'new' && doc.status === 'New') ||
        (statusFilter === 'prepared' && doc.status === 'Prepared');
      
      // Apply date filtering if date range is set
      let matchesDate = true;
      if (dateRange.startDate && dateRange.endDate && doc.receivedDate) {
        const docDate = new Date(doc.receivedDate);
        const fromDate = new Date(dateRange.startDate);
        const toDate = new Date(dateRange.endDate);
        matchesDate = docDate >= fromDate && docDate <= toDate;
      }
      
      // Apply file type filtering
      let matchesFileType = true;
      if (fileTypes.length > 0 && doc.fileName) {
        const extension = doc.fileName.split('.').pop().toLowerCase();
        matchesFileType = fileTypes.includes(extension);
      }
      
      return matchesSearch && matchesStatus && matchesDate && matchesFileType;
    });
  };
  
  // Sort function for documents
  const sortDocuments = (docs) => {
    return [...docs].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        const aDate = new Date(a.signedDate || a.receivedDate || 0);
        const bDate = new Date(b.signedDate || b.receivedDate || 0);
        comparison = aDate - bDate;
      } else if (sortField === 'type') {
        comparison = (a.type || '').localeCompare(b.type || '');
      } else if (sortField === 'filename') {
        comparison = (a.fileName || '').localeCompare(b.fileName || '');
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };
  
  // Memoize filtered and sorted documents
  const filteredNewPreparedDocs = useMemo(() => {
    return sortDocuments(filterDocuments(newPreparedDocs));
  }, [newPreparedDocs, searchTerm, statusFilter, dateRange, fileTypes, sortField, sortDirection]);

  const filteredSignedDocs = useMemo(() => {
    const filtered = signedDocs.filter(doc => 
      searchTerm === '' || 
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.fileName && doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return sortDocuments(filtered);
  }, [signedDocs, searchTerm, sortField, sortDirection]);

  // Filter timeline data based on the selected period
  const filteredTimelineData = useMemo(() => {
    if (timelinePeriod === 'all') return timelineData;
    
    return timelineData.filter(event => event.type === timelinePeriod);
  }, [timelineData, timelinePeriod]);

  // Memoize document counts
  const documentCounts = useMemo(() => ({
    new: newPreparedDocs.filter(doc => doc.status === 'New').length,
    prepared: newPreparedDocs.filter(doc => doc.status === 'Prepared').length,
    signed: signedDocs.length,
    total: newPreparedDocs.length + signedDocs.length
  }), [newPreparedDocs, signedDocs]);

  // Calculate total CPO minutes
  const totalCpoMinutes = useMemo(() => {
    return cpoDocuments.reduce((total, doc) => total + doc.minutes, 0);
  }, [cpoDocuments]);

  // Function to show notification
  const showNotification = useCallback((type, title, message) => {
    setNotification({ type, title, message });
  }, []);
  
  // Function to upload files
  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    
    // Show uploading notification
    showNotification('info', 'Uploading Files', 'Your files are being uploaded...');
    
    const newFiles = Array.from(files).map(file => ({
      id: `DOC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      type: '',
      status: 'New',
      receivedDate: new Date().toISOString().split('T')[0],
      fileName: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedBy: 'Current User',
      file: file // Store the actual file for potential preview
    }));

    // Simulate file upload
    for (const file of newFiles) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add the file to the newPreparedDocs list
        setNewPreparedDocs(prev => [...prev, file]);
        
        showNotification('success', 'File Uploaded', `${file.fileName} uploaded successfully`);
      } catch (error) {
        showNotification('error', 'Upload Failed', `Failed to upload ${file.fileName}`);
      }
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [showNotification]);

  const handleFileInputChange = useCallback((event) => {
    const files = event.target.files;
    if (files) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const toggleDocPrepared = useCallback((docId) => {
    setNewPreparedDocs(prevDocs => {
      const updatedDocs = prevDocs.map(doc => {
        if (doc.id === docId) {
          const newStatus = doc.status === 'New' ? 'Prepared' : 'New';
          showNotification(
            'success', 
            'Status Updated', 
            `Document ${docId} marked as ${newStatus}`
          );
          return { ...doc, status: newStatus };
        }
        return doc;
      });
      return updatedDocs;
    });
  }, [showNotification]);

  const moveToSigned = useCallback((docId) => {
    const docToMove = newPreparedDocs.find(doc => doc.id === docId);
    if (docToMove) {
      const signedDoc = {
        id: docToMove.id,
        type: docToMove.type,
        fileName: docToMove.fileName,
        size: docToMove.size,
        signedDate: new Date().toISOString().split('T')[0],
        signedBy: 'Dr. Sarah Johnson'
      };
      setSignedDocs(prev => [...prev, signedDoc]);
      setNewPreparedDocs(prev => prev.filter(doc => doc.id !== docId));
      
      // Add to timeline
      const newTimelineEvent = {
        id: timelineData.length + 1,
        type: 'document',
        title: `Document Signed: ${docToMove.type || 'Unknown Type'}`,
        date: new Date().toLocaleDateString(),
        description: `Document ${docToMove.id} has been signed`,
        provider: 'Dr. Sarah Johnson',
        tags: ['Document', 'Signed']
      };
      
      setTimelineData(prev => [newTimelineEvent, ...prev]);
      
      showNotification(
        'success', 
        'Document Signed', 
        `Document ${docId} has been moved to signed documents`
      );
    }
  }, [newPreparedDocs, timelineData, showNotification]);
  
  // Function to show notification
  // Function to close notification
  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);
  
  // Calculate CPO minutes
  const calculateCPOMinutes = () => {
    // Calculate CPO minutes based on documents count * 2
    const documentCount = cpoDocs.length;
    const cpoMinutes = documentCount * 2;
    
    // Update patient info with calculated CPO minutes
    setPatientInfo(prev => ({
      ...prev,
      cpoMinsCaptured: cpoMinutes
    }));
    
    // Update monthly CPO data
    // This creates a simple distribution of CPO minutes across months
    const updatedMonthlyCPOData = [...monthlyCPOData];
    
    // Reset all months to 0
    updatedMonthlyCPOData.forEach(month => {
      month.minutes = 0;
    });
    
    // Distribute minutes across months with documents
    if (documentCount > 0) {
      const minutesPerDoc = 2;
      cpoDocs.forEach(doc => {
        const docDate = new Date(doc.creationDate);
        const monthIndex = docDate.getMonth();
        updatedMonthlyCPOData[monthIndex].minutes += minutesPerDoc;
      });
    }
    
    setMonthlyCPOData(updatedMonthlyCPOData);
  };
  
  // Function to update document type
  const updateDocType = (docId, newType) => {
    setNewPreparedDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, type: newType } : doc
      )
    );
  };
  
  // Function to update document ID
  const updateDocId = (docId, newId) => {
    // Update in new/prepared docs
    setNewPreparedDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, id: newId } : doc
      )
    );
    
    // Update in signed docs
    setSignedDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, id: newId } : doc
      )
    );
  };
  
  // Function to update signed date
  const updateSignedDate = (docId, date) => {
    setSignedDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, signedDate: date } : doc
      )
    );
  };
  
  // Document type options
  const documentTypes = [
    'Evaluation',
    'Re-evaluation',
    'Position Order',
    'Recertification',
    'Discharge Summary',
    'Progress Note',
    'Treatment Plan',
    'Referral',
    'Lab Results',
    'Medical History',
    'Medication List',
    'Consent Form',
    'Insurance Documentation',
    'Other'
  ];

  // Handle patient info changes
  const handleInfoChange = (field, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save patient info changes
  const savePatientInfo = () => {
    // Calculate total CPO minutes if not already done
    if (!patientInfo.cpoMinsCaptured) {
      const totalMinutes = cpoDocuments.reduce((sum, doc) => sum + doc.minutes, 0);
      setPatientInfo(prev => ({
        ...prev,
        cpoMinsCaptured: totalMinutes
      }));
    }
    
    // Here you would typically save to backend
    console.log('Saving patient info:', patientInfo);
    
    // For demo purposes, show success notification
    showNotification('success', 'Patient Info Saved', 'Patient information has been successfully updated.');
    
    setIsEditing(false);
  };

  // Auto dismiss notification after time
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Function to determine file icon type based on file name
  const getFileIconByName = (fileName) => {
    if (!fileName) return <FaFile />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <FaFilePdf className="file-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="file-icon word" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="file-icon excel" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="file-icon image" />;
      default:
        return <FaFile className="file-icon" />;
    }
  };

  // Function to toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Replace the addCpoDocument function with file upload functionality
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show notification that file is being processed
    showNotification('info', 'Processing Document', 'Uploading and processing document...');

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    
    // Create the new document object
    const newDocument = {
      id: `CPO_${Date.now().toString().slice(-6)}`,
      fileName: file.name,
      type: 'CPO Document',
      creationDate: formattedDate,
      file: file,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedBy: 'Current User'
    };
    
    // Add the document to the cpoDocs state
    setCpoDocs(prevDocs => [...prevDocs, newDocument]);
    
    // Show success notification
    showNotification('success', 'CPO Document Added', 'New CPO document has been uploaded successfully.');
    
    // Reset the file input
    e.target.value = '';
    
    // Calculate CPO minutes after adding document
    calculateCPOMinutes();
  };

  // Function to update CPO document status
  const updateCpoStatus = (docId, newStatus) => {
    setCpoDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, status: newStatus } : doc
      )
    );
    
    showNotification('success', 'Status Updated', `CPO document status changed to ${newStatus}`);
  };

  // Function to update CPO minutes
  const updateCpoMinutes = (docId, minutes) => {
    setCpoDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, minutes: Number(minutes) } : doc
      )
    );
  };

  // Function to handle file type filter changes
  const handleFileTypeFilter = (type) => {
    if (fileTypes.includes(type)) {
      setFileTypes(prev => prev.filter(t => t !== type));
    } else {
      setFileTypes(prev => [...prev, type]);
    }
  };

  // Function to reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ startDate: null, endDate: null });
    setFileTypes([]);
    setSortField('receivedDate');
    setSortDirection('desc');
  };

  // State for document viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditingDocumentDetails, setIsEditingDocumentDetails] = useState(false);

  // Function to update document viewer document
  const updateViewerDocument = (field, value) => {
    setSelectedDocument(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to save document changes from viewer
  const saveDocumentChanges = () => {
    // Update document in the proper state array
    if (selectedDocument.status) {
      setNewPreparedDocs(prevDocs => 
        prevDocs.map(doc => 
          doc.id === selectedDocument.id ? selectedDocument : doc
        )
      );
    } else {
      setSignedDocs(prevDocs => 
        prevDocs.map(doc => 
          doc.id === selectedDocument.id ? selectedDocument : doc
        )
      );
    }
    
    setIsEditingDocumentDetails(false);
    showNotification('success', 'Document Updated', 'Document details have been updated successfully');
  };

  // Function to open document viewer
  const openDocumentViewer = (doc) => {
    // Create a URL for the file preview if the actual file is available
    let enhancedDoc = { ...doc };
    
    if (doc.file) {
      // If we have the actual file object (from an upload), create a URL for preview
      enhancedDoc.fileUrl = URL.createObjectURL(doc.file);
      enhancedDoc.hasFilePreview = true;
    } else {
      // For demo files without actual file content
      enhancedDoc.hasFilePreview = false;
    }
    
    setSelectedDocument(enhancedDoc);
    setViewerOpen(true);
  };

  // Function to close document viewer
  const closeDocumentViewer = () => {
    // Clean up any object URLs created for previews
    if (selectedDocument && selectedDocument.fileUrl) {
      URL.revokeObjectURL(selectedDocument.fileUrl);
    }
    
    setViewerOpen(false);
    setSelectedDocument(null);
  };

  const markAsPrepared = useCallback((docId) => {
    setNewPreparedDocs(prevDocs => {
      const updatedDocs = prevDocs.map(doc => {
        if (doc.id === docId) {
          showNotification(
            'success', 
            'Status Updated', 
            `Document ${docId} marked as Prepared`
          );
          return { ...doc, status: 'Prepared' };
        }
        return doc;
      });
      return updatedDocs;
    });
  }, [showNotification]);

  const markAsUnprepared = useCallback((docId) => {
    setNewPreparedDocs(prevDocs => {
      const updatedDocs = prevDocs.map(doc => {
        if (doc.id === docId) {
          showNotification(
            'success', 
            'Status Updated', 
            `Document ${docId} marked as New`
          );
          return { ...doc, status: 'New' };
        }
        return doc;
      });
      return updatedDocs;
    });
  }, [showNotification]);

  // Add these new functions after the existing markAsPrepared function
  
  // Function to generate a report
  const generateDocumentReport = () => {
    // Show loading spinner
    showNotification('info', 'Generating Report', 'Preparing document report...');
    
    // Create a PDF report
    setTimeout(() => {
      try {
        // Create PDF content (simulating jsPDF usage)
        const pdfContent = createPDFReport();
        
        // Convert the PDF content to a Blob
        const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
        
        // Create URL for the blob
        const url = URL.createObjectURL(pdfBlob);
        
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `patient_${patientInfo.id}_report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        
        // Click the link to trigger download
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          showNotification('success', 'Report Generated', 'Document report has been downloaded successfully!');
        }, 100);
      } catch (error) {
        console.error("Error generating PDF:", error);
        showNotification('error', 'Report Generation Failed', 'Failed to generate PDF report. Please try again.');
      }
    }, 1500);
  };
  
  // Function to create PDF report content
  const createPDFReport = () => {
    // This function simulates creating a PDF using jsPDF
    // In a real implementation, you would use jsPDF library
    
    // Create a binary representation of a simple PDF
    // This is a simplified approach for simulation
    const pdfHeader = "%PDF-1.3\n";
    
    // Add metadata
    let pdf = pdfHeader;
    pdf += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    pdf += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    pdf += "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n";
    pdf += "4 0 obj\n<< /Font << /F1 6 0 R >> >>\nendobj\n";
    
    // Create the actual content
    let content = "BT\n/F1 12 Tf\n72 720 Td\n(PATIENT DOCUMENT REPORT) Tj\n";
    content += "0 -20 Td\n(Patient: " + patientInfo.name + ") Tj\n";
    content += "0 -20 Td\n(ID: " + patientInfo.id + ") Tj\n";
    content += "0 -20 Td\n(Date of Birth: " + formatDate(patientInfo.dob) + ") Tj\n";
    content += "0 -20 Td\n(Generated Date: " + new Date().toLocaleDateString() + ") Tj\n";
    
    // Document Summary
    content += "0 -40 Td\n(DOCUMENT SUMMARY) Tj\n";
    content += "0 -20 Td\n(Total Documents: " + (newPreparedDocs.length + signedDocs.length) + ") Tj\n";
    content += "0 -20 Td\n(New Documents: " + newPreparedDocs.filter(d => d.status === 'New').length + ") Tj\n";
    content += "0 -20 Td\n(Prepared Documents: " + newPreparedDocs.filter(d => d.status === 'Prepared').length + ") Tj\n";
    content += "0 -20 Td\n(Signed Documents: " + signedDocs.length + ") Tj\n";
    
    // Document List
    content += "0 -40 Td\n(DOCUMENT LIST) Tj\n";
    
    let y = -20;
    // New & Prepared Documents
    if (newPreparedDocs.length > 0) {
      content += "0 " + y + " Td\n(New & Prepared Documents:) Tj\n";
      y = -20;
      
      newPreparedDocs.forEach((doc, index) => {
        content += "10 " + y + " Td\n(" + (index + 1) + ". " + (doc.type || "Unspecified") + 
                  " - " + doc.fileName + " - " + doc.status + ") Tj\n";
        y = -15;
      });
      
      y = -20;
    }
    
    // Signed Documents
    if (signedDocs.length > 0) {
      content += "0 " + y + " Td\n(Signed Documents:) Tj\n";
      y = -20;
      
      signedDocs.forEach((doc, index) => {
        content += "10 " + y + " Td\n(" + (index + 1) + ". " + (doc.type || "Unspecified") + 
                  " - " + doc.fileName + " - Signed on " + formatDate(doc.signedDate) + ") Tj\n";
        y = -15;
      });
    }
    
    content += "ET\n";
    
    // Add content to PDF
    pdf += "5 0 obj\n<< /Length " + content.length + " >>\nstream\n" + content + "endstream\nendobj\n";
    
    // Add font
    pdf += "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
    
    // Add cross-reference table
    const xrefOffset = pdf.length;
    pdf += "xref\n0 7\n0000000000 65535 f\n";
    
    // Add trailer
    pdf += "trailer\n<< /Size 7 /Root 1 0 R >>\n";
    pdf += "startxref\n" + xrefOffset + "\n";
    pdf += "%%EOF";
    
    return pdf;
  };
  
  // Update the export documents function to create a ZIP
  const exportDocuments = () => {
    // Show loading spinner
    showNotification('info', 'Exporting Documents', 'Preparing documents for export...');
    
    // Create a ZIP file with document content
    setTimeout(() => {
      try {
        // Create document data (using JSZip library simulation)
        const mockDocuments = [
          ...newPreparedDocs.map(doc => ({
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type || 'Unspecified',
            status: doc.status,
            content: generateMockDocumentContent(doc)
          })),
          ...signedDocs.map(doc => ({
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type || 'Unspecified',
            status: 'Signed',
            content: generateMockDocumentContent(doc)
          }))
        ];
        
        // Create a manifest file
        const manifest = {
          patientId: patientInfo.id,
          patientName: patientInfo.name,
          exportDate: new Date().toISOString(),
          documents: mockDocuments.map(doc => ({
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type,
            status: doc.status
          }))
        };
        
        // Convert manifest to JSON
        const manifestJson = JSON.stringify(manifest, null, 2);
        
        // Create ZIP content (simulating JSZip usage)
        const zipContent = createZIPArchive(mockDocuments, manifestJson);
        
        // Create a Blob for the ZIP
        const zipBlob = new Blob([zipContent], { type: 'application/zip' });
        const zipUrl = URL.createObjectURL(zipBlob);
        
        // Create a download link for the ZIP
        const zipLink = document.createElement('a');
        zipLink.href = zipUrl;
        zipLink.download = `patient_${patientInfo.id}_documents_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(zipLink);
        
        // Click to download
        zipLink.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(zipLink);
          URL.revokeObjectURL(zipUrl);
          
          showNotification('success', 'Export Complete', 'Documents have been exported successfully!');
        }, 1000);
      } catch (error) {
        console.error("Error exporting documents:", error);
        showNotification('error', 'Export Failed', 'Failed to export documents. Please try again.');
      }
    }, 2000);
  };
  
  // Function to create ZIP archive content
  const createZIPArchive = (documents, manifestJson) => {
    // This function simulates creating a ZIP using JSZip
    // In a real implementation, you would use JSZip library
    
    // Create a binary representation of a simple ZIP
    // This is a simplified approach for simulation - not a real ZIP format
    
    // ZIP signature and headers
    const zipHeader = "PK\x03\x04";
    
    // Start with manifest.json
    let zipContent = zipHeader + "manifest.json\n" + manifestJson + "\n";
    
    // Add each document to the ZIP
    documents.forEach(doc => {
      const fileName = doc.fileName.replace(/\s+/g, '_');
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      if (fileExtension === 'pdf') {
        // Add PDF file
        zipContent += zipHeader + fileName + "\n" + createSimplePDF(doc.content) + "\n";
      } else if (fileExtension === 'docx') {
        // Add DOCX file
        zipContent += zipHeader + fileName + "\n" + createSimpleDocx(doc.content) + "\n";
      } else {
        // Add text file
        zipContent += zipHeader + fileName + "\n" + doc.content + "\n";
      }
    });
    
    // Add a readme file to explain the export
    const readme = `PATIENT DOCUMENTS EXPORT
    
Patient: ${patientInfo.name}
ID: ${patientInfo.id}
Export Date: ${new Date().toLocaleDateString()}

This ZIP archive contains the following:
- manifest.json: A file with metadata about all documents
- Document files: Each document exported from the patient's record

Total documents: ${documents.length}
`;
    
    zipContent += zipHeader + "README.txt\n" + readme + "\n";
    
    return zipContent;
  };
  
  // Helper function to create a simple PDF representation
  const createSimplePDF = (content) => {
    // Create a simplified PDF structure
    let pdf = "%PDF-1.3\n";
    pdf += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    pdf += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    pdf += "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n";
    pdf += "4 0 obj\n<< /Font << /F1 6 0 R >> >>\nendobj\n";
    
    // Convert content to PDF format
    const pdfContent = "BT\n/F1 12 Tf\n72 720 Td\n";
    
    // Split content into lines and add to PDF
    const lines = content.split('\n');
    let pdfLines = "";
    let y = 0;
    
    lines.forEach((line, index) => {
      if (index > 0) {
        y -= 15;
        pdfLines += "0 " + y + " Td\n";
      }
      pdfLines += "(" + line.replace(/[()\\]/g, '\\$&') + ") Tj\n";
    });
    
    pdfLines += "ET\n";
    
    // Add content to PDF
    pdf += "5 0 obj\n<< /Length " + pdfLines.length + " >>\nstream\n" + pdfLines + "endstream\nendobj\n";
    
    // Add font
    pdf += "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
    
    // Add cross-reference table
    pdf += "xref\n0 7\n0000000000 65535 f\n";
    
    // Add trailer
    pdf += "trailer\n<< /Size 7 /Root 1 0 R >>\n";
    pdf += "startxref\n100\n";
    pdf += "%%EOF";
    
    return pdf;
  };
  
  // Helper function to create a simple DOCX representation
  const createSimpleDocx = (content) => {
    // Create a simplified DOCX structure (just for simulation)
    // In reality, DOCX is a ZIP file with XML content
    let docx = "DOCX-SIMULATION\n";
    docx += "Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\n\n";
    docx += content;
    return docx;
  };
  
  // Add helper function to generate mock document content
  const generateMockDocumentContent = (doc) => {
    let content = '';
    
    if (doc.type === 'Evaluation' || doc.type === 'Re-evaluation') {
      content = `PATIENT EVALUATION REPORT\n`;
      content += `=============================================\n`;
      content += `Patient: ${patientInfo.name}\n`;
      content += `DOB: ${formatDate(patientInfo.dob)}\n`;
      content += `Evaluation Date: ${formatDate(doc.receivedDate || doc.signedDate)}\n`;
      content += `Document ID: ${doc.id}\n\n`;
      
      content += `SUBJECTIVE:\n`;
      content += `Patient presents with complaints of generalized pain and discomfort.\n`;
      content += `History shows ${patientInfo.primaryDiagnosis}.\n\n`;
      
      content += `OBJECTIVE:\n`;
      content += `- Blood Pressure: 130/85 mmHg\n`;
      content += `- Heart Rate: 72 bpm\n`;
      content += `- Respiratory Rate: 16 breaths/min\n`;
      content += `- Temperature: 98.6°F\n\n`;
      
      content += `ASSESSMENT:\n`;
      content += `Patient shows signs consistent with ${patientInfo.primaryDiagnosis}.\n`;
      content += `Secondary concerns include ${patientInfo.secondaryDiagnosis}.\n\n`;
      
      content += `PLAN:\n`;
      content += `1. Continue current medication regimen\n`;
      content += `2. Physical therapy twice weekly\n`;
      content += `3. Follow-up in 2 weeks\n\n`;
      
      if (doc.status === 'Signed') {
        content += `SIGNED BY: ${doc.signedBy || 'Provider'}\n`;
        content += `DATE: ${formatDate(doc.signedDate)}\n`;
      }
    } else if (doc.type === 'Position Order') {
      content = `PHYSICIAN ORDER\n`;
      content += `=============================================\n`;
      content += `Patient: ${patientInfo.name}\n`;
      content += `DOB: ${formatDate(patientInfo.dob)}\n`;
      content += `Date: ${formatDate(doc.receivedDate || doc.signedDate)}\n`;
      content += `Document ID: ${doc.id}\n\n`;
      
      content += `The following services are ordered for the above patient:\n\n`;
      content += `1. Physical Therapy: 2 times per week for 6 weeks\n`;
      content += `2. Occupational Therapy: 1 time per week for 4 weeks\n`;
      content += `3. Home Health Aide: 3 times per week for 6 weeks\n\n`;
      
      content += `DIAGNOSIS: ${patientInfo.primaryDiagnosis}\n\n`;
      content += `ADDITIONAL INSTRUCTIONS:\n`;
      content += `Patient to be monitored for pain levels and progress.\n\n`;
      
      if (doc.status === 'Signed') {
        content += `SIGNED BY: ${doc.signedBy || 'Provider'}\n`;
        content += `DATE: ${formatDate(doc.signedDate)}\n`;
      }
    } else {
      // Generic document content
      content += `This is a mock document for demonstration purposes.\n\n`;
      content += `It contains example text related to patient ${patientInfo.name}.\n`;
      content += `Generated for document ID ${doc.id}.\n\n`;
      content += `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisi ut aliquam facilisis, nisl ipsum ultricies nunc, ut aliquam nisl nunc eu nisl. Sed euismod, nisl ut aliquam facilisis, nisl ipsum ultricies nunc, ut aliquam nisl nunc eu nisl.\n\n`;
      
      if (doc.status === 'Signed') {
        content += `SIGNED BY: ${doc.signedBy || 'Provider'}\n`;
        content += `DATE: ${formatDate(doc.signedDate)}\n`;
      }
    }
    
    return content;
  };

  // New state for episodes, cpo data and document handling
  const [episodes, setEpisodes] = useState(generateEpisodeData());
  const [monthlyCPOData, setMonthlyCPOData] = useState(generateMonthlyCPOData());
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [episodeFilterDates, setEpisodeFilterDates] = useState({ start: '', end: '' });
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  const [cpoMinutesEditing, setCpoMinutesEditing] = useState(null);
  const [documentCategories, setDocumentCategories] = useState(['Evaluation', 'Treatment', 'Assessment', 'Plan of Care']);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [currentEpisodeDocuments, setCurrentEpisodeDocuments] = useState([]);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [newEpisodeData, setNewEpisodeData] = useState({
    startDate: '',
    socDate: '',
    endDate: '',
    status: 'active',
    diagnosis: '',
    provider: '',
    notes: ''
  });
  const [timelineZoomLevel, setTimelineZoomLevel] = useState(1); // Default zoom level
  
  // Initialize filtered episodes
  useEffect(() => {
    setFilteredEpisodes(episodes);
    // Set the most recent episode as active by default
    if (episodes.length > 0) {
      setActiveEpisode(episodes[episodes.length - 1].id);
    }
  }, [episodes]);
  
  // Apply episode filters when date range changes
  useEffect(() => {
    const filtered = filterEpisodesByDateRange(episodes, episodeFilterDates.start, episodeFilterDates.end);
    setFilteredEpisodes(filtered);
  }, [episodeFilterDates, episodes]);
  
  // Updated filter function to properly filter by date
  const handleEpisodeDateFilterChange = (field, value) => {
    setEpisodeFilterDates(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add function to handle episode selection
  const handleEpisodeSelect = (episodeId) => {
    setActiveEpisode(episodeId);
    
    // If the episode is already expanded, collapse it
    if (expandedEpisode === episodeId) {
      setExpandedEpisode(null);
    } else {
      setExpandedEpisode(episodeId);
    }
  };
  
  // Add function to handle adding a new episode
  const handleAddEpisode = () => {
    // Reset form data
    setNewEpisodeData({
      startDate: new Date().toISOString().split('T')[0],
      socDate: '',
      endDate: '',
      status: 'active',
      diagnosis: '',
      provider: '',
      notes: ''
    });
    setEditingEpisode(null);
    setShowEpisodeModal(true);
  };
  
  // Add function to save a new episode
  const handleSaveEpisode = () => {
    if (editingEpisode) {
      // Update existing episode
      setEpisodes(episodes.map(ep => 
        ep.id === editingEpisode.id 
          ? { ...ep, ...newEpisodeData } 
          : ep
      ));
      showNotification('success', 'Episode Updated', 'Episode has been updated successfully.');
    } else {
      // Create new episode
      const newEpisode = {
        ...newEpisodeData,
        id: episodes.length > 0 ? Math.max(...episodes.map(e => e.id)) + 1 : 1,
        documents: []
      };
      setEpisodes([...episodes, newEpisode]);
      showNotification('success', 'Episode Added', 'A new episode has been added successfully.');
    }
    setShowEpisodeModal(false);
  };
  
  // Add function to edit an episode
  const handleEditEpisode = (episodeId) => {
    const episode = episodes.find(ep => ep.id === episodeId);
    if (!episode) return;
    
    setEditingEpisode(episode);
    setNewEpisodeData({
      startDate: episode.startDate,
      socDate: episode.socDate,
      endDate: episode.endDate,
      status: episode.status,
      diagnosis: episode.diagnosis,
      provider: episode.provider,
      notes: episode.notes || ''
    });
    setShowEpisodeModal(true);
  };
  
  // Add function to handle input changes for episode form
  const handleEpisodeInputChange = (field, value) => {
    setNewEpisodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add function to view episode documents
  const handleViewEpisodeDocuments = (episodeId) => {
    const episode = episodes.find(ep => ep.id === episodeId);
    if (!episode) return;
    
    setCurrentEpisodeDocuments(episode.documents || []);
    setShowDocumentsModal(true);
  };
  
  // Add function to add a document to an episode
  const handleAddDocumentToEpisode = (episodeId, documentType) => {
    const date = new Date();
    const newDoc = {
      id: `DOC-EP${episodeId}-${Date.now().toString().slice(-4)}`,
      type: documentType,
      fileName: `${documentType.toLowerCase().replace(/\s/g, '_')}_episode${episodeId}.pdf`,
      createdDate: date.toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      status: 'New'
    };
    
    setEpisodes(episodes.map(ep => 
      ep.id === episodeId 
        ? { ...ep, documents: [...(ep.documents || []), newDoc] } 
        : ep
    ));
    
    if (episodeId === expandedEpisode) {
      setCurrentEpisodeDocuments(prev => [...prev, newDoc]);
    }
    
    showNotification('success', 'Document Added', `${documentType} document has been added to Episode ${episodeId}.`);
  };
  
  const handleSignDocument = useCallback((docId) => {
    // First check if the document exists and is prepared
    const docToSign = newPreparedDocs.find(doc => doc.id === docId);
    
    if (!docToSign) {
      showNotification('error', 'Sign Failed', 'Document not found');
      return;
    }
    
    if (docToSign.status !== 'Prepared') {
      showNotification('warning', 'Not Ready', 'Document must be marked as Prepared before signing');
      return;
    }
    
    if (!docToSign.type) {
      showNotification('warning', 'Type Required', 'Please select a document type before signing');
      return;
    }
    
    // Show signing in progress notification
    showNotification('info', 'Signing Document', 'Processing signature...');
    
    // Simulate a delay for document signing
    setTimeout(() => {
      moveToSigned(docId);
    }, 1500);
  }, [newPreparedDocs, showNotification, moveToSigned]);
  
  // Add function to update document type
  const handleUpdateDocumentType = (docId, isNew, newType) => {
    if (isNew) {
      setNewPreparedDocs(prev => 
        prev.map(doc => 
          doc.id === docId ? { ...doc, type: newType } : doc
        )
      );
    } else {
      setSignedDocs(prev => 
        prev.map(doc => 
          doc.id === docId ? { ...doc, type: newType } : doc
        )
      );
    }
  };
  
  // Add function to filter documents by type
  const handleFilterDocumentsByType = (type) => {
    if (type === 'all') {
      setNewPreparedDocs(newPreparedDocs);
      setSignedDocs(signedDocs);
      return;
    }
    
    const filteredNewPrepared = newPreparedDocs.filter(doc => doc.type === type);
    const filteredSigned = signedDocs.filter(doc => doc.type === type);
    
    setNewPreparedDocs(filteredNewPrepared);
    setSignedDocs(filteredSigned);
  };

  // Add function to update CPO minutes for a month
  const handleUpdateCPOMinutes = (monthIndex, newMinutes) => {
    if (isNaN(newMinutes) || newMinutes < 0) return;
    
    const updatedCPOData = [...monthlyCPOData];
    updatedCPOData[monthIndex] = {
      ...updatedCPOData[monthIndex],
      minutes: newMinutes
    };
    
    setMonthlyCPOData(updatedCPOData);
    setCpoMinutesEditing(null);
    
    // Update total CPO minutes in patient info
    const totalMinutes = updatedCPOData.reduce((sum, month) => sum + month.minutes, 0);
    setPatientInfo(prev => ({
      ...prev,
      cpoMinsCaptured: totalMinutes
    }));
  };
  
  // Add function to add new document to signed or unsigned list
  const handleAddDocument = (category, isNew = true) => {
    const today = new Date().toISOString().split('T')[0];
    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-6)}`,
      type: category,
      status: isNew ? 'New' : 'Prepared',
      receivedDate: today,
      fileName: `${category.toLowerCase().replace(/\s/g, '_')}_${today}.pdf`,
      size: '0.8 MB',
      uploadedBy: 'Current User'
    };
    
    setNewPreparedDocs(prev => [...prev, newDoc]);
    
    // Update notification
    showNotification('success', 'Document Added', `New ${category} document has been added to the list.`);
  };

  // Add this function to handle document download
  const handleDownloadDocument = useCallback((doc) => {
    showNotification('info', 'Downloading Document', `Preparing ${doc.fileName} for download...`);
    
    // If we have the actual file object from an upload, download it directly
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification('success', 'Download Complete', `${doc.fileName} has been downloaded.`);
      }, 100);
      return;
    }
    
    // Simulate file download delay for demo files
    setTimeout(() => {
      // Create sample content based on document type
      const docContent = generateMockDocumentContent(doc);
      
      // Create a Blob with the content
      let mimeType = 'text/plain';
      if (doc.fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (doc.fileName.endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      
      const blob = new Blob([docContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      
      // Click the link to trigger download
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('success', 'Download Complete', `${doc.fileName} has been downloaded.`);
      }, 100);
    }, 1500);
  }, [showNotification]);

  // Update calculateCPOMinutes function to call it when needed (like in useEffect)
  useEffect(() => {
    // Call calculateCPOMinutes when component mounts or cpoDocs changes
    calculateCPOMinutes();
  }, [cpoDocs]);

  // Add function to export CPO report
  const exportCPOReport = () => {
    showNotification('info', 'Generating CPO Report', 'Preparing CPO report for export...');
    
    setTimeout(() => {
      try {
        // Create report data
        const reportData = {
          patientInfo: {
            id: patientInfo.id,
            name: patientInfo.name,
            dob: formatDate(patientInfo.dob),
            provider: patientInfo.primaryPhysician || 'Not assigned'
          },
          cpoSummary: {
            totalMinutes: patientInfo.cpoMinsCaptured,
            documentsCount: cpoDocs.length,
            calculationDate: new Date().toLocaleDateString()
          },
          documents: cpoDocs.map(doc => ({
            id: doc.id,
            fileName: doc.fileName,
            type: doc.type,
            creationDate: formatDate(doc.creationDate),
            size: doc.size
          })),
          monthlyCPOData: monthlyCPOData
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(reportData, null, 2);
        
        // Create PDF-like content
        const pdfContent = createCPOReportPDF(reportData);
        
        // Create a blob with the PDF data
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `patient_${patientInfo.id}_cpo_report_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        
        // Click the link to trigger download
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          showNotification('success', 'CPO Report Generated', 'CPO report has been downloaded successfully!');
        }, 100);
      } catch (error) {
        console.error("Error generating CPO report:", error);
        showNotification('error', 'Report Generation Failed', 'Failed to generate CPO report. Please try again.');
      }
    }, 1000);
  };

  // Function to create a CPO report PDF
  const createCPOReportPDF = (reportData) => {
    // Create a simplified PDF structure similar to createPDFReport function
    const pdfHeader = "%PDF-1.3\n";
    
    // Add metadata
    let pdf = pdfHeader;
    pdf += "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    pdf += "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    pdf += "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n";
    pdf += "4 0 obj\n<< /Font << /F1 6 0 R >> >>\nendobj\n";
    
    // Create the actual content
    let content = "BT\n/F1 12 Tf\n72 720 Td\n(CPO REPORT) Tj\n";
    content += "0 -20 Td\n(Patient: " + reportData.patientInfo.name + ") Tj\n";
    content += "0 -20 Td\n(ID: " + reportData.patientInfo.id + ") Tj\n";
    content += "0 -20 Td\n(Date of Birth: " + reportData.patientInfo.dob + ") Tj\n";
    content += "0 -20 Td\n(Generated Date: " + new Date().toLocaleDateString() + ") Tj\n";
    
    // CPO Summary
    content += "0 -40 Td\n(CPO SUMMARY) Tj\n";
    content += "0 -20 Td\n(Total CPO Minutes: " + reportData.cpoSummary.totalMinutes + ") Tj\n";
    content += "0 -20 Td\n(Documents Count: " + reportData.cpoSummary.documentsCount + ") Tj\n";
    content += "0 -20 Td\n(Calculation Date: " + reportData.cpoSummary.calculationDate + ") Tj\n";
    
    // Document List
    content += "0 -40 Td\n(CPO DOCUMENT LIST) Tj\n";
    
    let y = -20;
    reportData.documents.forEach((doc, index) => {
      content += "0 " + y + " Td\n(" + (index + 1) + ". " + doc.fileName + 
                " - Created on " + doc.creationDate + " - " + doc.type + ") Tj\n";
      y = -15;
    });
    
    // Monthly CPO Data
    content += "0 -40 Td\n(MONTHLY CPO DISTRIBUTION) Tj\n";
    
    y = -20;
    reportData.monthlyCPOData.forEach((month) => {
      if (month.minutes > 0) {
        content += "0 " + y + " Td\n(" + month.month + ": " + month.minutes + " minutes) Tj\n";
        y = -15;
      }
    });
    
    content += "ET\n";
    
    // Add content to PDF
    pdf += "5 0 obj\n<< /Length " + content.length + " >>\nstream\n" + content + "endstream\nendobj\n";
    
    // Add font
    pdf += "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
    
    // Add cross-reference table
    const xrefOffset = pdf.length;
    pdf += "xref\n0 7\n0000000000 65535 f\n";
    
    // Add trailer
    pdf += "trailer\n<< /Size 7 /Root 1 0 R >>\n";
    pdf += "startxref\n" + xrefOffset + "\n";
    pdf += "%%EOF";
    
    return pdf;
  };

  // Function to calculate duration between two dates
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Function to calculate days between SOC and start date
  const calculateDaysBetween = (socDate, startDate) => {
    if (!socDate || !startDate) return 0;
    const startDateObj = new Date(startDate);
    const socDateObj = new Date(socDate);
    const diffTime = Math.abs(startDateObj - socDateObj);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle timeline zoom functionality
  const handleTimelineZoom = (action) => {
    switch (action) {
      case 'in':
        setTimelineZoomLevel(prev => Math.min(prev + 0.25, 2.5));
        document.documentElement.style.setProperty('--timeline-zoom', timelineZoomLevel + 0.25);
        break;
      case 'out':
        setTimelineZoomLevel(prev => Math.max(prev - 0.25, 0.5));
        document.documentElement.style.setProperty('--timeline-zoom', timelineZoomLevel - 0.25);
        break;
      case 'reset':
        setTimelineZoomLevel(1);
        document.documentElement.style.setProperty('--timeline-zoom', 1);
        break;
      default:
        break;
    }
  };

  // Apply zoom level when it changes
  useEffect(() => {
    document.documentElement.style.setProperty('--timeline-zoom', timelineZoomLevel);
  }, [timelineZoomLevel]);

  const [activeDocTab, setActiveDocTab] = useState('new');
  
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to handle signed document uploads
  const handleSignedDocumentUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Show uploading notification
    showNotification('info', 'Uploading Signed Documents', 'Your signed documents are being uploaded...');
    
    // Process the files
    Array.from(files).forEach(file => {
      const newSignedDoc = {
        id: `DOC-SIGNED-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
        type: 'Signed Document',
        fileName: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        signedDate: new Date().toISOString().split('T')[0],
        signedBy: 'Current User',
        file: file // Store the actual file for potential preview
      };
      
      // Add to signed documents
      setSignedDocs(prev => [...prev, newSignedDoc]);
    });
    
    // Clear file input
    if (e.target) {
      e.target.value = '';
    }
    
    showNotification('success', 'Upload Complete', 'Signed documents have been uploaded successfully');
  };

  const handleDateChange = (date, field) => {
    setDateRange(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Update your existing filter state/logic here
    const formattedDate = date ? date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-') : '';
    
    handleFilterChange(field === 'startDate' ? 'fromDate' : 'toDate', formattedDate);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="patient-detail-view">
      <div className="detail-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft className="back-icon" />
          Back to Patients
        </button>
        <div className="patient-header-info">
          <h2 className="patient-name">
            <FaUserCircle className="patient-icon" />
            {patientInfo.name}
            <span className={`status-pill ${patientInfo.status || 'active'}`}>
              {getStatusIcon(patientInfo.status)}
              {patientInfo.status ? 
                patientInfo.status.charAt(0).toUpperCase() + patientInfo.status.slice(1) : 
                'Active'
              }
            </span>
          </h2>
          <div className="patient-meta">
            <div className="patient-meta-item">
              <FaIdCard className="meta-icon" />
              ID: {patientInfo.id}
            </div>
            <div className="patient-meta-item">
              <FaCalendarAlt className="meta-icon" />
              DoB: {formatDate(patientInfo.dob)}
            </div>
            <div className="patient-meta-item">
              <FaUser className="meta-icon" />
              {patientInfo.gender}
            </div>
            <div className="patient-meta-item">
              <FaPhone className="meta-icon" />
              {patientInfo.phone}
            </div>
            <div className={`ehr-status ${patientInfo.hasEHR ? 'present' : 'absent'}`}>
              <FaFileMedicalAlt className="ehr-icon" />
              EHR: {patientInfo.hasEHR ? 'Present' : 'Not Available'}
            </div>
          </div>
        </div>
        <div className="patient-quick-actions">
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'patientInfo' ? 'active' : ''}`}
          onClick={() => setActiveTab('patientInfo')}
        >
          <FaUserCircle className="tab-icon" />
          Patient Info
        </button>
        <button 
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <FaHistory className="tab-icon" />
          Patient Timeline
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FaFileAlt className="tab-icon" />
          Documents
          {documentCounts.new > 0 && (
            <span className="tab-badge new">{documentCounts.new}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'cpo' ? 'active' : ''}`}
          onClick={() => setActiveTab('cpo')}
        >
          <FaFileMedical className="tab-icon" />
          CPO
        </button>
      </div>
      
      {/* Patient Info Tab */}
      {activeTab === 'patientInfo' && (
        <div className="tab-content animate-fade-in">
          <div className="info-header">
            <h3>
              <FaUserCircle className="header-icon" />
              Patient Information
            </h3>
            <div className="info-actions">
              {isEditing ? (
                <div className="button-group">
                  <button className="action-button save" onClick={savePatientInfo}>
                    <FaSave className="action-icon" />
                    Save Changes
                  </button>
                  <button className="action-button cancel" onClick={() => setIsEditing(false)}>
                    <FaTimes className="action-icon" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="action-button edit" onClick={() => setIsEditing(true)}>
                  <span className="icon-wrapper">
                    <span className="material-icons">edit</span>
                  </span>
                  Edit Patient Information
                </button>
              )}
            </div>
          </div>
          
          <div className="patient-info-card">
            <div className="info-section">
              <h3>
                <FaUser className="section-icon" />
                Patient Details
                <span className="section-badge">Basic Information</span>
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    SOC Date:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.admissionDate} 
                      onChange={(e) => handleInfoChange('admissionDate', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{formatDate(patientInfo.admissionDate)}</span>
                  )}
            </div>
            
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    From Date:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.episodeFrom} 
                      onChange={(e) => handleInfoChange('episodeFrom', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{formatDate(patientInfo.episodeFrom)}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    To Date:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.episodeTo} 
                      onChange={(e) => handleInfoChange('episodeTo', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{formatDate(patientInfo.episodeTo)}</span>
                  )}
            </div>
            
                <div className="info-item">
                  <label>
                    <FaHeartbeat className="field-icon" />
                    Primary Diagnosis:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.primaryDiagnosis} 
                      onChange={(e) => handleInfoChange('primaryDiagnosis', e.target.value)}
                      className="info-input"
                      placeholder="Enter primary diagnosis"
                    />
                  ) : (
                    <span className="diagnosis primary">{patientInfo.primaryDiagnosis}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaHeartbeat className="field-icon" />
                    Secondary Diagnosis:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.secondaryDiagnosis} 
                      onChange={(e) => handleInfoChange('secondaryDiagnosis', e.target.value)}
                      className="info-input"
                      placeholder="Enter secondary diagnosis"
                    />
                  ) : (
                    <span className="diagnosis secondary">{patientInfo.secondaryDiagnosis}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaBuilding className="field-icon" />
                    Insurance:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.insurance} 
                      onChange={(e) => handleInfoChange('insurance', e.target.value)}
                      className="info-input"
                      placeholder="Enter insurance"
                    />
                  ) : (
                    <span>{patientInfo.insurance}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaFileSignature className="field-icon" />
                    Cert Document Status:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.certStatus} 
                      onChange={(e) => handleInfoChange('certStatus', e.target.value)}
                      className="info-select"
                    >
                      <option value="Document not received">Document not received</option>
                      <option value="Document Prepared">Document Prepared</option>
                      <option value="Document Signed">Document Signed</option>
                      <option value="Document Billed">Document Billed</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${patientInfo.certStatus === 'Document Signed' || patientInfo.certStatus === 'Document Billed' ? 'signed' : 'unsigned'}`}>
                      {patientInfo.certStatus === 'Document Signed' || patientInfo.certStatus === 'Document Billed' ? 
                        <FaCheckCircle className="status-icon" /> : 
                        <FaTimesCircle className="status-icon" />
                      }
                      {patientInfo.certStatus}
                        </span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaFileSignature className="field-icon" />
                    Recert Document Status:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.recertStatus} 
                      onChange={(e) => handleInfoChange('recertStatus', e.target.value)}
                      className="info-select"
                    >
                      <option value="Document not received">Document not received</option>
                      <option value="Document Prepared">Document Prepared</option>
                      <option value="Document Signed">Document Signed</option>
                      <option value="Document Billed">Document Billed</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${patientInfo.recertStatus === 'Document Signed' || patientInfo.recertStatus === 'Document Billed' ? 'signed' : 'unsigned'}`}>
                      {patientInfo.recertStatus === 'Document Signed' || patientInfo.recertStatus === 'Document Billed' ? 
                        <FaCheckCircle className="status-icon" /> : 
                        <FaTimesCircle className="status-icon" />
                      }
                      {patientInfo.recertStatus}
                        </span>
                  )}
            </div>
            
                <div className="info-item">
                  <label>
                    <FaUserCheck className="field-icon" />
                    F2F Eligibility:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.f2fEligibility} 
                      onChange={(e) => handleInfoChange('f2fEligibility', e.target.value)}
                      className="info-select"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <span>{patientInfo.f2fEligibility === 'yes' ? 'Yes' : 'No'}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaFileMedicalAlt className="field-icon" />
                    Present in EHR:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.hasEHR ? 'yes' : 'no'} 
                      onChange={(e) => handleInfoChange('hasEHR', e.target.value === 'yes')}
                      className="info-select"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <span>{patientInfo.hasEHR ? 'Yes' : 'No'}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaUserMd className="field-icon" />
                    Rendering Provider:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.renderingPractitioner} 
                      onChange={(e) => handleInfoChange('renderingPractitioner', e.target.value)}
                      className="info-input"
                      placeholder="Enter rendering provider"
                    />
                  ) : (
                    <span>{patientInfo.renderingPractitioner}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaUserMd className="field-icon" />
                    Physician:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.primaryPhysician} 
                      onChange={(e) => handleInfoChange('primaryPhysician', e.target.value)}
                      className="info-input"
                      placeholder="Enter physician name"
                    />
                  ) : (
                    <span>{patientInfo.primaryPhysician}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaHospital className="field-icon" />
                    HHAH:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.hhah} 
                      onChange={(e) => handleInfoChange('hhah', e.target.value)}
                      className="info-input"
                      placeholder="Enter HHAH"
                    />
                  ) : (
                    <span>{patientInfo.hhah}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaClock className="field-icon" />
                    CPO Minutes:
                  </label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={patientInfo.cpoMinsCaptured} 
                      onChange={(e) => handleInfoChange('cpoMinsCaptured', parseInt(e.target.value) || 0)}
                      className="info-input"
                      placeholder="Enter CPO minutes"
                      min="0"
                    />
                  ) : (
                    <div className="cpo-minutes-display">
                      <span>{patientInfo.cpoMinsCaptured} minutes</span>
                    </div>
                  )}
                </div>
                
                <div className="info-item full-width">
                  <label>
                    <FaMapMarkerAlt className="field-icon" />
                    Patient Address:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.address} 
                      onChange={(e) => handleInfoChange('address', e.target.value)}
                      className="info-input"
                      placeholder="Enter patient address"
                    />
                  ) : (
                    <span>{patientInfo.address}</span>
                  )}
                </div>
                
                <div className="info-item">
                  <label>
                    <FaPhone className="field-icon" />
                    Patient Contact:
                  </label>
                  {isEditing ? (
                    <input 
                      type="tel" 
                      value={patientInfo.phone} 
                      onChange={(e) => handleInfoChange('phone', e.target.value)}
                      className="info-input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span>{patientInfo.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Patient Timeline Tab with enhanced functionality */}
      {activeTab === 'timeline' && (
        <div className="tab-content animate-fade-in">
          <div className="timeline-container">
            <div className="timeline-header">
              <h3>
                <FaHistory className="section-icon" />
                Patient Timeline
              </h3>
              
              {/* Add episode filter controls */}
              <div className="timeline-filters">
                <div className="date-filter">
                  <label>Filter episodes:</label>
                  <div className="filter-inputs">
                    <input 
                      type="date" 
                      value={episodeFilterDates.start}
                      onChange={(e) => handleEpisodeDateFilterChange('start', e.target.value)}
                      placeholder="Start date"
                      className="date-input"
                    />
                    <span className="date-separator">to</span>
                    <input 
                      type="date" 
                      value={episodeFilterDates.end}
                      onChange={(e) => handleEpisodeDateFilterChange('end', e.target.value)}
                      placeholder="End date"
                      className="date-input"
                    />
                    <button 
                      className="filter-reset-button"
                      onClick={() => setEpisodeFilterDates({ start: '', end: '' })}
                    >
                      <FaTimes className="reset-icon" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Episode Timeline Section with expandable episodes */}
            <div className="timeline-section">
              <div className="section-header">
                <h4 className="timeline-section-title">
                  <FaCalendar className="section-icon" />
                  Episode Timeline
                </h4>
                <button 
                  className="action-button secondary small"
                  onClick={handleAddEpisode}
                >
                  <FaPlus className="action-icon" />
                  Add Episode
                </button>
              </div>
                    
              <div className="episode-timeline-wrapper">
                <div className="episode-timeline">
                  {filteredEpisodes.length > 0 ? (
                    filteredEpisodes.map((episode) => (
                      <div 
                        key={episode.id}
                        className={`timeline-episode ${activeEpisode === episode.id ? 'active' : ''} ${expandedEpisode === episode.id ? 'expanded' : ''}`}
                        onClick={() => handleEpisodeSelect(episode.id)}
                      >
                        <div className="episode-header">
                          <div className="episode-title">
                            <h5>Episode {episode.id}</h5>
                            <span className={`episode-status ${episode.status}`}>{episode.status}</span>
                          </div>
                          <div className="episode-expand-icon">
                            {expandedEpisode === episode.id ? 
                              <FaChevronDown className="expand-icon" /> : 
                              <FaChevronRight className="expand-icon" />
                            }
                          </div>
                        </div>
                      
                        <div className="episode-date">
                          <div className="episode-marker soc">
                            <div className="marker-icon">
                              <FaCircle />
                            </div>
                            <div className="marker-label">SOC</div>
                          </div>
                          <div className="episode-line soc-to-from"></div>
                          <div className="episode-marker start">
                            <div className="marker-icon">
                              <FaCircle />
                            </div>
                            <div className="marker-label">From</div>
                          </div>
                          <div className="episode-line from-to-end"></div>
                          <div className="episode-marker end">
                            <div className="marker-icon">
                              <FaCircle />
                            </div>
                            <div className="marker-label">End</div>
                          </div>
                        </div>
                      
                        <div className="episode-details">
                          <div className="episode-date-label soc">{formatDate(episode.socDate)}</div>
                          <div className="episode-date-label start">{formatDate(episode.startDate)}</div>
                          <div className="episode-date-label end">{formatDate(episode.endDate)}</div>
                        </div>
                      
                        {/* Additional episode details visible when expanded */}
                        {expandedEpisode === episode.id && (
                          <div className="episode-expanded-info">
                            <div className="episode-info-grid">
                              <div className="episode-info-item">
                                <label>Duration:</label>
                                <span>{calculateDuration(episode.startDate, episode.endDate)}</span>
                              </div>
                              <div className="episode-info-item">
                                <label>Days Before Episode Start:</label>
                                <span>{calculateDaysBetween(episode.socDate, episode.startDate)} days</span>
                              </div>
                              <div className="episode-info-item">
                                <label>Primary Diagnosis:</label>
                                <span>{episode.diagnosis}</span>
                              </div>
                              <div className="episode-info-item">
                                <label>Provider:</label>
                                <span>{episode.provider}</span>
                              </div>
                              {episode.notes && (
                                <div className="episode-info-item full-width">
                                  <label>Notes:</label>
                                  <span>{episode.notes}</span>
                                </div>
                              )}
                              <div className="episode-info-item">
                                <label>Documents:</label>
                                <span>{episode.documents ? episode.documents.length : 0} document(s)</span>
                              </div>
                            </div>
                  
                            <div className="episode-actions">
                              <button 
                                className="episode-action-button edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEpisode(episode.id);
                                }}
                              >
                                <FaEdit className="action-icon" />
                                Edit Episode
                              </button>
                              <button 
                                className="episode-action-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewEpisodeDocuments(episode.id);
                                }}
                              >
                                <FaFileMedicalAlt className="action-icon" />
                                View Documents
                              </button>
                              <button 
                                className="episode-action-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const type = prompt('Enter document type:', 'Evaluation');
                                  if (type) {
                                    handleAddDocumentToEpisode(episode.id, type);
                                  }
                                }}
                              >
                                <FaPlus className="action-icon" />
                                Add Document
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-episodes">
                      <p>No episodes found for the selected date range.</p>
                      <button 
                        className="action-button primary"
                        onClick={() => setEpisodeFilterDates({ start: '', end: '' })}
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* PG Services Timeline Section with editable CPO minutes */}
            <div className="timeline-section">
              <div className="section-header">
                <h4 className="timeline-section-title">
                  <FaFileMedical className="section-icon" />
                  PG Services
                </h4>
                <div className="cpo-total">
                  <span>Total CPO: {formatCPOMinutes(patientInfo.cpoMinsCaptured)}</span>
                            </div>
                          </div>
              
              <div className="pg-services-timeline">
                <div className="monthly-cpo-container">
                  {monthlyCPOData.map((month, index) => (
                    <div key={index} className="monthly-cpo-item">
                      <div className="month-label">{month.month}</div>
                      <div className="cpo-minutes-bar" onClick={() => setCpoMinutesEditing(index)}>
                        <div 
                          className="cpo-minutes-fill" 
                          style={{width: `${Math.min(100, (month.minutes / 150) * 100)}%`}}
                        ></div>
                        </div>

                      {cpoMinutesEditing === index ? (
                        <div className="cpo-minutes-edit">
                          <input 
                            type="number" 
                            value={month.minutes}
                            onChange={(e) => handleUpdateCPOMinutes(index, parseInt(e.target.value) || 0)}
                            className="cpo-minutes-input"
                            min="0"
                            max="300"
                            autoFocus
                            onBlur={() => setCpoMinutesEditing(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateCPOMinutes(index, parseInt(e.target.value) || 0);
                              } else if (e.key === 'Escape') {
                                setCpoMinutesEditing(null);
                              }
                            }}
                          />
                          <span className="cpo-minutes-label">min</span>
                          </div>
                      ) : (
                        <div className="cpo-minutes-value" onClick={() => setCpoMinutesEditing(index)}>
                          {month.minutes} min
                          <FaEdit className="edit-icon" />
                            </div>
                      )}
                              </div>
                  ))}
                              </div>
                            </div>
                          </div>
            
            {/* HHAH Services Timeline Section with document management */}
            <div className="timeline-sectionn">
              <div className="section-headerr">
                <h4 className="timeline-section-titlee">
                  <FaFileAlt className="section-iconn" />
                  HHAH Services
                </h4>
                <div className="document-actionss">
                  <div className="document-filterr">
                    <select 
                      className="document-type-filterr"
                      onChange={(e) => handleFilterDocumentsByType(e.target.value)}
                    >
                      <option value="all">All Document Types</option>
                      {documentCategories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    className="action-buttonn secondaryy"
                    onClick={() => {
                      // Show dropdown of document categories
                      const category = prompt('Select document category:', documentCategories.join(', '));
                      if (category && documentCategories.includes(category)) {
                        handleAddDocument(category);
                      }
                    }}
                  >
                    <FaPlus className="action-iconn" />
                    Add Document
                  </button>
                </div>
              </div>
                    
              <div className="hhah-services-timelinee">
                <div className="document-listingg">
                  {/* Document toolbar without upload button */}
                  <div className="document-toolbarr">
                    <div className="sort-controlss">
                      <span className="sort-labell">Sort by:</span>
                      <button 
                        className={`sort-button ${sortField === 'date' ? 'active' : ''}`} 
                        onClick={() => handleSortChange('date')}
                      >
                        Date {sortField === 'date' && (sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                      </button>
                      <button 
                        className={`sort-button ${sortField === 'type' ? 'active' : ''}`} 
                        onClick={() => handleSortChange('type')}
                      >
                        Type {sortField === 'type' && (sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                      </button>
                      <button 
                        className={`sort-button ${sortField === 'filename' ? 'active' : ''}`} 
                        onClick={() => handleSortChange('filename')}
                      >
                        Filename {sortField === 'filename' && (sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                      </button>
                    </div>
                  </div>
                  
                  {/* New & Prepared Documents Section */}
                  <div className="document-section">
                    <div className="section-header">
                      <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaFileAlt className="section-icon" />
                        New & Prepared Documents
                      </h4>
                    </div>
                    <div className="document-list">
                      {newPreparedDocs.length > 0 ? (
                        <table className="documents-table">
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left' }}>Document Type</th>
                              <th style={{ textAlign: 'left' }}>Document ID</th>
                              <th style={{ textAlign: 'left' }}>File Name</th>
                              <th style={{ textAlign: 'left' }}>Date Received</th>
                              <th style={{ textAlign: 'left' }}>Status</th>
                              <th style={{ textAlign: 'left' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newPreparedDocs.map((doc, index) => (
                              <tr key={index}>
                                <td style={{ textAlign: 'left' }}>
                                  <select 
                                    className="document-type-select"
                                    value={doc.type || ''}
                                    onChange={(e) => handleUpdateDocumentType(doc.id, true, e.target.value)}
                                  >
                                    <option value="">Select Type</option>
                                    {documentCategories.map((category, idx) => (
                                      <option key={idx} value={category}>{category}</option>
                                    ))}
                                  </select>
                                </td>
                                <td style={{ textAlign: 'left' }}>{doc.id}</td>
                                <td style={{ textAlign: 'left' }}>
                                  <div className="file-name-cell">
                                    <span className="file-icon-wrapper">
                                      {doc.fileName && doc.fileName.endsWith('.pdf') ? (
                                        <FaFilePdf className="file-icon pdf" />
                                      ) : doc.fileName && doc.fileName.endsWith('.docx') ? (
                                        <FaFileWord className="file-icon word" />
                                      ) : (
                                        <FaFile className="file-icon" />
                                      )}
                                    </span>
                                    {doc.fileName || 'Unnamed File'}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'left' }}>{formatDate(doc.receivedDate)}</td>
                                <td style={{ textAlign: 'left' }}>
                                  <span className={`status-badge ${doc.status === 'New' ? 'new' : 'prepared'}`}>
                                    {doc.status === 'New' ? 'New' : 'Prepared'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'left' }}>
                                  <div className="action-buttons">
                                    <button className="doc-action-btn view" title="View" onClick={() => openDocumentViewer(doc)}>
                                      <FaEye />
                                    </button>
                                    <button className="doc-action-btn download" title="Download" onClick={() => handleDownloadDocument(doc)}>
                                      <FaDownload />
                                    </button>
                                    <button className="doc-action-btn edit" title="Edit" onClick={() => handleSignDocument(doc.id)}>
                                      <FaEdit />
                                    </button>
                                    <button 
                                      className="doc-action-btn delete" 
                                      title="Delete" 
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this document?')) {
                                          setNewPreparedDocs(prev => prev.filter(d => d.id !== doc.id));
                                        }
                                      }}
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="no-documents">
                          <FaFileUpload className="no-documents-icon" />
                          <p>No new or prepared documents available.</p>
                          <p className="no-documents-hint">Contact administrator to add documents.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Signed Documents Section */}
                  <div className="document-section">
                    <div className="section-header">
                      <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCheckCircle className="section-icon" />
                        Signed Documents
                      </h4>
                    </div>
                    <div className="document-list">
                      {signedDocs.length > 0 ? (
                        <table className="documents-table">
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left' }}>Document Type</th>
                              <th style={{ textAlign: 'left' }}>Document ID</th>
                              <th style={{ textAlign: 'left' }}>File Name</th>
                              <th style={{ textAlign: 'left' }}>Date Signed</th>
                              <th style={{ textAlign: 'left' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {signedDocs.map((doc, index) => (
                              <tr key={index}>
                                <td style={{ textAlign: 'left' }}>{doc.type || 'Unspecified Document'}</td>
                                <td style={{ textAlign: 'left' }}>{doc.id}</td>
                                <td style={{ textAlign: 'left' }}>
                                  <div className="file-name-cell">
                                    <span className="file-icon-wrapper">
                                      {doc.fileName && doc.fileName.endsWith('.pdf') ? (
                                        <FaFilePdf className="file-icon pdf" />
                                      ) : doc.fileName && doc.fileName.endsWith('.docx') ? (
                                        <FaFileWord className="file-icon word" />
                                      ) : (
                                        <FaFile className="file-icon" />
                                      )}
                                    </span>
                                    {doc.fileName || 'Signed Document'}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'left' }}>{formatDate(doc.signedDate)}</td>
                                <td style={{ textAlign: 'left' }}>
                                  <div className="action-buttons">
                                    <button className="doc-action-btn view" title="View" onClick={() => openDocumentViewer(doc)}>
                                      <FaEye />
                                    </button>
                                    <button className="doc-action-btn download" title="Download" onClick={() => handleDownloadDocument(doc)}>
                                      <FaDownload />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="no-documents">
                          <FaFileSignature className="no-documents-icon" />
                          <p>No signed documents available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="documents-summary">
                    <div className="document-stats">
                      <div className="stat-item">
                        <span className="stat-value">{newPreparedDocs.length + signedDocs.length}</span>
                        <span className="stat-label">Total</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{newPreparedDocs.length}</span>
                        <span className="stat-label">New & Prepared</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{signedDocs.length}</span>
                        <span className="stat-label">Signed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="tab-content animate-fade-in">
          <div className="document-section">
            <div className="document-header">
              <h3>
                <FaFileAlt className="section-icon" />
                Patient Documents
                <span className="section-badge">
                  {documentCounts.total} Documents
                </span>
              </h3>
              <div className="document-actions" style={{ gap: '1rem', position: 'relative', alignItems: 'flex-start' }}>
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search documents..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button 
                    className="action-button filter"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters {fileTypes.length > 0 || dateRange.startDate ? `(${fileTypes.length + (dateRange.startDate ? 1 : 0)})` : ''}
                  </button>
                </div>
              </div>
            </div>
            <div className="pdv-doc-tabs-unique">
              <div className="pdv-doc-tabs-row-unique">
                <button 
                  className={`pdv-doc-tab-btn-unique${activeDocumentTab === 'newPrepared' ? ' active' : ''}`}
                  onClick={() => setActiveDocumentTab('newPrepared')}
                >
                  <FaFileAlt className="tab-icon" />
                  <span>New & Prepared</span>
                  <span className="pdv-doc-tab-count-unique">{documentCounts.new + documentCounts.prepared}</span>
                </button>
                <button 
                  className={`pdv-doc-tab-btn-unique${activeDocumentTab === 'signed' ? ' active' : ''}`}
                  onClick={() => setActiveDocumentTab('signed')}
                >
                  <FaFileSignature className="tab-icon" />
                  <span>Signed Documents</span>
                  <span className="pdv-doc-tab-count-unique">{documentCounts.signed}</span>
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="pdv-doc-filters-unique filter-section">
                <div className="pdv-doc-filter-group-unique">
                  <label className="pdv-doc-filter-label-unique">Document Status</label>
                  <div>
                    <label><input type="radio" name="status" checked={statusFilter === 'all'} onChange={() => setStatusFilter('all')} /> All</label>
                    <label><input type="radio" name="status" checked={statusFilter === 'new'} onChange={() => setStatusFilter('new')} /> New</label>
                    <label><input type="radio" name="status" checked={statusFilter === 'prepared'} onChange={() => setStatusFilter('prepared')} /> Prepared</label>
                  </div>
                </div>
                <div className="pdv-doc-filter-group-unique">
                  <label className="pdv-doc-filter-label-unique">File Type</label>
                  <div>
                    <label><input type="checkbox" checked={fileTypes.includes('pdf')} onChange={() => handleFileTypeFilter('pdf')} /> PDF</label>
                    <label><input type="checkbox" checked={fileTypes.includes('word')} onChange={() => handleFileTypeFilter('word')} /> Word</label>
                    <label><input type="checkbox" checked={fileTypes.includes('excel')} onChange={() => handleFileTypeFilter('excel')} /> Excel</label>
                    <label><input type="checkbox" checked={fileTypes.includes('image')} onChange={() => handleFileTypeFilter('image')} /> Images</label>
                  </div>
                </div>
                <div className="pdv-doc-filter-group-unique">
                  <span className="pdv-doc-filter-label-unique">Date Range</span>
                  <div>
                    <DatePicker
                      selected={dateRange.startDate}
                      onChange={(date) => handleDateChange(date, 'startDate')}
                      dateFormat="MM-dd-yyyy"
                      placeholderText="mm-dd-yyyy"
                      className="pdv-doc-date-input-unique"
                      isClearable
                      autoComplete="off"
                    />
                    <span>to</span>
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => handleDateChange(date, 'endDate')}
                      dateFormat="MM-dd-yyyy"
                      placeholderText="mm-dd-yyyy"
                      className="pdv-doc-date-input-unique"
                      isClearable
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="pdv-doc-filter-group-unique" style={{ flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
                  <button className="pdv-doc-filter-btn-unique pdv-doc-filter-reset-unique" onClick={resetFilters}>
                    <FaTimes style={{ marginRight: 4 }} /> Reset 
                  </button>
                  <button className="pdv-doc-filter-btn-unique" onClick={() => setShowFilters(false)}>
                    <FaCheck style={{ marginRight: 4 }} /> Apply
                  </button>
                </div>
              </div>
            )}
            
            <div className="document-table-container">
              {activeDocumentTab === 'newPrepared' ? (
                <>
                  <div className="upload-section">
                    <button 
                      className="action-button primary upload-button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <FaFileUpload className="button-icon" style={{ marginRight: '0.5rem' }} />
                      Upload New Documents
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden-file-input"
                      onChange={handleFileInputChange}
                      multiple
                      style={{ display: 'none' }}
                    />
                  </div>
                  {filteredNewPreparedDocs.length === 0 ? (
                    <div className="empty-state">
                      <FaFileAlt className="empty-icon" />
                      <h4>No Documents Found</h4>
                      <p>There are no new or prepared documents matching your current filters.</p>
                      <button 
                        className="action-button secondary"
                        onClick={resetFilters}
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <table className="document-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>Document Type</th>
                          <th style={{ textAlign: 'left' }}>Document ID</th>
                          <th style={{ textAlign: 'left' }}>File Name</th>
                          <th style={{ textAlign: 'left' }}>Date Received</th>
                          <th style={{ textAlign: 'left' }}>Status</th>
                          <th style={{ textAlign: 'left' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNewPreparedDocs.map(doc => (
                          <tr key={doc.id} className={`status-${doc.status.toLowerCase()}`}>
                            <td style={{ textAlign: 'left' }}>
                              <div className="select-wrapper">
                                <FaFileAlt className="select-icon" />
                                <select 
                                  value={doc.type} 
                                  onChange={(e) => updateDocType(doc.id, e.target.value)}
                                  className="doc-type-select"
                                >
                                  <option value="">Select Type</option>
                                  {documentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <div className="cell-with-icon">
                                <DocIdInput docId={doc.id} onUpdate={updateDocId} />
                              </div>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <div className="cell-with-icon">
                                {getFileIconByName(doc.fileName)}
                                <span 
                                  className="file-name" 
                                  onClick={() => openDocumentViewer(doc)} 
                                  style={{ cursor: 'pointer' }}
                                >
                                  {doc.fileName || 'Document File'}
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <div className="cell-with-icon">
                                <FaCalendar className="cell-icon" />
                                {formatDate(doc.receivedDate)}
                              </div>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <button 
                                className={`status-toggle-button ${doc.status.toLowerCase()}`}
                                onClick={() => toggleDocPrepared(doc.id)}
                                title={doc.status === 'New' ? 'Mark as Prepared' : 'Mark as New'}
                              >
                                {doc.status === 'New' ? (
                                  <>
                                    <FaCheckCircle className="toggle-icon" />
                                    New
                                  </>
                                ) : (
                                  <>
                                    <FaClipboardCheck className="toggle-icon" />
                                    Prepared
                                  </>
                                )}
                              </button>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <div className="actions-cell">
                                <button 
                                  className="action-icon-button"
                                  title="View Document"
                                  onClick={() => openDocumentViewer(doc)}
                                >
                                  <FaEye />
                                </button>
                                <button 
                                  className="action-icon-button" 
                                  title="Download Document"
                                  onClick={() => handleDownloadDocument(doc)}
                                >
                                  <FaDownload />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                filteredSignedDocs.length === 0 ? (
                  <div className="empty-state">
                    <FaFileSignature className="empty-icon" />
                    <h4>No Signed Documents</h4>
                    <p>There are no signed documents matching your current filters.</p>
                    <button 
                      className="action-button secondary"
                      onClick={resetFilters}
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="upload-section">
                    <button 
                      className="action-button primary upload-button"
                      onClick={() => document.getElementById('signed-file-input').click()}
                    >
                      <FaFileSignature className="button-icon" style={{ marginRight: '0.5rem' }} />
                      Upload Signed Documents
                    </button>
                    <input 
                      type="file" 
                      id="signed-file-input"
                      className="hidden-file-input"
                      onChange={handleSignedDocumentUpload}
                      multiple
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  <table className="document-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Document Type</th>
                        <th style={{ textAlign: 'left' }}>Document ID</th>
                        <th style={{ textAlign: 'left' }}>File Name</th>
                        <th style={{ textAlign: 'left' }}>Date Signed</th>
                        <th style={{ textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSignedDocs.map(doc => (
                        <tr key={doc.id} className="status-signed">
                          <td style={{ textAlign: 'left' }}>
                            <div className="cell-with-icon">
                              <FaFileAlt className="cell-icon" />
                              {doc.type}
                            </div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div className="cell-with-icon">
                              <DocIdInput docId={doc.id} onUpdate={updateDocId} />
                            </div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div className="cell-with-icon">
                              {getFileIconByName(doc.fileName)}
                              <span 
                                className="file-name" 
                                onClick={() => openDocumentViewer(doc)} 
                                style={{ cursor: 'pointer' }}
                              >
                                {doc.fileName || 'Document File'}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div className="cell-with-icon">
                              <FaCalendar className="cell-icon" />
                              {formatDate(doc.signedDate)}
                            </div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div className="actions-cell">
                              <button 
                                className="action-icon-button"
                                title="View Document"
                                onClick={() => openDocumentViewer(doc)}
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="action-icon-button" 
                                title="Download Document"
                                  onClick={() => handleDownloadDocument(doc)}
                              >
                                <FaDownload />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </>
                )
              )}
            </div>
            
            <div 
              className={`document-drop-zone ${isDropActive ? 'active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="drop-zone-content">
                <FaUpload className="drop-icon" />
                <h4 className="drop-title">Drop files here to upload</h4>
                <p className="drop-description">Or use the upload buttons above</p>
              </div>
            </div>
            
            <div className="document-footer">
              <div className="document-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Documents:</span>
                  <span className="stat-value">{documentCounts.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">New:</span>
                  <span className="stat-value">{documentCounts.new}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Prepared:</span>
                  <span className="stat-value">{documentCounts.prepared}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Signed:</span>
                  <span className="stat-value">{documentCounts.signed}</span>
                </div>
              </div>
              
              <div className="document-batch-actions">
                <button 
                  className="action-button secondary"
                  onClick={exportDocuments}
                >
                  <span className="icon-wrapper">
                    <span className="material-icons">file_download</span>
                  </span>
                  Export Documents
                </button>
                <button 
                  className="action-button primary"
                  onClick={generateDocumentReport}
                >
                  <span className="icon-wrapper">
                    <span className="material-icons">description</span>
                  </span>
                  Generate Report
                </button>
                <button className="action-button secondary" onClick={exportCPOReport}>
                  <span className="icon-wrapper">
                    <span className="material-icons">summarize</span>
                  </span>
                  Export CPO Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CPO Allocation Tab */}
      {activeTab === 'cpo' && (
        <div className="tab-content animate-fade-in">
          <div className="cpo-container">
            <div className="cpo-header">
              <div className="cpo-title">
                <FaFileMedicalAlt className="section-icon" />
                <h3>CPO Allocation</h3>
              </div>
              
              <button 
                className="action-button primary add-cpo-btn"
                onClick={() => {
                  // Make sure we reset the file input first
                  const fileInput = document.getElementById('cpo-file-input');
                  if (fileInput) fileInput.value = '';
                  fileInput.click();
                }}
              >
                <span className="icon-wrapper"><FaPlus /></span>
                Add new CPO document
              </button>
              <input
                type="file"
                id="cpo-file-input"
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
            </div>
            
            <div className="cpo-content">
              <div className="cpo-summary-card">
                <div className="card-header">
                  <FaClock className="header-icon" />
                  <h4>CPO Summary</h4>
                </div>
                
                <div className="summary-content">
                  <div className="summary-item">
                    <div className="summary-label">Total CPO Minutes</div>
                    <div className="summary-value">{patientInfo.cpoMinsCaptured}</div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-label">Documents Created</div>
                    <div className="summary-value">{cpoDocs.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="cpo-documents-card">
                <div className="card-header">
                  <FaFileAlt className="header-icon" />
                  <h4>New CPO documents</h4>
                </div>
                
                <div className="documents-table-container">
                  <table className="documents-table">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Creation Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cpoDocs.map((doc, index) => (
                        <tr key={doc.id}>
                          <td>
                            <div className="document-name">
                              <FaFilePdf className="file-icon pdf" />
                              <span>{doc.fileName}</span>
                            </div>
                          </td>
                          <td>
                            <div className="date-input-container">
                              <FaCalendar className="date-icon" />
                              <input 
                                type="date" 
                                value={doc.creationDate || ''} 
                                onChange={(e) => {
                                  setCpoDocs(prevDocs => 
                                    prevDocs.map(d => 
                                      d.id === doc.id ? {...d, creationDate: e.target.value} : d
                                    )
                                  );
                                  // Recalculate CPO minutes when date changes
                                  setTimeout(calculateCPOMinutes, 100);
                                }}
                                className="date-input"
                              />
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-icon-button"
                                onClick={() => openDocumentViewer(doc)}
                                title="View Document"
                              >
                                <FaEye />
                              </button>
                              <button
                                className="action-icon-button"
                                title="Download Document"
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                <FaDownload />
                              </button>
                              <button 
                                className="action-icon-button" 
                                title="Edit Document"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setIsEditingDocumentDetails(true);
                                  setViewerOpen(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="documents-footer">
                  <div className="document-count">
                    Total Documents: <span className="count">{cpoDocs.length}</span>
                  </div>
                  <button className="action-button secondary" onClick={exportCPOReport}>
                    <span className="icon-wrapper">
                      <span className="material-icons">summarize</span>
                    </span>
                    Export CPO Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification component */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' && <FaCheckCircle />}
            {notification.type === 'warning' && <FaExclamationTriangle />}
            {notification.type === 'error' && <FaTimesCircle />}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
          </div>
          <button className="notification-close" onClick={closeNotification}>
            <FaTimes />
          </button>
        </div>
      )}
      
      {/* Progress indicator */}
      {isUploading && (
        <div className="progress-overlay">
          <div className="progress-indicator">
            <FaSpinner className="progress-spinner" />
            <span>Uploading documents...</span>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewerOpen && selectedDocument && (
        <div className="document-viewer-overlay">
          <div className="document-viewer-container">
            <div className="document-viewer-header">
              <div className="document-viewer-info">
                <h3>
                  <FaFileAlt className="section-icon" />
                  {selectedDocument.fileName}
                </h3>
                <div className="document-meta">
                  <span className="document-meta-item">
                    <FaHashtag className="meta-icon" />
                    <div className="doc-id-display viewer">
                      <span>{selectedDocument.id}</span>
                    </div>
                  </span>
                  {/* Remove or hide type selection if we're in the CPO tab */}
                  {activeTab !== 'cpo' && (
                    <span className="document-meta-item">
                      <FaFileAlt className="meta-icon" />
                      Type: {isEditingDocumentDetails ? (
                        <select 
                          value={selectedDocument.type || ''} 
                          onChange={(e) => updateViewerDocument('type', e.target.value)}
                          className="doc-type-select"
                        >
                          <option value="">Select Type</option>
                          {documentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      ) : (
                        selectedDocument.type || "Not specified"
                      )}
                    </span>
                  )}
                  {/* If we're in CPO tab, show creation date editor */}
                  {activeTab === 'cpo' && (
                    <span className="document-meta-item">
                      <FaCalendar className="meta-icon" />
                      Creation Date: {isEditingDocumentDetails ? (
                        <input 
                          type="date" 
                          value={selectedDocument.creationDate || new Date().toISOString().slice(0, 10)} 
                          onChange={(e) => updateViewerDocument('creationDate', e.target.value)}
                          className="doc-date-input"
                        />
                      ) : (
                        formatDate(selectedDocument.creationDate) || "Not specified"
                      )}
                    </span>
                  )}
                  {selectedDocument.status && (
                    <span className={`status-pill ${selectedDocument.status.toLowerCase()}`}>
                      {selectedDocument.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="document-viewer-actions">
                {isEditingDocumentDetails ? (
                  <>
                    <button 
                      className="action-button primary"
                      onClick={saveDocumentChanges}
                    >
                      <FaSave className="action-icon" />
                      Save Changes
                    </button>
                    <button 
                      className="action-button secondary"
                      onClick={() => setIsEditingDocumentDetails(false)}
                    >
                      <FaTimes className="action-icon" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="action-button primary"
                      onClick={() => setIsEditingDocumentDetails(true)}
                    >
                      <FaEdit className="action-icon" />
                      Edit Details
                    </button>
                    {selectedDocument.status === 'New' && (
                      <button 
                        className="action-button primary"
                        onClick={() => markAsPrepared(selectedDocument.id)}
                      >
                        <FaCheck className="action-icon" />
                        Mark as Prepared
                      </button>
                    )}
                    {selectedDocument.status === 'Prepared' && (
                      <button 
                        className="action-button secondary"
                        onClick={() => markAsUnprepared(selectedDocument.id)}
                      >
                        <FaTimes className="action-icon" />
                        Mark as Unprepared
                      </button>
                    )}
                    <button 
                      className="action-button secondary"
                      onClick={closeDocumentViewer}
                    >
                      <FaTimes className="action-icon" />
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="document-viewer-content">
              {selectedDocument.hasFilePreview && selectedDocument.fileUrl ? (
                // Real file preview for uploaded files
                <div className="real-file-preview">
                  {selectedDocument.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    // Image preview
                    <img 
                      src={selectedDocument.fileUrl} 
                      alt={selectedDocument.fileName} 
                      className="image-preview" 
                    />
                  ) : selectedDocument.fileName.match(/\.(pdf)$/i) ? (
                    // PDF preview - iframe for PDFs
                    <iframe 
                      src={selectedDocument.fileUrl} 
                      title={selectedDocument.fileName}
                      className="pdf-iframe-preview"
                    />
                  ) : (
                    // Generic preview with download link for other file types
                    <div className="generic-file-preview">
                      <div className="preview-icon">
                        <FaFile className="large-file-icon" />
                      </div>
                      <div className="preview-info">
                        <h3>{selectedDocument.fileName}</h3>
                        <p>File type: {selectedDocument.fileName.split('.').pop().toUpperCase()}</p>
                        <p>Size: {selectedDocument.size}</p>
                        <a 
                          href={selectedDocument.fileUrl} 
                          download={selectedDocument.fileName}
                          className="download-link"
                        >
                          <span className="material-icons">file_download</span> Download File
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedDocument.fileName && selectedDocument.fileName.endsWith('pdf') ? (
                // Mock PDF preview for demo files
                <div className="pdf-preview">
                  <div className="pdf-page">
                    <div className="pdf-header">
                      <img src="https://via.placeholder.com/150x60" alt="Company Logo" className="pdf-logo" />
                      <div className="pdf-title">
                        <h2>{selectedDocument.type || 'Patient Document'}</h2>
                        <p>Document ID: {selectedDocument.id}</p>
                      </div>
                    </div>
                    <div className="pdf-body">
                      <div className="pdf-section">
                        <h3>Patient Information</h3>
                        <div className="pdf-info-grid">
                          <div className="pdf-info-item">
                            <label>Patient Name:</label>
                            <span>{patientInfo.name}</span>
                          </div>
                          <div className="pdf-info-item">
                            <label>Patient ID:</label>
                            <span>{patientInfo.id}</span>
                          </div>
                          <div className="pdf-info-item">
                            <label>Date of Birth:</label>
                            <span>{formatDate(patientInfo.dob)}</span>
                          </div>
                          <div className="pdf-info-item">
                            <label>Gender:</label>
                            <span>{patientInfo.gender}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pdf-section">
                        <h3>Document Details</h3>
                        <p>
                          {selectedDocument.type === 'Evaluation' && 'This evaluation document contains the assessment findings for the patient. The patient was evaluated for various symptoms and conditions as described below.'}
                          {selectedDocument.type === 'Re-evaluation' && 'This re-evaluation document contains updated assessment findings for the patient. The patient was re-evaluated for progress and current status as detailed below.'}
                          {selectedDocument.type === 'Position Order' && 'This position order document contains specific instructions for patient positioning and physical therapy regimen as prescribed by the physician.'}
                          {!selectedDocument.type && 'This document contains important patient information and healthcare details. Please review the contents carefully.'}
                        </p>
                        
                        <div className="pdf-table">
                          <div className="pdf-table-row pdf-table-header">
                            <div className="pdf-table-cell">Date</div>
                            <div className="pdf-table-cell">Provider</div>
                            <div className="pdf-table-cell">Notes</div>
                          </div>
                          <div className="pdf-table-row">
                            <div className="pdf-table-cell">{formatDate(selectedDocument.receivedDate || selectedDocument.signedDate)}</div>
                            <div className="pdf-table-cell">{selectedDocument.uploadedBy || selectedDocument.signedBy || 'Dr. Johnson'}</div>
                            <div className="pdf-table-cell">Initial document created and reviewed</div>
                          </div>
                          <div className="pdf-table-row">
                            <div className="pdf-table-cell">{formatDate(new Date())}</div>
                            <div className="pdf-table-cell">System</div>
                            <div className="pdf-table-cell">Document viewed in patient portal</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pdf-section">
                        <h3>Summary & Recommendations</h3>
                        <p>Patient demonstrates good progress with the current treatment regimen. Continue with prescribed therapy and medication as directed. Follow-up appointment recommended in 2 weeks.</p>
                        
                        <div className="pdf-signature-block">
                          <div className="pdf-signature">
                            {selectedDocument.signedBy ? (
                              <>
                                <img src="https://via.placeholder.com/200x60?text=Digital+Signature" alt="Digital Signature" />
                                <p>{selectedDocument.signedBy}</p>
                                <p>Signed: {formatDate(selectedDocument.signedDate)}</p>
                              </>
                            ) : (
                              <p>This document requires signature by an authorized provider.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pdf-footer">
                      <p>Document {selectedDocument.id} • Page 1 of 1 • Generated on {formatDate(new Date())}</p>
                    </div>
                  </div>
                </div>
              ) : selectedDocument.fileName && selectedDocument.fileName.endsWith('docx') ? (
                <div className="doc-preview">
                  <div className="word-doc">
                    <div className="word-page">
                      <div className="word-header">
                        <h2>Position Order Document</h2>
                        <p>Patient: {patientInfo.name} | ID: {patientInfo.id}</p>
                      </div>
                      
                      <div className="word-body">
                        <h3>STANDING PHYSICIAN ORDER</h3>
                        <p>The following treatments and positioning protocols have been ordered for {patientInfo.name}:</p>
                        
                        <ul className="word-list">
                          <li>Physical therapy sessions: 3 times per week</li>
                          <li>Range of motion exercises: daily</li>
                          <li>Position changes: every 2 hours when in bed</li>
                          <li>Allowed weight bearing: as tolerated with assistance</li>
                          <li>Assistive devices: walker required for ambulation</li>
                        </ul>
                        
                        <p><strong>Special Instructions:</strong> Monitor vital signs before and after physical activity. Discontinue exercise if patient shows signs of distress.</p>
                        
                        <div className="word-signature-block">
                          <p>Ordered by: Dr. {selectedDocument.signedBy || 'Chen'}</p>
                          <p>Date: {formatDate(selectedDocument.signedDate || new Date())}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-preview">
                  <span className="material-icons" style={{ fontSize: '64px' }}>description</span>
                  <p>Preview not available for this file type</p>
                  <p className="no-preview-filename">{selectedDocument.fileName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Episode Modal for Add/Edit */}
      {showEpisodeModal && (
        <div className="modal-overlay">
          <div className="modal-content episode-modal">
            <div className="modal-header">
              <h3>{editingEpisode ? 'Edit Episode' : 'Add New Episode'}</h3>
              <button className="modal-close" onClick={() => setShowEpisodeModal(false)}>
                <FaTimes />
              </button>
    </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Start Date <span className="required">*</span></label>
                  <input 
                    type="date" 
                    value={newEpisodeData.startDate}
                    onChange={(e) => handleEpisodeInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SOC Date <span className="required">*</span></label>
                  <input 
                    type="date" 
                    value={newEpisodeData.socDate}
                    onChange={(e) => handleEpisodeInputChange('socDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={newEpisodeData.endDate}
                    onChange={(e) => handleEpisodeInputChange('endDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Status <span className="required">*</span></label>
                  <select 
                    value={newEpisodeData.status}
                    onChange={(e) => handleEpisodeInputChange('status', e.target.value)}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="complete">Complete</option>
                    <option value="planned">Planned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Primary Diagnosis <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={newEpisodeData.diagnosis}
                    onChange={(e) => handleEpisodeInputChange('diagnosis', e.target.value)}
                    placeholder="Enter primary diagnosis"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Provider <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={newEpisodeData.provider}
                    onChange={(e) => handleEpisodeInputChange('provider', e.target.value)}
                    placeholder="Enter provider name"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea 
                    value={newEpisodeData.notes}
                    onChange={(e) => handleEpisodeInputChange('notes', e.target.value)}
                    placeholder="Enter any notes for this episode"
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="action-button secondary"
                onClick={() => setShowEpisodeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="action-button primary"
                onClick={handleSaveEpisode}
              >
                {editingEpisode ? 'Update Episode' : 'Add Episode'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Documents Modal */}
      {showDocumentsModal && (
        <div className="modal-overlay">
          <div className="modal-content documents-modal">
            <div className="modal-header">
              <h3>Episode Documents</h3>
              <button className="modal-close" onClick={() => setShowDocumentsModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {currentEpisodeDocuments.length > 0 ? (
                <table className="documents-table">
                  <thead>
                    <tr>
                      <th>Document ID</th>
                      <th>Type</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEpisodeDocuments.map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.id}</td>
                        <td>{doc.type}</td>
                        <td>{formatDate(doc.createdDate)}</td>
                        <td>
                          <span className={`status-badge ${doc.status === 'Signed' ? 'signed' : 'unsigned'}`}>
                            {doc.status === 'Signed' ? 
                              <FaCheckCircle className="status-icon" /> : 
                              <FaTimesCircle className="status-icon" />
                            }
                            {doc.status}
                          </span>
                        </td>
                        <td>{doc.size}</td>
                        <td className="actions-cell">
                          <button className="action-icon-button view" title="View Document">
                            <FaEye />
                          </button>
                          <button className="action-icon-button download" title="Download Document">
                            <FaDownload />
                          </button>
                          {doc.status !== 'Signed' && (
                            <button 
                              className="action-icon-button sign" 
                              title="Sign Document"
                              onClick={() => {
                                // Mark as signed
                                const updatedDocs = currentEpisodeDocuments.map(d => 
                                  d.id === doc.id ? { ...d, status: 'Signed' } : d
                                );
                                setCurrentEpisodeDocuments(updatedDocs);
                                
                                // Update in episodes array
                                setEpisodes(episodes.map(ep => {
                                  if (ep.documents && ep.documents.find(d => d.id === doc.id)) {
                                    return {
                                      ...ep,
                                      documents: ep.documents.map(d => 
                                        d.id === doc.id ? { ...d, status: 'Signed' } : d
                                      )
                                    };
                                  }
                                  return ep;
                                }));
                                
                                showNotification('success', 'Document Signed', `${doc.type} has been signed successfully.`);
                              }}
                            >
                              <FaSignature />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-documents">
                  <p>No documents found for this episode.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="action-button secondary"
                onClick={() => setShowDocumentsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function generateMonthlyCPOData() {
  // Generate sample data for monthly CPO minutes
  // In a real implementation, this would pull from actual patient data
  const currentDate = new Date();
  const months = [];
  
  // Generate 6 months of data, with the current month as the last entry
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentDate);
    monthDate.setMonth(currentDate.getMonth() - i);
    
    const monthName = monthDate.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    // Random minutes between 30 and 150
    const minutes = i === 0 ? 120 : Math.floor(Math.random() * 120) + 30;
    
    months.push({
      month: monthName,
      minutes: minutes
    });
  }
  
  return months;
}

// Generate a random dummy address
const generateDummyAddress = () => {
  const streetNumbers = [123, 456, 789, 1024, 2048, 555, 777, 999, 1111, 8888];
  const streetNames = ['Main St', 'Oak Avenue', 'Maple Drive', 'Washington Blvd', 'Park Lane', 'Cedar Road', 'Pine Street', 'Elm Court', 'Highland Ave', 'Sunset Drive'];
  const cities = ['Springfield', 'Riverside', 'Fairview', 'Georgetown', 'Franklin', 'Greenville', 'Bristol', 'Clinton', 'Madison', 'Salem'];
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const zipCodes = ['90210', '10001', '75001', '33101', '60601', '19101', '44101', '30301', '27601', '48201'];
  
  const randomIndex = Math.floor(Math.random() * 10);
  return `${streetNumbers[randomIndex]} ${streetNames[randomIndex]}, ${cities[randomIndex]}, ${states[randomIndex]} ${zipCodes[randomIndex]}`;
};

export default React.memo(PatientDetailView); 