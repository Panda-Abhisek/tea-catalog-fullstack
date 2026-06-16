import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to safely decode JWT payload without external libraries
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on initial load
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          id: decoded.user_id || decoded.id,
          username: decoded.username || decoded.name,
          email: decoded.email,
        });
      } else {
        // Token is invalid or expired
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/login/', { username, password });
    const { access, refresh, user: backendUser } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    if (backendUser) {
      setUser(backendUser);
    } else {
      const decoded = decodeToken(access);
      setUser({
        id: decoded.user_id || decoded.id,
        username: decoded.username || decoded.name,
      });
    }
    
    return response.data;
  };

  const register = async (username, password1, password2) => {
    // Note: Assumes backend has a POST /api/register/ endpoint
    const response = await api.post('/register/', { 
      username, 
      password1, 
      password2 
    });
    
    // If the backend returns tokens upon registration, log them in automatically
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      const decoded = decodeToken(response.data.access);
      setUser({
        id: decoded.user_id || decoded.id,
        username: decoded.username || decoded.name,
      });
    }
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};