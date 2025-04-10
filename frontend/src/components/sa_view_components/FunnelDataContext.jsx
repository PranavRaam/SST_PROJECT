import React, { createContext, useState, useEffect } from 'react';
import { 
  fetchAgencyData, 
  getAgenciesByStatisticalArea, 
  categorizeAgencies, 
  transformAgencyDataForFunnel 
} from '../../utils/csvDataService';

// Create the context
const FunnelDataContext = createContext();

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

    // Create initial funnel data based on agency counts
    const createFunnelData = (type, count) => {
      if (type === 'pg') {
        return [
          { name: "Total Potential Patients", value: count * 5, fill: "#2980B9" },
          { name: "Active Interest", value: count * 4, fill: "#45B7D1" },
          { name: "Initial Contact", value: count * 3, fill: "#F39C12" },
          { name: "In Assessment", value: count * 2.5, fill: "#E67E22" },
          { name: "Ready for Service", value: count * 2, fill: "#E74C3C" },
          { name: "Service Started", value: count * 1.5, fill: "#E57373" },
          { name: "Active Treatment", value: count, fill: "#4CAF50" },
          { name: "Ready for Discharge", value: count * 0.7, fill: "#795548" },
          { name: "Discharged", value: count * 0.4, fill: "#9C27B0" },
          { name: "Post-Discharge", value: count * 0.2, fill: "#F48FB1" }
        ];
      } else {
        return [
          { name: "They exist but they haven't heard of us", value: count * 5, fill: "#C0392B" },
          { name: "They've now heard of us but that's it", value: count * 4, fill: "#E74C3C" },
          { name: "Enough interest that they're interacting with our content", value: count * 3, fill: "#9B59B6" },
          { name: "Enough interest that they're now talking to us", value: count * 2, fill: "#F1C40F" },
          { name: "99 cent model", value: count, fill: "#2ECC71" },
          { name: "Upsold (Fully subscribed)", value: count * 0.5, fill: "#16A085" }
        ];
      }
    };

    setPgFunnelData(createFunnelData('pg', pgs.length || 1));
    setHhahFunnelData(createFunnelData('hhah', hhahs.length || 1));

    // Transform agency data into funnel assignments
    const pgAssignmentsData = transformAgencyDataForFunnel(areaAgencies, 'pg');
    const hhahAssignmentsData = transformAgencyDataForFunnel(areaAgencies, 'hhah');
    
    console.log(`Created funnel assignments for ${Object.values(pgAssignmentsData).flat().length} PGs and ${Object.values(hhahAssignmentsData).flat().length} HHAHs`);
    
    setPgAssignments(pgAssignmentsData);
    setHhahAssignments(hhahAssignmentsData);

  }, [currentArea, allAgencies]);

  // Function to move a PG from one stage to another
  const movePgToStage = (pgName, fromStage, toStage) => {
    const newAssignments = { ...pgAssignments };
    
    // Remove from current stage
    newAssignments[fromStage] = newAssignments[fromStage].filter(pg => pg !== pgName);
    
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
      // Adjust counts for visualization
      // If moving forward in the funnel, increase counts
      if (fromIndex < toIndex) {
        for (let i = fromIndex + 1; i <= toIndex; i++) {
          newFunnelData[i].value += 1;
        }
      } 
      // If moving backward in the funnel, decrease counts
      else if (fromIndex > toIndex) {
        for (let i = toIndex + 1; i <= fromIndex; i++) {
          newFunnelData[i].value = Math.max(1, newFunnelData[i].value - 1);
        }
      }
      
      setPgFunnelData(newFunnelData);
    }
  };

  // Function to move an HHAH from one stage to another
  const moveHhahToStage = (hhahName, fromStage, toStage) => {
    const newAssignments = { ...hhahAssignments };
    
    // Remove from current stage
    newAssignments[fromStage] = newAssignments[fromStage].filter(hhah => hhah !== hhahName);
    
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
      // Adjust counts for visualization
      // If moving forward in the funnel, increase counts
      if (fromIndex < toIndex) {
        for (let i = fromIndex + 1; i <= toIndex; i++) {
          newFunnelData[i].value += 1;
        }
      } 
      // If moving backward in the funnel, decrease counts
      else if (fromIndex > toIndex) {
        for (let i = toIndex + 1; i <= fromIndex; i++) {
          newFunnelData[i].value = Math.max(1, newFunnelData[i].value - 1);
        }
      }
      
      setHhahFunnelData(newFunnelData);
    }
  };

  return (
    <FunnelDataContext.Provider
      value={{
        currentArea,
        setCurrentArea,
        pgData,
        hhahData,
        pgFunnelData,
        hhahFunnelData,
        pgAssignments,
        hhahAssignments,
        movePgToStage,
        moveHhahToStage,
        isLoading
      }}
    >
      {children}
    </FunnelDataContext.Provider>
  );
};

export { FunnelDataContext, FunnelDataProvider }; 