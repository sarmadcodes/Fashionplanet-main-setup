import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('user_session'),
      AsyncStorage.getItem('auth_token'),
    ]).then(([sessionStr, savedToken]) => {
      if (sessionStr) setUser(JSON.parse(sessionStr));
      if (savedToken) setToken(savedToken);
      setAuthLoading(false);
    });
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken || 'mock_token');
    await AsyncStorage.setItem('user_session', JSON.stringify(userData));
    await AsyncStorage.setItem('auth_token', authToken || 'mock_token');
    await AsyncStorage.setItem('is_logged_in', 'true');
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['user_session', 'auth_token', 'is_logged_in']);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    AsyncStorage.setItem('user_session', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
