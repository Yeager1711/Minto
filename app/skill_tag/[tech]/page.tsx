'use client';
import React, { useState, useEffect } from 'react';
import styles from './jobTag.module.scss';
import classNames from 'classnames';
import { useRouter, useParams } from 'next/navigation';
import { formatSalary } from 'app/Ultils/formatSalary';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TechStack__Skeleton from './tech_skeleton';
interface Job {
    success: boolean;
    jobId: number;
    title: string;
    salary: string;
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
        work_at: string[];
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
        tech_stack: string[];
    };
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function skillTag() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const router = useRouter();
    const params = useParams();
    const tech = params.tech;

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await fetch(`${apiUrl}/jobs/by-tech/${tech}`);
                const { data } = await response.json();
                setJobs(data);
            } catch (error) {
                console.error('Error fetching job details:', error);
            } finally {
                setLoading(false); // Stop loading once the data is fetched
            }
        };
        fetchJobDetails();
    }, [tech]);


    return (
        <section className={styles.jobTag + ' marTop'}>
            <div className={styles.wrapper__jobTag}>
            <div className={styles.filter__work}>
                    <div className={styles.filter_work__location}>
                        <select name="" id="">
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

                    <div className={styles.filter_work__level}>
                        <select name="" id="">
                            <option value="">All Level</option>
                            <option value="Intern">Intern</option>
                            <option value="Fresher">Fresher</option>
                            <option value="Junior">Junior</option>
                            <option value="Middle">Middle</option>
                            <option value="Senior">Senior</option>
                            <option value="Leader">Leader</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    <div className={styles.filter_work__types}>
                        <select name="" id="">
                            <option value="">All job types</option>
                            <option value="In Office">In Office</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                            <option value="Oversea">Oversea</option>
                        </select>
                    </div>

                    <div className={styles.filter_work__ContractTypes}>
                        <select name="" id="">
                            <option value="">All contract types</option>
                            <option value="Fulltime">Fulltime</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Part-time">Part-time</option>
                        </select>
                    </div>
                </div>

                <div className={styles.wrapper_jobs}>
                    <h2>
                        {loading ? <Skeleton width={50} /> : `${jobs.length} Jobs`}
                        {loading ? (
                            <Skeleton width={50} height={30} />
                        ) : (
                            <span className={styles.tag}>
                                {typeof tech === 'string'
                                    ? decodeURIComponent(tech)
                                    : tech?.[0]
                                      ? decodeURIComponent(tech[0])
                                      : ''}
                            </span>
                        )}
                    </h2>

                    <div className={styles.wrapper_jobsContainer}>
                        {loading
                            ? TechStack__Skeleton()
                            : jobs.map((job) => (
                                  <div
                                      className={styles.box_jobs}
                                      key={job.jobId}
                                  >
                                      <div className={styles.image_company}>
                                          <img onClick={() => router.push(`/jobs/job_details/${job.jobId}`)}
                                              src={job.company.images[0]?.image_company || '/placeholder.jpg'}
                                              alt={job.company.name}
                                          />
                                      </div>
                                      <div className={styles.content}>
                                          <h3 onClick={() => router.push(`/jobs/job_details/${job.jobId}`)}>{job.title}</h3>
                                          <span className={styles.company__name} title={job.company.name}>
                                              {job.company.name}
                                          </span>
                                          <span className={styles.job_level}>
                                              <p onClick={() => router.push(`/jobs/job_details/${job.jobId}`)}>{job.jobLevel.name.join(' , ')}</p>
                                              <svg
                                                  stroke="currentColor"
                                                  fill="currentColor"
                                                  strokeWidth="0"
                                                  viewBox="0 0 256 256"
                                                  height="1em"
                                                  width="1em"
                                                  xmlns="http://www.w3.org/2000/svg"
                                              >
                                                  <path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128Z"></path>
                                              </svg>
                                              <p>
                                                  {job.salary === 'Negotiable'
                                                      ? 'Negotiable'
                                                      : formatSalary(job.salary)}
                                              </p>
                                          </span>
                                          <div className={styles.tag__job}>
                                              {job.generalInformation.tech_stack.map((tech, index) => (
                                                  <p
                                                      onClick={() => router.push(`/skill_tag/${tech}`)}
                                                      key={index}
                                                      className={styles.tech__stack}
                                                  >
                                                      {tech}
                                                  </p>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default skillTag;
