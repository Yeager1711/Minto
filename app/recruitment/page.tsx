import * as React from 'react';
import { useEffect } from 'react'; // Thêm useEffect
import styles from './recruitment.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos'; // Import AOS
import 'aos/dist/aos.css'; // Import CSS của AOS

function Recruitment() {
    // Khởi tạo AOS
    useEffect(() => {
        AOS.init({
            duration: 1000, // Thời gian hiệu ứng (ms)
            once: true, // Chỉ chạy hiệu ứng một lần khi cuộn
        });
    }, []);

    // Dữ liệu pricing
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
        <div className={styles.Recruitment}>
            <div className={styles.Recruitment_container}>
                <section className={styles.container_job__connect} data-aos="fade-up">
                    <h2 className={styles.title} data-aos="fade-up" data-aos-delay="100">
                        Nơi kết nối những người khởi nghiệp và người tìm việc
                    </h2>

                    <div className={styles.flex_button} data-aos="fade-up" data-aos-delay="200">
                        <button className={styles.btn_post_find_candidates}>Đăng tin tuyển dụng</button>
                        <button className={styles.find_jobss}>Tìm việc</button>
                    </div>
                </section>

                <section className={styles.service}>
                    <span className={styles.title_header} data-aos="fade-up">
                        RECRUITMENT SERVICES
                    </span>
                    <h2 className={styles.title} data-aos="fade-up" data-aos-delay="100">
                        Dịch vụ đăng tin tuyển dụng
                    </h2>

                    <div className={styles.flex_service}>
                        <div className={styles.image_service} data-aos="fade-right">
                            <img src="/images/recruitment/imgg-1.png" alt="" />
                        </div>

                        <div className={styles.contents_service} data-aos="fade-left">
                            <h3>Đăng tin tuyển dụng miễn phí</h3>

                            <p>Đăng tin tuyển dụng miễn phí và không giới hạn số lượng.</p>
                            <p>Đăng tin tuyển dụng dễ dàng, nhanh chóng.</p>
                            <p>Tiếp cận nguồn CV ứng viên khổng lồ, tìm kiếm ứng viên phù hợp nhất.</p>
                            <p>Dễ dàng kiểm duyệt và đăng tin trong 24h.</p>

                            <div className={styles.flex_button}>
                                <button className={styles.btn_post_find_candidates}>Đăng tin tuyển dụng</button>
                                <button className={styles.find_jobss}>Tìm việc</button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className={styles.service__add}>
                    <section>
                        <span className={styles.title_header} style={{ marginLeft: '2.5rem' }} data-aos="fade-up">
                            TOP ADD-ON
                        </span>
                        <h3 data-aos="fade-up" data-aos-delay="100">
                            Dịch vụ cộng thêm
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

                <section className={styles.about_us}>
                    <span className={styles.title_header} data-aos="fade-up">
                        About Us
                    </span>
                    <h2 className={styles.title} data-aos="fade-up" data-aos-delay="100">
                        Về chúng tôi
                    </h2>

                    <div className={styles.flex_about_us}>
                        <div className={styles.contents_about_us} data-aos="fade-right">
                            <p>
                                <a href="">JobMarket</a> tự hào là website tuyển dụng hàng đầu tại Việt Nam, tiên phong
                                trong việc kết nối ứng viên và nhà tuyển dụng thông qua các giải pháp công nghệ hiện
                                đại. Chúng tôi cam kết mang đến những sản phẩm tối ưu, giúp thị trường việc làm trở nên
                                hiệu quả và dễ tiếp cận hơn bao giờ hết.
                            </p>
                            <p>
                                Với nền tảng thông minh, <a href="">JobMarket</a> sở hữu hơn <span>921</span> khách hàng
                                doanh nghiệp lớn. Chúng tôi luôn kết nối thành công hàng trăm ứng viên với các cơ hội
                                việc làm phù hợp, tạo nên một cầu nối vững chắc giữa nhân tài và nhà tuyển dụng.
                            </p>
                            <p>
                                <a href="">JobMarket</a> không ngừng nghiên cứu và phát triển công nghệ lõi vượt trội,
                                đặc biệt là ứng dụng <a href="">Trí tuệ nhân tạo (AI)</a>. Điều này giúp chúng tôi tối
                                ưu hóa trải nghiệm số cho ứng viên, từ việc tìm kiếm việc làm đến ứng tuyển, đồng thời
                                hỗ trợ doanh nghiệp thu hút và giữ chân nhân tài một cách hiệu quả.
                            </p>
                            <p>
                                Sứ mệnh của <a href="">JobMarket</a> là mang đến các giải pháp tuyển dụng sáng tạo, giúp
                                doanh nghiệp xây dựng đội ngũ nhân sự chất lượng cao, đồng thời tạo điều kiện để ứng
                                viên phát triển sự nghiệp bền vững. Chúng tôi hướng tới việc góp phần xây dựng một thị
                                trường việc làm Việt Nam ngày càng phát triển và thịnh vượng.
                            </p>
                        </div>

                        <div className={styles.image_about_us} data-aos="fade-left">
                            <img src="/images/recruitment/recruitment_aboutUS.jpg" alt="" />
                        </div>
                    </div>
                </section>

                <section className={styles.values}>
                    <span className={styles.title_header} data-aos="fade-up">
                        VALUES
                    </span>
                    <h2 className={styles.title} data-aos="fade-up" data-aos-delay="100">
                        Giá trị khi sử dụng JobMarket Smart Recruitment Platform
                    </h2>

                    <div className={styles.flex_values}>
                        {/* Cột 1: Đối với Ứng viên */}
                        <div className={styles.box_values} data-aos="fade-right">
                            <div className={styles.image_values}>
                                <img src="/images/recruitment/candidate.jpg" alt="ứng viên" />
                            </div>
                            <div className={styles.contents_values}>
                                <h3>Đối với Ứng viên</h3>
                                <ul className={styles.values_list}>
                                    {[
                                        'Đưa các kỹ năng ứng viên trở thành lợi thế cạnh tranh của doanh nghiệp: giúp thúc đẩy hoạt động kinh doanh hiệu quả, hướng đến chuyển đổi số thành công.',
                                        'Danh giá "Mức độ cạnh tranh" dựa trên dữ liệu để đưa ra quyết định ứng viên có phù hợp với công việc không.',
                                        'Xây dựng thương hiệu ứng tuyển chuyên nghiệp.',
                                        'Tiết kiệm thời gian, cho hoạt động ứng tuyển.',
                                    ].map((value, index) => (
                                        <li key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                            {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Cột 2: Đối với Nhà tuyển dụng */}
                        <div className={styles.box_values} data-aos="fade-left">
                            <div className={styles.image_values}>
                                <img src="/images/recruitment/recruitment_3.jpg" alt="Nhà tuyển dụng" />
                            </div>
                            <div className={styles.contents_values}>
                                <h3>Đối với Nhà tuyển dụng</h3>
                                <ul className={styles.values_list}>
                                    {[
                                        'Quản lý tập trung tất cả các hoạt động tuyển dụng ra hiệu quả cho mọi vị trí tuyển dụng.',
                                        'Đăng tin tuyển dụng, tạo & quản lý nguồn ứng viên hiệu quả.',
                                        'Danh giá ứng viên toàn diện dựa trên dữ liệu để đưa ra quyết định tuyển dụng chính xác.',
                                        'Chủ động liên kết & tối ưu chiến dịch tuyển dụng theo các số liệu đo lường.',
                                    ].map((value, index) => (
                                        <li key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                            {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Recruitment;
