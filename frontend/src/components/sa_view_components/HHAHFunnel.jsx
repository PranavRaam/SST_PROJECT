import React, { useState, useContext, useEffect } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/HHAHFunnel.css"; // Importing CSS

// Fixed values that match the image
const initialData = [
  { name: "They exist but they haven't heard of us", value: 800, fill: "#C0392B" },
  { name: "They've now heard of us but that's it", value: 650, fill: "#E74C3C" },
  { name: "Enough interest that they're interacting with our content", value: 500, fill: "#9B59B6" },
  { name: "Enough interest that they're now talking to us", value: 350, fill: "#F1C40F" },
  { name: "99 cent model", value: 200, fill: "#2ECC71" },
  { name: "Upsold (Fully subscribed)", value: 100, fill: "#16A085" }
];

// Generate HHAH names for the mock data view
const hhahNames = [
  "HHAH Alpha", "HHAH Beta", "HHAH Gamma", "HHAH Delta", "HHAH Epsilon",
  "HHAH Zeta", "HHAH Eta", "HHAH Theta", "HHAH Iota", "HHAH Kappa",
  "HHAH Lambda", "HHAH Mu", "HHAH Nu", "HHAH Xi", "HHAH Omicron"
];

const HHAHFunnel = () => {
  const { hhahFunnelData, hhahAssignments, moveHhahToStage, hhahData, currentArea } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedHHAH, setSelectedHHAH] = useState(null);
  
  // Logging for debugging
  useEffect(() => {
    console.log("HHAH Funnel received data:", { 
      dataCount: hhahData?.length,
      area: currentArea,
      funnelData: hhahFunnelData?.length,
      hasAssignments: !!hhahAssignments
    });
  }, [hhahFunnelData, hhahAssignments, hhahData, currentArea]);

  // Always use initialData for display to match the image
  const displayData = initialData;

  const handleFunnelClick = (entry) => {
    if (entry.value === 0) return;
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const handleMoveHHAH = (hhah) => {
    setSelectedHHAH(hhah);
    setShowMoveOptions(true);
  };

  const handleMoveToStage = (targetStage) => {
    if (!selectedHHAH || !targetStage || !moveHhahToStage) return;
    moveHhahToStage(selectedHHAH, expandedStage, targetStage);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const handleBack = () => {
    setExpandedStage(null);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  // Get HHAH names for the expanded stage view
  const getHHAHNamesForStage = (stageName) => {
    // Use real data if available, otherwise use mock data
    if (hhahAssignments && hhahAssignments[stageName] && hhahAssignments[stageName].length > 0) {
      return hhahAssignments[stageName];
    }
    
    // Use a subset of mock names based on stage
    const stageIndex = initialData.findIndex(item => item.name === stageName);
    if (stageIndex >= 0) {
      const count = Math.max(1, Math.floor(initialData[stageIndex].value / 100));
      return hhahNames.slice(0, count);
    }
    
    return hhahNames.slice(0, 3);
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
    <div className="hhah-funnel-container">
      <h3 className="funnel-title">HHAH Funnel</h3>
      {expandedStage ? (
        <div className="expanded-list">
          <div className="expanded-header">
            <h4>{expandedStage}</h4>
            <button className="back-button" onClick={handleBack}>
              ← Back to Funnel
            </button>
          </div>
          {getHHAHNamesForStage(expandedStage).map((hhah, index) => (
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

export default HHAHFunnel;