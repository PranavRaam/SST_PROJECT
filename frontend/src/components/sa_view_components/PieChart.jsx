import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "../sa_view_css/PieChart.css"; // Importing CSS

// Based on average patient counts from the regions
const totalPatients = 165750; // Sum of all regions' patients from regionStatistics
const data = [
  { name: "Remaining Patients", value: 82, exactCount: 135915, color: "#e0e6ed" },
  { name: "Patients Acquired", value: 18, exactCount: 29835, color: "#2c3e50" }
];

const CustomPieChart = () => {
  const CustomTooltip = ({ active, payload, coordinate }) => {
    if (active && payload && payload.length) {
      const { x, y } = coordinate || {};
      const style = {
        left: x,
        top: y - 60, // Offset above the cursor
        transform: 'translateX(-50%)', // Center horizontally
      };

      return (
        <div className="custom-tooltip" style={style}>
          <p>{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value}% ({payload[0].payload.exactCount.toLocaleString()})</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="piechart-container">
      <h3 className="chart-title">Patient Distribution</h3>
      <PieChart width={500} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          paddingAngle={5}
          dataKey="value"
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1000}
          animationEasing="ease-out"
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip />}
          position={{ x: 0, y: 0 }}
          cursor={false}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span className="legend-text">
              {value} ({entry.payload.value}% - {entry.payload.exactCount.toLocaleString()})
            </span>
          )}
        />
      </PieChart>
    </div>
  );
};

export default CustomPieChart;
