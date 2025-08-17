import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LabelList 
} from 'recharts';
import { Spin, Empty, message, Typography } from 'antd';
import { getPartNumberStatistics } from '../../../services/dashboard.service';
import './PartNumberChart.css';

const { Title, Text } = Typography;

const PartNumberChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Soothing light colors for bars
  const barColors = [
    '#e6f7ff', '#bae7ff', '#91d5ff', '#69c0ff', '#40a9ff',
    '#e6fffb', '#b5f5ec', '#87e8de', '#5cdbd3', '#36cfc9'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPartNumberStatistics();
        
        if (data && data.part_statistics) {
          let total = 0;
          
          const formattedData = data.part_statistics.map((item, index) => {
            total += item.service_count;
            return {
              name: item.part_no || item.model_no || `Unknown #${index+1}`,
              partNo: item.part_no || 'N/A',
              modelNo: item.model_no || 'N/A',
              count: item.service_count,
              fill: barColors[index % barColors.length]
            };
          });
          
          // Sort data in descending order of count
          formattedData.sort((a, b) => b.count - a.count);
          
          // Limit to top 10 if there are many
          const limitedData = formattedData.slice(0, 10);
          
          setTotalCount(total);
          setChartData(limitedData);
        }
      } catch (err) {
        console.error('Error fetching part number statistics:', err);
        message.error('Failed to load part number statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate percentage for each item
  const getPercentage = useCallback((count) => {
    return totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
  }, [totalCount]);

  // Simple custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = getPercentage(data.count);
      
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-title">{label}</span>
          </div>
          <div className="tooltip-content">
            <div className="tooltip-data-row">
              <span className="tooltip-label">Part No:</span>
              <span className="tooltip-value">{data.partNo}</span>
            </div>
            <div className="tooltip-data-row">
              <span className="tooltip-label">Model No:</span>
              <span className="tooltip-value">{data.modelNo}</span>
            </div>
            <div className="tooltip-data-row">
              <span className="tooltip-label">Count:</span>
              <span className="tooltip-value">{data.count.toLocaleString()}</span>
            </div>
            <div className="tooltip-data-row">
              <span className="tooltip-label">Percentage:</span>
              <span className="tooltip-value">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for showing value inside bars
  const renderCustomBarLabel = (props) => {
    const { x, y, width, value, height } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y + height / 2} 
        fill="#333333"
        textAnchor="middle"
        dominantBaseline="middle"
        className="bar-label"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="part-number-chart">
      <Spin spinning={loading}>
        {chartData.length > 0 ? (
          <div className="chart-container">
            <div className="chart-header">
              <Title level={4} className="chart-title">Most Serviced Pumps</Title>
              <Text type="secondary" className="chart-subtitle">
                Based on {totalCount.toLocaleString()} total service reports
              </Text>
            </div>
            
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 40,
                  bottom: 30,
                }}
                barCategoryGap="15%"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  horizontal={true}
                  vertical={false}
                  stroke="#e0e0e0"
                />
                <XAxis 
                  type="number"
                  tick={{ fill: '#333', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#d9d9d9' }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#333', fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#d9d9d9' }}
                  width={120}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Service Count" 
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                >
                  <LabelList 
                    dataKey="count"
                    content={renderCustomBarLabel}
                    position="center"
                  />
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      stroke="#d9d9d9"
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty 
            description={loading ? "Loading statistics..." : "No part data available"} 
            className="chart-empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>
    </div>
  );
};

export default PartNumberChart;