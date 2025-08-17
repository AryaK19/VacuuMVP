import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Typography, Input, Avatar, Badge, Dropdown } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  DashboardOutlined,
  ToolOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  DownOutlined,
  TeamOutlined,
  ShopOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { Search } = Input;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/pumps')) return 'Pumps Management';
    if (path.includes('/parts')) return 'Parts Inventory';
    if (path.includes('/profile')) return 'User Profile';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/admins')) return 'Admins Management';
    if (path.includes('/distributors')) return 'Distributors Management';
    return 'Dashboard';
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    // Handle window resize to collapse sidebar on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout className="dashboard-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="sidebar"
        width={200}
        theme="dark"
      >
        <div className="logo-container">
          {collapsed ? (
            <img 
              src="/vacuubrand-logo-white-removebg.png"
              alt="VacuuMVP Logo"
              className="logo"
              style={{ maxWidth: '50px' }}
            />
          ) : (
            <img 
              src="/vacuubrand-logo-white-removebg.png"
              alt="VacuuMVP Logo"
              className="logo"
            />
          )}
        </div>
        
        <div className="menu-container">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            className="main-menu"
            items={[
              {
                key: '/dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                onClick: () => navigate('/dashboard'),
              },
              {
                key: '/pumps',
                icon: <ToolOutlined />,
                label: 'Pumps',
                onClick: () => navigate('/pumps'),
              },
              {
                key: '/parts',
                icon: <AppstoreOutlined />,
                label: 'Parts',
                onClick: () => navigate('/parts'),
              },
              {
                key: '/service-reports',
                icon: <FileTextOutlined />,
                label: 'Service Reports',
                onClick: () => navigate('/service-reports'),
              },
              {
                key: '/profile',
                icon: <UserOutlined />,
                label: 'Profile',
                onClick: () => navigate('/profile'),
              },
            ]}
          />
          
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            className="bottom-menu"
            items={[
              {
                type: 'divider',
                style: { margin: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              },
              {
                key: 'configuration',
                icon: <SettingOutlined />,
                label: 'Configuration',
                children: [
                  {
                    key: '/admins',
                    icon: <TeamOutlined />,
                    label: 'Admins',
                    onClick: () => navigate('/admins'),
                  },
                  {
                    key: '/distributors',
                    icon: <ShopOutlined />,
                    label: 'Distributors',
                    onClick: () => navigate('/distributors'),
                  },
                ],
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: handleLogout,
              },
            ]}
          />
        </div>
      </Sider>
      <Layout className={`site-layout ${collapsed ? 'collapsed' : ''}`}>
        <Header className="site-header" style={{ background: colorBgContainer }}>
          <div className="header-left">
            <Button
              type="text"
              className="trigger-button"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <div className="page-title">{getPageTitle()}</div>
          </div>
          
          <div className="header-right">
            <Search
              placeholder="Search..."
              className="search-box"
              prefix={<SearchOutlined />}
              onSearch={value => console.log('Search:', value)}
            />
            
            <Button 
              type="text" 
              className="header-icon-button"
              icon={<QuestionCircleOutlined />}
              title="Help"
            />
            
            <Badge count={5} className="notification-badge">
              <Button 
                type="text" 
                className="header-icon-button"
                icon={<BellOutlined />}
                title="Notifications"
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="user-dropdown">
                <Avatar 
                  size={36} 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div className="user-info">
                  <Typography.Text className="user-name">
                    {user?.email?.split('@')[0] || 'User'}
                  </Typography.Text>
                  <Typography.Text className="user-role">
                    Administrator
                  </Typography.Text>
                </div>
                <DownOutlined className="dropdown-icon" />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="main-content"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

