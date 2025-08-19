import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  List,
  Avatar,
  Spin,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  BellOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  BuildOutlined,
  SettingOutlined,
  EyeOutlined,
  AuditOutlined,
  ToolFilled,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import {
  getDashboardStatistics,
  getRecentActivities,
} from "../../services/dashboard.service";
import { getServiceReportDetail } from "../../services/service_report.service";
import ServiceReportDetailsModal from "../../components/ServiceReportDetailsModal/ServiceReportDetailsModal";
import "./Dashboard.css";

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
    limit: 5,
    total: 0,
  });

  // Function to get icon based on service type
  const getServiceTypeIcon = (serviceType) => {
    const iconStyle = { fontSize: "16px" };

    switch (serviceType.toLowerCase()) {
      case "warranty":
        return (
          <Avatar
            icon={<SafetyCertificateOutlined />}
            style={{ backgroundColor: "#52c41a", ...iconStyle }}
          />
        );
      case "paid":
        return (
          <Avatar
            icon={<DollarOutlined />}
            style={{ backgroundColor: "#1677ff", ...iconStyle }}
          />
        );
      case "amc":
        return (
          <Avatar
            icon={<ToolOutlined />}
            style={{ backgroundColor: "#fa8c16", ...iconStyle }}
          />
        );
      case "health check":
        return (
          <Avatar
            icon={<BuildOutlined />}
            style={{ backgroundColor: "#f5222d", ...iconStyle }}
          />
        );
      case "installation":
        return (
          <Avatar
            icon={<SettingOutlined />}
            style={{ backgroundColor: "#722ed1", ...iconStyle }}
          />
        );
      default:
        return (
          <Avatar
            icon={<BellOutlined />}
            style={{ backgroundColor: "#8c8c8c", ...iconStyle }}
          />
        );
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
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
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
      message.error("Failed to load service report details");
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
        sort_by: "created_at",
        sort_order: "desc",
      });

      const formattedActivities = response.items.map((activity) => ({
        id: activity.report_id,
        title: `${activity.user_name} created a ${activity.service_type_name} service report`,
        when: getRelativeTime(activity.created_at),
        avatar: getServiceTypeIcon(activity.service_type_name),
        serviceType: activity.service_type_name,
        userName: activity.user_name,
        createdAt: activity.created_at,
      }));

      setRecentActivities(formattedActivities);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      message.error("Failed to load recent activities");
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
        <Title level={2}>Welcome back, {user?.name || "User"}</Title>
        <p>Here's what's happening today</p>
      </div>

      {/* Statistic Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} md={8} lg={6} xl={6}>
          <Card
            size="small"
            style={{ overflow: "hidden" }}
            bodyStyle={{
              height: "70px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div className="statistic-container">
              <div className="statistic-title">Active AMC Contracts</div>
              <div className="statistic-content">
                <AuditOutlined
                  style={{ color: "#52c41a", marginRight: "8px" }}
                />
                <span style={{ color: "#52c41a", fontSize: "18px" }}>5</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8} lg={6} xl={6}>
          <Card
            size="small"
            style={{ overflow: "hidden" }}
            bodyStyle={{
              height: "70px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div className="statistic-container">
              <div className="statistic-title">Service Reports</div>
              <div className="statistic-content">
                <ToolFilled style={{ color: "#722ed1", marginRight: "8px" }} />
                <span style={{ color: "#722ed1", fontSize: "18px" }}>8</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={24} lg={16} xl={14}>
          <Card
            title="My Recent Activities"
            className="recent-activities-card"
            extra={
              <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {pagination.total} total activities
              </span>
            }
            style={{ minHeight: 320 }}
          >
            <Spin spinning={loading}>
              {recentActivities.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item
                      style={{ cursor: "pointer" }}
                      onClick={() => handleActivityClick(item.id)}
                      actions={[<EyeOutlined key="view" />]}
                    >
                      <List.Item.Meta
                        avatar={item.avatar}
                        title={
                          <div style={{ fontSize: "14px" }}>{item.title}</div>
                        }
                        description={
                          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {item.when}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#8c8c8c",
                  }}
                >
                  You have no recent activities
                </div>
              )}
            </Spin>
          </Card>
        </Col>
        {/* You can add more dashboard widgets/charts here in the right column */}
        <Col xs={24} md={24} lg={8} xl={10}>
          {/* Example placeholder for future widgets */}
          <div style={{ height: "100%", minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#bfbfbf" }}>More dashboard widgets coming soon...</span>
          </div>
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