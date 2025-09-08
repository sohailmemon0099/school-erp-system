import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_USER':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Simply restore user data from localStorage - NO server validation
          const user = JSON.parse(userData);
          dispatch({ type: 'SET_USER', payload: user });
          console.log('User restored from localStorage - NO server validation');
        } catch (error) {
          console.log('Error parsing user data:', error);
          // Only logout if data is corrupted
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else if (token && !userData) {
        // We have a token but no user data - try to get user data once
        try {
          const response = await authService.getMe();
          dispatch({ type: 'SET_USER', payload: response.data.user });
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          console.log('Token validation failed, but NOT logging out automatically:', error);
          // DISABLED: Don't logout automatically
          // This prevents multi-tab logout issues
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // DISABLED: No cross-tab logout events
    // This prevents multi-tab logout issues
    // const handleLogoutEvent = (event) => {
    //   console.log('Received logout event from another tab:', event.detail);
    //   dispatch({ type: 'LOGOUT' });
    // };

    // DISABLED: No storage change listeners
    // This prevents multi-tab logout issues
    // const handleStorageChange = (event) => {
    //   if (event.key === 'token' && !event.newValue) {
    //     console.log('Token removed by another tab, logging out');
    //     dispatch({ type: 'LOGOUT' });
    //   }
    // };

    initAuth();
    
    // DISABLED: No event listeners
    // This prevents multi-tab logout issues
    // window.addEventListener('auth:logout', handleLogoutEvent);
    // window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      // DISABLED: No cleanup needed
      // window.removeEventListener('auth:logout', handleLogoutEvent);
      // window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login with:', credentials);
      const response = await authService.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      // Check if the response has the expected structure
      if (response.data && response.data.status === 'success') {
        console.log('AuthContext: Login successful, dispatching LOGIN_SUCCESS');
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data });
        console.log('AuthContext: Login success dispatched, user should be logged in');
        return { success: true };
      } else {
        console.error('AuthContext: Unexpected response structure:', response);
        return { 
          success: false, 
          error: response.data?.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      console.error('AuthContext: Error response:', error.response);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log('Manual logout requested by user');
    dispatch({ type: 'LOGOUT' });
  };

  const forceLogout = () => {
    console.log('Force logout requested - clearing all data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('notifications_last_fetch');
    dispatch({ type: 'LOGOUT' });
    
    // Notify other tabs
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'manual_logout' } 
    }));
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      dispatch({ type: 'SET_USER', payload: response.data.user });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    forceLogout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
