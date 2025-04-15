import * as React from 'react';
import styles from './notifications.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faImage, faCamera, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function Notifications() {
    return (
        <section className={styles.notifies_important} data-aos="fade-up">
            <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                    nextEl: `.${styles.swiper_button_next}`,
                    prevEl: `.${styles.swiper_button_prev}`,
                }}
                className={styles.notify_swiper}
            >
                <SwiperSlide>
                    <div className={styles.box_notifycations}>
                        <h3>Thông báo quan trọng</h3>
                        <span>
                            Từ ngày 30/04/2025,{' '}
                            <a href="" className={styles.bold}>
                                Jobmarket System thông báo
                            </a>{' '}
                            ngừng hỗ trợ tin tuyển dụng đối với những tài khoản chưa xác thực:{' '}
                            <strong><a href="/account/setting/HR_info">* Xác thực số điện thoại,</a></strong>{' '}
                            <strong><a href="/account/setting/HR_info">* Cập nhật thông tin công ty,</a></strong>{' '}
                            <strong><a href="/account/setting/HR_info">* Xác thực giấy đăng ký doanh nghiệp.</a></strong>
                            Mục đích hướng đến sự minh bạch rõ
                            ràng tạo niềm tin tưởng tuyệt đối cho các ứng viên !
                            <a href="#" rel="noopener noreferrer">
                                (xem chi tiết tại đây)
                            </a>
                        </span>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className={styles.box_notifycations}>
                        <h3>Thông báo quan trọng</h3>
                        <span>
                            Từ ngày 01/05/2025,{' '}
                            <a href="" className={styles.bold}>
                                Jobmarket
                            </a>{' '}
                            ngừng hỗ trợ tin đăng cơ bản (standard) đối với một số nhóm vị trí tuyển dụng nhất định{' '}
                            <a href="#" rel="noopener noreferrer">
                                (xem chi tiết tại đây)
                            </a>
                        </span>
                    </div>
                </SwiperSlide>

                {/* Nút điều hướng và chỉ số slide */}
                <div className={styles.swiper_navigation}>
                    <div className={styles.swiper_button_prev}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </div>
                    <div className={styles.swiper_button_next}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                </div>
            </Swiper>
        </section>
    );
}

export default Notifications;
