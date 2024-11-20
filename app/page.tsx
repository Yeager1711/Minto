'use client';
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
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Data from './Data/data';

// Định nghĩa kiểu cho công việc
interface Job {
      image: string;
      title: string;
      company: string;
      address: string;
      salary: string;
}

function Home() {
      const [jobs, setJobs] = useState<Job[]>([]);

      useEffect(() => {
            const fetchJobs = async () => {
                  const res = await fetch('/api/crawl');
                  const data = await res.json();
                  setJobs(data);
            };

            fetchJobs();
      }, []);

      return (
            <div className={styles.Home}>
                  <div className={styles['banner-image']}>
                        <img src="/images/banner.jpg" alt="" />

                        <div className={styles['wrapper-content']}>
                              <div className={styles['search-infoWork']}>
                                    <div className={styles['content']}>
                                          <h4>
                                                Tìm việc làm nhanh <span>24h</span>, việc làm mới
                                                nhất trên toàn quốc.
                                          </h4>
                                          <p>
                                                Tiếp cận <span>40,000+</span> tuyển dụng việc làm
                                                mỗi ngày từ doanh nghiệp uy tín tại Việt Nam
                                          </p>
                                    </div>

                                    <div className={styles['find-work']}>
                                          <div className={styles['box-input']}>
                                                <input
                                                      type="text"
                                                      placeholder="Tìm kiếm các ngành nghề..."
                                                />
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
                                    </div>
                              </div>
                        </div>
                  </div>

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
                                    {Data.map((company) => (
                                          <SwiperSlide key={company.id}>
                                                <div className={styles['company']}>
                                                      <div className={styles['img-company']}>
                                                            <img
                                                                  src={company.imgSrc}
                                                                  alt={company.companyName}
                                                            />
                                                      </div>
                                                      <div className={styles['content-company']}>
                                                            <h3 className={styles['name-company']}>
                                                                  {company.companyName}
                                                            </h3>
                                                            <span className={styles['location']}>
                                                                  {company.location}
                                                            </span>
                                                      </div>
                                                </div>
                                          </SwiperSlide>
                                    ))}
                              </Swiper>
                        </div>
                  </section>

                  <section>
                        <h1>Danh sách công việc</h1>
                        <ul>
                              {jobs.map((job, index) => (
                                    <li key={index}>
                                          <h3>{job.title}</h3>
                                          <p>
                                                {job.company} - {job.address}
                                          </p>
                                    </li>
                              ))}
                        </ul>
                  </section>

                  <section className={styles['wrapper-home']}>
                        <div className={styles['header-recruitment']}>
                              <h3>
                                    <p>Tuyển dụng</p> Việc Làm Tốt Nhất
                              </h3>
                        </div>

                        <div className={styles['recruitment-container']}>
                              {Data.map((company) => (
                                    <div className={styles['company']} key={company.id}>
                                          <span className={styles['icon-views']}>
                                                <FontAwesomeIcon icon={faEye} />
                                                {company.views}
                                          </span>
                                          <div className={styles['img-company']}>
                                                <img src={company.imgSrc} alt="" />
                                          </div>

                                          <div className={styles['content-company']}>
                                                <div className={styles['company-location']}>
                                                      <h3 className={styles['name-company']}>
                                                            {company.companyName}
                                                      </h3>
                                                      <span className={styles['location']}>
                                                            {company.location}
                                                      </span>
                                                      <span className={styles['position']}>
                                                            Vị trí: <p>{company.position}</p>
                                                      </span>
                                                </div>

                                                <div className={styles['btn-viewDetails']}>
                                                      Xem chi tiết
                                                </div>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </section>

                  <div className={styles['HomePage_findJobs']}>
                        <div className={styles['image_HomePage_findJobs']}>
                              <img src="/images/banner-2.jpg" alt="" />

                              <div className={styles['content_HomePage_findJobs']}>
                                    <div>
                                          <div className={styles['title']}>
                                                Khám phá và ứng tuyển công việc một cách dễ dàng,
                                                nhanh chóng, và thuận tiện, giúp bạn nắm bắt cơ hội
                                                sự nghiệp mọi lúc, mọi nơi.
                                          </div>
                                          <div className={styles['sub_title']}>
                                                Đưa ra lựa chọn nghề nghiệp chính xác hơn thông qua
                                                các bài trắc nghiệm chuyên sâu về tính cách, khả
                                                năng giải quyết vấn đề, và trí thông minh, giúp bạn
                                                khám phá thế mạnh của mình một cách toàn diện.
                                          </div>
                                    </div>

                                    <img
                                          src="/images/arrow.png"
                                          className={styles['img-arrow']}
                                          alt=""
                                    />
                                    <button className={styles['Apply_now']}>Ứng tuyển ngay</button>
                              </div>
                        </div>
                  </div>
            </div>
      );
}

export default Home;
