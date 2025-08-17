import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd';
import './App.css'

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import DistributorLayout from './layouts/DistributorLayout';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Pumps from './pages/Pumps/Pumps';
import Parts from './pages/Parts/Parts';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Admins from './pages/Admins/Admins';
import Distributors from './pages/Distributors/Distributors';
import DistributorDashboard from './pages/Distributor/Dashboard';
import ServiceReports from './pages/Distributor/ServiceReports/ServiceReports';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const AppContent = () => {
  const { user, loading, getRedirectPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      // Handle redirects after authentication state is determined
      if (user) {
        // If user is authenticated and on login page, redirect based on role
        if (['/login', '/'].includes(location.pathname)) {
          navigate(getRedirectPath(user), { replace: true });
        }
      } else if (!['/login'].includes(location.pathname)) {
        // If not authenticated and not on login page, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate, getRedirectPath]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Admin routes */}
        <Route path="/" element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pumps" element={<Pumps />} />
          <Route path="parts" element={<Parts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admins" element={<Admins />} />
          <Route path="distributors" element={<Distributors />} />
        </Route>
        
        {/* Distributor routes */}
        <Route path="/distributor" element={
          <ProtectedRoute requiredRole="distributer">
            <DistributorLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DistributorDashboard />} />
          <Route path="service-reports" element={<ServiceReports />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
};

// Component to redirect users based on their role
const RootRedirect = () => {
  const { user, getRedirectPath } = useAuth();
  const redirectPath = getRedirectPath(user);
  return <Navigate to={redirectPath} replace />;
};

export default App
