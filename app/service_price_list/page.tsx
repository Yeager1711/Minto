'use client';
import React, { useEffect } from 'react';
import styles from './service_price_list.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

import AOS from 'aos'; // Import AOS
import 'aos/dist/aos.css'; // Import CSS của AOS

function Service_price_list() {
    useEffect(() => {
        AOS.init({
            duration: 1000, // Thời gian hiệu ứng (ms)
            once: true, // Chỉ chạy hiệu ứng một lần khi cuộn
        });
    }, []);

    const pricingData = [
        {
            title: 'TAG HOT JOB',
            price: '20,000 VNĐ',
            according_to: 'lượt',
            note: '(Giá trên chưa bao gồm VAT)',
            description: 'Tin tuyển dụng được gắn nhãn HOT vào tiêu đề tin',
        },
        {
            title: 'TAG TUYỂN GẤP',
            price: '35,000 VNĐ',
            according_to: 'lượt',
            note: '(Giá trên chưa bao gồm VAT)',
            description: "Tin tuyển dụng được gắn nhãn 'Gấp' vào tiêu đề tin",
        },
        {
            title: 'TAG TIÊU ĐỀ TUYỂN VÀ CÔNG TY RED',
            price: '500,000 VNĐ',
            according_to: 'tháng',
            note: '(Giá trên chưa bao gồm VAT)',
            description: 'Tin tuyển dụng hiển thị đỏ cả các tiêu đề tin MAU ĐỎ',
        },
        {
            title: 'Add-on Value',
            price: '1,000,000 VNĐ',
            according_to: '2 tuần',
            note: '(Giá trên chưa bao gồm VAT)',
            description:
                'Hiển thị 3 lý do để apply vào job trên box tin của khách hàng tại tìm kiếm việc làm và trên đầu trang chi tiết việc làm',
        },
        {
            title: 'Box Remarketing',
            price: '2,000,000 VNĐ',
            according_to: 'tháng',
            note: '(Giá trên chưa bao gồm VAT)',
            description: 'Tin tuyển dụng được hiển thị lại cho ứng viên đã lưu tin hoặc ứng tuyển tương tự.',
        },
    ];

    // Hàm tính giá giảm 10% cho từng box
    const calculateDiscountedPrice = (price: any) => {
        // Loại bỏ " VNĐ" và dấu phẩy, chuyển thành số
        const numericPrice = parseFloat(price.replace(/[^0-9]/g, ''));
        // Giảm 10%
        const discountedPrice = numericPrice * 0.9;
        // Định dạng lại số thành chuỗi có dấu phẩy
        return discountedPrice.toLocaleString('vi-VN') + ' VNĐ';
    };
    return (
        <div className={styles.Service_price_list}>
            <div className={styles.container}>
                <div className={styles.top_rank}>
                    <section>
                        <span className={styles.title_header}>RECRUITMENT SERVICES</span>
                        <h2 className={styles.title}>Dịch vụ đăng tin tuyển dụng / Tháng</h2>

                        <div className={styles.box_rank__container}>
                            {/* Member Rank */}
                            <div className={styles.rank_card}>
                                <div className={`${styles.rank_header} ${styles.member}`}>
                                    <h3>Member</h3>
                                </div>
                                <div className={styles.rank_content}>
                                    <p>Tổng tích lũy</p>
                                    <p>Từ 0 </p>
                                    <p className={styles.points}>Đến dưới 3.000.000</p>
                                    <p>Điểm túc dụng</p>
                                    <p className={styles.top_points}>0 đến &lt; 300 Top Point</p>
                                </div>

                                <div className={styles.btn_ticket}>Mua gói dịch vụ</div>
                            </div>

                            {/* Silver Partner Rank */}
                            <div className={styles.rank_card} data-aos="fade-up" data-aos-delay="0">
                                <div className={`${styles.rank_header} ${styles.silver}`}>
                                    <h3>Silver Partner</h3>
                                </div>
                                <div className={styles.rank_content}>
                                    <p>Tổng tích lũy</p>
                                    <p>Từ 3.000.000 </p>
                                    <p className={styles.points}>Đến dưới 8.000.000</p>
                                    <p>Điểm túc dụng</p>
                                    <p className={styles.top_points}>300 đến &lt; 800 Top Point</p>
                                </div>

                                <div className={styles.btn_ticket}>Mua gói dịch vụ</div>
                            </div>

                            {/* Gold Partner Rank */}
                            <div className={styles.rank_card} data-aos="fade-up" data-aos-delay="100">
                                <div className={`${styles.rank_header} ${styles.gold}`}>
                                    <h3>Gold Partner</h3>
                                </div>
                                <div className={styles.rank_content}>
                                    <p>Tổng tích lũy</p>
                                    <p>Từ 8.000.000 </p>
                                    <p className={styles.points}>Đến dưới 15.000.000</p>
                                    <p>Điểm túc dụng</p>
                                    <p className={styles.top_points}>800 đến &lt; 1500 Top Point</p>
                                </div>

                                <div className={styles.btn_ticket}>Mua gói dịch vụ</div>
                            </div>

                            {/* Platinum Partner Rank */}
                            <div className={styles.rank_card} data-aos="fade-up" data-aos-delay="200">
                                <div className={`${styles.rank_header} ${styles.platinum}`}>
                                    <h3>Platinum Partner</h3>
                                </div>
                                <div className={styles.rank_content}>
                                    <p>Tổng tích lũy</p>
                                    <p>Từ 15.000.000 </p>
                                    <p className={styles.points}>Đến dưới 25.000.000</p>
                                    <p>Điểm túc dụng</p>
                                    <p className={styles.top_points}>1500 đến &lt; 2500 Top Point</p>
                                </div>

                                <div className={styles.btn_ticket}>Mua gói dịch vụ</div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className={styles.service__add} data-aos="fade-up" data-aos-delay="300">
                    <section>
                        <span className={styles.title_header} style={{ marginLeft: '2.5rem' }} data-aos="fade-up">
                            TOP ADD-ON
                        </span>
                        <h3 data-aos="fade-up" data-aos-delay="100">
                            Dịch vụ cộng thêm / Ngày (Tuần)
                        </h3>
                        <p className={styles.des_header} data-aos="fade-up" data-aos-delay="200">
                            Thêm tùy chọn giúp tin tuyển dụng nổi bật hơn với ứng viên
                        </p>

                        <div className={styles.flex_service__add}>
                            {/* Danh sách các box giá tiền */}
                            <div className={styles.pricing_boxes}>
                                {pricingData.map((item, index) => (
                                    <div
                                        className={styles.pricing_box}
                                        key={index}
                                        data-aos="zoom-in"
                                        data-aos-delay={index * 100} // Tạo độ trễ để các box xuất hiện lần lượt
                                    >
                                        <div className={styles.pricing_header}>
                                            <span className={styles.pricing_title}>{item.title}</span>
                                        </div>
                                        <div className={styles.pricing_price_container}>
                                            <div className={styles.pricing_price_original}>{item.price}</div>
                                            <div className={styles.pricing_price_discounted}>
                                                {calculateDiscountedPrice(item.price)} / {item.according_to}
                                            </div>
                                        </div>
                                        <div className={styles.pricing_note}>{item.note}</div>
                                        <p className={styles.pricing_description}>{item.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Phần ghi chú và nút */}
                            <div className={styles.notes_and_buttons}>
                                <ul className={styles.notes_list}>
                                    {[
                                        'TopJobs này cần phải gắn với tin tuyển dụng chạy dịch vụ TopJobs',
                                        'Thời hạn sử dụng: tối đa 2 tuần / tin tuyển dụng chạy dịch vụ TopJobs / lần kích hoạt',
                                        'Dịch vụ cộng thêm sẽ kết thúc vào thời điểm tin tuyển dụng chạy dịch vụ TopJobs kết thúc',
                                        'Tăng khả năng tiếp cận ứng viên',
                                        'Đẩy tin tuyển dụng lên vị trí nổi bật, thu hút nhiều ứng viên hơn.',
                                        'Tiếp cận đúng đối tượng ứng viên mục tiêu nhanh chóng.',
                                        'Hỗ trợ phân tích hiệu quả tin tuyển dụng.',
                                    ].map((note, index) => (
                                        <li
                                            key={index}
                                            data-aos="fade-up"
                                            data-aos-delay={index * 100} // Tạo độ trễ để các bullet points xuất hiện lần lượt
                                        >
                                            <FontAwesomeIcon icon={faCircleCheck} />
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                                <div className={styles.flex_button} data-aos="fade-up" data-aos-delay="200">
                                    <button className={styles.btn_consult}>Đăng tin tuyển dụng ngay</button>
                                    <button className={styles.btn_post_now}>Xem thêm</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Service_price_list;
