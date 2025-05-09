'use client';
import { showToastError } from 'app/Ultils/toast';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { isTokenExpired } from 'app/Ultils/check_TokenExpired/isTokenExpired';
import axios from 'axios';

interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
}

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface LoginResponse {
    accessToken: string;
}

interface UserProfile {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: {
        role_id: number;
        name: string;
    };
}

interface ApiContextType {
    accessToken: string | null;
    login: (data: LoginData) => Promise<LoginResponse>;
    register: (data: RegisterData) => Promise<void>;
    getUserProfile: () => Promise<UserProfile>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const apiUrl = 'https://e806-2402-800-6392-7ec8-7568-a720-bf51-7428.ngrok-free.app';

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !isTokenExpired(token)) {
            setAccessToken(token);
        }
        setIsReady(true);
    }, []);

    const login = async (data: LoginData): Promise<LoginResponse> => {
        try {
            const response = await axios.post(`${apiUrl}/auth/login`, data);
            const token = response.data.accessToken;
            localStorage.setItem('accessToken', token);
            setAccessToken(token);
            return response.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Đăng nhập thất bại';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const register = async (data: RegisterData): Promise<void> => {
        try {
            await axios.post(`${apiUrl}/auth/register`, data);
            toast.success('Đăng ký thành công');
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Đã có lỗi xảy ra, vui lòng thử lại';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const getUserProfile = async (): Promise<UserProfile> => {
        try {
            const response = await axios.get(`${apiUrl}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            console.log('Response headers:', response.headers);
            console.log('Response data:', response.data);
            return response.data;
        } catch (err: unknown) {
            console.error('Error fetching user profile:', err);
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Không thể lấy thông tin người dùng';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        accessToken,
        login,
        register,
        getUserProfile,
    };

    return <ApiContext.Provider value={value}>{isReady ? children : null}</ApiContext.Provider>;
};

export function useApi() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}
