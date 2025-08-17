import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Spin, 
  Tooltip,
  Tag,
  message,
  App
} from 'antd';
import { 
  SearchOutlined, 
  SyncOutlined, 
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getDistributors, deleteUser } from '../../services/user.service';
import UserRegistrationModal from '../../components/UserRegistrationModal/UserRegistrationModal';
import ModalWrapper from '../../components/ModalWrapper/ModalWrapper';
import './Distributors.css';

const { Title } = Typography;

const DistributorsContent = () => {
  const { modal } = App.useApp();
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    fetchDistributors();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const fetchDistributors = async (searchValue = search) => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sort_by: sortField,
        sort_order: sortOrder
      };
      
      if (searchValue) {
        params.search = searchValue;
      }
      
      const response = await getDistributors(params);
      
      setDistributors(response.items || []);
      setPagination({
        ...pagination,
        total: response.total || 0
      });
    } catch (error) {
      message.error('Failed to fetch distributors. Please try again later.');
      console.error('Error fetching distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag, filters, sorter) => {
    const newPagination = {
      ...pagination,
      current: pag.current,
      pageSize: pag.pageSize
    };
    
    let newSortField = sortField;
    let newSortOrder = sortOrder;
    
    if (sorter.field && sorter.order) {
      newSortField = sorter.field;
      newSortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }
    
    setPagination(newPagination);
    setSortField(newSortField);
    setSortOrder(newSortOrder);
  };

  const handleSearch = () => {
    setPagination({...pagination, current: 1});
    fetchDistributors(search);
  };

  const handleRefresh = () => {
    setPagination({...pagination, current: 1});
    setSearch('');
    setSortField('created_at');
    setSortOrder('desc');
    fetchDistributors('');
  };

  const handleAddDistributor = () => {
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    fetchDistributors(); // Refresh the list
  };

  const getStatusTag = (isActive) => {
    return (
      <Tag color={isActive ? 'success' : 'error'}>
        <div className="status-indicator">
          <div className={`status-dot ${isActive ? 'status-active' : 'status-inactive'}`} />
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </Tag>
    );
  };

  const showDeleteConfirm = (distributor) => {
    modal.confirm({
      title: 'Are you sure you want to delete this distributor?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>This action will permanently delete the distributor account: <strong>{distributor.name}</strong> ({distributor.email})</p>
          <p>Their user account will be removed from authentication system.</p>
          <p>All associated records will also be deleted.</p>
          <p>This action cannot be undone.</p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk() {
        return handleDeleteDistributor(distributor.id);
      },
    });
  };

  const handleDeleteDistributor = async (distributorId) => {
    try {
      await deleteUser(distributorId);
      message.success('Distributor deleted successfully');
      fetchDistributors(); // Refresh the list
    } catch (error) {
      message.error(error.message || 'Failed to delete distributor');
    }
  };

  const columns = [
    {
      title: () => (
        <span>
          <UserOutlined className="header-icon" /> Name
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: () => (
        <span>
          <MailOutlined className="header-icon" /> Email
        </span>
      ),
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: () => (
        <span>
          <PhoneOutlined className="header-icon" /> Phone
        </span>
      ),
      dataIndex: 'phone_number',
      key: 'phone_number',
      sorter: true,
    },
    {
      title: () => (
        <span>
          <CalendarOutlined className="header-icon" /> Created At
        </span>
      ),
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      sorter: true,
      render: (isActive) => getStatusTag(isActive),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle" className="action-column">
          <Tooltip title="View Details">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => console.log('View distributor details:', record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => console.log('Edit distributor:', record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="default" 
              danger
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="distributors-page">
      <Card>
        
        <div className="distributors-filter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="large">
              <Input
                placeholder="Search distributors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
              />
              <Button 
                type="primary" 
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={handleRefresh}
              >
                Reset
              </Button>
            </Space>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddDistributor}
            >
              Add Distributor
            </Button>
          </div>
        </div>
        
        <div className="distributors-table">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={distributors}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} distributors`
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
              className="custom-table"
            />
          </Spin>
        </div>
      </Card>
      
      <UserRegistrationModal
        visible={showRegistrationModal}
        onCancel={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
        role="distributer"
        title="Register New Distributor"
      />
    </div>
  );
};

// Wrap the component with App
const Distributors = () => (
  <App>
    <DistributorsContent />
  </App>
);

export default Distributors;
