import React from 'react';
import { Card, Typography, Divider, Avatar, Row, Col, Button } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <Row justify="center" style={{ marginTop: 32 }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 16px rgba(24, 144, 255, 0.06)',
              background: '#fff',
            }}
            bodyStyle={{ padding: 32 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
              <Avatar
                size={72}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff', fontSize: 36 }}
              />
              <div>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Distributor
                </Text>
              </div>
            </div>
            <Divider />
            <div className="profile-content">
              <div className="profile-info">
                <Title level={4} style={{ marginBottom: 16, color: '#1890ff' }}>
                  Personal Information
                </Title>
                <div className="info-item">
                  <MailOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                  <Text strong>Email:</Text>
                  <Text style={{ marginLeft: 8 }}>{user?.email || 'Not available'}</Text>
                </div>
                <div className="info-item">
                  <IdcardOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                  <Text strong>User ID:</Text>
                  <Text style={{ marginLeft: 8 }}>{user?.id || 'Not available'}</Text>
                </div>
              </div>
              {/* You can add more info fields here */}
            </div>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<EditOutlined />} disabled>
                Edit Profile
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;