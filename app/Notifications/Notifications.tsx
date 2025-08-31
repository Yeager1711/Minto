'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import styles from './Notifications.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faExpand } from '@fortawesome/free-solid-svg-icons';
import EventQK from 'app/event/QK/QK';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

interface Notification {
    id: number;
    title: React.ReactNode;
    period: {
        from: string;
        to?: string;
    };
    items: string[];
    /** optional jsx icon — we still render wrapper button to handle click */
    icon?: React.ReactNode;
}

const Discount = Number(process.env.NEXT_PUBLIC_PRICE_CHECK_DISCOUNT_ELIGIBILITY || 10);

const notifications: Notification[] = [
    {
        id: 1,
        title: (
            <>
                Nhân dịp kỷ niệm <strong>80 năm Quốc khánh 2/9/2025</strong>, xin gửi lời chúc mừng nồng nhiệt nhất đến
                khách hàng của <strong>Minto</strong>. Nhân dịp kỷ niệm <strong>Minto</strong> có 1 số ưu đãi:
            </>
        ),
        period: { from: '00:00 [01/09/2025] - 12:00 [03/09/2025]' },
        items: ['Giảm giá Thiệp Online trên hệ thống 10%', 'Áp dụng toàn bộ thiệp', 'Áp dụng cộng thêm đối với các tài khoản đang trong quá trình giảm giá 7 ngày kể từ ngày đăng kí tài khoản.'],
        icon: <FontAwesomeIcon icon={faExpand} className={styles.icon} />,
    },
    {
        id: 2,
        title: (
            <>
                Ra mắt tính năng AI{' '}
                <Link href="/" className={styles.link}>
                    Minto Bot
                </Link>
            </>
        ),
        period: { from: '15/08/2025' },
        items: [
            'Hỏi đáp thắc mắc, những vấn đề trong quá trình sử dụng',
            'Hướng dẫn và hỗ trợ khách hàng việc lấy tọa độ',
        ],
    },
    {
        id: 3,
        title: (
            <>
                Giảm giá {Discount}% cho tài khoản mới tại{' '}
                <Link href="/" className={styles.link}>
                    Minto
                </Link>
            </>
        ),
        period: { from: '01/07/2025' },
        items: [
            'Áp dụng cho toàn bộ template',
            'Không áp dụng đồng thời với các mã khuyến mãi khác',
            'Ưu đãi chỉ áp dụng trong 7 ngày kể từ ngày đăng ký',
        ],
    },
    {
        id: 4,
        title: 'Ra mắt tính năng tạo thẻ nhận Hỷ',
        period: { from: '01/06/2025' },
        items: [
            'Cho phép tạo QR nhận Hỷ bằng tài khoản ngân hàng cá nhân',
            'Mỗi tài khoản được tạo tối đa 2 QR để nhận Hỷ',
            'Áp dụng trực tiếp trong quá trình "Nhập thông tin thiệp" và nhận trực tiếp tại: Thiệp đã được tạo !',
        ],
    },
];

const Notifications: React.FC = () => {
    // selected = notification được mở popup, null = không có popup
    const [selected, setSelected] = useState<Notification | null>(null);

    return (
        <div className={styles.notifications}>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={10}
                slidesPerView={1.1}
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
                    disableOnInteraction: false,
                }}
                loop={true}
                breakpoints={{
                    480: { slidesPerView: 1.2, spaceBetween: 10 },
                    768: { slidesPerView: 2, spaceBetween: 10 },
                }}
                className={styles.wrapper_notifications}
            >
                {notifications.map((notification) => (
                    <SwiperSlide key={notification.id}>
                        <div className={styles.box}>
                            {/* Title + (nếu có) icon */}
                            <h3 className={styles.title}>
                                <span className={styles.title_text}>{notification.title}</span>

                                {notification.icon && (
                                    <button
                                        type="button"
                                        className={styles.icon_wrapper}
                                        onClick={() => setSelected(notification)} // <-- mở popup
                                        aria-label="Xem chi tiết"
                                    >
                                        {notification.icon}
                                    </button>
                                )}
                            </h3>

                            <div className={styles.application_period}>
                                <span className={styles.from}>
                                    Từ ngày: <strong>{notification.period.from}</strong>
                                </span>
                                {notification.period.to && (
                                    <>
                                        {' - '}
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
                <button className={styles.prev_button} aria-label="previous">
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className={styles.next_button} aria-label="next">
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>

            {/* Popup: truyền nội dung của notification đã chọn */}
            {selected && (
                <EventQK
                    onClose={() => setSelected(null)}
                    title={selected.title}
                    items={selected.items}
                    period={selected.period}
                />
            )}
        </div>
    );
};

export default Notifications;
