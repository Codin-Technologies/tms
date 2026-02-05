import api from './api';
import axios from 'axios';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

const TOKEN_KEY = 'api_token';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.13.23';
    try {
        console.log('Attempting login with:', { email: credentials.email, password: '***' });

        // Use axios directly without the interceptor to avoid sending auth header on login

        const response = await axios.post<LoginResponse>(`${API_URL}/api/login`, credentials, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            timeout: 30000,
        });

        console.log('Login successful!', response.data);

        if (response.data.token) {
            // Store token in localStorage
            localStorage.setItem(TOKEN_KEY, response.data.token);
            console.log('Token stored successfully');
        }

        return response.data;
    } catch (error: any) {
        console.error('Login attempt failed:', {
            apiUrl: `${API_URL}/api/login`,
            error: error,
            message: error.message,
            stack: error.stack,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : 'No response'
        });
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await api.post('/api/logout');
    } finally {
        // Always remove token, even if logout request fails
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};
