import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Typography, Input, Avatar, Badge, Dropdown } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css'; // Reuse the same CSS for now

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { Search } = Input;

const DistributorLayout = () => {
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
    if (path.includes('/distributor/dashboard')) return 'Distributor Dashboard';
    if (path.includes('/distributor/service-reports')) return 'Service Reports';
    if (path.includes('/distributor/profile')) return 'My Profile';
    return 'Distributor Dashboard';
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/distributor/profile'),
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
                key: '/distributor/dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                onClick: () => navigate('/distributor/dashboard'),
              },
              {
                key: '/distributor/service-reports',
                icon: <FileTextOutlined />,
                label: 'Service Reports',
                onClick: () => navigate('/distributor/service-reports'),
              },
              {
                key: '/distributor/profile',
                icon: <UserOutlined />,
                label: 'Profile',
                onClick: () => navigate('/distributor/profile'),
              },
            ]}
          />
          
          <Menu
            theme="dark"
            mode="inline"
            className="bottom-menu"
            items={[
              {
                type: 'divider',
                style: { margin: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }
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
            
            <Badge count={3} className="notification-badge">
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
                  style={{ backgroundColor: '#52c41a' }} // Different color for distributor
                />
                <div className="user-info">
                  <Typography.Text className="user-name">
                    {user?.name || user?.email?.split('@')[0] || 'Distributor'}
                  </Typography.Text>
                  <Typography.Text className="user-role">
                    Distributor
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

export default DistributorLayout;
