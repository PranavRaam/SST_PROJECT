import { useState } from 'react';
import './InteractionLog.css';
import { formatDateTime, getCurrentDateTime } from '../../utils/dateUtils';
import { formatDate } from '../../utils/dateUtils';

const InteractionLog = () => {
  const [interactions, setInteractions] = useState([
    {
      id: 1,
      reactiveOutcomeNo: 'RO-001',
      dateTime: '2024-03-27T10:00:00',
      user: 'Dr. John Doe',
      contact: '+1234567890',
      designation: 'Cardiologist',
      medium: 'Email',
      summary: 'Reviewed patient test results',
      action: 'Schedule follow-up consultation'
    },
    {
      id: 2,
      reactiveOutcomeNo: 'RO-002',
      dateTime: '2024-03-28T14:30:00',
      user: 'Nurse Jane Smith',
      contact: '+1987654321',
      designation: 'Head Nurse',
      medium: 'Phone',
      summary: 'Discussed patient discharge plans',
      action: 'Coordinate with family'
    },
    {
      id: 3,
      reactiveOutcomeNo: 'RO-003',
      dateTime: '2024-03-29T09:15:00',
      user: 'Dr. Alice Johnson',
      contact: '+1123456789',
      designation: 'Pediatrician',
      medium: 'Video Call',
      summary: "Consulted on child's symptoms",
      action: 'Prescribe medication'
    },
    {
      id: 4,
      reactiveOutcomeNo: 'RO-004',
      dateTime: '2024-03-30T11:45:00',
      user: 'Dr. Bob Williams',
      contact: '+1777888999',
      designation: 'Oncologist',
      medium: 'Chat',
      summary: 'Updated patient on treatment plan',
      action: 'Arrange next chemo session'
    },
    {
      id: 5,
      reactiveOutcomeNo: 'RO-005',
      dateTime: '2024-03-31T16:00:00',
      user: 'Emma Brown',
      contact: '+1555666777',
      designation: 'Physical Therapist',
      medium: 'Email',
      summary: 'Shared recovery exercises',
      action: 'Schedule next session'
    },
    {
      id: 6,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-01T13:20:00',
      user: 'Dr. Michael Lee',
      contact: '+1444333222',
      designation: 'Radiologist',
      medium: 'Phone',
      summary: 'Discussed MRI findings',
      action: 'Prepare detailed report'
    },
    {
      id: 7,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-02T10:00:00',
      user: 'Sophia Martinez',
      contact: '+1333444555',
      designation: 'Pharmacist',
      medium: 'In-Person',
      summary: 'Reviewed medication stock',
      action: 'Order new supplies'
    },
    {
      id: 8,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-03T15:45:00',
      user: 'Daniel Garcia',
      contact: '+1999888777',
      designation: 'Hospital Administrator',
      medium: 'Email',
      summary: 'Reviewed hospital policies',
      action: 'Draft policy update'
    },
    {
      id: 9,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-04T11:30:00',
      user: 'Dr. Liam Johnson',
      contact: '+1222333444',
      designation: 'Orthopedic Surgeon',
      medium: 'Video Call',
      summary: 'Discussed surgical procedures',
      action: 'Confirm OR availability'
    },
    {
      id: 10,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-05T09:45:00',
      user: 'Nurse Olivia Taylor',
      contact: '+1777555666',
      designation: 'ICU Nurse',
      medium: 'Phone',
      summary: 'Reported patient vitals',
      action: 'Alert physician on changes'
    },
    {
      id: 11,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-06T14:20:00',
      user: 'Dr. Noah Wilson',
      contact: '+1888999000',
      designation: 'Neurologist',
      medium: 'Email',
      summary: 'Reviewed EEG results',
      action: 'Refer patient to specialist'
    },
    {
      id: 12,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-07T16:10:00',
      user: 'Ava Thompson',
      contact: '+1666777888',
      designation: 'Medical Technician',
      medium: 'In-Person',
      summary: 'Performed diagnostic tests',
      action: 'Send results to doctor'
    },
    {
      id: 13,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-08T12:00:00',
      user: 'Dr. James Anderson',
      contact: '+1555333444',
      designation: 'Pulmonologist',
      medium: 'Phone',
      summary: 'Consulted on respiratory issues',
      action: 'Recommend breathing exercises'
    },
    {
      id: 14,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-09T10:30:00',
      user: 'Isabella Moore',
      contact: '+1444555777',
      designation: 'Dietitian',
      medium: 'Email',
      summary: 'Shared patient meal plans',
      action: 'Adjust diet recommendations'
    },
    {
      id: 15,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-10T14:50:00',
      user: 'Dr. William Clark',
      contact: '+1333222111',
      designation: 'General Surgeon',
      medium: 'Video Call',
      summary: 'Pre-op consultation',
      action: 'Confirm surgery schedule'
    },
    {
      id: 16,
      reactiveOutcomeNo: '',
      dateTime: '2024-04-11T11:00:00',
      user: 'Mia Lewis',
      contact: '+1999777555',
      designation: 'Medical Receptionist',
      medium: 'In-Person',
      summary: 'Registered new patients',
      action: 'Update patient records'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    reactiveOutcomeNo: '',
    dateTime: getCurrentDateTime().isoString,
    user: '',
    contact: '',
    designation: '',
    medium: '',
    summary: '',
    action: ''
  });

  // Sample reactive outcome numbers for dropdown
  const reactiveOutcomeOptions = [
    'RO-001', 'RO-002', 'RO-003', 'RO-004', 'RO-005', 
    'RO-006', 'RO-007', 'RO-008', 'RO-009', 'RO-010',
    'RO-011', 'RO-012', 'RO-013', 'RO-014', 'RO-015'
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddInteraction = () => {
    setInteractions(prev => [...prev, {
      ...newInteraction,
      id: prev.length + 1
    }]);
    setShowModal(false);
    setNewInteraction({
      reactiveOutcomeNo: '',
      dateTime: getCurrentDateTime().isoString,
      user: '',
      contact: '',
      designation: '',
      medium: '',
      summary: '',
      action: ''
    });
  };

  const filteredInteractions = interactions.filter(interaction =>
    Object.values(interaction).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newInteraction = {
      user: formData.get('user'),
      contact: formData.get('contact'),
      designation: formData.get('designation'),
      medium: formData.get('medium'),
      summary: formData.get('summary'),
      action: formData.get('action'),
      reactiveOutcomeNo: formData.get('reactiveOutcomeNo'),
      dateTime: new Date(formData.get('dateAndTime')).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
    };
    handleAddInteraction(newInteraction);
    setShowModal(false);
  };

  return (
    <div className="il_interaction_log_container">
      <h2 className="il_main_heading">Interaction Log</h2>
      <div className="il_search_container">
        <input
          type="text"
          placeholder="Search interactions..."
          className="il_search_input"
        />
        <button className="il_add_button">Add New</button>
      </div>
      <div className="il_table_container">
        <table className="il_interaction_table">
          <thead>
            <tr>
              <th>Reactive Outcome No</th>
              <th>Date and Time</th>
              <th>User</th>
              <th>Contact</th>
              <th>Designation</th>
              <th>Medium</th>
              <th>Summary</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((interaction) => (
              <tr key={interaction.id}>
                <td>{interaction.reactiveOutcomeNo}</td>
                <td>{formatDateTime(interaction.dateTime)}</td>
                <td>{interaction.user}</td>
                <td>{interaction.contact}</td>
                <td>{interaction.designation}</td>
                <td>{interaction.medium}</td>
                <td>{interaction.summary}</td>
                <td>{interaction.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InteractionLog;
