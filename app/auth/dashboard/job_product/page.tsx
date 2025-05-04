'use client';

import * as React from 'react';
import { useState } from 'react';
import styles from './job_product.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import JobDetailsPopup from '../../../popup/JobDetailsPopup/page';

interface Job {
    jobId: number;
    title: string;
    salary_from: number;
    salary_to: number;
    jobLevel: string[];
    jobType_name: string[];
    jobType_workAt: string[];
    jobIndustry: string;
    description: string;
    requirement: string;
    benefits: string;
    workLocation: { address_name: string; district: { name: string } };
    generalInformation: { numberOfRecruits: number; gender: string };
    work_time: string;
    expire_on: string;
    view: number;
}

interface Company {
    images: { image_company: string }[];
}

interface JobProductProps {
    jobs: Job[];
    company: Company | null;
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL || 'http://localhost:5000';

function Job_Product({ jobs, company }: JobProductProps) {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const handleViewDetails = (job: Job) => {
        setSelectedJob(job);
    };

    const handleClosePopup = () => {
        setSelectedJob(null);
    };

    if (!jobs?.length) {
        return <div>Chưa có công việc nào được đăng tuyển.</div>;
    }

    return (
        <div className={styles.all_jobPosted__container}>
            {jobs.map((job) => (
                <div key={job.jobId} className={styles.all_jobPosted__box}>
                    <div className={styles.all_jobPosted__image}>
                        <img
                            src={
                                company?.images?.[0]?.image_company
                                    ? `${apiUrl}${company.images[0].image_company}`
                                    : '/images/placeholder.png'
                            }
                            alt="Company Logo"
                        />
                    </div>
                    <div className={styles.all_jobPosted__content}>
                        <span className={styles.views}>
                            {job.view} <FontAwesomeIcon icon={faEye} />
                        </span>
                        <span className={styles.views_details} onClick={() => handleViewDetails(job)}>
                            Xem chi tiết
                        </span>
                        <h3>{job.title}</h3>
                        <span className={styles.salary}>
                            Mức lương:
                            <p>
                                {job.salary_from === 0 && job.salary_to === 0
                                    ? 'Thỏa thuận'
                                    : job.salary_from === 0
                                      ? `Up to ${job.salary_to.toLocaleString()} VNĐ`
                                      : job.salary_to === 0
                                        ? `From ${job.salary_from.toLocaleString()} VNĐ`
                                        : `${job.salary_from.toLocaleString()} - ${job.salary_to.toLocaleString()} VNĐ`}
                            </p>
                        </span>

                        <span className={styles.levels}>
                            Cấp bậc tuyển dụng:
                            <p>{job.jobLevel.join(', ') || 'Không xác định'}</p>
                        </span>
                    </div>
                </div>
            ))}

            {/* Hiển thị popup khi có job được chọn */}
            {selectedJob && <JobDetailsPopup job={selectedJob} onClose={handleClosePopup} />}
        </div>
    );
}

export default Job_Product;
