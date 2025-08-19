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
import { getAdmins, deleteUser } from '../../services/user.service';
import UserRegistrationModal from '../../components/UserRegistrationModal/UserRegistrationModal';
import ModalWrapper from '../../components/ModalWrapper/ModalWrapper';
import './Admins.css';

const { Title } = Typography;

const AdminsContent = () => {
  const { modal } = App.useApp();
  const [admins, setAdmins] = useState([]);
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
    fetchAdmins();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const fetchAdmins = async (searchValue = search) => {
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
      
      const response = await getAdmins(params);
      
      setAdmins(response.items || []);
      setPagination({
        ...pagination,
        total: response.total || 0
      });
    } catch (error) {
      message.error('Failed to fetch admins. Please try again later.');
      console.error('Error fetching admins:', error);
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
    fetchAdmins(search);
  };

  const handleRefresh = () => {
    setPagination({...pagination, current: 1});
    setSearch('');
    setSortField('created_at');
    setSortOrder('desc');
    fetchAdmins('');
  };

  const handleAddAdmin = () => {
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    fetchAdmins(); // Refresh the list
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

  const showDeleteConfirm = (admin) => {
    modal.confirm({
      title: 'Are you sure you want to delete this admin?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>This action will permanently delete the admin account: <strong>{admin.name}</strong> ({admin.email})</p>
          <p>Their user account will be removed from authentication system.</p>
          <p>All associated records will also be deleted.</p>
          <p>This action cannot be undone.</p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk() {
        return handleDeleteAdmin(admin.id);
      },
    });
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await deleteUser(adminId);
      message.success('Admin deleted successfully');
      fetchAdmins(); // Refresh the list
    } catch (error) {
      message.error(error.message || 'Failed to delete admin');
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
    <div className="admins-page">
      <Card>
        
        <div className="admins-filter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="large">
              <Input
                placeholder="Search admins"
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
              onClick={handleAddAdmin}
            >
              Add Admin
            </Button>
          </div>
        </div>
        
        <div className="admins-table">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={admins}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} admins`
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
        role="admin"
        title="Register New Admin"
      />
    </div>
  );
};

// Wrap the component with App
const Admins = () => (
  <App>
    <AdminsContent />
  </App>
);

export default Admins;
