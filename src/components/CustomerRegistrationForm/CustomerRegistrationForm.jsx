import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Row,
  Col,
  message
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { createCustomerRecord } from '../../services/service_report.service';
import './CustomerRegistrationForm.css';

const { TextArea } = Input;

const CustomerRegistrationForm = ({ visible, machine, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const customerData = {
        machine_id: machine.machine_id, // Assuming machine has an id field
        customer_name: values.customer_name,
        customer_contact: values.customer_contact,
        customer_email: values.customer_email,
        customer_address: values.customer_address
      };

      const response = await createCustomerRecord(customerData);

      if (response.success) {
        message.success('Customer registered successfully!');
        form.resetFields();
        onSuccess(response.sold_machine);
      } else {
        message.error(response.message || 'Failed to register customer');
      }
    } catch (error) {
      let errorMessage = 'Failed to register customer';
      
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
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Register Customer for Machine
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      maskClosable={false}
      className="customer-registration-modal"
    >
      <Alert
        message="Customer Registration Required"
        description="This machine is not assigned to any customer. Please register customer details to proceed with service report creation."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {machine && (
        <div className="machine-info-summary" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Serial Number</span>
                <div style={{ fontWeight: 500 }}>{machine.serial_no}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Model</span>
                <div style={{ fontWeight: 500 }}>{machine.model_no}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Part Number</span>
                <div style={{ fontWeight: 500 }}>{machine.part_no}</div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          label="Customer Name"
          name="customer_name"
          rules={[
            { required: true, message: 'Please enter customer name' },
            { min: 2, message: 'Customer name must be at least 2 characters' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter customer full name"
            size="large"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Contact Number"
              name="customer_contact"
              rules={[
                { required: true, message: 'Please enter contact number' },
                { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid contact number' }
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Contact number"
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Email Address"
              name="customer_email"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email address"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Address"
          name="customer_address"
          rules={[
            { required: true, message: 'Please enter customer address' },
            { min: 10, message: 'Address must be at least 10 characters' }
          ]}
        >
          <TextArea
            prefix={<HomeOutlined />}
            placeholder="Enter complete address"
            rows={3}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CheckCircleOutlined />}
            >
              Register Customer
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerRegistrationForm;
