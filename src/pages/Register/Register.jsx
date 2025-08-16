import React, { useState } from 'react';
import { Button, Form, Input, Typography, message, Row, Col, Alert, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/auth.service';
import './Register.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const userData = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
        confirm_password: values.confirm_password,
        role: values.role
      };
      
      const response = await register(userData);
      
      if (response.success) {
        message.success(response.message || 'Registration successful! Please log in.');
        navigate('/login');
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Display the detailed error from the backend
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

  return (
    <div className="auth-container">
      {/* Left side - Feature panel */}
      <div className="feature-panel">
        {/* Animated shapes */}
        <div className="animated-shape shape-1"></div>
        <div className="animated-shape shape-2"></div>
        
        <div className="feature-content">
          <Title level={2} className="feature-title">Join VacuuMVP Today</Title>
          
          <Paragraph className="feature-description">
            Create an account to access our comprehensive pump tracking platform and start managing your inventory efficiently.
          </Paragraph>
          
          <div className="feature-items">
            <div className="feature-item">
              <CheckCircleOutlined className="feature-icon" />
              <div>
                <Text strong className="feature-item-title">Smart Inventory Tracking</Text>
                <Paragraph className="feature-item-desc">Track all your pumps and parts in one centralized platform</Paragraph>
              </div>
            </div>
            
            <div className="feature-item">
              <CheckCircleOutlined className="feature-icon" />
              <div>
                <Text strong className="feature-item-title">Streamlined Management</Text>
                <Paragraph className="feature-item-desc">Manage all stages of pump lifecycle and maintenance</Paragraph>
              </div>
            </div>
            
            <div className="feature-item">
              <CheckCircleOutlined className="feature-icon" />
              <div>
                <Text strong className="feature-item-title">Data-Driven Insights</Text>
                <Paragraph className="feature-item-desc">Make better decisions with comprehensive analytics</Paragraph>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Register form */}
      <div className="form-panel">
        <div className="form-container">
          <div className="logo-container">
            <img src="/public/vacuubrand-logo-removebg.png" alt="VacuuBrand Logo" className="brand-logo" />
          </div>
          
          <Title level={2} className="form-title">Create your account</Title>
          <Paragraph className="form-subtitle">
            Fill in the details to register for VacuuMVP
          </Paragraph>
          
          {error && (
            <Alert
              message="Registration Error"
              description={error}
              type="error"
              showIcon
              closable
              className="register-error-alert"
              onClose={() => setError(null)}
            />
          )}
          
          <Form
            name="register-form"
            initialValues={{ remember: true, role: 'distributer' }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="auth-form register-form"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
              label={<span className="form-label">Full Name</span>}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Full Name" 
                disabled={loading}
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address!' }
              ]}
              label={<span className="form-label">Email</span>}
            >
              <Input 
                prefix={<MailOutlined className="site-form-item-icon" />} 
                placeholder="Email" 
                disabled={loading}
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="phone_number"
              rules={[
                { required: true, message: 'Please input your phone number!' },
                { 
                  pattern: /^[0-9]{10,15}$/, 
                  message: 'Please enter a valid phone number (10-15 digits)!' 
                }
              ]}
              label={<span className="form-label">Phone Number</span>}
            >
              <Input 
                prefix={<PhoneOutlined className="site-form-item-icon" />} 
                placeholder="Phone Number" 
                disabled={loading}
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: 'Please select a role!' }]}
              label={<span className="form-label">Role</span>}
            >
              <Select 
                disabled={loading} 
                placeholder="Select your role"
                className="auth-select"
              >
                <Option value="admin">Admin</Option>
                <Option value="distributer">Distributer</Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                  label={<span className="form-label">Password</span>}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Password"
                    disabled={loading}
                    className="auth-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirm_password"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                  label={<span className="form-label">Confirm Password</span>}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Confirm Password"
                    disabled={loading}
                    className="auth-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="auth-button" 
                block
                loading={loading}
              >
                Register
              </Button>
            </Form.Item>

            <div className="auth-footer">
              <Text className="auth-footer-text">
                Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
              </Text>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;

