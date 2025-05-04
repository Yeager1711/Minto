export interface RecruitmentInfo {
    recruitment_Id: number;
    email_hr: string;
    firstName: string;
    lastName: string;
    gender: string;
    company: {
        companyId: number;
        name: string;
        phoneNumber_company: string;
        company_description: string;
        companyIndustries: { companyIndustry_ID: number; name: string }[];
        images: { companyId: number; image_company: string; banner_BackgroundImage_company: string }[];
        workLocations: {
            workLocationId: number;
            address_name: string;
            district: { districtId: number; name: string };
        }[];
        taxCodes?: {
            taxId: number;
            companyTaxIdentificationNumber: string;
            companySize: string;
            personalTaxCode: string | null;
            created_at: Date;
        }[];
    };
    jobs: {
        jobId: number;
        title: string;
        salary_from: number;
        salary_to: number;
        expire_on: Date;
        description: string;
        requirement: string;
        benefits: string;
        workLocation: { address_name: string; district: { name: string } };
        jobLevel: string;
        jobType_name: string;
        jobType_workAt: string;
        jobIndustry: string;
        generalInformation: { numberOfRecruits: number; gender: string };
        work_time: string;
        view: number;
    }[];
}

// export interface RecruitmentInfo {
//     recruitment_Id: number;
//     email_hr: string;
//     firstName: string;
//     lastName:string;
//     gender: string;
//     company: {
//       companyId: number;
//       name: string;
//       phoneNumber_company: number;
//       company_description: string,
//       companyIndustries: { companyIndustry_ID: number; name: string }[];
//       images: { companyId: number; image_company: string; banner_BackgroundImage_company: string }[];
//       workLocations: {
//         workLocationId: number;
//         address_name: string;
//         district: {
//           districtId: number;
//           name: string } }[];
//     };
//     jobs?: {
//       jobId: number;
//       title: string;
//       salary_from: number;
//       salary_to: number;
//       expire_on: string;
//       description: string;
//       requirement: string;
//       benefits: string;
//       workLocation: { address_name: string; district: { name: string } };
//       jobLevel: string[];
//       jobType_name: string[];
//       jobType_workAt: string[];
//       jobIndustry: string;
//       generalInformation: { numberOfRecruits: number; gender: string };
//       work_time: string;
//       view: number;
//     }[];
//   }
