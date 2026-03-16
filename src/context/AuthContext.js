import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setActiveStoreUser } from '../services/appStore';

const AuthContext = createContext();
const AUTH_STORAGE_KEYS = ['user_session', 'auth_token', 'is_logged_in', 'auth_user_id'];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const clearAuthState = async ({ setUser, setToken, setAuthLoading } = {}) => {
  setUser?.(null);
  setToken?.(null);
  await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
  await setActiveStoreUser(null);
  if (setAuthLoading) setAuthLoading(false);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const [sessionStr, savedToken] = await Promise.all([
          AsyncStorage.getItem('user_session'),
          AsyncStorage.getItem('auth_token'),
        ]);

        // Session and token must exist together; partial auth state is invalid.
        if (!sessionStr || !isNonEmptyString(savedToken)) {
          await clearAuthState({ setUser, setToken, setAuthLoading });
          return;
        }

        let session = null;
        try {
          session = JSON.parse(sessionStr);
        } catch {
          await clearAuthState({ setUser, setToken, setAuthLoading });
          return;
        }

        if (!session || typeof session !== 'object') {
          await clearAuthState({ setUser, setToken, setAuthLoading });
          return;
        }

        setUser(session);
        setToken(savedToken);
        await setActiveStoreUser(session);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (userData, authToken) => {
    if (!userData || typeof userData !== 'object') {
      throw new Error('Login failed: missing user data.');
    }

    if (!isNonEmptyString(authToken)) {
      throw new Error('Login failed: missing authentication token.');
    }

    setUser(userData);
    setToken(authToken);
    await AsyncStorage.setItem('auth_user_id', userData?.id || userData?._id || 'guest');
    await AsyncStorage.setItem('user_session', JSON.stringify(userData));
    await AsyncStorage.setItem('auth_token', authToken);
    await AsyncStorage.setItem('is_logged_in', 'true');
    await setActiveStoreUser(userData);
  };

  const logout = async () => {
    await clearAuthState({ setUser, setToken });
  };

  const updateUser = (data) => {
    if (!user) return;
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
