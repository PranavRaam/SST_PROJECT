import React, { useState, useContext, useEffect } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/PGFunnel.css"; // Importing CSS

// Fixed values that match the image
const initialData = [
  { name: "They exist but they haven't heard of us", value: 60, fill: "#FF7272" },
  { name: "They've now heard of us but that's it", value: 20, fill: "#FFA5A5" },
  { name: "Enough interest that they're interacting with our content", value: 15, fill: "#7986CB" },
  { name: "Enough interest that they're now talking to us", value: 5, fill: "#FF9E80" },
  { name: "They've had a demo", value: 0, fill: "#FFCCBC" },
  { name: "In the buying process", value: 0, fill: "#C5CAE9" },
  { name: "Deal is so hot your hands will burn if you touch it", value: 0, fill: "#FFAB91" },
  { name: "On the platform", value: 0, fill: "#FFCCBC" },
  { name: "In the upselling zone", value: 0, fill: "#D1C4E9" },
  { name: "Upsold to CPOs/CCMs/RPMs/other services", value: 0, fill: "#B39DDB" }
];

// For display in the center of each section
const displayValues = [1000, 800, 600, 400, 300, 200, 150, 100, 75, 50];

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
  
  // Logging for debugging
  useEffect(() => {
    console.log("PG Funnel received data:", { 
      dataCount: pgData?.length,
      area: currentArea,
      funnelData: pgFunnelData?.length,
      hasAssignments: !!pgAssignments
    });
  }, [pgFunnelData, pgAssignments, pgData, currentArea]);

  // Always use initialData for display to match the image
  const displayData = initialData;

  const handleFunnelClick = (entry) => {
    if (entry.value === 0) return;
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedPG(null);
  };

  const handleMovePG = (pg) => {
    setSelectedPG(pg);
    setShowMoveOptions(true);
  };

  const handleMoveToStage = (targetStage) => {
    if (!selectedPG || !targetStage || !movePgToStage) return;
    movePgToStage(selectedPG, expandedStage, targetStage);
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
      return pgAssignments[stageName];
    }
    
    // Use a subset of mock names based on stage
    const stageIndex = initialData.findIndex(item => item.name === stageName);
    if (stageIndex >= 0) {
      const count = Math.max(1, Math.floor(initialData[stageIndex].value / 100));
      return pgNames.slice(0, count);
    }
    
    return pgNames.slice(0, 3);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p className="tooltip-value">{payload[0].payload.value}</p>
        </div>
      );
    }
    return null;
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
              {displayData
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
          <svg width="400" height="550">
            {/* Main funnel shape (inverted triangle) */}
            <g>
              {/* First section */}
              <path d="M100,50 L300,50 L285,100 L115,100 Z" 
                    fill="#FF7272" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[0])} />
              <text x="200" y="75" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[0]}
              </text>
              
              {/* Second section */}
              <path d="M115,100 L285,100 L275,150 L125,150 Z" 
                    fill="#FFA5A5" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[1])} />
              <text x="200" y="125" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[1]}
              </text>
              
              {/* Third section */}
              <path d="M125,150 L275,150 L265,200 L135,200 Z" 
                    fill="#7986CB" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[2])} />
              <text x="200" y="175" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[2]}
              </text>
              
              {/* Fourth section */}
              <path d="M135,200 L265,200 L255,250 L145,250 Z" 
                    fill="#FF9E80" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[3])} />
              <text x="200" y="225" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[3]}
              </text>

              {/* Fifth section */}
              <path d="M145,250 L255,250 L245,300 L155,300 Z" 
                    fill="#FFCCBC" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[4])} />
              <text x="200" y="275" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[4]}
              </text>

              {/* Sixth section */}
              <path d="M155,300 L245,300 L235,350 L165,350 Z" 
                    fill="#C5CAE9" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[5])} />
              <text x="200" y="325" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[5]}
              </text>

              {/* Seventh section */}
              <path d="M165,350 L235,350 L225,400 L175,400 Z" 
                    fill="#FFCCBC" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[6])} />
              <text x="200" y="375" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[6]}
              </text>

              {/* Eighth section */}
              <path d="M175,400 L225,400 L215,450 L185,450 Z" 
                    fill="#FFCCBC" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[7])} />
              <text x="200" y="425" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[7]}
              </text>

              {/* Ninth section */}
              <path d="M185,450 L215,450 L205,500 L195,500 Z" 
                    fill="#D1C4E9" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[8])} />
              <text x="200" y="475" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[8]}
              </text>

              {/* Tenth section */}
              <path d="M195,500 L205,500 L203,525 L197,525 Z" 
                    fill="#D1C4E9" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[9])} />
              <text x="200" y="515" textAnchor="middle" 
                    fill="#fff" fontSize="14" fontWeight="bold">
                {displayValues[9]}
              </text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};

export default PGFunnel;
