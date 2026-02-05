import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const isServer = typeof window === 'undefined';
const SERVER_API = process.env.API_BASE_URL || 'http://194.146.13.23';
const CLIENT_API = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
const API_URL = isServer ? SERVER_API : CLIENT_API;

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage (client-side only)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('api_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // Fallback to env variable for server-side or testing
        const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
        if (envToken && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${envToken}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Error Handling
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                console.error("Unauthorized: Redirecting to login...");
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('api_token');
                    window.location.href = '/login';
                }
            }
            // Handle 403 Forbidden
            if (error.response.status === 403) {
                console.error("Forbidden: Access denied.");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
