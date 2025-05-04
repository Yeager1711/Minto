'use client';
import { useEffect, useState } from 'react';
import styles from './company.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Job_Product from 'app/auth/dashboard/job_product/page';
import { useApi } from 'app/lib/apiConentext/ApiContext';
import { RecruitmentInfo } from 'app/interface/Recruitment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faLocationDot, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Import interface Job từ Job_Product
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

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;
const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function CompanyPage() {
    const router = useRouter();
    const { fetchCompanyJobs, fetchRecruitmentID, getMapEmbedUrl } = useApi();
    const [recruitmentInfo, setRecruitmentInfo] = useState<RecruitmentInfo | null>(null);
    const [filteredJobs, setFilteredJobs] = useState<RecruitmentInfo['jobs']>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapEmbedUrl, setMapEmbedUrl] = useState<string>('');

    // Hàm chuyển đổi từ RecruitmentInfo['jobs'] sang Job[]
    const convertToJobArray = (jobs: RecruitmentInfo['jobs']): Job[] => {
        return jobs.map((job) => ({
            ...job,
            jobLevel: Array.isArray(job.jobLevel) ? job.jobLevel : [job.jobLevel || 'Không xác định'],
            jobType_name: Array.isArray(job.jobType_name) ? job.jobType_name : [job.jobType_name || 'Không xác định'],
            jobType_workAt: Array.isArray(job.jobType_workAt)
                ? job.jobType_workAt
                : [job.jobType_workAt || 'Không xác định'],
            expire_on: job.expire_on instanceof Date ? job.expire_on.toISOString() : job.expire_on,
        }));
    };

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-in-out',
        });

        setTimeout(() => {
            AOS.refresh();
        }, 100);

        const loadCompanyJobs = async () => {
            try {
                setLoading(true);
                const companyIdByfetchRecruitmentID = await fetchRecruitmentID();
                const companyId = companyIdByfetchRecruitmentID.company.companyId;
                const data = await fetchCompanyJobs(Number(companyId));
                console.log('Dữ liệu từ API:', data);
                setRecruitmentInfo(data);
                setFilteredJobs(data.jobs || []);

                const address = data?.company?.workLocations[0]?.address_name;

                if (address) {
                    const embedUrl = getMapEmbedUrl(address);
                    setMapEmbedUrl(embedUrl);
                }
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu công ty:', err);
                setError('Không thể tải thông tin công ty và công việc');
            } finally {
                setLoading(false);
            }
        };

        loadCompanyJobs();
    }, [fetchCompanyJobs, fetchRecruitmentID]);



    const handleSearch = () => {
        if (!recruitmentInfo?.jobs) {
            setFilteredJobs([]);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = recruitmentInfo.jobs.filter((job) => {
            const titleMatch = job.title.toLowerCase().includes(query);
            return titleMatch;
        });

        setFilteredJobs(filtered);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.company_info}>
            <section>
                <header>
                    <FontAwesomeIcon icon={faChevronLeft} onClick={() => router.push('/account/setting/HR_info')} />
                    <h2>Thông tin công ty & tin tuyển dụng từ {recruitmentInfo?.company.name}</h2>
                </header>
                <div className={styles.company_info__container}>
                    <div className={styles.banner_Background}>
                        <img
                            src={
                                recruitmentInfo?.company?.images?.[0]?.banner_BackgroundImage_company
                                    ? `${apiUrl}${recruitmentInfo.company.images[0].banner_BackgroundImage_company}`
                                    : ''
                            }
                            alt="Company Banner"
                        />
                        <div className={styles.infomations}>
                            <div className={styles.image_comapny}>
                                <img
                                    src={
                                        recruitmentInfo?.company?.images?.[0]?.image_company
                                            ? `${apiUrl}${recruitmentInfo.company.images[0].image_company}`
                                            : ''
                                    }
                                    alt="Company Logo"
                                />
                            </div>
                            <div className={styles.contents}>
                                <h3>{recruitmentInfo?.company?.name || 'TestCenter'}</h3>
                                <span className={styles.industry}>
                                    Lĩnh vực:{' '}
                                    <p>
                                        {recruitmentInfo?.company?.companyIndustries?.[0]?.name ||
                                            'Software, Product, E-commerce Platforms, Information Technology'}
                                    </p>
                                </span>

                                <span className={styles.companySize}>
                                    Quy mô:{' '}
                                    <p>
                                        {recruitmentInfo?.company?.taxCodes?.[0]?.companySize
                                            ? `${recruitmentInfo.company.taxCodes[0].companySize} nhân viên`
                                            : 'Không có thông tin'}
                                    </p>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.flex}>
                        <div className={styles.flex_left}>
                            <div className={styles.introduction_comapny}>
                                <div className={styles.header}>
                                    <h3>Giới thiệu công ty</h3>
                                </div>
                                <div className={styles.introduction_comapny__container}>
                                    <span className={styles.text}>
                                        {recruitmentInfo?.company?.company_description || ''}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.company_recruitment}>
                                <div className={styles.header}>
                                    <h3>Công việc đang tuyển</h3>
                                </div>
                                <div className={styles.search_jobProduct}>
                                    <div className={styles.box_input}>
                                        <input
                                            type="text"
                                            placeholder="Tên công việc, vị trí ứng tuyển, ..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.btn_seach__jobProduct}>
                                        <button onClick={handleSearch}>
                                            <FontAwesomeIcon icon={faSearch} /> Tìm kiếm
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.recruitment_comapny__container}>
                                    <Job_Product
                                        jobs={convertToJobArray(filteredJobs || [])}
                                        company={recruitmentInfo?.company || null}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.flex_right}>
                            <div className={styles.section_contact}>
                                <div className={styles.header}>
                                    <h3>Thông tin liên hệ</h3>
                                </div>
                                <div className={styles.section_contact__box}>
                                    <div className={styles.address}>
                                        <span>
                                            <FontAwesomeIcon icon={faLocationDot} /> Địa chỉ công ty
                                        </span>
                                        <p>{recruitmentInfo?.company?.workLocations[0]?.address_name}</p>
                                    </div>
                                    <div className={styles.address_map}>
                                        <span>
                                            <FontAwesomeIcon icon={faMapLocationDot} /> Xem bản đồ
                                        </span>
                                        {mapEmbedUrl ? (
                                            <iframe
                                                src={mapEmbedUrl}
                                                width="500"
                                                height="450"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        ) : (
                                            <div>
                                                <p>
                                                    Không thể hiển thị bản đồ cho địa chỉ:{' '}
                                                    {recruitmentInfo?.company?.workLocations[0]?.address_name}
                                                </p>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                        recruitmentInfo?.company?.workLocations[0]?.address_name || ''
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Xem trên Google Maps
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
