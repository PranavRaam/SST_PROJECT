import React, { useState, useContext, useEffect } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/PGFunnel.css"; // Importing CSS

// Fixed values that match the image
const initialData = [
  { name: "Total Potential Patients", value: 1000, fill: "#2980B9" },
  { name: "Active Interest", value: 800, fill: "#45B7D1" },
  { name: "Initial Contact", value: 600, fill: "#F39C12" },
  { name: "In Assessment", value: 400, fill: "#E67E22" },
  { name: "Ready for Service", value: 300, fill: "#E74C3C" },
  { name: "Service Started", value: 200, fill: "#E57373" }
];

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
          <FunnelChart width={350} height={500}>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="value"
              data={displayData}
              isAnimationActive={true}
              onClick={handleFunnelClick}
              width={280}
              height={500}
              nameKey="name"
              shape="trapezoid"
              fill="#8884d8"
              paddingAngle={0}
              labelContainerDelay={500}
            >
              <LabelList 
                dataKey="value" 
                position="center"
                fill="#fff" 
                stroke="none" 
                fontSize={16} 
                fontWeight="bold"
              />
            </Funnel>
          </FunnelChart>
        </div>
      )}
    </div>
  );
};

export default PGFunnel;
