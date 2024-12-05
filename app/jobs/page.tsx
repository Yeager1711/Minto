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

import {Job} from '../interface/Job'

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function Jobs({ salary }: { salary: string }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [jobData, setJobData] = useState<Job[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <section className={styles.job + ' marTop'}>
            <div className={styles['filter-job']}>
                <section className={styles['navigation-search']}>
                    <div className={styles['box-input']}>
                        <input type="text" placeholder="Tìm kiếm các ngành nghề..." />
                    </div>

                    <div className={styles['box-select']}>
                        <select name="" id="">
                            <option value="">TP.Hồ Chí Minh</option>
                            <option value="">TP.Đà Nẵng</option>
                            <option value="">TP.Cần Thơ</option>
                            <option value="">TP.Hải phòng</option>
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
                        <select name="" id="">
                            <option value="">Hình thức làm việc</option>
                            <option value="">Làm việc từ xa</option>
                            <option value="">Làm việc tại công ty</option>
                            <option value="">Làm việc toàn thời gian</option>
                            <option value="">Làm việc bán thời gian</option>
                            <option value="">Hybrid</option>
                        </select>
                    </div>

                    <div className={styles['filter']}>
                        <select name="" id="">
                            <option value="">Cấp bậc</option>
                            <option value="">Mới tốt nghiệp/Thực tập sinh</option>
                            <option value="">Thực tập sinh/Sinh viên</option>
                            <option value="">Nhân viên</option>
                            <option value="">Trưởng nhóm/Giám sát</option>
                            <option value="">Trưởng phòng</option>
                            <option value="">Phó giám đốc</option>
                            <option value="">Giám đốc</option>
                            <option value="">Tổng giám đốc điều hành</option>
                            <option value="">Chủ tịch</option>
                        </select>
                    </div>

                    <div className={styles['filter']}>
                        <select name="" id="">
                            <option value="">TP.Hồ Chí Minh</option>
                            <option value="">TP.Đà Nẵng</option>
                            <option value="">TP.Cần Thơ</option>
                            <option value="">TP.Hải phòng</option>
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
            </section>

            <section className={styles['job-wrapperContainer']}>
                <div className={styles['Container']}>
                    {loading
                        ? Jobs_Skeleton()
                        : jobData.map((item) => (
                              <div
                                  onClick={() => router.push(`/jobs/job_details/${item.jobId}`)}
                                  className={styles['box']}
                                  key={item.jobId}
                              >
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
                                                  {/* <FontAwesomeIcon icon={faEye} /> {item.views} */}
                                              </div>
                                          </div>
                                          {/* <div className={styles['job-content-bottom-expired']}>{item.expired}</div> */}
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
