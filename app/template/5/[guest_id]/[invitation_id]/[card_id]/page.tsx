'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faTimes,
    faHeart,
    faCirclePlay,
    faCirclePause,
    faChevronRight,
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../5.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useApi } from 'app/lib/apiContext/apiContext';
import { parse } from 'date-fns';
import InvitionsQR from 'app/QR_received/invitionsQR/invitionsQR';
export const dynamic = 'force-dynamic';

interface Images {
    mainImage: { url: string; position?: string };
    groomImage: { url: string; position?: string };
    brideImage: { url: string; position?: string };
    collageImage1: { url: string; position?: string };
    collageImage2: { url: string; position?: string };
    collageImage3: { url: string; position?: string };
    collageImage4: { url: string; position?: string };
    collageImage5: { url: string; position?: string };
    footerImage1: { url: string; position?: string };
    footerImage2: { url: string; position?: string };
}

interface WeddingData {
    bride: string;
    groom: string;
    weddingDate: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    lunar_day: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    brideStory: string;
    groomStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string;
    brideMapUrl: string;
    venue_groom: string;
    venue_bride: string;
}

const defaultImage = '/images/placeholder.png';

const getMapEmbedUrlFromCoords = (coords: string): string => {
    if (!coords) return 'https://www.google.com/maps';
    const cleanCoords = coords.replace(/\s/g, '');
    const match = cleanCoords.match(/^\((-?\d+\.\d+)?,(-?\d+\.\d+)\)$/);
    if (!match) {
        console.warn('Invalid coordinate format:', coords);
        return 'https://www.google.com/maps';
    }
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates:', lat, lng);
        return 'https://www.google.com/maps';
    }
    const apiMapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (!apiMapKey) {
        console.error('Google Maps API key is missing');
        return 'https://www.google.com/maps';
    }
    return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15`;
};

function Template5InviteeName() {
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage: { url: defaultImage, position: 'main' },
        groomImage: { url: defaultImage, position: 'groom' },
        brideImage: { url: defaultImage, position: 'bride' },
        collageImage1: { url: defaultImage, position: 'collage1' },
        collageImage2: { url: defaultImage, position: 'collage2' },
        collageImage3: { url: defaultImage, position: 'collage3' },
        collageImage4: { url: defaultImage, position: 'collage4' },
        collageImage5: { url: defaultImage, position: 'collage5' },
        footerImage1: { url: defaultImage, position: 'footer1' },
        footerImage2: { url: defaultImage, position: 'footer2' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [showMapModal, setShowMapModal] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
        return () => {
            AOS.refreshHard();
        };
    }, []);

    useEffect(() => {
        if (!isIntroOpen) {
            const timer = setTimeout(() => {
                AOS.refresh();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isIntroOpen]);

    useEffect(() => {
        const fetchGuestAndCard = async () => {
            setIsLoading(true);
            try {
                const parts = pathname.split('/').filter(Boolean);
                const template_id = parts[1];
                const guest_id = parts[2];
                const invitation_id = parts[3];
                const card_id = parts[4];

                if (!template_id || !guest_id || !invitation_id || !card_id) {
                    throw new Error('Thiếu tham số trong URL');
                }

                const { guest, card } = await getGuestAndCard(template_id, guest_id, invitation_id, card_id);
                if (!guest || !card) {
                    throw new Error('Dữ liệu khách mời hoặc thiệp cưới không tồn tại');
                }

                const weddingData = card.custom_data.weddingData as Partial<WeddingData> | undefined;
                const updatedWeddingData: WeddingData = {
                    bride: weddingData?.bride || 'Bảo Ngọc',
                    groom: weddingData?.groom || 'Anh Duy',
                    weddingDate: weddingData?.weddingDate || '23/12/2025',
                    weddingTime: weddingData?.weddingTime || '11:00',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'THỨ BA',
                    lunar_day: card.invitations[0]?.lunar_day || '17 tháng 11 năm ất tỵ',
                    familyGroom: weddingData?.familyGroom || { father: 'Huỳnh Văn A', mother: 'Trần Thị B' },
                    familyBride: weddingData?.familyBride || { father: 'Lê Văn C', mother: 'Trần Thị D' },
                    brideStory:
                        weddingData?.brideStory ||
                        'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
                    groomStory:
                        weddingData?.groomStory ||
                        'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
                    groomAddress: weddingData?.groomAddress || 'Trung tâm Hội nghị - Tiệc cưới Diamond Place',
                    brideAddress: weddingData?.brideAddress || 'Trung tâm Hội nghị - Tiệc cưới Diamond Place',
                    groomMapUrl: weddingData?.groomMapUrl || '(10.800840458741545,106.67267237570341)',
                    brideMapUrl: weddingData?.brideMapUrl || '(10.800840458741545,106.67267237570341)',
                    venue_groom: card.invitations[0]?.venue_groom || 'Trung tâm Hội nghị - Tiệc cưới Diamond Place',
                    venue_bride: card.invitations[0]?.venue_bride || 'Trung tâm Hội nghị - Tiệc cưới Diamond Place',
                };
                setWeddingData(updatedWeddingData);
                setGuestName(guest.full_name || 'Huỳnh Nam');
                setUserId(card.user_id);

                const newImages: Images = {
                    mainImage: { url: defaultImage, position: 'main' },
                    groomImage: { url: defaultImage, position: 'groom' },
                    brideImage: { url: defaultImage, position: 'bride' },
                    collageImage1: { url: defaultImage, position: 'collage1' },
                    collageImage2: { url: defaultImage, position: 'collage2' },
                    collageImage3: { url: defaultImage, position: 'collage3' },
                    collageImage4: { url: defaultImage, position: 'collage4' },
                    collageImage5: { url: defaultImage, position: 'collage5' },
                    footerImage1: { url: defaultImage, position: 'footer1' },
                    footerImage2: { url: defaultImage, position: 'footer2' },
                };

                card.thumbnails.forEach(
                    (thumbnail: { thumbnail_id: number; image_url: string; position: string; card_id: number }) => {
                        if (thumbnail.card_id === card.card_id) {
                            const key =
                                ({
                                    main: 'mainImage',
                                    groom: 'groomImage',
                                    bride: 'brideImage',
                                    collage1: 'collageImage1',
                                    collage2: 'collageImage2',
                                    collage3: 'collageImage3',
                                    collage4: 'collageImage4',
                                    collage5: 'collageImage5',
                                    footer: 'footerImage1',
                                    bottom: 'footerImage2',
                                }[thumbnail.position] as keyof Images) || null;
                            if (!key) {
                                console.warn(`Unknown thumbnail position: ${thumbnail.position}`);
                                return;
                            }
                            newImages[key] = {
                                url: thumbnail.image_url.startsWith('http')
                                    ? thumbnail.image_url
                                    : `https://ik.imagekit.io/zawkrzrax${thumbnail.image_url}`,
                                position: thumbnail.position,
                            };
                        }
                    }
                );
                setImages(newImages);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu thiệp cưới';
                setError(errorMessage);
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGuestAndCard();
    }, [pathname, getGuestAndCard]);

    useEffect(() => {
        const updateCountdown = () => {
            if (!weddingData) return;
            const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 11, 23, 11, 0, 0);
            const now = new Date();
            const timeDiff = weddingDateObj.getTime() - now.getTime();

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

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [weddingData]);

    const parseWeddingDate = (dateStr: string): Date | null => {
        try {
            return parse(dateStr, 'dd/MM/yyyy', new Date());
        } catch {
            return null;
        }
    };

    const formatTimeToHourMinute = (time: string) => {
        if (!time || !time.includes(':')) return time;
        const [hours, minutes] = time.split(':');
        return `${hours}h${minutes}`;
    };

    const handleIntroClick = () => {
        setIsIntroOpen(false);
    };

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

    const toggleExpand = () => setIsExpanded(!isExpanded);

    useEffect(() => {
        const handleScroll = () => {
            if (isExpanded) {
                setIsExpanded(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isExpanded]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className={styles.error}>Lỗi: {error}. Vui lòng thử lại sau.</div>;
    }

    if (!weddingData) {
        return <div className={styles.error}>Không tìm thấy dữ liệu thiệp cưới.</div>;
    }

    const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 11, 23);
    const weddingDay = weddingDateObj.getDate();
    const weddingMonth = weddingDateObj.getMonth();
    const weddingYear = weddingDateObj.getFullYear();

    const daysAroundWedding = Array.from({ length: 14 }, (_, i) => {
        const date = new Date(weddingYear, weddingMonth, weddingDay - 7 + i);
        return { day: date.getDate(), dayOfWeek: date.getDay() };
    });

    const firstDayOfPeriod = new Date(weddingYear, weddingMonth, weddingDay - 7).getDay();
    const paddingDays = Array((firstDayOfPeriod + 6) % 7).fill(null);

    const daysInMonthArray = Array.from(
        { length: new Date(weddingYear, weddingMonth + 1, 0).getDate() },
        (_, i) => i + 1
    );

    return (
        <div className={styles.template5}>
            <div className={`${styles.intro} ${isIntroOpen ? '' : styles.intro_closed}`} onClick={handleIntroClick}>
                <div className={styles.content_intro}>
                    <div className={styles.intro_header}>
                        <span>Save the date</span>
                        <h3 className={styles.representative}>{`${weddingData.groom} & ${weddingData.bride}`}</h3>
                        <p className={styles.day}>{weddingData.weddingDate}</p>
                    </div>
                    <div className={styles.calendar_intro}>
                        <h2 className={styles.month}>
                            Tháng {weddingDateObj.getMonth() + 1}, {weddingDateObj.getFullYear()}
                        </h2>
                        <div className={styles.days_of_week}>
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                                <span key={day}>{day}</span>
                            ))}
                        </div>
                        <div className={styles.dates}>
                            {paddingDays.map((_, index) => (
                                <span key={`pad-${index}`} className={styles.empty_day}></span>
                            ))}
                            {daysAroundWedding.map((dateObj, index) => {
                                const isWeddingDay = dateObj.day === weddingDay && dateObj.dayOfWeek === 2;
                                return (
                                    <span
                                        key={index}
                                        className={`${styles.calendar_day} ${isWeddingDay ? styles.highlighted : ''}`}
                                        data-aos="fade-in"
                                        data-aos-delay={`${index * 50}`}
                                    >
                                        {dateObj.day}
                                        {isWeddingDay && (
                                            <FontAwesomeIcon icon={faHeart} className={styles.heart_icon} />
                                        )}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.wrapper_animation__Click}>
                        <div className={styles.icon_arrow__left}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.chevronLeft} />
                            <FontAwesomeIcon icon={faChevronRight} className={styles.chevronLeft} />
                        </div>
                        <div className={styles.text}>Click vào màn hình để mở</div>
                        <div className={styles.icon_arrow__right}>
                            <FontAwesomeIcon icon={faChevronLeft} className={styles.chevronRight} />
                            <FontAwesomeIcon icon={faChevronLeft} className={styles.chevronRight} />
                        </div>
                    </div>
                    <div className={styles.invitions_name}>
                        Trân trọng kính mời: <strong>{guestName}</strong>
                    </div>
                </div>
            </div>

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
                    <h3>{isPlaying ? 'Đang Phát: Say sóng' : 'Say sóng'}</h3>
                </div>
                {isExpanded && (
                    <div className={styles.expanded_content}>
                        <div className={styles.song_info}>
                            <h4>Say sóng</h4>
                            <p>Ca sĩ: Tăng Duy Tân</p>
                        </div>
                        <div className={styles.progress_bar}>
                            <div className={styles.progress}></div>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} src="/audio/saysong.mp3" />
            </div>

            <div className={`${styles.wrapper} ${isIntroOpen ? styles.wrapper_hidden : ''}`}>
                <div className={styles.saveTheDate}>
                    <div className={styles.saveTheDate_wrapper}>
                        <div className={styles.img_std} data-aos="zoom-in">
                            <img src="/images/std/img_std.png" alt="Save the Date" loading="lazy" />
                        </div>
                        <div className={styles.groom_bride__name} data-aos="fade-right">
                            <h3 data-aos="fade-right" data-aos-delay="300" className={styles.groom_names}>
                                {weddingData.groom}
                            </h3>
                            <h3 data-aos="fade-left" data-aos-delay="500" className={styles.bride_names}>
                                {weddingData.bride}
                            </h3>
                        </div>
                        <p className={styles.text} data-aos="fade-up" data-aos-delay="700">
                            Thân mời Quý Khách tới tham dự
                            <br />
                            Lễ Thành Hôn của hai chúng tôi
                        </p>
                        <p className={styles.at} data-aos="fade-up" data-aos-delay="900">
                            Vào lúc {formatTimeToHourMinute(weddingData.weddingTime)}
                        </p>
                        <div className={styles.dateBox} data-aos="fade-up" data-aos-delay="1100">
                            <div>{weddingData.weddingDayOfWeek}</div>
                            <div className={styles.day}>
                                NGÀY
                                <br />
                                <strong>{weddingDateObj.getDate()}</strong>
                            </div>
                            <div>
                                THÁNG
                                <br />
                                {weddingDateObj.getMonth() + 1}
                            </div>
                        </div>
                        <p className={styles.year} data-aos="fade-up" data-aos-delay="1300">
                            {weddingDateObj.getFullYear()}
                        </p>
                        <p className={styles.lunarDay} data-aos="fade-up" data-aos-delay="1600">
                            (Tức {weddingData.lunar_day})
                        </p>
                        <p className={styles.note} data-aos="fade-up" data-aos-delay="1900">
                            Rất hân hạnh được đón tiếp!
                        </p>
                    </div>
                </div>
                <div className={styles.groom}>
                    <div className={styles.wrapper_groom}>
                        <div className={styles.image_groom} data-aos="fade-right" data-aos-delay="400">
                            <img src={images.groomImage.url} alt="Groom" loading="lazy" />
                        </div>
                        <div className={styles.groom_name}>
                            <p data-aos="fade-right" data-aos-delay="600">
                                Chú Rể
                            </p>
                            <h3 data-aos="fade-right" data-aos-delay="800">
                                {weddingData.groom}
                            </h3>
                        </div>
                    </div>
                    <div className={styles.groom_str} data-aos="fade-up" data-aos-delay="800">
                        <p>{weddingData.groomStory}</p>
                    </div>
                </div>
                <div className={styles.bride} data-aos="fade-left">
                    <div className={styles.wrapper_bride}>
                        <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="400">
                            <p data-aos="fade-left" data-aos-delay="600">
                                Cô dâu
                            </p>
                            <h3 data-aos="fade-left" data-aos-delay="800">
                                {weddingData.bride}
                            </h3>
                        </div>
                        <div className={styles.image_bride} data-aos="fade-up" data-aos-delay="400">
                            <img src={images.brideImage.url} alt="Bride" loading="lazy" />
                        </div>
                    </div>
                    <div className={styles.bride_str}>
                        <p>{weddingData.brideStory}</p>
                    </div>
                </div>
                <div className={styles.calendar} data-aos="fade-up">
                    <div className={styles.imageMainCalendar}>
                        <img src={images.mainImage.url} alt="Main Calendar" loading="lazy" />
                    </div>
                    <div className={styles.calendar_wrapper}>
                        <div className={styles.info_wrapper} data-aos="fade-up" data-aos-delay="100">
                            <div className={styles.info__groom}>
                                <span>Nhà trai</span>
                                <h3>Ông: {weddingData.familyGroom.father}</h3>
                                <h3>Bà: {weddingData.familyGroom.mother}</h3>
                                <span className={styles.location}>{weddingData.groomAddress}</span>
                            </div>
                            <div className={styles.info__bride}>
                                <span>Nhà gái</span>
                                <h3>Ông: {weddingData.familyBride.father}</h3>
                                <h3>Bà: {weddingData.familyBride.mother}</h3>
                                <span className={styles.location}>{weddingData.brideAddress}</span>
                            </div>
                        </div>
                        <h3 className={styles.calendar_title} data-aos="fade-up" data-aos-delay="200">
                            <span>
                                Tháng {weddingDateObj.getMonth() + 1}, {weddingDateObj.getFullYear()}
                            </span>
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
                            {daysInMonthArray.map((day) => (
                                <div
                                    key={day}
                                    className={`${styles.calendar_day} ${day === weddingDateObj.getDate() ? styles.wedding_day : ''}`}
                                    data-aos="fade-in"
                                    data-aos-delay={`${day * 50}`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.countdown} data-aos="fade-up" data-aos-delay="300">
                        <div className={styles.countdown_wrapper}>
                            <h4 className={styles.countdown_title}>Đếm ngược thời gian tới ngày cưới của chúng mình</h4>
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
                            <div
                                className={styles.btn_show_the_way}
                                onClick={() => setShowMapModal(true)}
                                data-aos="fade-up"
                                data-aos-delay="400"
                            >
                                Chỉ đường
                                <FontAwesomeIcon icon={faLocationDot} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.collage}>
                    <div className={styles.collage_left}>
                        <div className={styles.img1} data-aos="fade-down" data-aos-delay="300">
                            <img src={images.collageImage1.url} alt="Collage 1" loading="lazy" />
                        </div>
                        <div className={styles.img2} data-aos="fade-right" data-aos-delay="500">
                            <img src={images.collageImage2.url} alt="Collage 2" loading="lazy" />
                        </div>
                        <div className={styles.img3} data-aos="fade-up" data-aos-delay="700">
                            <img src={images.collageImage3.url} alt="Collage 3" loading="lazy" />
                        </div>
                    </div>
                    <div className={styles.collage_right}>
                        <div className={styles.img4} data-aos="fade-left" data-aos-delay="300">
                            <img src={images.collageImage4.url} alt="Collage 4" loading="lazy" />
                        </div>
                        <div className={styles.img5} data-aos="fade-left" data-aos-delay="500">
                            <img src={images.collageImage5.url} alt="Collage 5" loading="lazy" />
                        </div>
                    </div>
                </div>
                <div className={styles.footer} data-aos="fade-up">
                    <div className={styles.btn_invitionQR__popop}>
                        {userId ? <InvitionsQR userId={userId} /> : <p>Lỗi: Không tìm thấy thông tin người dùng.</p>}
                    </div>
                </div>
                <div className={styles.footer_image}>
                    <div className={styles.image_ft}>
                        <img src={images.footerImage1.url} alt="Couple" loading="lazy" />
                    </div>
                    <div className={styles.wrapper_ft__grid}>
                        <div className={styles.column}>
                            <div className={styles.image_grid}>
                                <div className={styles.image_grid}>
                                    <img
                                        data-aos="fade-right"
                                        data-aos-delay="300"
                                        src={images.collageImage1.url}
                                        alt="Wedding hands"
                                        loading="lazy"
                                    />
                                    <img
                                        data-aos="fade-right"
                                        data-aos-delay="500"
                                        src={images.collageImage2.url}
                                        alt="Wedding bouquet"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.column_text}>
                            <h3 data-aos="fade-up" data-aos-delay="200">
                                Thank You
                            </h3>
                            <span className={styles.subtext} data-aos="fade-up" data-aos-delay="400">
                                Cảm ơn Quý Khách vì đã trở thành một phần quan trọng trong ngày đặc biệt của chúng tôi.
                            </span>
                            <span
                                className={styles.details}
                                data-aos="fade-up"
                                data-aos-delay="600"
                            >{`${weddingData.groom} & ${weddingData.bride}`}</span>
                        </div>
                        <div className={styles.column}>
                            <div className={styles.image_grid}>
                                <img
                                    data-aos="fade-left"
                                    data-aos-delay="300"
                                    src={images.brideImage.url}
                                    alt="Wedding dress"
                                    loading="lazy"
                                />
                                <img
                                    data-aos="fade-left"
                                    data-aos-delay="500"
                                    src={images.collageImage3.url}
                                    alt="Wedding hands"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.bottom_image}>
                        <img src={images.footerImage2.url} alt="Wedding table" loading="lazy" />
                    </div>
                </div>
            </div>
            <div className={`${styles.model_showTheway} ${showMapModal ? styles.show : ''}`}>
                <div className={`${styles.popup_showTheway__wrapper} ${showMapModal ? styles.show : ''}`}>
                    <button className={styles.close_button} onClick={() => setShowMapModal(false)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h3>Hướng dẫn chỉ đường</h3>
                    <div className={styles.locaion_groom}>
                        {weddingData.groomMapUrl ? (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                width="100%"
                                height="500"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        ) : (
                            <p>Lỗi tải bản đồ nhà trai. Vui lòng kiểm tra tọa độ.</p>
                        )}
                        <div className={styles.content_groom}>
                            <div className={styles.wrapper_groom}>
                                <div className={styles.groom_name}>
                                    <p>Chú Rể</p>
                                    <h3>{weddingData.groom}</h3>
                                </div>
                                <div className={styles.image_groom}>
                                    <img src={images.groomImage.url} alt="Groom" loading="lazy" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.locaion_bride}>
                        {weddingData.brideMapUrl ? (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                width="100%"
                                height="500"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        ) : (
                            <p>Lỗi tải bản đồ nhà gái. Vui lòng kiểm tra tọa độ.</p>
                        )}
                        <div className={styles.content_bride}>
                            <div className={styles.wrapper_bride}>
                                <div className={styles.bride_name}>
                                    <p>Cô dâu</p>
                                    <h3>{weddingData.bride}</h3>
                                </div>
                                <div className={styles.image_bride}>
                                    <img src={images.brideImage.url} alt="Bride" loading="lazy" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template5InviteeName;
