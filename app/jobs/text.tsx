'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import styles from './jobs.module.scss';
// import { PiDiamondsFour } from "react-icons/pi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faLocationPin, faEye, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { formatSalary } from '../Ultils/formatSalary';
import Jobs_Skeleton from './job_skeleton';

import { Job } from '../interface/Job';
import { toast } from 'react-toastify';
import { showToastError, showToastSuccess } from '../Ultils/toast';
const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

import { useHandleViewJob } from '../Ultils/hanle__viewJob';

function Jobs({ salary }: { salary: string }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [jobData, setJobData] = useState<Job[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const handleViewJob = useHandleViewJob();

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    //   Chuyển trang
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const skip = (currentPage - 1) * itemsPerPage;
                const take = itemsPerPage;

                const response = await fetch(`http://localhost:5000/jobs/job_skip?skip=${skip}&take=${take}`);
                const data = await response.json();

                setJobData(data.data);
                setTotalItems(data.totalItems);
                setLoading(false);
            } catch (err) {
                setError('Có lỗi xảy ra khi lấy dữ liệu');
                setLoading(false);
            }
        };

        fetchAllJobs();
    }, [currentPage]);

    const [filteredJobsType, setFilteredJobsType] = useState<Job[]>([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    // search job by type
    const [allJobData, setAllJobData] = useState<Job[]>([]);
    const [jobLevels, setJobLevels] = useState<string[]>([]);
    const [jobIndustry, setJobIndustry] = useState<string[]>([]);
    const [jobExperience, setJobExperience] = useState<string[]>([]);
    const [jobTypesWorkAt, setJobTypesWorkAt] = useState<string[]>([]);
    const [jobTypesDistrict, setJobTypesDistrict] = useState<string[]>([]);
    const [selectedCompanyField, setSelectedCompanyField] = useState('');
    const [techStack, setTechStack] = useState<string[]>([]);

    // select type
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [selectedJobExperience, setSelectedJobExperience] = useState('');
    const [selectedWorkAt, setSelectedWorkAt] = useState('');
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [fromSalary, setFromSalary] = useState('');
    const [toSalary, setToSalary] = useState('');

    useEffect(() => {
        const fechAllJobsFilter = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}/jobs/all-jobsTypes`);
                const result = await response.json();
                console.log('result: ', result);
                if (response.ok) {
                    const sortedJobs = (result.data.jobs || []).sort(
                        (a: any, b: any) => new Date(a.create_at).getTime() - new Date(b.create_at).getTime()
                    );

                    setAllJobData(sortedJobs);
                    setJobLevels(result.data.category.jobLevels || []);
                    setTechStack(result.data.category.TechStack || []);
                    setJobIndustry(result.data.category.jobIndustries || []);
                    setJobExperience(result.data.category.Experience || []);
                    setJobTypesWorkAt(result.data.category.jobTypesWorkAt || []);
                    setJobTypesDistrict(result.data.category.jobDistrict || []);
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

        fechAllJobsFilter();
    }, []);

    const handleSearch = () => {
        const filteredJobs = allJobData.filter((job) => {
            // Existing filters
            const matchesJobLevel = selectedJobType === '' || job.jobLevel.name.includes(selectedJobType);
            const matchesExperience =
                selectedJobExperience === '' || job.generalInformation.experience.includes(selectedJobExperience);
            const matchesWorkAt =
                selectedWorkAt === '' ||
                (Array.isArray(job.jobType.work_at) &&
                    job.jobType.work_at.some((workAt) => workAt.toLowerCase() === selectedWorkAt.toLowerCase()));

            const matchesTechStack =
                techStack.length === 0 ||
                techStack.some((tech) =>
                    job.generalInformation.tech_stack.some((skill) => skill.toLowerCase().includes(tech.toLowerCase()))
                );

            // Salary filtering logic
            // const salaryFilter = () => {
            //     // Nếu không chọn khoảng lương, trả về true
            //     if (!fromSalary || !toSalary) return true;

            //     // Kiểm tra nếu là dạng "Tr" và nhân với 1,000,000
            //     const from = currency === 'Tr' ? parseFloat(fromSalary) * 1000000 : parseFloat(fromSalary);
            //     const to = currency === 'Tr' ? parseFloat(toSalary) * 1000000 : parseFloat(toSalary);

            //     // Lọc lương cho VND
            //     if (currency === 'Tr') {
            //         // Kiểm tra nếu lương trong khoảng từ và đến
            //         if (job.salary_from > 1000000 && job.salary_to > 1000000) {
            //             return job.salary_from >= from && job.salary_to <= to;
            //         }
            //         return false;
            //     } else {
            //         // Kiểm tra nếu lương trong khoảng từ và đến cho USD
            //         if (job.salary_from < 1000000 && job.salary_to < 1000000) {
            //             return job.salary_from >= from && job.salary_to <= to;
            //         }
            //         return false;
            //     }
            // };

            // Combine all filters
            return matchesJobLevel && matchesTechStack && matchesExperience && matchesWorkAt;
        });

        if (filteredJobs.length === 0) {
            showToastError('Không tìm thấy công việc phù hợp!');
        }

        setFilteredJobsType(filteredJobs);
    };

    const handleTechStackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTechStack([event.target.value]);
    };

    const handleAdvancedFilterToggle = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
        setPopupOpen(false);
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

    const handleClearAll = () => {
        setTechStack(['']);
        setSelectedJobType('');
        setSelectedJobExperience('');
        setSelectedWorkAt('');
        setSelectedCompanyField('');
        setTechStack([]);
        setFilteredJobsType([]);
        setFromSalary('');
        setToSalary('');
        showToastSuccess('All filters cleared!');
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <section className={styles.job + ' marTop'}>
            <div className={styles['filter-job']}>
                <section className={styles['navigation-search']}>
                    <div className={styles['box-input']}>
                        <input type="text" onChange={handleTechStackChange} placeholder="Tìm kiếm các ngành nghề..." />
                    </div>

                    <div className={styles['box-select']}>
                        <select value={selectedDistrict}>
                            <option value="">Tất cả</option>
                            {jobTypesDistrict?.map((district) => (
                                <option key={district} value={district}>
                                    {district}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className={styles['btn-find']}>Tìm việc</button>
                </section>
            </div>

            <section className={styles['job-container']}>
                <div className={styles['header-searchByCriteria']}>
                    <h3>
                        <p>{totalItems} Việc làm phù hợp</p> Tất cả
                    </h3>
                </div>

                <div className={styles['filter-searchByCriteria']}>
                    <div className={styles['filter']}>
                        <select value={selectedDistrict}>
                            <option value="">Tất cả</option>
                            {jobTypesWorkAt?.map((workAt) => (
                                <option key={workAt} value={workAt}>
                                    {workAt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles['filter']}>
                        <select value={selectedDistrict}>
                            <option value="">Tất cả</option>
                            {jobLevels?.map((levels) => (
                                <option key={levels} value={levels}>
                                    {levels}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles['filter']}>
                        <select value={selectedDistrict}>
                            <option value="">Tất cả</option>
                            {jobExperience?.map((experience) => (
                                <option key={experience} value={experience}>
                                    {experience}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{display: 'flex', gap: '2rem'}}>
                        <div className={styles['select__money']}>
                            <select value={selectedDistrict}>
                                <option value="VND">VND</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>

                        <div className={styles['filter']}>
                            <input type="text" placeholder="Từ" />
                            <span className={styles['ant-input-number-group-addon']}>VNĐ</span>
                        </div>

                        <div className={styles['filter']}>
                            <input type="text" placeholder="Đến" />
                            <span className={styles['ant-input-number-group-addon']}>VNĐ</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles['job-wrapperContainer']}>
                <div className={styles['Container']}>
                    {loading
                        ? Jobs_Skeleton()
                        : jobData.map((item) => (
                              <div onClick={() => handleViewJob(item.jobId)} className={styles['box']} key={item.jobId}>
                                  <FontAwesomeIcon className={styles['whislist']} icon={faHeart} />
                                  <span className={styles['tag-rank']}>{/* <PiDiamondsFour /> Pro */}</span>

                                  <div className={styles['company-logo']}>
                                      <img src={item.company.images[0]?.image_company} alt={item.company.name} />
                                  </div>
                                  <div className={styles['info']}>
                                      <div className={styles['job-info']}>
                                          <h3 className={styles['company-name']} title={item.title}>
                                              {item.title}
                                          </h3>
                                      </div>
                                      <div className={styles['group']} title={item.company.name}>
                                          {item.company.name}
                                      </div>
                                      <div className={styles['Salary-Negotiable']}>
                                          {item.salary_from === 0 || item.salary_to === 0 ? (
                                              <span className={styles['Salary-from']}>Thỏa thuận</span>
                                          ) : (
                                              <>
                                                  <span className={styles['Salary']}>{formatSalary(item.salary)}</span>
                                              </>
                                          )}
                                      </div>
                                      <div className={styles['job-content-bottom']}>
                                          <div className={styles['job-content-bottom-tag']}>
                                              <div
                                                  className={styles['location']}
                                                  title={item.workLocation.district.name}
                                              >
                                                  <FontAwesomeIcon icon={faLocationPin} />{' '}
                                                  {item.workLocation.district.name}
                                              </div>
                                              <div className={styles['views-box']}>
                                                  <FontAwesomeIcon icon={faEye} /> {item.view}
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                </div>

                {/* Phân trang */}
                <div className={styles['pagination']}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <span>
                        {currentPage} / {totalPages} Trang
                    </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </section>
        </section>
    );
}

export default Jobs;
