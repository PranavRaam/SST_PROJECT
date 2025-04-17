import Papa from 'papaparse';
import { mapAreaName, getAreaNameVariations } from './areaMapping';

// Function to fetch and parse the CSV file
export const fetchAgencyData = async () => {
  try {
    const response = await fetch('/data/Listing of all PG and HHAH - West_Details.csv');
    const csvText = await response.text();
    
    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    console.log('CSV Data loaded successfully:', data.length, 'records');
    console.log('First record:', data[0]);
    console.log('Available statistical areas:', [...new Set(data.map(item => item['Metropolitan (or Micropolitan) Area']))]);
    
    return data;
  } catch (error) {
    console.error('Error loading agency data:', error);
    return [];
  }
};

// Function to filter agencies by statistical area (Metropolitan or Micropolitan) Area)
export const getAgenciesByStatisticalArea = (agencies, statisticalArea) => {
  if (!agencies || !statisticalArea) return [];
  
  console.log(`Filtering for statistical area: "${statisticalArea}"`);
  const mappedAreaName = mapAreaName(statisticalArea);
  
  if (mappedAreaName !== statisticalArea) {
    console.log(`Mapped "${statisticalArea}" to "${mappedAreaName}"`);
  }
  
  // Try all the possible variations of the area name
  const areaVariations = getAreaNameVariations(statisticalArea);
  console.log('Trying area name variations:', areaVariations);
  
  // Filter agencies that match any of the area variations
  const filteredAgencies = agencies.filter(agency => {
    const agencyArea = agency['Metropolitan (or Micropolitan) Area'];
    if (!agencyArea) return false;
    
    // Try each variation of the area name
    return areaVariations.some(variation => 
      agencyArea.toLowerCase() === variation.toLowerCase()
    );
  });
  
  console.log(`Found ${filteredAgencies.length} agencies for area "${statisticalArea}" (mapped to "${mappedAreaName}")`);
  
  // If we still don't have any matches, try a more flexible approach with includes
  if (filteredAgencies.length === 0) {
    console.log('No exact matches found, trying partial matches...');
    
    const partialMatches = agencies.filter(agency => {
      const agencyArea = agency['Metropolitan (or Micropolitan) Area'];
      if (!agencyArea) return false;
      
      // Check if any variation is included in the agency area or vice versa
      return areaVariations.some(variation => 
        agencyArea.toLowerCase().includes(variation.toLowerCase()) ||
        variation.toLowerCase().includes(agencyArea.toLowerCase())
      );
    });
    
    console.log(`Found ${partialMatches.length} partial matches for area "${statisticalArea}"`);
    return partialMatches;
  }
  
  return filteredAgencies;
};

// Function to categorize agencies by type (PG or HHAH)
export const categorizeAgencies = (agencies) => {
  console.log('Categorizing agencies:', agencies.length);
  
  // All agencies in the CSV are actually HHAH
  const hhahs = agencies;
  
  // Since there are no PGs in the CSV data, we'll create some virtual PGs for demonstration purposes
  // by converting some HHAHs to PGs based on their Agency Type
  const pgs = agencies
    .filter(agency => 
      agency['Agency Type'] === 'Freemium' || 
      agency['Agency Type'] === 'Order360 Lite' || 
      agency['Agency Type'] === 'Order360 Full'
    )
    .map(agency => ({
      ...agency,
      'Agency Type': 'PG ' + agency['Agency Type'], // Mark as PG for display purposes
      'isPG': true // Add a flag to identify these as PGs
    }));
  
  console.log(`Categorized ${pgs.length} PGs and ${hhahs.length} HHAHs`);
  
  return { pgs, hhahs };
};

// Function to get statistics for a statistical area
export const getStatisticsForArea = (agencies, statisticalArea) => {
  if (!agencies || !statisticalArea) {
    return {
      patients: 0,
      physicianGroups: 0,
      agencies: 0,
      activeOutcomes: 0
    };
  }
  
  const areaAgencies = getAgenciesByStatisticalArea(agencies, statisticalArea);
  const { pgs, hhahs } = categorizeAgencies(areaAgencies);
  
  // Calculate estimated patient numbers based on agency counts
  // This is a placeholder calculation - adjust based on your business logic
  const avgPatientsPerPG = 100;
  const avgPatientsPerHHAH = 150;
  const patientCount = (pgs.length * avgPatientsPerPG) + (hhahs.length * avgPatientsPerHHAH);
  
  // Calculate estimated outcomes based on agency counts
  // This is a placeholder calculation - adjust based on your business logic
  const activeOutcomesEstimate = Math.round(patientCount * 0.15);
  
  return {
    patients: patientCount,
    physicianGroups: pgs.length,
    agencies: hhahs.length,
    activeOutcomes: activeOutcomesEstimate
  };
};

// Function to transform agency data for funnel display
export const transformAgencyDataForFunnel = (agencies, type, stages) => {
  // Filter by PG or HHAH
  const { pgs, hhahs } = categorizeAgencies(agencies);
  const agenciesToProcess = type === 'pg' ? pgs : hhahs;
  
  // Create assignments for funnel stages
  // This is a simplified approach - in a real app you'd have business logic to determine stages
  
  if (type === 'pg') {
    // Create empty assignments for all stages
    const assignments = {};
    stages.forEach(stage => {
      assignments[stage] = [];
    });
    
    // Distribute PGs across stages
    agenciesToProcess.forEach(agency => {
      const randomIndex = Math.floor(Math.random() * stages.length);
      const stage = stages[randomIndex];
      assignments[stage].push(agency['Agency Name']);
    });
    
    return assignments;
  } else {
    // Create assignments based on actual HHAH data
    const assignments = {};
    stages.forEach(stage => {
      assignments[stage] = [];
    });
    
    // Distribute HHAHs based on their actual type
    agenciesToProcess.forEach(agency => {
      const stage = agency['Agency Type'] || 'Not Using'; // Default to 'Not Using' if no type specified
      if (assignments[stage] !== undefined) {
        assignments[stage].push(agency['Agency Name']);
      } else {
        // If the stage doesn't match any in our predefined stages, put in 'Not Using'
        if (assignments['Not Using'] !== undefined) {
          assignments['Not Using'].push(agency['Agency Name']);
        }
      }
    });
    
    return assignments;
  }
};

// Function to update agency data (status/type)
export const updateAgencyData = (agencyName, newStatus, agencies) => {
  // Create a copy of the agencies array to avoid direct mutation
  const updatedAgencies = [...agencies];
  
  // Find the agency by name
  const agencyIndex = updatedAgencies.findIndex(
    agency => agency['Agency Name'] === agencyName
  );
  
  // If found, update its status/type
  if (agencyIndex !== -1) {
    updatedAgencies[agencyIndex]['Agency Type'] = newStatus;
    console.log(`Updated agency ${agencyName} status to ${newStatus}`);
  } else {
    console.warn(`Agency ${agencyName} not found for status update`);
  }
  
  return updatedAgencies;
}; 