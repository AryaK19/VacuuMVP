import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Typography,
  Spin,
  Tooltip,
  message
} from 'antd';
import { 
  FileAddOutlined, 
  SearchOutlined, 
  SyncOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getServiceReports } from '../../services/service_report.service';
import ServiceReportForm from '../../components/ServiceReportForm/ServiceReportForm';
import './ServiceReports.css';
import { getServiceReportDetail } from '../../services/service_report.service';
import ServiceReportDetailsModal from '../../components/ServiceReportDetailsModal/ServiceReportDetailsModal';

const { Title } = Typography;

const ServiceReports = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleDetails, setModalVisibleDetails] = useState(false);
  const [serviceReports, setServiceReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  useEffect(() => {
    fetchServiceReports();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);
  
  const fetchServiceReports = async (searchValue = search) => {
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
      
      const response = await getServiceReports(params);
      setServiceReports(response.items || []);
      setPagination({
        ...pagination,
        total: response.total || 0
      });
    } catch (error) {
      message.error('Failed to fetch service reports');
      console.error('Error fetching service reports:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    setPagination({...pagination, current: 1});
    fetchServiceReports(search);
  };

  const handleActivityClick = async (reportId) => {
      try {
        setModalLoading(true);
        setModalVisibleDetails(true);
        const reportDetail = await getServiceReportDetail(reportId);
        setSelectedReport(reportDetail);
      } catch (error) {
        message.error('Failed to load service report details');
        setModalVisibleDetails(false);
      } finally {
        setModalLoading(false);
      }
    };
  
  const handleReset = () => {
    setSearch('');
    setPagination({...pagination, current: 1});
    setSortField('created_at');
    setSortOrder('desc');
    fetchServiceReports('');
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
  
  const openAddReportModal = () => {
    setModalVisible(true);
  };

  const handleFormSuccess = () => {
    setModalVisible(false);
    fetchServiceReports(); // Refresh the list
  };

  const handleModalClose = () => {
    setModalVisibleDetails(false);
    setSelectedReport(null);
  };
  
  const columns = [
    {
      title: 'Serial No.',
      key: 'serial_no',
      render: (record) => {
         return `${record.machine.serial_no || ''}`;
      },
    },
    {
      title: 'Model No.',
      key: 'model_no',
      render: (record) => {
         return `${record.machine.model_no || ''}`;
      },
    },
    {
      title: 'Service Type',
      key: 'service_type',
      dataIndex: ['service_type', 'service_type'],
      render: (text) => text || 'N/A'
    },
    {
      title: 'Service Person',
      dataIndex: 'service_person_name',
      key: 'service_person_name',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Service Date',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (text) => new Date(text).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button 
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleActivityClick(record.id)}
          />
        </Tooltip>
      ),
    },
  ];
  
  return (
    <div className="service-reports-page">
      <Card>
        <div className="reports-filter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="large">
              <Input
                placeholder="Search service reports"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
              />
              <Button 
                type="primary" 
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Space>
            
            <Button 
              type="primary" 
              icon={<FileAddOutlined />} 
              onClick={openAddReportModal}
            >
              Add Report
            </Button>
          </div>
        </div>
        
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={serviceReports}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} service reports`
            }}
            onChange={handleTableChange}
            className="service-reports-table"
          />
        </Spin>
      </Card>
      
      <ServiceReportForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <ServiceReportDetailsModal
        visible={modalVisibleDetails}
        onClose={handleModalClose}
        reportData={selectedReport}
        loading={modalLoading}
      />
    </div>
  );
};

export default ServiceReports;
             