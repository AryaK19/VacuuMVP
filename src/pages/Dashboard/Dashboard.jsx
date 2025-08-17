import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Avatar, Spin, message, Modal, Descriptions, Tag } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BellOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  BuildOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { getRecentActivities, getServiceReportDetail } from '../../services/dashboard.service';
import './Dashboard.css';

const { Title } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Show only 5 recent activities on dashboard
    total: 0
  });

  // Function to get icon based on service type
  const getServiceTypeIcon = (serviceType) => {
    const iconStyle = { fontSize: '16px' };
    
    switch (serviceType.toLowerCase()) {
      case 'warranty':
        return <Avatar icon={<SafetyCertificateOutlined />} style={{ backgroundColor: '#52c41a', ...iconStyle }} />;
      case 'paid':
        return <Avatar icon={<DollarOutlined />} style={{ backgroundColor: '#1677ff', ...iconStyle }} />;
      case 'maintenance':
        return <Avatar icon={<ToolOutlined />} style={{ backgroundColor: '#fa8c16', ...iconStyle }} />;
      case 'repair':
        return <Avatar icon={<BuildOutlined />} style={{ backgroundColor: '#f5222d', ...iconStyle }} />;
      case 'installation':
        return <Avatar icon={<SettingOutlined />} style={{ backgroundColor: '#722ed1', ...iconStyle }} />;
      default:
        return <Avatar icon={<BellOutlined />} style={{ backgroundColor: '#8c8c8c', ...iconStyle }} />;
    }
  };

  // Function to get service type color for tags
  const getServiceTypeColor = (serviceType) => {
    switch (serviceType.toLowerCase()) {
      case 'warranty':
        return 'green';
      case 'paid':
        return 'blue';
      case 'maintenance':
        return 'orange';
      case 'repair':
        return 'red';
      case 'installation':
        return 'purple';
      default:
        return 'default';
    }
  };

  // Function to format relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMs = now - activityDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle clicking on an activity
  const handleActivityClick = async (reportId) => {
    try {
      setModalLoading(true);
      setModalVisible(true);
      const reportDetail = await getServiceReportDetail(reportId);
      setSelectedReport(reportDetail);
    } catch (error) {
      message.error('Failed to load service report details');
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Close modal
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      const response = await getRecentActivities({
        page: pagination.page,
        limit: pagination.limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      const formattedActivities = response.items.map(activity => ({
        id: activity.report_id,
        title: `${activity.user_name} created a ${activity.service_type_name} service report`,
        when: getRelativeTime(activity.created_at),
        avatar: getServiceTypeIcon(activity.service_type_name),
        serviceType: activity.service_type_name,
        userName: activity.user_name,
        createdAt: activity.created_at
      }));

      setRecentActivities(formattedActivities);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      message.error('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, []);

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
          <Card 
            title="Recent Activities" 
            className="recent-activities-card"
            extra={
              <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {pagination.total} total activities
              </span>
            }
          >
            <Spin spinning={loading}>
              {recentActivities.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleActivityClick(item.id)}
                      actions={[<EyeOutlined key="view" />]}
                    >
                      <List.Item.Meta
                        avatar={item.avatar}
                        title={
                          <div style={{ fontSize: '14px' }}>
                            {item.title}
                          </div>
                        }
                        description={
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {item.when}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                  No recent activities found
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Service Report Detail Modal */}
      <Modal
        title="Service Report Details"
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Spin spinning={modalLoading}>
          {selectedReport && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Report ID" span={2}>
                {selectedReport.id}
              </Descriptions.Item>
              <Descriptions.Item label="Service Type">
                <Tag color={getServiceTypeColor(selectedReport.service_type_name)}>
                  {selectedReport.service_type_name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Service Person">
                {selectedReport.service_person_name || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedReport.user_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedReport.user_email}
              </Descriptions.Item>
              <Descriptions.Item label="Machine Serial No">
                {selectedReport.machine_serial_no || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Machine Model">
                {selectedReport.machine_model_no || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {formatDate(selectedReport.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {formatDate(selectedReport.updated_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Problem" span={2}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedReport.problem || 'No problem description provided'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Solution" span={2}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedReport.solution || 'No solution provided'}
                </div>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default Dashboard;