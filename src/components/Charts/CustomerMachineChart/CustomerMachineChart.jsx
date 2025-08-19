import React, { useEffect, useState } from 'react';
import { Spin, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { getCustomerMachineStatistics } from '../../../services/dashboard.service';
import './CustomerMachineChart.css';

const COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#722ed1', '#f5222d',
  '#13c2c2', '#eb2f96', '#2f54eb', '#a0d911', '#fa541c',
  '#fa8c16', '#b37feb', '#36cfc9', '#ffec3d', '#ff85c0',
];

const CustomerMachineChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // The API returns { customer_statistics: [...] }
        const resp = await getCustomerMachineStatistics();
        const stats = resp.customer_statistics || [];
        // Sort and take top 15
        const sorted = stats
          .sort((a, b) => b.machine_count - a.machine_count)
          .slice(0, 15)
          .map(item => ({
            customer: item.customer_name,
            count: item.machine_count,
          }));
        setData(sorted);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    <Spin spinning={loading}>
      {data.length > 0 ? (
        <div className="customer-machine-chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              barCategoryGap={10}
            >
              <XAxis
                type="number"
                dataKey="count"
                tick={{ fontSize: 13 }}
                label={{ value: 'Machine Count', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                type="category"
                dataKey="customer"
                width={180}
                tick={{ fontSize: 9 }}
                label={{ angle: -90, position: 'insideLeft', offset: 5 }}
              />
              <Tooltip
                formatter={(value) => [value, 'Machines']}
                labelFormatter={(label) => `Customer: ${label}`}
              />
              <Bar dataKey="count" fill="#1890ff" radius={[4, 4, 4, 4]}>
                <LabelList dataKey="count" content={renderCustomBarLabel} position="center" />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        !loading && <Empty description="No data" />
      )}
    </Spin>
  );
};

export default CustomerMachineChart;