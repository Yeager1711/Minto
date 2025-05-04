'use client';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './PostJob.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { RecruitmentInfo } from 'app/interface/Recruitment';
import { useApi } from 'app/lib/apiConentext/ApiContext';
import { showToastError } from 'app/Ultils/toast';
import { JobData } from 'app/interface/JobData';

// Utility function to parse input (remove dots and convert to number)
const parseSalaryInput = (value: string): number => {
    const cleaned = value.replace(/\./g, '');
    return Number(cleaned) || 0;
};

// Utility function to format number to Vietnamese style (20.000.000)
const formatSalaryDisplay = (value: number): string => {
    return value.toLocaleString('vi-VN');
};

// Define unified job levels
const JOB_LEVELS = [
    { value: 'Intern', label: 'Intern / Thực tập sinh' },
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Mid-level', label: 'Mid-level' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Tech Lead', label: 'Tech Lead' },
    { value: 'Principal Engineer', label: 'Principal Engineer' },
    { value: 'Engineering Manager', label: 'Engineering Manager' },
    { value: 'Product Owner', label: 'Product Owner (PO)' },
    { value: 'Product Manager', label: 'Product Manager (PM)' },
    { value: 'Head of Engineering', label: 'Head of Engineering' },
    { value: 'Head of Product', label: 'Head of Product' },
    { value: 'CTO', label: 'Chief Technology Officer (CTO)' },
    { value: 'CPO', label: 'Chief Product Officer (CPO)' },
    { value: 'Nhân viên', label: 'Nhân viên' },
    { value: 'Trưởng phòng', label: 'Trưởng phòng' },
    { value: 'Trưởng/Phó phòng', label: 'Trưởng/Phó phòng' },
    { value: 'Quản lý / Giám sát', label: 'Quản lý / Giám sát' },
    { value: 'Trưởng chi nhánh', label: 'Trưởng chi nhánh' },
    { value: 'Phó giám đốc', label: 'Phó giám đốc' },
    { value: 'Giám đốc', label: 'Giám đốc' },
];

const DAYS_OF_WEEK = [
    { value: 'Thứ hai', label: 'Thứ hai' },
    { value: 'Thứ ba', label: 'Thứ ba' },
    { value: 'Thứ tư', label: 'Thứ tư' },
    { value: 'Thứ năm', label: 'Thứ năm' },
    { value: 'Thứ sáu', label: 'Thứ sáu' },
    { value: 'Thứ bảy', label: 'Thứ bảy' },
    { value: 'Chủ nhật', label: 'Chủ nhật' },
];

