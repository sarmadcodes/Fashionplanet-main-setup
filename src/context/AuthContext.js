import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setActiveStoreUser } from '../services/appStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('user_session'),
      AsyncStorage.getItem('auth_token'),
    ]).then(async ([sessionStr, savedToken]) => {
      const hasRealToken = Boolean(savedToken && savedToken !== 'mock_token');

      if (sessionStr && !hasRealToken) {
        await AsyncStorage.multiRemove(['user_session', 'auth_token', 'is_logged_in', 'auth_user_id']);
        setUser(null);
        setToken(null);
        setActiveStoreUser(null);
        setAuthLoading(false);
        return;
      }

      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        setUser(session);
        setActiveStoreUser(session);
      } else {
        setActiveStoreUser(null);
      }
      if (hasRealToken) setToken(savedToken);
      setAuthLoading(false);
    });
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken || 'mock_token');
    await AsyncStorage.setItem('auth_user_id', userData?.id || userData?._id || 'guest');
    await AsyncStorage.setItem('user_session', JSON.stringify(userData));
    await AsyncStorage.setItem('auth_token', authToken || 'mock_token');
    await AsyncStorage.setItem('is_logged_in', 'true');
    await setActiveStoreUser(userData);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['user_session', 'auth_token', 'is_logged_in', 'auth_user_id']);
    await setActiveStoreUser(null);
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
