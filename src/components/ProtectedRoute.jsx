import React from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';

// Role-based protected route component
const ProtectedRoute = ({ children, requiredRole, redirectPath = '/login' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If role check is required and user doesn't have the required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect admin to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // Redirect distributor to distributor dashboard
    if (user.role === 'distributor') {
      return <Navigate to="/distributor/dashboard" replace />;
    }
    // Default fallback - shouldn't normally reach here
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has the required role (or no role check)
  return children;
};

export default ProtectedRoute;
