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

interface CreateCategoryData {
    category_name: string;
}

interface CreateCategoryResponse {
    statusCode: number;
    message: string;
    data: {
        category_id: number;
        category_name: string;
    };
}

interface Category {
    category_id: number;
    category_name: string;
}

interface CreateTemplateData {
    template_id?: number;
    name: string;
    description?: string;
    price: number;
    category_id: number;
    status: string;
    image: File;
}

// Thêm giao diện CreateTemplateResponse
interface CreateTemplateResponse {
    template_id: number;
    name: string;
    description?: string;
    image_url: string;
    price: string;
    category_id: number;
    status: string;
    message?: string; // Tùy chọn, nếu API trả về thông báo
}

interface TemplateResponse {
    card_id: number;
    template: {
        template_id: number;
        name: string;
        image_url: string;
        price: string;
        payments: {
            amount: string;
            payment_date: string;
            status: string;
            payment_method: string;
        }[];
        guests: {
            guest_id: number;
            invitation_id: number;
            full_name: string;
            sharedLinks: {
                link_id: number;
                guest_id: number;
                share_url: string;
                created_at: string;
                expires_at: string;
            }[];
        }[];
    };
}

interface Template {
    template_id: number;
    name: string;
    description?: string;
    image_url: string;
    price: number;
    status: string;
    category: Category;
}

interface SaveCardData {
    templateId: number;
    weddingData: any;
    weddingImages: { file: File; position: string }[];
    inviteeNames: string[];
    totalPrice: number;
}

interface SaveCardResponse {
    card_id: number;
    user_id: number;
    template_id: number;
    created_at: string;
    status: string;
    custom_data: any;
}

interface ApiContextType {
    accessToken: string | null;
    login: (data: LoginData) => Promise<LoginResponse>;
    register: (data: RegisterData) => Promise<void>;
    getUserProfile: () => Promise<UserProfile>;
    createCategory: (data: CreateCategoryData) => Promise<CreateCategoryResponse>;
    getCategories: () => Promise<Category[]>;
    createTemplate: (data: CreateTemplateData) => Promise<CreateTemplateResponse>;
    getTemplates: () => Promise<Template[]>;
    saveCard: (data: SaveCardData) => Promise<SaveCardResponse>;
    getUserTemplates: () => Promise<TemplateResponse[]>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

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
        if (!accessToken) {
            throw new Error('Vui lòng đăng nhập');
        }
        try {
            const response = await axios.get(`${apiUrl}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Không thể lấy thông tin người dùng';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const createCategory = async (data: CreateCategoryData): Promise<CreateCategoryResponse> => {
        if (!accessToken) {
            throw new Error('Vui lòng đăng nhập');
        }
        try {
            const response = await axios.post(`${apiUrl}/categories/add-template`, data, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            toast.success(response.data.message || 'Danh mục đã được tạo thành công');
            return response.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Lỗi khi tạo danh mục, vui lòng thử lại';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const getCategories = async (): Promise<Category[]> => {
        if (!accessToken) {
            throw new Error('Vui lòng đăng nhập');
        }
        try {
            const response = await axios.get(`${apiUrl}/categories/getCategories`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Không thể lấy danh sách danh mục';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const createTemplate = async (data: CreateTemplateData): Promise<CreateTemplateResponse> => {
        if (!accessToken) {
            throw new Error('Vui lòng đăng nhập');
        }
        try {
            const formData = new FormData();
            if (data.template_id !== undefined) {
                formData.append('template_id', data.template_id.toString());
            }
            formData.append('name', data.name);
            if (data.description) {
                formData.append('description', data.description);
            }
            formData.append('price', data.price.toString());
            formData.append('category_id', data.category_id.toString());
            formData.append('status', data.status);
            formData.append('image', data.image);

            console.log('FormData:', Array.from(formData.entries()));

            const response = await axios.post(`${apiUrl}/templates/add-template`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Lỗi khi tạo mẫu thiệp';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const getTemplates = async (): Promise<Template[]> => {
        if (!accessToken) {
            throw new Error('Vui lòng đăng nhập');
        }
        try {
            const response = await axios.get(`${apiUrl}/templates/getTemplate`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Không thể lấy danh sách mẫu thiệp';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const saveCard = async (data: SaveCardData): Promise<SaveCardResponse> => {
        if (!accessToken) {
            throw new Error('Vui lòng đăng nhập');
        }
        try {
            console.log('Dữ liệu nhận được trong saveCard:', data);

            const formData = new FormData();
            formData.append('templateId', data.templateId.toString());
            formData.append('weddingData', JSON.stringify(data.weddingData));
            formData.append('inviteeNames', JSON.stringify(data.inviteeNames));
            formData.append('totalPrice', data.totalPrice.toString());

            data.weddingImages.forEach((image, index) => {
                formData.append('weddingImages', image.file);
                formData.append(`positions[${index}]`, image.position);
            });

            console.log('FormData:', Array.from(formData.entries()));
            console.log('Header Authorization:', `Bearer ${accessToken}`);

            const response = await axios.post(`${apiUrl}/cards/save-card`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Phản hồi từ saveCard:', response.data);
            toast.success('Lưu thiệp thành công');
            return response.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Lỗi khi lưu thiệp, vui lòng thử lại';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const getUserTemplates = async (): Promise<TemplateResponse[]> => {
        if (!accessToken) {
            throw new Error('Vui lòng đăng nhập');
        }
        try {
            const response = await axios.get(`${apiUrl}/cards/user-templates`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            return response.data;
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Không thể lấy danh sách template';
            showToastError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        accessToken,
        login,
        register,
        getUserProfile,
        createCategory,
        getCategories,
        createTemplate,
        getTemplates,
        saveCard,
        getUserTemplates,
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
