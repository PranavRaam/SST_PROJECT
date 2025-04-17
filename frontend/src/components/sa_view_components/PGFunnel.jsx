import React, { useState, useContext, useEffect } from "react";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/PGFunnel.css"; // Importing CSS

// Patient journey funnel stages
const pgFunnelStages = [
  { name: "They exist but they haven't heard of us", value: 60, fill: "#2980B9" },
  { name: "They've now heard of us but that's it", value: 55, fill: "#3498DB" },
  { name: "Enough interest that they're interacting with our content", value: 50, fill: "#45B7D1" },
  { name: "Enough interest that they're now talking to us", value: 40, fill: "#F39C12" },
  { name: "They've had a demo", value: 30, fill: "#E67E22" },
  { name: "In the buying process", value: 25, fill: "#D35400" },
  { name: "Deal is so hot your hands will burn if you touch it", value: 20, fill: "#E74C3C" },
  { name: "On the platform", value: 15, fill: "#C0392B" },
  { name: "In the upselling zone", value: 10, fill: "#E57373" },
  { name: "Upsold to CPOs/CCMs/RPMs/other services", value: 5, fill: "#B71C1C" }
];

// For display in the center of each section
const displayValues = [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100];

// Generate PG names for the mock data view
const pgNames = [
  "PG Alpha", "PG Beta", "PG Gamma", "PG Delta", "PG Epsilon",
  "PG Zeta", "PG Eta", "PG Theta", "PG Iota", "PG Kappa",
  "PG Lambda", "PG Mu", "PG Nu", "PG Xi", "PG Omicron"
];

