'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from './styles/home.module.scss';
import 'aos/dist/aos.css';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Data from './Data/data'; // Assuming you have some mock data here

// Định nghĩa kiểu cho công việc
interface Job {
    jobId: number;
    title: string;
    salary_from: number;
    salary_to: number;
    company: {
        name: string;
        images: { image_company: string }[];
    };
    jobLevel: {
        jobLevelId: number;
        name: string[];
    };
    workLocation: {
        district: { name: string };
    };
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function Home() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const router = useRouter();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${apiUrl}/jobs/all-jobs`);
                const data = await response.json();
                const shuffledData = data.data.sort(() => Math.random() - 0.5);
                setJobs(shuffledData);
                setFilteredJobs(data.data);
                setLoading(false);
            } catch (err) {
                setError('Có lỗi xảy ra khi lấy dữ liệu');
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleSearch = () => {
        // Kiểm tra nếu không nhập gì và không chọn địa điểm
        if (!searchTerm.trim() && !selectedLocation) {
            setFilteredJobs([]);
            setIsExpanded(false);
            return;
        }

        let results = jobs;

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

    // panigation
    // Tính toán số trang
    const totalPages = Math.ceil(jobs.length / itemsPerPage);

    // Lấy dữ liệu cho trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = jobs.slice(startIndex, startIndex + itemsPerPage);

    //   Chuyển trang
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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
                            <h4>
                                Tìm việc làm nhanh <span>24h</span>, việc làm mới nhất trên toàn quốc.
                            </h4>
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
                                <button className={styles['btn-find']} onClick={handleSearch}>
                                    Tìm việc
                                </button>
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
                                                <span>{job.workLocation.district.name}</span>
                                            </div>
                                            <div className={styles['salary__result']}>
                                                <span>
                                                    {job.salary_from === 0 || job.salary_to === 0 ? (
                                                        <>Thỏa thuận</>
                                                    ) : (
                                                        <>
                                                            {job.salary_from}-{job.salary_to}Tr
                                                        </>
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
                    <p>Hàng Đầu & Phổ Biến</p> Công Ty Tuyển Dụng
                </h3>
                <div className={styles['wrapper-container']}>
                    <Swiper
                        cssMode={true}
                        navigation={true}
                        pagination={false}
                        mousewheel={true}
                        keyboard={true}
                        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
                        className="mySwiper"
                        slidesPerView={4}
                        spaceBetween={15}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                    >
                        {jobs.map((company) => (
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
                        ))}
                    </Swiper>
                </div>
            </section>

            {/* Recruitment Section */}
            <section className={styles['wrapper-home']}>
                <div className={styles['header-recruitment']}>
                    <h3>
                        <p>Tuyển dụng</p> Việc Làm Tốt Nhất
                    </h3>

                    {/* Phân trang */}
                    <div className={styles['pagination']}>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span>
                            {currentPage} / {totalPages}
                        </span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>

                <div className={styles['recruitment-container']}>
                    {currentData.map((job) => (
                        <div
                            onClick={() => router.push(`/jobs/job_details/${job.jobId}`)}
                            className={styles['company']}
                            key={job.jobId}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className={styles['icon-views']}>
                                <FontAwesomeIcon icon={faEye} />
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

                                    <div style={{ display: 'flex' }}>
                                        <span className={styles['positon']}>
                                            <p> {job.jobLevel.name.join(', ')}</p>
                                        </span>
                                        <span className={styles['district']} title={job.workLocation.district.name}>
                                            {job.workLocation.district.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Job Application Section */}
            <div className={styles['HomePage_findJobs']}>
                <div className={styles['image_HomePage_findJobs']}>
                    <img src="/images/banner-2.jpg" alt="Explore Jobs" />

                    <div className={styles['content_HomePage_findJobs']}>
                        <div>
                            <div className={styles['title']}>
                                Khám phá và ứng tuyển công việc một cách dễ dàng, nhanh chóng, và thuận tiện, giúp bạn
                                nắm bắt cơ hội sự nghiệp mọi lúc, mọi nơi.
                            </div>
                            <div className={styles['sub_title']}>
                                Đưa ra lựa chọn nghề nghiệp chính xác hơn thông qua các bài trắc nghiệm chuyên sâu về
                                tính cách, khả năng giải quyết vấn đề, và trí thông minh, giúp bạn khám phá thế mạnh của
                                mình một cách toàn diện.
                            </div>
                        </div>

                        <img src="/images/arrow.png" className={styles['img-arrow']} alt="Arrow" />
                        <button className={styles['Apply_now']}>Ứng tuyển ngay</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
