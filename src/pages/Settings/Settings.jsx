import React from 'react';
import { Card, Typography, Divider, Tabs } from 'antd';
import './Settings.css';

const { Title } = Typography;

const Settings = () => {
  const items = [
    {
      key: 'account',
      label: 'Account Settings',
      children: (
        <div className="settings-section">
          <Title level={4}>Account Settings</Title>
          <p>Account settings content will be implemented here.</p>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: (
        <div className="settings-section">
          <Title level={4}>Notification Settings</Title>
          <p>Notification settings content will be implemented here.</p>
        </div>
      ),
    },
    {
      key: 'security',
      label: 'Security',
      children: (
        <div className="settings-section">
          <Title level={4}>Security Settings</Title>
          <p>Security settings content will be implemented here.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="settings-page">
      <Card>
        <Title level={2}>Settings</Title>
        <Divider />
        
        <Tabs
          defaultActiveKey="account"
          items={items}
          className="settings-tabs"
        />
      </Card>
    </div>
  );
};

export default Settings;
