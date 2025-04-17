/**
 * Mock Data Service
 * 
 * This file provides mock data services for the application.
 * In a real application, these functions would be replaced with API calls
 * while maintaining the same return structure to minimize refactoring.
 */

// Use January 2025 as our fixed test month for all test cases
// This ensures the data works regardless of when you're running the app
const fixedYear = 2025;
const fixedMonth = 1; // January (1-indexed)

// Create fixed dates for January 2025 for testing
const fixedMonthStart = `01/01/2025`;
const fixedMonthMiddle = `01/15/2025`;
const fixedMonthEnd = `01/31/2025`;

// Mock patient data by PG
const mockPatientsByPG = {
  "enhabit - lubbock": [
    {
      id: "VT001",
      patientId: "P1001",
      patientFirstName: "John",
      patientMiddleName: "A",
      patientLastName: "Smith",
      patientDOB: "05/12/1962",
      hhah: "CaringHands HHA",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["I10"], // Hypertension
      secondaryDiagnosisCodes: ["I50.9", "E11.9"], // Heart failure, Type 2 diabetes
      patientSOC: "01/15/2024",
      patientEpisodeFrom: "01/15/2024",
      patientEpisodeTo: "07/14/2025",
      cpoMinsCaptured: 45,
      certStatus: "Document Signed",
      certSignedDate: fixedMonthMiddle, // Signed in fixed test month - should qualify for CERT
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Sarah Johnson",
      patientInEHR: true,
      patientRemarks: "CERT eligible"
    },
    {
      id: "VT002",
      patientId: "P1002",
      patientFirstName: "Mary",
      patientMiddleName: "E",
      patientLastName: "Johnson",
      patientDOB: "08/23/1955",
      hhah: "HomeHealth Plus",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["E11.9"], // Type 2 diabetes
      secondaryDiagnosisCodes: ["I10"], // Only 1 secondary code - not enough
      patientSOC: "02/03/2024",
      patientEpisodeFrom: "02/03/2024",
      patientEpisodeTo: "08/02/2025",
      cpoMinsCaptured: 25, // Not enough CPO minutes
      certStatus: "Document Signed",
      certSignedDate: fixedMonthStart, // Signed in fixed test month
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Robert Chen",
      patientInEHR: true,
      patientRemarks: "ICD codes incomplete"
    },
    {
      id: "VT003",
      patientId: "P1003",
      patientFirstName: "Robert",
      patientMiddleName: "J",
      patientLastName: "Williams",
      patientDOB: "11/04/1970",
      hhah: "Comfort Care Services",
      patientInsurance: "Medicaid",
      primaryDiagnosisCodes: ["J44.9"], // COPD
      secondaryDiagnosisCodes: ["I50.9", "F32.9"], // Heart failure, Depression
      patientSOC: "01/20/2024",
      patientEpisodeFrom: "01/20/2024",
      patientEpisodeTo: "07/19/2025",
      cpoMinsCaptured: 37, // Enough for CPO
      certStatus: "Document Signed",
      certSignedDate: "12/10/2024", // Not in test month
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Maria Garcia",
      patientInEHR: true,
      patientRemarks: "CPO eligible"
    },
    {
      id: "VT004",
      patientId: "P1004",
      patientFirstName: "Patricia",
      patientMiddleName: "L",
      patientLastName: "Brown",
      patientDOB: "03/17/1948",
      hhah: "Elite Home Health",
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
      recertSignedDate: fixedMonthEnd, // Signed in fixed test month - should qualify for RECERT
      physicianName: "Dr. James Wilson",
      patientInEHR: true,
      patientRemarks: "RECERT eligible"
    },
    {
      id: "VT005",
      patientId: "P1005",
      patientFirstName: "Jennifer",
      patientMiddleName: "A",
      patientLastName: "Davis",
      patientDOB: "07/29/1965",
      hhah: "HomeHealth Plus",
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
      patientRemarks: "CPO not eligible"
    },
    {
      id: "VT006",
      patientId: "P1006",
      patientFirstName: "Thomas",
      patientMiddleName: "R",
      patientLastName: "Anderson",
      patientDOB: "09/03/1957",
      hhah: "CaringHands HHA",
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
      recertSignedDate: fixedMonthStart, // Signed in fixed test month - should qualify for RECERT
      physicianName: "Dr. Michael Lee",
      patientInEHR: true,
      patientRemarks: "CPO and RECERT eligible"
    }
  ],
  
  "brmc home care - brownfield": [
    {
      id: "BF001",
      patientId: "P2001",
      patientFirstName: "Michael",
      patientMiddleName: "T",
      patientLastName: "Cooper",
      patientDOB: "09/22/1957",
      hhah: "Brownfield Home Care",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["I25.10"], // Coronary Artery Disease
      secondaryDiagnosisCodes: ["E11.9", "I10"], // Type 2 diabetes, Hypertension
      patientSOC: "12/10/2024",
      patientEpisodeFrom: "12/10/2024",
      patientEpisodeTo: "06/09/2025",
      cpoMinsCaptured: 50,
      certStatus: "Document Signed",
      certSignedDate: fixedMonthStart, // Signed in fixed test month - should qualify for CERT
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Kevin Jones",
      patientInEHR: true,
      patientRemarks: "CERT eligible with good CPO minutes"
    },
    {
      id: "BF002",
      patientId: "P2002",
      patientFirstName: "Susan",
      patientMiddleName: "L",
      patientLastName: "Walker",
      patientDOB: "04/15/1962",
      hhah: "Brownfield Home Care",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["J44.9"], // COPD
      secondaryDiagnosisCodes: ["F32.9", "G47.33"], // Depression, Sleep apnea
      patientSOC: "11/05/2024",
      patientEpisodeFrom: "11/05/2024",
      patientEpisodeTo: "05/04/2025",
      cpoMinsCaptured: 35,
      certStatus: "Document Signed",
      certSignedDate: "11/05/2024", // Not in test month
      recertStatus: "Document Signed",
      recertSignedDate: fixedMonthMiddle, // Signed in fixed test month - should qualify for RECERT
      physicianName: "Dr. Linda Martinez",
      patientInEHR: true,
      patientRemarks: "RECERT eligible with CPO"
    },
    {
      id: "BF003",
      patientId: "P2003",
      patientFirstName: "George",
      patientMiddleName: "W",
      patientLastName: "Miller",
      patientDOB: "02/28/1950",
      hhah: "Brownfield Regional Care",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["I50.9"], // Heart failure
      secondaryDiagnosisCodes: ["N18.3", "I48.91"], // Chronic kidney disease, Atrial fibrillation
      patientSOC: "01/08/2024",
      patientEpisodeFrom: "01/08/2024",
      patientEpisodeTo: "07/07/2025",
      cpoMinsCaptured: 42,
      certStatus: "Document not received",
      certSignedDate: "",
      recertStatus: "Document not received",
      recertSignedDate: "",
      physicianName: "Dr. Thomas Williams",
      patientInEHR: true,
      patientRemarks: "CPO minutes sufficient, docs not signed yet"
    }
  ],
  
  "memorial hospital": [
    {
      id: "MH001",
      patientId: "P3001",
      patientFirstName: "Maria",
      patientMiddleName: "L",
      patientLastName: "Garcia",
      patientDOB: "12/15/1968",
      hhah: "Elite Home Health",
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
      patientRemarks: "CPO eligible only"
    }
  ],
  
  // Add more standardized variations for better matching
  "brownfield home care": [
    {
      id: "BHC001",
      patientId: "P5001",
      patientFirstName: "Alice",
      patientMiddleName: "J",
      patientLastName: "Reynolds",
      patientDOB: "07/18/1959",
      hhah: "Brownfield HHA",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["I10", "E11.9", "J45.909"], 
      secondaryDiagnosisCodes: ["F32.9", "M54.5"],
      patientSOC: "12/15/2024",
      patientEpisodeFrom: "12/15/2024",
      patientEpisodeTo: "06/14/2025",
      cpoMinsCaptured: 40,
      certStatus: "Document Signed",
      certSignedDate: fixedMonthMiddle,
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Phillip Morris",
      patientInEHR: true,
      patientRemarks: "CERT and CPO eligible"
    }
  ],
  
  "pg gamma": [
    {
      id: "PG001",
      patientId: "P7001",
      patientFirstName: "David",
      patientMiddleName: "R",
      patientLastName: "Wilson",
      patientDOB: "03/15/1958",
      hhah: "Gamma Health Services",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["I10", "E11.9"], // Hypertension, Diabetes
      secondaryDiagnosisCodes: ["I50.9", "F32.9", "J44.9"], // Heart failure, Depression, COPD
      patientSOC: "12/01/2024",
      patientEpisodeFrom: "12/01/2024",
      patientEpisodeTo: "06/01/2025",
      cpoMinsCaptured: 45,
      billingCode: "G0181",
      charges: 120.00,
      pos: "11",
      units: 1,
      certStatus: "Document Signed",
      certSignedDate: "01/15/2025", // January 2025 - CERT eligible
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Amanda White",
      patientInEHR: true,
      patientRemarks: "CERT eligible - January 2025",
      docType: "CERT"
    },
    {
      id: "PG002",
      patientId: "P7002",
      patientFirstName: "Sarah",
      patientMiddleName: "L",
      patientLastName: "Martinez",
      patientDOB: "07/22/1962",
      hhah: "Gamma Health Services",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["J44.9", "I48.91"], // COPD, Atrial fibrillation
      secondaryDiagnosisCodes: ["E78.5", "I10", "M54.5"], // Hyperlipidemia, Hypertension, Low back pain
      patientSOC: "11/15/2024",
      patientEpisodeFrom: "11/15/2024",
      patientEpisodeTo: "05/14/2025",
      cpoMinsCaptured: 38,
      billingCode: "G0181",
      charges: 120.00,
      pos: "11",
      units: 1,
      certStatus: "Document not received",
      certSignedDate: "",
      recertStatus: "Document Signed",
      recertSignedDate: "01/10/2025", // January 2025 - RECERT eligible
      physicianName: "Dr. James Thompson",
      patientInEHR: true,
      patientRemarks: "RECERT eligible - January 2025",
      docType: "RECERT"
    },
    {
      id: "PG003",
      patientId: "P7003",
      patientFirstName: "Michael",
      patientMiddleName: "T",
      patientLastName: "Anderson",
      patientDOB: "11/30/1955",
      hhah: "Gamma Health Services",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["I25.10", "M17.0"], // Coronary artery disease, Osteoarthritis of knee
      secondaryDiagnosisCodes: ["G89.4", "E11.9", "I10"], // Chronic pain syndrome, Diabetes, Hypertension
      patientSOC: "01/05/2025",
      patientEpisodeFrom: "01/05/2025",
      patientEpisodeTo: "07/04/2025",
      cpoMinsCaptured: 42,
      billingCode: "G0181",
      charges: 120.00,
      pos: "11",
      units: 1,
      certStatus: "Document Signed",
      certSignedDate: "01/20/2025", // January 2025 - CERT eligible
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Lisa Chen",
      patientInEHR: true,
      patientRemarks: "CPO only - January 2025",
      docType: "CPO"
    },
    {
      id: "PG004",
      patientId: "P7004",
      patientFirstName: "Patricia",
      patientMiddleName: "A",
      patientLastName: "Rodriguez",
      patientDOB: "09/18/1960",
      hhah: "Gamma Health Services",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["G20", "F32.9"], // Parkinson's disease, Depression
      secondaryDiagnosisCodes: ["G47.33", "M54.5", "E78.5"], // Sleep apnea, Low back pain, Hyperlipidemia
      patientSOC: "12/20/2024",
      patientEpisodeFrom: "12/20/2024",
      patientEpisodeTo: "06/19/2025",
      cpoMinsCaptured: 35,
      billingCode: "G0181",
      charges: 120.00,
      pos: "11",
      units: 1,
      certStatus: "Document Signed",
      certSignedDate: "12/20/2024", // December 2024 - not CERT eligible for January
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Robert Wilson",
      patientInEHR: true,
      patientRemarks: "CPO only - January 2025",
      docType: "CPO"
    },
    {
      id: "PG005",
      patientId: "P7005",
      patientFirstName: "William",
      patientMiddleName: "J",
      patientLastName: "Taylor",
      patientDOB: "05/25/1959",
      hhah: "Gamma Health Services",
      patientInsurance: "Medicare",
      primaryDiagnosisCodes: ["I50.9", "I48.91"], // Heart failure, Atrial fibrillation
      secondaryDiagnosisCodes: ["E11.9", "I10", "J44.9"], // Diabetes, Hypertension, COPD
      patientSOC: "01/10/2025",
      patientEpisodeFrom: "01/10/2025",
      patientEpisodeTo: "07/09/2025",
      cpoMinsCaptured: 40,
      billingCode: "G0181",
      charges: 120.00,
      pos: "11",
      units: 1,
      certStatus: "Document Signed",
      certSignedDate: "01/25/2025", // January 2025 - CERT eligible
      recertStatus: "Not Required",
      recertSignedDate: "",
      physicianName: "Dr. Maria Sanchez",
      patientInEHR: true,
      patientRemarks: "CPO only - January 2025",
      docType: "CPO"
    }
  ]
};

