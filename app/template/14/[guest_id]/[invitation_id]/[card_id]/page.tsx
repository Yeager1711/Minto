'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../../../14.module.css';
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
import Loading from 'app/pages/DefaultLayouts/Loading_default/Loading';

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
    mainImage1: { url: string; position: string };
    mainImage2: { url: string; position: string };
    mainImage3: { url: string; position: string };
    groomImage: { url: string; position: string };
    brideImage: { url: string; position: string };
    albumImage1: { url: string; position: string };
    albumImage2: { url: string; position: string };
    albumImage3: { url: string; position: string };
    albumImage4: { url: string; position: string };
    albumImage5: { url: string; position: string };
    albumImage6: { url: string; position: string };
    albumImage7: { url: string; position: string };
    albumImage8: { url: string; position: string };
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const defaultImage = '/images/m14/choose_img.png';

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

const Template14InviteeName: React.FC = () => {
    useDisableDevTools();
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [showMap, setShowMap] = useState<'none' | 'groom' | 'bride'>('none');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage1: { url: defaultImage, position: 'main1' },
        mainImage2: { url: defaultImage, position: 'main2' },
        mainImage3: { url: defaultImage, position: 'main3' },
        groomImage: { url: defaultImage, position: 'groom' },
        brideImage: { url: defaultImage, position: 'bride' },
        albumImage1: { url: defaultImage, position: 'album1' },
        albumImage2: { url: defaultImage, position: 'album2' },
        albumImage3: { url: defaultImage, position: 'album3' },
        albumImage4: { url: defaultImage, position: 'album4' },
        albumImage5: { url: defaultImage, position: 'album5' },
        albumImage6: { url: defaultImage, position: 'album6' },
        albumImage7: { url: defaultImage, position: 'album7' },
        albumImage8: { url: defaultImage, position: 'album8' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 60 });
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
                    mainImage1: { url: defaultImage, position: 'main1' },
                    mainImage2: { url: defaultImage, position: 'main2' },
                    mainImage3: { url: defaultImage, position: 'main3' },
                    groomImage: { url: defaultImage, position: 'groom' },
                    brideImage: { url: defaultImage, position: 'bride' },
                    albumImage1: { url: defaultImage, position: 'album1' },
                    albumImage2: { url: defaultImage, position: 'album2' },
                    albumImage3: { url: defaultImage, position: 'album3' },
                    albumImage4: { url: defaultImage, position: 'album4' },
                    albumImage5: { url: defaultImage, position: 'album5' },
                    albumImage6: { url: defaultImage, position: 'album6' },
                    albumImage7: { url: defaultImage, position: 'album7' },
                    albumImage8: { url: defaultImage, position: 'album8' },
                };

                card.thumbnails.forEach(
                    (thumbnail: { thumbnail_id: number; image_url: string; position: string; card_id: number }) => {
                        if (thumbnail.card_id === card.card_id) {
                            const key =
                                ({
                                    main1: 'mainImage1',
                                    main2: 'mainImage2',
                                    main3: 'mainImage3',
                                    groom: 'groomImage',
                                    bride: 'brideImage',
                                    album1: 'albumImage1',
                                    album2: 'albumImage2',
                                    album3: 'albumImage3',
                                    album4: 'albumImage4',
                                    album5: 'albumImage5',
                                    album6: 'albumImage6',
                                    album7: 'albumImage7',
                                    album8: 'albumImage8',
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

    const handleIntroClick = () => {
        setIsIntroOpen(false);
    };

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

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

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

    const generateCalendarDays = (): (number | null)[] => {
        if (!weddingData) return [];
        const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 8, 17);
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

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Loading />
            </div>
        );
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
        <div className={styles.template14}>
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
                    <h3>{isPlaying ? 'Đang Phát: Lễ Đường' : 'Lễ Đường'}</h3>
                </div>
                {isExpanded && (
                    <div className={styles.expanded_content}>
                        <div className={styles.song_info}>
                            <h4>Lễ Đường</h4>
                            <p>Ca sĩ: | KAI ĐINH |</p>
                        </div>
                        <div className={styles.progress_bar}>
                            <div className={styles.progress}></div>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} src="/audio/leduong.mp3" />
            </div>

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
                <div className={styles.header_content}>
                    <div className={styles.image_flower_blue}>
                        <Image
                            src="/images/m14/14.1.jpg"
                            alt="Flower Blue"
                            width={400}
                            height={300}
                            className={styles.imagePlaceholder}
                        />
                    </div>

                    <div className={styles.wrapper_main}>
                        <div className={styles.img_main_1}>
                            <Image
                                src={images.mainImage1.url}
                                alt="Main 1"
                                width={400}
                                height={300}
                                className={images.mainImage1.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.img_main_2}>
                            <Image
                                src={images.mainImage2.url}
                                alt="Main 2"
                                width={400}
                                height={300}
                                className={images.mainImage2.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.img_main_3}>
                            <Image
                                src={images.mainImage3.url}
                                alt="Main 3"
                                width={400}
                                height={300}
                                className={images.mainImage3.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                    </div>

                    <div className={styles.content_header}>
                        <span data-aos="fade-up" data-aos-delay="200">
                            Please join us for
                        </span>
                        <h3 data-aos="fade-up" data-aos-delay="400">
                            The Wedding of
                        </h3>
                        <div className={styles.groom} data-aos="fade-up" data-aos-delay="600">
                            {weddingData.groom}
                        </div>
                        <div className={styles.and} data-aos="fade-up" data-aos-delay="800">
                            and
                        </div>
                        <div className={styles.bride} data-aos="fade-up" data-aos-delay="1000">
                            {weddingData.bride}
                        </div>
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
                            <h1 data-aos="fade-up" data-aos-delay="300">
                                Trân Trọng kính mời đến dự buổi tiệc
                                <br />
                                Chung vui cùng gia đình chúng tôi
                            </h1>
                            <div className={styles.flex}>
                                <div className={styles.familySide} data-aos="fade-right" data-aos-delay="600">
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyGroom.father}</span>
                                    <span>Bà: {weddingData.familyGroom.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        {' Address: ' + weddingData.groomAddress}
                                    </p>
                                </div>
                                <div className={styles.familySide} data-aos="fade-left" data-aos-delay="600">
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyBride.father}</span>
                                    <span>Bà: {weddingData.familyBride.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        {' Address: ' + weddingData.brideAddress}
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
                            <div className={styles.dat} data-aos="fade-up" data-aos-delay="600">
                                Lúc:{' '}
                                <strong>
                                    {formatTimeToHourMinute(weddingData.weddingTime)} || {weddingData.weddingDayOfWeek},{' '}
                                    {weddingDay} tháng {weddingMonth}, {weddingYear}
                                </strong>
                                <br />
                                <p>(Nhằm {weddingData.lunar_day})</p>
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
                                <div className={styles.image_story__groom} data-aos="fade-down" data-aos-delay="300">
                                    <Image
                                        src={images.groomImage.url}
                                        alt="Groom"
                                        width={300}
                                        height={400}
                                        className={
                                            images.groomImage.url !== defaultImage ? '' : styles.imagePlaceholder
                                        }
                                    />
                                </div>
                                <div className={styles.text_story} data-aos="fade-up" data-aos-delay="600">
                                    <h1>The Groom&apos;s Story</h1>
                                    <p>{weddingData.groomStory}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.story_bride}>
                        <div className={styles.preview_select}>
                            <div className={styles.flex_content}>
                                <div className={styles.image_story__bride} data-aos="fade-down" data-aos-delay="300">
                                    <Image
                                        src={images.brideImage.url}
                                        alt="Bride"
                                        width={300}
                                        height={400}
                                        className={
                                            images.brideImage.url !== defaultImage ? '' : styles.imagePlaceholder
                                        }
                                    />
                                </div>
                                <div className={styles.text_story} data-aos="fade-up" data-aos-delay="600">
                                    <h1>The Bride&apos;s Story</h1>
                                    <p>{weddingData.brideStory}</p>
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

                    <div className={styles.calendar} data-aos="fade-up" data-aos-delay="300">
                        <div className={styles.text_std__image}>
                            <Image src="/images/m14/std_txt.png" alt="Save the Date" width={200} height={50} />
                        </div>
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

                    <div className={styles.count} data-aos="fade-up" data-aos-delay="800">
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
                                data-aos-delay="600"
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showMap === 'bride' ? 'Mở map lớn' : 'Chỉ đường cô dâu'}
                            </button>
                        </div>

                        <div className={`${styles.google_map} ${showMap !== 'none' ? styles.showMap : ''}`}>
                            <button className={styles.closeButton} onClick={handleCloseMap}>
                                Đóng
                            </button>
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
                                    alt="Map Placeholder"
                                    width={200}
                                    height={200}
                                    className={styles.imagePlaceholder}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.teethBottom}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>
                </div>

                <div className={styles.title_album} data-aos="fade-up" data-aos-delay="1000">
                    Wedding Album
                </div>
                <div className={styles.bento_image} data-aos="fade-up" data-aos-delay="1200">
                    <Image
                        src={images.albumImage1.url}
                        alt="Album 1"
                        width={200}
                        height={300}
                        className={`${styles.img1} ${images.albumImage1.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                    <Image
                        src={images.albumImage2.url}
                        alt="Album 2"
                        width={200}
                        height={300}
                        className={`${styles.img2} ${images.albumImage2.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                    <Image
                        src={images.albumImage3.url}
                        alt="Album 3"
                        width={200}
                        height={300}
                        className={`${styles.img3} ${images.albumImage3.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                    <Image
                        src={images.albumImage4.url}
                        alt="Album 4"
                        width={200}
                        height={300}
                        className={`${styles.img4} ${images.albumImage4.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                    <Image
                        src={images.albumImage5.url}
                        alt="Album 5"
                        width={200}
                        height={300}
                        className={`${styles.img5} ${images.albumImage5.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                    <Image
                        src={images.albumImage6.url}
                        alt="Album 6"
                        width={200}
                        height={300}
                        className={`${styles.img6} ${images.albumImage6.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                    <Image
                        src={images.albumImage7.url}
                        alt="Album 7"
                        width={200}
                        height={300}
                        className={`${styles.img7} ${images.albumImage7.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                    <Image
                        src={images.albumImage8.url}
                        alt="Album 8"
                        width={200}
                        height={300}
                        className={`${styles.img8} ${images.albumImage8.url !== defaultImage ? '' : styles.imagePlaceholder}`}
                    />
                </div>

                <div className={styles.btn_invitionQR__popop} data-aos="fade-up" data-aos-delay="300">
                    {userId ? <InvitionsQR userId={userId} /> : <p>Lỗi: Không tìm thấy thông tin người dùng.</p>}
                </div>

                <div className={styles.footer} data-aos="fade-up" data-aos-delay="600">
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

export default Template14InviteeName;
