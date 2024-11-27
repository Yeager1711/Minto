'use client';
import React, { useState, useEffect } from 'react';
import styles from './jobTag.module.scss';
import { useRouter, useParams } from 'next/navigation';

interface Job {
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
    workLocation: {
        address_name: string;
        district: {
            name: string;
        };
    };
    company: {
        name: string;
        images: {
            image_company: string;
        }[];
    };
    jobType: {
        work_at: string[];
        name: string[];
    };
    jobLevel: {
        name: string[];
    };
    generalInformation: {
        experience: string;
        tech_stack: string[];
    };
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function JobTag() {
    const [jobs, setJobs] = useState<Job[]>([]);
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
            }
        };
        fetchJobDetails();
    }, [tech]);

    return (
        <section className={styles.jobTag + ' marTop'}>
            <div className={styles.wrapper__jobTag}>
                <h2>Job Listings</h2>
                <div className={styles.jobList}>
                    {jobs.map((job) => (
                        <div key={job.jobId} className={styles.jobCard}>
                            <div className={styles.jobHeader}>
                                <h3>{job.title}</h3>
                                <p>Salary: {job.salary || 'Negotiable'}</p>
                            </div>
                            <div className={styles.jobDetails}>
                                <p><strong>Experience:</strong> {job.generalInformation.experience}</p>
                                <p><strong>Location:</strong> {job.workLocation.address_name} ({job.workLocation.district.name})</p>
                                <p><strong>Company:</strong> {job.company.name}</p>
                                <p><strong>Work Type:</strong> {job.jobType.work_at.join(', ')}</p>
                                <p><strong>Job Level:</strong> {job.jobLevel.name.join(', ')}</p>
                                <p><strong>Tech Stack:</strong> {job.generalInformation.tech_stack.join(', ')}</p>
                            </div>
                            <div className={styles.jobFooter}>
                                <p><strong>Expires On:</strong> {job.expire_on}</p>
                                <button
                                    className={styles.viewJobBtn}
                                    onClick={() => router.push(`/job-detail/${job.jobId}`)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default JobTag;
