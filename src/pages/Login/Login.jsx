import React, { useState } from 'react';
import { Button, Form, Input, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const userData = {
        email: values.email,
        password: values.password
      };
      
      const response = await login(userData);
      
      if (response.success) {
        setUser(response.user);
        message.success('Login successful!');
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Failed to login. Please try again.';
      
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
          <Title level={2} className="feature-title">Powered by Blue2Green</Title>
          
          <Paragraph className="feature-description">
            Our platform helps you streamline your pump tracking process, manage inventory efficiently, 
            and make data-driven decisions.
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
      
      {/* Right side - Login form */}
      <div className="form-panel">
        <div className="form-container">
          <div className="logo-container">
            <img src="/vacuubrand-logo-removebg.png" alt="VacuuBrand Logo" className="brand-logo" />
          </div>
          
          <Title level={2} className="form-title">Sign in to your account</Title>
          <Paragraph className="form-subtitle">
            Enter your credentials to access your dashboard
          </Paragraph>
          
          {error && (
            <Alert
              message="Login Error"
              description={error}
              type="error"
              showIcon
              closable
              className="login-error-alert"
              onClose={() => setError(null)}
            />
          )}
          
          <Form
            name="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="auth-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address!' }
              ]}
              label={<span className="form-label">Email</span>}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Email" 
                disabled={loading}
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              label={<span className="form-label">Password</span>}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Password"
                disabled={loading}
                className="auth-input"
              />
            </Form.Item>

            <div className="form-options">
              <Link className="forgot-password" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="auth-button" 
                block
                loading={loading}
              >
                Sign in
              </Button>
            </Form.Item>

            <div className="auth-footer">
              <Text className="auth-footer-text">
                Don't have an account? <Link to="/login" className="auth-link">Contact VacuuBrand</Link>
              </Text>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
