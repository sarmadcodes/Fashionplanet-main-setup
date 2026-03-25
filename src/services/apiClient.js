import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOSTS = [
  'https://fashion-planet-api-63de1c135e8e.herokuapp.com',
  'http://10.0.2.2:5000',
  'http://192.168.100.192:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5000',
];

let activeHostIndex = 0;
const getBaseUrl = () => `${API_HOSTS[activeHostIndex]}/api`;
let hostResolved = false;
let hostResolvingPromise = null;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

const getUserFacingApiError = (error) => {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
    return 'Cannot reach server. Please check your connection and try again.';
  }

  if (error.response.status === 401) {
    return 'Your session expired. Please log in again.';
  }

  if (error.response.status === 429) {
    return error?.response?.data?.message || "You've reached your daily outfit limit, come back tomorrow.";
  }

  if (error.response.status >= 500) {
    return error?.response?.data?.message || 'Server is temporarily unavailable. Please try again shortly.';
  }

  return null;
};

const probeHost = async (host) => {
  try {
    const probeClient = axios.create({
      timeout: 1500,
      validateStatus: () => true,
    });
    const res = await probeClient.get(`${host}/`);
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
};

const resolveWorkingHost = async () => {
  if (hostResolved) return;
  if (hostResolvingPromise) {
    await hostResolvingPromise;
    return;
  }

  hostResolvingPromise = (async () => {
    const cachedHost = await AsyncStorage.getItem('api_active_host');
    if (cachedHost && API_HOSTS.includes(cachedHost)) {
      const ok = await probeHost(cachedHost);
      if (ok) {
        activeHostIndex = API_HOSTS.indexOf(cachedHost);
        apiClient.defaults.baseURL = `${cachedHost}/api`;
        hostResolved = true;
        return;
      }
    }

    for (let i = 0; i < API_HOSTS.length; i += 1) {
      const host = API_HOSTS[i];
      const ok = await probeHost(host);
      if (ok) {
        activeHostIndex = i;
        apiClient.defaults.baseURL = `${host}/api`;
        await AsyncStorage.setItem('api_active_host', host);
        hostResolved = true;
        return;
      }
    }

    // Keep default order fallback if all probes fail.
    hostResolved = true;
  })();

  try {
    await hostResolvingPromise;
  } finally {
    hostResolvingPromise = null;
  }
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const getActiveApiBaseUrl = () => apiClient.defaults.baseURL || getBaseUrl();

apiClient.interceptors.request.use(async (config) => {
  await resolveWorkingHost();
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.baseURL = apiClient.defaults.baseURL;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestMethod = String(originalRequest.method || 'get').toLowerCase();
    const isRetryableMethod = RETRYABLE_METHODS.has(requestMethod);

    // If host is unreachable (no HTTP response), rotate to next known host and retry.
    if (!error.response && originalRequest && isRetryableMethod && !originalRequest._hostRetryExhausted) {
      const retries = originalRequest._hostRetries || 0;
      if (retries < API_HOSTS.length - 1) {
        activeHostIndex = (activeHostIndex + 1) % API_HOSTS.length;
        const nextBaseUrl = getBaseUrl();
        apiClient.defaults.baseURL = nextBaseUrl;
        await AsyncStorage.setItem('api_active_host', API_HOSTS[activeHostIndex]);

        originalRequest.baseURL = nextBaseUrl;
        originalRequest._hostRetries = retries + 1;

        return apiClient(originalRequest);
      }

      originalRequest._hostRetryExhausted = true;
    }

    const userMessage = getUserFacingApiError(error);
    if (userMessage) {
      error.userMessage = userMessage;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
