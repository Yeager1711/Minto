'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './15.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';

// Định nghĩa interface cho weddingData
interface WeddingData {
    weddingDate: Date;
    groomMapUrl: string;
    brideMapUrl: string;
}

// Định nghĩa interface cho timeLeft
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const Template15Edit: React.FC = () => {
    // Dữ liệu giả lập
    const weddingData: WeddingData = {
        weddingDate: new Date('2025-09-17T18:00:00+07:00'),
        groomMapUrl:
            'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.299146126312!2d144.9559277!3d-37.8252498!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5374b6a383%3A0xd0d9b0f61a69b9b!2sWeddings%20Crown%20Melbourne!5e1!3m2!1svi!2s!4v1755491005859!5m2!1svi!2s',
        brideMapUrl:
            'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.299146126312!2d144.9559277!3d-37.8252498!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s(pretty long string shortened for readability)!2sMelbourne%20Convention%20and%20Exhibition%20Centre%20(MCEC)!5e1!3m2!1svi!2s!4v1755491020663!5m2!1svi!2s',
    };

    // State cho countdown
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // State cho bản đồ
    const [showGroomMap, setShowGroomMap] = useState<boolean>(false);
    const [showBrideMap, setShowBrideMap] = useState<boolean>(false);

    // State cho lịch
    const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);

    // Hàm tính countdown
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = weddingData.weddingDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / (1000 * 60)) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [weddingData.weddingDate]);

    // Hàm tạo lịch
    useEffect(() => {
        const generateCalendarDays = () => {
            const year = weddingData.weddingDate.getFullYear();
            const month = weddingData.weddingDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const days: (number | null)[] = [];
            // Thêm các ô trống cho ngày đầu tháng
            for (let i = 0; i < firstDay; i++) {
                days.push(null);
            }
            // Thêm các ngày trong tháng
            for (let i = 1; i <= daysInMonth; i++) {
                days.push(i);
            }
            setCalendarDays(days);
        };

        generateCalendarDays();
    }, [weddingData.weddingDate]);

    // Hàm xử lý click bản đồ chú rể
    const handleGroomMapClick = (): void => {
        setShowGroomMap(!showGroomMap);
        setShowBrideMap(false); // Tắt bản đồ cô dâu nếu đang mở
    };

    // Hàm xử lý click bản đồ cô dâu
    const handleBrideMapClick = (): void => {
        setShowBrideMap(!showBrideMap);
        setShowGroomMap(false); // Tắt bản đồ chú rể nếu đang mở
    };

    return (
        <div className={styles.Template15}>
            <div className={styles.wrapper}>
                <div className={styles.mainImage}>
                    <img src="/images/m15/1.jpg" alt="" />
                    <div className={styles.content_main}>
                        <div className={styles.groom_name}>Anh Khoa</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>Thanh Huyền</div>
                    </div>
                </div>

                <div className={styles.familyInfo}>
                    <div className={styles.wrapper_bar2}>
                        <div className={styles.familyContainer}>
                            <h1>
                                We joyfully invite you to join us in celebrating the wedding of our beloved children
                            </h1>
                            <div className={styles.flex}>
                                <div className={styles.familySide}>
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông Nguyễn Văn A</span>
                                    <span>Bà Trần Thị B</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                                <div className={styles.familySide}>
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông Lê Văn C</span>
                                    <span>Bà Phạm Thị D</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                            </div>
                            <div className={styles.groom_and_bride}>
                                <div>Anh Khoa</div>
                                <div>Thanh Huyền</div>
                            </div>
                            <div className={styles.dat}>
                                At: <strong>18:00 || Wednesday, November 17, 2025</strong>
                                <br />
                                <p>
                                    (Nhằm ngày <strong>28</strong> tháng <strong>09</strong> năm Ất Tỵ)
                                </p>
                                Your presence will be our greatest joy and honor.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.banner_date}>
                    <div className={styles.text_png}>
                        <img src="/images/m15/std_1__text.png" alt="" />
                    </div>
                    <div className={styles.dateRow}>
                        <span>17</span>
                        <span>11</span>
                        <span>25</span>
                    </div>
                    <div className={styles.photos}>
                        <img src="/images/m15/5.jpg" alt="Wedding 1" />
                        <img src="/images/m15/2.jpg" alt="Wedding 2" />
                        <img src="/images/m15/3.jpg" alt="Wedding 3" />
                    </div>
                    <div className={styles.love_story}>
                        <div className={styles.image_title}>
                            <img src="/images/m15/love_story.png" alt="Love Story" />
                        </div>
                        <div className={styles.story_wrapper}>
                            <div className={styles.story_box}>
                                <div className={styles.story_image}>
                                    <img src="/images/m15/9.jpg" alt="Groom Story" />
                                </div>
                                <div className={styles.story_text}>
                                    <h3>The Groom&apos;s Story</h3>
                                    <p>
                                        Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những
                                        tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở
                                        những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng
                                        đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là
                                        tình yêu, cùng anh về nhà em nhé!
                                    </p>
                                </div>
                            </div>
                            <div className={`${styles.story_box} ${styles.reverse}`}>
                                <div className={styles.story_image}>
                                    <img src="/images/m15/8.jpg" alt="Bride Story" />
                                </div>
                                <div className={styles.story_text}>
                                    <h3>The Bride&apos;s Story</h3>
                                    <p>
                                        Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan
                                        tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ
                                        hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu
                                        và hạnh phúc đong đầy anh nhé!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_teeth}>
                    <div className={styles.teethTop}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>

                    <div className={styles.calendar}>
                        <div className={styles.calendarHeader}>
                            <h3>
                                Tháng {weddingData.weddingDate.getMonth() + 1}, {weddingData.weddingDate.getFullYear()}
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
                                const isWeddingDay = day === weddingData.weddingDate.getDate();
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
                        <div className={styles.countdownContainer}>
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
                            </div>
                        </div>
                    </div>
                    <div className={styles.flex_btn__map}>
                        <button className={styles.map_groom} onClick={handleGroomMapClick}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showGroomMap ? 'Ẩn bản đồ' : 'Chỉ đường chú rể'}
                        </button>
                        <button className={styles.map_bride} onClick={handleBrideMapClick}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showBrideMap ? 'Ẩn bản đồ' : 'Chỉ đường cô dâu'}
                        </button>
                    </div>

                    <div className={styles.teethBottom}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>
                </div>

                <div className={styles.wrapper_map}>
                    <div className={styles.google_map}>
                        {showGroomMap && (
                            <iframe
                                src={weddingData.groomMapUrl}
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showBrideMap && (
                            <iframe
                                src={weddingData.brideMapUrl}
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {!showGroomMap && !showBrideMap && <img src="/images/m10/icon_map.png" alt="map placeholder" />}
                    </div>
                </div>

                <div className={styles.galary}>
                    <img src="/images/m15/6.jpg" alt="" />
                    <img src="/images/m15/2.jpg" alt="" />
                    <img src="/images/m15/3.jpg" alt="" />
                    <img src="/images/m15/4.jpg" alt="" />
                    <img src="/images/m15/5.jpg" alt="" />
                    <img src="/images/m15/7.jpg" alt="" />
                    <img src="/images/m15/8.jpg" alt="" />
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
};

export default Template15Edit;
