import React, { createContext, useState, useEffect } from 'react';
import { 
  fetchAgencyData, 
  getAgenciesByStatisticalArea, 
  categorizeAgencies, 
  transformAgencyDataForFunnel 
} from '../../utils/csvDataService';

// Create the context
const FunnelDataContext = createContext();

// Define funnel stages for both PG and HHAH for consistent usage across components
export const PG_STAGES = [
  "Total Potential Patients",
  "Active Interest",
  "Initial Contact",
  "In Assessment",
  "Ready for Service",
  "Service Started"
];

export const HHAH_STAGES = [
  "Freemium",
  "Not Using",
  "Order360 Lite",
  "Order360 Full",
  "Upsold (Fully subscribed)"
];

// Create the provider component
const FunnelDataProvider = ({ children }) => {
  const [allAgencies, setAllAgencies] = useState([]);
  const [currentArea, setCurrentArea] = useState('');
  const [pgData, setPgData] = useState([]);
  const [hhahData, setHhahData] = useState([]);
  const [pgFunnelData, setPgFunnelData] = useState([]);
  const [hhahFunnelData, setHhahFunnelData] = useState([]);
  const [pgAssignments, setPgAssignments] = useState({});
  const [hhahAssignments, setHhahAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAgencyData();
        setAllAgencies(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading agency data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update data when the statistical area changes
  useEffect(() => {
    if (!currentArea || allAgencies.length === 0) {
      console.log('Either currentArea is not set or no agencies loaded yet:', {
        currentArea,
        agenciesCount: allAgencies.length
      });
      return;
    }

    console.log(`FunnelDataContext: Processing data for area: "${currentArea}"`);
    
    // Filter agencies for the current statistical area
    const areaAgencies = getAgenciesByStatisticalArea(allAgencies, currentArea);
    console.log(`Found ${areaAgencies.length} agencies for area "${currentArea}"`);
    
    // Categorize into PGs and HHAHs
    const { pgs, hhahs } = categorizeAgencies(areaAgencies);
    console.log(`Area "${currentArea}" has ${pgs.length} PGs and ${hhahs.length} HHAHs`);
    
    setPgData(pgs);
    setHhahData(hhahs);

    // Create initial funnel data based on actual data
    const createFunnelData = (type, agencies) => {
      if (type === 'pg') {
        // Use the PG_STAGES for consistency
        return PG_STAGES.map((stage, index) => {
          // Calculate a value that decreases through the funnel
          const value = Math.max(1, Math.floor(pgs.length * (1 - index * 0.15)));
          // Use consistent colors
          const colors = ["#2980B9", "#45B7D1", "#F39C12", "#E67E22", "#E74C3C", "#E57373"];
          return { 
            name: stage, 
            value: value, 
            fill: colors[index] || "#9C27B0"
          };
        });
      } else {
        // Initialize counts for each stage for HHAH funnel
        const stageCounts = {};
        HHAH_STAGES.forEach(stage => {
          stageCounts[stage] = 0;
        });

        // Count HHAHs in each stage
        agencies.forEach(agency => {
          const stage = agency['Agency Type'] || 'Not Using'; // Default to 'Not Using' if no type specified
          if (stageCounts[stage] !== undefined) {
            stageCounts[stage]++;
          }
        });

        // Create funnel data from counts
        const colors = ["#C0392B", "#E74C3C", "#9B59B6", "#F1C40F", "#2ECC71"];
        return HHAH_STAGES.map((stage, index) => ({
          name: stage,
          value: stageCounts[stage] || Math.max(1, Math.floor(hhahs.length * (1 - index * 0.2))),
          fill: colors[index] || "#2ECC71"
        }));
      }
    };

    setPgFunnelData(createFunnelData('pg', pgs));
    setHhahFunnelData(createFunnelData('hhah', hhahs));

    // Transform agency data into funnel assignments
    const pgAssignmentsData = transformAgencyDataForFunnel(areaAgencies, 'pg', PG_STAGES);
    const hhahAssignmentsData = transformAgencyDataForFunnel(areaAgencies, 'hhah', HHAH_STAGES);
    
    console.log(`Created funnel assignments for ${Object.values(pgAssignmentsData).flat().length} PGs and ${Object.values(hhahAssignmentsData).flat().length} HHAHs`);
    
    setPgAssignments(pgAssignmentsData);
    setHhahAssignments(hhahAssignmentsData);

  }, [currentArea, allAgencies]);

  // Function to move a PG from one stage to another
  const movePgToStage = (pgName, fromStage, toStage) => {
    const newAssignments = { ...pgAssignments };
    
    // Remove from current stage
    if (newAssignments[fromStage]) {
      newAssignments[fromStage] = newAssignments[fromStage].filter(pg => pg !== pgName);
    }
    
    // Add to new stage
    if (!newAssignments[toStage]) {
      newAssignments[toStage] = [];
    }
    newAssignments[toStage].push(pgName);
    
    setPgAssignments(newAssignments);
    
    // Update funnel data visualization
    const newFunnelData = [...pgFunnelData];
    
    // Find indices of the stages
    const fromIndex = newFunnelData.findIndex(item => item.name === fromStage);
    const toIndex = newFunnelData.findIndex(item => item.name === toStage);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      // Update stage counts based on assignments
      newFunnelData[fromIndex].value = Math.max(1, (newAssignments[fromStage]?.length || 0));
      newFunnelData[toIndex].value = Math.max(1, (newAssignments[toStage]?.length || 0));
      
      setPgFunnelData(newFunnelData);
    }
  };

  // Function to move an HHAH from one stage to another
  const moveHhahToStage = (hhahName, fromStage, toStage) => {
    const newAssignments = { ...hhahAssignments };
    
    // Remove from current stage
    if (newAssignments[fromStage]) {
      newAssignments[fromStage] = newAssignments[fromStage].filter(hhah => hhah !== hhahName);
    }
    
    // Add to new stage
    if (!newAssignments[toStage]) {
      newAssignments[toStage] = [];
    }
    newAssignments[toStage].push(hhahName);
    
    setHhahAssignments(newAssignments);
    
    // Update funnel data visualization
    const newFunnelData = [...hhahFunnelData];
    
    // Find indices of the stages
    const fromIndex = newFunnelData.findIndex(item => item.name === fromStage);
    const toIndex = newFunnelData.findIndex(item => item.name === toStage);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      // Update the values based on actual counts
      newFunnelData[fromIndex].value = Math.max(1, (newAssignments[fromStage]?.length || 0));
      newFunnelData[toIndex].value = Math.max(1, (newAssignments[toStage]?.length || 0));
      
      setHhahFunnelData(newFunnelData);
    }
  };
  
  // Function to add a new PG and update funnel data
  const updatePgFunnelData = (newFunnelData, pgName, stage) => {
    // Update funnel data visualization
    setPgFunnelData(newFunnelData);
    
    // Update assignments
    const newAssignments = { ...pgAssignments };
    if (!newAssignments[stage]) {
      newAssignments[stage] = [];
    }
    newAssignments[stage].push(pgName);
    setPgAssignments(newAssignments);
  };
  
  // Function to add a new HHAH and update funnel data
  const updateHhahFunnelData = (newFunnelData, hhahName, stage) => {
    // Update funnel data visualization
    setHhahFunnelData(newFunnelData);
    
    // Update assignments
    const newAssignments = { ...hhahAssignments };
    if (!newAssignments[stage]) {
      newAssignments[stage] = [];
    }
    newAssignments[stage].push(hhahName);
    setHhahAssignments(newAssignments);
  };

  return (
    <FunnelDataContext.Provider
      value={{
        currentArea,
        setCurrentArea,
        pgData,
        setPgData,
        hhahData,
        setHhahData,
        pgFunnelData,
        hhahFunnelData,
        pgAssignments,
        hhahAssignments,
        movePgToStage,
        moveHhahToStage,
        updatePgFunnelData,
        updateHhahFunnelData,
        isLoading
      }}
    >
      {children}
    </FunnelDataContext.Provider>
  );
};

export { FunnelDataContext, FunnelDataProvider }; 