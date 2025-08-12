'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './13.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';

// Define TypeScript interface for weddingData
interface WeddingData {
    weddingDate?: Date;
}

// Define TypeScript interface for timeLeft
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function Template13() {
    // Default wedding data
    const weddingData: WeddingData = {
        weddingDate: new Date(2025, 8, 24, 18, 0, 0), // September 24, 2025, 18:00 (months are 0-based)
    };

    // Safely get the wedding date or default
    const weddingDate =
        weddingData.weddingDate instanceof Date && !isNaN(weddingData.weddingDate.getTime())
            ? weddingData.weddingDate
            : new Date(2025, 8, 24, 18, 0, 0);

    // Generate calendar days for the given month
    const generateCalendarDays = (date: Date): (number | null)[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 6 = Saturday
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Days in the month

        const calendarDays: (number | null)[] = [];

        // Add empty slots before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(day);
        }

        // Fill remaining slots to complete the last week
        const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
        for (let i = calendarDays.length; i < totalSlots; i++) {
            calendarDays.push(null);
        }

        return calendarDays;
    };

    const calendarDays = generateCalendarDays(weddingDate);

    // Countdown logic
    const calculateTimeLeft = (): TimeLeft => {
        const now = new Date();
        const difference = weddingDate.getTime() - now.getTime();

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
    const [showMap, setShowMap] = useState<'none' | 'groom' | 'bride'>('none');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    const handleShowMap = (mapType: 'groom' | 'bride') => {
        setShowMap(mapType);
    };

    const handleCloseMap = () => {
        setShowMap('none');
    };

    return (
        <div className={styles.template13}>
            <div className={styles.wrapper}>
                <div className={styles.wrapper_imageMain}>
                    <div className={styles.image_top}>
                        <img src="/images/m13/10.jpg" alt="" />
                    </div>

                    <div className={styles.image_bottom}>
                        <img src="/images/m13/13.jpg" alt="" />
                    </div>
                </div>

                <div className={styles.familyInfo}>
                    <div className={styles.wrapper_bar2}>
                        <div className={styles.familyContainer}>
                            <h1>
                                Trân Trọng kính mời đến dự buổi tiệc
                                <br />
                                Chung vui cùng gia đình chúng tôi
                            </h1>

                            <div className={styles.flex}>
                                <div className={styles.familySide}>
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông Nguyễn Văn A</span>
                                    <span>Bà: Trần Thị B</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                                <div className={styles.familySide}>
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: Lê Văn C</span>
                                    <span>Bà: Phạm Thị D</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                            </div>

                            <div className={styles.groom_and_bride}>
                                <div>Anh Tuấn</div>
                                <div>Thu Hà</div>
                            </div>

                            <div className={styles.dat}>
                                Lúc: <strong>18:00 || Thứ Tư, 24 tháng 09, 2025</strong>
                                <br />
                                <p>
                                    (Nhằm ngày <strong>03</strong> tháng <strong>09</strong> năm Ất Tỵ)
                                </p>
                                Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.groom_story}>
                    <div className={styles.story_text}>
                        <p>
                            Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                            nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                            đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người
                            con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                        </p>
                    </div>

                    <div className={styles.story_image_groom}>
                        <img src="/images/m13/3.jpg" alt="" />
                    </div>
                </div>

                <div className={styles.bride_story}>
                    <div className={styles.story_image_bride}>
                        <img src="/images/m13/5.jpg" alt="" />
                    </div>
                    <div className={styles.story_text}>
                        <p>
                            Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc
                            em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết
                            nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!
                        </p>
                    </div>
                </div>

                <div className={styles.calendar}>
                    <div className={styles.calendarHeader}>
                        <h3>
                            Tháng {weddingDate.getMonth() + 1}, {weddingDate.getFullYear()}
                        </h3>
                    </div>
                    <div className={styles.calendarGrid}>
                        <div className={styles.dayName}>CN</div>
                        <div className={styles.dayName}>T2</div>
                        <div className={styles.dayName}>T3</div>
                        <div className={styles.dayName}>T4</div>
                        <div className={styles.dayName}>T5</div>
                        <div className={styles.dayName}>T6</div>
                        <div className={styles.dayName}>T7</div>
                        {calendarDays.map((day, index) => {
                            const isWeddingDay = day === weddingDate.getDate();
                            const isValidDay = day !== null;
                            return (
                                <div
                                    key={index}
                                    className={`${styles.calendarDay} ${isWeddingDay ? styles.weddingDay : ''} ${
                                        !isValidDay ? styles.emptyDay : ''
                                    }`}
                                >
                                    {isValidDay && (
                                        <>
                                            {isWeddingDay ? (
                                                <span className={styles.weddingDayContent}>
                                                    {day}
                                                    <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
                                                </span>
                                            ) : (
                                                day
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.count}>
                    <div className={styles.bg_nen}>
                        <img src="/images/m13/12.jpg" alt="" />
                    </div>
                    <div className={`${styles.countdownContainer} ${showMap !== 'none' ? styles.hidden : ''}`}>
                        <div className={styles.timerSection}>
                            <h2 className={styles.title}>Đếm ngược đến ngày cưới</h2>
                            <div className={styles.timerDisplay}>
                                <div className={styles.timeGroup}>
                                    <span className={styles.timeValue}>{timeLeft.days}</span>
                                    <span className={styles.timeUnit}>Ngày</span>
                                </div>
                                <div className={styles.timeGroup}>
                                    <span className={styles.timeValue}>{timeLeft.hours}</span>
                                    <span className={styles.timeUnit}>Giờ</span>
                                </div>
                                <div className={styles.timeGroup}>
                                    <span className={styles.timeValue}>{timeLeft.minutes}</span>
                                    <span className={styles.timeUnit}>Phút</span>
                                </div>
                                <div className={styles.timeGroup}>
                                    <span className={styles.timeValue}>{timeLeft.seconds}</span>
                                    <span className={styles.timeUnit}>Giây</span>
                                </div>
                            </div>
                            <div className={styles.mapButtons}>
                                <button className={styles.mapButton} onClick={() => handleShowMap('groom')}>
                                    Nhà Trai
                                </button>
                                <button className={styles.mapButton} onClick={() => handleShowMap('bride')}>
                                    Nhà Gái
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.mapContainer} ${showMap !== 'none' ? styles.showMap : ''}`}>
                        <button className={styles.closeButton} onClick={handleCloseMap}>
                            Đóng
                        </button>
                        {showMap === 'groom' && (
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1665.2285083019567!2d144.95582693316328!3d-37.82500436238928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5173a284b5%3A0x958eeaf04deea384!2sMelbourne%20Convention%20and%20Exhibition%20Centre%20(MCEC)!5e1!3m2!1svi!2s!4v1754887217069!5m2!1svi!2s"
                                width=""
                                height=""
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showMap === 'bride' && (
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1665.230649281096!2d144.95613945465388!3d-37.824909479464615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad646b5d2ba4df7%3A0x4045675218ccd90!2sMelbourne%20Victoria%2C%20%C3%9Ac!5e1!3m2!1svi!2s!4v1754887232406!5m2!1svi!2s"
                                width=""
                                height=""
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                    </div>
                </div>

                <div className={styles.posterSection}>
                    <div className={styles.left}>
                        <div className={styles.overlayText}>
                            Our love <br /> story begins <br /> here.
                        </div>
                        <img src="/images/m13/10.jpg" alt="Main Couple" />
                    </div>
                    <div className={styles.right}>
                        <div className={styles.sideImage}>
                            <img src="/images/m13/13.jpg" alt="Couple Side 1" />
                        </div>
                        <div className={styles.sideImage}>
                            <img src="/images/m13/3.jpg" alt="Couple Side 2" />
                        </div>
                        <div className={styles.quoteText}>
                            <p>
                                <strong> She.</strong> <br /> &quot;I knew the first time he saw you, he would never let go.&quot;
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.title_album}>wedding album</div>
                <div className={styles.bento_image}>
                    <img src="/images/m13/8.jpg" alt="" className={styles.img1} />
                    <img src="/images/m13/2.jpg" alt="" className={styles.img2} />
                    <img src="/images/m13/3.jpg" alt="" className={styles.img3} />
                    <img src="/images/m13/4.jpg" alt="" className={styles.img4} />
                    <img src="/images/m13/5.jpg" alt="" className={styles.img5} />
                    <img src="/images/m13/6.jpg" alt="" className={styles.img6} />
                    <img src="/images/m13/7.jpg" alt="" className={styles.img7} />
                    <img src="/images/m13/1.jpg" alt="" className={styles.img8} />
                </div>

                <div className={styles.footer}>
                    <div className={styles.column_text}>
                        <h3>Thank You</h3>
                        <span className={styles.subtext}>
                            Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                            <br />
                            trong ngày đặc biệt của chúng tôi.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template13;
