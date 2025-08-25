'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './db.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

// Define interface for timeLeft state
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function DB() {
    const [showMap, setShowMap] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });

        const targetDate = new Date('2025-08-29T17:00:00').getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const timeDifference = targetDate - now;

            if (timeDifference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        // Add keyboard event for accessibility
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedImage(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, []);

    // Type the modal handlers
    const openModal = (imageSrc: string) => {
        setSelectedImage(imageSrc);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className={styles.db}>
            <div className={styles.wrapper}>
                <div className={styles.content} data-aos="fade-up">
                    <div className={styles.img_top} data-aos="zoom-in">
                        <img src="/images/db/2.png" alt="" />
                    </div>
                    <div className={styles.text}>
                        <div className={styles.h1} data-aos="fade-right">
                            Thiệp Mời
                        </div>
                        <p data-aos="fade-left">
                            Trân trọng mời các em đến tham dự buổi tiệc chia tay nhân dịp về hưu.
                            <br />
                            Đây là dịp để chúng ta cùng nhau ôn lại những kỉ niệm, những khoảnh khắc đáng nhớ, khép lại
                            hành trình 35 năm con đường sự nghiệp để bước ra một chặng đường mới đầy ý nghĩa phía trước!
                        </p>
                        <h3 data-aos="fade-right">Tại Tư Gia | 161 Lê Khả Phiêu, Khu phố 55, P.55, TP.HCM</h3>
                        <h4 data-aos="fade-left">17:00 | 29.08.2025</h4>

                        <div className={styles.wrapper_map}>
                            <div className={styles.btn_map} onClick={() => setShowMap(!showMap)} data-aos="zoom-in">
                                <FontAwesomeIcon icon={faLocationDot as IconProp} /> Google map
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
                                <p>Khách mời tập trung tại nhà riêng</p>
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

                    <div className={styles.countDown} data-aos="fade-up">
                        <h3>Đếm ngược đến sự kiện</h3>
                        <div className={styles.countdownTimer}>
                            <div className={styles.countdownItem}>
                                <span>{timeLeft.days}</span>
                                <p>Ngày</p>
                            </div>
                            <div className={styles.countdownItem}>
                                <span>{timeLeft.hours}</span>
                                <p>Giờ</p>
                            </div>
                            <div className={styles.countdownItem}>
                                <span>{timeLeft.minutes}</span>
                                <p>Phút</p>
                            </div>
                            <div className={styles.countdownItem}>
                                <span>{timeLeft.seconds}</span>
                                <p>Giây</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.events} data-aos="fade-up">
                    <h2 data-aos="fade-right">Những Dấu Ấn Đáng Nhớ</h2>
                    <div className={styles.timeline}>
                        <div className={`${styles.event} ${styles.left}`} data-aos="fade-left" data-aos-delay="100">
                            <img
                                src="/images/db/25.jpg"
                                alt="Ngày đầu tiên"
                                onClick={() => openModal('/images/db/25.jpg')}
                            />
                            <div className={styles.caption}>
                                <h3>Chuyến công tác</h3>
                                <p>Để là hồi nào ai củng xinh gáii... cho đến tận bây giờ vẫn thế nhé các em 🥰 </p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`} data-aos="fade-right" data-aos-delay="100">
                            <img
                                src="/images/db/11.jpg"
                                alt="Ngày đầu tiên"
                                onClick={() => openModal('/images/db/11.jpg')}
                            />
                            <div className={styles.caption}>
                                <h3>Chuyến công tác</h3>
                                <p>Một chuyến công tác cùng các em nè 😉</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.left}`} data-aos="fade-left" data-aos-delay="200">
                            <img
                                src="/images/db/12.jpg"
                                alt="Những ngày tháng gắn bó"
                                onClick={() => openModal('/images/db/12.jpg')}
                            />
                            <div className={styles.caption}>
                                <h3>Những ngày tháng gắn bó</h3>
                                <p>Những bữa cơm trưa, dự án và nụ cười đã trở thành kỷ niệm quý giá.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`} data-aos="fade-right" data-aos-delay="300">
                            <img
                                src="/images/db/16.jpg"
                                alt="Dự án đầu tiên"
                                onClick={() => openModal('/images/db/16.jpg')}
                            />
                            <div className={styles.caption}>
                                <h3>Ai củng xinh hết nè nha 😉</h3>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.left}`} data-aos="fade-left" data-aos-delay="400">
                            <img
                                src="/images/db/18.jpg"
                                alt="Đồng nghiệp như gia đình"
                                onClick={() => openModal('/images/db/18.jpg')}
                            />
                            <div className={styles.caption}>
                                <h3>Đồng nghiệp như gia đình</h3>
                                <p>Tình cảm gắn bó như anh em một nhà, sẻ chia công việc và cả trong cuộc sống.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`} data-aos="fade-right" data-aos-delay="500">
                            <img
                                src="/images/db/27.jpg"
                                alt="Khoảnh khắc tập thể"
                                onClick={() => openModal('/images/db/27.jpg')}
                            />
                            <div className={styles.caption}>
                                <h3>Khoảnh khắc tập thể</h3>
                                <p>Những chuyến đi chơi, hội thao và hoạt động tập thể trở thành ký ức quý giá.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.left}`} data-aos="fade-left" data-aos-delay="600">
                            <img
                                src="/images/db/31.jpg"
                                alt="Ngày nghỉ hưu"
                                onClick={() => openModal('/images/db/31.jpg')}
                            />
                            <div className={styles.caption}>
                                <p>
                                    Cùng nhau vượt qua giai đoạn khó khăn cho đến hiện tại cùng nhau cô gắng tiếp cho
                                    hành trình phía trước khi không có chị nhé
                                </p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`} data-aos="fade-right" data-aos-delay="500">
                            <img
                                src="/images/db/28.jpg"
                                alt="Khoảnh khắc tập thể"
                                onClick={() => openModal('/images/db/28.jpg')}
                            />
                            <div className={styles.caption}>
                                <p>Cho tôi dừng lại khoảnh khắc này để nhớ...và sau này vẫn nhớ... ❤️</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for displaying clicked image */}
                {selectedImage && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <button className={styles.closeButton} onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes as IconProp} />
                            </button>
                            <img src={selectedImage} alt="Selected event" className={styles.modalImage} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DB;
