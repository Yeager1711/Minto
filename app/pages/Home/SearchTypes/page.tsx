import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';

import { showToastError, showToastSuccess } from '../../../Ultils/toast';
import styles from './SearchTypes.module.scss';
import 'aos/dist/aos.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { CiLocationOn } from 'react-icons/ci';

import { formatSalary } from '../../../Ultils/formatSalary';

import { Job } from '../../../interface/Job';
import { toast } from 'react-toastify';

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const SearchTypes = () => {
    const router = useRouter();
    // Job by types
    const [allJobData, setAllJobData] = useState<Job[]>([]);
    const [jobLevels, setJobLevels] = useState<string[]>([]);
    const [jobIndustry, setJobIndustry] = useState<string[]>([]);
    const [jobExperience, setJobExperience] = useState<string[]>([]);
    const [jobTypesWorkAt, setJobTypesWorkAt] = useState<string[]>([]);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
    const [selectedCompanyField, setSelectedCompanyField] = useState('');

    const [filteredJobsType, setFilteredJobsType] = useState<Job[]>([]);

    const [currentPage_Type, setCurrentPage_Type] = useState(1);
    const [totalPages_Type, setTotalPages_Type] = useState(1);

    const [selectedJobType, setSelectedJobType] = useState('');
    const [selectedJobExperience, setSelectedJobExperience] = useState('');
    const [selectedWorkAt, setSelectedWorkAt] = useState('');
    const [techStack, setTechStack] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPopupOpen, setPopupOpen] = useState(false);
    const [fromSalary, setFromSalary] = useState('');
    const [toSalary, setToSalary] = useState('');

    const handleApply = () => {
        console.log('Mức lương từ:', fromSalary);
        console.log('Mức lương đến:', toSalary);
        setPopupOpen(false); // Đóng popup
    };

    const itemsPerPage_Type = 9;
    // Cập nhật danh sách phân trang
    const jobsToDisplay =
        Array.isArray(filteredJobsType) && filteredJobsType.length > 0
            ? filteredJobsType
            : Array.isArray(allJobData)
              ? allJobData
              : [];

    // Tính tổng số trang
    useEffect(() => {
        setTotalPages_Type(Math.ceil(jobsToDisplay.length / itemsPerPage_Type));
        console.log('Total jobs:', jobsToDisplay.length / itemsPerPage_Type);
    }, [jobsToDisplay, itemsPerPage_Type]);

    // Lấy dữ liệu phân trang
    const paginatedJobs = Array.isArray(jobsToDisplay)
        ? jobsToDisplay.slice((currentPage_Type - 1) * itemsPerPage_Type, currentPage_Type * itemsPerPage_Type)
        : [];
    // Xử lý khi thay đổi trang
    const handlePageChange_Types = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages_Type) {
            setCurrentPage_Type(newPage);
        }
    };

    const handleSearch = () => {
        const filteredJobs = allJobData.filter((job) => {
            const matchesJobLevel = selectedJobType === '' || job.jobLevel.name.includes(selectedJobType);
            const matchesExperience = selectedJobExperience === '' || job.generalInformation.experience.includes(selectedJobExperience);
            const matchesWorkAt = selectedWorkAt === '' || job.jobType.work_at.includes(selectedWorkAt);

            const matchesTechStack =
                techStack.length === 0 ||
                techStack.some((tech) =>
                    job.generalInformation.tech_stack.some((skill) => skill.toLowerCase().includes(tech.toLowerCase()))
                );

            return matchesJobLevel && matchesTechStack && matchesExperience && matchesWorkAt;
        });

        if (filteredJobs.length === 0) {
            showToastError('Không tìm thấy công việc phù hợp!');
        }

        setFilteredJobsType(filteredJobs);
    };

    const handleTechStackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTechStack([event.target.value]); // Lưu tech stack vào state
    };

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}/jobs/all-jobsTypes`);
                const result = await response.json();
                console.log('result: ', result);

                if (response.ok) {
                    setAllJobData(result.data.jobs || []);
                    setJobLevels(result.data.category.jobLevels || []);
                    setTechStack(result.data.category.TechStack || []);
                    setJobIndustry(result.data.category.jobIndustries || []);
                    setJobExperience(result.data.category.Experience || []);
                    setJobTypesWorkAt(result.data.category.jobTypesWorkAt || []);
                } else {
                    setError('Failed to fetch job types');
                    console.error('Response not OK:', result);
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi lấy dữ liệu');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllJobs();
    }, []);

    const handleAdvancedFilterToggle = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    const handleJobTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedJobType(event.target.value);
    };

    const handleJobExperience = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedJobExperience(event.target.value);
    };

    const handleJobTypesWorkAt = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWorkAt(event.target.value);
    };

    const handleCompanyFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCompanyField(event.target.value);
    };

    return (
        <section className={styles.jobByTypes}>
            <h2>Tìm kiếm công việc theo loại</h2>
            <div className={styles.wrapper_list__jobTypes}>
                <div className={styles.list__item}>
                    <div className={`${styles.header} ${showAdvancedFilters ? styles.expanded : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div>
                                <h3>Việc làm theo</h3>
                            </div>
                            <div className={styles.box__field__list}>
                                <div className={styles.selection__items__techStack}>
                                    <div className={styles.input__TechStack}>
                                        <input
                                            type="text"
                                            placeholder="Java, JavaScript, C#, PHP ..."
                                            onChange={handleTechStackChange}
                                        />
                                    </div>
                                </div>
                                <div className={styles.btn__search} onClick={handleSearch}>
                                    Tìm kiếm
                                </div>
                                <div className={styles.btn__advanced} onClick={handleAdvancedFilterToggle}>
                                    Tìm kiếm nâng cao {' '}
                                    <FontAwesomeIcon icon={showAdvancedFilters ? faChevronUp : faChevronDown} />
                                </div>
                            </div>
                        </div>
                        {showAdvancedFilters && (
                            <div className={`${styles.advancedFilters} ${showAdvancedFilters ? styles.visible : ''}`}>
                                <div className={styles.filterItem}>
                                    <label>Vị trí</label>
                                    <select onChange={handleJobTypeChange}>
                                        <option value="">Tất cả</option>
                                        {jobLevels?.map((level) => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.filterItem}>
                                    <label>Kinh nghiệm</label>
                                    <select onChange={handleJobExperience}>
                                        <option value="">Tất cả</option>
                                        {jobExperience?.map((experience) => (
                                            <option key={experience} value={experience}>
                                                {experience}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.filterItem__salary}>
                                    <label>Mức lương</label>
                                    <div className={styles.dropdown} onClick={() => setPopupOpen(!isPopupOpen)}>
                                        <span>Chọn mức lương</span>
                                    </div>

                                    {isPopupOpen && (
                                        <div className={styles.popup}>
                                            <div className={styles.flex__input}>
                                                <div className={styles.inputGroup}>
                                                    <input
                                                        type="number"
                                                        value={fromSalary}
                                                        onChange={(e) => setFromSalary(e.target.value)}
                                                        placeholder="Từ"
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <input
                                                        type="number"
                                                        value={toSalary}
                                                        onChange={(e) => setToSalary(e.target.value)}
                                                        placeholder="Đến"
                                                    />
                                                </div>

                                                <span>Triệu</span>
                                            </div>
                                            <button className={styles.applyButton} onClick={handleApply}>
                                                Áp dụng
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.filterItem}>
                                    <label>Hình thức làm việc</label>
                                    <select onChange={handleJobTypesWorkAt}>
                                        <option value="">Tất cả</option>
                                        {jobTypesWorkAt?.map((workAt) => (
                                            <option key={workAt} value={workAt}>
                                                {workAt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.filterItem}>
                                    <label>Lĩnh vực công ty</label>
                                    <select onChange={handleCompanyFieldChange}>
                                        <option value="">Tất cả</option>
                                        {jobIndustry?.map((industry) => (
                                            <option key={industry} value={industry}>
                                                {industry}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.container}>
                        {loading ? (
                            <div>Đang tải dữ liệu...</div> 
                        ) : paginatedJobs.length > 0 ? (
                            paginatedJobs.map((job) => (
                                <div
                                    onClick={() => router.push(`/jobs/job_details/${job.jobId}`)}
                                    className={styles.job}
                                    key={job.jobId}
                                >
                                    <div className={styles.image__logo}>
                                        <img src={job.company.images[0]?.image_company} alt={job.company.name} />
                                    </div>

                                    <div className={styles.content}>
                                        <h3 title={job.title}>{job.title}</h3>
                                        <span className={styles.name__company} title={job.company.name}>
                                            {job.company.name}
                                        </span>
                                        <span className={styles.positon}>{job.jobLevel.name.join(' - ')}</span>
                                        <span className={styles.salary}>
                                            {job.salary_from === 0 || job.salary_to === 0 ? (
                                                <>Thỏa thuận</>
                                            ) : (
                                                <>{formatSalary(job.salary)}</>
                                            )}
                                        </span>

                                        <span className={styles.district} title={job.workLocation.address_name}>
                                            <CiLocationOn />
                                            {job.workLocation.address_name}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Không có công việc nào!</p>
                        )}
                    </div>
                    <div className={styles.pagination}>
                        <button
                            onClick={() => handlePageChange_Types(currentPage_Type - 1)}
                            disabled={currentPage_Type === 1}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span>
                            {currentPage_Type} / {totalPages_Type} Trang
                        </span>
                        <button
                            onClick={() => handlePageChange_Types(currentPage_Type + 1)}
                            disabled={currentPage_Type === totalPages_Type}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default SearchTypes;
