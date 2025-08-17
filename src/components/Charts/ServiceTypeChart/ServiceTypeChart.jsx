import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LabelList 
} from 'recharts';
import { Spin, Empty, message, Typography } from 'antd';
import { getServiceTypeStatistics } from '../../../services/dashboard.service';
import './ServiceTypeChart.css';

const { Title, Text } = Typography;

const ServiceTypeChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Soothing solid colors for different service types
  const colorMap = {
    'Warranty': '#e6f7ff',
    'AMC': '#d9f7be',
    'Paid': '#fff7e6',
    'Installation': '#fff1f0',
    'Health Check': '#f0f5ff'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getServiceTypeStatistics();
        
        if (data && data.service_types) {
          let total = 0;
          
          const formattedData = data.service_types.map(item => {
            total += item.count;
            return {
              name: item.service_type,
              count: item.count,
              fill: colorMap[item.service_type] || '#e6f7ff'
            };
          });
          
          // Sort data in descending order of count
          formattedData.sort((a, b) => b.count - a.count);
          
          setTotalCount(total);
          setChartData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching service type statistics:', err);
        message.error('Failed to load service type statistics');
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
    <div className="service-type-chart">
      <Spin spinning={loading}>
        {chartData.length > 0 ? (
          <div className="chart-container">
            <div className="chart-header">
              <Title level={4} className="chart-title">Service Type Distribution</Title>
              <Text type="secondary" className="chart-subtitle">
                Based on {totalCount.toLocaleString()} total service reports
              </Text>
            </div>
            
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
                barCategoryGap="15%"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke="#e0e0e0"
                />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: '#333', fontSize: 12, fontWeight: 500 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tickLine={false}
                  axisLine={{ stroke: '#d9d9d9' }}
                />
                <YAxis 
                  tick={{ fill: '#333', fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                  tickLine={false}
                  axisLine={{ stroke: '#d9d9d9' }}
                  width={50}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Number of Services" 
                  radius={[4, 4, 0, 0]}
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
            description={loading ? "Loading statistics..." : "No service type data available"} 
            className="chart-empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>
    </div>
  );
};

export default ServiceTypeChart;