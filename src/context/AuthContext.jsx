import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  getCurrentSession, 
  isAuthenticated, 
  setAuthHeader, 
  checkAndRefreshToken 
} from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on page load
    const checkAuth = async () => {
      if (isAuthenticated()) {
        // Check and refresh token if needed
        await checkAndRefreshToken();
        
        // Get current user data
        const userData = getCurrentUser();
        const sessionData = getCurrentSession();
        
        if (userData && sessionData) {
          // Restore auth header with the token
          setAuthHeader(sessionData.access_token);
          setUser(userData);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Set up periodic token refresh (every 10 minutes)
  useEffect(() => {
    if (!user) return;
    
    const refreshInterval = setInterval(async () => {
      await checkAndRefreshToken();
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user]);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
