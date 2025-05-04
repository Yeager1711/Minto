'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './company_info.module.scss';
import SettingsLayout from '../control/page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useApi } from '../../../lib/apiConentext/ApiContext';
import { RecruitmentInfo } from 'app/interface/Recruitment';
import { Industry } from 'app/interface/Industry';
import { BusinessLicensePopup } from '../../../popup/BusinessLicensePopup/page';

function Company_Info() {
    const { fetchCompanyJobs, fetchRecruitmentID, fetchIndustries, updateCompanyInfo } = useApi();

    const [companyData, setCompanyData] = useState<RecruitmentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [businessType, setBusinessType] = useState<'Doanh nghiệp' | 'Hộ kinh doanh'>('Doanh nghiệp');
    const [companySize, setCompanySize] = useState<string>('');
    const [industries, setIndustries] = useState<string[]>([]);
    const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
    const [isLicensePopupOpen, setIsLicensePopupOpen] = useState(false);

    const handleOpenLicensePopup = () => {
        setIsLicensePopupOpen(true);
    };

    const handleCloseLicensePopup = () => {
        setIsLicensePopupOpen(false);
    };

    const [formData, setFormData] = useState({
        name_company: '',
        phoneNumber_company: '',
        company_description: '',
        address_name: '',
        taxCode: '', // Generic tax code field
        website: '',
    });

    const sizeOptions = [
        { value: '', label: 'Chọn quy mô' },
        { value: '1-9', label: '1-9 nhân viên' },
        { value: '10-24', label: '10-24 nhân viên' },
        { value: '25-49', label: '25-49 nhân viên' },
        { value: '50-99', label: '50-99 nhân viên' },
        { value: '100-499', label: '100-499 nhân viên' },
        { value: '500-999', label: '500-999 nhân viên' },
        { value: '1000+', label: '1000+ nhân viên' },
        { value: '3000+', label: '3000+ nhân viên' },
        { value: '5000+', label: '5000+ nhân viên' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const companyByRecruitmentId = await fetchRecruitmentID();
                const companyId = companyByRecruitmentId.company.companyId;
                const data = await fetchCompanyJobs(Number(companyId));
                console.log('Dữ liệu từ API:', data);
                if (!data) {
                    throw new Error('Dữ liệu API không đúng định dạng hoặc không tìm thấy công ty');
                }
                setCompanyData(data);

                // Initialize taxCode based on businessType
                const taxCodeValue =
                    businessType === 'Doanh nghiệp'
                        ? data.company?.taxCodes?.[0]?.companyTaxIdentificationNumber || ''
                        : data.company?.taxCodes?.[0]?.personalTaxCode || '';

                setFormData({
                    name_company: data.company?.name || '',
                    phoneNumber_company: data.company?.phoneNumber_company?.toString() || '',
                    company_description: data.company?.company_description || '',
                    address_name: data.company?.workLocations?.[0]?.address_name || '',
                    taxCode: taxCodeValue,
                    website: '',
                });

                const industryString = data.company?.companyIndustries?.[0]?.name || '';
                const industryArray = industryString
                    .split(',')
                    .map((item: any) => item.trim())
                    .filter((item: any) => item !== '');
                setIndustries(industryArray);

                // Set companySize if available
                setCompanySize(data.company?.taxCodes?.[0]?.companySize || '');
            } catch (err: any) {
                console.error('Lỗi khi lấy dữ liệu công ty:', err.message);
                setError(err.message || 'Lỗi khi lấy dữ liệu công ty.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchRecruitmentID, fetchCompanyJobs]);

    useEffect(() => {
        const fetchIndustryOptions = async () => {
            try {
                const response = await fetchIndustries();
                console.log('Dữ liệu lĩnh vực từ API:', response);
                if (response && response.length > 0) {
                    const industryNames = response.map((industry: Industry) => industry.label);
                    setAvailableIndustries(industryNames);
                } else {
                    throw new Error('Không thể lấy danh sách lĩnh vực hoạt động');
                }
            } catch (err: any) {
                console.error('Lỗi khi lấy dữ liệu lĩnh vực:', err.message);
                setError(err.message || 'Lỗi khi lấy dữ liệu lĩnh vực.');
            }
        };

        fetchIndustryOptions();
    }, [fetchIndustries]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBusinessTypeChange = (type: 'Doanh nghiệp' | 'Hộ kinh doanh') => {
        setBusinessType(type);

        // Update taxCode display based on new business type
        const taxCodeValue =
            type === 'Doanh nghiệp'
                ? companyData?.company?.taxCodes?.[0]?.companyTaxIdentificationNumber || ''
                : companyData?.company?.taxCodes?.[0]?.personalTaxCode || '';
        setFormData((prev) => ({
            ...prev,
            taxCode: taxCodeValue,
        }));
    };

    const handleCompanySizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCompanySize(event.target.value);
    };

    const handleRemoveIndustry = (industryToRemove: string) => {
        setIndustries(industries.filter((industry) => industry !== industryToRemove));
    };

    const handleAddIndustry = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIndustry = event.target.value;
        if (selectedIndustry && !industries.includes(selectedIndustry)) {
            setIndustries([...industries, selectedIndustry]);
        }
    };

    const handleSubmit = async () => {
        try {
            const updatePayload: {
                name_company?: string;
                phoneNumber_company?: string;
                company_description?: string;
                industries?: string[];
                address_name?: string;
                companyTaxIdentificationNumber?: string;
                companySize?: string;
                personalTaxCode?: string;
            } = {
                name_company: formData.name_company,
                phoneNumber_company: formData.phoneNumber_company,
                company_description: formData.company_description,
                industries: industries.length > 0 ? industries : undefined,
                address_name: formData.address_name,
                companySize: companySize || undefined,
            };

            // Assign tax code based on business type
            if (businessType === 'Doanh nghiệp') {
                updatePayload.companyTaxIdentificationNumber = formData.taxCode || undefined;
                updatePayload.personalTaxCode = undefined; // Clear the other field
            } else {
                updatePayload.personalTaxCode = formData.taxCode || undefined;
                updatePayload.companyTaxIdentificationNumber = undefined; // Clear the other field
            }

            const updatedCompany = await updateCompanyInfo(updatePayload);

            setCompanyData((prev) => ({
                ...prev!,
                company: {
                    ...prev!.company,
                    ...updatedCompany.company,
                },
            }));

            // Update taxCode in formData based on business type
            const updatedTaxCode =
                businessType === 'Doanh nghiệp'
                    ? updatedCompany.company.taxCodes?.[0]?.companyTaxIdentificationNumber || ''
                    : updatedCompany.company.taxCodes?.[0]?.personalTaxCode || '';

            setFormData({
                name_company: updatedCompany.company.name,
                phoneNumber_company: updatedCompany.company.phoneNumber_company,
                company_description: updatedCompany.company.company_description,
                address_name: updatedCompany.company.workLocations?.[0]?.address_name || '',
                taxCode: updatedTaxCode,
                website: '',
            });

            const updatedIndustries =
                updatedCompany.company.companyIndustries?.map((industry: { name: string }) => industry.name) || [];
            setIndustries(updatedIndustries);
        } catch (err: any) {
            console.error('Lỗi khi cập nhật thông tin công ty:', err.message);
            setError(err.message || 'Lỗi khi cập nhật thông tin công ty.');
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!companyData) {
        return <div>Không có dữ liệu công ty để hiển thị.</div>;
    }

    return (
        <section className={styles.Company_Info}>
            <SettingsLayout />

            <div className={styles.Company_Info__container}>
                <h2>Cập nhật thông tin Công ty</h2>

                <div className={styles.btn_update__companyInfo} onClick={handleSubmit}>
                    Lưu thông tin
                </div>

                <div className={styles.Business_type}>
                    <h3>Loại hình kinh doanh</h3>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                        <div className={styles.Business_type__checkbox}>
                            <input
                                type="radio"
                                id="doanh-nghiep"
                                name="business-type"
                                checked={businessType === 'Doanh nghiệp'}
                                onChange={() => handleBusinessTypeChange('Doanh nghiệp')}
                            />
                            <label htmlFor="doanh-nghiep">Doanh nghiệp</label>
                        </div>
                        <div className={styles.Business_type__checkbox}>
                            <input
                                type="radio"
                                id="ho-kinh-doanh"
                                name="business-type"
                                checked={businessType === 'Hộ kinh doanh'}
                                onChange={() => handleBusinessTypeChange('Hộ kinh doanh')}
                            />
                            <label htmlFor="ho-kinh-doanh">Hộ kinh doanh</label>
                        </div>

                        <div className={styles.business_license}>
                            <button className={styles.btn_update__business_license} onClick={handleOpenLicensePopup}>
                                Cập nhật giấy tờ doanh nghiệp
                            </button>
                        </div>
                    </div>

                   

                    <div className={styles.notification_business_type}>
                        <div className={styles.notification_business_type__box}>
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            <div className={styles.block_text}>
                                <span className={styles.notification_text}>
                                    Vui lòng nhập đúng <strong>Mã số thuế doanh nghiệp</strong> trên{' '}
                                    <strong>Giấy phép đăng ký kinh doanh</strong>.
                                </span>
                                <span className={styles.notification_text}>
                                    Bạn có thể tra cứu Mã số thuế doanh nghiệp{' '}
                                    {process.env.NEXT_PUBLIC_CHECK_TAX_VN ? (
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={process.env.NEXT_PUBLIC_CHECK_TAX_VN}
                                        >
                                            Tại đây
                                        </a>
                                    ) : (
                                        <span>Tại đây (liên kết không khả dụng)</span>
                                    )}
                                    .
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.box_input__container}>
                    <div className={styles.flex_box}>
                        <div className={styles.box}>
                            <span className={styles.span}>Email</span>
                            <input
                                type="text"
                                placeholder="Email"
                                value={companyData.email_hr || 'Không có email HR'}
                                disabled
                            />
                        </div>
                        <div className={styles.box}>
                            <span className={styles.span}>Số điện thoại</span>
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                name="phoneNumber_company"
                                value={formData.phoneNumber_company}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={styles.flex_box}>
                        <div className={styles.box}>
                            <span className={styles.span}>Mã số thuế</span>
                            <input
                                type="text"
                                placeholder="Nhập mã số thuế"
                                name="taxCode"
                                value={formData.taxCode}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.box}>
                            <span className={styles.span}>Tên công ty</span>
                            <input
                                type="text"
                                placeholder="Tên công ty"
                                name="name_company"
                                value={formData.name_company}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={styles.flex_box}>
                        <div className={styles.box}>
                            <span className={styles.span}>Lĩnh vực hoạt động</span>
                            <div className={styles.industry_tags}>
                                {industries.length > 0 ? (
                                    industries.map((industry, index) => (
                                        <span key={index} className={styles.industry_tag}>
                                            <strong className={styles.text}> {industry}</strong>
                                            <p
                                                className={styles.remove_tag}
                                                onClick={() => handleRemoveIndustry(industry)}
                                            >
                                                ×
                                            </p>
                                        </span>
                                    ))
                                ) : (
                                    <span>Không có lĩnh vực hoạt động</span>
                                )}
                            </div>

                            <div className={styles.select_industry}>
                                <select name="industry" id="industry" onChange={handleAddIndustry}>
                                    <option value="">Chọn lĩnh vực</option>
                                    {availableIndustries.map((industry) => (
                                        <option key={industry} value={industry}>
                                            {industry}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styles.flex_box}>
                        <div className={styles.box}>
                            <span className={styles.span}>Website</span>
                            <input
                                type="text"
                                placeholder="https://"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={styles.flex_box}>
                        <div className={styles.box}>
                            <span className={styles.span}>Quy mô</span>
                            <select value={companySize} onChange={handleCompanySizeChange}>
                                {sizeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.box}>
                            <span className={styles.span}>Địa chỉ</span>
                            <input
                                type="text"
                                placeholder="Địa chỉ"
                                name="address_name"
                                value={formData.address_name}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={styles.description_company}>
                        <span>Mô tả công ty</span>
                        <textarea
                            name="company_description"
                            id="company_description"
                            value={formData.company_description}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </div>

            {isLicensePopupOpen && (
                        <BusinessLicensePopup
                            onClose={handleCloseLicensePopup}
                            firstName={companyData?.firstName || 'Khách'} 
                            lastName={companyData?.lastName || ''} 
                        />
                    )}
        </section>
    );
}

export default Company_Info;
