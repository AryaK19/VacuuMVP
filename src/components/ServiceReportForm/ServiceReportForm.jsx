import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Button,
  Select,
  Card,
  Descriptions,
  Upload,
  Divider,
  Row,
  Col,
  Space,
  message,
  Alert,
  Typography,
  Spin
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';
import {
  getMachineBySerial,
  getServiceTypes,
  createServiceReport
} from '../../services/service_report.service';
import { getParts } from '../../services/machine.service';
import CustomerRegistrationForm from '../CustomerRegistrationForm/CustomerRegistrationForm';
import './ServiceReportForm.css';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ServiceReportForm = ({ visible, onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [machine, setMachine] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serialNo, setSerialNo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [availableParts, setAvailableParts] = useState([]);
  const [partsSearchLoading, setPartsSearchLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchServiceTypes();
    }
  }, [visible]);

  const fetchServiceTypes = async () => {
    try {
      const response = await getServiceTypes();
      setServiceTypes(response.service_types || []);
    } catch (error) {
      console.error('Error fetching service types:', error);
    }
  };

  const handleMachineSearch = async () => {
    if (!serialNo.trim()) {
      message.error('Please enter a serial number');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await getMachineBySerial(serialNo);
      if (response.success && response.machine) {
        setMachine(response.machine);
        
        // Check if customer information exists
        if (!response.machine.customer_name || !response.machine.is_sold) {
          // Show customer registration form
          setShowCustomerForm(true);
        } else {
          // Proceed to next step
          setCurrentStep(1);
          message.success('Machine found successfully!');
        }
      } else {
        message.error('Machine not found');
        setMachine(null);
      }
    } catch (error) {
      message.error('Machine not found or error occurred');
      setMachine(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCustomerRegistrationSuccess = (soldMachine) => {
    // Update machine with customer information
    const updatedMachine = {
      ...machine,
      customer_name: soldMachine.customer_name,
      customer_contact: soldMachine.customer_contact,
      customer_email: soldMachine.customer_email,
      customer_address: soldMachine.customer_address,
      is_sold: true
    };
    
    setMachine(updatedMachine);
    setShowCustomerForm(false);
    setCurrentStep(1);
    message.success('Customer registered successfully! You can now proceed with the service report.');
  };

  const handleCustomerRegistrationCancel = () => {
    setShowCustomerForm(false);
    setMachine(null);
    setSerialNo('');
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        if (!machine) {
          message.error('Please search and select a machine first');
          return;
        }
      } else if (currentStep === 1) {
        // Validate service details
        await form.validateFields(['service_type_id', 'service_person_name']);
      } else if (currentStep === 2) {
        // Validate problem and solution
        await form.validateFields(['problem', 'solution']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
      message.error('Please complete all required fields before proceeding');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Validate all fields before proceeding
      await form.validateFields();
      
      // Get validated form values
      const formValues = form.getFieldsValue(true);
      
      const formData = new FormData();
      
    

      formData.append('machine_id', machine.machine_id);
      // Add form values - ensure they're properly collected
      if (formValues.service_type_id) {
        formData.append('service_type_id', formValues.service_type_id);
      } else {
        throw new Error('Service type is required');
      }
      
      if (formValues.service_person_name) {
        formData.append('service_person_name', formValues.service_person_name);
      } else {
        throw new Error('Service person name is required');
      }
      
      if (formValues.problem) {
        formData.append('problem', formValues.problem);
      } else {
        throw new Error('Problem description is required');
      }
      
      if (formValues.solution) {
        formData.append('solution', formValues.solution);
      } else {
        throw new Error('Solution description is required');
      }
      
      // Add parts if any - REMOVE notes field
      if (formValues.parts && formValues.parts.length > 0) {
        const validParts = formValues.parts.filter(part => part && part.part_id);
        
        if (validParts.length > 0) {
          const partsData = validParts.map(part => ({
            machine_id: part.part_id,
            quantity: parseInt(part.quantity, 10) || 1
          }));
          formData.append('parts', JSON.stringify(partsData));
        }
      }
      
      // Add files if any
      fileList.forEach(file => {
        formData.append('files', file.originFileObj);
      });
      

      
      const response = await createServiceReport(formData);
      
      if (response.success) {
        message.success('Service report created successfully');
        handleModalClose();
        onSuccess();
      } else {
        message.error(response.message || 'Failed to create service report');
      }
    } catch (error) {
      let errorMessage = 'Failed to create service report';
      
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map(err => err.msg).join(', ');
        } else {
          errorMessage = error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setCurrentStep(0);
    setMachine(null);
    setSerialNo('');
    setFileList([]);
    form.resetFields();
    onCancel();
  };

  const handleFileChange = ({ fileList }) => setFileList(fileList);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isImage) {
      message.error('You can only upload image files or PDF documents!');
      return false;
    }
    return false; // Prevent automatic upload
  };

  const searchParts = async (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setAvailableParts([]);
      return;
    }

    setPartsSearchLoading(true);
    try {
      const response = await getParts({
        search: searchValue,
        limit: 20 // Limit results for dropdown
      });
      setAvailableParts(response.items || []);
    } catch (error) {
      console.error('Error searching parts:', error);
      setAvailableParts([]);
    } finally {
      setPartsSearchLoading(false);
    }
  };

  // Debounce search function
  const debounceSearch = React.useCallback(
    debounce((searchValue) => searchParts(searchValue), 300),
    []
  );

  const handlePartSearch = (searchValue) => {
    debounceSearch(searchValue);
  };

  // Add this function to render the selected part


  const steps = [
    {
      title: 'Find Machine',
      content: (
        <div className="step-content">
          <Alert
            message="Search for Machine"
            description="Enter the machine serial number to find the machine details and customer information."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Space.Compact style={{ width: '100%' }}>
            <Input
              size="large"
              placeholder="Enter machine serial number"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              onPressEnter={handleMachineSearch}
              prefix={<SearchOutlined />}
            />
            <Button
              type="primary"
              size="large"
              loading={searchLoading}
              onClick={handleMachineSearch}
            >
              Search
            </Button>
          </Space.Compact>
          
          {machine && machine.customer_name && (
            <Card style={{ marginTop: 24 }} title="Machine Information">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Serial Number">{machine.serial_no}</Descriptions.Item>
                <Descriptions.Item label="Model Number">{machine.model_no}</Descriptions.Item>
                <Descriptions.Item label="Part Number">{machine.part_no}</Descriptions.Item>
                <Descriptions.Item label="Manufacturing Date">{machine.date_of_manufacturing}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  {machine.is_sold ? 'Sold' : 'Available'}
                </Descriptions.Item>
                <Descriptions.Item label="Customer">{machine.customer_name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Contact">{machine.customer_contact || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{machine.customer_email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{machine.customer_address || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </div>
      ),
    },
    {
      title: 'Service Details',
      content: (
        <div className="step-content">
          {/* Machine summary card for all subsequent steps */}
          {machine && (
            <Card 
              size="small" 
              style={{ marginBottom: 24, background: '#f9f9f9' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  Selected Machine
                </div>
              }
            >
              <Row gutter={16} align="middle">
                <Col span={4}>
                  {machine.file_url ? (
                    <img 
                      src={machine.file_url} 
                      alt="Machine" 
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9'
                      }} 
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        background: '#f0f0f0', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #d9d9d9'
                      }}
                    >
                      <span style={{ color: '#999' }}>No Image</span>
                    </div>
                  )}
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Serial Number</Text>
                        <div style={{ fontWeight: 500 }}>{machine.serial_no}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Model</Text>
                        <div style={{ fontWeight: 500 }}>{machine.model_no}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Part Number</Text>
                        <div style={{ fontWeight: 500 }}>{machine.part_no}</div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Customer</Text>
                        <div style={{ fontWeight: 500 }}>{machine.customer_name || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Contact</Text>
                        <div style={{ fontWeight: 500 }}>{machine.customer_contact || 'N/A'}</div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          )}
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Service Type"
                name="service_type_id"
                rules={[{ required: true, message: 'Please select the service type' }]}
              >
                <Select placeholder="Select service type" size="large">
                  {serviceTypes.map(type => (
                    <Option key={type.id} value={type.id}>{type.service_type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Service Person Name"
                name="service_person_name"
                rules={[{ required: true, message: 'Please enter the service person name' }]}
              >
                <Input placeholder="Name of the person performing service" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: 'Problem & Solution',
      content: (
        <div className="step-content">
          {/* Machine summary card */}
          {machine && (
            <Card 
              size="small" 
              style={{ marginBottom: 24, background: '#f9f9f9' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  Selected Machine
                </div>
              }
            >
              <Row gutter={16} align="middle">
                <Col span={4}>
                  {machine.file_url ? (
                    <img 
                      src={machine.file_url} 
                      alt="Machine" 
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9'
                      }} 
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        background: '#f0f0f0', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #d9d9d9'
                      }}
                    >
                      <span style={{ color: '#999' }}>No Image</span>
                    </div>
                  )}
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Serial Number</Text>
                        <div style={{ fontWeight: 500 }}>{machine.serial_no}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Model</Text>
                        <div style={{ fontWeight: 500 }}>{machine.model_no}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Part Number</Text>
                        <div style={{ fontWeight: 500 }}>{machine.part_no}</div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Customer</Text>
                        <div style={{ fontWeight: 500 }}>{machine.customer_name || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Contact</Text>
                        <div style={{ fontWeight: 500 }}>{machine.customer_contact || 'N/A'}</div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          )}
          
          <Form.Item
            label="Problem Description"
            name="problem"
            rules={[{ required: true, message: 'Please describe the problem' }]}
          >
            <TextArea rows={4} placeholder="Describe the problem in detail" />
          </Form.Item>
          
          <Form.Item
            label="Solution"
            name="solution"
            rules={[{ required: true, message: 'Please describe the solution' }]}
          >
            <TextArea rows={4} placeholder="Describe the solution provided" />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Parts & Files',
      content: (
        <div className="step-content">
          {/* Machine summary card */}
          {machine && (
            <Card 
              size="small" 
              style={{ marginBottom: 24, background: '#f9f9f9' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  Selected Machine
                </div>
              }
            >
              <Row gutter={16} align="middle">
                <Col span={4}>
                  {machine.file_url ? (
                    <img 
                      src={machine.file_url} 
                      alt="Machine" 
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9'
                      }} 
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        background: '#f0f0f0', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #d9d9d9'
                      }}
                    >
                      <span style={{ color: '#999' }}>No Image</span>
                    </div>
                  )}
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Serial Number</Text>
                        <div style={{ fontWeight: 500 }}>{machine.serial_no}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Model</Text>
                        <div style={{ fontWeight: 500 }}>{machine.model_no}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Part Number</Text>
                        <div style={{ fontWeight: 500 }}>{machine.part_no}</div>
                      </div>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Customer</Text>
                        <div style={{ fontWeight: 500 }}>{machine.customer_name || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Contact</Text>
                        <div style={{ fontWeight: 500 }}>{machine.customer_contact || 'N/A'}</div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          )}
          
          <Divider>Parts Used</Divider>
          
          <Form.List name="parts">
            {(fields, { add, remove }) => (
              <div className="parts-container">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="part-form-item">
                    <Row gutter={16} align="middle">
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'part_id']}
                          rules={[{ required: true, message: 'Please select a part' }]}
                          style={{ marginBottom: 0 }}
                          label="Part"
                        >
                          <Select
                            showSearch
                            placeholder="Search and select part"
                            filterOption={false}
                            onSearch={handlePartSearch}
                            loading={partsSearchLoading}
                            notFoundContent={partsSearchLoading ? <Spin size="small" /> : 'No parts found'}
                            style={{ width: '100%' }}
                            optionLabelProp="label"
                            optionFilterProp="label"
                            className="part-select"
                          >
                            {availableParts.map(part => (
                              <Option 
                                key={part.id} 
                                value={part.id}
                                label={`${part.serial_no} - ${part.model_no}`}
                              >
                                <div className="part-option">
                                  <div className="part-option-title">{part.serial_no} - {part.model_no}</div>
                                  <div className="part-option-subtitle">Part No: {part.part_no}</div>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: 'Quantity is required' }]}
                          style={{ marginBottom: 0 }}
                          label="Qty"
                        >
                          <Input type="number" min={1} placeholder="Quantity" />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button 
                          type="text" 
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)} 
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add({ part_id: undefined, quantity: 1 })} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Add Part
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
          
          <Divider>Attachments</Divider>
          
          <Form.Item
            label="Upload Files"
            name="files"
          >
            <Upload
              multiple
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              listType="picture-card"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={<span><FileTextOutlined /> Create Service Report</span>}
        open={visible}
        onCancel={handleModalClose}
        footer={null}
        width={900}
        maskClosable={false}
        className="service-report-modal"
      >
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ 
            parts: [{ part_id: undefined, quantity: 1 }],
            service_type_id: undefined,
            service_person_name: '',
            problem: '',
            solution: ''
          }}
          validateMessages={{
            required: '${label} is required'
          }}
        >
          <div className="steps-content">
            {steps[currentStep].content}
          </div>

          <div className="steps-action" style={{ marginTop: 32 }}>
            {currentStep > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={handlePrev}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={handleNext}
                disabled={currentStep === 0 && !machine}
              >
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                Submit Report
              </Button>
            )}
          </div>
        </Form>
      </Modal>
      
      <CustomerRegistrationForm
        visible={showCustomerForm}
        machine={machine}
        onCancel={handleCustomerRegistrationCancel}
        onSuccess={handleCustomerRegistrationSuccess}
      />
    </>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default ServiceReportForm;
