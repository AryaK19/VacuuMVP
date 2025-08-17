import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, checkAndRefreshToken } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Check if user is authenticated
      const authenticated = await checkAndRefreshToken();
      if (authenticated) {
        // Get current user from localStorage
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const getRedirectPath = (user) => {
    if (!user) return '/login';
    
    if (user.role === 'distributor') {
      return '/distributor/dashboard';
    } else if (user.role === 'admin') {
      return '/dashboard';
    }
    
    // Default to admin dashboard for unknown roles
    return '/dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;

