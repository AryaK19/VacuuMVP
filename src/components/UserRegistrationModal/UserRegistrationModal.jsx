import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import ModalWrapper from '../ModalWrapper/ModalWrapper';

/**
 * A modal for registering new users
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Controls visibility of the modal
 * @param {Function} props.onCancel - Function called when modal is cancelled
 * @param {Function} props.onSuccess - Function called when registration is successful
 * @param {string} props.role - User role (admin, distributer, etc.)
 * @param {string} [props.title] - Modal title
 */
const UserRegistrationModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  role, 
  title,
  ...restProps 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reset form and errors when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      setError('');
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // Your registration logic here
      
      message.success(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      visible={visible}
      onCancel={onCancel}
      title={title || `Register New User`}
      footer={null}
      width={800}
      {...restProps}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        name="registration"
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone_number"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
          </Col>
        </Row>
        
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
        </div>
      </Form>
    </ModalWrapper>
  );
};

export default UserRegistrationModal;
        