import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOST = 'http://192.168.18.24:5000';
const BASE_URL = `${API_HOST}/api`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['auth_token', 'user_session', 'is_logged_in']);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
