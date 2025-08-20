import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Row,
  Col,
  message,
  AutoComplete,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { createCustomerRecord } from '../../services/service_report.service';
import { getCustomerNames } from '../../services/machine.service';
import './CustomerRegistrationForm.css';

const { TextArea } = Input;

const CustomerRegistrationForm = ({ visible, machine, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [searching, setSearching] = useState(false);

  // Fetch customer names as user types
  const handleCustomerSearch = async (value) => {
    if (!value || value.length < 2) {
      setCustomerOptions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await getCustomerNames(value);
      setCustomerOptions(
        (res.customers || []).map((c) => ({
          value: c.customer_name,
          label: (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 36, justifyContent: 'center' }}>
              <span style={{ fontWeight: 500 }}>{c.customer_name}</span>
              <span style={{ fontSize: 12, color: '#888' }}>
                {c.customer_company ? `${c.customer_company} | ` : ''}
                {c.customer_contact || ''} {c.customer_email ? `| ${c.customer_email}` : ''}
              </span>
            </div>
          ),
          data: c,
        }))
      );
    } catch {
      setCustomerOptions([]);
    } finally {
      setSearching(false);
    }
  };

  // When user selects a customer, auto-fill other fields (but keep editable)
  const handleCustomerSelect = (value, option) => {
    if (option && option.data) {
      const { customer_contact, customer_email, customer_address, customer_company } = option.data;
      form.setFieldsValue({
        customer_contact: customer_contact || '',
        customer_email: customer_email || '',
        customer_address: customer_address || '',
        customer_company: customer_company || '',
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const customerData = {
        machine_id: machine.id || machine.machine_id,
        customer_name: values.customer_name,
        customer_contact: values.customer_contact,
        customer_email: values.customer_email,
        customer_address: values.customer_address,
        customer_company: values.customer_company,
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
      zIndex={1050}
      destroyOnClose={true}
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
          label="Contact Person"
          name="customer_name"
          rules={[
            { required: true, message: 'Please enter customer name' },
            { min: 2, message: 'Customer name must be at least 2 characters' }
          ]}
        >
          <AutoComplete
            options={customerOptions}
            onSearch={handleCustomerSearch}
            onSelect={handleCustomerSelect}
            placeholder="Enter customer full name"
            size="large"
            allowClear
            filterOption={false}
            notFoundContent={searching ? 'Searching...' : null}
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 320, maxWidth: 400 }}
            popupClassName="customer-autocomplete-dropdown"
          >
            <Input prefix={<UserOutlined />} />
          </AutoComplete>
        </Form.Item>

        <Form.Item
          label="Company"
          name="customer_company"
          rules={[
            { required: true, message: 'Please enter company name' },
            { min: 2, message: 'Company name must be at least 2 characters' }
          ]}
        >
          <Input
            prefix={<ApartmentOutlined />}
            placeholder="Company name"
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