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
  const { currentArea, hhahAssignments, moveHhahToStage, hhahFunnelData, hhahData } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedHHAH, setSelectedHHAH] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [funnelData, setFunnelData] = useState(hhahFunnelStages);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [hhahNames, setHhahNames] = useState([]);
  const [moveStatus, setMoveStatus] = useState(null); // For move feedback
  const [movedHHAHs, setMovedHHAHs] = useState({}); // Track moved HHAHs and their new stages
  const [localAssignments, setLocalAssignments] = useState({});
  
  // Debug logging in useEffect
  useEffect(() => {
    console.log("HHAH Funnel - Context data received:", {
      currentArea,
      hasAssignments: !!hhahAssignments,
      moveHhahToStageDefined: !!moveHhahToStage,
      hasFunnelData: !!hhahFunnelData,
      funnelDataLength: hhahFunnelData?.length,
      hhahDataLength: hhahData?.length
    });
    
    if (currentArea && hhahData && hhahData.length > 0) {
      console.log("HHAH Funnel - Using HHAH data from context");
      setFilteredData(hhahData);
      // Store HHAH names
      setHhahNames(hhahData.map(agency => agency['Agency Name']));
    } else if (currentArea) {
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
      // Store HHAH names
      setHhahNames(filtered.map(agency => agency['Agency Name']));
    } else {
      console.log("HHAH Funnel - No current area specified, filtered data cleared");
      setFilteredData([]);
      setHhahNames([]);
    }
    
    // Use real data if available
    if (hhahFunnelData && hhahFunnelData.length > 0) {
      console.log("HHAH Funnel - Using provided funnel data:", hhahFunnelData);
      setFunnelData(hhahFunnelData);
    } else {
      console.log("HHAH Funnel - Using default funnel stages:", hhahFunnelStages);
    }
  }, [currentArea, hhahFunnelData, hhahAssignments, moveHhahToStage, hhahData]);

  // Initialize localAssignments on first load or when hhahNames change
  useEffect(() => {
    if (hhahNames.length > 0) {
      setLocalAssignments(prev => {
        // Only initialize if prev is empty
        if (Object.keys(prev).length === 0) {
          const initial = {"99 cent model": [...hhahNames]};
          HHAH_STAGES.forEach(stage => {
            if (!initial[stage]) initial[stage] = [];
          });
          return initial;
        }
        return prev;
      });
    }
  }, [hhahNames]);

  const getHHAHsForStage = (stageName) => {
    return localAssignments[stageName] || [];
  };

  const getValueForStage = (stage) => {
    return (localAssignments[stage] || []).length;
  };

  const handleFunnelClick = (entry) => {
    if (getValueForStage(entry.name) === 0) return;
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
    setMoveStatus(null);
  };

  const handleMoveHHAH = (hhah) => {
    console.log("Selected HHAH for move:", hhah);
    setSelectedHHAH(hhah);
    setShowMoveOptions(true);
  };

  const handleMoveToStage = (targetStage) => {
    if (!selectedHHAH || !targetStage) return;
    setLocalAssignments(prev => {
      // Find the current stage of the HHAH
      let fromStage = null;
      for (const [stage, list] of Object.entries(prev)) {
        if (list.includes(selectedHHAH)) {
          fromStage = stage;
          break;
        }
      }
      if (!fromStage) return prev;
      // Remove from current stage and add to target stage
      const newAssignments = {...prev};
      newAssignments[fromStage] = newAssignments[fromStage].filter(hhah => hhah !== selectedHHAH);
      newAssignments[targetStage] = [...(newAssignments[targetStage] || []), selectedHHAH];
      return newAssignments;
    });
    setShowMoveOptions(false);
    setSelectedHHAH(null);
    setMoveStatus({ success: true, message: `Moved to '${targetStage}' successfully!` });
    setTimeout(() => setMoveStatus(null), 2000);
  };

  const handleBack = () => {
    setExpandedStage(null);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
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
          {moveStatus && (
            <div className={`move-status-message ${moveStatus.success ? 'success' : 'error'}`}>{moveStatus.message}</div>
          )}
          {getHHAHsForStage(expandedStage).map((hhah, index) => (
            <div key={index} className="hhah-entry">
              {hhah}
              {!showMoveOptions && (
                <button onClick={() => handleMoveHHAH(hhah)}>Move</button>
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
                    onClick={() => handleMoveToStage(stage.name)}
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
              {funnelData.map((stage, idx) => (
                <React.Fragment key={stage.name}>
                  <path
                    d={
                      idx === 0 ? "M50,50 L300,50 L290,120 L60,120 Z" :
                      idx === 1 ? "M60,120 L290,120 L280,190 L70,190 Z" :
                      idx === 2 ? "M70,190 L280,190 L270,260 L80,260 Z" :
                      idx === 3 ? "M80,260 L270,260 L260,330 L90,330 Z" :
                      idx === 4 ? "M90,330 L260,330 L250,400 L100,400 Z" :
                      "M100,400 L250,400 L240,470 L110,470 Z"
                    }
                    fill={stage.fill}
                    stroke="#fff"
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(stage)}
                    onMouseOver={() => handleMouseOver(idx)}
                    onMouseOut={handleMouseOut}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x="175"
                    y={85 + idx * 70}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    {getValueForStage(stage.name)}
                  </text>
                </React.Fragment>
              ))}
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