'use client';
import { useState, useEffect } from 'react';
import { useApi } from '../../lib/apiConentext/ApiContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './signup.module.scss';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';

interface Industry {
    value: string;
    label: string;
}
interface Province {
    code: number;
    name: string;
}
interface District {
    code: number;
    name: string;
}

export default function SignUp() {
    const [activeTab, setActiveTab] = useState<number>(1);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>([]);
    const [isCustomIndustry, setIsCustomIndustry] = useState<boolean>(false);
    const [customIndustry, setCustomIndustry] = useState<string>('');
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        firstName: '',
        lastName: '',
        specificAddress: '',
        company_description: '',
    });

    const [errors, setErrors] = useState({
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        province: '',
        district: '',
        industry: '',
        firstName: '',
        lastName: '',
        company_description: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { fetchIndustries, fetchProvinces, fetchDistricts, register } = useApi();

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });

        const loadInitialData = async () => {
            setLoading(true);
            try {
                const industriesData = await fetchIndustries();
                setIndustries(industriesData);
                const provincesData = await fetchProvinces();
                setProvinces(provincesData);
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [fetchIndustries, fetchProvinces]);

    useEffect(() => {
        if (selectedProvince) {
            const loadDistricts = async () => {
                try {
                    const districtsData = await fetchDistricts(selectedProvince.code);
                    setDistricts(districtsData);
                    setSelectedDistrict(null);
                } catch (error) {
                    console.error('Error fetching districts:', error);
                    setDistricts([]);
                    setSelectedDistrict(null);
                }
            };
            loadDistricts();
        } else {
            setDistricts([]);
            setSelectedDistrict(null);
        }
    }, [selectedProvince, fetchDistricts]);

    const provinceOptions = provinces.map((province) => ({ value: province.code, label: province.name }));

    const handleNextTab = () => {
        let newErrors = { ...errors };

        if (activeTab === 1) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            newErrors = {
                ...newErrors,
                firstName: !formData.firstName ? 'Họ không được để trống' : '',
                lastName: !formData.lastName ? 'Tên không được để trống' : '',
                password: !formData.password
                    ? 'Mật khẩu không được để trống'
                    : !passwordRegex.test(formData.password)
                      ? 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái in hoa, chữ cái thường, số và ký tự đặc biệt'
                      : '',
                confirmPassword: !formData.confirmPassword
                    ? 'Xác nhận mật khẩu không được để trống'
                    : formData.password !== formData.confirmPassword
                      ? 'Mật khẩu xác nhận không khớp'
                      : '',
            };
        } else if (activeTab === 2) {
            newErrors = {
                ...newErrors,
                companyName: !formData.companyName ? 'Tên công ty không được để trống' : '',
                province: !selectedProvince ? 'Vui lòng chọn tỉnh/thành phố' : '',
                district: !selectedDistrict ? 'Vui lòng chọn quận/huyện' : '',
                phoneNumber: !formData.phoneNumber
                    ? 'Số điện thoại không được để trống'
                    : !/^[0-9]{10}$/.test(formData.phoneNumber)
                      ? 'Số điện thoại phải có 10 chữ số'
                      : '',
                email: !formData.email
                    ? 'Email không được để trống'
                    : !formData.email.endsWith('@gmail.com')
                      ? 'Email phải sử dụng @gmail.com'
                      : '',
            };
        } else if (activeTab === 3) {
            newErrors = {
                ...newErrors,
                industry:
                    isCustomIndustry && !customIndustry.trim()
                        ? 'Vui lòng nhập lĩnh vực công ty'
                        : !isCustomIndustry && selectedIndustries.length === 0
                          ? 'Vui lòng chọn ít nhất một lĩnh vực công ty'
                          : '',
                company_description: !formData.company_description.trim()
                    ? 'Mô tả công ty không được để trống'
                    : formData.company_description.length > 255
                      ? 'Mô tả công ty không được vượt quá 255 ký tự'
                      : '',
            };
        }

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some((error) => error !== '');
        if (!hasErrors && activeTab < 3) {
            setActiveTab(activeTab + 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const selectedAddressText =
        selectedProvince && selectedDistrict
            ? formData.specificAddress
                ? `${formData.specificAddress}, ${selectedDistrict.name}, ${selectedProvince.name}`
                : `${selectedDistrict.name}, ${selectedProvince.name}`
            : '';

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let industryValue = '';
        if (isCustomIndustry) {
            if (!customIndustry.trim()) {
                setErrors((prev) => ({ ...prev, industry: 'Vui lòng nhập lĩnh vực công ty' }));
                setIsSubmitting(false);
                return;
            }
            industryValue = customIndustry.trim();
        } else {
            if (selectedIndustries.length === 0) {
                setErrors((prev) => ({ ...prev, industry: 'Vui lòng chọn ít nhất một lĩnh vực công ty' }));
                setIsSubmitting(false);
                return;
            }
            industryValue = selectedIndustries.map((industry) => industry.value).join(', ');
        }

        if (!selectedProvince || !selectedDistrict) {
            setErrors((prev) => ({
                ...prev,
                province: !selectedProvince ? 'Vui lòng chọn tỉnh/thành phố' : '',
                district: !selectedDistrict ? 'Vui lòng chọn quận/huyện' : '',
            }));
            setIsSubmitting(false);
            return;
        }

        if (!formData.company_description.trim()) {
            setErrors((prev) => ({ ...prev, company_description: 'Mô tả công ty không được để trống' }));
            setIsSubmitting(false);
            return;
        }

        const fullAddress = formData.specificAddress
            ? `${formData.specificAddress}, ${selectedDistrict.name}, ${selectedProvince.name}`
            : `${selectedDistrict.name}, ${selectedProvince.name}`;

        try {
            await register(
                formData.email,
                formData.password,
                formData.companyName,
                formData.phoneNumber,
                fullAddress,
                industryValue,
                formData.firstName,
                formData.lastName,
                formData.company_description
            );
            toast.success('Đăng ký thành công!');
            setFormData({
                phoneNumber: '',
                email: '',
                password: '',
                confirmPassword: '',
                companyName: '',
                firstName: '',
                lastName: '',
                specificAddress: '',
                company_description: '',
            });
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedIndustries([]);
            setCustomIndustry('');
            setIsCustomIndustry(false);
            setActiveTab(1);
            setErrors({
                phoneNumber: '',
                email: '',
                password: '',
                confirmPassword: '',
                companyName: '',
                province: '',
                district: '',
                industry: '',
                firstName: '',
                lastName: '',
                company_description: '',
            });
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Đăng ký thất bại, vui lòng kiểm tra lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftSection} data-aos="fade-right">
                <h2>Đăng ký</h2>
                <div className={styles.tabNavigation}>
                    <div className={styles.tabWrapper} data-aos="fade-up" data-aos-delay="100">
                        <div className={`${styles.tab} ${activeTab >= 1 ? styles.active : ''}`}>
                            <span className={styles.tabNumber}>1</span>
                            <span>Liên lạc</span>
                        </div>
                        <div className={styles.dottedLine}></div>
                    </div>
                    <div className={styles.tabWrapper} data-aos="fade-up" data-aos-delay="200">
                        <div className={`${styles.tab} ${activeTab >= 2 ? styles.active : ''}`}>
                            <span className={styles.tabNumber}>2</span>
                            <span>Công ty</span>
                        </div>
                        <div className={styles.dottedLine}></div>
                    </div>
                    <div className={styles.tabWrapper} data-aos="fade-up" data-aos-delay="300">
                        <div className={`${styles.tab} ${activeTab >= 3 ? styles.active : ''}`}>
                            <span className={styles.tabNumber}>3</span>
                            <span>Tuyển dụng</span>
                        </div>
                    </div>
                </div>

                <div className={styles.tabContent} data-aos="fade-up" data-aos-delay="400">
                    {activeTab === 1 && (
                        <div className={`${styles.tabPane} ${styles.fade}`}>
                            <div className={styles.formGroup}>
                                <label>Họ *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder=""
                                />
                                {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tên *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder=""
                                />
                                {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Mật khẩu *</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <FontAwesomeIcon icon={faEye} />
                                        ) : (
                                            <FontAwesomeIcon icon={faEyeSlash} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className={styles.error}>{errors.password}</p>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Xác nhận mật khẩu *</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Xác nhận mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <FontAwesomeIcon icon={faEye} />
                                        ) : (
                                            <FontAwesomeIcon icon={faEyeSlash} />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    )}
                    {activeTab === 2 && (
                        <div className={`${styles.tabPane} ${styles.fade}`}>
                            <div className={styles.formGroup}>
                                <label>Tên công ty *</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    placeholder=""
                                />
                                {errors.companyName && <p className={styles.error}>{errors.companyName}</p>}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Điện thoại công ty *</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder=""
                                />
                                {errors.phoneNumber && <p className={styles.error}>{errors.phoneNumber}</p>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder=""
                                />
                                {errors.email && <p className={styles.error}>{errors.email}</p>}
                            </div>

                            <div className={styles.flex_formGroup}>
                                <div className={styles.formGroup}>
                                    <label>Thành phố *</label>
                                    <Select
                                        options={provinceOptions}
                                        placeholder="Chọn tỉnh/thành phố..."
                                        isSearchable={true}
                                        value={provinceOptions.find(
                                            (option) => option.value === selectedProvince?.code
                                        )}
                                        onChange={(option: any) => {
                                            setSelectedProvince(
                                                option ? { code: option.value, name: option.label } : null
                                            );
                                            setErrors((prev) => ({ ...prev, province: '' }));
                                        }}
                                        noOptionsMessage={() => 'Không tìm thấy tỉnh/thành phố'}
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '4px',
                                                borderColor: '#ccc',
                                                padding: '2px',
                                                fontSize: '1.4rem',
                                            }),
                                            menu: (base) => ({ ...base, zIndex: 9999, fontSize: '1.25rem' }),
                                        }}
                                    />
                                    {errors.province && <p className={styles.error}>{errors.province}</p>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Quận / huyện *</label>
                                    <Select
                                        options={districts.map((district) => ({
                                            value: district.code,
                                            label: district.name,
                                        }))}
                                        placeholder="Chọn quận/huyện..."
                                        isSearchable={true}
                                        isDisabled={!selectedProvince}
                                        value={districts
                                            .map((district) => ({ value: district.code, label: district.name }))
                                            .find((option) => option.value === selectedDistrict?.code)}
                                        onChange={(option: any) => {
                                            setSelectedDistrict(
                                                option ? { code: option.value, name: option.label } : null
                                            );
                                            setErrors((prev) => ({ ...prev, district: '' }));
                                        }}
                                        noOptionsMessage={() => 'Không tìm thấy quận/huyện'}
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '4px',
                                                borderColor: '#ccc',
                                                padding: '2px',
                                                fontSize: '1.4rem',
                                            }),
                                            menu: (base) => ({ ...base, zIndex: 9999, fontSize: '1.25rem' }),
                                        }}
                                    />
                                    {errors.district && <p className={styles.error}>{errors.district}</p>}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Địa chỉ cụ thể (nếu có) *</label>
                                <input
                                    type="text"
                                    name="specificAddress"
                                    value={formData.specificAddress}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Tòa nhà X, tòa x, ...."
                                />
                                {selectedAddressText && (
                                    <p className={styles.error}>Địa chỉ được chọn: {selectedAddressText}</p>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 3 && (
                        <div className={`${styles.tabPane} ${styles.fade}`}>
                            <div className={styles.formGroup}>
                                <label>Lĩnh vực công ty *</label>
                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input
                                            type="radio"
                                            checked={!isCustomIndustry}
                                            onChange={() => {
                                                setIsCustomIndustry(false);
                                                setCustomIndustry('');
                                                setErrors((prev) => ({ ...prev, industry: '' }));
                                            }}
                                        />
                                        Chọn lĩnh vực có sẵn
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            checked={isCustomIndustry}
                                            onChange={() => {
                                                setIsCustomIndustry(true);
                                                setSelectedIndustries([]);
                                                setErrors((prev) => ({ ...prev, industry: '' }));
                                            }}
                                        />
                                        Nhập lĩnh vực tùy chỉnh
                                    </label>
                                </div>
                            </div>

                            {!isCustomIndustry ? (
                                <div className={styles.formGroup}>
                                    <Select
                                        isMulti
                                        options={industries}
                                        placeholder="Chọn hoặc tìm kiếm lĩnh vực..."
                                        isLoading={loading}
                                        isSearchable={true}
                                        value={selectedIndustries}
                                        onChange={(selected: any) => {
                                            setSelectedIndustries(selected || []);
                                            setErrors((prev) => ({ ...prev, industry: '' }));
                                        }}
                                        noOptionsMessage={() => 'Không tìm thấy lĩnh vực'}
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '4px',
                                                borderColor: '#ccc',
                                                padding: '2px',
                                                fontSize: '1.4rem',
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                                background: '#fff',
                                                fontSize: '1.2rem',
                                            }),
                                        }}
                                    />
                                    {errors.industry && <p className={styles.error}>{errors.industry}</p>}
                                </div>
                            ) : (
                                <div className={styles.formGroup}>
                                    <input
                                        type="text"
                                        value={customIndustry}
                                        onChange={(e) => {
                                            setCustomIndustry(e.target.value);
                                            setErrors((prev) => ({ ...prev, industry: '' }));
                                        }}
                                        placeholder="Nhập lĩnh vực công ty"
                                    />
                                    {errors.industry && <p className={styles.error}>{errors.industry}</p>}
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label>Mô tả công ty *</label>
                                <textarea
                                    name="company_description"
                                    value={formData.company_description}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả công ty (tối đa 255 ký tự)"
                                    rows={5}
                                />
                                {errors.company_description && (
                                    <p className={styles.error}>{errors.company_description}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actions} data-aos="fade-up" data-aos-delay="500" style={{ zIndex: '-1' }}>
                    {activeTab > 1 && (
                        <button className={styles.backButton} onClick={() => setActiveTab(activeTab - 1)}>
                            Quay lại
                        </button>
                    )}
                    {activeTab < 3 ? (
                        <button className={styles.nextButton} onClick={handleNextTab}>
                            Tiếp tục
                        </button>
                    ) : (
                        <button
                            className={styles.nextButton}
                            onClick={handleSubmit}
                            style={{ borderRadius: '5rem' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Prossing...' : 'Đăng ký tuyển dụng'}
                        </button>
                    )}
                </div>

                <div className={styles.footer_leftSection}>
                    <span>
                        Bạn đã có tài khoản? <a href="/v2/login">Đăng nhập</a>
                    </span>
                    <span></span>
                </div>
            </div>

            <div className={styles.rightSection} data-aos="fade-left">
                <div className={styles.image_recruitment}>
                    <img src="/images/recruitment/photo-1741849409363-4365cd102438.avif" alt="Recruitment" />
                </div>
            </div>
        </div>
    );
}