const PGFunnel = () => {
  const { pgFunnelData, pgAssignments, movePgToStage, pgData, currentArea } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedPG, setSelectedPG] = useState(null);
  const [funnelData, setFunnelData] = useState(pgFunnelStages);
  const [hoveredSection, setHoveredSection] = useState(null);
  
  // Logging for debugging
  useEffect(() => {
    console.log("PG Funnel received data:", { 
      dataCount: pgData?.length,
      area: currentArea,
      funnelData: pgFunnelData?.length,
      hasAssignments: !!pgAssignments,
      moveFunctionAvailable: !!movePgToStage
    });
    
    console.log("PG Assignments:", pgAssignments);
    
    // Use real data if available
    if (pgFunnelData && pgFunnelData.length > 0) {
      setFunnelData(pgFunnelData);
    }
  }, [pgFunnelData, pgAssignments, pgData, currentArea, movePgToStage]);

  const handleFunnelClick = (entry) => {
    if (entry.value === 0) return;
    console.log("Clicked funnel stage:", entry.name);
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedPG(null);
  };

  const handleMovePG = (pg) => {
    console.log("Selected PG for move:", pg);
    setSelectedPG(pg);
    setShowMoveOptions(true);
  };

  const handleMoveToStage = (targetStage) => {
    console.log("Moving PG:", {
      pg: selectedPG,
      from: expandedStage,
      to: targetStage,
      moveFunctionAvailable: !!movePgToStage
    });
    
    if (!selectedPG || !targetStage || !movePgToStage) {
      console.error("Cannot move PG - missing required data:", {
        selectedPG,
        targetStage,
        moveFunctionAvailable: !!movePgToStage
      });
      return;
    }
    
    try {
      movePgToStage(selectedPG, expandedStage, targetStage);
      console.log("PG moved successfully");
    } catch (error) {
      console.error("Error moving PG:", error);
    }
    
    setShowMoveOptions(false);
    setSelectedPG(null);
  };

  const handleBack = () => {
    setExpandedStage(null);
    setShowMoveOptions(false);
    setSelectedPG(null);
  };

  // Get PG names for the expanded stage view
  const getPGNamesForStage = (stageName) => {
    // Use real data if available, otherwise use mock data
    if (pgAssignments && pgAssignments[stageName] && pgAssignments[stageName].length > 0) {
      console.log(`Found ${pgAssignments[stageName].length} PGs in stage "${stageName}"`);
      return pgAssignments[stageName];
    }
    
    // Use a subset of mock names based on stage
    const stageIndex = funnelData.findIndex(item => item.name === stageName);
    if (stageIndex >= 0) {
      const count = Math.max(1, Math.floor(funnelData[stageIndex].value / 100));
      console.log(`Using ${count} mock PG names for stage "${stageName}"`);
      return pgNames.slice(0, count);
    }
    
    console.log(`No PGs found for stage "${stageName}", using default mock data`);
    return pgNames.slice(0, 3);
  };

  const handleMouseOver = (index) => {
    setHoveredSection(index);
  };

  const handleMouseOut = () => {
    setHoveredSection(null);
  };

  return (
    <div className="pg-funnel-container">
      <h3 className="funnel-title">PG Funnel</h3>
      {expandedStage ? (
        <div className="expanded-list">
          <div className="expanded-header">
            <h4>{expandedStage}</h4>
            <button className="back-button" onClick={handleBack}>
              ← Back to Funnel
            </button>
          </div>
          {getPGNamesForStage(expandedStage).map((pg, index) => (
            <div key={index} className="pg-entry">
              {pg}
              {!showMoveOptions && (
                <button onClick={() => handleMovePG(pg)}>Move</button>
              )}
            </div>
          ))}
          {showMoveOptions && (
            <div className="move-options">
              <h5>Move {selectedPG} to:</h5>
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
          <svg width="400" height="650">
            {/* Main funnel shape (inverted triangle) */}
            <g>
              {/* First section */}
              <path d="M50,50 L350,50 L340,100 L60,100 Z" 
                    fill={funnelData[0]?.fill || "#2980B9"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[0])}
                    onMouseOver={() => handleMouseOver(0)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="75" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[0] || funnelData[0]?.value || 1}
              </text>
              
              {/* Second section */}
              <path d="M60,100 L340,100 L330,150 L70,150 Z" 
                    fill={funnelData[1]?.fill || "#3498DB"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[1])}
                    onMouseOver={() => handleMouseOver(1)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="125" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[1] || funnelData[1]?.value || 1}
              </text>
              
              {/* Third section */}
              <path d="M70,150 L330,150 L320,200 L80,200 Z" 
                    fill={funnelData[2]?.fill || "#45B7D1"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[2])}
                    onMouseOver={() => handleMouseOver(2)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="175" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[2] || funnelData[2]?.value || 1}
              </text>
              
              {/* Fourth section */}
              <path d="M80,200 L320,200 L310,250 L90,250 Z" 
                    fill={funnelData[3]?.fill || "#F39C12"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[3])}
                    onMouseOver={() => handleMouseOver(3)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="225" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[3] || funnelData[3]?.value || 1}
              </text>
              
              {/* Fifth section */}
              <path d="M90,250 L310,250 L300,300 L100,300 Z" 
                    fill={funnelData[4]?.fill || "#E67E22"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[4])}
                    onMouseOver={() => handleMouseOver(4)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="275" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[4] || funnelData[4]?.value || 1}
              </text>
              
              {/* Sixth section */}
              <path d="M100,300 L300,300 L290,350 L110,350 Z" 
                    fill={funnelData[5]?.fill || "#D35400"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[5])}
                    onMouseOver={() => handleMouseOver(5)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="325" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[5] || funnelData[5]?.value || 1}
              </text>
              
              {/* Seventh section */}
              <path d="M110,350 L290,350 L280,400 L120,400 Z" 
                    fill={funnelData[6]?.fill || "#E74C3C"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[6])}
                    onMouseOver={() => handleMouseOver(6)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="375" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[6] || funnelData[6]?.value || 1}
              </text>
              
              {/* Eighth section */}
              <path d="M120,400 L280,400 L270,450 L130,450 Z" 
                    fill={funnelData[7]?.fill || "#C0392B"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[7])}
                    onMouseOver={() => handleMouseOver(7)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="425" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[7] || funnelData[7]?.value || 1}
              </text>
              
              {/* Ninth section */}
              <path d="M130,450 L270,450 L260,500 L140,500 Z" 
                    fill={funnelData[8]?.fill || "#E57373"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[8])}
                    onMouseOver={() => handleMouseOver(8)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="475" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[8] || funnelData[8]?.value || 1}
              </text>
              
              {/* Tenth section */}
              <path d="M140,500 L260,500 L250,550 L150,550 Z" 
                    fill={funnelData[9]?.fill || "#B71C1C"} 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(funnelData[9])}
                    onMouseOver={() => handleMouseOver(9)}
                    onMouseOut={handleMouseOut} />
              <text x="200" y="525" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[9] || funnelData[9]?.value || 1}
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

export default PGFunnel;
