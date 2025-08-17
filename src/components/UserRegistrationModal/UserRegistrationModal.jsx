import React, { useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { register } from '../../services/auth.service';
import './UserRegistrationModal.css';

const UserRegistrationModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  role, 
  title 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
        confirm_password: values.confirm_password,
        role: role
      };
      
      const response = await register(userData);
      
      if (response.success) {
        message.success(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`);
        form.resetFields();
        onSuccess();
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = 'Failed to register. Please try again.';
      
      if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="user-registration-modal"
    >
      {error && (
        <Alert
          message="Registration Error"
          description={error}
          type="error"
          showIcon
          closable
          className="registration-error-alert"
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        name="user-registration-form"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        className="user-registration-form"
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input the full name!' }]}
          label="Full Name"
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Full Name" 
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input the email!' },
            { type: 'email', message: 'Please enter a valid email address!' }
          ]}
          label="Email"
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="Email" 
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="phone_number"
          rules={[
            { required: true, message: 'Please input the phone number!' },
            { 
              pattern: /^[0-9]{10,15}$/, 
              message: 'Please enter a valid phone number (10-15 digits)!' 
            }
          ]}
          label="Phone Number"
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="Phone Number" 
            disabled={loading}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input the password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
              label="Password"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                disabled={loading}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="confirm_password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm the password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
              label="Confirm Password"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                disabled={loading}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              Register {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserRegistrationModal;
