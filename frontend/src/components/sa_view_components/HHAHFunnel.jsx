import React, { useState, useContext } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/HHAHFunnel.css"; // Import the CSS file

// Updated data with larger numbers to match the example image
const initialData = [
  { name: "Total Patient Base", value: 800, fill: "#C0392B" },
  { name: "Eligible Patients", value: 650, fill: "#E74C3C" },
  { name: "Assessment Ready", value: 500, fill: "#9B59B6" },
  { name: "Service Ready", value: 350, fill: "#F1C40F" },
  { name: "In Treatment", value: 200, fill: "#2ECC71" },
  { name: "Near Completion", value: 100, fill: "#16A085" },
  { name: "Complete", value: 50, fill: "#3498DB" }
];

const hhahNames = [
  "HHAH Alpha", "HHAH Beta", "HHAH Gamma", "HHAH Delta", "HHAH Epsilon",
  "HHAH Zeta", "HHAH Eta", "HHAH Theta", "HHAH Iota", "HHAH Kappa",
  "HHAH Lambda", "HHAH Mu", "HHAH Nu", "HHAH Xi", "HHAH Omicron"
];

const HHAHFunnel = () => {
  const { hhahFunnelData, hhahAssignments, moveHhahToStage } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedHHAH, setSelectedHHAH] = useState(null);

  // Always use initialData for display, merge with context data if available
  const transformedFunnelData = initialData.map(stage => ({
    ...stage,
    value: hhahAssignments?.[stage.name]?.length || stage.value
  }));

  const renderCustomizedShape = (props) => {
    const { x, y, width, height, payload } = props;
    const widthRatio = 0.8; // Visual width ratio
    const minWidth = width * 0.4; // Minimum width for the bottom of visual shape
    
    // Calculate visual shape dimensions
    const visualTopWidth = width * widthRatio;
    const visualBottomWidth = Math.max(minWidth, width * 0.6);
    const xOffsetTop = (width - visualTopWidth) / 2;
    const xOffsetBottom = (width - visualBottomWidth) / 2;

    return (
      <g>
        {/* Invisible clickable rectangle that covers a wider area */}
        <rect
          x={x + width * 0.1} // 10% margin from left
          y={y}
          width={width * 0.8} // 80% of total width
          height={height}
          fill="transparent"
          className="clickable-area"
          style={{ cursor: 'pointer' }}
        />
        {/* Visual funnel shape */}
        <path
          d={`
            M ${x + xOffsetTop},${y}
            L ${x + xOffsetTop + visualTopWidth},${y}
            L ${x + xOffsetBottom + visualBottomWidth},${y + height}
            L ${x + xOffsetBottom},${y + height}
            Z
          `}
          fill={payload.fill}
          className="custom-funnel-block"
          style={{
            filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))',
            transition: 'all 0.3s ease',
            pointerEvents: 'none' // Ensure the path doesn't interfere with clicks
          }}
        />
      </g>
    );
  };

  const handleFunnelClick = (entry) => {
    if (entry.value === 0) return;
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const handleMoveHHAH = (hhah, currentStage) => {
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const stageName = payload[0].payload.name;
      const hhahCount = hhahAssignments?.[stageName]?.length || 0;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{stageName}</p>
          <p className="tooltip-value">HHAHs: {hhahCount}</p>
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
          {(hhahAssignments?.[expandedStage] || hhahNames.slice(0, 5)).map((hhah, index) => (
            <div key={index} className="hhah-entry">
              {hhah}
              {!showMoveOptions && (
                <button onClick={() => handleMoveHHAH(hhah, expandedStage)}>Move</button>
              )}
            </div>
          ))}
          {showMoveOptions && (
            <div className="move-options">
              <h5>Move {selectedHHAH} to:</h5>
              {transformedFunnelData
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
          <FunnelChart width={400} height={600}>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="value"
              data={transformedFunnelData}
              isAnimationActive={true}
              onClick={handleFunnelClick}
              width={300}
              shape={renderCustomizedShape}
              trapezoidHeight={50}
              trapezoidsSpace={5}
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