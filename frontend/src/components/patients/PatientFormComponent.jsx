import React, { useState, useMemo, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './PatientFormComponent.css';
import * as XLSX from 'xlsx';
import { usePatientContext } from '../../context/PatientContext';

const PatientFormComponent = ({ onPatientClick }) => {
  const { addPatient, patients } = usePatientContext();
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState({
    physicianName: '',
    pg: '',
    hhah: '',
    renderingPractitioner: ''
  });
  const [formData, setFormData] = useState({
    patientId: '',
    patientLastName: '',
    patientFirstName: '',
    patientMiddleName: '',
    patientDOB: '',
    contactNumber: '',
    physicianName: '',
    pg: '',
    hhah: '',
    patientInsurance: '',
    patientInEHR: '',
    patientSOC: '',
    patientEpisodeFrom: '',
    patientEpisodeTo: '',
    renderingPractitioner: '',
    primaryDiagnosisCodes: [],
    secondaryDiagnosisCodes: [],
    certStatus: '',
    certSignedDate: '',
    recertStatus: '',
    recertSignedDate: '',
    f2fEligibility: '',
    patientRemarks: '',
    cpoMinsCaptured: 0,
    newDocs: 0,
    newCpoDocsCreated: 0
  });
  const [errors, setErrors] = useState({});
  const [datePickerState, setDatePickerState] = useState({
    patientDOB: null,
    patientSOC: null,
    patientEpisodeFrom: null,
    patientEpisodeTo: null
  });
  const [newPrimaryCode, setNewPrimaryCode] = useState('');
  const [newSecondaryCode, setNewSecondaryCode] = useState('');
  const [filterType, setFilterType] = useState('cert');
  const [sortConfig, setSortConfig] = useState({
    newDocs: 'desc',
    newCpoDocs: 'asc'
  });
  const [isReversed, setIsReversed] = useState(false);

  // Predefined PG list
  const predefinedPGs = [
    "PG Alpha",
    "PG Beta",
    "PG Gamma",
    "PG Delta",
    "PG Epsilon"
  ];

  // Options for searchable dropdowns
  const physicianOptions = useMemo(() => [...new Set(patients.map(p => p.physicianName).filter(Boolean))], [patients]);
  const pgOptions = useMemo(() => predefinedPGs, []);
  const hhahOptions = useMemo(() => [...new Set(patients.map(p => p.hhah).filter(Boolean))], [patients]);
  const practitionerOptions = useMemo(() => [...new Set(patients.map(p => p.renderingPractitioner).filter(Boolean))], [patients]);

  // Filtered options for searchable dropdowns
  const filteredPhysicianOptions = useMemo(() => 
    physicianOptions.filter(option => 
      option.toLowerCase().includes(searchTerm.physicianName.toLowerCase())
    ), [physicianOptions, searchTerm.physicianName]);

  const filteredPgOptions = useMemo(() => 
    pgOptions.filter(option => 
      option.toLowerCase().includes(searchTerm.pg.toLowerCase())
    ), [pgOptions, searchTerm.pg]);

  const filteredHhahOptions = useMemo(() => 
    hhahOptions.filter(option => 
      option.toLowerCase().includes(searchTerm.hhah.toLowerCase())
    ), [hhahOptions, searchTerm.hhah]);

  const filteredPractitionerOptions = useMemo(() => 
    practitionerOptions.filter(option => 
      option.toLowerCase().includes(searchTerm.renderingPractitioner.toLowerCase())
    ), [practitionerOptions, searchTerm.renderingPractitioner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editingPatient) {
      setEditingPatient({
        ...editingPatient,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDatePickerChange = (date, field) => {
    setDatePickerState({
      ...datePickerState,
      [field]: date
    });
    
    if (date) {
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      
      if (editingPatient) {
        setEditingPatient({
          ...editingPatient,
          [field]: formattedDate
        });
      } else {
        setFormData({
          ...formData,
          [field]: formattedDate
        });
      }
    } else {
      if (editingPatient) {
        setEditingPatient({
          ...editingPatient,
          [field]: ''
        });
      } else {
        setFormData({
          ...formData,
          [field]: ''
        });
      }
    }
  };

  const handleAddPrimaryCode = () => {
    if (!newPrimaryCode.trim()) return;
    
    if (editingPatient) {
      setEditingPatient({
        ...editingPatient,
        primaryDiagnosisCodes: [...editingPatient.primaryDiagnosisCodes, newPrimaryCode.trim()]
      });
    } else {
      setFormData({
        ...formData,
        primaryDiagnosisCodes: [...formData.primaryDiagnosisCodes, newPrimaryCode.trim()]
      });
    }
    
    setNewPrimaryCode('');
  };

  const handleRemovePrimaryCode = (index) => {
    if (editingPatient) {
      const updatedCodes = [...editingPatient.primaryDiagnosisCodes];
      updatedCodes.splice(index, 1);
      setEditingPatient({
        ...editingPatient,
        primaryDiagnosisCodes: updatedCodes
      });
    } else {
      const updatedCodes = [...formData.primaryDiagnosisCodes];
      updatedCodes.splice(index, 1);
      setFormData({
        ...formData,
        primaryDiagnosisCodes: updatedCodes
      });
    }
  };

  const handleAddSecondaryCode = () => {
    if (!newSecondaryCode.trim()) return;
    
    if (editingPatient) {
      setEditingPatient({
        ...editingPatient,
        secondaryDiagnosisCodes: [...editingPatient.secondaryDiagnosisCodes, newSecondaryCode.trim()]
      });
    } else {
      setFormData({
        ...formData,
        secondaryDiagnosisCodes: [...formData.secondaryDiagnosisCodes, newSecondaryCode.trim()]
      });
    }
    
    setNewSecondaryCode('');
  };

  const handleRemoveSecondaryCode = (index) => {
    if (editingPatient) {
      const updatedCodes = [...editingPatient.secondaryDiagnosisCodes];
      updatedCodes.splice(index, 1);
      setEditingPatient({
        ...editingPatient,
        secondaryDiagnosisCodes: updatedCodes
      });
    } else {
      const updatedCodes = [...formData.secondaryDiagnosisCodes];
      updatedCodes.splice(index, 1);
      setFormData({
        ...formData,
        secondaryDiagnosisCodes: updatedCodes
      });
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchTerm({
      ...searchTerm,
      [field]: value
    });
    
    if (editingPatient) {
      setEditingPatient({
        ...editingPatient,
        [field]: value
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleSelectOption = (field, value) => {
    if (editingPatient) {
      setEditingPatient({
        ...editingPatient,
        [field]: value
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
    
    setSearchTerm({
      ...searchTerm,
      [field]: ''
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.patientId.trim()) newErrors.patientId = 'Patient ID is required';
    if (!formData.patientLastName.trim()) newErrors.patientLastName = 'Last name is required';
    if (!formData.patientFirstName.trim()) newErrors.patientFirstName = 'First name is required';
    if (!formData.patientDOB) newErrors.patientDOB = 'Date of birth is required';
    if (!formData.renderingPractitioner) newErrors.renderingPractitioner = 'Rendering Practitioner is required';
    if (!formData.physicianName) newErrors.physicianName = 'Physician name is required';
    if (!formData.pg) newErrors.pg = 'PG is required';
    if (!formData.hhah) newErrors.hhah = 'HHAH is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const newPatient = {
      ...formData,
      cpoMinsCaptured: 0,
      newDocs: 0,
      newCpoDocsCreated: 0
    };
    
    addPatient(newPatient);
    
    // Reset form state
    setFormData({
      patientId: '',
      patientLastName: '',
      patientFirstName: '',
      patientMiddleName: '',
      patientDOB: '',
      contactNumber: '',
      physicianName: '',
      pg: '',
      hhah: '',
      patientInsurance: '',
      patientInEHR: '',
      patientSOC: '',
      patientEpisodeFrom: '',
      patientEpisodeTo: '',
      renderingPractitioner: '',
      primaryDiagnosisCodes: [],
      secondaryDiagnosisCodes: [],
      certStatus: '',
      certSignedDate: '',
      recertStatus: '',
      recertSignedDate: '',
      f2fEligibility: '',
      patientRemarks: '',
      cpoMinsCaptured: 0,
      newDocs: 0,
      newCpoDocsCreated: 0
    });
    
    setDatePickerState({
      patientDOB: null,
      patientSOC: null,
      patientEpisodeFrom: null,
      patientEpisodeTo: null
    });
    
    setShowModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    // Validate the form before submission
    const newErrors = {};
    
    // Required fields validation
    if (!editingPatient.patientId.trim()) newErrors.patientId = 'Patient ID is required';
    if (!editingPatient.patientLastName.trim()) newErrors.patientLastName = 'Last name is required';
    if (!editingPatient.patientFirstName.trim()) newErrors.patientFirstName = 'First name is required';
    if (!editingPatient.patientDOB) newErrors.patientDOB = 'Date of birth is required';
    if (!editingPatient.renderingPractitioner) newErrors.renderingPractitioner = 'Rendering Practitioner is required';
    if (!editingPatient.physicianName) newErrors.physicianName = 'Physician name is required';
    if (!editingPatient.pg) newErrors.pg = 'PG is required';
    if (!editingPatient.hhah) newErrors.hhah = 'HHAH is required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    // Update the patient in the context
    addPatient(editingPatient);
    
    setEditingPatient(null);
    setShowModal(false);
  };

  const handleEditPatient = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setEditingPatient(patient);
      
      // Set date picker states
      setDatePickerState({
        patientDOB: patient.patientDOB ? new Date(patient.patientDOB.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val))) : null,
        patientSOC: patient.patientSOC ? new Date(patient.patientSOC.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val))) : null,
        patientEpisodeFrom: patient.patientEpisodeFrom ? new Date(patient.patientEpisodeFrom.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val))) : null,
        patientEpisodeTo: patient.patientEpisodeTo ? new Date(patient.patientEpisodeTo.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val))) : null
      });
      
      setShowModal(true);
    }
  };

  const handleMonthYearSubmit = () => {
    if (!selectedMonth || !selectedYear) return;
    
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    
    let filtered = [];
    
    if (filterType === 'cert') {
      // Filter patients based on cert/recert signed date
      filtered = patients.filter(patient => {
        if (patient.certSignedDate) {
          const certDate = new Date(patient.certSignedDate.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val)));
          return certDate >= startDate && certDate <= endDate;
        }
        if (patient.recertSignedDate) {
          const recertDate = new Date(patient.recertSignedDate.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val)));
          return recertDate >= startDate && recertDate <= endDate;
        }
        return false;
      });
    } else {
      // Filter patients based on episode date range
      filtered = patients.filter(patient => {
        if (patient.patientEpisodeFrom && patient.patientEpisodeTo) {
          const episodeFrom = new Date(patient.patientEpisodeFrom.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val)));
          const episodeTo = new Date(patient.patientEpisodeTo.split('-').map((val, idx) => idx === 2 ? parseInt(val) + 2000 : parseInt(val)));
          
          return (
            (episodeFrom >= startDate && episodeFrom <= endDate) ||
            (episodeTo >= startDate && episodeTo <= endDate) ||
            (episodeFrom <= startDate && episodeTo >= endDate)
          );
        }
        return false;
      });
    }
    
    setFilteredPatients(filtered);
    setShowMonthPicker(false);
  };

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Format the data for Excel
    const excelData = filteredPatients.map(patient => ({
      "Patient ID": patient.patientId,
      "Last Name": patient.patientLastName,
      "First Name": patient.patientFirstName,
      "Middle Name": patient.patientMiddleName,
      "DOB": patient.patientDOB,
      "Contact": patient.contactNumber,
      "Physician": patient.physicianName,
      "PG": patient.pg,
      "HHAH": patient.hhah,
      "Insurance": patient.patientInsurance,
      "In EHR": patient.patientInEHR,
      "SOC Date": patient.patientSOC,
      "Episode From": patient.patientEpisodeFrom,
      "Episode To": patient.patientEpisodeTo,
      "Rendering Practitioner": patient.renderingPractitioner,
      "Primary Diagnosis": patient.primaryDiagnosisCodes.join(", "),
      "Secondary Diagnosis": patient.secondaryDiagnosisCodes.join(", "),
      "Cert Status": patient.certStatus,
      "Cert Signed Date": patient.certSignedDate,
      "Recert Status": patient.recertStatus,
      "Recert Signed Date": patient.recertSignedDate,
      "F2F Eligibility": patient.f2fEligibility,
      "Remarks": patient.patientRemarks,
      "CPO Mins": patient.cpoMinsCaptured,
      "New Docs": patient.newDocs,
      "New CPO Docs": patient.newCpoDocsCreated
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    
    // Generate Excel file
    const monthName = new Date(2000, selectedMonth - 1).toLocaleString('default', { month: 'long' });
    XLSX.writeFile(workbook, `Patients_${monthName}_${selectedYear}.xlsx`);
  };

  // Add filtered patients based on search
  const filteredPatientsBySearch = useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(patient => 
      patient.patientLastName.toLowerCase().includes(query) ||
      patient.patientFirstName.toLowerCase().includes(query) ||
      patient.patientId.toLowerCase().includes(query) ||
      patient.pg.toLowerCase().includes(query) ||
      patient.hhah.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  // Sort patients based on current sort configuration
  const sortedPatients = useMemo(() => {
    // First normalize the data to ensure consistent types
    const normalizedData = filteredPatientsBySearch.map(patient => ({
      ...patient,
      newDocs: parseInt(patient.newDocs, 10) || 0,
      newCpoDocsCreated: parseInt(patient.newCpoDocsCreated, 10) || 0
    }));
    
    // Sort the array
    const sorted = [...normalizedData].sort((a, b) => {
      // Primary sort: New Docs (descending)
      if (a.newDocs !== b.newDocs) {
        return b.newDocs - a.newDocs;
      }
      
      // Secondary sort: New CPO Docs (ascending)
      if (a.newCpoDocsCreated !== b.newCpoDocsCreated) {
        return a.newCpoDocsCreated - b.newCpoDocsCreated;
      }
      
      // Tertiary sort: Patient ID (ascending) for consistent ordering
      return a.patientId.localeCompare(b.patientId);
    });

    // Reverse the entire array if isReversed is true
    return isReversed ? [...sorted].reverse() : sorted;
  }, [filteredPatientsBySearch, isReversed]);

  const handleSort = () => {
    setIsReversed(prev => !prev);
  };

  // Function to remove double asterisks from form labels
  useEffect(() => {
    const removeExtraAsterisks = () => {
      const formLabels = document.querySelectorAll('label');
      formLabels.forEach(label => {
        if (label.innerHTML.includes('**')) {
          label.innerHTML = label.innerHTML.replace(/\*\*/g, '*');
        }
        if (label.innerHTML.includes('* *')) {
          label.innerHTML = label.innerHTML.replace(/\* \*/g, '*');
        }
      });
    };

    // Run the function when the modal is shown or when editing a patient
    if (showModal) {
      setTimeout(removeExtraAsterisks, 50); // Small delay to ensure DOM is updated
    }
  }, [showModal, editingPatient]);

  return (
    <div className="patient-form-container">
      <div className="patient-form-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search patients by name, ID, PG, or HHAH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="patient-form-actions">
          <button 
            className="patient-form-button"
            onClick={() => setShowModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Patient
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h2>
              <button className="close-button" onClick={() => {
                setShowModal(false);
                setEditingPatient(null);
              }}>×</button>
            </div>
            
            <form onSubmit={editingPatient ? handleEditSubmit : handleSubmit}>
              <div className="form-grid">
                {/* Column 1 */}
                <div className="form-group">
                  <label>Patient ID *</label>
                  <input
                    type="text"
                    name="patientId"
                    value={editingPatient ? editingPatient.patientId : formData.patientId}
                    onChange={handleChange}
                    className={errors.patientId ? 'error' : ''}
                  />
                  {errors.patientId && <span className="error-text">{errors.patientId}</span>}
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={editingPatient ? editingPatient.contactNumber : formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="patientLastName"
                    value={editingPatient ? editingPatient.patientLastName : formData.patientLastName}
                    onChange={handleChange}
                    className={errors.patientLastName ? 'error' : ''}
                  />
                  {errors.patientLastName && <span className="error-text">{errors.patientLastName}</span>}
                </div>

                <div className="form-group">
                  <label>Patient SOC</label>
                  <DatePicker
                    selected={datePickerState.patientSOC}
                    onChange={(date) => handleDatePickerChange(date, 'patientSOC')}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="form-control"
                    isClearable
                  />
                </div>

                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="patientFirstName"
                    value={editingPatient ? editingPatient.patientFirstName : formData.patientFirstName}
                    onChange={handleChange}
                    className={errors.patientFirstName ? 'error' : ''}
                  />
                  {errors.patientFirstName && <span className="error-text">{errors.patientFirstName}</span>}
                </div>

                <div className="form-group">
                  <label>Patient Episode From</label>
                  <DatePicker
                    selected={datePickerState.patientEpisodeFrom}
                    onChange={(date) => handleDatePickerChange(date, 'patientEpisodeFrom')}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="form-control"
                    isClearable
                  />
                </div>

                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="patientMiddleName"
                    value={editingPatient ? editingPatient.patientMiddleName : formData.patientMiddleName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Patient Episode To</label>
                  <DatePicker
                    selected={datePickerState.patientEpisodeTo}
                    onChange={(date) => handleDatePickerChange(date, 'patientEpisodeTo')}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="form-control"
                    isClearable
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <DatePicker
                    selected={datePickerState.patientDOB}
                    onChange={(date) => handleDatePickerChange(date, 'patientDOB')}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className={`form-control ${errors.patientDOB ? 'error' : ''}`}
                    isClearable
                  />
                  {errors.patientDOB && <span className="error-text">{errors.patientDOB}</span>}
                </div>

                {/* Column 2 */}
                <div className="form-group">
                  <label>Rendering Practitioner *</label>
                  <div className="searchable-dropdown">
                    <input
                      type="text"
                      value={editingPatient ? editingPatient.renderingPractitioner : formData.renderingPractitioner}
                      onChange={(e) => handleSearchChange('renderingPractitioner', e.target.value)}
                      onFocus={(e) => setSearchTerm(prev => ({ ...prev, renderingPractitioner: e.target.value }))}
                      placeholder="Search or type practitioner name..."
                      className={errors.renderingPractitioner ? 'error' : ''}
                    />
                    {searchTerm.renderingPractitioner && filteredPractitionerOptions.length > 0 && (
                      <div className="dropdown-options">
                        {filteredPractitionerOptions.map(option => (
                          <div
                            key={option}
                            className="dropdown-option"
                            onClick={() => handleSelectOption('renderingPractitioner', option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.renderingPractitioner && <span className="error-text">{errors.renderingPractitioner}</span>}
                </div>

                <div className="form-group">
                  <label>Physician Name *</label>
                  <div className="searchable-dropdown">
                    <input
                      type="text"
                      value={editingPatient ? editingPatient.physicianName : formData.physicianName}
                      onChange={(e) => handleSearchChange('physicianName', e.target.value)}
                      onFocus={(e) => setSearchTerm(prev => ({ ...prev, physicianName: e.target.value }))}
                      placeholder="Search or type physician name..."
                      className={errors.physicianName ? 'error' : ''}
                    />
                    {searchTerm.physicianName && filteredPhysicianOptions.length > 0 && (
                      <div className="dropdown-options">
                        {filteredPhysicianOptions.map(option => (
                          <div
                            key={option}
                            className="dropdown-option"
                            onClick={() => handleSelectOption('physicianName', option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.physicianName && <span className="error-text">{errors.physicianName}</span>}
                </div>

                <div className="form-group">
                  <label>Primary Diagnosis Codes</label>
                  <div className="code-input-container">
                    <div className="code-input-row">
                      <input
                        type="text"
                        value={newPrimaryCode}
                        onChange={(e) => setNewPrimaryCode(e.target.value)}
                        placeholder="Enter ICD code"
                      />
                      <button
                        type="button"
                        className="add-code-button"
                        onClick={handleAddPrimaryCode}
                      >
                        +
                      </button>
                    </div>
                    <div className="code-list">
                      {editingPatient ? editingPatient.primaryDiagnosisCodes.map((code, index) => (
                        <div key={index} className="code-item">
                          <span>{code}</span>
                          <button
                            type="button"
                            className="remove-code-button"
                            onClick={() => handleRemovePrimaryCode(index)}
                          >
                            ×
                          </button>
                        </div>
                      )) : formData.primaryDiagnosisCodes.map((code, index) => (
                        <div key={index} className="code-item">
                          <span>{code}</span>
                          <button
                            type="button"
                            className="remove-code-button"
                            onClick={() => handleRemovePrimaryCode(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="form-group">
                  <label>PG *</label>
                  <div className="searchable-dropdown">
                    <input
                      type="text"
                      value={editingPatient ? editingPatient.pg : formData.pg}
                      onChange={(e) => handleSearchChange('pg', e.target.value)}
                      onFocus={(e) => setSearchTerm(prev => ({ ...prev, pg: e.target.value }))}
                      placeholder="Search or type PG name..."
                      className={errors.pg ? 'error' : ''}
                    />
                    {searchTerm.pg && filteredPgOptions.length > 0 && (
                      <div className="dropdown-options">
                        {filteredPgOptions.map(option => (
                          <div
                            key={option}
                            className="dropdown-option"
                            onClick={() => handleSelectOption('pg', option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.pg && <span className="error-text">{errors.pg}</span>}
                </div>

                <div className="form-group">
                  <label>HHAH *</label>
                  <div className="searchable-dropdown">
                    <input
                      type="text"
                      value={editingPatient ? editingPatient.hhah : formData.hhah}
                      onChange={(e) => handleSearchChange('hhah', e.target.value)}
                      onFocus={(e) => setSearchTerm(prev => ({ ...prev, hhah: e.target.value }))}
                      placeholder="Search or type HHAH name..."
                      className={errors.hhah ? 'error' : ''}
                    />
                    {searchTerm.hhah && filteredHhahOptions.length > 0 && (
                      <div className="dropdown-options">
                        {filteredHhahOptions.map(option => (
                          <div
                            key={option}
                            className="dropdown-option"
                            onClick={() => handleSelectOption('hhah', option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.hhah && <span className="error-text">{errors.hhah}</span>}
                </div>

                <div className="form-group">
                  <label>Secondary Diagnosis Codes</label>
                  <div className="code-input-container">
                    <div className="code-input-row">
                      <input
                        type="text"
                        value={newSecondaryCode}
                        onChange={(e) => setNewSecondaryCode(e.target.value)}
                        placeholder="Enter ICD code"
                      />
                      <button
                        type="button"
                        className="add-code-button"
                        onClick={handleAddSecondaryCode}
                      >
                        +
                      </button>
                    </div>
                    <div className="code-list">
                      {editingPatient ? editingPatient.secondaryDiagnosisCodes.map((code, index) => (
                        <div key={index} className="code-item">
                          <span>{code}</span>
                          <button
                            type="button"
                            className="remove-code-button"
                            onClick={() => handleRemoveSecondaryCode(index)}
                          >
                            ×
                          </button>
                        </div>
                      )) : formData.secondaryDiagnosisCodes.map((code, index) => (
                        <div key={index} className="code-item">
                          <span>{code}</span>
                          <button
                            type="button"
                            className="remove-code-button"
                            onClick={() => handleRemoveSecondaryCode(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Patient Insurance</label>
                  <input
                    type="text"
                    name="patientInsurance"
                    value={editingPatient ? editingPatient.patientInsurance : formData.patientInsurance}
                    onChange={handleChange}
                    className={errors.patientInsurance ? 'error' : ''}
                  />
                  {errors.patientInsurance && <span className="error-text">{errors.patientInsurance}</span>}
                </div>

                <div className="form-group">
                  <label>485 Cert Status</label>
                  <select
                    name="certStatus"
                    value={editingPatient ? editingPatient.certStatus : formData.certStatus}
                    onChange={handleChange}
                  >
                    <option value="">Select Status</option>
                    <option value="Document not received">Document not received</option>
                    <option value="Document Prepared">Document Prepared</option>
                    <option value="Document Signed">Document Signed</option>
                    <option value="Document Billed">Document Billed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Patient Present in EHR</label>
                  <select
                    name="patientInEHR"
                    value={editingPatient ? editingPatient.patientInEHR : formData.patientInEHR}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>485 Recert Status</label>
                  <select
                    name="recertStatus"
                    value={editingPatient ? editingPatient.recertStatus : formData.recertStatus}
                    onChange={handleChange}
                  >
                    <option value="">Select Status</option>
                    <option value="Document not received">Document not received</option>
                    <option value="Document Prepared">Document Prepared</option>
                    <option value="Document Signed">Document Signed</option>
                    <option value="Document Billed">Document Billed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>F2F Eligibility</label>
                  <select
                    name="f2fEligibility"
                    value={editingPatient ? editingPatient.f2fEligibility : formData.f2fEligibility}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Patient Remarks</label>
                <textarea
                  name="patientRemarks"
                  value={editingPatient ? editingPatient.patientRemarks : formData.patientRemarks}
                  onChange={handleChange}
                  rows="3"
                  style={{ backgroundColor: "#ffffff" }}
                ></textarea>
              </div>

              {editingPatient && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>CPO Mins Captured</label>
                    <input
                      type="number"
                      value={editingPatient.cpoMinsCaptured}
                      onChange={(e) => setEditingPatient({
                        ...editingPatient,
                        cpoMinsCaptured: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>New Docs</label>
                    <input
                      type="number"
                      value={editingPatient.newDocs}
                      onChange={(e) => setEditingPatient({
                        ...editingPatient,
                        newDocs: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>New CPO Docs</label>
                    <input
                      type="number"
                      value={editingPatient.newCpoDocsCreated}
                      onChange={(e) => setEditingPatient({
                        ...editingPatient,
                        newCpoDocsCreated: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingPatient ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                Filter Patients
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMonth && selectedYear && (
        <div className="filtered-results">
          {filteredPatients.length > 0 ? (
            <>
              <h3>Filtered Patients: {filteredPatients.length}</h3>
              <button 
                className="download-button"
                onClick={handleDownloadExcel}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Excel
              </button>
            </>
          ) : (
            <h3 className="no-results">
              No patients found for {filterType === 'cert' ? 'Cert/Recert' : 'CPO Documents'} in {new Date(2000, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
            </h3>
          )}
        </div>
      )}

      {patients.length > 0 && (
        <div className="table-container">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>DOB</th>
                <th>PG</th>
                <th>HHAH</th>
                <th>CPO Mins</th>
                <th>Rendering Provider</th>
                <th>Remarks</th>
                <th onClick={handleSort} className="sortable-header">
                  New Docs {isReversed ? '↑' : '↓'}
                </th>
                <th onClick={handleSort} className="sortable-header">
                  New CPO Docs {isReversed ? '↑' : '↓'}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map(patient => (
                <tr key={patient.id}>
                  <td 
                    className="patient-name-cell"
                    onClick={() => onPatientClick(patient)}
                  >
                    {`${patient.patientLastName}, ${patient.patientFirstName} ${patient.patientMiddleName}`}
                  </td>
                  <td>{patient.patientDOB}</td>
                  <td>{patient.pg}</td>
                  <td>{patient.hhah}</td>
                  <td>{patient.cpoMinsCaptured}</td>
                  <td>{patient.renderingPractitioner}</td>
                  <td>{patient.patientRemarks}</td>
                  <td>{patient.newDocs}</td>
                  <td>{patient.newCpoDocsCreated}</td>
                  <td>
                    <button 
                      className="action-button edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPatient(patient.id);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientFormComponent;