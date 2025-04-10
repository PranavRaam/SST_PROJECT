import React, { useState, useContext, useEffect } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/HHAHFunnel.css";
import combinedData from '../../assets/data/combined_data.json';

const HHAHFunnel = () => {
  const { currentArea, hhahAssignments, moveHhahToStage } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedHHAH, setSelectedHHAH] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  
  // Get filtered data for current area
  useEffect(() => {
    if (currentArea) {
      // Extract all HHAH data from the nested structure
      const allHHAHData = [
        ...(combinedData.West_Details || []),
        ...(combinedData.East_Central_Details || []),
        ...(combinedData.Central_Details || [])
      ];

      // Filter the data based on Metropolitan (or Micropolitan) Area
      const filtered = allHHAHData.filter(item => {
        const itemArea = item['Metropolitan (or Micropolitan) Area']?.toLowerCase() || '';
        const selectedArea = currentArea.toLowerCase();
        return itemArea === selectedArea;
      });

      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [currentArea]);

  // Calculate display data based on actual filtered data
  const displayData = [
    { name: "Freemium", value: filteredData.filter(item => item['Agency Type'] === 'Freemium').length, fill: "#C0392B" },
    { name: "Not Using", value: filteredData.filter(item => item['Agency Type'] === 'Not Using').length, fill: "#E74C3C" },
    { name: "Order360 Lite", value: filteredData.filter(item => item['Agency Type'] === 'Order360 Lite').length, fill: "#9B59B6" },
    { name: "Order360 Full", value: filteredData.filter(item => item['Agency Type'] === 'Order360 Full').length, fill: "#F1C40F" },
    { name: "Upsold (Fully subscribed)", value: filteredData.filter(item => item['Agency Type'] === 'Upsold (Fully subscribed)').length, fill: "#2ECC71" }
  ];

  const handleFunnelClick = (entry) => {
    if (entry.value === 0) return;
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const handleHHAHClick = (hhahName) => {
    setSelectedHHAH(hhahName);
    setShowMoveOptions(true);
  };

  const handleMoveHHAH = (toStage) => {
    if (selectedHHAH && expandedStage) {
      moveHhahToStage(selectedHHAH, expandedStage, toStage);
      setShowMoveOptions(false);
      setSelectedHHAH(null);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const stage = payload[0].payload.name;
      const hhahsInStage = hhahAssignments?.[stage] || [];
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{stage}</p>
          <p className="tooltip-value">Count: {payload[0].value}</p>
          {hhahsInStage.length > 0 && (
            <div className="tooltip-hhahs">
              <p>HHAHs in this stage:</p>
              <ul>
                {hhahsInStage.map((hhah, index) => (
                  <li 
                    key={index}
                    onClick={() => handleHHAHClick(hhah)}
                    className="tooltip-hhah-item"
                  >
                    {hhah}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hhah-funnel-container">
      <h2 className="funnel-title">HHAH Funnel</h2>
      {filteredData.length > 0 ? (
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
      ) : (
        <div className="no-data-message">
          <p>No HHAH data available for the selected area</p>
        </div>
      )}
    </div>
  );
};

export default HHAHFunnel;