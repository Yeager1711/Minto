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

const Discount = Number(process.env.NEXT_PUBLIC_PRICE_CHECK_DISCOUNT_ELIGIBILITY)

const notifications: Notification[] = [
    {
        id: 1,
        title: (
            <>
                Giảm giá {Discount}% cho tài khoản mới tại{' '}
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
    {
        id: 2,
        title: 'Ra mắt tính năng tạo thẻ nhận Hỷ',
        period: {
            from: '01/06/2025',
        },
        items: [
            'Cho phép tạo QR nhận Hỷ bằng tài khoản ngân hàng cá nhân',
            'Mỗi tài khoản được tạo tối đa 2 QR để nhận Hỷ',
            'Áp dụng trực tiếp trong quá trình "Nhập thông tin thiệp" và nhận trực tiếp tại: Thiệp đã được tạo !',
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
                    delay: 50000000, // 5 giây
                    disableOnInteraction: false, // Tiếp tục autoplay sau khi người dùng tương tác
                }}
                loop={true}
                breakpoints={{
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 0,
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
