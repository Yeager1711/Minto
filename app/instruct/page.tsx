'use client'; // Add this directive at the top
import * as React from 'react';
import styles from './instruct.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image'; // Import Image from next/image

function Instruct() {
    React.useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const handleScrollTo = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.instruct}>
            <h2 data-aos="fade-down">Hướng dẫn tạo và sử dụng template</h2>

            <div className={styles.instruct_wrapper}>
                <div className={styles.instruct_navigation}>
                    <span onClick={() => handleScrollTo('use-template')} className={styles.nav_item}>
                        Sử dụng Template
                    </span>
                    <span onClick={() => handleScrollTo('guest-list')} className={styles.nav_item}>
                        Hướng dẫn xem danh sách khách mời
                    </span>
                </div>

                <div className={styles.instruct_body}>
                    <div id="use-template" className={styles.section} data-aos="fade-up">
                        <h3>Sử dụng template</h3>
                        <div className={styles.instruct_use}>
                            <h4>Bước 1:</h4>
                            <span>Thực hiện đăng kí và đăng nhập tài khoản.</span>
                            <div className={styles.image}>
                                <Image
                                    src="/intruct/1.png"
                                    alt=""
                                    width={500} // Set a reasonable width
                                    height={300} // Set a reasonable height
                                    unoptimized // Disable optimization if needed (optional)
                                />
                            </div>
                        </div>

                        <div className={styles.instruct_use}>
                            <h4>Bước 2:</h4>
                            <span>
                                Lựa chọn những mẫu template, hoặc thực hiện tìm kiếm theo tên hoặc theo loại, ....
                            </span>
                            <div className={styles.image}>
                                <Image src="/intruct/2.png" alt="" width={500} height={300} unoptimized />
                            </div>
                        </div>

                        <div className={styles.instruct_use}>
                            <h4>Bước 3:</h4>
                            <span>
                                Tại giao diện popup: <strong>&quot;Chi tiết sản phẩm&quot;</strong> cho phép chọn số
                                lượng khách mời.
                            </span>
                            <div className={styles.image}>
                                <Image src="/intruct/3.png" alt="" width={500} height={300} unoptimized />
                            </div>
                        </div>

                        <div className={styles.instruct_use}>
                            <h4>Bước 4:</h4>
                            <span>
                                Tại giao diện: <strong>&quot;Thêm thông tin&quot;</strong>. Vui lòng thêm thông tin cần
                                và đầy đủ nhất.
                            </span>
                            <div className={styles.image}>
                                <Image src="/intruct/4.png" alt="" width={500} height={300} unoptimized />
                            </div>
                        </div>

                        <div className={styles.instruct_use}>
                            <h4>Bước 5:</h4>
                            <span>
                                Tại giao diện: <strong>&quot;Thêm hình ảnh&quot;</strong>. Click chọn trực tiếp vào hình
                                ảnh. &quot;Lưu ý, trong quá trình thêm ảnh hoặc đã thêm các ảnh trước đó, không thực
                                hiện thoát khỏi trang hay reload trang&quot;
                            </span>
                            <div className={styles.image}>
                                <Image src="/intruct/5.png" alt="" width={500} height={300} unoptimized />
                            </div>
                        </div>

                        <div className={styles.instruct_use}>
                            <h4>Bước 6:</h4>
                            <span>
                                Sau khi thực hiện thêm ảnh theo sở thích. Nhấn vào nút button down, sẽ hiển thị giao
                                diện <strong>&quot;Nhập tên khách mời&quot;</strong>. Vui lòng nhập đầy đủ, không bỏ
                                trống, và thực hiện thanh toán.
                            </span>
                            <div className={styles.image}>
                                <Image src="/intruct/6.png" alt="" width={500} height={300} unoptimized />
                            </div>
                        </div>
                    </div>

                    <div id="guest-list" className={styles.section} data-aos="fade-up">
                        <h3>Hướng dẫn xem danh sách khách mời và chia sẻ link</h3>
                        <div className={styles.instruct_use}>
                            <h4>Bước 1:</h4>
                            <span>
                                - Sau khi thanh toán thành công. Vào mục <strong>Tài khoản</strong> hoặc{' '}
                                <strong>lịch sử thanh toán</strong>
                            </span>
                            <span>
                                - Tại đây sẽ hiển thị các template bạn đã sử dụng, và Đơn hàng bạn đã thanh toán.
                            </span>
                            <div className={styles.image}>
                                <Image src="/intruct/7.png" alt="" width={500} height={300} unoptimized />
                            </div>
                        </div>

                        <div className={styles.instruct_use}>
                            <h4>Bước 2:</h4>
                            <span>
                                - Ở phần <strong>&quot;Đơn hàng và hóa đơn&quot;</strong>. Nhấp vào mục{' '}
                                <strong>&quot;Danh sách&quot;</strong> để hiển thị các khách mời bạn đã nhập trước đó và
                                đường link chia sẻ
                            </span>
                            <div className={styles.image}>
                                <Image src="/intruct/8.png" alt="" width={500} height={300} unoptimized />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Instruct;
