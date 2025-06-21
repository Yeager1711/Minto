'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faLocationDot, faTimes, faHeart } from '@fortawesome/free-solid-svg-icons';
import styles from './5.module.css';

function Template5() {
    // Define the days of December 2025 (Tuesday, December 23 is the wedding day)
    const daysInDecember = Array.from({ length: 31 }, (_, i) => i + 1);
    const firstDayOfMonth = new Date(2025, 11, 1).getDay(); // December 1, 2025 is a Monday (1)
    const paddingDays = Array(firstDayOfMonth).fill(null); // Add padding for days before Dec 1

    // Countdown logic
    const weddingDate = new Date(2025, 11, 23, 11, 0, 0); // December 23, 2025, 11:00 AM
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // Modal visibility state
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const timeDiff = weddingDate.getTime() - now.getTime();

            if (timeDiff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown(); // Initial call
        const interval = setInterval(updateCountdown, 1000); 

        return () => {
            clearInterval(interval); 
        };
    }, []);

    // Toggle modal visibility
    const toggleModal = () => {
        setShowModal((prev) => !prev);
    };

    return (
        <div className={styles.template5}>
            <div className={styles.intro}>
                <div className={styles.content_intro}>
                    <div className={styles.intro_header}>
                        <span>Save the date</span>
                        <h3 className={styles.representative}>Anh Duy & Bảo Ngọc</h3>
                        <p className={styles.day}>23.12.2025</p>
                    </div>
                    <div className={styles.calendar_intro}>
                        <h2 className={styles.month}>Tháng 12, 2025</h2>
                        <div className={styles.days_of_week}>
                            <span>T2</span>
                            <span>T3</span>
                            <span>T4</span>
                            <span>T5</span>
                            <span>T6</span>
                            <span>T7</span>
                            <span>CN</span>
                        </div>
                        <div className={styles.dates}>
                            <span>22</span>
                            <span className={styles.highlighted}>
                                23 <FontAwesomeIcon icon={faHeart} className={styles.heart_icon} />
                            </span>
                            <span>24</span>
                            <span>25</span>
                            <span>26</span>
                            <span>27</span>
                            <span>28</span>
                        </div>
                    </div>
                    <div className={styles.invitions_name}>
                        Trân trọng kính mời: <strong>Huỳnh Nam</strong>
                    </div>
                </div>
            </div>

            <div className={styles.saveTheDate}>
                <div className={styles.saveTheDate_wrapper}>
                    <div className={styles.img_std}>
                        <img src="/images/std/img_std.png" alt="" />
                    </div>

                    <div className={styles.groom_bride__name}>
                        <h3 className={styles.groom_names}>Anh Duy</h3>
                        <h3 className={styles.bride_names}>Bảo Ngọc</h3>
                    </div>
                    <p className={styles.text}>
                        Thân mời Quý Khách tới tham dự
                        <br />
                        Lễ Thành Hôn của hai chúng tôi
                    </p>
                    <p className={styles.at}>Vào lúc 11:00</p>
                    <div className={styles.dateBox}>
                        <div>
                            THỨ
                            <br />
                            BA
                        </div>
                        <div className={styles.day}>
                            NGÀY
                            <br />
                            <strong>23</strong>
                        </div>
                        <div>
                            THÁNG
                            <br />
                            12
                        </div>
                    </div>
                    <p className={styles.year}>Năm 2025</p>
                    <p className={styles.lunarDay}>(Tức 17 tháng 11 năm ất tỵ)</p>
                    <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                </div>
            </div>
            <div className={styles.groom}>
                <div className={styles.wrapper_groom}>
                    <div className={styles.image_groom}>
                        <img src="/images/m5/5.jpg" alt="" />
                    </div>
                    <div className={styles.groom_name}>
                        <p>Chú Rể</p>
                        <h3>Anh Duy</h3>
                    </div>
                </div>
                <div className={styles.groom_str}>
                    <p>
                        Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                        nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                        đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con
                        gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                    </p>
                </div>
            </div>
            <div className={styles.bride}>
                <div className={styles.wrapper_bride}>
                    <div className={styles.bride_name}>
                        <p>Cô dâu</p>
                        <h3>Bảo Ngọc</h3>
                    </div>
                    <div className={styles.image_bride}>
                        <img src="/images/m5/3.jpg" alt="" />
                    </div>
                </div>
                <div className={styles.bride_str}>
                    <p>
                        Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em
                        thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một
                        chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!
                    </p>
                </div>
            </div>
            <div className={styles.calendar}>
                <div className={styles.imageMainCalendar}>
                    <img src="/images/m5/8.jpg" alt="" />
                </div>
                <div className={styles.calendar_wrapper}>
                    <div className={styles.info_wrapper}>
                        <div className={styles.info__groom}>
                            <span>Nhà trai</span>
                            <h3>Ông: Huỳnh Văn A</h3>
                            <h3>Bà: Trần Thị B</h3>
                            <span className={styles.location}>Trung tâm Hội nghị - Tiệc cưới Diamond Place</span>
                        </div>
                        <div className={styles.info__bride}>
                            <span>Nhà gái</span>
                            <h3>Ông: Lê Văn C</h3>
                            <h3>Bà: Trần Thị D</h3>
                            <span className={styles.location}>Trung tâm Hội nghị - Tiệc cưới Diamond Place</span>
                        </div>
                    </div>
                    <h3 className={styles.calendar_title}>
                        <span>Tháng 12, 2025</span>
                    </h3>
                    <div className={styles.calendar_grid}>
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                            <div key={day} className={styles.weekday}>
                                {day}
                            </div>
                        ))}
                        {paddingDays.map((_, index) => (
                            <div key={`pad-${index}`} className={styles.empty_day}></div>
                        ))}
                        {daysInDecember.map((day) => (
                            <div key={day} className={`${styles.calendar_day} ${day === 23 ? styles.wedding_day : ''}`}>
                                {day}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.countdown}>
                    <div className={styles.countdown_wrapper}>
                        <h4 className={styles.countdown_title}>đếm ngược thời gian tới ngày cưới của chúng mình</h4>
                        <div className={styles.countdown_grid}>
                            <div className={styles.countdown_item}>
                                <span className={styles.countdown_number}>{timeLeft.days}</span>
                                <span className={styles.countdown_label}>Ngày</span>
                            </div>
                            <div className={styles.countdown_item}>
                                <span className={styles.countdown_number}>{timeLeft.hours}</span>
                                <span className={styles.countdown_label}>Giờ</span>
                            </div>
                            <div className={styles.countdown_item}>
                                <span className={styles.countdown_number}>{timeLeft.minutes}</span>
                                <span className={styles.countdown_label}>Phút</span>
                            </div>
                            <div className={styles.countdown_item}>
                                <span className={styles.countdown_number}>{timeLeft.seconds}</span>
                                <span className={styles.countdown_label}>Giây</span>
                            </div>
                        </div>
                        <div className={styles.btn_show_the_way} onClick={toggleModal}>
                            Chỉ đường
                            <FontAwesomeIcon icon={faLocationDot} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.collage}>
                <div className={styles.collage_left}>
                    <div className={styles.img1}>
                        <img src="/images/m5/1.jpg" alt="" />
                    </div>
                    <div className={styles.img2}>
                        <img src="/images/m5/2.jpg" alt="" />
                    </div>
                    <div className={styles.img3}>
                        <img src="/images/m5/4.jpg" alt="" />
                    </div>
                </div>
                <div className={styles.collage_right}>
                    <div className={styles.img4}>
                        <img src="/images/m5/6.jpg" alt="" />
                    </div>
                    <div className={styles.img5}>
                        <img src="/images/m5/7.jpg" alt="" />
                    </div>
                </div>
            </div>
            <div className={styles.footer}>
                <div className={styles.btn_invitionQR__popop}>
                    Mừng cưới
                    <FontAwesomeIcon icon={faGift} />
                </div>
            </div>

            <div className={styles.footer_image}>
                <div className={styles.image_ft}>
                    <img src="/images/m5/12.jpg" alt="couple" />
                </div>

                <div className={styles.wrapper_ft__grid}>
                    <div className={styles.column}>
                        <div className={styles.image_grid}>
                            <img src="/images/m5/1.jpg" alt="wedding hands" />
                            <img src="/images/m5/2.jpg" alt="wedding bouquet" />
                        </div>
                    </div>
                    <div className={styles.column_text}>
                        <h3>Thank You</h3>
                        <span className={styles.subtext}>
                            Cảm ơn Quý Khách vì đã trở thành một phần quan trọng trong ngày đặc biệt của chúng tôi.
                        </span>

                        <span className={styles.details}>Anh Duy & Bảo Ngọc</span>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.image_grid}>
                            <img src="/images/m5/3.jpg" alt="wedding dress" />
                            <img src="/images/m5/4.jpg" alt="wedding hands" />
                        </div>
                    </div>
                </div>

                <div className={styles.bottom_image}>
                    <img src="/images/m5/11.jpg" alt="wedding table" />
                </div>
            </div>

            <div className={`${styles.model_showTheway} ${showModal ? styles.show : ''}`}>
                <div className={`${styles.popup_showTheway__wrapper} ${showModal ? styles.show : ''}`}>
                    <button className={styles.close_button} onClick={() => setShowModal(false)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h3>Hướng dẫn chỉ đường</h3>
                    <div className={styles.locaion_groom}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4648.8717907427035!2d106.67267237570341!3d10.800840458741545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529281040a431%3A0x7ff3572ff87b852a!2zVHJ1bmcgdMOibSBI4buZaSBuZ2jhu4sgLSBUaeG7h2MgY8aw4bubaSBEaWFtb25kIFBsYWNl!5e1!3m2!1svi!2s!4v1750317533251!5m2!1svi!2s"
                            width="600"
                            height="450"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                        <div className={styles.content_groom}>
                            <div className={styles.wrapper_groom}>
                                <div className={styles.groom_name}>
                                    <p>Chú Rể</p>
                                    <h3>Anh Duy</h3>
                                </div>
                                <div className={styles.image_groom}>
                                    <img src="/images/m5/5.jpg" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.locaion_bride}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4648.8717907427035!2d106.67267237570341!3d10.800840458741545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529281040a431%3A0x7ff3572ff87b852a!2zVHJ1bmcgdMOibSBI4buZaSBuZ2jhu4sgLSBUaeG7h2MgY8aw4bubaSBEaWFtb25kIFBsYWNl!5e1!3m2!1svi!2s!4v1750317533251!5m2!1svi!2s"
                            width="600"
                            height="450"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                        <div className={styles.content_bride}>
                            <div className={styles.wrapper_bride}>
                                <div className={styles.bride_name}>
                                    <p>Cô dâu</p>
                                    <h3>Bảo Ngọc</h3>
                                </div>
                                <div className={styles.image_bride}>
                                    <img src="/images/m5/3.jpg" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template5;
