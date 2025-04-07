import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './PatientFormComponent.css';
import * as XLSX from 'xlsx';

const PatientFormComponent = ({ onPatientClick }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patients, setPatients] = useState([
    {
        "id": 1,
        "patientId": "P001",
        "patientLastName": "Smith",
        "patientFirstName": "John",
        "patientMiddleName": "A",
        "patientDOB": "05-15-1980",
        "contactNumber": "555-123-4567",
        "physicianName": "Dr. Sarah Johnson",
        "pg": "ABC Medical Group",
        "hhah": "Home Health Care Plus",
        "patientInsurance": "Medicare",
        "patientInEHR": "yes",
        "patientSOC": "08-30-2024",
        "patientEpisodeFrom": "08-30-2024",
        "patientEpisodeTo": "10-28-2024",
        "renderingPractitioner": "Dr. Michael Chen",
        "primaryDiagnosisCodes": ["E11.9", "I10"],
        "secondaryDiagnosisCodes": ["M17.9", "E78.5"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-15-2024",
        "recertStatus": "Document Prepared",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Regular follow-up required",
        "cpoMinsCaptured": 120,
        "newDocs": 7,
        "newCpoDocsCreated": 2
      },
      {
        "id": 2,
        "patientId": "P002",
        "patientLastName": "Johnson",
        "patientFirstName": "Emily",
        "patientMiddleName": "R",
        "patientDOB": "07-22-1975",
        "contactNumber": "555-234-5678",
        "physicianName": "Dr. Robert Williams",
        "pg": "Premier Care Medical",
        "hhah": "Golden Age Home Health",
        "patientInsurance": "BlueCross",
        "patientInEHR": "yes",
        "patientSOC": "08-14-2024",
        "patientEpisodeFrom": "08-14-2024",
        "patientEpisodeTo": "10-12-2024",
        "renderingPractitioner": "Dr. Lisa Park",
        "primaryDiagnosisCodes": ["I48.91", "E78.5"],
        "secondaryDiagnosisCodes": ["J44.9", "N18.3"],
        "certStatus": "Document Signed",
        "certSignedDate": "08-25-2024",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Patient has mobility issues",
        "cpoMinsCaptured": 95,
        "newDocs": 8,
        "newCpoDocsCreated": 3
      },
      {
        "id": 3,
        "patientId": "P003",
        "patientLastName": "Williams",
        "patientFirstName": "Robert",
        "patientMiddleName": "J",
        "patientDOB": "11-03-1968",
        "contactNumber": "555-345-6789",
        "physicianName": "Dr. Jessica Miller",
        "pg": "Wellness Medical Associates",
        "hhah": "Comfort Care Services",
        "patientInsurance": "Aetna",
        "patientInEHR": "no",
        "patientSOC": "12-03-2023",
        "patientEpisodeFrom": "09-28-2024",
        "patientEpisodeTo": "11-26-2024",
        "renderingPractitioner": "Dr. David Thompson",
        "primaryDiagnosisCodes": ["K21.9", "E11.9"],
        "secondaryDiagnosisCodes": ["I10", "M81.0"],
        "certStatus": "Document Prepared",
        "certSignedDate": "",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "no",
        "patientRemarks": "Needs assistance with medication management",
        "cpoMinsCaptured": 25,
        "newDocs": 1,
        "newCpoDocsCreated": 0
      },
      {
        "id": 4,
        "patientId": "P004",
        "patientLastName": "Brown",
        "patientFirstName": "Michael",
        "patientMiddleName": "T",
        "patientDOB": "02-28-1985",
        "contactNumber": "555-456-7890",
        "physicianName": "Dr. Thomas Anderson",
        "pg": "United Medical Partners",
        "hhah": "Premier Home Health",
        "patientInsurance": "UnitedHealthcare",
        "patientInEHR": "yes",
        "patientSOC": "07-04-2024",
        "patientEpisodeFrom": "09-02-2024",
        "patientEpisodeTo": "10-31-2024",
        "renderingPractitioner": "Dr. Patricia White",
        "primaryDiagnosisCodes": ["J45.909", "R05.9"],
        "secondaryDiagnosisCodes": ["E03.9", "M54.5"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-15-2024",
        "recertStatus": "Document Billed",
        "recertSignedDate": "10-01-2024",
        "f2fEligibility": "yes",
        "patientRemarks": "Post-surgical care needed",
        "cpoMinsCaptured": 150,
        "newDocs": 8,
        "newCpoDocsCreated": 2
      },
      {
        "id": 5,
        "patientId": "P005",
        "patientLastName": "Davis",
        "patientFirstName": "Jennifer",
        "patientMiddleName": "L",
        "patientDOB": "09-17-1972",
        "contactNumber": "555-567-8901",
        "physicianName": "Dr. Christopher Lee",
        "pg": "Community Health Partners",
        "hhah": "Caring Hands Home Health",
        "patientInsurance": "Cigna",
        "patientInEHR": "no",
        "patientSOC": "08-24-2024",
        "patientEpisodeFrom": "08-24-2024",
        "patientEpisodeTo": "10-22-2024",
        "renderingPractitioner": "Dr. Elizabeth Martinez",
        "primaryDiagnosisCodes": ["F41.9", "G47.00"],
        "secondaryDiagnosisCodes": ["E66.9", "M17.0"],
        "certStatus": "Document Prepared",
        "certSignedDate": "",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Weekly mental health check-ins",
        "cpoMinsCaptured": 20,
        "newDocs": 5,
        "newCpoDocsCreated": 1
      },
      {
        "id": 6,
        "patientId": "P006",
        "patientLastName": "Miller",
        "patientFirstName": "David",
        "patientMiddleName": "W",
        "patientDOB": "04-09-1990",
        "contactNumber": "555-678-9012",
        "physicianName": "Dr. Andrew Wilson",
        "pg": "Pinnacle Medical Group",
        "hhah": "Elite Home Health Services",
        "patientInsurance": "Humana",
        "patientInEHR": "yes",
        "patientSOC": "08-22-2024",
        "patientEpisodeFrom": "08-22-2024",
        "patientEpisodeTo": "10-20-2024",
        "renderingPractitioner": "Dr. Michelle Brown",
        "primaryDiagnosisCodes": ["S72.001A", "M17.11"],
        "secondaryDiagnosisCodes": ["I10", "E11.9"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-05-2024",
        "recertStatus": "Document Prepared",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Physical therapy 3x weekly",
        "cpoMinsCaptured": 85,
        "newDocs": 6,
        "newCpoDocsCreated": 2
      },
      {
        "id": 7,
        "patientId": "P007",
        "patientLastName": "Wilson",
        "patientFirstName": "Susan",
        "patientMiddleName": "E",
        "patientDOB": "08-12-1965",
        "contactNumber": "555-789-0123",
        "physicianName": "Dr. Kevin Barnes",
        "pg": "Integrated Health Systems",
        "hhah": "Harmony Home Health",
        "patientInsurance": "Medicare Advantage",
        "patientInEHR": "yes",
        "patientSOC": "08-28-2024",
        "patientEpisodeFrom": "08-28-2024",
        "patientEpisodeTo": "10-26-2024",
        "renderingPractitioner": "Dr. Richard Taylor",
        "primaryDiagnosisCodes": ["I25.10", "E11.9"],
        "secondaryDiagnosisCodes": ["I10", "Z95.1"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-10-2024",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Cardiovascular monitoring required",
        "cpoMinsCaptured": 60,
        "newDocs": 7,
        "newCpoDocsCreated": 1
      },
      {
        "id": 8,
        "patientId": "P008",
        "patientLastName": "Moore",
        "patientFirstName": "James",
        "patientMiddleName": "L",
        "patientDOB": "06-25-1958",
        "contactNumber": "555-890-1234",
        "physicianName": "Dr. Daniel Lewis",
        "pg": "Advanced Medical Care",
        "hhah": "Quality Home Health",
        "patientInsurance": "Medicare",
        "patientInEHR": "yes",
        "patientSOC": "09-15-2024",
        "patientEpisodeFrom": "09-15-2024",
        "patientEpisodeTo": "11-14-2024",
        "renderingPractitioner": "Dr. Susan Clark",
        "primaryDiagnosisCodes": ["M54.5", "M17.0"],
        "secondaryDiagnosisCodes": ["I10", "E11.9"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-20-2024",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Needs assistance with daily activities",
        "cpoMinsCaptured": 95,
        "newDocs": 4,
        "newCpoDocsCreated": 1
      },
      {
        "id": 9,
        "patientId": "P009",
        "patientLastName": "Taylor",
        "patientFirstName": "Patricia",
        "patientMiddleName": "M",
        "patientDOB": "12-03-1979",
        "contactNumber": "555-901-2345",
        "physicianName": "Dr. Jonathan Harris",
        "pg": "Regional Medical Associates",
        "hhah": "Sunlight Home Health",
        "patientInsurance": "Blue Shield",
        "patientInEHR": "yes",
        "patientSOC": "08-23-2024",
        "patientEpisodeFrom": "08-23-2024",
        "patientEpisodeTo": "10-21-2024",
        "renderingPractitioner": "Dr. Sandra Jackson",
        "primaryDiagnosisCodes": ["M54.5", "M51.26"],
        "secondaryDiagnosisCodes": ["E66.01", "F41.1"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-01-2024",
        "recertStatus": "Document Billed",
        "recertSignedDate": "09-25-2024",
        "f2fEligibility": "yes",
        "patientRemarks": "Pain management protocol in place",
        "cpoMinsCaptured": 130,
        "newDocs": 3,
        "newCpoDocsCreated": 2
      },
      {
        "id": 10,
        "patientId": "P010",
        "patientLastName": "Anderson",
        "patientFirstName": "Thomas",
        "patientMiddleName": "B",
        "patientDOB": "03-17-1982",
        "contactNumber": "555-012-3456",
        "physicianName": "Dr. Margaret Davis",
        "pg": "Pacific Health Alliance",
        "hhah": "Compassionate Care",
        "patientInsurance": "Kaiser",
        "patientInEHR": "no",
        "patientSOC": "08-05-2024",
        "patientEpisodeFrom": "08-05-2024",
        "patientEpisodeTo": "10-03-2024",
        "renderingPractitioner": "Dr. Joseph Wilson",
        "primaryDiagnosisCodes": ["J44.9", "J96.90"],
        "secondaryDiagnosisCodes": ["I10", "E78.5"],
        "certStatus": "Document Prepared",
        "certSignedDate": "",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Oxygen therapy monitoring",
        "cpoMinsCaptured": 30,
        "newDocs": 1,
        "newCpoDocsCreated": 1
      },
      {
        "id": 11,
        "patientId": "P011",
        "patientLastName": "Jackson",
        "patientFirstName": "Barbara",
        "patientMiddleName": "K",
        "patientDOB": "10-05-1970",
        "contactNumber": "555-123-7890",
        "physicianName": "Dr. Edward Thompson",
        "pg": "Valley Medical Group",
        "hhah": "Trustworthy Home Health",
        "patientInsurance": "Medicare",
        "patientInEHR": "yes",
        "patientSOC": "06-13-2024",
        "patientEpisodeFrom": "10-11-2024",
        "patientEpisodeTo": "12-09-2024",
        "renderingPractitioner": "Dr. Rebecca Nelson",
        "primaryDiagnosisCodes": ["C50.911", "Z51.11"],
        "secondaryDiagnosisCodes": ["D64.9", "E03.9"],
        "certStatus": "Document Signed",
        "certSignedDate": "10-15-2024",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Post-chemotherapy care",
        "cpoMinsCaptured": 140,
        "newDocs": 7,
        "newCpoDocsCreated": 2
      },
      {
        "id": 12,
        "patientId": "P012",
        "patientLastName": "White",
        "patientFirstName": "Richard",
        "patientMiddleName": "D",
        "patientDOB": "07-30-1963",
        "contactNumber": "555-234-8901",
        "physicianName": "Dr. Carol Martin",
        "pg": "Heritage Medical Partners",
        "hhah": "Reliable Home Health",
        "patientInsurance": "Anthem",
        "patientInEHR": "no",
        "patientSOC": "02-26-2024",
        "patientEpisodeFrom": "08-24-2024",
        "patientEpisodeTo": "10-22-2024",
        "renderingPractitioner": "Dr. Brian Clark",
        "primaryDiagnosisCodes": ["I63.9", "I69.30"],
        "secondaryDiagnosisCodes": ["I10", "E11.9"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-01-2024",
        "recertStatus": "Document Prepared",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Speech therapy sessions required",
        "cpoMinsCaptured": 90,
        "newDocs": 3,
        "newCpoDocsCreated": 2
      },
      {
        "id": 13,
        "patientId": "P013",
        "patientLastName": "Harris",
        "patientFirstName": "Elizabeth",
        "patientMiddleName": "S",
        "patientDOB": "01-12-1987",
        "contactNumber": "555-345-9012",
        "physicianName": "Dr. Daniel Robinson",
        "pg": "Summit Medical Center",
        "hhah": "Dedicated Home Health",
        "patientInsurance": "Medicaid",
        "patientInEHR": "yes",
        "patientSOC": "09-21-2023",
        "patientEpisodeFrom": "09-15-2024",
        "patientEpisodeTo": "11-13-2024",
        "renderingPractitioner": "Dr. Jennifer Lopez",
        "primaryDiagnosisCodes": ["O90.4", "Z39.0"],
        "secondaryDiagnosisCodes": ["F53.0", "D64.9"],
        "certStatus": "Document Billed",
        "certSignedDate": "09-25-2024",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Postpartum care with newborn monitoring",
        "cpoMinsCaptured": 105,
        "newDocs": 4,
        "newCpoDocsCreated": 2
      },
      {
        "id": 14,
        "patientId": "P014",
        "patientLastName": "Martin",
        "patientFirstName": "Charles",
        "patientMiddleName": "P",
        "patientDOB": "05-20-1955",
        "contactNumber": "555-456-0123",
        "physicianName": "Dr. Susan Baker",
        "pg": "Cornerstone Health Group",
        "hhah": "Professional Home Health",
        "patientInsurance": "United Healthcare",
        "patientInEHR": "no",
        "patientSOC": "10-12-2023",
        "patientEpisodeFrom": "08-07-2024",
        "patientEpisodeTo": "10-05-2024",
        "renderingPractitioner": "Dr. Robert Johnson",
        "primaryDiagnosisCodes": ["Z96.651", "M96.89"],
        "secondaryDiagnosisCodes": ["M17.0", "E66.01"],
        "certStatus": "Document Signed",
        "certSignedDate": "08-15-2024",
        "recertStatus": "Document Signed",
        "recertSignedDate": "09-30-2024",
        "f2fEligibility": "yes",
        "patientRemarks": "Joint replacement rehabilitation",
        "cpoMinsCaptured": 125,
        "newDocs": 3,
        "newCpoDocsCreated": 2
      },
      {
        "id": 15,
        "patientId": "P015",
        "patientLastName": "Thompson",
        "patientFirstName": "Linda",
        "patientMiddleName": "G",
        "patientDOB": "09-08-1978",
        "contactNumber": "555-567-1234",
        "physicianName": "Dr. James Wright",
        "pg": "Metropolitan Medical Associates",
        "hhah": "First Choice Home Health",
        "patientInsurance": "Aetna",
        "patientInEHR": "yes",
        "patientSOC": "08-06-2024",
        "patientEpisodeFrom": "08-06-2024",
        "patientEpisodeTo": "10-04-2024",
        "renderingPractitioner": "Dr. Mary Wilson",
        "primaryDiagnosisCodes": ["L89.314", "E44.0"],
        "secondaryDiagnosisCodes": ["E11.9", "I10"],
        "certStatus": "Document Prepared",
        "certSignedDate": "",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Wound care and nutritional support",
        "cpoMinsCaptured": 25,
        "newDocs": 2,
        "newCpoDocsCreated": 1
      },
      {
        "id": 16,
        "patientId": "P016",
        "patientLastName": "Garcia",
        "patientFirstName": "Maria",
        "patientMiddleName": "J",
        "patientDOB": "11-23-1992",
        "contactNumber": "555-678-2345",
        "physicianName": "Dr. John Peterson",
        "pg": "Alliance Medical Partners",
        "hhah": "Progressive Home Health",
        "patientInsurance": "BlueCross",
        "patientInEHR": "no",
        "patientSOC": "08-30-2024",
        "patientEpisodeFrom": "08-30-2024",
        "patientEpisodeTo": "10-28-2024",
        "renderingPractitioner": "Dr. Michael Brooks",
        "primaryDiagnosisCodes": ["G35", "R26.89"],
        "secondaryDiagnosisCodes": ["G47.00", "F41.1"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-10-2024",
        "recertStatus": "Document Prepared",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Multiple sclerosis management plan",
        "cpoMinsCaptured": 115,
        "newDocs": 4,
        "newCpoDocsCreated": 2
      },
      {
        "id": 17,
        "patientId": "P017",
        "patientLastName": "Clark",
        "patientFirstName": "William",
        "patientMiddleName": "N",
        "patientDOB": "03-04-1967",
        "contactNumber": "555-789-3456",
        "physicianName": "Dr. Laura Garcia",
        "pg": "Prestige Health System",
        "hhah": "Exceptional Home Health",
        "patientInsurance": "Cigna",
        "patientInEHR": "yes",
        "patientSOC": "06-18-2024",
        "patientEpisodeFrom": "08-17-2024",
        "patientEpisodeTo": "10-15-2024",
        "renderingPractitioner": "Dr. Thomas Lee",
        "primaryDiagnosisCodes": ["I25.10", "I50.9"],
        "secondaryDiagnosisCodes": ["E78.5", "I10"],
        "certStatus": "Document Billed",
        "certSignedDate": "08-25-2024",
        "recertStatus": "Document Signed",
        "recertSignedDate": "10-01-2024",
        "f2fEligibility": "yes",
        "patientRemarks": "Cardiac rehabilitation program",
        "cpoMinsCaptured": 135,
        "newDocs": 3,
        "newCpoDocsCreated": 2
      },
      {
        "id": 18,
        "patientId": "P018",
        "patientLastName": "Lewis",
        "patientFirstName": "Dorothy",
        "patientMiddleName": "F",
        "patientDOB": "07-19-1950",
        "contactNumber": "555-890-4567",
        "physicianName": "Dr. Steven Clark",
        "pg": "Comprehensive Medical Group",
        "hhah": "Attentive Home Health",
        "patientInsurance": "Medicare",
        "patientInEHR": "yes",
        "patientSOC": "07-26-2024",
        "patientEpisodeFrom": "09-24-2024",
        "patientEpisodeTo": "11-22-2024",
        "renderingPractitioner": "Dr. Patricia Moore",
        "primaryDiagnosisCodes": ["J44.9", "J96.91"],
        "secondaryDiagnosisCodes": ["I10", "E11.9"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-30-2024",
        "recertStatus": "Document Prepared",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "COPD management with oxygen therapy",
        "cpoMinsCaptured": 95,
        "newDocs": 3,
        "newCpoDocsCreated": 1
      },
      {
        "id": 19,
        "patientId": "P019",
        "patientLastName": "Lee",
        "patientFirstName": "Robert",
        "patientMiddleName": "C",
        "patientDOB": "08-05-1971",
        "contactNumber": "555-901-5678",
        "physicianName": "Dr. Karen Taylor",
        "pg": "Quality Care Medical",
        "hhah": "Dedicated Health Services",
        "patientInsurance": "Humana",
        "patientInEHR": "no",
        "patientSOC": "08-28-2024",
        "patientEpisodeFrom": "08-28-2024",
        "patientEpisodeTo": "10-26-2024",
        "renderingPractitioner": "Dr. Christopher White",
        "primaryDiagnosisCodes": ["S82.101A", "M25.569"],
        "secondaryDiagnosisCodes": ["E66.01", "I10"],
        "certStatus": "Document Prepared",
        "certSignedDate": "",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "yes",
        "patientRemarks": "Fracture recovery with physical therapy",
        "cpoMinsCaptured": 30,
        "newDocs": 2,
        "newCpoDocsCreated": 1
      },
      {
        "id": 20,
        "patientId": "P020",
        "patientLastName": "Walker",
        "patientFirstName": "Margaret",
        "patientMiddleName": "H",
        "patientDOB": "04-16-1960",
        "contactNumber": "555-012-6789",
        "physicianName": "Dr. Paul Martinez",
        "pg": "Riverside Medical Center",
        "hhah": "Superior Home Health",
        "patientInsurance": "TRICARE",
        "patientInEHR": "yes",
        "patientSOC": "03-23-2024",
        "patientEpisodeFrom": "09-19-2024",
        "patientEpisodeTo": "11-17-2024",
        "renderingPractitioner": "Dr. Sarah Rodriguez",
        "primaryDiagnosisCodes": ["G20", "R26.81"],
        "secondaryDiagnosisCodes": ["F32.9", "I10"],
        "certStatus": "Document Signed",
        "certSignedDate": "09-25-2024",
        "recertStatus": "Document Billed",
        "recertSignedDate": "10-01-2024",
        "f2fEligibility": "yes",
        "patientRemarks": "Parkinson's disease management",
        "cpoMinsCaptured": 120,
        "newDocs": 4,
        "newCpoDocsCreated": 2
      },
      {
        "id": 21,
        "patientId": 'P001',
        "patientLastName": 'Smith',
        "patientFirstName": 'John',
        "patientMiddleName": 'A',
        "patientDOB": '05-15-1980',
        "contactNumber": '555-123-4567',
        "physicianName": 'Dr. Sarah Johnson',
        "pg": 'ABC Medical Group',
        "hhah": 'Home Health Care Plus',
        "patientInsurance": 'Medicare',
        "patientInEHR": 'yes',
        "patientSOC": '01-01-2024',
        "patientEpisodeFrom": '01-01-2024',
        "patientEpisodeTo": '03-31-2024',
        "renderingPractitioner": 'Dr. Michael Chen',
        "primaryDiagnosisCodes": ['E11.9', 'I10'],
        "secondaryDiagnosisCodes": ['M17.9', 'E78.5'],
        "certStatus": 'Document Signed',
        "certSignedDate": '01-15-2024',
        "recertStatus": 'Document Prepared',
        "recertSignedDate": '',
        "f2fEligibility": 'yes',
        "patientRemarks": 'Regular follow-up required',
        "cpoMinsCaptured": 120,
        "newDocs": 2,
        "newCpoDocsCreated": 1
      },
      {
        "id": 22,
        "patientId": "P002",
        "patientLastName": "Johnson",
        "patientFirstName": "Mary",
        "patientMiddleName": "L",
        "patientDOB": "08-22-1975",
        "contactNumber": "555-987-6543",
        "physicianName": "Dr. James Wilson",
        "pg": "XYZ Healthcare",
        "hhah": "Comfort Care Home Health",
        "patientInsurance": "Blue Cross",
        "patientInEHR": "yes",
        "patientSOC": "02-01-2024",
        "patientEpisodeFrom": "02-01-2024",
        "patientEpisodeTo": "04-30-2024",
        "renderingPractitioner": "Dr. Emily Rodriguez",
        "primaryDiagnosisCodes": ["I25.10", "E11.65"],
        "secondaryDiagnosisCodes": ["I10", "M17.9"],
        "certStatus": "Document Billed",
        "certSignedDate": "02-10-2024",
        "recertStatus": "Document Signed",
        "recertSignedDate": "03-15-2024",
        "f2fEligibility": "yes",
        "patientRemarks": "Needs physical therapy",
        "cpoMinsCaptured": 90,
        "newDocs": 8,
        "newCpoDocsCreated": 1
      },
      {
        "id": 23,
        "patientId": "P003",
        "patientLastName": "Williams",
        "patientFirstName": "Robert",
        "patientMiddleName": "T",
        "patientDOB": "03-10-1965",
        "contactNumber": "555-456-7890",
        "physicianName": "Dr. Lisa Thompson",
        "pg": "Sunrise Medical",
        "hhah": "Elite Home Health",
        "patientInsurance": "Aetna",
        "patientInEHR": "no",
        "patientSOC": "03-01-2024",
        "patientEpisodeFrom": "03-01-2024",
        "patientEpisodeTo": "05-31-2024",
        "renderingPractitioner": "Dr. David Brown",
        "primaryDiagnosisCodes": ["J44.9", "E11.9"],
        "secondaryDiagnosisCodes": ["I10", "E78.5"],
        "certStatus": "Document Prepared",
        "certSignedDate": "",
        "recertStatus": "Document not received",
        "recertSignedDate": "",
        "f2fEligibility": "no",
        "patientRemarks": "High risk patient",
        "cpoMinsCaptured": 60,
        "newDocs": 7,
        "newCpoDocsCreated": 3
      }
    ]);
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

  // Options for searchable dropdowns
  const physicianOptions = useMemo(() => [...new Set(patients.map(p => p.physicianName).filter(Boolean))], [patients]);
  const pgOptions = useMemo(() => [...new Set(patients.map(p => p.pg).filter(Boolean))], [patients]);
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
    if (!formData.physicianName) newErrors.physicianName = 'Physician name is required';
    if (!formData.pg) newErrors.pg = 'PG is required';
    if (!formData.hhah) newErrors.hhah = 'HHAH is required';
    if (!formData.patientInEHR) newErrors.patientInEHR = 'EHR status is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const newPatient = {
      id: patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1,
      ...formData,
      cpoMinsCaptured: 0,
      newDocs: 0,
      newCpoDocsCreated: 0
    };
    
    setPatients([...patients, newPatient]);
    
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
    
    const updatedPatients = patients.map(patient => 
      patient.id === editingPatient.id ? editingPatient : patient
    );
    
    setPatients(updatedPatients);
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

  // Sort patients - New Docs in descending order and New CPO Docs in ascending order
  const sortedPatients = useMemo(() => {
    // First normalize the data to ensure consistent types
    const normalizedData = filteredPatientsBySearch.map(patient => ({
      ...patient,
      newDocs: parseInt(patient.newDocs, 10) || 0,
      newCpoDocsCreated: parseInt(patient.newCpoDocsCreated, 10) || 0
    }));
    
    return [...normalizedData].sort((a, b) => {
      // Primary sort: New Docs (descending)
      if (a.newDocs !== b.newDocs) {
        return b.newDocs - a.newDocs; // Descending order
      }
      
      // Secondary sort: New CPO Docs (ascending)
      if (a.newCpoDocsCreated !== b.newCpoDocsCreated) {
        return a.newCpoDocsCreated - b.newCpoDocsCreated; // Ascending order
      }
      
      // Tertiary sort: Patient ID (ascending) for consistent ordering
      return a.patientId.localeCompare(b.patientId);
    });
  }, [filteredPatientsBySearch]);

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
                  <label>Patient ID <span className="required">*</span></label>
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
                  <label>Last Name <span className="required">*</span></label>
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
                  <label>First Name <span className="required">*</span></label>
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
                  <label>Date of Birth <span className="required">*</span></label>
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
                  <label>Rendering Practitioner</label>
                  <div className="searchable-dropdown">
                    <input
                      type="text"
                      value={editingPatient ? editingPatient.renderingPractitioner : formData.renderingPractitioner}
                      onChange={(e) => handleSearchChange('renderingPractitioner', e.target.value)}
                      onFocus={(e) => setSearchTerm(prev => ({ ...prev, renderingPractitioner: e.target.value }))}
                      placeholder="Search or type practitioner name..."
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
                </div>

                <div className="form-group">
                  <label>Physician Name <span className="required">*</span></label>
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
                  <label>PG <span className="required">*</span></label>
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
                  <label>HHAH <span className="required">*</span></label>
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
                  <label>Patient Present in EHR <span className="required">*</span></label>
                  <select
                    name="patientInEHR"
                    value={editingPatient ? editingPatient.patientInEHR : formData.patientInEHR}
                    onChange={handleChange}
                    className={errors.patientInEHR ? 'error' : ''}
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {errors.patientInEHR && <span className="error-text">{errors.patientInEHR}</span>}
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
                <th>Remarks</th>
                <th data-sort-info="Primary sort: always in descending order">New Docs</th>
                <th data-sort-info="Secondary sort: always in ascending order">New CPO Docs</th>
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