/**
 * Returns mock patient data for a specified PG
 * This function can be replaced with a real API call when ready
 * while keeping the same return structure
 * 
 * @param {string} pgNameParam - The name of the PG to get patients for
 * @returns {Array} - Array of patient data objects
 */
export const getMockPatientsByPG = (pgNameParam) => {
  console.log(`Getting mock patients for PG: "${pgNameParam}"`);
  
  // Handle empty param case
  if (!pgNameParam) {
    console.log("Empty PG name provided, returning empty array");
    return [];
  }
  
  // SPECIAL CASE: Handle the problematic "brmc" case directly
  if (pgNameParam.toLowerCase().includes("brmc") || 
      pgNameParam.toLowerCase().includes("brownfield")) {
    console.log("FOUND SPECIAL CASE: BRMC/Brownfield PG, using predefined patients");
    
    // Use the brmc patients always for any brownfield-related query
    const brmcPatients = [
      {
        id: "BF001",
        patientId: "P2001",
        patientFirstName: "Michael",
        patientMiddleName: "T",
        patientLastName: "Cooper",
        patientDOB: "09/22/1957",
        hhah: "Brownfield Home Care",
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I25.10", "I10", "E11.9"], // Ensure 3+ codes
        secondaryDiagnosisCodes: ["J44.9", "F32.9"],
        patientSOC: "12/10/2024",
        patientEpisodeFrom: "12/10/2024",
        patientEpisodeTo: "06/09/2025",
        cpoMinsCaptured: 50,
        certStatus: "Document Signed",
        certSignedDate: fixedMonthStart,
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Kevin Jones",
        patientInEHR: true,
        patientRemarks: "CERT eligible with good CPO minutes"
      },
      {
        id: "BF002",
        patientId: "P2002",
        patientFirstName: "Susan",
        patientMiddleName: "L",
        patientLastName: "Walker",
        patientDOB: "04/15/1962",
        hhah: "Brownfield Home Care",
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["J44.9", "I10"], 
        secondaryDiagnosisCodes: ["F32.9", "G47.33", "E11.9"],
        patientSOC: "11/05/2024",
        patientEpisodeFrom: "11/05/2024",
        patientEpisodeTo: "05/04/2025",
        cpoMinsCaptured: 35,
        certStatus: "Document Signed",
        certSignedDate: "11/05/2024",
        recertStatus: "Document Signed",
        recertSignedDate: fixedMonthMiddle,
        physicianName: "Dr. Linda Martinez",
        patientInEHR: true,
        patientRemarks: "RECERT eligible with CPO"
      },
      {
        id: "BF003",
        patientId: "P2003",
        patientFirstName: "George",
        patientMiddleName: "W",
        patientLastName: "Miller",
        patientDOB: "02/28/1950",
        hhah: "Brownfield Regional Care",
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I50.9", "E11.9"],
        secondaryDiagnosisCodes: ["N18.3", "I48.91", "J44.9"],
        patientSOC: "01/08/2024",
        patientEpisodeFrom: "01/08/2024",
        patientEpisodeTo: "07/07/2025",
        cpoMinsCaptured: 42,
        certStatus: "Document Signed", // Changed to signed for testing
        certSignedDate: fixedMonthEnd, // Changed to a valid date
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Thomas Williams",
        patientInEHR: true,
        patientRemarks: "CERT and CPO eligible"
      },
      {
        id: "BHC001",
        patientId: "P5001",
        patientFirstName: "Alice",
        patientMiddleName: "J",
        patientLastName: "Reynolds",
        patientDOB: "07/18/1959",
        hhah: "Brownfield HHA",
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I10", "E11.9", "J45.909"], 
        secondaryDiagnosisCodes: ["F32.9", "M54.5"],
        patientSOC: "12/15/2024",
        patientEpisodeFrom: "12/15/2024",
        patientEpisodeTo: "06/14/2025",
        cpoMinsCaptured: 40,
        certStatus: "Document Signed",
        certSignedDate: fixedMonthMiddle,
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Phillip Morris",
        patientInEHR: true,
        patientRemarks: "CERT and CPO eligible"
      }
    ];
    
    // Add the PG name to each patient
    return brmcPatients.map(patient => ({
      ...patient,
      patientPG: pgNameParam.toLowerCase().trim()
    }));
  }
  
  // We need to normalize pgName for consistent comparison
  const normalizedPgName = pgNameParam.toLowerCase().trim();
  
  // Ultra-aggressive normalization to handle any variation
  const ultraNormalize = (str) => {
    // Remove all non-alphanumeric chars and lowercase
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };
  
  // Log available PG keys for debugging
  console.log(`Normalized PG name: "${normalizedPgName}"`);
  console.log(`Available PG keys:`, Object.keys(mockPatientsByPG));
  
  // Try to find a matching PG key using super aggressive matching
  const normalizedSearchKey = ultraNormalize(normalizedPgName);
  console.log(`Ultra-normalized search key: "${normalizedSearchKey}"`);
  
  let matchingKey = null;
  for (const key of Object.keys(mockPatientsByPG)) {
    const normalizedKey = ultraNormalize(key);
    console.log(`Comparing "${normalizedKey}" with "${normalizedSearchKey}"`);
    
    if (normalizedKey === normalizedSearchKey || 
        normalizedKey.includes(normalizedSearchKey) || 
        normalizedSearchKey.includes(normalizedKey)) {
      matchingKey = key;
      console.log(`Found matching PG key: "${key}" for search: "${normalizedPgName}"`);
      break;
    }
  }
  
  // Return patients for the specific PG if we have them
  const patientsForPG = matchingKey ? mockPatientsByPG[matchingKey] : [];
  
  // If we don't have predefined data for this PG, generate some random patients
  if (patientsForPG.length === 0) {
    console.log(`No predefined patients for "${pgNameParam}", generating placeholder data`);
    
    // Generate 3 placeholder patients for this PG with recognizable IDs
    // First 2 chars of PG name, capitalized
    const pgPrefix = pgNameParam.replace(/\s+/g, '').substring(0, 2).toUpperCase();
    
    const generatedPatients = [
      {
        id: `${pgPrefix}001`,
        patientId: `P${Math.floor(Math.random() * 10000)}`,
        patientFirstName: "James",
        patientMiddleName: "R",
        patientLastName: "Taylor",
        patientDOB: "06/14/1960",
        hhah: pgNameParam,
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I10", "E11.9"], // Hypertension, Diabetes
        secondaryDiagnosisCodes: ["I50.9", "F32.9", "J44.9"], // Heart failure, Depression, COPD
        patientSOC: "12/01/2024",
        patientEpisodeFrom: "12/01/2024",
        patientEpisodeTo: "06/01/2025",
        cpoMinsCaptured: 45,
        certStatus: "Document Signed",
        certSignedDate: fixedMonthStart,
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. John Smith",
        patientInEHR: true,
        patientRemarks: "Auto-generated patient for " + pgNameParam
      },
      {
        id: `${pgPrefix}002`,
        patientId: `P${Math.floor(Math.random() * 10000)}`,
        patientFirstName: "Barbara",
        patientMiddleName: "A",
        patientLastName: "Wilson",
        patientDOB: "11/23/1955",
        hhah: pgNameParam,
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["I48.91", "I25.10"], // Atrial fibrillation, Coronary artery disease
        secondaryDiagnosisCodes: ["E78.5", "N18.3", "J45.909"], // Hyperlipidemia, Chronic kidney disease, Asthma
        patientSOC: "11/15/2024",
        patientEpisodeFrom: "11/15/2024",
        patientEpisodeTo: "05/14/2025",
        cpoMinsCaptured: 38,
        certStatus: "Document not received",
        certSignedDate: "",
        recertStatus: "Document Signed",
        recertSignedDate: fixedMonthMiddle,
        physicianName: "Dr. Mary Johnson",
        patientInEHR: true,
        patientRemarks: "Auto-generated patient for " + pgNameParam
      },
      {
        id: `${pgPrefix}003`,
        patientId: `P${Math.floor(Math.random() * 10000)}`,
        patientFirstName: "Richard",
        patientMiddleName: "J",
        patientLastName: "Brown",
        patientDOB: "09/03/1965",
        hhah: pgNameParam,
        patientInsurance: "Medicare",
        primaryDiagnosisCodes: ["M17.0", "M54.5", "G89.4"], // Osteoarthritis of knee, Low back pain, Chronic pain syndrome
        secondaryDiagnosisCodes: ["F41.1", "G47.33"], // Anxiety disorder, Sleep apnea
        patientSOC: "01/05/2025",
        patientEpisodeFrom: "01/05/2025",
        patientEpisodeTo: "07/04/2025",
        cpoMinsCaptured: 33,
        certStatus: "Document Signed",
        certSignedDate: fixedMonthEnd,
        recertStatus: "Not Required",
        recertSignedDate: "",
        physicianName: "Dr. Robert Davis",
        patientInEHR: true,
        patientRemarks: "Auto-generated patient for " + pgNameParam
      }
    ];
    
    console.log(`Generated ${generatedPatients.length} random patients for PG: ${pgNameParam}`);
    
    // Add the PG name to each patient record
    return generatedPatients.map(patient => ({
      ...patient,
      patientPG: normalizedPgName
    }));
  }
  
  // Add the PG name to each patient record if it's from our predefined data
  const patientsWithPG = patientsForPG.map(patient => ({
    ...patient,
    patientPG: normalizedPgName
  }));
  
  console.log(`Found ${patientsWithPG.length} patients for PG: ${pgNameParam}`);
  return patientsWithPG;
};

