import React, { createContext, useState, useEffect } from 'react';
import { 
  fetchAgencyData, 
  getAgenciesByStatisticalArea, 
  categorizeAgencies, 
  transformAgencyDataForFunnel,
  updateAgencyData 
} from '../../utils/csvDataService';
import pgFunnelReference from '../../assets/data/pg_funnel_reference.json';
import westPGData from '../../assets/data/west_pg_data.json';
import centralPGData from '../../assets/data/central_pg_data.json';
import eastCentralPGData from '../../assets/data/east_central_pg_data.json';

// Create the context
const FunnelDataContext = createContext();

// Define funnel stages for both PG and HHAH for consistent usage across components
export const PG_STAGES = [
  "They exist but they haven't heard of us",
  "They've now heard of us but that's it",
  "Enough interest that they're interacting with our content",
  "Enough interest that they're now talking to us",
  "They've had a demo",
  "In the buying process",
  "Deal is so hot your hands will burn if you touch it",
  "On the platform",
  "In the upselling zone",
  "Upsold to CPO/etc..."
];

export const HHAH_STAGES = [
  "They exist but they haven't heard of us",
  "They've now heard of us but that's it",
  "Enough interest that they're interacting with our content",
  "Enough interest that they're now talking to us",
  "99 cent model",
  "Upsold (Fully subscribed)"
];

// Create the provider component
const FunnelDataProvider = ({ children, initialArea }) => {
  const [allAgencies, setAllAgencies] = useState([]);
  const [currentArea, setCurrentArea] = useState(initialArea || '');
  const [pgData, setPgData] = useState([]);
  const [hhahData, setHhahData] = useState([]);
  const [pgFunnelData, setPgFunnelData] = useState([]);
  const [hhahFunnelData, setHhahFunnelData] = useState([]);
  const [pgAssignments, setPgAssignments] = useState({});
  const [hhahAssignments, setHhahAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);

  // Update currentArea when initialArea changes
  useEffect(() => {
    if (initialArea) {
      console.log('FunnelDataProvider: Setting initial area:', initialArea);
      setCurrentArea(initialArea);
    }
  }, [initialArea]);

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

    // Transform PG data for display
    const transformedPGs = pgs.map(pg => ({
      name: pg.name,
      address: pg.address || "Address not available",
      city: currentArea,
      state: pg.state || "State not available",
      zipcode: pg.zipcode || "Zip not available",
      phone: pg.phone || "Phone not available",
      status: pg.status || "On the platform"
    }));

    setDisplayData(transformedPGs);

    // Create initial funnel data based on actual data
    const createFunnelData = (type, agencies) => {
      if (type === 'pg') {
        // Get PGs for current MSA from all regions
        const westPGs = westPGData.West[currentArea] || [];
        const centralPGs = centralPGData.Central[currentArea] || [];
        const eastCentralPGs = eastCentralPGData.East_Central[currentArea] || [];
        
        // Combine PGs from all regions for current MSA
        const allPGs = [...westPGs, ...centralPGs, ...eastCentralPGs];
        
        // Initialize counts for each PG stage
        const stageCounts = {};
        PG_STAGES.forEach(stage => {
          stageCounts[stage] = 0;
        });
        
        // Count PGs in each stage using the reference file
        allPGs.forEach(pgName => {
          const status = pgFunnelReference[pgName];
          if (status === "On the platform") {
            stageCounts["On the platform"]++;
          } else if (status === "Upsold to CPO/etc...") {
            stageCounts["Upsold to CPO/etc..."]++;
          }
        });
        
        // Use consistent colors matching PGFunnel.jsx
        const colors = [
          "#2980B9", "#3498DB", "#45B7D1", "#F39C12", 
          "#E67E22", "#D35400", "#E74C3C", "#C0392B", 
          "#E57373", "#B71C1C"
        ];
        
        // Create funnel data with actual counts
        return PG_STAGES.map((stage, index) => ({
          name: stage, 
          value: stageCounts[stage] || 0,
          fill: colors[index]
        }));
      } else {
        // Initialize counts for each stage for HHAH funnel
        const stageCounts = {};
        HHAH_STAGES.forEach(stage => {
          // Set all stages except "99 cent model" to 0
          stageCounts[stage] = stage === "99 cent model" ? agencies.length : 0;
        });

        // Create funnel data from counts
        const colors = ["#C0392B", "#E74C3C", "#9B59B6", "#F1C40F", "#2ECC71"];
        return HHAH_STAGES.map((stage, index) => ({
          name: stage,
          value: stageCounts[stage] || 0,
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
    
    // Update PG data with new status
    const updatedPGs = [...pgData];
    const pgIndex = updatedPGs.findIndex(pg => pg['Agency Name'] === pgName);
    if (pgIndex !== -1) {
      // Update the PG's status to match its new funnel stage
      updatedPGs[pgIndex]['Agency Type'] = toStage;
      setPgData(updatedPGs);
    }
    
    // Update funnel data visualization
    const newFunnelData = [...pgFunnelData];
    
    // Find indices of the stages
    const fromIndex = newFunnelData.findIndex(item => item.name === fromStage);
    const toIndex = newFunnelData.findIndex(item => item.name === toStage);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      // Update stage counts based on assignments
      newFunnelData[fromIndex].value = newAssignments[fromStage]?.length || 0;
      newFunnelData[toIndex].value = newAssignments[toStage]?.length || 0;
      
      setPgFunnelData(newFunnelData);
    }
  };

  // Function to move an HHAH from one stage to another
  const moveHhahToStage = (hhahName, fromStage, toStage) => {
    const newAssignments = { ...hhahAssignments };
    
    // Only allow moving from "99 cent model" to other stages
    if (fromStage !== "99 cent model") {
      console.error("HHAH Funnel - Can only move HHAHs from 99 cent model stage");
      return;
    }
    
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
    
    // Update agency data with new status
    const updatedAgencies = updateAgencyData(hhahName, toStage, allAgencies);
    setAllAgencies(updatedAgencies);
    
    // Find the specific agency we just updated
    const updatedHhahs = [...hhahData];
    const hhahIndex = updatedHhahs.findIndex(hhah => hhah['Agency Name'] === hhahName);
    if (hhahIndex !== -1) {
      updatedHhahs[hhahIndex]['Agency Type'] = toStage;
      setHhahData(updatedHhahs);
    }
    
    // Update funnel data visualization
    const newFunnelData = [...hhahFunnelData];
    
    // Find indices of the stages
    const fromIndex = newFunnelData.findIndex(item => item.name === fromStage);
    const toIndex = newFunnelData.findIndex(item => item.name === toStage);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      // Update the values based on actual counts
      newFunnelData[fromIndex].value = newAssignments[fromStage]?.length || 0;
      newFunnelData[toIndex].value = newAssignments[toStage]?.length || 0;
      
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
        allAgencies,
        currentArea,
        setCurrentArea,
        pgData,
        setPgData,
        hhahData,
        setHhahData,
        pgFunnelData,
        setPgFunnelData,
        hhahFunnelData,
        setHhahFunnelData,
        pgAssignments,
        setPgAssignments,
        hhahAssignments,
        setHhahAssignments,
        isLoading,
        setIsLoading,
        displayData,
        setDisplayData,
        movePgToStage,
        moveHhahToStage,
        updatePgFunnelData,
        updateHhahFunnelData
      }}
    >
      {children}
    </FunnelDataContext.Provider>
  );
};

export { FunnelDataContext, FunnelDataProvider }; 