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
  UserOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { getPumps } from '../../services/machine.service';
import './Pumps.css';

const { Title } = Typography;

const Pumps = () => {
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

  useEffect(() => {
    fetchPumps();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const fetchPumps = async (searchValue = search) => {
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
    fetchPumps(search);
  };

  const handleRefresh = () => {
    setPagination({...pagination, current: 1});
    setSearch('');
    setSortField('created_at');
    setSortOrder('desc');
    fetchPumps('');
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
      sorter: true
    },
    {
      title: () => (
        <span>
          <TagOutlined className="header-icon" /> Model No
        </span>
      ),
      dataIndex: 'model_no',
      key: 'model_no',
      sorter: true
    },
    {
      title: () => (
        <span>
          <NumberOutlined className="header-icon" /> Part No
        </span>
      ),
      dataIndex: 'part_no',
      key: 'part_no',
      sorter: true
    },
    {
      title: () => (
        <span>
          <UserOutlined className="header-icon" /> Customer Name
        </span>
      ),
      key: 'customer',
      sorter: true,
      render: (record) => {
        return record.sold_info ? record.sold_info.customer_name : 'Not Sold';
      }
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
              onClick={() => console.log('View pump details:', record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => console.log('Edit pump:', record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="default" 
              danger
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => console.log('Delete pump:', record)}
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
    </div>
  );
};

export default Pumps;

