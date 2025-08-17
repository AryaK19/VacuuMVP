import React from 'react';
import { Row, Col, Card, Statistic, Typography, List } from 'antd';
import { 
  ToolOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const DistributorDashboard = () => {
  const { user } = useAuth();
  
  // Placeholder data - would be fetched from API in real implementation
  const stats = {
    totalMachines: 12,
    serviceReports: 45,
    pendingServices: 3
  };
  
  const recentActivities = [
    { id: 1, action: 'Service Report Added', machine: 'SN12345', date: '2023-11-01' },
    { id: 2, action: 'Machine Registered', machine: 'SN23456', date: '2023-10-28' },
    { id: 3, action: 'Service Report Updated', machine: 'SN12345', date: '2023-10-25' },
    { id: 4, action: 'Machine Registered', machine: 'SN34567', date: '2023-10-20' },
  ];

  return (
    <div className="distributor-dashboard">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Welcome, {user?.name || 'Distributor'}</Title>
        <Text type="secondary">Here's an overview of your machines and service reports.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="My Machines" 
              value={stats.totalMachines} 
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Service Reports" 
              value={stats.serviceReports} 
              prefix={<FileTextOutlined />} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Pending Services" 
              value={stats.pendingServices} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: stats.pendingServices > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Activities" style={{ marginTop: 24 }}>
        <List
          itemLayout="horizontal"
          dataSource={recentActivities}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.action}
                description={`Machine: ${item.machine}`}
              />
              <div>{item.date}</div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default DistributorDashboard;
