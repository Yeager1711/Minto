'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './jobDetail.module.scss';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentsDollar, faHourglassStart, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

interface Job {
    success: boolean;
    data: {
        jobId: number;
        title: string;
        salary_from: number;
        salary_to: number;
        expire_on: string;
        description: string;
        requirement: string;
        benefits: string;
        work_time: string;
        created_at: string;
        updated_at: string;
        workLocation: {
            workLocationId: number;
            address_name: string;
            created_at: string;
            updated_at: string;
            district: {
                districtId: number;
                name: string;
            };
        };
        company: {
            companyId: number;
            name: string;
            created_at: string;
            updated_at: string;
            images: {
                ImageCompanyId: number;
                image_company: string;
            }[];
        };
        refJob: {
            ref_job_Id: number;
            ref_url: string;
            created_at: string;
            updated_at: string;
        };
        jobType: {
            jobTypeId: number;
            name: string[];
        };
        jobLevel: {
            jobLevelId: number;
            name: string[];
        };
        jobIndustry: {
            jobIndustryId: number;
            name: string;
        };
        generalInformation: {
            general_Information_Id: number;
            numberOfRecruits: number;
            gender: string;
            experience: string;
        };
    };
}

function JobDetail() {
    const [jobDetails, setJobDetails] = useState<Job['data'] | null>(null);
    const [jobData, setJobData] = useState<Record<string, Job['data'][]>>({});
    const groupedJobs: Record<string, Job['data'][]> = {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const jobId = window.location.pathname.split('/').pop();

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/jobs/${jobId}`);
                const { data } = await response.json();
                setJobDetails(data);
            } catch (error) {
                console.error('Error fetching job details:', error);
            }
        };
        fetchJobDetails();
    }, [jobId]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch job details to get the current company
                const currentJobResponse = await fetch(`http://localhost:5000/jobs/${jobId}`);
                const currentJobData = await currentJobResponse.json();

                if (!currentJobData.success) {
                    setError('Không tìm thấy thông tin công việc');
                    return;
                }

                const currentCompanyName = currentJobData.data.company.name;

                // Fetch all jobs
                const response = await fetch('http://localhost:5000/jobs/all-jobs');
                const allJobsData = await response.json();

                if (allJobsData.success) {
                    // Lọc công việc cùng công ty
                    const filteredJobs = allJobsData.data.filter(
                        (job: Job['data']) => job.company.name === currentCompanyName
                    );

                    // Nhóm công việc theo công ty
                    const groupedJobs = filteredJobs.reduce((acc: any, job: any) => {
                        const companyName = job.company.name;
                        if (!acc[companyName]) {
                            acc[companyName] = [];
                        }
                        acc[companyName].push(job);
                        return acc;
                    }, {});

                    setJobData(groupedJobs); // Cập nhật state với công việc được nhóm
                } else {
                    setError('Không tìm thấy dữ liệu công việc');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi lấy dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [jobId]);

    if (!jobDetails) {
        return <p>Đang tải dữ liệu...</p>;
    }

    return (
        <section className={styles.jobDetail + ' marTop'}>
            <div className={styles.company}>
                <div className={styles.image_company}>
                    <img
                        src={jobDetails.company.images[0]?.image_company || 'default-image.png'}
                        alt={jobDetails.company.name}
                    />
                </div>
                <div className={styles.name_company}>
                    {jobDetails.company.name}

                    <span className={styles.basic_infomation_item}>
                        <FontAwesomeIcon icon={faLocationDot} />
                        <p>{jobDetails.workLocation.address_name}</p>
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
                <div className={styles.infomation}>
                    <div className={styles.wrapper_infomation}>
                        <div className={styles.basic_infomation}>
                            <h4 className={styles.infomation_Content_Title_job}>{jobDetails.title}</h4>
                            <div className={styles.infomation_Content_section}>
                                <span className={styles.basic_infomation_item}>
                                    <FontAwesomeIcon icon={faCommentsDollar} />
                                    Mức lương:
                                    <p>
                                        {jobDetails.salary_from === 0 || jobDetails.salary_to === 0 ? (
                                            <>Thỏa thuận</>
                                        ) : (
                                            <>
                                                {jobDetails.salary_from} - {jobDetails.salary_from}
                                            </>
                                        )}
                                    </p>
                                </span>
                                <span className={styles.basic_infomation_item}>
                                    <FontAwesomeIcon icon={faHourglassStart} />
                                    Kinh nghiệm:
                                    <p> {jobDetails.generalInformation.experience}</p>
                                </span>
                            </div>
                            <div className={styles.box_apply_current}>
                                <a href={jobDetails.refJob.ref_url} className={styles.box_apply}>
                                    Ứng tuyển ngay
                                </a>
                            </div>
                        </div>

                        <div className={styles.basic_infomation_description}>
                            <h3>Mô tả công việc</h3>
                            <span>
                                {jobDetails.description
                                    .split('\n')
                                    .filter((line) => line.trim())
                                    .map(
                                        (item, index) =>
                                            item && (
                                                <p key={index} style={{ marginBottom: '1rem' }}>
                                                    {item}
                                                </p>
                                            )
                                    )}
                            </span>
                        </div>

                        <div className={styles.basic_infomation_requesment}>
                            <h3>Yêu cầu ứng viên</h3>
                            <span>
                                {jobDetails.requirement
                                    .split('\n')
                                    .filter((line) => line.trim()) // Lọc các dòng không rỗng
                                    .map((item, index) => (
                                        // <p key={index} style={{ marginBottom: '1rem', textIndent: '1rem' }}>
                                        <p key={index} style={{ marginBottom: '1rem' }}>
                                            {item.trim()}
                                        </p>
                                    ))}
                            </span>
                        </div>

                        <div className={styles.basic_infomation_benifet}>
                            <h3>Phúc lợi</h3>
                            <span>
                                {jobDetails.benefits.split('\n').map(
                                    (item, index) =>
                                        item.trim() && (
                                            <p key={index} style={{ marginBottom: '1rem' }}>
                                                - {item.trim()}
                                            </p>
                                        )
                                )}
                            </span>

                            <span>
                                {jobDetails.benefits
                                    .split('\n')
                                    .filter((line) => line.trim())
                                    .map(
                                        (item, index) =>
                                            item && (
                                                <p key={index} style={{ marginBottom: '1rem' }}>
                                                    {item}
                                                </p>
                                            )
                                    )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.wraper__generalInformation}>
                    <div className={styles.generalInformation}>
                        <h3>Thông tin chung</h3>

                        <React.Fragment>
                            <span className={styles.generalInformation_item}>
                                Cấp bậc: <p>{jobDetails.jobLevel.name.join(', ')}</p>
                            </span>

                            <span className={styles.generalInformation_item}>
                                Số lượng tuyển:{' '}
                                <p>
                                    {jobDetails.generalInformation.numberOfRecruits === 0
                                        ? 'Đang cập nhật'
                                        : jobDetails.generalInformation.numberOfRecruits}
                                </p>
                            </span>
                            <span className={styles.generalInformation_item}>
                                Hình thức làm việc: <p>{jobDetails.jobType.name}</p>
                            </span>
                            <span className={styles.generalInformation_item}>
                                Giới tính:{' '}
                                <p>
                                    {jobDetails.generalInformation.gender === 'no pairing'
                                        ? 'Không đề cập'
                                        : jobDetails.generalInformation.gender}
                                </p>
                            </span>
                        </React.Fragment>
                    </div>

                    <div className={styles.jobSame__company}>
                        <h3>
                            <p>{jobDetails.company.name}</p> Vị trí đang tuyển
                        </h3>
                        {Object.entries(jobData).map(([companyName, jobs]) => (
                            <div key={companyName} className={styles.companyJobs}>
                                {jobs.map((job, index) => (
                                    <Link
                                        href={`/jobs/job_details/${job.jobId}`}
                                        key={job.jobId}
                                        className={styles.box_companyJob}
                                    >
                                        <div className={styles.logo__company}>
                                            <img
                                                src={job.company.images[0]?.image_company || 'default-image.png'}
                                                alt={job.company.name}
                                                className={styles.jobImage}
                                            />
                                        </div>

                                        <div className={styles.jobInfo}>
                                            <h4>{job.title}</h4>
                                            <p className={styles.company__name}>{job.company.name}</p>
                                            <p className={styles.company__salary}>
                                                {job.salary_from === 0 || job.salary_to === 0
                                                    ? 'Thỏa thuận'
                                                    : `${job.salary_from} - ${job.salary_to} VND`}
                                            </p>
                                            <p className={styles.company__location}>{job.workLocation.district.name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default JobDetail;
