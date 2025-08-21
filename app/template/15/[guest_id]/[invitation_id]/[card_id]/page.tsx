'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../../../15.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faHeart,
    faCirclePlay,
    faCirclePause,
    faChevronRight,
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import { useApi } from 'app/lib/apiContext/apiContext';
import { parse } from 'date-fns';
import InvitionsQR from 'app/QR_received/invitionsQR/invitionsQR';

// Define interfaces for state and data
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

interface Images {
    mainImage: { url: string; position: string };
    photo1: { url: string; position: string };
    photo2: { url: string; position: string };
    photo3: { url: string; position: string };
    groomImage: { url: string; position: string };
    brideImage: { url: string; position: string };
    galleryImage1: { url: string; position: string };
    galleryImage2: { url: string; position: string };
    galleryImage3: { url: string; position: string };
    galleryImage4: { url: string; position: string };
    galleryImage5: { url: string; position: string };
    galleryImage6: { url: string; position: string };
    galleryImage7: { url: string; position: string };
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const defaultImage = '/images/m15/choose_img.png';

const getMapEmbedUrlFromCoords = (coords: string): string => {
    if (!coords) return 'https://www.google.com/maps';
    const cleanCoords = coords.replace(/\s/g, '');
    const match = cleanCoords.match(/^\((-?\d+\.\d+),(-?\d+\.\d+)\)$/);
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
    return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15&maptype=roadmap`;
};

const openMapInGoogle = (coords: string) => {
    const cleanCoords = coords.replace(/\s/g, '');
    const match = cleanCoords.match(/^\((-?\d+\.\d+),(-?\d+\.\d+)\)$/);
    if (!match) {
        console.warn('Invalid coordinate format:', coords);
        return;
    }
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates:', lat, lng);
        return;
    }
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=vi`;
    window.open(mapUrl, '_blank');
};

const Template15InviteeName: React.FC = () => {
    useDisableDevTools();
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage: { url: defaultImage, position: 'main' },
        photo1: { url: defaultImage, position: 'photo1' },
        photo2: { url: defaultImage, position: 'photo2' },
        photo3: { url: defaultImage, position: 'photo3' },
        groomImage: { url: defaultImage, position: 'groom' },
        brideImage: { url: defaultImage, position: 'bride' },
        galleryImage1: { url: defaultImage, position: 'gallery1' },
        galleryImage2: { url: defaultImage, position: 'gallery2' },
        galleryImage3: { url: defaultImage, position: 'gallery3' },
        galleryImage4: { url: defaultImage, position: 'gallery4' },
        galleryImage5: { url: defaultImage, position: 'gallery5' },
        galleryImage6: { url: defaultImage, position: 'gallery6' },
        galleryImage7: { url: defaultImage, position: 'gallery7' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [userId, setUserId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [showMap, setShowMap] = useState<'none' | 'groom' | 'bride'>('none');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 100 });
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
                const templateId = parts[1];
                const guestId = parts[2];
                const invitationId = parts[3];
                const cardId = parts[4];

                if (!templateId || !guestId || !invitationId || !cardId) {
                    throw new Error('Thiếu tham số trong URL');
                }

                const { guest, card } = await getGuestAndCard(templateId, guestId, invitationId, cardId);
                if (!guest || !card) {
                    throw new Error('Dữ liệu khách mời hoặc thiệp cưới không tồn tại');
                }

                const weddingData = card.custom_data.weddingData as Partial<WeddingData> | undefined;
                const updatedWeddingData: WeddingData = {
                    bride: weddingData?.bride || '',
                    groom: weddingData?.groom || '',
                    weddingDate: weddingData?.weddingDate || '',
                    weddingTime: weddingData?.weddingTime || '',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || '',
                    lunar_day: card.invitations[0]?.lunar_day || weddingData?.lunar_day || '',
                    familyGroom: weddingData?.familyGroom || { father: '', mother: '' },
                    familyBride: weddingData?.familyBride || { father: '', mother: '' },
                    brideStory:
                        weddingData?.brideStory ||
                        'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
                    groomStory:
                        weddingData?.groomStory ||
                        'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
                    groomAddress: weddingData?.groomAddress || '',
                    brideAddress: weddingData?.brideAddress || '',
                    groomMapUrl: weddingData?.groomMapUrl || '',
                    brideMapUrl: weddingData?.brideMapUrl || '',
                    venue_groom: card.invitations[0]?.venue_groom || '',
                    venue_bride: card.invitations[0]?.venue_bride || '',
                };
                setWeddingData(updatedWeddingData);
                setGuestName(guest.full_name || '');
                setUserId(card.user_id);

                const newImages: Images = {
                    mainImage: { url: defaultImage, position: 'main' },
                    photo1: { url: defaultImage, position: 'photo1' },
                    photo2: { url: defaultImage, position: 'photo2' },
                    photo3: { url: defaultImage, position: 'photo3' },
                    groomImage: { url: defaultImage, position: 'groom' },
                    brideImage: { url: defaultImage, position: 'bride' },
                    galleryImage1: { url: defaultImage, position: 'gallery1' },
                    galleryImage2: { url: defaultImage, position: 'gallery2' },
                    galleryImage3: { url: defaultImage, position: 'gallery3' },
                    galleryImage4: { url: defaultImage, position: 'gallery4' },
                    galleryImage5: { url: defaultImage, position: 'gallery5' },
                    galleryImage6: { url: defaultImage, position: 'gallery6' },
                    galleryImage7: { url: defaultImage, position: 'gallery7' },
                };

                card.thumbnails.forEach(
                    (thumbnail: { thumbnail_id: number; image_url: string; position: string; card_id: number }) => {
                        if (thumbnail.card_id === card.card_id) {
                            const key =
                                ({
                                    main: 'mainImage',
                                    photo1: 'photo1',
                                    photo2: 'photo2',
                                    photo3: 'photo3',
                                    groom: 'groomImage',
                                    bride: 'brideImage',
                                    gallery1: 'galleryImage1',
                                    gallery2: 'galleryImage2',
                                    gallery3: 'galleryImage3',
                                    gallery4: 'galleryImage4',
                                    gallery5: 'galleryImage5',
                                    gallery6: 'galleryImage6',
                                    gallery7: 'galleryImage7',
                                }[thumbnail.position] as keyof Images) || null;
                            if (key) {
                                newImages[key] = {
                                    url: thumbnail.image_url,
                                    position: thumbnail.position,
                                };
                            } else {
                                console.warn(`Unknown thumbnail position: ${thumbnail.position}`);
                            }
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
        if (!weddingData) return;
        const weddingDateTime = parse(weddingData.weddingDate, 'dd/MM/yyyy', new Date()).setHours(
            parseInt(weddingData.weddingTime.split(':')[0]),
            parseInt(weddingData.weddingTime.split(':')[1])
        );

        const updateCountdown = () => {
            const now = new Date().getTime();
            const timeDiff = weddingDateTime - now;

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

    const generateCalendarDays = (): (number | null)[] => {
        if (!weddingData) return [];
        const weddingDateObj = parse(weddingData.weddingDate, 'dd/MM/yyyy', new Date()) || new Date(2025, 8, 17);
        const year = weddingDateObj.getFullYear();
        const month = weddingDateObj.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = Array(firstDay)
            .fill(null)
            .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
        const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        for (let i = days.length; i < totalSlots; i++) {
            days.push(null);
        }
        return days;
    };
    const calendarDays = generateCalendarDays();

    const handleShowMap = (mapType: 'groom' | 'bride') => {
        if (showMap === mapType) {
            openMapInGoogle(mapType === 'groom' ? weddingData?.groomMapUrl || '' : weddingData?.brideMapUrl || '');
        } else {
            setShowMap(mapType);
        }
    };

    const handleCloseMap = () => {
        setShowMap('none');
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

    const handleIntroClick = () => {
        setIsIntroOpen(false);
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    const formatTimeToHourMinute = (time: string) => {
        if (!time || !time.includes(':')) return time;
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    };

    const parseWeddingDate = (dateStr: string): Date | null => {
        try {
            return parse(dateStr, 'dd/MM/yyyy', new Date());
        } catch {
            return null;
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className={styles.error}>Lỗi: {error}. Vui lòng thử lại sau.</div>;
    }

    if (!weddingData) {
        return <div className={styles.error}>Không tìm thấy dữ liệu thiệp cưới.</div>;
    }

    const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 8, 17);
    const weddingDay = weddingDateObj.getDate();
    const weddingMonth = weddingDateObj.getMonth() + 1;
    const weddingYear = weddingDateObj.getFullYear();

    return (
        <div className={styles.Template15}>
            <div className={`${styles.intro} ${isIntroOpen ? '' : styles.intro_closed}`} onClick={handleIntroClick}>
                <div className={styles.title}>
                    <h1>Save the Date</h1>
                    <p>For the wedding ceremony of</p>
                </div>
                <div className={styles.groom_bride__intro}>
                    <span>{weddingData.groom}</span>
                    <span>{weddingData.bride}</span>
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
                <div className={styles.invition_name}>
                    <span>Trân Trọng Kính Mời</span>
                    <strong>{guestName}</strong>
                </div>
            </div>

            <div className={`${styles.wrapper} ${isIntroOpen ? styles.wrapper_hidden : ''}`}>
                <div className={styles.dynamic}>
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
                        <h3>{isPlaying ? 'Đang Phát: Lễ Đường' : 'Lễ Đường'}</h3>
                    </div>
                    <audio ref={audioRef} src="/audio/leduong.mp3" />
                </div>

                <div className={styles.mainImage} data-aos="fade-up">
                    <Image
                        src={images.mainImage.url}
                        alt="Main Image"
                        width={600}
                        height={400}
                        className={images.mainImage.url !== defaultImage ? '' : styles.imagePlaceholder}
                    />
                    <div className={styles.content_main}>
                        <div className={styles.groom_name}>{weddingData.groom}</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>{weddingData.bride}</div>
                    </div>
                </div>

                <div className={styles.familyInfo} data-aos="fade-up">
                    <div className={styles.wrapper_bar2}>
                        <div className={styles.familyContainer}>
                            <h1>
                                We joyfully invite you to join us in celebrating the wedding of our beloved children
                            </h1>
                            <div className={styles.invition_name}>
                                <span>Trân Trọng Kính Mời</span>
                                <strong>{guestName}</strong>
                            </div>
                            <div className={styles.flex}>
                                <div className={styles.familySide} data-aos="fade-right" data-aos-delay="300">
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyGroom.father}</span>
                                    <span>Bà: {weddingData.familyGroom.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> {weddingData.groomAddress}
                                    </p>
                                </div>
                                <div className={styles.familySide} data-aos="fade-left" data-aos-delay="300">
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyBride.father}</span>
                                    <span>Bà: {weddingData.familyBride.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> {weddingData.brideAddress}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.groom_and_bride}>
                                <div data-aos="fade-up" data-aos-delay="600">
                                    {weddingData.groom}
                                </div>
                                <div data-aos="fade-up" data-aos-delay="900">
                                    {weddingData.bride}
                                </div>
                            </div>
                            <div className={styles.dat} data-aos="fade-up" data-aos-delay="1200">
                                Lúc:{' '}
                                <strong>
                                    {formatTimeToHourMinute(weddingData.weddingTime)} || {weddingData.weddingDayOfWeek},{' '}
                                    {weddingDay} tháng {weddingMonth}, {weddingYear}
                                </strong>
                                <br />
                                <p>(Nhằm {weddingData.lunar_day})</p>
                                Your presence will be our greatest joy and honor.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.banner_date} data-aos="fade-up">
                    <div className={styles.text_png}>
                        <Image src="/images/m15/std_1__text.png" alt="Text decoration" width={200} height={100} />
                    </div>
                    <div className={styles.dateRow}>
                        <span>{weddingData.weddingDate ? weddingData.weddingDate.split('/')[0] : ''}</span>
                        <span>{weddingData.weddingDate ? weddingData.weddingDate.split('/')[1] : ''}</span>
                        <span>{weddingData.weddingDate ? weddingData.weddingDate.split('/')[2].slice(-2) : ''}</span>
                    </div>
                    <div className={styles.photos}>
                        <div className={styles.banner_img__1}>
                            <Image
                                src={images.photo1.url}
                                alt="Wedding photo 1"
                                width={200}
                                height={300}
                                className={images.photo1.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.banner_img__2}>
                            <Image
                                src={images.photo2.url}
                                alt="Wedding photo 2"
                                width={200}
                                height={300}
                                className={images.photo2.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.banner_img__3}>
                            <Image
                                src={images.photo3.url}
                                alt="Wedding photo 3"
                                width={200}
                                height={300}
                                className={images.photo3.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                    </div>
                    <div className={styles.love_story}>
                        <div className={styles.image_title}>
                            <Image src="/images/m15/love_story.png" alt="Love Story" width={200} height={100} />
                        </div>
                        <div className={styles.story_wrapper}>
                            <div className={styles.story_box} data-aos="fade-up" data-aos-delay="300">
                                <div className={styles.story_image}>
                                    <Image
                                        src={images.groomImage.url}
                                        alt="Groom Story"
                                        width={300}
                                        height={400}
                                        className={
                                            images.groomImage.url !== defaultImage ? '' : styles.imagePlaceholder
                                        }
                                    />
                                </div>
                                <div className={styles.story_text}>
                                    <h3>The Groom&apos;s Story</h3>
                                    <p>{weddingData.groomStory}</p>
                                </div>
                            </div>
                            <div
                                className={`${styles.story_box} ${styles.reverse}`}
                                data-aos="fade-up"
                                data-aos-delay="600"
                            >
                                <div className={styles.story_image}>
                                    <Image
                                        src={images.brideImage.url}
                                        alt="Bride Story"
                                        width={300}
                                        height={400}
                                        className={
                                            images.brideImage.url !== defaultImage ? '' : styles.imagePlaceholder
                                        }
                                    />
                                </div>
                                <div className={styles.story_text}>
                                    <h3>The Bride&apos;s Story</h3>
                                    <p>{weddingData.brideStory}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_teeth} data-aos="fade-up">
                    <div className={styles.teethTop}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>

                    <div className={styles.calendar}>
                        <div className={styles.calendarHeader}>
                            <h3>
                                Tháng {weddingMonth}, {weddingYear}
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
                                const isWeddingDay = day === weddingDay;
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
                        <button
                            className={styles.map_groom}
                            onClick={() => handleShowMap('groom')}
                            data-aos="fade-right"
                            data-aos-delay="300"
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showMap === 'groom' ? 'Mở map lớn' : 'Chỉ đường chú rể'}
                        </button>
                        <button
                            className={styles.map_bride}
                            onClick={() => handleShowMap('bride')}
                            data-aos="fade-left"
                            data-aos-delay="300"
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showMap === 'bride' ? 'Mở map lớn' : 'Chỉ đường cô dâu'}
                        </button>
                    </div>

                    <div className={styles.teethBottom}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>
                </div>

                <div className={styles.wrapper_map} data-aos="fade-up">
                    <div className={`${styles.google_map} ${showMap !== 'none' ? styles.showMap : ''}`}>
                        {showMap !== 'none' && (
                            <button className={styles.closeButton} onClick={handleCloseMap}>
                                Đóng
                            </button>
                        )}
                        {showMap === 'groom' && (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showMap === 'bride' && (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showMap === 'none' && (
                            <Image
                                src="/images/m10/icon_map.png"
                                alt="Map placeholder"
                                width={200}
                                height={200}
                                className={styles.imagePlaceholder}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.galary} data-aos="fade-up">
                    <div>
                        <Image
                            src={images.galleryImage1.url}
                            alt="Gallery photo 1"
                            width={200}
                            height={300}
                            className={images.galleryImage1.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>
                    <div>
                        <Image
                            src={images.galleryImage2.url}
                            alt="Gallery photo 2"
                            width={200}
                            height={300}
                            className={images.galleryImage2.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>
                    <div>
                        <Image
                            src={images.galleryImage3.url}
                            alt="Gallery photo 3"
                            width={200}
                            height={300}
                            className={images.galleryImage3.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>
                    <div>
                        <Image
                            src={images.galleryImage4.url}
                            alt="Gallery photo 4"
                            width={200}
                            height={300}
                            className={images.galleryImage4.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>
                    <div>
                        <Image
                            src={images.galleryImage5.url}
                            alt="Gallery photo 5"
                            width={200}
                            height={300}
                            className={images.galleryImage5.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>
                    <div>
                        <Image
                            src={images.galleryImage6.url}
                            alt="Gallery photo 6"
                            width={200}
                            height={300}
                            className={images.galleryImage6.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>
                    <div>
                        <Image
                            src={images.galleryImage7.url}
                            alt="Gallery photo 7"
                            width={200}
                            height={300}
                            className={images.galleryImage7.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>
                </div>

                <div className={styles.btn_invitionQR__popop} data-aos="fade-up" data-aos-delay="300">
                    {userId ? <InvitionsQR userId={userId} /> : <p>Lỗi: Không tìm thấy thông tin người dùng.</p>}
                </div>

                <div className={styles.footer} data-aos="fade-up" data-aos-delay="500">
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

export default Template15InviteeName;
