import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Avatar, Spin, message } from 'antd';
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
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStatistics, getRecentActivities, getServiceReportDetail } from '../../services/dashboard.service';
import ServiceReportDetailsModal from '../../components/ServiceReportDetailsModal/ServiceReportDetailsModal';
import './Dashboard.css';

const { Title } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_distributors: 0,
    sold_machines: 0,
    available_machines: 0,
    monthly_service_reports: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
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

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await getDashboardStatistics();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setStatsLoading(false);
    }
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
    fetchDashboardStats();
    fetchRecentActivities();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2}>Welcome back, {user?.name || 'User'}</Title>
        <p>Here's what's happening today</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="Total Distributors"
                value={dashboardStats.total_distributors}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="Sold/Available Machines"
                value={`${dashboardStats.sold_machines}/${dashboardStats.available_machines}`}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Spin spinning={statsLoading}>
              <Statistic
                title="Monthly Reports"
                value={dashboardStats.monthly_service_reports}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Spin>
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

      {/* Service Report Details Modal */}
      <ServiceReportDetailsModal
        visible={modalVisible}
        onClose={handleModalClose}
        reportData={selectedReport}
        loading={modalLoading}
      />
    </div>
  );
};

export default Dashboard;