// Export mock data dates for use in other components
export const mockDataDates = {
  fixedYear,
  fixedMonth,
  fixedMonthStart,
  fixedMonthMiddle,
  fixedMonthEnd
};

// Sample PG data for testing
const samplePatientGroups = {
  "Brownfield Regional Medical Center": [
    {
      id: "BRMC001",
      patientName: "John Doe",
      condition: "Diabetes"
    },
    {
      id: "BRMC002",
      patientName: "Jane Smith",
      condition: "Hypertension"
    }
  ],
  "Greenville Health Partners": [
    {
      id: "GHP001",
      patientName: "Alice Johnson",
      condition: "Asthma"
    }
  ]
};

export const getPatientsByPGName = (pgNameParam) => {
  if (!pgNameParam) {
    console.log("No PG name provided");
    return [];
  }

  // Basic normalization
  const normalizedPgName = pgNameParam.toLowerCase().trim();
  
  // Ultra-aggressive normalization function
  const ultraNormalize = (str) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  console.log(`Searching for PG: "${pgNameParam}"`);
  console.log(`Normalized PG name: "${normalizedPgName}"`);
  
  // Get the ultra-normalized version of search term
  const normalizedSearchKey = ultraNormalize(normalizedPgName);
  console.log(`Ultra-normalized search key: "${normalizedSearchKey}"`);

  // Try to find a matching PG
  let matchingKey = null;
  for (const key of Object.keys(samplePatientGroups)) {
    const normalizedKey = ultraNormalize(key);
    console.log(`Comparing with "${key}" (normalized: "${normalizedKey}")`);
    
    if (normalizedKey === normalizedSearchKey || 
        normalizedKey.includes(normalizedSearchKey) || 
        normalizedSearchKey.includes(normalizedKey)) {
      matchingKey = key;
      console.log(`Found matching PG: "${key}"`);
      break;
    }
  }

  // If we found a match, return those patients
  if (matchingKey) {
    const patients = samplePatientGroups[matchingKey].map(patient => ({
      ...patient,
      patientPG: matchingKey
    }));
    console.log(`Found ${patients.length} patients for PG: ${matchingKey}`);
    return patients;
  }

  // If no match found, generate placeholder patients
  console.log(`No predefined patients found for "${pgNameParam}", generating placeholders`);
  const pgPrefix = pgNameParam.replace(/\s+/g, '').substring(0, 2).toUpperCase();
  
  const generatedPatients = [
    {
      id: `${pgPrefix}001`,
      patientName: "Generated Patient 1",
      condition: "Test Condition 1"
    },
    {
      id: `${pgPrefix}002`,
      patientName: "Generated Patient 2",
      condition: "Test Condition 2"
    }
  ].map(patient => ({
    ...patient,
    patientPG: pgNameParam
  }));

  console.log(`Generated ${generatedPatients.length} placeholder patients`);
  return generatedPatients;
}; 