import React from 'react';
import { Card, Typography, Divider } from 'antd';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <Card>
        <Title level={2}>User Profile</Title>
        <Divider />
        
        <div className="profile-content">
          <div className="profile-info">
            <Title level={4}>Personal Information</Title>
            <div className="info-item">
              <Text strong>Email:</Text>
              <Text>{user?.email || 'Not available'}</Text>
            </div>
            <div className="info-item">
              <Text strong>ID:</Text>
              <Text>{user?.id || 'Not available'}</Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
