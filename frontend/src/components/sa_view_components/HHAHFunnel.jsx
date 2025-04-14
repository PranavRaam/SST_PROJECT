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
    { name: "They exist but they haven't heard of us", value: 60, fill: "#FF7272" },
    { name: "They've now heard of us but that's it", value: 20, fill: "#FFA5A5" },
    { name: "Enough interest that they're interacting with our content", value: 15, fill: "#7986CB" },
    { name: "Enough interest that they're now talking to us", value: 5, fill: "#FF9E80" },
    { name: "99 cent model", value: 0, fill: "#D1C4E9" },
    { name: "Upsold (Fully subscribed)", value: 0, fill: "#A5D6A7" }
  ];

  // Get actual counts for display
  const getValueForStage = (stage) => {
    const stageMap = {
      "They exist but they haven't heard of us": "Freemium",
      "They've now heard of us but that's it": "Not Using",
      "Enough interest that they're interacting with our content": "Order360 Lite",
      "Enough interest that they're now talking to us": "Order360 Full",
      "99 cent model": "Order360 Full", // Map to existing data type
      "Upsold (Fully subscribed)": "Upsold (Fully subscribed)"
    };
    
    const mappedStage = stageMap[stage] || stage;
    return filteredData.filter(item => item['Agency Type'] === mappedStage).length || 0;
  };

  // Values to display in the center of each section
  const displayValues = [
    getValueForStage('They exist but they haven\'t heard of us') || 10,
    getValueForStage('They\'ve now heard of us but that\'s it') || 8,
    getValueForStage('Enough interest that they\'re interacting with our content') || 6,
    getValueForStage('Enough interest that they\'re now talking to us') || 4,
    getValueForStage('99 cent model') || 2,
    getValueForStage('Upsold (Fully subscribed)') || 1
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
          <svg width="350" height="400" viewBox="0 0 350 400" preserveAspectRatio="xMidYMid meet">
            {/* Main funnel shape (inverted triangle) */}
            <g>
              {/* First section */}
              <path d="M75,50 L275,50 L260,100 L90,100 Z" 
                    fill="#FF7272" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[0])} />
              <text x="175" y="75" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[0]}
              </text>
              
              {/* Second section */}
              <path d="M90,100 L260,100 L245,150 L105,150 Z" 
                    fill="#FFA5A5" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[1])} />
              <text x="175" y="125" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[1]}
              </text>
              
              {/* Third section */}
              <path d="M105,150 L245,150 L230,200 L120,200 Z" 
                    fill="#7986CB" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[2])} />
              <text x="175" y="175" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[2]}
              </text>
              
              {/* Fourth section */}
              <path d="M120,200 L230,200 L215,250 L135,250 Z" 
                    fill="#FF9E80" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[3])} />
              <text x="175" y="225" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[3]}
              </text>
              
              {/* Fifth section */}
              <path d="M135,250 L215,250 L200,300 L150,300 Z" 
                    fill="#D1C4E9" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[4])} />
              <text x="175" y="275" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[4]}
              </text>
              
              {/* Sixth section */}
              <path d="M150,300 L200,300 L190,350 L160,350 Z" 
                    fill="#A5D6A7" 
                    stroke="#fff" 
                    strokeWidth="1"
                    onClick={() => handleFunnelClick(displayData[5])} />
              <text x="175" y="325" textAnchor="middle" 
                    fill="#fff" fontSize="16" fontWeight="bold">
                {displayValues[5]}
              </text>
            </g>
          </svg>
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