const PostJob: React.FC = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);
    const { postCompanyJob, fetchRecruitmentID } = useApi();
    const [companyId, setCompanyId] = useState<number | null>(null);

    // State to manage input fields
    const [jobTitle, setJobTitle] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [industryCompany, setIndustryCompany] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [experience, setExperience] = useState<string>('');
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [numHires, setNumHires] = useState<number>(1);

    const [salaryType, setSalaryType] = useState<string>('Thương lượng');
    const [salaryFrom, setSalaryFrom] = useState<number>(0);
    const [salaryTo, setSalaryTo] = useState<number>(0);
    const [salaryFromInput, setSalaryFromInput] = useState<string>('');
    const [salaryToInput, setSalaryToInput] = useState<string>('');

    const [jobDescriptions, setJobDescriptions] = useState<string[]>(['']);
    const [jobRequestment, setJobRequestment] = useState<string[]>(['']);
    const [jobBenefits, setJobBenefits] = useState<string[]>(['']);

    const [workMode, setWorkMode] = useState<string>('Remote');
    const [workType, setWorkType] = useState<string>('FullTime');
    const [workTimeFrom, setWorkTimeFrom] = useState<string>('');
    const [workTimeTo, setWorkTimeTo] = useState<string>('');
    const [workDayFrom, setWorkDayFrom] = useState<string>('');
    const [workDayTo, setWorkDayTo] = useState<string>('');
    const [workDaysError, setWorkDaysError] = useState<string>('');

    const [techStacks, setTechStacks] = useState<string[]>([]);
    const [currentTech, setCurrentTech] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        const fetchCompanyId = async () => {
            try {
                const recruitmentData = await fetchRecruitmentID();
                setCompanyId(recruitmentData.company.companyId);
                const address = recruitmentData.company.workLocations[0]?.address_name || '';
                setLocation(address);
                const industryCompany = recruitmentData.company.companyIndustries[0].name || '';
                setIndustryCompany(industryCompany);
            } catch (error) {
                console.error('Error fetching companyId:', error);
            }
        };
        fetchCompanyId();
    }, [fetchRecruitmentID]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        // Kiểm tra các trường bắt buộc
        if (!jobTitle) {
            newErrors.jobTitle = 'Vui lòng nhập tiêu đề công việc.';
        }
        if (selectedLevels.length === 0) {
            newErrors.selectedLevels = 'Vui lòng chọn ít nhất một cấp bậc.';
        }
        if (!experience) {
            newErrors.experience = 'Vui lòng chọn mức kinh nghiệm tối thiểu.';
        }
        if (!gender) {
            newErrors.gender = 'Vui lòng chọn yêu cầu giới tính.';
        }
        if (numHires < 1) {
            newErrors.numHires = 'Vui lòng nhập số lượng cần tuyển (tối thiểu 1).';
        }
        if (jobDescriptions.every((desc) => !desc.trim())) {
            newErrors.jobDescriptions = 'Vui lòng nhập ít nhất một mô tả công việc.';
        }
        if (jobRequestment.every((req) => !req.trim())) {
            newErrors.jobRequestment = 'Vui lòng nhập ít nhất một yêu cầu ứng viên.';
        }
        if (jobBenefits.every((ben) => !ben.trim())) {
            newErrors.jobBenefits = 'Vui lòng nhập ít nhất một phúc lợi.';
        }
        if (salaryType === 'Từ - Đến' && (!salaryFrom || !salaryTo)) {
            newErrors.salary = 'Vui lòng nhập mức lương Từ và Đến.';
        }
        if (salaryType === 'Up to' && !salaryTo) {
            newErrors.salary = 'Vui lòng nhập mức lương tối đa.';
        }
        if (!workTimeFrom || !workTimeTo) {
            newErrors.workTime = 'Vui lòng nhập thời gian làm việc.';
        }
        if (!workDayFrom || !workDayTo) {
            newErrors.workDays = 'Vui lòng chọn ngày làm việc.';
        }
        if (workDayFrom && workDayTo) {
            const dayOrder = DAYS_OF_WEEK.map((day) => day.value);
            if (dayOrder.indexOf(workDayTo) < dayOrder.indexOf(workDayFrom)) {
                newErrors.workDays = 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.';
            }
        }
        if (!companyId) {
            newErrors.companyId = 'Không thể xác định công ty. Vui lòng đăng nhập lại.';
        }
        if (!deadline) {
            newErrors.deadline = 'Vui lòng chọn hạn nộp hồ sơ.';
        } else {
            const today = new Date().toISOString().split('T')[0]; // Ngày hiện tại dạng YYYY-MM-DD
            if (deadline < today) {
                newErrors.deadline = 'Hạn nộp hồ sơ phải từ hôm nay trở đi.';
            }
        }

        // Nếu có lỗi, cập nhật state và dừng xử lý
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Xóa thông báo lỗi và tiếp tục gửi dữ liệu
        setErrors({});
        const jobData: JobData = {
            title: jobTitle,
            companyId: companyId!, // Use non-null assertion since we checked !companyId above
            address_name: location,
            district_name: location.split(',').pop()?.trim() || 'Unknown',
            gender,
            experience,
            levels: selectedLevels,
            numHires,
            salaryType,
            salaryFrom,
            salaryTo,
            descriptions: jobDescriptions
                .filter((desc) => desc.trim())
                .map((desc) => `- ${desc}`)
                .join('\n'),
            requirements: jobRequestment
                .filter((req) => req.trim())
                .map((req) => `- ${req}`)
                .join('\n'),
            benefits: jobBenefits
                .filter((ben) => ben.trim())
                .map((ben) => `- ${ben}`)
                .join('\n'),
            jobIndustry: industryCompany,
            work_at: workMode,
            work_at_name: workType,
            workTime:
                workDayFrom && workDayTo && workTimeFrom && workTimeTo
                    ? `${workDayFrom} - ${workDayTo} (${workTimeFrom} - ${workTimeTo})`
                    : 'undetermined',
            techStacks,
            deadline,
        };

        try {
            await postCompanyJob(jobData);
        } catch (error) {
            console.error('Lỗi khi đăng tin tuyển dụng:', error);
            setErrors({ submit: 'Đăng tin tuyển dụng thất bại. Vui lòng thử lại.' });
        }
    };

    // Handle adding a new input field
    const handleAddDescription = () => {
        setJobDescriptions([...jobDescriptions, '']);
    };

    const handleAddRequesment = () => {
        setJobRequestment([...jobRequestment, '']);
    };

    const handleAddBenefit = () => {
        setJobBenefits([...jobBenefits, '']);
    };

    // Handle deleting an input field
    const handleDeleteDescription = (index: number) => {
        if (jobDescriptions.length > 1) {
            const updatedDescriptions = jobDescriptions.filter((_, i) => i !== index);
            setJobDescriptions(updatedDescriptions);
        }
    };

    const handleDeleteRequirement = (index: number) => {
        if (jobRequestment.length > 1) {
            const updatedRequirements = jobRequestment.filter((_, i) => i !== index);
            setJobRequestment(updatedRequirements);
        }
    };

    const handleDeleteBenefit = (index: number) => {
        if (jobBenefits.length > 1) {
            const updatedBenefits = jobBenefits.filter((_, i) => i !== index);
            setJobBenefits(updatedBenefits);
        }
    };

    // Handle input changes
    const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJobTitle(e.target.value);
    };

    const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGender(e.target.value);
    };

    const handleExperienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setExperience(e.target.value);
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
        setSelectedLevels([...new Set(selectedOptions)]); // Remove duplicates
    };

    const handleDeleteLevel = (levelToRemove: string) => {
        setSelectedLevels(selectedLevels.filter((level) => level !== levelToRemove));
    };

    const handleNumHiresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 1) {
            setNumHires(value);
        }
    };

    const handleWorkDayFromChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newWorkDayFrom = e.target.value;
        setWorkDayFrom(newWorkDayFrom);

        if (newWorkDayFrom && workDayTo) {
            const dayOrder = DAYS_OF_WEEK.map((day) => day.value);
            const fromIndex = dayOrder.indexOf(newWorkDayFrom);
            const toIndex = dayOrder.indexOf(workDayTo);

            if (fromIndex === toIndex) {
                setWorkDaysError('Ngày bắt đầu và kết thúc không được trùng nhau.');
            } else if (toIndex < fromIndex) {
                setWorkDaysError('Ngày kết thúc phải sau ngày bắt đầu.');
            } else {
                setWorkDaysError('');
            }
        } else {
            setWorkDaysError('');
        }
    };

    const handleWorkDayToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newWorkDayTo = e.target.value;
        setWorkDayTo(newWorkDayTo);

        if (workDayFrom && newWorkDayTo) {
            const dayOrder = DAYS_OF_WEEK.map((day) => day.value);
            const fromIndex = dayOrder.indexOf(workDayFrom);
            const toIndex = dayOrder.indexOf(newWorkDayTo);

            if (fromIndex === toIndex) {
                setWorkDaysError('Ngày bắt đầu và kết thúc không được trùng nhau.');
            } else if (toIndex < fromIndex) {
                setWorkDaysError('Ngày kết thúc phải sau ngày bắt đầu.');
            } else {
                setWorkDaysError('');
            }
        } else {
            setWorkDaysError('');
        }
    };

    const handleDescriptionChange = (index: number, value: string) => {
        const updatedDescriptions = [...jobDescriptions];
        updatedDescriptions[index] = value;
        setJobDescriptions(updatedDescriptions);
    };

    const handleRequirementChange = (index: number, value: string) => {
        const updatedRequirements = [...jobRequestment];
        updatedRequirements[index] = value;
        setJobRequestment(updatedRequirements);
    };

    const handleBenefitChange = (index: number, value: string) => {
        const updatedBenefits = [...jobBenefits];
        updatedBenefits[index] = value;
        setJobBenefits(updatedBenefits);
    };

    const handleSalaryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSalaryType(e.target.value);
        setSalaryFrom(0);
        setSalaryTo(0);
        setSalaryFromInput('');
        setSalaryToInput('');
    };

    const handleSalaryFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\./g, '');
        const parsedValue = parseSalaryInput(rawValue);
        setSalaryFrom(parsedValue);
        setSalaryFromInput(formatSalaryDisplay(parsedValue));
    };

    const handleSalaryToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\./g, '');
        const parsedValue = parseSalaryInput(rawValue);
        setSalaryTo(parsedValue);
        setSalaryToInput(formatSalaryDisplay(parsedValue));
    };

    const handleWorkModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setWorkMode(e.target.value);
    };

    const handleWorkTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setWorkType(e.target.value);
    };

    const handleWorkTimeFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWorkTimeFrom(e.target.value);
    };

    const handleWorkTimeToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWorkTimeTo(e.target.value);
    };

    const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCurrentTech(value);
        if (value.endsWith(',')) {
            const newTech = value.slice(0, -1).trim();
            if (newTech) {
                setTechStacks([...techStacks, newTech]);
                setCurrentTech('');
            }
        }
    };

    const handleDeleteTechStack = (index: number) => {
        const updatedTechStacks = techStacks.filter((_, i) => i !== index);
        setTechStacks(updatedTechStacks);
    };

    const handleTechStackKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTech.trim()) {
            setTechStacks([...techStacks, currentTech.trim()]);
            setCurrentTech('');
        }
    };

    const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeadline(e.target.value);
    };

    // Format salary for display in preview
    const formatSalary = () => {
        if (salaryType === 'Thương lượng') return 'Thương lượng';
        if (salaryType === 'Up to') return `Lên đến ${salaryTo.toLocaleString('vi-VN')} VNĐ`;
        return `Từ ${salaryFrom.toLocaleString('vi-VN')} đến ${salaryTo.toLocaleString('vi-VN')} VNĐ`;
    };

    const isSalaryFromDisabled = salaryType === 'Thương lượng' || salaryType === 'Up to';
    const isSalaryToDisabled = salaryType === 'Thương lượng';

    return (
        <section className={styles.PostJob}>
            <div className={styles.PostJob_container}>
                <h2>Đăng tin tuyển dụng</h2>
                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>Tiêu đề công việc *</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Tuyển dụng vị trí ...."
                            value={jobTitle}
                            onChange={(e) => {
                                setJobTitle(e.target.value);
                                setErrors((prev) => ({ ...prev, jobTitle: '' })); // Xóa lỗi khi người dùng nhập
                            }}
                        />
                    </div>
                    {errors.jobTitle && <p className={styles.error_message}>{errors.jobTitle}</p>}
                </div>

                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>Địa điểm làm việc (Mặc định)</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Tòa 11, Đoàn Văn Bơ, Quận 4, Thành phố Hồ Chí Minh ...."
                            value={location}
                            disabled
                        />
                    </div>
                </div>

                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>Lĩnh vực công ty (Mặc định)</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Tòa 11, Đoàn Văn Bơ, Quận 4, Thành phố Hồ Chí Minh ...."
                            value={industryCompany}
                            disabled
                        />
                    </div>
                </div>

                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>Yêu cầu giới tính *</label>
                        <select
                            name="gender"
                            className={styles.modalInput}
                            value={gender}
                            onChange={(e) => {
                                handleGenderChange(e);
                                setErrors((prev) => ({ ...prev, gender: '' }));
                            }}
                        >
                            <option value="" disabled>
                                Chọn giới tính (nếu cần)
                            </option>
                            <option value="Không yêu cầu">Không yêu cầu</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                    </div>
                    {errors.gender && <p className={styles.error_message}>{errors.gender}</p>}
                </div>

                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>Cấp bậc * (Giữ Ctrl/Cmd để chọn nhiều)</label>
                        <div className={styles.level_container}>
                            <select
                                name="level"
                                className={styles.modalInput}
                                multiple
                                value={selectedLevels}
                                onChange={(e) => {
                                    handleLevelChange(e);
                                    setErrors((prev) => ({ ...prev, selectedLevels: '' }));
                                }}
                                size={5}
                            >
                                {JOB_LEVELS.map((jobLevel) => (
                                    <option key={jobLevel.value} value={jobLevel.value}>
                                        {jobLevel.label}
                                    </option>
                                ))}
                            </select>
                            <div className={styles.level_tags}>
                                {selectedLevels.map((level, index) => (
                                    <div className={styles.level_tag} key={`level-${index}`}>
                                        <span>{JOB_LEVELS.find((jl) => jl.value === level)?.label || level}</span>
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            onClick={() => handleDeleteLevel(level)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {errors.selectedLevels && <p className={styles.error_message}>{errors.selectedLevels}</p>}
                    </div>
                </div>

                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>Yêu cầu kinh nghiệm tối thiểu *</label>
                        <select
                            name="experience"
                            className={styles.modalInput}
                            value={experience}
                            onChange={(e) => {
                                handleExperienceChange(e);
                                setErrors((prev) => ({ ...prev, experience: '' }));
                            }}
                        >
                            <option value="" disabled>
                                Chọn mức kinh nghiệm
                            </option>
                            <option value="Không yêu cầu kinh nghiệm">Không yêu cầu kinh nghiệm</option>
                            <option value="1 năm">1 năm</option>
                            <option value="2 năm">2 năm</option>
                            <option value="3 năm">3 năm</option>
                            <option value="4 năm">4 năm</option>
                            <option value="5 năm">5 năm</option>
                            <option value="Trên 5 năm">Trên 5 năm</option>
                        </select>
                        {errors.experience && <p className={styles.error_message}>{errors.experience}</p>}
                    </div>
                </div>

                <div className={styles.PostJob_box}>
                    <label>Số lượng cần tuyển *</label>
                    <input type="text" value={numHires} onChange={handleNumHiresChange} />
                </div>

                <div className={styles.PostJob_salary}>
                    <label>Mức lương (Triệu VNĐ/tháng) *</label>
                    <div className={styles.flex_salary}>
                        <select
                            name="salaryType"
                            value={salaryType}
                            onChange={handleSalaryTypeChange}
                            className={styles.modalInput}
                        >
                            <option value="Thương lượng">Thương lượng</option>
                            <option value="Từ - Đến">Từ - Đến</option>
                            <option value="Up to">Up to</option>
                        </select>
                        <div className={styles.salary_box}>
                            <div className={styles.salary_from}>
                                <span>Từ</span>
                                <input
                                    type="text"
                                    value={salaryFromInput}
                                    onChange={handleSalaryFromChange}
                                    disabled={isSalaryFromDisabled}
                                    placeholder="0"
                                />
                            </div>
                            <div className={styles.salary_to}>
                                <span>Đến</span>
                                <input
                                    type="text"
                                    value={salaryToInput}
                                    onChange={handleSalaryToChange}
                                    disabled={isSalaryToDisabled}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_container}>
                    <div className={styles.wrapper_container}>
                        <div className={styles.job_description__container}>
                            <h3>Mô tả công việc *</h3>
                            {jobDescriptions.map((description, index) => (
                                <div className={styles.box_input} key={`description-${index}`}>
                                    <input
                                        type="text"
                                        placeholder="Nhập mô tả công việc (dấu đầu dòng)"
                                        value={description}
                                        onChange={(e) => {
                                            handleDescriptionChange(index, e.target.value);
                                            setErrors((prev) => ({ ...prev, jobDescriptions: '' }));
                                        }}
                                    />
                                    <div className={styles.icon_container}>
                                        {index === jobDescriptions.length - 1 && (
                                            <FontAwesomeIcon
                                                icon={faPlus}
                                                onClick={handleAddDescription}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                        {jobDescriptions.length > 1 && (
                                            <FontAwesomeIcon
                                                icon={faXmark}
                                                onClick={() => handleDeleteDescription(index)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {errors.jobDescriptions && <p className={styles.error_message}>{errors.jobDescriptions}</p>}
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_container}>
                    <div className={styles.job_description__container}>
                        <h3>Yêu cầu ứng viên *</h3>
                        {jobRequestment.map((requirement, index) => (
                            <div className={styles.box_input} key={`requirement-${index}`}>
                                <input
                                    type="text"
                                    placeholder="Nhập yêu cầu ứng viên (dấu đầu dòng)"
                                    value={requirement}
                                    onChange={(e) => {
                                        handleRequirementChange(index, e.target.value);
                                        setErrors((prev) => ({ ...prev, jobRequestment: '' })); // Xóa lỗi khi nhập
                                    }}
                                />
                                <div className={styles.icon_container}>
                                    {index === jobRequestment.length - 1 && (
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            onClick={handleAddRequesment}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                    {jobRequestment.length > 1 && (
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            onClick={() => handleDeleteRequirement(index)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        {errors.jobRequestment && <p className={styles.error_message}>{errors.jobRequestment}</p>}
                    </div>
                </div>

                <div className={styles.wrapper_container}>
                    <div className={styles.job_description__container}>
                        <h3>Phúc lợi *</h3>
                        {jobBenefits.map((benefit, index) => (
                            <div className={styles.box_input} key={`benefit-${index}`}>
                                <input
                                    type="text"
                                    placeholder="Nhập phúc lợi (dấu đầu dòng)"
                                    value={benefit}
                                    onChange={(e) => {
                                        handleBenefitChange(index, e.target.value);
                                        setErrors((prev) => ({ ...prev, jobBenefits: '' })); // Xóa lỗi khi nhập
                                    }}
                                />
                                <div className={styles.icon_container}>
                                    {index === jobBenefits.length - 1 && (
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            onClick={handleAddBenefit}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                    {jobBenefits.length > 1 && (
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            onClick={() => handleDeleteBenefit(index)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        {errors.jobBenefits && <p className={styles.error_message}>{errors.jobBenefits}</p>}
                    </div>
                </div>

                <div className={styles.PostJob_typeJob}>
                    <label>Loại công việc *</label>
                    <div className={styles.flex_typeJob}>
                        <div className={styles.typeJob_box}>
                            <div className={styles.typeJob_from}>
                                <select
                                    name="workMode"
                                    className={styles.modalInput}
                                    value={workMode}
                                    onChange={handleWorkModeChange}
                                >
                                    <option value="Remote">Remote</option>
                                    <option value="In Office">In Office</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div className={styles.typeJob_to}>
                                <select
                                    name="workType"
                                    className={styles.modalInput}
                                    value={workType}
                                    onChange={handleWorkTypeChange}
                                >
                                    <option value="FullTime">FullTime</option>
                                    <option value="PartTime">PartTime</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.PostJob_workTime}>
                    <label>Thời gian làm việc *</label>
                    <div className={styles.flex_workTime}>
                        <div className={styles.workTime_box}>
                            <div className={styles.workDay_from}>
                                <span>Ngày bắt đầu</span>
                                <select
                                    name="workDayFrom"
                                    className={styles.modalInput}
                                    value={workDayFrom}
                                    onChange={handleWorkDayFromChange}
                                >
                                    <option value="" disabled>
                                        Chọn ngày
                                    </option>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <option key={day.value} value={day.value}>
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.workDay_to}>
                                <span>Ngày kết thúc</span>
                                <select
                                    name="workDayTo"
                                    className={styles.modalInput}
                                    value={workDayTo}
                                    onChange={handleWorkDayToChange}
                                >
                                    <option value="" disabled>
                                        Chọn ngày
                                    </option>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <option key={day.value} value={day.value}>
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {workDaysError && <p className={styles.error_message}>{workDaysError}</p>}
                        </div>
                        <div className={styles.workTime_box}>
                            <div className={styles.workTime_from}>
                                <span>Từ</span>
                                <input type="time" value={workTimeFrom} onChange={handleWorkTimeFromChange} />
                            </div>
                            <div className={styles.workTime_to}>
                                <span>Đến</span>
                                <input type="time" value={workTimeTo} onChange={handleWorkTimeToChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>TechStack (nếu có)</label>
                        <div className={styles.tech_stack_container}>
                            <input
                                type="text"
                                placeholder="Áp dụng với các nhóm ngành như CNTT, yêu cầu các ứng viên phù hợp với stack như: ReactJs, Javascript, Typescript, ...."
                                value={currentTech}
                                onChange={handleTechStackChange}
                                onKeyPress={handleTechStackKeyPress}
                            />
                            <div className={styles.tech_stack_tags}>
                                {techStacks.map((tech, index) => (
                                    <div className={styles.tech_stack_tag} key={`tech-${index}`}>
                                        <span>{tech}</span>
                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            onClick={() => handleDeleteTechStack(index)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.wrapper_box}>
                    <div className={styles.PostJob_box}>
                        <label>Hạn nộp Hồ sơ</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => {
                                handleDeadlineChange(e);
                                setErrors((prev) => ({ ...prev, deadline: '' }));
                            }}
                        />
                    </div>
                    {errors.deadline && <p className={styles.error_message}>{errors.deadline}</p>}
                </div>

                <div className={styles.submit_button}>
                    <button onClick={handleSubmit}>Đăng tin tuyển dụng</button>
                </div>
            </div>

            <div className={styles.quick_view}>
                <div className={styles.postion_img1}>
                    <svg width="412" height="130" viewBox="0 0 412 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M446.116 123.629C446.119 123.635 446.113 123.641 446.107 123.638C390.586 94.6806 315.718 93.4027 310.568 93.3488C310.366 93.3467 310.184 93.3436 309.982 93.3375C227.379 90.8637 159.982 62.0166 153.185 59.0181C152.779 58.8391 152.415 58.6865 152.002 58.5245C97.8553 37.2806 47.2625 0.452444 43.4134 -2.37688C43.2388 -2.50522 43.091 -2.61158 42.9135 -2.73577C33.9569 -8.99984 24.1749 -14.8417 14.6375 -20.0437C-3.93921 -30.176 -3.94475 -57.0273 16.1876 -63.1258C68.4513 -78.9576 154.597 -96.6899 250.599 -82.5096C250.9 -82.4652 251.124 -82.4351 251.426 -82.3984C260.804 -81.2562 444.36 -56.7159 470.854 117.326C472.228 126.308 462.579 132.685 454.416 128.172L446.125 123.62C446.119 123.617 446.113 123.623 446.116 123.629Z"
                            fill="url(#paint0_linear_29878_282335)"
                            fillOpacity="0.2"
                        ></path>
                        <defs>
                            <linearGradient
                                id="paint0_linear_29878_282335"
                                x1="289.315"
                                y1="-188.344"
                                x2="104.419"
                                y2="338.095"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#82DCFF"></stop>
                                <stop offset="0.32" stopColor="#D4E4FF"></stop>
                                <stop offset="0.76" stopColor="#0047CC"></stop>
                                <stop offset="1" stopColor="#002466"></stop>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className={styles.postion_img2}>
                    <svg width="313" height="295" viewBox="0 0 313 295" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M-79.8671 7.08921C-79.8661 7.08291 -79.8579 7.08077 -79.8553 7.0866C-49.8027 73.2259 45.5915 233.247 298.167 341.306C318.347 349.939 318.009 377.068 296.635 382.063C215.191 401.097 66.2578 415.619 -45.7692 310.704C-45.9381 310.546 -46.0552 310.438 -46.2261 310.282C-51.5496 305.424 -161.006 202.541 -102.484 8.38912C-99.3496 -2.08324 -84.4704 -2.94093 -79.8795 7.09059C-79.8768 7.09639 -79.8681 7.09551 -79.8671 7.08921Z"
                            fill="url(#paint0_linear_29878_282334)"
                            fillOpacity="0.2"
                        ></path>
                        <defs>
                            <linearGradient
                                id="paint0_linear_29878_282334"
                                x1="-97.2294"
                                y1="365.187"
                                x2="336.727"
                                y2="41.5518"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#002466"></stop>
                                <stop offset="0.114147" stopColor="#0047CC"></stop>
                                <stop offset="0.435625" stopColor="#D4E4FF"></stop>
                                <stop offset="1" stopColor="#82DCFF"></stop>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h2>Xem trước tin tuyển dụng</h2>
                <div className={styles.quick_view_content}>
                    <h4>{jobTitle || 'Chưa nhập tiêu đề'}</h4>
                    <p>
                        <strong>Địa điểm:</strong> {location || 'Chưa nhập'}
                    </p>
                    <p>
                        <strong>Giới tính:</strong> {gender || 'Chưa chọn'}
                    </p>
                    <p>
                        <strong>Kinh nghiệm:</strong> {experience || 'Chưa chọn'}
                    </p>
                    <p>
                        <strong>Cấp bậc:</strong>{' '}
                        {selectedLevels.length > 0
                            ? selectedLevels
                                  .map((level) => JOB_LEVELS.find((jl) => jl.value === level)?.label || level)
                                  .join(', ')
                            : 'Chưa chọn'}
                    </p>
                    <p>
                        <strong>Số lượng tuyển dụng:</strong> {numHires || 'Chưa nhập'}
                    </p>
                    <p>
                        <strong>Mức lương:</strong> {formatSalary()}
                    </p>
                    <div style={{ marginTop: '2.5rem' }}>
                        <strong>Mô tả công việc:</strong>
                        <ul>
                            {jobDescriptions.filter((desc) => desc.trim()).length > 0 ? (
                                jobDescriptions.map(
                                    (desc, index) => desc.trim() && <li key={`desc-${index}`}> - {desc}</li>
                                )
                            ) : (
                                <li>Chưa nhập</li>
                            )}
                        </ul>
                    </div>
                    <div style={{ marginTop: '2.5rem' }}>
                        <strong>Yêu cầu ứng viên:</strong>
                        <ul>
                            {jobRequestment.filter((req) => req.trim()).length > 0 ? (
                                jobRequestment.map((req, index) => req.trim() && <li key={`req-${index}`}> - {req}</li>)
                            ) : (
                                <li>Chưa nhập</li>
                            )}
                        </ul>
                    </div>
                    <div style={{ marginTop: '2.5rem' }}>
                        <strong>Phúc lợi:</strong>
                        <ul>
                            {jobBenefits.filter((ben) => ben.trim()).length > 0 ? (
                                jobBenefits.map((ben, index) => ben.trim() && <li key={`ben-${index}`}> - {ben}</li>)
                            ) : (
                                <li>Chưa nhập</li>
                            )}
                        </ul>
                    </div>
                    <p>
                        <strong>Loại công việc:</strong> {workMode} - {workType}
                    </p>
                    <p>
                        <strong>Thời gian làm việc:</strong>{' '}
                        {workTimeFrom && workTimeTo ? `${workTimeFrom} - ${workTimeTo}` : 'Chưa nhập'}
                    </p>
                    <div>
                        <strong>Tech Stack:</strong>
                        {techStacks.length > 0 ? (
                            <div className={styles.tech_stack_tags}>
                                {techStacks.map((tech, index) => (
                                    <span className={styles.tech_stack_tag} key={`tech-${index}`}>
                                        {tech}
                                        {index < techStacks.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p>Chưa nhập</p>
                        )}
                    </div>
                    <p>
                        <strong>Hạn nộp hồ sơ:</strong>{' '}
                        {deadline ? new Date(deadline).toLocaleDateString('vi-VN') : 'Chưa nhập'}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PostJob;
