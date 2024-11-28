'use client';
import { useState, useEffect } from 'react';
import styles from './companies.module.scss';
// import { PiDiamondsFour } from "react-icons/pi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faLocationPin, faEye, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface Job {
    jobId: string;
    title: string;
    salary_from: number;
    salary_to: number;
    company: {
        name: string;
        images: { image_company: string }[];
    };
    workLocation: {
        district: { name: string };
    };
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function Companies() {
    const [jobData, setJobData] = useState<Job[]>([]);
    const [groupedCompanies, setGroupedCompanies] = useState<{ [key: string]: { name: string; district: string; jobs: Job[] } }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const response = await fetch(`${apiUrl}/jobs/all-jobs`);
                const data = await response.json();
                setJobData(data.data);

                // Nhóm các công ty
                const grouped = data.data.reduce((acc: any, job: Job) => {
                    const key = `${job.company.name}_${job.workLocation.district.name}`;
                    if (!acc[key]) {
                        acc[key] = {
                            name: job.company.name,
                            district: job.workLocation.district.name,
                            jobs: [],
                        };
                    }
                    acc[key].jobs.push(job);
                    return acc;
                }, {});

                setGroupedCompanies(grouped);
                setLoading(false);
            } catch (err) {
                setError('Có lỗi xảy ra khi lấy dữ liệu');
                setLoading(false);
            }
        };

        fetchAllJobs();
    }, []);

    // Loading and error handling
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <section className={styles.companies + ' marTop'}>
            <div className={styles['find-companies']}>
                <div className={styles['find-companies__wrapper']}>
                    <div className={styles['companies__input']}>
                        <input type="text" placeholder="Tìm kiếm công ty ...." />
                    </div>
                    <div className={styles['find-companies__button']}>
                        <button>Tìm công ty</button>
                    </div>
                </div>
            </div>

            <section className={styles['recruitment-companies']}>
                <h3>
                    <p>Việc làm tuyển dụng</p> Công ty hàng đầu
                </h3>

                <div className={styles['recruitment-companies__wapper']}>
                    {Object.keys(groupedCompanies).map((key) => {
                        const company = groupedCompanies[key];
                        const firstJob = company.jobs[0]; // Lấy job đầu tiên để hiển thị thông tin logo
                        return (
                            <div className={styles['box-company']} key={key}>
                                <div className={styles['company-logo__wrapper']}>
                                    <div className={styles['company-logo']}>
                                        <img src={firstJob.company.images[0]?.image_company} alt={company.name} />
                                    </div>

                                    <div className={styles['company-logo__border']}>
                                        <img src={firstJob.company.images[0]?.image_company} alt={company.name} />
                                    </div>

                                    <div className={styles['company-content']}>
                                        <h3>{company.name}</h3>
                                        <div className={styles['company-content__details']}>
                                            <span className={styles['company-district']}>{company.district}</span>

                                            <span className={styles['total__job']}>
                                                Số lượng công việc tuyển dụng: {company.jobs.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </section>
    );
}

export default Companies;

