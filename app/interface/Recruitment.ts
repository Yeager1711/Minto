import { IndustryData } from './Industry';

export interface District {
    districtId: number;
    name: string;
}

export interface WorkLocation {
    workLocationId: number;
    address_name: string;
    created_at: string;
    updated_at: string;
    district: District;
}

export interface ImageCompany {
    companyId: number;
    image_company: string;
    banner_BackgroundImage_company: string;
}

export interface Company {
    companyId: number;
    name: string;
    created_at: string;
    updated_at: string;
    phoneNumber_company: string;
    companyIndustries: IndustryData[];
    workLocations: WorkLocation[];
    images: ImageCompany[] ; 
}

export interface RecruitmentInfo {
    recruitment_Id: number;
    email_hr: string;
    firstName: string;
    lastName: string;
    avatar_hr: string | null;
    gender: string | null;
    company: Company;
}
