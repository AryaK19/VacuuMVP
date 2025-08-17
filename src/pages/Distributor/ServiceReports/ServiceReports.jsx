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
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { getServiceReports } from '../../../services/service_report.service';
import ServiceReportForm from '../../../components/ServiceReportForm/ServiceReportForm';
import './ServiceReports.css';

const { Title } = Typography;

const ServiceReports = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceReports, setServiceReports] = useState([]);
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
  
  const columns = [
    {
      title: 'Machine',
      key: 'machine',
      render: (record) => {
        if (record.machine) {
          return `${record.machine.serial_no || ''} (${record.machine.model_no || ''})`;
        } else if (record.sold_machine) {
          return `${record.sold_machine.serial_no || ''} (${record.sold_machine.model_no || ''})`;
        } else {
          return 'N/A';
        }
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
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => console.log('View service report', record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => console.log('Edit service report', record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="default"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => console.log('Delete service report', record.id)}
            />
          </Tooltip>
        </Space>
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
    </div>
  );
};

export default ServiceReports;
//       render: (text) => new Date(text).toLocaleDateString()
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: (_, record) => (
//         <Space size="small">
//           <Tooltip title="View Details">
//             <Button 
//               type="primary"
//               size="small"
//               icon={<EyeOutlined />}
//               onClick={() => console.log('View service report', record.id)}
//             />
//           </Tooltip>
//           <Tooltip title="Edit">
//             <Button 
//               type="default"
//               size="small"
//               icon={<EditOutlined />}
//               onClick={() => console.log('Edit service report', record.id)}
//             />
//           </Tooltip>
//           <Tooltip title="Delete">
//             <Button 
//               type="default"
//               size="small"
//               danger
//               icon={<DeleteOutlined />}
//               onClick={() => console.log('Delete service report', record.id)}
//             />
//           </Tooltip>
//         </Space>
//       ),
//     },
//   ];
  
//   return (
//     <div className="service-reports-page">
//       <Card>

//         <div className="reports-filter">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Space size="large">
//             <Input
//               placeholder="Search service reports"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               onPressEnter={handleSearch}
//               prefix={<SearchOutlined />}
//               style={{ width: 250 }}
//             />
//             <Button 
//               type="primary" 
//               onClick={handleSearch}
//             >
//               Search
//             </Button>
//             <Button
//               icon={<SyncOutlined />}
//               onClick={handleReset}
//             >
//               Reset
//             </Button>
//           </Space>
//                     <Button 
//             type="primary" 
//             icon={<FileAddOutlined />} 
//             onClick={openAddReportModal}
//           >
//             Add Report
//           </Button>
//           </div>
//         </div>
        
//         <Spin spinning={loading}>
//           <Table
//             columns={columns}
//             dataSource={serviceReports}
//             rowKey="id"
//             pagination={{
//               current: pagination.current,
//               pageSize: pagination.pageSize,
//               total: pagination.total,
//               showSizeChanger: true,
//               showTotal: (total) => `Total ${total} service reports`
//             }}
//             onChange={handleTableChange}
//             className="service-reports-table"
//           />
//         </Spin>
//       </Card>
      
//       <Modal
//         title={<span><FileTextOutlined /> Add Service Report</span>}
//         open={modalVisible}
//         onCancel={() => setModalVisible(false)}
//         footer={null}
//         width={800}
//         maskClosable={false}
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleAddReport}
//           initialValues={{ parts: [{ part_name: '', quantity: 1 }] }}
//         >
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 label="Service Type"
//                 name="service_type_id"
//                 rules={[{ required: true, message: 'Please select the service type' }]}
//               >
//                 <Select placeholder="Select service type">
//                   {serviceTypes.map(type => (
//                     <Option key={type.id} value={type.id}>{type.service_type}</Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
            
//             <Col span={12}>
//               <Form.Item
//                 label="Machine Serial Number"
//                 name="machine_serial_no"
//                 rules={[{ required: true, message: 'Please enter the machine serial number' }]}
//               >
//                 <Input placeholder="Enter the machine serial number" />
//               </Form.Item>
//             </Col>
//           </Row>
          
//           <Form.Item
//             label="Service Person Name"
//             name="service_person_name"
//           >
//             <Input placeholder="Name of the person performing service" />
//           </Form.Item>
          
//           <Form.Item
//             label="Problem Description"
//             name="problem"
//           >
//             <TextArea rows={3} placeholder="Describe the problem" />
//           </Form.Item>
          
//           <Form.Item
//             label="Solution"
//             name="solution"
//           >
//             <TextArea rows={3} placeholder="Describe the solution" />
//           </Form.Item>
          
//           <Divider>Parts Used</Divider>
          
//           <Form.List name="parts">
//             {(fields, { add, remove }) => (
//               <>
//                 {fields.map(({ key, name, ...restField }) => (
//                   <Row key={key} gutter={16} style={{ marginBottom: 16 }}>
//                     <Col span={14}>
//                       <Form.Item
//                         {...restField}
//                         name={[name, 'part_name']}
//                         rules={[{ required: true, message: 'Part name is required' }]}
//                         style={{ marginBottom: 0 }}
//                       >
//                         <Input placeholder="Part Name/Number" />
//                       </Form.Item>
//                     </Col>
//                     <Col span={6}>
//                       <Form.Item
//                         {...restField}
//                         name={[name, 'quantity']}
//                         rules={[{ required: true, message: 'Quantity is required' }]}
//                         style={{ marginBottom: 0 }}
//                       >
//                         <Input type="number" min={1} placeholder="Quantity" />
//                       </Form.Item>
//                     </Col>
//                     <Col span={4}>
//                       <MinusCircleOutlined 
//                         onClick={() => remove(name)} 
//                         style={{ marginTop: 8 }}
//                       />
//                     </Col>
//                   </Row>
//                 ))}
//                 <Form.Item>
//                   <Button 
//                     type="dashed" 
//                     onClick={() => add()} 
//                     block 
//                     icon={<PlusOutlined />}
//                   >
//                     Add Part
//                   </Button>
//                 </Form.Item>
//               </>
//             )}
//           </Form.List>
          
//           <Form.Item
//             label="Attachments"
//             name="files"
//           >
//             <Upload
//               multiple
//               fileList={fileList}
//               onChange={handleFileChange}
//               beforeUpload={beforeUpload}
//             >
//               <Button icon={<UploadOutlined />}>Upload Files</Button>
//               <Text type="secondary" style={{ marginLeft: 8 }}>
//                 (Photos, PDF documents, etc.)
//               </Text>
//             </Upload>
//           </Form.Item>
          
//           <Form.Item>
//             <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//               <Space>
//                 <Button onClick={() => setModalVisible(false)} disabled={submitLoading}>
//                   Cancel
//                 </Button>
//                 <Button type="primary" htmlType="submit" loading={submitLoading}>
//                   Submit Report
//                 </Button>
//               </Space>
//             </div>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default ServiceReports;

