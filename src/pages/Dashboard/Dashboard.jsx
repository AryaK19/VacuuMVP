import React from 'react';
import { Row, Col, Card, Statistic, Typography, List, Avatar } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const { Title } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  
  // Sample data - would come from your API in a real application
  const recentActivities = [
    {
      title: 'John Smith purchased a new subscription',
      when: '2 minutes ago',
      avatar: <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />,
    },
    {
      title: 'New order #1234 has been placed',
      when: '10 minutes ago',
      avatar: <Avatar icon={<ShoppingCartOutlined />} style={{ backgroundColor: '#1677ff' }} />,
    },
    {
      title: 'Payment received from customer #5678',
      when: '1 hour ago',
      avatar: <Avatar icon={<DollarOutlined />} style={{ backgroundColor: '#f56a00' }} />,
    },
    {
      title: 'System maintenance scheduled for next week',
      when: '2 hours ago',
      avatar: <Avatar icon={<BellOutlined />} style={{ backgroundColor: '#ff4d4f' }} />,
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2}>Welcome back, {user?.name || 'User'}</Title>
        <p>Here's what's happening today</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1238}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={156}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={15690}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={12}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Overview">
            <div className="dashboard-chart-placeholder">
              {/* In a real app, you would put a chart or graph here */}
              <div className="placeholder-text">
                Analytics chart will be displayed here
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Recent Activities" className="recent-activities-card">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.avatar}
                    title={item.title}
                    description={item.when}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
