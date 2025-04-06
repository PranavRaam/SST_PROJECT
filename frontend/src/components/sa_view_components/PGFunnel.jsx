import React, { useState, useContext } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/PGFunnel.css"; // Importing CSS

// Updated data with larger numbers to match the example image
const initialData = [
  { name: "Total Potential Patients", value: 1000, fill: "#2980B9" },
  { name: "Active Interest", value: 800, fill: "#45B7D1" },
  { name: "Initial Contact", value: 600, fill: "#F39C12" },
  { name: "In Assessment", value: 400, fill: "#E67E22" },
  { name: "Ready for Service", value: 300, fill: "#E74C3C" },
  { name: "Service Started", value: 200, fill: "#E57373" },
  { name: "Active Treatment", value: 150, fill: "#4CAF50" },
  { name: "Ready for Discharge", value: 100, fill: "#795548" },
  { name: "Discharged", value: 50, fill: "#9C27B0" },
  { name: "Post-Discharge", value: 25, fill: "#F48FB1" }
];

const pgNames = [
  "PG Alpha", "PG Beta", "PG Gamma", "PG Delta", "PG Epsilon",
  "PG Zeta", "PG Eta", "PG Theta", "PG Iota", "PG Kappa",
  "PG Lambda", "PG Mu", "PG Nu", "PG Xi", "PG Omicron"
];

const PGFunnel = () => {
  const { pgFunnelData, pgAssignments, movePgToStage } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedPG, setSelectedPG] = useState(null);

  // Always use initialData for display, merge with context data if available
  const transformedFunnelData = initialData.map(stage => ({
    ...stage,
    value: pgAssignments?.[stage.name]?.length || stage.value
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
    setSelectedPG(null);
  };

  const handleMovePG = (pg, currentStage) => {
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const stageName = payload[0].payload.name;
      const pgCount = pgAssignments?.[stageName]?.length || 0;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{stageName}</p>
          <p className="tooltip-value">PGs: {pgCount}</p>
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
          {(pgAssignments?.[expandedStage] || pgNames.slice(0, 5)).map((pg, index) => (
            <div key={index} className="pg-entry">
              {pg}
              {!showMoveOptions && (
                <button onClick={() => handleMovePG(pg, expandedStage)}>Move</button>
              )}
            </div>
          ))}
          {showMoveOptions && (
            <div className="move-options">
              <h5>Move {selectedPG} to:</h5>
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

export default PGFunnel;
