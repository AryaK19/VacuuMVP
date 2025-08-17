import React, { useState, useEffect } from 'react';
import { 
  Descriptions, 
  Spin, 
  Tabs, 
  Typography, 
  Image,
  Card,
  Row,
  Col,
  Empty,
  Badge,
  Space,
  Table,
  Tag,
  Input,
  message,
  Button
} from 'antd';
import { 
  CalendarOutlined, 
  FileTextOutlined, 
  ToolOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  IdcardOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  SearchOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { getMachineDetails, getMachineServiceReports } from '../../services/machine.service';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import CustomerRegistrationForm from '../CustomerRegistrationForm/CustomerRegistrationForm';
import './MachineDetailsModal.css';

const { Title, Text } = Typography;
const { Search } = Input;

/**
 * Modal to display machine details
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Controls visibility of the modal
 * @param {Function} props.onCancel - Function called when modal is cancelled
 * @param {(string|number)} props.machineId - ID of the machine to display
 */
const MachineDetailsModal = ({ 
  visible, 
  onCancel, 
  machineId,
  ...restProps 
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [machine, setMachine] = useState(null);
  const [serviceReports, setServiceReports] = useState([]);
  const [reportsPagination, setReportsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [showCustomerRegistration, setShowCustomerRegistration] = useState(false);

  useEffect(() => {
    if (visible && machineId) {
      fetchMachineDetails();
    }
  }, [visible, machineId]);

  useEffect(() => {
    if (visible && machineId && activeTab === "reports") {
      fetchServiceReports();
    }
  }, [visible, machineId, activeTab, reportsPagination.current, reportsPagination.pageSize]);

  const fetchMachineDetails = async () => {
    setLoading(true);
    try {
      const response = await getMachineDetails(machineId);
      if (response.success) {
        setMachine(response.machine);
        // Remove automatic modal opening
      } else {
        throw new Error("Failed to fetch machine details");
      }
    } catch (error) {
      message.error('Failed to fetch machine details');
      console.error('Error fetching machine details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceReports = async (searchValue = searchText) => {
    setReportsLoading(true);
    try {
      const params = {
        page: reportsPagination.current,
        limit: reportsPagination.pageSize,
        sort_by: 'created_at',
        sort_order: 'desc'
      };
      
      if (searchValue) {
        params.search = searchValue;
      }
      
      const response = await getMachineServiceReports(machineId, params);
      
      setServiceReports(response.items || []);
      setReportsPagination({
        ...reportsPagination,
        total: response.total || 0
      });
    } catch (error) {
      message.error('Failed to fetch service reports');
      console.error('Error fetching service reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setReportsPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: reportsPagination.total
    });
  };

  const handleSearch = () => {
    setReportsPagination({ ...reportsPagination, current: 1 });
    fetchServiceReports(searchText);
  };

  const handleRegisterCustomer = () => {
    setShowCustomerRegistration(true);
  };

  const handleCustomerRegistrationCancel = () => {
    setShowCustomerRegistration(false);
  };

  const handleCustomerRegistrationSuccess = (updatedMachine) => {
    setMachine(updatedMachine);
    setShowCustomerRegistration(false);
    message.success('Customer registered successfully!');
    // Reload machine details to get fresh data
    fetchMachineDetails();
  };

  const serviceReportColumns = [
    {
      title: 'Service Type',
      dataIndex: ['service_type', 'service_type'],
      key: 'service_type',
      width: 130,
      render: type => (
        <Tag color="blue" className="service-type-tag">
          {type || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Service Person',
      dataIndex: 'service_person_name',
      key: 'service_person_name',
      width: 150,
      render: name => (
        <div className="service-person">
          <UserOutlined className="person-icon" /> {name || 'N/A'}
        </div>
      )
    },
    {
      title: 'Problem',
      dataIndex: 'problem',
      key: 'problem',
      ellipsis: true,
      render: problem => (
        <div className="problem-text">
          {problem || 'No description provided'}
        </div>
      )
    },
    {
      title: 'Solution',
      dataIndex: 'solution',
      key: 'solution',
      ellipsis: true,
      render: solution => (
        <div className="solution-text">
          {solution || 'No solution provided'}
        </div>
      )
    },
    {
      title: 'Service Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      align: 'right',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (text) => (
        <div className="service-date">
          <CalendarOutlined className="date-icon" /> {new Date(text).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const StatCard = ({ icon, title, value, color }) => (
    <Card className="stat-card" bordered={false}>
      <div className="stat-content">
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
        <div className="stat-info">
          <div className="stat-title">{title}</div>
          <div className="stat-value" style={{ color }}>{value}</div>
        </div>
      </div>
    </Card>
  );

  const renderMachineDetails = () => (
    <>
      <Row gutter={[24, 24]} className="main-content">
        <Col xs={24} lg={8}>
          <div className="left-section">
            {/* Machine Image */}
            <Card 
              className="image-card" 
              bordered={false}
              bodyStyle={{ padding: '12px' }}
            >
              <div className="machine-image-container">
                {machine.file_url ? (
                  <Image
                    width="100%"
                    src={machine.file_url}
                    alt={machine.model_no}
                    className="machine-image"
                  />
                ) : (
                  <div className="machine-no-image">
                    <ToolOutlined className="no-image-icon" />
                    <Text type="secondary">No Image Available</Text>
                  </div>
                )}
              </div>
            </Card>

            {/* Machine Specifications */}
            <Card 
              title={
                <div className="card-title">
                  <ToolOutlined className="card-title-icon" /> Specifications
                </div>
              } 
              className="info-card spec-card" 
              bordered={false}
            >
              <div className="spec-grid">
                <div className="spec-item">
                  <div className="spec-label">Serial Number</div>
                  <div className="spec-value">{machine.serial_no}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Part Number</div>
                  <div className="spec-value">{machine.part_no}</div>
                </div>
                <div className="spec-item full-width">
                  <div className="spec-label">Manufacturing Date</div>
                  <div className="spec-value">
                    <CalendarOutlined className="date-icon" /> 
                    {new Date(machine.date_of_manufacturing).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Col>
        
        <Col xs={24} lg={16}>
          <div className="right-section">
            {/* Customer Information or Registration Button */}
            {machine.is_sold && machine.sold_info ? (
              <Card 
                title={
                  <div className="card-title">
                    <UserOutlined className="card-title-icon" /> Customer Information
                  </div>
                } 
                className="info-card customer-card" 
                bordered={false}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div className="customer-info-item">
                      <UserOutlined className="customer-icon" />
                      <div>
                        <div className="customer-label">Customer Name</div>
                        <div className="customer-value">{machine.sold_info.customer_name}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="customer-info-item">
                      <PhoneOutlined className="customer-icon" />
                      <div>
                        <div className="customer-label">Contact</div>
                        <div className="customer-value">{machine.sold_info.customer_contact}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24}>
                    <div className="customer-info-item">
                      <MailOutlined className="customer-icon" />
                      <div>
                        <div className="customer-label">Email</div>
                        <div className="customer-value">{machine.sold_info.customer_email}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24}>
                    <div className="customer-info-item customer-address-item">
                      <EnvironmentOutlined className="customer-icon" />
                      <div className="customer-detail-wrapper">
                        <div className="customer-label">Address</div>
                        <div className="customer-value">{machine.sold_info.customer_address}</div>
                      </div>
                    </div>
                  </Col>
                  {machine.sold_info.user && (
                    <Col span={24}>
                      <div className="customer-info-item">
                        <UserOutlined className="customer-icon" />
                        <div className="customer-detail-wrapper">
                          <div className="customer-label">Distributor</div>
                          <div className="customer-value">{machine.sold_info.user.name} ({machine.sold_info.user.email})</div>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            ) : (
              <Card 
                title={
                  <div className="card-title">
                    <UserOutlined className="card-title-icon" /> Customer Information
                  </div>
                } 
                className="info-card customer-card" 
                bordered={false}
              >
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                      No customer registered for this machine
                    </Text>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleRegisterCustomer}
                  >
                    Register Customer
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </>
  );

  const renderServiceReports = () => (
    <div className="service-reports-tab">
      <div className="reports-search-header">
        <div className="search-container">
          <Search
            placeholder="Search service reports"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onSearch={handleSearch}
            enterButton
            allowClear
          />
        </div>
        <Badge count={reportsPagination.total || 0} className="reports-count" showZero>
          <span className="reports-count-label">Total Reports</span>
        </Badge>
      </div>

      <Spin spinning={reportsLoading}>
        {serviceReports && serviceReports.length > 0 ? (
          <Table
            dataSource={serviceReports}
            columns={serviceReportColumns}
            rowKey="id"
            pagination={{
              current: reportsPagination.current,
              pageSize: reportsPagination.pageSize,
              total: reportsPagination.total,
              showSizeChanger: true,
              showTotal: total => `Total ${total} reports`
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            className="service-reports-table"
          />
        ) : (
          <Empty 
            description="No service reports found for this machine" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="empty-reports"
          />
        )}
      </Spin>
    </div>
  );

  return (
    <>
      <ModalWrapper
        visible={visible}
        onCancel={onCancel}
        title="Machine Details"
        footer={null}
        width={1200}
        className="machine-details-modal"
        {...restProps}
      >
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : machine ? (
          <div className="machine-details-content">
            {/* Top Stats Row */}
            <Row gutter={[12, 12]} className="stats-row">
              <Col xs={12} sm={6}>
                <StatCard
                  icon={<ToolOutlined />}
                  title="Status"
                  value={machine.is_sold ? "Sold" : "Available"}
                  color={machine.is_sold ? "#52c41a" : "#1890ff"}
                />
              </Col>
              <Col xs={12} sm={6}>
                <StatCard
                  icon={<IdcardOutlined />}
                  title="Model"
                  value={machine.model_no}
                  color="#722ed1"
                />
              </Col>
              <Col xs={12} sm={6}>
                <StatCard
                  icon={<DashboardOutlined />}
                  title="Type"
                  value={machine.machine_type?.type || 'N/A'}
                  color="#fa8c16"
                />
              </Col>
              <Col xs={12} sm={6}>
                <StatCard
                  icon={<HistoryOutlined />}
                  title="Service Reports"
                  value={reportsPagination.total || 0}
                  color="#eb2f96"
                />
              </Col>
            </Row>

            {/* Tab navigation */}
            <Tabs 
              activeKey={activeTab}
              onChange={handleTabChange}
              className="machine-details-tabs"
              items={[
                {
                  key: 'details',
                  label: (
                    <span>
                      <ToolOutlined /> Machine Details
                    </span>
                  ),
                  children: renderMachineDetails()
                },
                {
                  key: 'reports',
                  label: (
                    <span>
                      <HistoryOutlined /> Service Reports
                      <Badge 
                        count={reportsPagination.total || 0}
                        showZero
                        className="tab-badge"
                        size="small"
                      />
                    </span>
                  ),
                  children: renderServiceReports()
                }
              ]}
            />
          </div>
        ) : (
          <div className="error-container">
            <Empty 
              description={<Text type="danger">Failed to load machine details.</Text>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </ModalWrapper>

      <CustomerRegistrationForm
        visible={showCustomerRegistration}
        machine={machine}
        onCancel={handleCustomerRegistrationCancel}
        onSuccess={handleCustomerRegistrationSuccess}
      />
    </>
  );
};

export default MachineDetailsModal;