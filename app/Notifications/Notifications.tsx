'use client';
import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import styles from './Notifications.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

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
                Trãi nghiệm miễn phí với template của{' '}
                <Link href="/" className={styles.link}>
                    Minto
                </Link>
            </>
        ),
        period: {
            from: '01/05/2025',
            to: '29/06/2025',
        },
        items: ['Áp dụng cho toàn bộ Template'],
    },
    {
        id: 2,
        title: 'Thực hiện làm mới dữ liệu free',
        period: {
            from: '30/06/2025',
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
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                    prevEl: `.${styles.prev_button}`,
                    nextEl: `.${styles.next_button}`,
                }}
                pagination={{
                    dynamicBullets: true,
                    clickable: true,
                }}
                autoplay={{
                    delay: 5000, // 5 giây
                    disableOnInteraction: false, // Tiếp tục autoplay sau khi người dùng tương tác
                }}
                loop={true}
                breakpoints={{
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 20,
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
            <div className={styles.navigation}>
                <button className={styles.prev_button}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className={styles.next_button}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
};

export default Notifications;
