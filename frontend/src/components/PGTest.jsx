import React, { useState } from 'react';
import { getMockPatientsByPG } from '../utils/mockDataService';

const PGTest = () => {
  const [pgName, setPgName] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSearch = () => {
    const patients = getMockPatientsByPG(pgName);
    setResults(patients);
    setSearchHistory([...searchHistory, { query: pgName, count: patients.length }]);
  };

  // Sample PG names to try
  const samplePGs = [
    "brmc home care - brownfield",
    "Brownfield Regional",
    "BRMC",
    "enhabit - lubbock",
    "memorial hospital",
    "pg gamma"
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>PG Name Matching Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={pgName} 
          onChange={(e) => setPgName(e.target.value)}
          placeholder="Enter PG name"
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button 
          onClick={handleSearch}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Search
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Sample PG Names to Try:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {samplePGs.map((name) => (
            <button
              key={name}
              onClick={() => {
                setPgName(name);
                getMockPatientsByPG(name);
              }}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 2 }}>
          <h3>Search Results ({results.length} patients found)</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {results.map((patient) => (
              <div 
                key={patient.id}
                style={{ 
                  border: '1px solid #ddd',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px'
                }}
              >
                <h4>{patient.patientFirstName} {patient.patientLastName}</h4>
                <p>ID: {patient.id}</p>
                <p>PG: {patient.patientPG}</p>
                <p>HHAH: {patient.hhah}</p>
                {patient.primaryDiagnosisCodes && (
                  <p>Primary Diagnosis: {patient.primaryDiagnosisCodes.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Search History</h3>
          <div>
            {searchHistory.map((item, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '8px',
                  borderBottom: '1px solid #eee'
                }}
              >
                <strong>{item.query}</strong>: {item.count} patients
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGTest; 