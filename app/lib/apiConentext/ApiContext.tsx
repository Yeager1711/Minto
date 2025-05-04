'use client';
import { showToastError } from 'app/Ultils/toast';
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { isTokenExpired } from 'app/Ultils/check_TokenExpired/isTokenExpired';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Import interfaces from separate files
import { Industry } from 'app/interface/Industry';
import { Province, District } from 'app/interface/Location';
import { RecruitmentInfo } from 'app/interface/Recruitment';
import { ProvinceResponse } from 'app/interface/Location';
import { JobData } from 'app/interface/JobData';

interface ApiContextType {
    accessToken: string | null;
    emailHr: string | null;
    login: (email_hr: string, password: string, keepLoggedIn: boolean) => Promise<void>;
    fetchIndustries: () => Promise<Industry[]>;
    fetchProvinces: () => Promise<Province[]>;
    fetchDistricts: (provinceCode: number) => Promise<District[]>;
    register: (
        email_hr: string,
        password: string,
        companyName: string,
        phoneNumber_company: string,
        address: string,
        industry: string,
        firstName: string,
        lastName: string,
        company_description: string
    ) => Promise<void>;
    fetchRecruitmentID: (token?: string) => Promise<RecruitmentInfo>;
    logout: () => void;
    updateBannerBackground: (file: File) => Promise<string>;
    updateCompanyLogo: (file: File) => Promise<string>;
    postCompanyJob: (jobData: JobData) => Promise<void>;
    fetchCompanyJobs: (companyId: number) => Promise<RecruitmentInfo>;
    updateCompanyInfo: (updateData: {
        name_company?: string;
        phoneNumber_company?: string;
        company_description?: string;
        industries?: string[];
        address_name?: string;
        companyTaxIdentificationNumber?: string;
        companySize?: string;
        personalTaxCode?: string;
    }) => Promise<any>;
    getMapEmbedUrl: (address: string) => string;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL || 'http://localhost:5000';
const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [emailHr, setEmailHr] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window !== 'undefined') {
                const storedToken = localStorage.getItem('access_token');
                if (storedToken && !isTokenExpired(storedToken)) {
                    try {
                        setAccessToken(storedToken);
                        const data = await fetchRecruitmentID(storedToken);
                        setEmailHr(data.email_hr);
                    } catch (error) {
                        console.error('Lỗi khi khởi tạo auth:', error);
                        localStorage.removeItem('access_token');
                        setAccessToken(null);
                        setEmailHr(null);
                    }
                }

                if (storedToken === '' || storedToken === 'undefined') {
                    router.push('/');
                }
                setIsReady(true);
            }
        };
        initializeAuth();
    }, []);

    const getAuthHeaders = (token?: string) => {
        const effectiveToken = token || accessToken;
        if (!effectiveToken) {
            throw new Error('No token');
        }
        if (isTokenExpired(effectiveToken)) {
            showToastError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            localStorage.removeItem('access_token');
            setAccessToken(null);
            setEmailHr(null);
            throw new Error('Token expired');
        }
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
        };
    };

    const login = async (email_hr: string, password: string, keepLoggedIn: boolean) => {
        try {
            const response = await axios.post(`${apiUrl}/recruitment/login`, {
                email_hr,
                password,
                keepLoggedIn,
            });
            const data = response.data;
            console.log('Phản hồi từ login:', data);

            localStorage.setItem('access_token', data.accessToken);
            setAccessToken(data.accessToken);

            const recruitmentData = await fetchRecruitmentID(data.accessToken);
            setEmailHr(recruitmentData.email_hr);
            console.log('Đã cập nhật emailHr:', recruitmentData.email_hr);

            toast.success('Đăng nhập thành công!', { position: 'top-right', autoClose: 3000 });
        } catch (error: any) {
            console.error('Lỗi trong login:', error);
            const errorData = error.response?.data;
            if (errorData) {
                throw new Error(JSON.stringify({ field: errorData.field, message: errorData.message }));
            }
            toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.', {
                position: 'top-right',
                autoClose: 3000,
            });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setAccessToken(null);
        setEmailHr(null);
        router.push('/');
    };

    const fetchIndustries = async () => {
        try {
            const response = await axios.get(`${apiUrl}/jobs/all-job-industry`);
            const data: { success: boolean; data: string[] } = response.data;
            if (!data.success) {
                throw new Error('Failed to fetch industries');
            }
            return data.data.map((industry: string) => ({ value: industry, label: industry }));
        } catch (error) {
            toast.error('Không thể tải danh sách ngành nghề', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await axios.get('https://provinces.open-api.vn/api/p/');
            const data: ProvinceResponse[] = response.data;
            return data.map((province) => ({ code: province.code, name: province.name }));
        } catch (error) {
            toast.error('Không thể tải danh sách tỉnh/thành phố', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const fetchDistricts = async (provinceCode: number) => {
        try {
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data: ProvinceResponse = response.data;
            return data.districts || [];
        } catch (error) {
            toast.error('Không thể tải danh sách quận/huyện', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const register = async (
        email: string,
        password: string,
        companyName: string,
        phoneNumber: string,
        address: string,
        industry: string,
        firstName: string,
        lastName: string,
        company_description: string
    ) => {
        try {
            const response = await axios.post(`${apiUrl}/auth_recruitment/register`, {
                email_hr: email,
                password,
                companyName,
                phoneNumber_company: phoneNumber,
                address,
                industry,
                firstName,
                lastName,
                company_description,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const fetchRecruitmentID = async (token?: string): Promise<RecruitmentInfo> => {
        try {
            const headers = getAuthHeaders(token);
            const response = await axios.get(`${apiUrl}/recruitment/getRecruitmentId`, { headers });
            const data = response.data;
            return data;
        } catch (error: any) {
            console.error('Error in fetchRecruitmentID:', error);
            toast.error('Không thể tải thông tin người dùng', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const updateBannerBackground = async (file: File): Promise<string> => {
        try {
            const headers = getAuthHeaders();
            const formData = new FormData();
            formData.append('bannerImage', file);

            const response = await axios.patch(`${apiUrl}/recruitment/updateBannerBackground`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;
            return data.banner_BackgroundImage_company;
        } catch (error: any) {
            console.error('Error in updateBannerBackground:', error);
            toast.error('Không thể cập nhật ảnh nền công ty', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const updateCompanyLogo = async (file: File): Promise<string> => {
        try {
            const headers = getAuthHeaders();
            const formData = new FormData();
            formData.append('logoImage', file);

            const response = await axios.patch(`${apiUrl}/recruitment/updateCompanyLogo`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;
            return data.image_company;
        } catch (error: any) {
            console.error('Error in updateCompanyLogo:', error);
            toast.error('Không thể cập nhật logo công ty', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const fetchCompanyJobs = async (companyId: number): Promise<RecruitmentInfo> => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${apiUrl}/recruitment/company/${companyId}/jobs`, { headers });
            const data = response.data;

            const mappedData: RecruitmentInfo = {
                recruitment_Id: data.company.recruitment.recruitment_Id,
                email_hr: data.company.recruitment.email_hr,
                firstName: data.company.recruitment.firstName,
                lastName: data.company.recruitment.lastName,
                gender: data.company.recruitment.gender,
                company: {
                    companyId: data.company.companyId,
                    name: data.company.name,
                    phoneNumber_company: data.company.phoneNumber_company,
                    company_description: data.company.company_description,
                    companyIndustries: data.company.companyIndustries.map((industry: any) => ({
                        companyIndustry_ID: industry.companyIndustry_ID,
                        name: industry.name,
                    })),
                    images: data.company.images.map((image: any) => ({
                        companyId: image.companyId,
                        image_company: image.image_company,
                        banner_BackgroundImage_company: image.banner_BackgroundImage_company,
                    })),
                    workLocations: data.company.workLocations.map((location: any) => ({
                        workLocationId: location.workLocationId,
                        address_name: location.address_name,
                        district: {
                            districtId: location.district.districtId,
                            name: location.district.name,
                        },
                    })),
                    taxCodes:
                        data.company.taxCodes?.map((taxCode: any) => ({
                            taxCodeId: taxCode.taxCodeId,
                            companyId: taxCode.companyId,
                            companyTaxIdentificationNumber: taxCode.companyTaxIdentificationNumber,
                            companySize: taxCode.companySize,
                            personalTaxCode: taxCode.personalTaxCode,
                            created_at: taxCode.created_at,
                        })) || [],
                },
                jobs: data.company.jobs.map((job: any) => ({
                    jobId: job.jobId,
                    title: job.title,
                    salary_from: job.salary_from,
                    salary_to: job.salary_to,
                    expire_on: job.expire_on,
                    description: job.description,
                    requirement: job.requirement,
                    benefits: job.benefits,
                    workLocation: {
                        address_name: job.workLocation.address_name,
                        district: {
                            name: job.workLocation.district.name,
                        },
                    },
                    // Chuẩn hóa jobLevel, jobType_name, jobType_workAt thành string[]
                    jobLevel: Array.isArray(job.jobLevel?.name)
                        ? job.jobLevel.name
                        : [job.jobLevel?.name || 'Không xác định'],
                    jobType_name: Array.isArray(job.jobType?.name)
                        ? job.jobType.name
                        : [job.jobType?.name || 'Không xác định'],
                    jobType_workAt: Array.isArray(job.jobType?.work_at)
                        ? job.jobType.work_at
                        : [job.jobType?.work_at || 'Không xác định'],
                    jobIndustry: job.jobIndustry.name,
                    generalInformation: {
                        numberOfRecruits: job.generalInformation.numberOfRecruits,
                        gender: job.generalInformation.gender,
                    },
                    work_time: job.work_time,
                    view: job.view,
                })),
            };

            return mappedData;
        } catch (error: any) {
            console.error('Error in fetchCompanyJobs:', error);
            toast.error('Không thể tải thông tin công ty và công việc', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const postCompanyJob = async (jobData: JobData) => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.post(`${apiUrl}/jobs/recruitment-PostJob`, jobData, { headers });
            const data = response.data;

            console.log('job data', data);

            toast.success('Đăng tin tuyển dụng thành công!', { position: 'top-right', autoClose: 3000 });
            return data;
        } catch (error: any) {
            console.error('Error in postCompanyJob:', error);
            toast.error('Đăng tin tuyển dụng thất bại. Vui lòng thử lại.', { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    const updateCompanyInfo = async (updateData: {
        name_company?: string;
        phoneNumber_company?: string;
        company_description?: string;
        industries?: string[];
        address_name?: string;
        companyTaxIdentificationNumber?: string;
        companySize?: string;
        personalTaxCode?: string;
    }): Promise<any> => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.patch(`${apiUrl}/recruitment/updateCompanyInfo`, updateData, { headers });
            const data = response.data;

            if (!data.company) {
                throw new Error('Không nhận được dữ liệu công ty từ API');
            }

            toast.success('Cập nhật thông tin công ty thành công!', { position: 'top-right', autoClose: 3000 });
            return data; // Return the entire response, which includes the updated company data
        } catch (error: any) {
            console.error('Error in updateCompanyInfo:', error);
            const errorMessage =
                error.response?.data?.message || 'Cập nhật thông tin công ty thất bại. Vui lòng thử lại.';
            toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
            throw error;
        }
    };

    //view seach realtime google map with address company
    const getMapEmbedUrl = (address: string): string => {
        try {
            if (!address) {
                throw new Error('Địa chỉ không được cung cấp');
            }
            return `https://www.google.com/maps/embed/v1/place?key=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}&language=vi`;
        } catch (error: any) {
            console.error('Lỗi khi tạo URL bản đồ:', error.message);
            return '';
        }
    };

    const value = {
        accessToken,
        emailHr,
        login,
        logout,
        fetchIndustries,
        fetchProvinces,
        fetchDistricts,
        register,
        fetchRecruitmentID,
        updateBannerBackground,
        updateCompanyLogo,
        postCompanyJob,
        fetchCompanyJobs,
        updateCompanyInfo,
        getMapEmbedUrl,
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
