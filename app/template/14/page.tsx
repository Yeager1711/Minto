'use client';
import * as React from 'react';
import styles from './14.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';

// Define interfaces for state and data
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface WeddingData {
    weddingDate: Date;
    groomMapUrl: string;
    brideMapUrl: string;
}

const Template14nviteeName: React.FC = () => {
    const [showGroomMap, setShowGroomMap] = React.useState<boolean>(false);
    const [showBrideMap, setShowBrideMap] = React.useState<boolean>(false);
    const [timeLeft, setTimeLeft] = React.useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const weddingData: WeddingData = {
        weddingDate: new Date('2025-09-17T18:00:00+07:00'),
        groomMapUrl:
            'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.299146126312!2d144.9559277!3d-37.8252498!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5374b6a383%3A0xd0d9b0f61a69b9b!2sWeddings%20Crown%20Melbourne!5e1!3m2!1svi!2s!4v1755491005859!5m2!1svi!2s',
        brideMapUrl:
            'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.299146126312!2d144.9559277!3d-37.8252498!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5173a284b5%3A0x958eeaf04deea384!2sMelbourne%20Convention%20and%20Exhibition%20Centre%20(MCEC)!5e1!3m2!1svi!2s!4v1755491020663!5m2!1svi!2s',
    };

    // Countdown logic
    React.useEffect(() => {
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
    }, []);

    // Calendar logic
    const generateCalendarDays = (): (number | null)[] => {
        const year = weddingData.weddingDate.getFullYear();
        const month = weddingData.weddingDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array(firstDay)
            .fill(null)
            .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    };
    const calendarDays = generateCalendarDays();

    // Map toggle functions
    const handleGroomMapClick = () => {
        if (showGroomMap) {
            window.open('https://maps.google.com/?q=Weddings+Crown+Melbourne', '_blank');
        } else {
            setShowGroomMap(true);
            setShowBrideMap(false); // Hide bride's map
        }
    };

    const handleBrideMapClick = () => {
        if (showBrideMap) {
            window.open('https://maps.google.com/?q=Melbourne+Convention+and+Exhibition+Centre', '_blank');
        } else {
            setShowBrideMap(true);
            setShowGroomMap(false); // Hide groom's map
        }
    };

    return (
        <div className={styles.template14}>
            <div className={styles.wrapper}>
                <div className={styles.header_content}>
                    <div className={styles.image_flower_blue}>
                        <img src="/images/m14/14.1.jpg" alt="" />
                    </div>

                    <div className={styles.wrapper_main}>
                        <div className={styles.img_main_1}>
                            <img src="/images/m13/4.jpg" alt="" />
                        </div>
                        <div className={styles.img_main_2}>
                            <img src="/images/m13/2.jpg" alt="" />
                        </div>
                        <div className={styles.img_main_3}>
                            <img src="/images/m13/3.jpg" alt="" />
                        </div>
                    </div>

                    <div className={styles.content_header}>
                        <span>Please join us for</span>
                        <h3>The Wedding of</h3>
                        <div className={styles.groom}>Hoàng Nam</div>
                        <div className={styles.and}>and</div>
                        <div className={styles.bride}>Thùy Linh</div>
                    </div>
                </div>

                <div className={styles.familyInfo}>
                    <div className={styles.wrapper_bar2}>
                        <div className={styles.teethTop}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={styles.tooth}></div>
                            ))}
                        </div>

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
                                <div>Hoàng Nam</div>
                                <div>Thùy Linh</div>
                            </div>

                            <div className={styles.dat}>
                                Lúc: <strong>18:00 || Thứ Bảy, 17 tháng 09, 2025</strong>
                                <br />
                                <p>
                                    (Nhằm ngày <strong>23</strong> tháng <strong>06</strong> năm Ất Tỵ)
                                </p>
                                Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                            </div>
                        </div>

                        <div className={styles.teethBottom}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={styles.tooth}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.story}>
                    <div className={styles.story_groom}>
                        <div className={styles.preview_select}>
                            <div className={styles.flex_content}>
                                <div className={styles.image_story__groom}>
                                    <img src="/images/m13/10.jpg" alt="" />
                                </div>
                                <div className={styles.text_story}>
                                    <h1>The Groom&apos;s Story</h1>
                                    <p>
                                        Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những
                                        tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở
                                        những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng
                                        đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là
                                        tình yêu, cùng anh về nhà em nhé!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.story_bride}>
                        <div className={styles.preview_select}>
                            <div className={styles.flex_content}>
                                <div className={styles.image_story__bride}>
                                    <img src="/images/m13/8.jpg" alt="" />
                                </div>
                                <div className={styles.text_story}>
                                    <h1>The Bride&apos;s Story</h1>
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
                        <div className={styles.text_std__image}>
                            <img src="/images/m14/std_txt.png" alt="" />
                        </div>
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

                    <div className={styles.wrapper_map}>
                        <div className={styles.flex_btn__map}>
                            <button className={styles.map_groom} onClick={handleGroomMapClick}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showGroomMap ? 'Mở map lớn' : 'Chỉ đường chú rể'}
                            </button>
                            <button className={styles.map_bride} onClick={handleBrideMapClick}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showBrideMap ? 'Mở map lớn' : 'Chỉ đường cô dâu'}
                            </button>
                        </div>

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
                            {!showGroomMap && !showBrideMap && (
                                <img src="/images/m10/icon_map.png" alt="map placeholder" />
                            )}
                        </div>
                    </div>

                    <div className={styles.teethBottom}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
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
};

export default Template14nviteeName;
