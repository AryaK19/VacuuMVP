import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  DatePicker,
  message,
  Row,
  Col,
  Spin,
  Alert,
  Image,
  Divider
} from 'antd';
import {
  UploadOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  TagOutlined,
  NumberOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getMachineDetails, updateMachine } from '../../services/machine.service';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import './MachineEditModal.css';

const { TextArea } = Input;

const MachineEditModal = ({ visible, machineId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [machine, setMachine] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (visible && machineId) {
      fetchMachineData();
    }
  }, [visible, machineId]);

  useEffect(() => {
    if (machine) {
      populateForm();
    }
  }, [machine]);

  const fetchMachineData = async () => {
    setFetchLoading(true);
    try {
      const response = await getMachineDetails(machineId);
      if (response.success) {
        setMachine(response.machine);
      } else {
        message.error('Failed to fetch machine details');
      }
    } catch (error) {
      message.error('Failed to fetch machine details');
      console.error('Error fetching machine details:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const populateForm = () => {
    const formData = {
      serial_no: machine.serial_no,
      model_no: machine.model_no,
      part_no: machine.part_no,
      date_of_manufacturing: machine.date_of_manufacturing 
        ? dayjs(machine.date_of_manufacturing) 
        : null,
    };

    // Add customer info if machine is sold
    if (machine.is_sold && machine.sold_info) {
      formData.customer_name = machine.sold_info.customer_name;
      formData.customer_contact = machine.sold_info.customer_contact;
      formData.customer_email = machine.sold_info.customer_email;
      formData.customer_address = machine.sold_info.customer_address;
    }

    form.setFieldsValue(formData);

    // Set up file list for existing image
    if (machine.file_url) {
      setFileList([
        {
          uid: '-1',
          name: 'current-image.jpg',
          status: 'done',
          url: machine.file_url,
        },
      ]);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add machine details
      if (values.serial_no) formData.append('serial_no', values.serial_no);
      if (values.model_no) formData.append('model_no', values.model_no);
      if (values.part_no) formData.append('part_no', values.part_no);
      if (values.date_of_manufacturing) {
        formData.append('date_of_manufacturing', values.date_of_manufacturing.format('YYYY-MM-DD'));
      }

      // Add customer details only if they exist (for sold machines)
      if (machine.is_sold && machine.sold_info) {
        if (values.customer_name) formData.append('customer_name', values.customer_name);
        if (values.customer_contact) formData.append('customer_contact', values.customer_contact);
        if (values.customer_email) formData.append('customer_email', values.customer_email);
        if (values.customer_address) formData.append('customer_address', values.customer_address);
      }

      // Add file if new file is uploaded
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('file', fileList[0].originFileObj);
      }

      const response = await updateMachine(machineId, formData);

      if (response.success) {
        message.success('Machine updated successfully!');
        onSuccess && onSuccess(response.machine);
      } else {
        message.error(response.message || 'Failed to update machine');
      }
    } catch (error) {
      let errorMessage = 'Failed to update machine';
      
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

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setMachine(null);
    onCancel();
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadProps = {
    name: 'file',
    listType: 'picture',
    maxCount: 1,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }
      return false; // Prevent auto upload
    },
    fileList,
    onChange: handleFileChange,
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <ModalWrapper
      visible={visible}
      onCancel={handleCancel}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Edit Machine Details
        </div>
      }
      footer={null}
      width={800}
      className="machine-edit-modal"
      maskClosable={false}
    >
      {fetchLoading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : machine ? (
        <>
          <Alert
            message="Edit Machine Information"
            description="Update machine details and customer information. All fields are optional - only modified fields will be updated."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {/* Machine Details Section */}
            <div className="form-section">
              <div className="section-title">
                <BarcodeOutlined className="section-icon" />
                Machine Information
              </div>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Serial Number"
                    name="serial_no"
                    rules={[
                      { min: 3, message: 'Serial number must be at least 3 characters' }
                    ]}
                  >
                    <Input
                      prefix={<BarcodeOutlined />}
                      placeholder="Enter serial number"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    label="Model Number"
                    name="model_no"
                    rules={[
                      { min: 2, message: 'Model number must be at least 2 characters' }
                    ]}
                  >
                    <Input
                      prefix={<TagOutlined />}
                      placeholder="Enter model number"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    label="Part Number"
                    name="part_no"
                    rules={[
                      { min: 2, message: 'Part number must be at least 2 characters' }
                    ]}
                  >
                    <Input
                      prefix={<NumberOutlined />}
                      placeholder="Enter part number"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Manufacturing Date"
                    name="date_of_manufacturing"
                  >
                    <DatePicker
                      prefix={<CalendarOutlined />}
                      placeholder="Select manufacturing date"
                      size="large"
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item label="Machine Image">
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />} size="large">
                        {fileList.length > 0 ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Customer Details Section (only if machine is sold) */}
            {machine.is_sold && machine.sold_info && (
              <>
                <Divider />
                <div className="form-section">
                  <div className="section-title">
                    <UserOutlined className="section-icon" />
                    Customer Information
                  </div>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Customer Name"
                        name="customer_name"
                        rules={[
                          { min: 2, message: 'Customer name must be at least 2 characters' }
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="Enter customer name"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        label="Contact Number"
                        name="customer_contact"
                        rules={[
                          { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid contact number' }
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder="Enter contact number"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Email Address"
                        name="customer_email"
                        rules={[
                          { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="Enter email address"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        label="Address"
                        name="customer_address"
                        rules={[
                          { min: 10, message: 'Address must be at least 10 characters' }
                        ]}
                      >
                        <TextArea
                          placeholder="Enter customer address"
                          rows={3}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </>
            )}

            {/* Form Actions */}
            <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Update Machine
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      ) : (
        <div className="error-container">
          <Alert
            message="Failed to load machine details"
            type="error"
            showIcon
          />
        </div>
      )}
    </ModalWrapper>
  );
};

export default MachineEditModal;
