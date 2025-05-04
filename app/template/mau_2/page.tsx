'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import styles from './mau_2.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCirclePlay, faCirclePause } from '@fortawesome/free-solid-svg-icons';

function Mau_2() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Toggle expand/collapse
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Handle play/pause
    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    // Handle scroll to collapse dynamic section
    useEffect(() => {
        const handleScroll = () => {
            if (isExpanded) {
                setIsExpanded(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isExpanded]);

    // Ensure audio stops when component unmounts
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 1000, // Animation duration in milliseconds
            once: true, // Animations happen only once
        });
    }, []);

    // Define weddingData for November 2025
    const weddingData = {
        calendar: {
            month: 'Tháng 11 2025',
            days: [
                '',
                '',
                '',
                '',
                '',
                '',
                '1', // First week (starts on Saturday)
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
                '20',
                '21',
                '22',
                '23',
                '24',
                '25',
                '26',
                '27',
                '28',
                '29',
                '30',
                '',
                '',
                '',
                '',
                '',
                '',
            ],
            highlightDay: 17, // Highlight the 17th
        },
    };

    // Wedding date for comparison
    const weddingDay = 17; // Removed incorrect type annotation
    const weddingDayOfWeek = 'Thứ 2'; // 17/11/2025 is a Monday

    return (
        <div className={styles.mau_2_container}>
            <div className={`${styles.dynamic} ${isExpanded ? styles.expanded : ''}`} onClick={toggleExpand}>
                <div className={styles.dynamic_content}>
                    <div
                        className={styles.controls}
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePlayPause();
                        }}
                    >
                        <FontAwesomeIcon
                            icon={isPlaying ? faCirclePause : faCirclePlay}
                            className={styles.playPauseIcon}
                        />
                    </div>
                    <h3>{isPlaying ? 'Đang phát: Bài này không để đi diễn' : 'Bài này không để đi diễn'}</h3>
                </div>

                {isExpanded && (
                    <div className={styles.expanded_content}>
                        <div className={styles.album_art}>
                            <img src="/images/m2/8.jpg" alt="Album Art" />
                        </div>
                        <div className={styles.song_info}>
                            <h4>Bài này không để đi diễn</h4>
                            <p> Anh Tu Atus x DieuNhiOfficial Wedding</p>
                        </div>
                        <div className={styles.progress_bar}>
                            <div className={styles.progress}></div>
                        </div>
                    </div>
                )}

                <audio ref={audioRef} src="/audio/song.mp3" />
            </div>
            <div className={styles.mau_2}>
                <div className={styles.mau_2__wrapper}>
                    <div className={styles.page_2}>
                        <img src="/images/m2/page2.png" alt="" />
                    </div>
                    <div className={styles.image_mau2}>
                        <img src="/images/m2/8.jpg" alt="" />

                        <div className={styles.Save_the_date} data-aos="fade-right" data-aos-delay="400">
                            <span className={styles.save}>Save</span>
                            <span className={styles.the}>The</span>
                            <span className={styles.date}>Date</span>
                            <span className={styles.time}>17/11/2025</span>
                        </div>

                        <div className={styles.bride_groom} data-aos="fade-up" data-aos-delay="600">
                            <h3>Kim Thành</h3>
                            <span>&</span>
                            <h3>Hải Vân</h3>
                        </div>

                        <div className={styles.thumnails}>
                            <img
                                src="/images/m2/2.jpg"
                                alt=""
                                className={styles.thumnailImages_1}
                                data-aos="fade-up"
                                data-aos-delay="200"
                            />
                            <img
                                src="/images/m2/3.jpg"
                                alt=""
                                className={styles.thumnailImages_2}
                                data-aos="fade-right"
                                data-aos-delay="600"
                            />
                            <img
                                src="/images/m2/5.jpg"
                                alt=""
                                className={styles.thumnailImages_3}
                                data-aos="fade-left"
                                data-aos-delay="600"
                            />
                            <img
                                src="/images/m2/6.jpg"
                                alt=""
                                className={styles.thumnailImages_4}
                                data-aos="fade-up"
                                data-aos-delay="800"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.torn_page}>
                    <img src="/images/m2/page.png" alt="" />
                </div>

                <div className={styles.story} data-aos="fade-up" data-aos-delay="200">
                    <div className={styles.Timing_Hook}>
                        <img src="/images/m2/tape.png" alt="" className={styles.tape} />
                        <div className={styles.Timing_Hook__content} data-aos="fade-right" data-aos-delay="400">
                            <h3>Chuyện</h3>
                            <h4>
                                {' '}
                                <span>Của</span> Chúng mình
                            </h4>
                            <p>2020 - 2025</p>
                        </div>
                    </div>

                    <div className={styles.content_story}>
                        <div className={styles.header_content}>
                            <div className={styles.left} data-aos="fade-right" data-aos-delay="600">
                                <img src="/images/m2/1.jpg" alt="" />
                            </div>

                            <div className={styles.right} data-aos="fade-left" data-aos-delay="800">
                                <span>
                                    Trong một thị trấn nhỏ dọc bờ biển, Kim Thành – chàng họa sĩ trẻ, tình cờ gặp Hải
                                    Vân – cô gái bán sách cũ, khi cô đánh rơi một quyển sách trên con dốc gió lộng. Anh
                                    nhặt lên, trao lại, và họ nhìn nhau thật lâu. Từ hôm đó,
                                </span>
                            </div>
                        </div>
                        <div className={styles.footer_content}>
                            <div className={styles.left} data-aos="fade-right" data-aos-delay="1000">
                                <span>
                                    Tình yêu giữa Kim Thành và Hải Vân bắt đầu bằng một bản nhạc cũ vang lên trong quán
                                    cà phê ven biển. Cô ngồi ở góc quán, lặng lẽ đọc sách, còn anh vừa bước vào đã sững
                                    người khi nghe giai điệu quen thuộc – bài hát mẹ anh thường bật những ngày mưa.
                                </span>
                            </div>
                            <div className={styles.right} data-aos="fade-left" data-aos-delay="1200">
                                <img src="/images/m2/2.jpg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.story_bride}>
                    <div className={styles.story_bride_wrapper}>
                        <div className={styles.story_bride__content} data-aos="zoom-in" data-aos-delay="400">
                            <h3>Chuyện</h3>
                            <h4>
                                {' '}
                                <span>Của</span> Cô Dâu
                            </h4>
                            <h2>Hải Vân</h2>
                        </div>

                        <div className={styles.img_story__bride} data-aos="fade-left" data-aos-delay="600">
                            <img src="/images/m2/3.jpg" alt="" />
                        </div>

                        <div className={styles.content} data-aos="fade-up" data-aos-delay="800">
                            <span>
                                Mời cô dâu giới thiệu về bản thân ở đây nha. Cô dâu có teher trả lời những câu hỏi cơ
                                bản như tên đầy đủ là gì nè, bao nhiêu tuổi rùi, nhà ở đâu, sở thích, ưu điểm, khuyết
                                điểm,...
                            </span>

                            <span>
                                Tất cả những gì cô dâu muốn chiaw sẽ về bản thân thì mời cô dâu chia sẽ ở đây ....
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.story_groom} data-aos="fade-up" data-aos-delay="200">
                    <div className={styles.story_groom_wrapper}>
                        <div className={styles.story_groom__content} data-aos="zoom-in" data-aos-delay="400">
                            <h3>Chuyện</h3>
                            <h4>
                                <span>Của</span> Chú Rể
                            </h4>
                            <h2>Kim Thành</h2>
                        </div>

                        <div className={styles.content} data-aos="fade-up" data-aos-delay="600">
                            <span>
                                Mời chú rể giới thiệu về bản thân ở đây nha. Chú rể có thể trả lời những câu hỏi như tên
                                đầy đủ là gì, bao nhiêu tuổi rồi, quê ở đâu, sở thích, ưu điểm, khuyết điểm,...
                            </span>

                            <span>
                                Tất cả những gì chú rể muốn chia sẻ về bản thân thì mời chú rể chia sẻ tại đây...
                            </span>
                        </div>

                        <div className={styles.img_story__groom} data-aos="fade-left" data-aos-delay="800">
                            <img src="/images/m2/4.jpg" alt="" />
                        </div>
                    </div>
                </div>

                <div className={styles.time_location}>
                    <div className={styles.wrapper}>
                        <h3>Tới dự buổi tiệc mừng Lễ thành hôn</h3>
                        <h3>Của Chúng Tôi</h3>

                        <div className={styles.img_t1}>
                            <img src="/images/m2/t1.png" alt="" />
                        </div>

                        <div className={styles.img_t2}>
                            <img src="/images/m2/t1.png" alt="" />
                        </div>

                        <div className={styles.family_section}>
                            <div className={styles.family_wrapper}>
                                <div className={styles.family_box}>
                                    <h4>Nhà Trai</h4>
                                    <p>Ông: Nguyễn Văn A</p>
                                    <p>Bà: Trần Thị B</p>
                                </div>

                                <div className={styles.family_box}>
                                    <h4>Nhà Gái</h4>
                                    <p>Ông: Lê Văn C</p>
                                    <p>Bà: Phạm Thị D</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.flex}>
                            <div className={styles.flex_gap}>
                                <div>Kim Thành</div>
                                <span>囍</span>
                                <div>Hải Vân</div>
                            </div>
                        </div>

                        <div className={styles.infomation} data-aos="fade-up" data-aos-duration="1200">
                            <p className={styles.eventDetails}>TIỆC MỪNG VU QUY</p>
                            <p className={styles.eventTime}>Vào Lúc</p>
                            <div className={styles.dateContainer}>
                                <span className={styles.time}>{weddingDayOfWeek}</span>
                                <div className={styles.column}>
                                    <span className={styles.dayOfWeek}>11:00</span>
                                    <span className={styles.day}>{weddingDay}</span>
                                    <span className={styles.month}>Tháng 11</span>
                                </div>
                                <span className={styles.year}>2025</span>
                            </div>
                        </div>

                        <div className={styles.calendar} data-aos="zoom-in" data-aos-duration="1000">
                            <h3>{weddingData.calendar.month}</h3>
                            <div className={styles.calendarHeader}>
                                <span>CN</span>
                                <span>T2</span>
                                <span>T3</span>
                                <span>T4</span>
                                <span>T5</span>
                                <span>T6</span>
                                <span>T7</span>
                            </div>
                            <div className={styles.calendarBody}>
                                {weddingData.calendar.days.map((day, index) => (
                                    <span key={index} className={parseInt(day) === weddingDay ? styles.highlight : ''}>
                                        {parseInt(day) === weddingDay ? (
                                            <span className={styles.highlightContent}>
                                                <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
                                                <span>{day}</span>
                                            </span>
                                        ) : (
                                            day
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.address} data-aos="fade-up" data-aos-duration="1000">
                    <div className={styles.dotLeft}></div>
                    <div className={styles.dotRight}></div>
                    <h4>Địa điểm tổ chức</h4>

                    <div className={styles.addressContent}>
                        <h5>Nhà Trai</h5>
                        <p>PJ3X+GH8, KDC 13E, Đô thị mới Nam Thành Phố, Ấp 5, Bình Chánh, Hồ Chí Minh, Việt Nam</p>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4650.377567444314!2d106.64545227570262!3d10.703125960540111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175311ad90bd4bb%3A0xf92c25e13e35ed88!2sChung%20c%C6%B0%20Saigon%20Intela!5e1!3m2!1svi!2s!4v1746350188243!5m2!1svi!2s"
                            width="600"
                            height="450"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>

                    <div className={styles.addressContent}>
                        <h5>Nhà Gái</h5>
                        <p>PJ3X+GH8, KDC 13E, Đô thị mới Nam Thành Phố, Ấp 5, Bình Chánh, Hồ Chí Minh, Việt Nam</p>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4650.377567444314!2d106.64545227570262!3d10.703125960540111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175311ad90bd4bb%3A0xf92c25e13e35ed88!2sChung%20c%C6%B0%20Saigon%20Intela!5e1!3m2!1svi!2s!4v1746350188243!5m2!1svi!2s"
                            width="600"
                            height="450"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                <div className={styles.photo_gallery}>
                    <div className={styles.gallery_container}>
                        <div
                            className={`${styles.gallery_item} ${styles.item_1}`}
                            data-aos="fade-up"
                            data-aos-delay="200"
                        >
                            <div className={styles.card_content}>
                                <img src="/images/m2/6.jpg" alt="Wedding Photo 1" className={styles.card_image} />
                            </div>
                        </div>
                        <div
                            className={`${styles.gallery_item} ${styles.item_2}`}
                            data-aos="fade-up"
                            data-aos-delay="400"
                        >
                            <div className={styles.card_content}>
                                <img src="/images/m2/7.jpg" alt="Wedding Photo 2" className={styles.card_image} />
                            </div>
                        </div>
                        <div
                            className={`${styles.gallery_item} ${styles.item_3}`}
                            data-aos="fade-up"
                            data-aos-delay="600"
                        >
                            <div className={styles.card_content}>
                                <img src="/images/m2/9.jpg" alt="Wedding Photo 3" className={styles.card_image} />
                            </div>
                        </div>
                        <div
                            className={`${styles.gallery_item} ${styles.item_4}`}
                            data-aos="fade-up"
                            data-aos-delay="800"
                        >
                            <div className={styles.card_content}>
                                <img src="/images/m2/10.jpg" alt="Wedding Photo 4" className={styles.card_image} />
                            </div>
                        </div>
                    </div>
                </div>
                <footer>
                    <div className={styles.Save_the_date} data-aos="fade-right" data-aos-delay="400">
                        <span className={styles.save}>Save</span>
                        <span className={styles.the}>The</span>
                        <span className={styles.date}>Date</span>
                        <span className={styles.time}>17/11/2025</span>
                    </div>

                    <div className={styles.bride_groom} data-aos="fade-up" data-aos-delay="600">
                        <h3>Kim Thành</h3>
                        <span>&</span>
                        <h3>Hải Vân</h3>
                    </div>

                    <div className={styles.content_foooter}>
                        <span data-aos="fade-up" data-aos-duration="1000">
                            Chúng tôi háo hức mong chờ ngày trọng đại của đời mình một dấu mốc thiêng liêng và đáng nhớ.
                            Sẽ thật trọn vẹn và ý nghĩa biết bao nếu có sự hiện diện cùng lời chúc phúc chân thành từ
                            bạn trong khoảnh khắc đặc biệt ấy.
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default Mau_2;
