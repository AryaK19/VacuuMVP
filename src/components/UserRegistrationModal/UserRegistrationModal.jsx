import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Alert, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import { register } from '../../services/auth.service';
import './UserRegistrationModal.css';

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
      const payload = { ...values, role };
      await register(payload);

      message.success(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`);
      onSuccess();
    } catch (err) {
      setError(err.detail || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      className="user-registration-modal"
      visible={visible}
      onCancel={onCancel}
      title={title || `Register New User`}
      footer={null}
      width={600}
      {...restProps}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="registration-error-alert"
          style={{ marginBottom: 16 }}
        />
      )}

      <div>
        <Form
          form={form}
          name="registration"
          layout="vertical"
          onFinish={handleSubmit}
          className="user-registration-form"
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
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

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
                hasFeedback
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="confirm_password"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0 24px 0' }} />

          <div style={{ textAlign: 'right' }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Register
            </Button>
          </div>
        </Form>
      </div>
    </ModalWrapper>
  );
};

export default UserRegistrationModal;