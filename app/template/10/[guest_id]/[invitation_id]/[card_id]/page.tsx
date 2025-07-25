'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../../../10.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faLocationDot,
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
    groomImage1: { url: string; position: string };
    groomImage2: { url: string; position: string };
    groomImage3: { url: string; position: string };
    brideImage1: { url: string; position: string };
    brideImage2: { url: string; position: string };
    brideImage3: { url: string; position: string };
    saveTheDateImage: { url: string; position: string };
    albumImage1: { url: string; position: string };
    albumImage2: { url: string; position: string };
    albumImage3: { url: string; position: string };
    albumImage4: { url: string; position: string };
    albumImage5: { url: string; position: string };
    albumImage6: { url: string; position: string };
    albumImage7: { url: string; position: string };
}

const defaultImage = '/images/m10/choose_img.png';

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

function Template10InviteeName() {
    useDisableDevTools();
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [showGroomMap, setShowGroomMap] = useState<boolean>(false);
    const [showBrideMap, setShowBrideMap] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage: { url: defaultImage, position: 'main' },
        groomImage1: { url: defaultImage, position: 'groom1' },
        groomImage2: { url: defaultImage, position: 'groom2' },
        groomImage3: { url: defaultImage, position: 'groom3' },
        brideImage1: { url: defaultImage, position: 'bride1' },
        brideImage2: { url: defaultImage, position: 'bride2' },
        brideImage3: { url: defaultImage, position: 'bride3' },
        saveTheDateImage: { url: defaultImage, position: 'saveTheDate' },
        albumImage1: { url: defaultImage, position: 'album1' },
        albumImage2: { url: defaultImage, position: 'album2' },
        albumImage3: { url: defaultImage, position: 'album3' },
        albumImage4: { url: defaultImage, position: 'album4' },
        albumImage5: { url: defaultImage, position: 'album5' },
        albumImage6: { url: defaultImage, position: 'album6' },
        albumImage7: { url: defaultImage, position: 'album7' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    const hexPositions = [
        { top: -215, right: 360 }, // hex0
        { top: -205, right: -105 }, // hex1
        { top: 270, right: 120 }, // hex2
        { top: 270, right: 595 }, // hex3
        { top: 780, right: 360 }, // hex4
        { top: 760, right: -110 }, // hex5
        { top: 1245, right: 125 }, // hex6
    ];

    const wrapperWidth = 350;
    const wrapperHeight = 480;

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
                    bride: weddingData?.bride || 'Khánh An',
                    groom: weddingData?.groom || 'Nhật Thành',
                    weddingDate: weddingData?.weddingDate || '17/08/2025',
                    weddingTime: weddingData?.weddingTime || '10:00',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'Chủ Nhật',
                    lunar_day: card.invitations[0]?.lunar_day || weddingData?.lunar_day || '17 tháng 06 năm Ất Tỵ',
                    familyGroom: weddingData?.familyGroom || { father: 'Nguyễn Văn A', mother: 'Trần Thị B' },
                    familyBride: weddingData?.familyBride || { father: 'Lê Văn C', mother: 'Phạm Thị D' },
                    brideStory:
                        weddingData?.brideStory ||
                        'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
                    groomStory:
                        weddingData?.groomStory ||
                        'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
                    groomAddress: weddingData?.groomAddress || 'Long Tiên, Cai Lậy, Đồng Tháp',
                    brideAddress: weddingData?.brideAddress || 'Long Tiên, Cai Lậy, Đồng Tháp',
                    groomMapUrl: weddingData?.groomMapUrl || '(-37.824201188003414, 144.95603172078665)',
                    brideMapUrl: weddingData?.brideMapUrl || '(-37.82340456518251, 144.95807019941373)',
                    venue_groom: card.invitations[0]?.venue_groom || '',
                    venue_bride: card.invitations[0]?.venue_bride || '',
                };
                setWeddingData(updatedWeddingData);
                setGuestName(guest.full_name || '');
                setUserId(card.user_id);

                const newImages: Images = {
                    mainImage: { url: defaultImage, position: 'main' },
                    groomImage1: { url: defaultImage, position: 'groom1' },
                    groomImage2: { url: defaultImage, position: 'groom2' },
                    groomImage3: { url: defaultImage, position: 'groom3' },
                    brideImage1: { url: defaultImage, position: 'bride1' },
                    brideImage2: { url: defaultImage, position: 'bride2' },
                    brideImage3: { url: defaultImage, position: 'bride3' },
                    saveTheDateImage: { url: defaultImage, position: 'saveTheDate' },
                    albumImage1: { url: defaultImage, position: 'album1' },
                    albumImage2: { url: defaultImage, position: 'album2' },
                    albumImage3: { url: defaultImage, position: 'album3' },
                    albumImage4: { url: defaultImage, position: 'album4' },
                    albumImage5: { url: defaultImage, position: 'album5' },
                    albumImage6: { url: defaultImage, position: 'album6' },
                    albumImage7: { url: defaultImage, position: 'album7' },
                };

                card.thumbnails.forEach(
                    (thumbnail: { thumbnail_id: number; image_url: string; position: string; card_id: number }) => {
                        if (thumbnail.card_id === card.card_id) {
                            const key =
                                ({
                                    main: 'mainImage',
                                    groom1: 'groomImage1',
                                    groom2: 'groomImage2',
                                    groom3: 'groomImage3',
                                    bride1: 'brideImage1',
                                    bride2: 'brideImage2',
                                    bride3: 'brideImage3',
                                    saveTheDate: 'saveTheDateImage',
                                    album1: 'albumImage1',
                                    album2: 'albumImage2',
                                    album3: 'albumImage3',
                                    album4: 'albumImage4',
                                    album5: 'albumImage5',
                                    album6: 'albumImage6',
                                    album7: 'albumImage7',
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

    const handleGroomMapClick = () => {
        if (showGroomMap) {
            openMapInGoogle(weddingData?.groomMapUrl || '');
        } else {
            setShowGroomMap(true);
            setShowBrideMap(false);
        }
    };

    const handleBrideMapClick = () => {
        if (showBrideMap) {
            openMapInGoogle(weddingData?.brideMapUrl || '');
        } else {
            setShowBrideMap(true);
            setShowGroomMap(false);
        }
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

    if (isLoading) {
        return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className={styles.error}>Lỗi: {error}. Vui lòng thử lại sau.</div>;
    }

    if (!weddingData) {
        return <div className={styles.error}>Không tìm thấy dữ liệu thiệp cưới.</div>;
    }

    const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 7, 17);
    const weddingDay = weddingDateObj.getDate();
    const weddingMonth = weddingDateObj.getMonth() + 1;
    const weddingYear = weddingDateObj.getFullYear();

    const firstDayOfMonth = new Date(weddingYear, weddingMonth - 1, 1).getDay();
    const daysInMonth = new Date(weddingYear, weddingMonth, 0).getDate();
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }
    while (calendarDays.length < 42) {
        calendarDays.push(null);
    }

    return (
        <div className={styles.template10}>
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
                    <h3>{isPlaying ? 'Đang Phát: Hơn Cả Yêu' : 'Hơn Cả Yêu'}</h3>
                </div>
                {isExpanded && (
                    <div className={styles.expanded_content}>
                        <div className={styles.song_info}>
                            <h4>Hơn Cả Yêu</h4>
                            <p>Ca sĩ: Đức Phúc</p>
                        </div>
                        <div className={styles.progress_bar}>
                            <div className={styles.progress}></div>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} src="/audio/honcayeu.mp3" />
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
                <div className={styles.pss}>
                    <div className={styles.main}>
                        <div className={styles.text}>
                            <span className={styles.line_shortest}></span>
                        </div>

                        <div className={styles.hexWrapper}>
                            {hexPositions.map((pos, i) => {
                                const bgX = ((wrapperWidth - pos.right) / wrapperWidth) * 100;
                                const bgY = (pos.top / wrapperHeight) * 60;

                                return (
                                    <div key={i} className={`${styles.hex} ${styles[`hex${i}`]}`}>
                                        <div
                                            className={styles.hexIn}
                                            style={{
                                                backgroundImage: `url(${images.mainImage.url})`,
                                                backgroundPosition: `${bgX}% ${bgY}%`,
                                                backgroundSize: `${wrapperWidth}px ${wrapperHeight}px`,
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.text_info}>
                            <div className={styles.date}>
                                {weddingData.weddingDate
                                    ? `${weddingDay} tháng ${weddingMonth} năm ${weddingYear}`
                                    : '17 tháng 08 năm 2025'}
                            </div>
                            <div className={styles.decorLeft} />
                            <h1 className={styles.groom_name}>{weddingData.groom}</h1>
                            <h1 className={styles.bride_name}>{weddingData.bride}</h1>

                            <p className={styles.description}>
                                Với tất cả tình yêu và lòng biết ơn,
                                <br />
                                chúng tôi hân hoan mời bạn đến chứng kiến khoảnh khắc
                                <br />
                                hai tâm hồn hoà làm một trong lời hứa trọn đời,
                                <br />
                                giữa vòng tay ấm áp của gia đình và những người thân yêu.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.story_groom}>
                    <div className={styles.story_groom__wrapper}>
                        <h1>The Groom&apos;s Story</h1>
                        <h3 className={styles.for_groom}>{weddingData.groom}</h3>
                        <span className={styles.story_text}>{weddingData.groomStory || weddingData.groomStory}</span>
                    </div>

                    <div className={styles.flex_image_groom}>
                        <div className={styles.box_image}>
                            <Image
                                src={images.groomImage1.url}
                                alt="Groom photo 1"
                                width={200}
                                height={200}
                                className={images.groomImage1.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.box_image}>
                            <Image
                                src={images.groomImage2.url}
                                alt="Groom photo 2"
                                width={200}
                                height={200}
                                className={images.groomImage2.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.box_image}>
                            <Image
                                src={images.groomImage3.url}
                                alt="Groom photo 3"
                                width={200}
                                height={200}
                                className={images.groomImage3.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.story_bride}>
                    <div className={styles.story_bride__wrapper}>
                        <h1>The Bride&apos;s Story</h1>
                        <h3 className={styles.for_bride}>{weddingData.bride}</h3>
                        <span className={styles.story_text}>{weddingData.brideStory || weddingData.brideStory}</span>
                    </div>

                    <div className={styles.flex_image_groom}>
                        <div className={styles.box_image}>
                            <Image
                                src={images.brideImage1.url}
                                alt="Bride photo 1"
                                width={200}
                                height={200}
                                className={images.brideImage1.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.box_image}>
                            <Image
                                src={images.brideImage2.url}
                                alt="Bride photo 2"
                                width={200}
                                height={200}
                                className={images.brideImage2.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.box_image}>
                            <Image
                                src={images.brideImage3.url}
                                alt="Bride photo 3"
                                width={200}
                                height={200}
                                className={images.brideImage3.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.info}>
                    <h3>
                        Trân Trọng kính mời đến dự buổi tiệc
                        <br />
                        <strong>Chung vui cùng gia đình chúng tôi</strong>
                    </h3>

                    <div className={styles.specific_time}>
                        <div className={styles.info_family}>
                            <div className={styles.groom_family}>
                                <span> * Nhà trai</span>
                                <h3>Ông: {weddingData.familyGroom.father}</h3>
                                <h3>Bà: {weddingData.familyGroom.mother}</h3>
                                <p>D/C: {weddingData.groomAddress}</p>
                            </div>

                            <div className={styles.bride_family}>
                                <span> * Nhà gái</span>
                                <h3>Ông: {weddingData.familyBride.father}</h3>
                                <h3>Bà: {weddingData.familyBride.mother}</h3>
                                <p>D/C: {weddingData.brideAddress}</p>
                            </div>
                        </div>

                        <div className={styles.groom_name}>{weddingData.groom}</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>{weddingData.bride}</div>

                        <h4>
                            Lúc: <strong>{formatTimeToHourMinute(weddingData.weddingTime)}</strong> ||{' '}
                            {weddingData.weddingDayOfWeek}, {weddingDay} Tháng {weddingMonth}, {weddingYear}
                        </h4>

                        <span className={styles.lunar_day}>(Nhằm {weddingData.lunar_day})</span>
                    </div>
                </div>

                <div className={styles.flex_time_details}>
                    <div className={styles.image}>
                        <Image
                            src={images.saveTheDateImage.url}
                            alt="Save the date"
                            width={200}
                            height={200}
                            className={images.saveTheDateImage.url !== defaultImage ? '' : styles.imagePlaceholder}
                        />
                    </div>

                    <div className={styles.box}>
                        <h1>Save the date</h1>
                        <span>{`${weddingDay}.${weddingMonth}.${weddingYear}`}</span>
                    </div>
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
                                src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                width="100%"
                                height="400"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showBrideMap && (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                width="100%"
                                height="400"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {!showGroomMap && !showBrideMap && <img src="/images/m10/icon_map.png" alt="Map icon" />}
                    </div>
                </div>

                <div className={styles.album_wedding}>
                    <div className={styles.title}>Album Wedding</div>

                    <div className={styles.bento_grid}>
                        <div className={styles.boxTall}>
                            <Image
                                src={images.albumImage1.url}
                                alt="Wedding photo 1"
                                width={200}
                                height={300}
                                className={images.albumImage1.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.boxTall}>
                            <Image
                                src={images.albumImage2.url}
                                alt="Wedding photo 2"
                                width={200}
                                height={300}
                                className={images.albumImage2.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.boxTall}>
                            <Image
                                src={images.albumImage3.url}
                                alt="Wedding photo 3"
                                width={200}
                                height={300}
                                className={images.albumImage3.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.boxWide}>
                            <Image
                                src={images.albumImage4.url}
                                alt="Wedding photo 4"
                                width={400}
                                height={200}
                                className={images.albumImage4.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.box}>
                            <Image
                                src={images.albumImage5.url}
                                alt="Wedding photo 5"
                                width={200}
                                height={200}
                                className={images.albumImage5.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.boxTall}>
                            <Image
                                src={images.albumImage6.url}
                                alt="Wedding photo 6"
                                width={200}
                                height={300}
                                className={images.albumImage6.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                        <div className={styles.boxWide}>
                            <Image
                                src={images.albumImage7.url}
                                alt="Wedding photo 7"
                                width={400}
                                height={200}
                                className={images.albumImage7.url !== defaultImage ? '' : styles.imagePlaceholder}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.btn_invitionQR__popop} data-aos="fade-up" data-aos-delay="900">
                    {userId ? <InvitionsQR userId={userId} /> : <p>Lỗi: Không tìm thấy thông tin người dùng.</p>}
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

export default Template10InviteeName;
