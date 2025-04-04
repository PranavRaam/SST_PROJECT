import React, { useState } from 'react';
import './Patients.css';

const Patients = ({ data, setData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [billingFilter, setBillingFilter] = useState('all'); // 'all', 'billed', 'not-billed'

  const [newPatient, setNewPatient] = useState({
    name: '',
    socDate: '',
    billed: false
  });

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.socDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newId = data.patients.length > 0 
      ? Math.max(...data.patients.map(p => p.id)) + 1 
      : 1;

    setData(prev => ({
      ...prev,
      patients: [...prev.patients, { ...newPatient, id: newId }]
    }));

    setNewPatient({
      name: '',
      socDate: '',
      billed: false
    });
    setShowAddForm(false);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowEditForm(true);
  };

  const handleUpdatePatient = () => {
    if (!selectedPatient.name || !selectedPatient.socDate) {
      alert('Please fill in all required fields');
      return;
    }

    setData(prev => ({
      ...prev,
      patients: prev.patients.map(p => 
        p.id === selectedPatient.id ? selectedPatient : p
      )
    }));

    setShowEditForm(false);
    setSelectedPatient(null);
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setData(prev => ({
        ...prev,
        patients: prev.patients.filter(patient => patient.id !== id)
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (showEditForm) {
      setSelectedPatient(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      setNewPatient(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const filteredPatients = data?.patients?.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.socDate.includes(searchTerm);
    
    const matchesBillingFilter = 
      billingFilter === 'all' || 
      (billingFilter === 'billed' && patient.billed) ||
      (billingFilter === 'not-billed' && !patient.billed);

    return matchesSearch && matchesBillingFilter;
  }) || [];

  const renderPatientForm = (isEdit = false) => {
    const patient = isEdit ? selectedPatient : newPatient;
    const handleSubmit = isEdit ? handleUpdatePatient : handleAddPatient;
    const setShowForm = isEdit ? setShowEditForm : setShowAddForm;

    return (
      <div className="patient-form">
        <h3>{isEdit ? 'Edit Patient' : 'Add New Patient'}</h3>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={patient.name}
            onChange={handleInputChange}
            placeholder="Enter patient name"
          />
        </div>
        <div className="form-group">
          <label>SOC Date:</label>
          <input
            type="date"
            name="socDate"
            value={patient.socDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="billed"
              checked={patient.billed}
              onChange={handleInputChange}
            />
            Billed
          </label>
        </div>
        <div className="form-actions">
          <button className="submit-button" onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Add'}
          </button>
          <button className="cancel-button" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="patients-container">
      <div className="patients-header">
        <h2>Patients</h2>
        <div className="patients-controls">
          <div className="patients-filters">
            <select 
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="billing-filter"
            >
              <option value="all">All Patients</option>
              <option value="billed">Billed</option>
              <option value="not-billed">Not Billed</option>
            </select>
            <div className="patients-search">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="patients-search-input"
              />
            </div>
          </div>
          <button 
            className="add-patient-button"
            onClick={() => setShowAddForm(true)}
          >
            Add Patient
          </button>
        </div>
      </div>

      {showAddForm && renderPatientForm(false)}
      {showEditForm && renderPatientForm(true)}

      <div className="patients-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SOC Date</th>
              <th>Billed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.socDate}</td>
                <td>{patient.billed ? 'Yes' : 'No'}</td>
                <td>
                  <div className="patient-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEditPatient(patient)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeletePatient(patient.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients; 