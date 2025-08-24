'use client';

import * as React from 'react';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './db.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

function DB() {
    const [showMap, setShowMap] = React.useState(false);

    useEffect(() => {
        AOS.init({
            duration: 1000, // Animation duration in milliseconds
            once: true, // Animations happen only once
        });
    }, []);

    return (
        <div className={styles.db}>
            <div className={styles.wrapper}>
                <div className={styles.content} data-aos="fade-up">
                    <div className={styles.img_top} data-aos="zoom-in">
                        <img src="/images/db/2.png" alt="" />
                    </div>
                    <div className={styles.text}>
                        <div className={styles.h1} data-aos="fade-right">
                            Trân trọng kính mời
                        </div>
                        <p data-aos="fade-left">
                            Anh/Chị đến tham dự buổi tiệc chia tay nhân dịp nghỉ hưu
                            <br />
                            Đây là dịp để cùng nhau ôn lại kỷ niệm và tri ân <br /> chặng đường đã qua.
                        </p>
                        <h3 data-aos="fade-right">Tại Tư Gia | 161 Lê Khả Phiêu, Khu phố 55, P.55, TP.HCM</h3>
                        <h4 data-aos="fade-left">17:00 | 29.08.2025</h4>

                        <div className={styles.wrapper_map}>
                            <div className={styles.btn_map} onClick={() => setShowMap(!showMap)} data-aos="zoom-in">
                                <FontAwesomeIcon icon={faLocationDot} /> Google map
                            </div>

                            <div className={`${styles.iframe_map} ${showMap ? styles.active : ''}`} data-aos="fade-up">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d4650.435464113933!2d106.5949600757027!3d10.69935126060937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTDCsDQxJzU3LjciTiAxMDbCsDM1JzUxLjEiRQ!5e1!3m2!1svi!2s!4v1756044634886!5m2!1svi!2s"
                                    width="0"
                                    height="0"
                                ></iframe>
                            </div>
                        </div>

                        <p className={styles.note} data-aos="fade-up">
                            <strong>*Sự kiện chỉ dành cho những khách mời đặc.*</strong>
                        </p>
                    </div>

                    <div className={styles.img_bottom} data-aos="zoom-in">
                        <img src="/images/db/4.png" alt="" />
                    </div>
                </div>

                <div className={styles.schedule} data-aos="fade-up">
                    <h3 data-aos="fade-right">Khung Giờ & Nội Dung</h3>
                    <div className={styles.timeline}>
                        <div className={styles.item} data-aos="fade-right" data-aos-delay="100">
                            <div className={styles.time}>17:00 - 17:30</div>
                            <div className={styles.schedule_content}>
                                <h4>Đón khách</h4>
                                <p>Khách mời tập trung tại s�️</p>
                            </div>
                        </div>

                        <div className={styles.item} data-aos="fade-right" data-aos-delay="200">
                            <div className={styles.time}>17:30 - 18:30</div>
                            <div className={styles.schedule_content}>
                                <h4>Ôn lại kỷ niệm & Tri ân</h4>
                                <p>Chia sẻ cảm xúc và lời cảm ơn</p>
                            </div>
                        </div>

                        <div className={styles.item} data-aos="fade-right" data-aos-delay="300">
                            <div className={styles.time}>18:30 - 21:00</div>
                            <div className={styles.schedule_content}>
                                <h4>Giao lưu & Tiệc chia tay</h4>
                                <p>Tiệc tối & văn nghệ</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.events} data-aos="fade-up">
                    <h2 data-aos="fade-right">Những Dấu Ấn Đáng Nhớ</h2>
                    <div className={styles.timeline}>
                        <div className={`${styles.event} ${styles.left}`} data-aos="fade-right" data-aos-delay="100">
                            <img src="/images/db/11.jpg" alt="Ngày đầu tiên" />
                            <div className={styles.caption}>
                                <h3>Ngày đầu tiên vào công ty</h3>
                                <p>Bỡ ngỡ xen lẫn háo hức khi bắt đầu hành trình mới cùng đồng nghiệp.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`} data-aos="fade-left" data-aos-delay="200">
                            <img src="/images/db/12.jpg" alt="Những ngày tháng gắn bó" />
                            <div className={styles.caption}>
                                <h3>Những ngày tháng gắn bó</h3>
                                <p>Những bữa cơm trưa, dự án và nụ cười đã trở thành kỷ niệm quý giá.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.left}`} data-aos="fade-right" data-aos-delay="300">
                            <img src="/images/db/16.jpg" alt="Dự án đầu tiên" />
                            <div className={styles.caption}>
                                <h3>Dự án đầu tiên – thử thách</h3>
                                <p>
                                    Bằng nỗ lực và đam mê, thành công đầu tiên đã tạo nền móng vững chắc cho sự nghiệp.
                                </p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`} data-aos="fade-left" data-aos-delay="400">
                            <img src="/images/db/18.jpg" alt="Đồng nghiệp như gia đình" />
                            <div className={styles.caption}>
                                <h3>Đồng nghiệp như gia đình</h3>
                                <p>Tình cảm gắn bó như anh em một nhà, sẻ chia công việc và cả trong cuộc sống.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.left}`} data-aos="fade-right" data-aos-delay="500">
                            <img src="/images/db/27.jpg" alt="Khoảnh khắc tập thể" />
                            <div className={styles.caption}>
                                <h3>Khoảnh khắc tập thể</h3>
                                <p>Những chuyến đi chơi, hội thao và hoạt động tập thể trở thành ký ức quý giá.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`} data-aos="fade-left" data-aos-delay="600">
                            <img src="/images/db/31.jpg" alt="Ngày nghỉ hưu" />
                            <div className={styles.caption}>
                                <h3>Khép lại – Mở ra</h3>
                                <p>35 năm một hành trình, hôm nay khép lại để mở ra chặng đường mới đầy ý nghĩa.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DB;
