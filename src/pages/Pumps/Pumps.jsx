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
  message,
  App
} from 'antd';
import { 
  SearchOutlined, 
  SyncOutlined, 
  EyeOutlined,
  BarcodeOutlined,
  TagOutlined,
  NumberOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getPumps, deleteMachine } from '../../services/machine.service';
import MachineCreationModal from '../../components/MachineCreationModal/MachineCreationModal';
import MachineDetailsModal from '../../components/MachineDetailsModal/MachineDetailsModal';
import MachineEditModal from '../../components/MachineEditModal/MachineEditModal';
import ModalWrapper from '../../components/ModalWrapper/ModalWrapper';
import './Pumps.css';

const { Title } = Typography;

const PumpsContent = () => {
  const { modal } = App.useApp();
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEditMachineId, setSelectedEditMachineId] = useState(null);

  useEffect(() => {
    fetchParts();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const fetchParts = async (searchValue = search) => {
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

      const response = await getPumps(params);

      setPumps(response.items || []);
      setPagination({
        ...pagination,
        total: response.total || 0
      });
    } catch (error) {
      message.error('Failed to fetch pumps. Please try again later.');
      console.error('Error fetching pumps:', error);
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
    fetchParts(search);
  };

  const handleRefresh = () => {
    setPagination({...pagination, current: 1});
    setSearch('');
    setSortField('created_at');
    setSortOrder('desc');
    fetchParts('');
  };

  const handleAddPart = () => {
    setShowCreationModal(true);
  };

  const handleCreationSuccess = () => {
    setShowCreationModal(false);
    fetchParts(); // Refresh the list
  };

  const handleViewMachine = (machineId) => {
    setSelectedMachineId(machineId);
    setDetailsModalVisible(true);
  };

  const handleEditMachine = (machineId) => {
    setSelectedEditMachineId(machineId);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchParts(); // Refresh the list
    message.success('Part updated successfully');
  };

  const showDeleteConfirm = (part) => {
    modal.confirm({
      title: 'Are you sure you want to delete this part?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>This action will permanently delete the part with part number: <strong>{part.part_no}</strong></p>
          <p>All associated files will also be deleted.</p>
          <p>This action cannot be undone.</p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk() {
        return handleDeletePart(part.id);
      },
    });
  };

  const handleDeletePart = async (partId) => {
    try {
      await deleteMachine(partId);
      message.success('Part deleted successfully');
      fetchParts(); // Refresh the list
    } catch (error) {
      message.error(error.message || 'Failed to delete part');
    }
  };

  const columns = [
    {
      title: () => (
        <span>
          <NumberOutlined className="header-icon" /> Part No
        </span>
      ),
      dataIndex: 'part_no',
      key: 'part_no',
      sorter: true,
    },
    
    {
      title: () => (
        <span>
          <TagOutlined className="header-icon" /> Model No
        </span>
      ),
      dataIndex: 'model_no',
      key: 'model_no',
      sorter: true,
      width: 500,
      render: (text) => (
        <div style={{ 
          whiteSpace: 'normal', 
          wordWrap: 'break-word',
          lineHeight: '1.4'
        }}>
          {text}
        </div>
      ),
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
              onClick={() => handleViewMachine(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditMachine(record.id)}
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
    <div className="pumps-page">
      <Card>
        <div className="pumps-filter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="large">
              <Input
                placeholder="Search pumps"
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
              onClick={handleAddPart}
            >
              Add Part
            </Button>
          </div>
        </div>
        
        <div className="pumps-table">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={pumps}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} pumps`
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
              className="custom-table"
            />
          </Spin>
        </div>
      </Card>
      
      <MachineCreationModal
        visible={showCreationModal}
        onCancel={() => setShowCreationModal(false)}
        onSuccess={handleCreationSuccess}
        type="pump"
        title="Create New Pump"
      />

      <MachineDetailsModal
        visible={detailsModalVisible}
        machineId={selectedMachineId}
        onCancel={() => setDetailsModalVisible(false)}
        isPart={true}
      />

      <MachineEditModal
        visible={editModalVisible}
        machineId={selectedEditMachineId}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

// Wrap the component with App
const Pumps = () => (
  <App>
    <PumpsContent />
  </App>
);

export default Pumps;
