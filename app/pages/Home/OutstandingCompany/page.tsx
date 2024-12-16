import React, { useState, useEffect } from 'react';
import styles from './OutstandingCompany.module.scss';
import { Job } from '../../../interface/Job';

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function OutstandingCompany() {
    const [jobData, setJobData] = useState<Job[]>([]);
    const [groupedCompanies, setGroupedCompanies] = useState<{
        [key: string]: { name: string; district: string; jobs: Job[] };
    }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const response = await fetch(`${apiUrl}/jobs/all-jobs`);
                const data = await response.json();
                setJobData(data.data);

                const grouped = data.data.reduce((acc: any, job: Job) => {
                    const key = `${job.company?.name || 'N/A'}_${job.workLocation?.district?.name || 'N/A'}`;
                    if (!acc[key]) {
                        acc[key] = {
                            name: job.company?.name || 'N/A',
                            district: job.workLocation?.district?.name || 'N/A',
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

    const getSizeClass = (jobCount: number) => {
        if (jobCount >= 20) return 'size-5';
        if (jobCount >= 10) return 'size-4';
        if (jobCount >= 5) return 'size-3';
        if (jobCount > 0) return 'size-2';
        return 'size-1';
    };

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <section className={styles.OutstandingCompany}>
            <div className={styles.OutstandingCompany__wrapper}>
                <div className={styles.OutstandingCompany__container}>
                    <div className={styles.title}>
                        <h3>Công ty nổi bật</h3>
                    </div>
                    {Object.keys(groupedCompanies)
                        .filter((key) => groupedCompanies[key].jobs.length > 5)
                        .map((key) => {
                            const company = groupedCompanies[key];
                            const firstJob = company.jobs[0];
                            const sizeClass = getSizeClass(company.jobs.length);

                            return (
                                <div className={`${styles.company_box} ${styles[sizeClass]}`} key={key}>
                                    <div className={styles.company__image}>
                                        <img
                                            src={firstJob.company?.images[0]?.image_company || ''}
                                            alt={company.name}
                                        />
                                    </div>
                                    <div className={styles.company_content}>
                                        <h3>{company.name}</h3>
                                        <div className={styles.company_content__details}>
                                            <span className={styles.total__job}>
                                                Số lượng công việc: {company.jobs.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </section>
    );
}

export default OutstandingCompany;
