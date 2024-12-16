'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from './styles/home.module.scss';
import 'aos/dist/aos.css';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Mousewheel, Keyboard, Autoplay } from 'swiper/modules';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { CiLocationOn } from 'react-icons/ci';

import ChartSection from './pages/Home/ChartSection/page';
import SearchTypes from './pages/Home/SearchTypes/page';
import OutstandingTool from './pages/Home/OutstandingTool/page';
import  OutstandingCompany from './pages/Home/OutstandingCompany/page'

import { formatSalary } from './Ultils/formatSalary';

import Home_Skeleton from './home_skeleton';

// Định nghĩa kiểu cho công việc
import { Job } from '../app/interface/Job';

import { useHandleViewJob } from './Ultils/hanle__viewJob';

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function Home() {
    const router = useRouter()
    const handleViewJob = useHandleViewJob();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [allJobData, setAllJobData] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    // func skip and take data
    const [totalItems, setTotalItems] = useState(0);
    const [totalItems_Type, setTotalItems_Type] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 12;

    // Tính toán số trang
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
                const response = await fetch(`${apiUrl}/jobs/all-jobs`);
                const data: { data: Job[]; totalItems: number } = await response.json();

                const sortedData = data.data.sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                setAllJobData(sortedData);
                setLoading(false);
            } catch (err) {
                setError('Có lỗi xảy ra khi lấy dữ liệu');
                setLoading(false);
            }
        };

        fetchAllJobs();
    }, []);

    useEffect(() => {
        const fetchJobsBySkip = async () => {
            try {
                const skip = (currentPage - 1) * itemsPerPage;
                const take = itemsPerPage;

                const response = await fetch(`${apiUrl}/jobs/job_skip?skip=${skip}&take=${take}`);

                if (!response.ok) throw new Error('API request failed');
                const data: { data: Job[]; totalItems: number } = await response.json();

                // Random hóa dữ liệu sau khi nhận từ API
                const sortedData = data.data.sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                setJobs(sortedData);
                setTotalItems(data.totalItems);
                setLoading(false);
            } catch (err) {
                setError('Có lỗi xảy ra khi lấy dữ liệu');
                setLoading(false);
            }
        };

        fetchJobsBySkip();
    }, [currentPage]);

    const handleSearch = () => {
        // Kiểm tra nếu không nhập gì và không chọn địa điểm
        if (!searchTerm.trim() && !selectedLocation) {
            setFilteredJobs([]);
            setIsExpanded(false);
            return;
        }

        let results = allJobData;

        // Lọc theo từ khóa nếu có
        if (searchTerm.trim()) {
            results = results.filter((job) => {
                const titleMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
                const jobLevelMatch = job.jobLevel.name.some((level) =>
                    level.toLowerCase().includes(searchTerm.toLowerCase())
                );
                return titleMatch || jobLevelMatch;
            });
        }

        // Lọc theo địa điểm nếu có
        if (selectedLocation) {
            results = results.filter((job) =>
                // Kiểm tra xem tên địa phương có chứa địa điểm đã chọn hay không
                job.workLocation.district.name.toLowerCase().includes(selectedLocation.toLowerCase())
            );
        }

        setFilteredJobs(results);
        setIsExpanded(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(e.target.value);
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={styles.Home}>
            {/* Banner Section */}
            <div className={styles['banner-image']}>
                <img src="/images/banner.jpg" alt="Banner" />

                <div className={styles['wrapper-content']}>
                    <div className={styles['search-infoWork']}>
                        <div className={styles['content']}>
                            <h2>
                                Tìm việc làm nhanh <span>24h</span>, việc làm mới nhất trên toàn quốc.
                            </h2>
                            <p>
                                Tiếp cận <span>40,000+</span> tuyển dụng việc làm mỗi ngày từ doanh nghiệp uy tín tại
                                Việt Nam
                            </p>
                        </div>

                        <div className={`${styles['find-work']} ${isExpanded ? styles['expand'] : ''}`}>
                            {/* Dynamically add 'expand' class */}
                            <div className={styles['flex-search']}>
                                <div className={styles['box-input']}>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm các ngành nghề..."
                                        value={searchTerm}
                                        onChange={handleInputChange}
                                        className={styles['search-input']}
                                    />
                                </div>
                                <div className={styles['box-select']}>
                                    <select onChange={handleLocationChange} className={styles['select-input']}>
                                        <option value="">Chọn địa điểm</option>
                                        <option value="Hồ Chí Minh">TP.Hồ Chí Minh</option>
                                        <option value="Hà Nội">Hà Nội</option>
                                        <option value="Đà Nẵng">TP.Đà Nẵng</option>
                                        <option value="Hải Phòng">TP.Hải Phòng</option>
                                        <option value="Cần Thơ">TP.Cần Thơ</option>
                                        <option value="Huế">TP.Huế</option>
                                        <option value="Nha Trang">TP.Nha Trang</option>
                                        <option value="Vũng Tàu">TP.Vũng Tàu</option>
                                        <option value="Buôn Ma Thuột">TP.Buôn Ma Thuột</option>
                                        <option value="Quy Nhơn">TP.Quy Nhơn</option>
                                    </select>
                                </div>
                                <div className={styles['btn-find']} onClick={handleSearch}>
                                    Tìm việc
                                </div>
                            </div>

                            <div className={styles['search-result__container']}>
                                {isExpanded && filteredJobs.length > 0 && (
                                    <span className={styles['search-result__total']}>
                                        Kết quả tìm kiếm: {filteredJobs.length}
                                    </span>
                                )}

                                {isExpanded && filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => (
                                        <Link
                                            href={`/jobs/job_details/${job.jobId}`}
                                            key={job.jobId}
                                            className={styles['search-result-item']}
                                        >
                                            <div className={styles['image-company__result']}>
                                                <img
                                                    src={job.company.images[0]?.image_company}
                                                    alt={job.company.name}
                                                />
                                            </div>
                                            <div className={styles['name-company__result']} title={job.title}>
                                                <span>{job.title}</span>
                                            </div>
                                            <div className={styles['location__result']}>
                                                <span>
                                                    {' '}
                                                    <CiLocationOn /> {job.workLocation.district.name}
                                                </span>
                                            </div>
                                            <div className={styles['salary__result']}>
                                                <span>
                                                    {job.salary_from === 0 || job.salary_to === 0 ? (
                                                        <>Thỏa thuận</>
                                                    ) : (
                                                        <>{formatSalary(job.salary)}</>
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : isExpanded ? (
                                    <div className={styles['no-result']}>Không tìm thấy công việc phù hợp !</div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Swiper Section for Companies */}
            <section className={styles['wrapper-home']}>
                <h3>
                    <p>Phổ Biến & Hàng Đầu</p> Công Ty Tuyển Dụng
                </h3>
                <div className={styles['wrapper-container']}>
                    <Swiper
                        cssMode={true}
                        navigation={true}
                        pagination={false}
                        mousewheel={true}
                        keyboard={true}
                        modules={[Navigation, Pagination, Mousewheel, Keyboard, Autoplay]}
                        className="mySwiper_companyslide"
                        slidesPerView={5}
                        spaceBetween={20}
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: false,
                        }}
                        breakpoints={{
                            320: { slidesPerView: 1 },
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                        }}
                    >
                        {Array.from(new Map(allJobData.map((job) => [job.company.name, job])).values()).map(
                            (company) => (
                                <SwiperSlide key={company.jobId}>
                                    <div className={styles['company']} title={company.company.name}>
                                        <div className={styles['img-company']}>
                                            <img
                                                src={company.company.images[0]?.image_company}
                                                alt={company.company.name}
                                            />
                                        </div>
                                        <div className={styles['content-company']}>
                                            <h3 className={styles['name-company']}>{company.company.name}</h3>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            )
                        )}
                    </Swiper>
                </div>
            </section>

            {/* Recruitment Section */}
            <section className={styles['wrapper-home']}>
                <div className={styles['header-recruitment']}>
                    <h3>
                        <p>Tuyển dụng</p> Việc Làm Tốt Nhất
                    </h3>
                </div>

                <div className={styles['recruitment-container']}>
                    {loading
                        ? Home_Skeleton()
                        : jobs.map((job) => (
                              <div
                                  onClick={() => router.push(`/jobs/job_details/${job.jobId}`)}
                                  className={styles['company']}
                                  key={job.jobId}
                                  style={{ cursor: 'pointer' }}
                              >
                                  <span className={styles['icon-views']}>
                                      <FontAwesomeIcon icon={faEye} />
                                      {job.view}
                                  </span>

                                  <div className={styles['img-company']}>
                                      <img src={job.company.images[0]?.image_company} alt={job.company.name} />
                                  </div>

                                  <div className={styles['content-company']}>
                                      <div className={styles['company-location']}>
                                          <h3 className={styles['title-company']} title={job.title}>
                                              {job.title}
                                          </h3>
                                          <span className={styles['name-company']} title={job.company.name}>
                                              {job.company.name}
                                          </span>

                                          <span className={styles['salary']} title={job.salary}>
                                              {job.salary_from === 0 || job.salary_to === 0 ? (
                                                  <>Thỏa thuận</>
                                              ) : (
                                                  <> {formatSalary(job.salary)}</>
                                              )}
                                          </span>

                                          <span className={styles['positon']}>
                                              <p> {job.jobLevel.name.join(', ')}</p>
                                          </span>
                                          <span className={styles['district']} title={job.workLocation.district.name}>
                                              <CiLocationOn />
                                              {job.workLocation.district.name}
                                          </span>
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

            <ChartSection />

            <SearchTypes />

            <OutstandingTool />

            <OutstandingCompany />
        </div>
    );
}

export default Home;
