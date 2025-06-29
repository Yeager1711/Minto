'use client';
import React, { useState, useEffect } from 'react';
import styles from './6.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faChevronRight, faHeart } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Template6() {
    const [isMapActive, setIsMapActive] = useState(false);

    const toggleMap = () => {
        setIsMapActive(!isMapActive);
    };

    // Calendar logic for August 2025
    const firstDayOfMonth = new Date(2025, 7, 1).getDay();
    const daysInMonth = 31; // August has 31 days
    const days = [];
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 100 });
    }, []);

    return (
        <div className={styles.template6}>
            <div className={styles.wrapper}>
                <div className={styles.mainImage}>
                    <img src="/images/m6/2.jpg" alt="Wedding couple" />
                    <div className={styles.overlay}>
                        <div className={styles.content}>
                            <div className={styles.saveTheDate} data-aos="fade-in" data-aos-delay="200">
                                Save the Date
                            </div>
                            <div className={styles.weddingOf} data-aos="fade-up" data-aos-delay="400">
                                THE WEDDING OF
                            </div>
                            <div className={styles.names}>
                                <div className={styles.names_flex}>
                                    <div data-aos="fade-right" data-aos-delay="600">
                                        Việt anh
                                    </div>
                                    <div className={styles.and} data-aos="fade-in" data-aos-delay="600">
                                        &
                                    </div>
                                    <div data-aos="fade-left" data-aos-delay="600">
                                        Ngọc Khánh
                                    </div>
                                </div>
                            </div>
                            <div className={styles.dateTime} data-aos="fade-up" data-aos-delay="800">
                                17 Tháng 8, 2025 | Chủ Nhật, Lúc: 10:00 AM
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.info_family}>
                    <div className={styles.flex_representative}>
                        <div className={styles.representative_house} data-aos="fade-right" data-aos-delay="300">
                            <span>Nhà trai</span>
                            <h3>Ông: Nguyễn văn A</h3>
                            <h3>Bà: Trần Thị B</h3>
                        </div>
                        <div className={styles.representative_house} data-aos="fade-left" data-aos-delay="300">
                            <span>Nhà gái</span>
                            <h3>Ông: Lê văn C</h3>
                            <h3>Bà: Phạm thị D</h3>
                        </div>
                    </div>

                    <div className={styles.name_groom__bride}>
                        <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="500">
                            Việt Anh
                        </div>
                        <div className={styles.image_happy} data-aos="fade-in" data-aos-delay="500">
                            <img src="/images/m6/happy_img.png" alt="" />
                        </div>
                        <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="500">
                            Ngọc Khánh
                        </div>
                    </div>

                    <p className={styles.text} data-aos="fade-up" data-aos-delay="600">
                        Trân trọng kính mời Quý Khách
                        <br />
                        Đến dự Lễ Thành Hôn của hai con chúng tôi
                    </p>

                    <div className={styles.flex_info_map}>
                        <div className={styles.flex}>
                            <div className={styles.flex_left} data-aos="fade-right" data-aos-delay="300">
                                <p className={styles.at}>Lúc 10:00</p>
                                <div className={styles.dateBox}>
                                    <div>Chủ Nhật</div>
                                    <div className={styles.day}>
                                        <strong>17</strong>
                                    </div>
                                    <div className={styles.month}>
                                        <strong>08</strong>
                                    </div>
                                </div>
                                <p className={styles.year}>
                                    <strong>2025</strong>
                                </p>
                            </div>

                            <div className={styles.flex_right} data-aos="fade-left" data-aos-delay="500">
                                <div className={styles.info}>
                                    <div className={styles.address_groom}>
                                        <h3>Địa chỉ nhà Trai</h3>
                                        <p>Trung Tâm Hội Nghị - Tiệc Cưới Diamond Place</p>

                                        <button className={styles.btn_location} onClick={toggleMap}>
                                            <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                        </button>
                                    </div>

                                    <div className={styles.address_bride}>
                                        <h3>Địa chỉ nhà Gái</h3>
                                        <p>Trung Tâm Hội Nghị - Tiệc Cưới Diamond Place</p>

                                        <button className={styles.btn_location} onClick={toggleMap}>
                                            <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.calendar} data-aos="fade-up" data-aos-delay="700">
                            <div className={styles.calendar_header}>
                                <h3>Tháng 8, 2025</h3>
                            </div>
                            <div className={styles.calendar_grid}>
                                <div className={styles.calendar_day}>CN</div>
                                <div className={styles.calendar_day}>T2</div>
                                <div className={styles.calendar_day}>T3</div>
                                <div className={styles.calendar_day}>T4</div>
                                <div className={styles.calendar_day}>T5</div>
                                <div className={styles.calendar_day}>T6</div>
                                <div className={styles.calendar_day}>T7</div>
                                {days.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.calendar_date} ${day === 17 ? styles.wedding_date : ''}`}
                                    >
                                        {day || ''}
                                        {day === 17 && <FontAwesomeIcon icon={faHeart} className={styles.heart_icon} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={`${styles.map} ${isMapActive ? styles.active : ''}`}>
                            <div className={styles.map_wrapper}>
                                <div className={styles.btn_close} onClick={toggleMap}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </div>

                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18596.052244317845!2d106.64885385906803!3d10.791710158025271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529281040a431%3A0x7ff3572ff87b852a!2zVHJ1bmcgdMOibSBI4buZaSBuZ2jhu4ggLSBUaeG7h2MgY8aw4bubaSBEaWFtb25kIFBsYWNl!5e1!3m2!1svi!2s!4v1751166267710!5m2!1svi!2s"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    <p className={styles.lunarDay} data-aos="fade-up" data-aos-delay="900">
                        (Nhằm Ngày 24 tháng 06 năm ất tỵ)
                    </p>
                    <p className={styles.note} data-aos="fade-up" data-aos-delay="1100">
                        Rất hân hạnh được đón tiếp!
                    </p>
                </div>

                <div className={styles.flex_photo}>
                    <div className={styles.box_photo}>
                        <img src="/images/m6/1.jpg" alt="" data-aos="fade-right" data-aos-delay="300" />
                    </div>

                    <div className={styles.box_photo}>
                        <img src="/images/m6/2.jpg" alt="" data-aos="fade-in" data-aos-delay="600" />
                    </div>

                    <div className={styles.box_photo}>
                        <img src="/images/m6/3.jpg" alt="" data-aos="fade-left" data-aos-delay="900" />
                    </div>
                </div>

                <div className={styles.love_story}>
                    <div className={styles.title} data-aos="fade-in" data-aos-delay="300">
                        <img src="/images/m6/love_story.png" alt="" />
                    </div>

                    <div className={styles.groom}>
                        <div className={styles.wrapper_groom}>
                            <div className={styles.image_groom} data-aos="fade-right" data-aos-delay="300">
                                <img src="/images/m6/4.jpg" alt="" />
                            </div>
                            <div className={styles.groom_name__story}>
                                <p data-aos="fade-right" data-aos-delay="600">
                                    Chú Rể
                                </p>
                                <h3 data-aos="fade-right" data-aos-delay="900">
                                    Việt Anh
                                </h3>
                            </div>
                        </div>
                        <div className={styles.groom_str} data-aos="fade-up" data-aos-delay="1100">
                            <p>
                                Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày
                                đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp
                                nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp
                                được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                            </p>
                        </div>
                    </div>
                    <div className={styles.bride}>
                        <div className={styles.wrapper_bride}>
                            <div className={styles.bride_name__story}>
                                <p data-aos="fade-left" data-aos-delay="600">
                                    Cô dâu
                                </p>
                                <h3 data-aos="fade-left" data-aos-delay="900">
                                    Ngọc Khánh
                                </h3>
                            </div>
                            <div className={styles.image_bride} data-aos="fade-left" data-aos-delay="300">
                                <img src="/images/m6/2.jpg" alt="" />
                            </div>
                        </div>
                        <div className={styles.bride_str} data-aos="fade-up" data-aos-delay="1100">
                            <p>
                                Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm
                                sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta
                                sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh
                                nhé!
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.love_img}>
                    <div className={styles.flower_center}>
                        <img src="/images/m6/flower_center.png" alt="" />
                    </div>

                    <div className={styles.love_img__wrapper}>
                        <div className={styles.flex}>
                            <div className={styles.love_img__1} data-aos="fade-right" data-aos-delay="300">
                                <img src="/images/m6/7.jpg" alt="" />
                            </div>

                            <div className={styles.love_img__2} data-aos="fade-right" data-aos-delay="600">
                                <img src="/images/m6/6.jpg" alt="" />
                            </div>
                        </div>

                        <div className={styles.love_img__3} data-aos="fade-up" data-aos-delay="900">
                            <img src="/images/m6/5.jpg" alt="" />
                        </div>
                    </div>
                </div>

                <div className={styles.album_wedding}>
                    <div className={styles.title} data-aos="fade-in" data-aos-delay="300">
                        <img src="/images/m6/albumWedding_text.png" alt="" />
                    </div>

                    <div className={styles.wrapper_bg}>
                        <div className={styles.collage_left}>
                            <div className={styles.img1} data-aos="fade-up" data-aos-delay="300">
                                <img src="/images/m6/1.jpg" alt="" />{' '}
                            </div>
                            <div className={styles.img2} data-aos="fade-right" data-aos-delay="600">
                                <img src="/images/m6/2.jpg" alt="" />{' '}
                            </div>
                            <div className={styles.img3} data-aos="fade-up" data-aos-delay="900">
                                <img src="/images/m6/3.jpg" alt="" />{' '}
                            </div>
                        </div>
                        <div className={styles.collage_right}>
                            <div className={styles.img4} data-aos="fade-left" data-aos-delay="1100">
                                <img src="/images/m6/7.jpg" alt="" />{' '}
                            </div>
                            <div className={styles.img5} data-aos="fade-left" data-aos-delay="1400">
                                <img src="/images/m6/5.jpg" alt="" />
                            </div>
                            <div className={styles.img6} data-aos="fade-left" data-aos-delay="1700">
                                <img src="/images/m6/6.jpg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.column_text}>
                        <h3 data-aos="fade-up" data-aos-delay="1000">
                            Thank You
                        </h3>
                        <span className={styles.subtext} data-aos="fade-up" data-aos-delay="2000">
                            Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                            <br />
                            trong ngày đặc biệt của chúng tôi.
                        </span>
                    </div>

                    <img src="/images/m6/footer.png" alt="" />
                </div>
            </div>
        </div>
    );
}

export default Template6;
