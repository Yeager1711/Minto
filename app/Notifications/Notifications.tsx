'use client';
import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import styles from './Notifications.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Import Swiper core styles
import 'swiper/css';

interface Notification {
    id: number;
    title: string | JSX.Element;
    period: {
        from: string;
        to?: string;
    };
    items: string[];
}

const notifications: Notification[] = [
    {
        id: 1,
        title: (
            <>
                Trãi nghiệm miễn phí với các template có sẵn của{' '}
                <Link href="/" className={styles.link}>
                    Minto
                </Link>
            </>
        ),
        period: {
            from: '01/05/2025',
            to: '30/06/2025',
        },
        items: ['Áp dụng cho toàn bộ Template'],
    },
    {
        id: 2,
        title: 'Thực hiện làm mới dữ liệu free',
        period: {
            from: '01/07/2025',
        },
        items: ['Hệ thống sẽ reset toàn bộ dữ liệu', 'Các bản mẫu đã tạo trước kia không còn được áp dụng'],
    },
    {
        id: 3,
        title: (
            <>
                Giảm giá 20% cho tài khoản mới tại{' '}
                <Link href="/" className={styles.link}>
                    Minto
                </Link>
            </>
        ),
        period: {
            from: '01/07/2025',
        },
        items: [
            'Áp dụng cho toàn bộ template',
            'Không áp dụng đồng thời với các mã khuyến mãi khác',
            'Ưu đãi chỉ áp dụng trong 7 ngày kể từ ngày đăng ký',
        ],
    },
];

const Notifications: React.FC = () => {
    return (
        <div className={styles.notifications}>
            <div className={styles.control}>
                <div className={`${styles.prev} swiper-button-prev-custom`}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                <div className={`${styles.next} swiper-button-next-custom`}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </div>
            </div>

            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={15}
                slidesPerView={2}
                navigation={{
                    prevEl: '.swiper-button-prev-custom',
                    nextEl: '.swiper-button-next-custom',
                }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                loop={true}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 15,
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 15,
                    },
                }}
                className={styles.wrapper_notifications}
            >
                {notifications.map((notification) => (
                    <SwiperSlide key={notification.id}>
                        <div className={styles.box}>
                            <h3>{notification.title}</h3>
                            <div className={styles.application_period}>
                                <span className={styles.from}>
                                    Từ ngày: <strong>{notification.period.from}</strong>
                                </span>
                                {notification.period.to && (
                                    <>
                                        {'-'}
                                        <span className={styles.to}>
                                            Đến ngày: <strong>{notification.period.to}</strong>
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className={styles.box_item}>
                                {notification.items.map((item, index) => (
                                    <span key={index} className={styles.item}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Notifications;
