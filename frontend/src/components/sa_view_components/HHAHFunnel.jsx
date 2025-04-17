import React, { useState, useContext, useEffect } from "react";
import { FunnelDataContext, HHAH_STAGES } from './FunnelDataContext';
import "../sa_view_css/HHAHFunnel.css";
import combinedData from '../../assets/data/combined_data.json';

// Subscription status funnel stages - initialize using the same values from the context
const hhahFunnelStages = HHAH_STAGES.map((name, index) => {
  // Values from original definition
  const values = [60, 50, 40, 30, 20, 10];
  const fills = ["#C0392B", "#E74C3C", "#D35400", "#9B59B6", "#F1C40F", "#2ECC71"];
  
  // Use values and colors if we have enough entries, or provide defaults
  return {
    name,
    value: index < values.length ? values[index] : 10,
    fill: index < fills.length ? fills[index] : "#2ECC71"
  };
});

const HHAHFunnel = () => {
  const { currentArea, hhahAssignments, moveHhahToStage, hhahFunnelData } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedHHAH, setSelectedHHAH] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [funnelData, setFunnelData] = useState(hhahFunnelStages);
  const [hoveredSection, setHoveredSection] = useState(null);
  
  // Debug logging in useEffect
  useEffect(() => {
    console.log("HHAH Funnel - Context data received:", {
      currentArea,
      hasAssignments: !!hhahAssignments,
      moveHhahToStageDefined: !!moveHhahToStage,
      hasFunnelData: !!hhahFunnelData,
      funnelDataLength: hhahFunnelData?.length
    });
    
    if (currentArea) {
      console.log("HHAH Funnel - Filtering data for area:", currentArea);
      // Extract all HHAH data from the nested structure
      const allHHAHData = [
        ...(combinedData.West_Details || []),
        ...(combinedData.East_Central_Details || []),
        ...(combinedData.Central_Details || [])
      ];
      
      console.log("HHAH Funnel - Total combined data records:", allHHAHData.length);

      // Filter the data based on Metropolitan (or Micropolitan) Area
      const filtered = allHHAHData.filter(item => {
        const itemArea = item['Metropolitan (or Micropolitan) Area']?.toLowerCase() || '';
        const selectedArea = currentArea.toLowerCase();
        return itemArea === selectedArea;
      });

      console.log(`HHAH Funnel - Filtered records for area "${currentArea}":`, filtered.length);
      setFilteredData(filtered);
    } else {
      console.log("HHAH Funnel - No current area specified, filtered data cleared");
      setFilteredData([]);
    }
    
    // Use real data if available
    if (hhahFunnelData && hhahFunnelData.length > 0) {
      console.log("HHAH Funnel - Using provided funnel data:", hhahFunnelData);
      setFunnelData(hhahFunnelData);
    } else {
      console.log("HHAH Funnel - Using default funnel stages:", hhahFunnelStages);
    }
  }, [currentArea, hhahFunnelData, hhahAssignments, moveHhahToStage]);

  // Get actual counts for display
  const getValueForStage = (stage) => {
    const count = filteredData.filter(item => item['Agency Type'] === stage).length || 0;
    console.log(`HHAH Funnel - Count for stage "${stage}":`, count);
    return count;
  };

  const handleFunnelClick = (entry) => {
    console.log("HHAH Funnel - Section clicked:", entry);
    if (entry.value === 0) {
      console.log("HHAH Funnel - Ignoring click on empty section");
      return;
    }
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const handleHHAHClick = (hhahName) => {
    console.log("HHAH Funnel - HHAH selected for move:", hhahName);
    setSelectedHHAH(hhahName);
    setShowMoveOptions(true);
  };

  const handleMoveHHAH = (toStage) => {
    console.log("HHAH Funnel - Attempting to move HHAH:", {
      hhah: selectedHHAH,
      fromStage: expandedStage,
      toStage: toStage,
      moveHhahToStageDefined: !!moveHhahToStage
    });
    
    if (!selectedHHAH || !expandedStage || !moveHhahToStage) {
      console.error("HHAH Funnel - Cannot move HHAH: missing required data", {
        selectedHHAH,
        expandedStage,
        moveHhahToStageDefined: !!moveHhahToStage
      });
      return;
    }
    
    try {
      moveHhahToStage(selectedHHAH, expandedStage, toStage);
      console.log("HHAH Funnel - HHAH moved successfully");
    } catch (error) {
      console.error("HHAH Funnel - Error moving HHAH:", error);
    }
    
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };
  
  const handleBack = () => {
    console.log("HHAH Funnel - Return to main funnel view");
    setExpandedStage(null);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };
  
  // Get HHAH names for the expanded stage view
  const getHHAHsForStage = (stageName) => {
    console.log(`HHAH Funnel - Getting HHAHs for stage "${stageName}"`);
    
    // Use real data if available
    if (hhahAssignments && hhahAssignments[stageName] && hhahAssignments[stageName].length > 0) {
      console.log(`HHAH Funnel - Found ${hhahAssignments[stageName].length} assigned HHAHs in stage "${stageName}"`);
      return hhahAssignments[stageName];
    }
    
    // Use filtered data based on agency type
    const hhahs = filteredData
      .filter(item => item['Agency Type'] === stageName)
      .map(item => item['Agency Name']);
      
    console.log(`HHAH Funnel - Found ${hhahs.length} HHAHs from filtered data for stage "${stageName}"`);
    return hhahs;
  };

  const handleMouseOver = (index) => {
    setHoveredSection(index);
  };

  const handleMouseOut = () => {
    setHoveredSection(null);
  };

  return (
    <div className="hhah-funnel-container">
      <h2 className="funnel-title">HHAH Funnel</h2>
      {expandedStage ? (
        <div className="expanded-list">
          <div className="expanded-header">
            <h4>{expandedStage}</h4>
            <button className="back-button" onClick={handleBack}>
              ← Back to Funnel
            </button>
          </div>
          {getHHAHsForStage(expandedStage).map((hhah, index) => (
            <div key={index} className="hhah-entry">
              {hhah}
              {!showMoveOptions && (
                <button onClick={() => handleHHAHClick(hhah)}>Move</button>
              )}
            </div>
          ))}
          {showMoveOptions && (
            <div className="move-options">
              <h5>Move {selectedHHAH} to:</h5>
              {funnelData
                .filter(stage => stage.name !== expandedStage)
                .map((stage, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoveHHAH(stage.name)}
                    className="move-option-button"
                  >
                    {stage.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="funnel-chart-wrapper">
          <svg width="350" height="500" viewBox="0 0 350 500" preserveAspectRatio="xMidYMid meet">
            {/* Main funnel shape (inverted triangle) */}
            <g>
              {/* First section */}
              <path d="M50,50 L300,50 L290,120 L60,120 Z" 
                    fill={funnelData[0]?.fill || "#C0392B"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[0])}
                    onMouseOver={() => handleMouseOver(0)}
                    onMouseOut={handleMouseOut} />
              <text x="175" y="85" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {funnelData[0]?.value || 0}
              </text>
              
              {/* Second section */}
              <path d="M60,120 L290,120 L280,190 L70,190 Z" 
                    fill={funnelData[1]?.fill || "#E74C3C"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[1])}
                    onMouseOver={() => handleMouseOver(1)}
                    onMouseOut={handleMouseOut} />
              <text x="175" y="155" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {funnelData[1]?.value || 0}
              </text>
              
              {/* Third section */}
              <path d="M70,190 L280,190 L270,260 L80,260 Z" 
                    fill={funnelData[2]?.fill || "#D35400"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[2])}
                    onMouseOver={() => handleMouseOver(2)}
                    onMouseOut={handleMouseOut} />
              <text x="175" y="225" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {funnelData[2]?.value || 0}
              </text>
              
              {/* Fourth section */}
              <path d="M80,260 L270,260 L260,330 L90,330 Z" 
                    fill={funnelData[3]?.fill || "#9B59B6"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[3])}
                    onMouseOver={() => handleMouseOver(3)}
                    onMouseOut={handleMouseOut} />
              <text x="175" y="295" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {funnelData[3]?.value || 0}
              </text>
              
              {/* Fifth section */}
              <path d="M90,330 L260,330 L250,400 L100,400 Z" 
                    fill={funnelData[4]?.fill || "#F1C40F"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[4])}
                    onMouseOver={() => handleMouseOver(4)}
                    onMouseOut={handleMouseOut} />
              <text x="175" y="365" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {funnelData[4]?.value || 0}
              </text>
              
              {/* Sixth section */}
              <path d="M100,400 L250,400 L240,470 L110,470 Z" 
                    fill={funnelData[5]?.fill || "#2ECC71"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[5])}
                    onMouseOver={() => handleMouseOver(5)}
                    onMouseOut={handleMouseOut} />
              <text x="175" y="435" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {funnelData[5]?.value || 0}
              </text>
            </g>
          </svg>
          
          {/* Tooltip showing stage name on hover */}
          {hoveredSection !== null && (
            <div className="stage-tooltip">
              {funnelData[hoveredSection]?.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HHAHFunnel;