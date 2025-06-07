'use client';
import React, { useEffect } from 'react';
import styles from '../../../3.module.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Template3Edit() {
    // Generate days for June 2025
    const daysInJune2025 = Array.from({ length: 30 }, (_, i) => i + 1); // June has 30 days
    const firstDayOfJune2025 = new Date(2025, 5, 1).getDay(); // June 1, 2025 is Sunday (0)

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 1000, // Animation duration in milliseconds
            once: true, // Animation happens only once on scroll
        });
    }, []);

    return (
        <div className={styles.template3}>
            <div className={styles.intro_invition}>
                <div className={styles.wrapper}>
                    <div className={styles.image_psb__TL}>
                        <img src="/images/m3/t2.png" alt="" />
                    </div>
                    <div className={styles.image_psb__BR}>
                        <img src="/images/m3/t2.png" alt="" />
                    </div>
                    <div className={styles.text}>Wedding Invitons</div>
                    <div className={styles.mar}>
                        <div className={styles.groom_name}>Huỳnh Nam</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>Trúc Giang</div>
                    </div>
                    <div className={styles.box_dateTime}>
                        <div className={styles.dateTime}>
                            <span className={styles.day}>06</span>
                            <span className={styles.month}>Tháng 6</span>
                            <span className={styles.year}>2025</span>
                        </div>
                        <div className={styles.inviton_name}>
                            <span className={styles.invition}>Kính mời</span>
                            <h3 className={styles.name}>Huỳnh Nam</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.header} data-aos="fade-up">
                <div className={styles.flower_left} data-aos="fade-right" data-aos-delay="200">
                    <img src="/images/m3/t1.png" alt="Flower decoration left" />
                </div>
                <div className={styles.flower_right} data-aos="fade-left" data-aos-delay="200">
                    <img src="/images/m3/t1.png" alt="Flower decoration right" />
                </div>
                <div className={styles.header_content}>
                    <h4 data-aos="zoom-in" data-aos-delay="300">
                        Save the Date
                    </h4>

                    <div className={styles.imageMain} data-aos="fade-up" data-aos-delay="600">
                        <img src="/images/m3/3.jpg" alt="Couple" />
                    </div>

                    <div className={styles.groom_bride} data-aos="fade-up" data-aos-delay="400">
                        <h3>Huỳnh Nam & Trúc Giang</h3>
                    </div>
                    <div className={styles.invitation_details} data-aos="fade-up" data-aos-delay="500">
                        <p>WE INVITE YOU TO JOIN OUR WEDDING CEREMONY ON</p>
                        <p className={styles.date_time}>
                            <span>FRIDAY</span>
                            <span>JUNE 06</span>
                            <span>AT 11:30 AM</span>
                        </p>
                        <p className={styles.year}>2025</p>
                        <div className={styles.location}>
                            <p>FAUGET HOTEL</p>
                            <p>123 ANYWHERE ST, ANY CITY</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.info_groom_bride} data-aos="fade-up">
                <div className={styles.info_wrapper} data-aos="zoom-in" data-aos-delay="200">
                    <div className={styles.info__groom}>
                        <span>Nhà trai</span>
                        <h3>Ông: Huỳnh Văn A</h3>
                        <h3>Bà: Trần thị B</h3>
                        <span className={styles.location}>Thành phố Thủ Đức, TP. HCM</span>
                    </div>
                    <div className={styles.info__bride}>
                        <span>Nhà gái</span>
                        <h3>Ông: Huỳnh Văn C</h3>
                        <h3>Bà: Trần thị D</h3>
                        <span className={styles.location}>Thành phố Thủ Đức, TP. HCM</span>
                    </div>
                </div>
                <div className={styles.mar} data-aos="fade-up" data-aos-delay="300">
                    <div className={styles.groom_name}>Huỳnh Nam</div>
                    <div className={styles.and}>&</div>
                    <div className={styles.bride_name}>Trúc Giang</div>
                </div>
                <div className={styles.best_regards} data-aos="fade-up" data-aos-delay="400">
                    Trân trọng kính mời
                </div>
                <div className={styles.text} data-aos="fade-up" data-aos-delay="500">
                    Đến dự buổi tiệc chung vui cùng gia đình chúng tôi
                </div>

                <div className={styles.flex_image} data-aos="fade-up" data-aos-delay="600">
                    <div className={styles.image_1}>
                        <img src="/images/m3/3.jpg" alt="" />
                    </div>
                    <div className={styles.image_2}>
                        <img src="/images/m3/3.jpg" alt="" />
                    </div>
                    <div className={styles.image_3}>
                        <img src="/images/m3/3.jpg" alt="" />
                    </div>
                </div>

                <div className={styles.specifically} data-aos="fade-up" data-aos-delay="700">
                    <div className={styles.time_specifically}>
                        <span className={styles.time}>Thời Gian: 11h 30</span>
                        <span className={styles.day_specifically}>Thứ 6</span>
                    </div>
                    <div className={styles.date_specifically}>06.06.2025</div>
                    <div className={styles.dateLunar_specifically}>(Tức ngày 11 Tháng 05, Năm Ất Tỵ)</div>
                    <div className={styles.calendar}>
                        <img src="/images/m3/3.jpg" alt="Calendar Background" className={styles.calendarBackground} />
                        <div className={styles.calendarHeader}>Tháng 6, 2025</div>
                        <div className={styles.calendarGrid}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                <div key={day} className={styles.calendarDayHeader}>
                                    {day}
                                </div>
                            ))}
                            {Array.from({ length: firstDayOfJune2025 }).map((_, i) => (
                                <div key={`empty-${i}`} className={styles.calendarEmpty}></div>
                            ))}
                            {daysInJune2025.map((day) => (
                                <div
                                    key={day}
                                    className={`${styles.calendarDay} ${day === 6 ? styles.selectedDay : ''}`}
                                >
                                    {day}
                                    {day === 6 && <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.locations} data-aos="fade-up" data-aos-delay="800">
                    <div className={styles.organization_location_groom} data-aos="fade-right" data-aos-delay="200">
                        <div className={styles.text_organization__location}>
                            <h4>Địa điểm tổ chức nhà trai</h4>
                            <span>Thành phố Thủ Đức, TP. HCM</span>
                        </div>
                        <div className={styles.map_organization__location}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.1613492977117!2d106.12267417570054!3d10.408756865866465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a97ac6d7a68f3%3A0xf2c09119a7bde017!2z4bqobSBUaOG7sWMgTMO6YSBWw6BuZw!5e0!3m2!1svi!2s!4v1749198058540!5m2!1svi!2s"
                                width="300"
                                height="200"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    <div className={styles.organization_location_bride} data-aos="fade-left" data-aos-delay="300">
                        <div className={styles.map_organization__location}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.1613492977117!2d106.12267417570054!3d10.408756865866465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a97ac6d7a68f3%3A0xf2c09119a7bde017!2z4bqobSBUaOG7sWMgTMO6YSBWw6BuZw!5e0!3m2!1svi!2s!4v1749198058540!5m2!1svi!2s"
                                width="300"
                                height="200"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                        <div className={styles.text_organization__location}>
                            <h4>Địa điểm tổ chức nhà gái</h4>
                            <span>Thành phố Thủ Đức, TP. HCM</span>
                        </div>
                    </div>
                </div>

                <div className={styles.album_story} data-aos="fade-up" data-aos-delay="900">
                    <h3 data-aos="zoom-in" data-aos-delay="200">
                        Album ảnh
                    </h3>
                    <div className={styles.wrapper_album}>
                        <div data-aos="fade-left" data-aos-delay="300">
                            <img src="/images/m3/3.jpg" alt="Wedding moment 1" />
                        </div>
                        <div data-aos="fade-right" data-aos-delay="400">
                            <img src="/images/m3/3.jpg" alt="Wedding moment 2" />
                        </div>
                        <div data-aos="fade-right" data-aos-delay="500">
                            <img src="/images/m3/3.jpg" alt="Wedding moment 3" />
                        </div>
                        <div data-aos="fade-left" data-aos-delay="600">
                            <img src="/images/m3/3.jpg" alt="Wedding moment 4" />
                        </div>
                        <div data-aos="fade-up" data-aos-delay="700">
                            <img src="/images/m3/3.jpg" alt="Wedding moment 5" />
                        </div>
                        <div data-aos="fade-up" data-aos-delay="700">
                            <img src="/images/m3/3.jpg" alt="Wedding moment 5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.footer_thanks}>
                <div className={styles.image_footer} data-aos="fade-up" data-aos-delay="300">
                    <img src="/images/m3/3.jpg" alt="" />

                    <div className={styles.content}>
                        <span data-aos="fade-left" data-aos-delay="600">
                            Rất hân hạnh được đón tiếp
                        </span>
                        <h3 data-aos="fade-right" data-aos-delay="900">
                            Thanks You
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template3Edit;
