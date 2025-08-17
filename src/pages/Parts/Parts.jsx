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
  message 
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
  PlusOutlined
} from '@ant-design/icons';
import { getParts } from '../../services/machine.service';
import MachineCreationModal from '../../components/MachineCreationModal/MachineCreationModal';
import './Parts.css';

const { Title } = Typography;

const Parts = () => {
  const [parts, setParts] = useState([]);
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
      
      const response = await getParts(params);
      
      setParts(response.items || []);
      setPagination({
        ...pagination,
        total: response.total || 0
      });
    } catch (error) {
      message.error('Failed to fetch parts. Please try again later.');
      console.error('Error fetching parts:', error);
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

  const columns = [
    {
      title: () => (
        <span>
          <BarcodeOutlined className="header-icon" /> Serial No
        </span>
      ),
      dataIndex: 'serial_no',
      key: 'serial_no',
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle" className="action-column">
          <Tooltip title="View Details">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => console.log('View part details:', record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => console.log('Edit part:', record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="default" 
              danger
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => console.log('Delete part:', record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="parts-page">
      <Card>
        <div className="parts-filter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="large">
              <Input
                placeholder="Search parts"
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
        
        <div className="parts-table">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={parts}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} parts`
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
        type="part"
        title="Create New Part"
      />
    </div>
  );
};

export default Parts;
