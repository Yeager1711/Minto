'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from '../../../9.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faHeart,
    faCirclePlay,
    faCirclePause,
    faChevronRight,
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import { useApi } from 'app/lib/apiContext/apiContext';
import { parse } from 'date-fns';
import InvitionsQR from 'app/QR_received/invitionsQR/invitionsQR';
import Loading from 'app/pages/DefaultLayouts/Loading_default/Loading';

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
    groomImage: { url: string; position: string };
    brideImage: { url: string; position: string };
    albumImage1: { url: string; position: string };
    albumImage2: { url: string; position: string };
    albumImage3: { url: string; position: string };
    albumImage4: { url: string; position: string };
    albumImage5: { url: string; position: string };
    albumImage6: { url: string; position: string };
    albumImage7: { url: string; position: string };
}

const defaultImage = '/images/m8/choose_img.png';

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
    return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15&maptype=satellite`;
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

const Template9InviteeName: React.FC = () => {
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
        groomImage: { url: defaultImage, position: 'groom' },
        brideImage: { url: defaultImage, position: 'bride' },
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

    useEffect(() => {
        AOS.init({
            duration: 800,
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
                    bride: weddingData?.bride || '',
                    groom: weddingData?.groom || '',
                    weddingDate: weddingData?.weddingDate || '',
                    weddingTime: weddingData?.weddingTime || '',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || '',
                    lunar_day: card.invitations[0]?.lunar_day || weddingData?.lunar_day || '',
                    familyGroom: weddingData?.familyGroom || { father: '', mother: '' },
                    familyBride: weddingData?.familyBride || {
                        father: '',
                        mother: '',
                    },
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
                    groomImage: { url: defaultImage, position: 'groom' },
                    brideImage: { url: defaultImage, position: 'bride' },
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
                                    groom: 'groomImage',
                                    bride: 'brideImage',
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

    const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 6, 20);
    const weddingDay = weddingDateObj.getDate();
    const weddingMonth = weddingDateObj.getMonth() + 1;
    const weddingYear = weddingDateObj.getFullYear();

    return (
        <div className={styles.template9}>
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
                    <h3>{isPlaying ? 'Đang Phát: Why Not Me' : 'Why Not Me'}</h3>
                </div>
                {isExpanded && (
                    <div className={styles.expanded_content}>
                        <div className={styles.song_info}>
                            <h4>Why Not Me</h4>
                            <p>Ca sĩ: Enrique Iglesias</p>
                        </div>
                        <div className={styles.progress_bar}>
                            <div className={styles.progress}></div>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} src="/audio/whynotme.mp3" />
            </div>

            <div className={`${styles.intro} ${isIntroOpen ? '' : styles.intro_closed}`} onClick={handleIntroClick}>
                <div className={styles.title}>
                    <h1>Save the Date</h1>
                    <p>For the wedding ceremony of</p>
                </div>
                <div className={styles.text_And}>&</div>
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
                <div className={styles.mainImage}>
                    <Image src={images.mainImage.url} alt="Wedding main image" width={500} height={500} />
                    <div className={styles.imgFrame}></div>

                    <div className={styles.whiteBorder}>
                        <Image
                            src={images.mainImage.url}
                            alt="Wedding main image"
                            width={250}
                            height={250}
                            className={styles.roundedImage}
                        />
                    </div>

                    <div className={styles.text_pss_top}>
                        <h3>Our special day</h3>
                        <p>
                            Chúng ta đã cùng nhau bước vào hành trình mới của cuộc đời. Mong rằng sẽ mãi bên nhau và
                            cùng kỷ niệm ngày đặc biệt này mỗi năm.
                        </p>
                    </div>

                    <div className={styles.text_pss_bottom}>
                        <h3>The start of always</h3>
                    </div>
                </div>

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

                <div className={styles.info}>
                    <h3>
                        Trân Trọng kính mời đến dự buổi tiệc
                        <br />
                        <strong>chung vui cùng Gia đình chúng tôi</strong>
                    </h3>
                    <div className={styles.groom_name}>{weddingData.groom}</div>
                    <div className={styles.and}>&</div>
                    <div className={styles.bride_name}>{weddingData.bride}</div>
                    <div className={styles.specific_time}>
                        <div className={styles.time_day}>
                            Vào Lúc: <strong>{formatTimeToHourMinute(weddingData.weddingTime)}</strong> AM
                            <br />
                            <div className={styles.wrapper_times}>
                                <div className={styles.flex}>
                                    {weddingData.weddingDayOfWeek}
                                    <div className={styles.br}>
                                        <strong>{weddingDay}</strong>
                                        <br />
                                        <span>{weddingYear}</span>
                                    </div>
                                    Tháng {weddingMonth}
                                </div>
                            </div>
                        </div>
                    </div>
                    <span className={styles.lunar_day}>(Nhằm Ngày {weddingData.lunar_day})</span>

                    <div className={styles.calendar}>
                        <div className={styles.vignette}>
                            <img src="/images/m9/vignette_1.png" alt="" />
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
                            {Array.from({ length: 6 }, (_, weekIndex) => (
                                <React.Fragment key={weekIndex}>
                                    {Array.from({ length: 7 }, (_, dayIndex) => {
                                        const day = weekIndex * 7 + dayIndex - 1;
                                        const isWeddingDay = day === weddingDay;
                                        const isValidDay = day > 0 && day <= 31;
                                        return (
                                            <div
                                                key={dayIndex}
                                                className={`${styles.calendarDay} ${isWeddingDay ? styles.weddingDay : ''} ${
                                                    !isValidDay ? styles.emptyDay : ''
                                                }`}
                                            >
                                                {isValidDay && (
                                                    <>
                                                        {isWeddingDay ? (
                                                            <span className={styles.weddingDayContent}>
                                                                {day}
                                                                <FontAwesomeIcon
                                                                    icon={faHeart}
                                                                    className={styles.heartIcon}
                                                                />
                                                            </span>
                                                        ) : (
                                                            day
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className={styles.honor_message}>
                        Sự hiện diện của Quý khách
                        <br />
                        là niềm vinh hạnh của gia đình chúng tôi
                    </div>
                </div>

                <div className={styles.wrapper_story__love}>
                    <div className={styles.card_story__groom}>
                        <h1>The Groom&apos;s Story</h1>
                        <p className={styles.text_story}>
                            <span className={styles.groom_name}>
                                <img src={images.groomImage.url} alt="Groom" />
                                {weddingData.groom}
                            </span>
                            {weddingData.groomStory}
                        </p>
                        <div className={styles.vector_img__groom}>
                            {!showGroomMap && (
                                <Image src={images.groomImage.url} alt="Groom image" width={300} height={300} />
                            )}
                            {showGroomMap && (
                                <div className={styles.map_groom}>
                                    <iframe
                                        src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                            <div className={styles.btn_map} onClick={handleGroomMapClick}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showGroomMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>

                    <div className={styles.card_story__bride}>
                        <h1>The Bride&apos;s Story</h1>
                        <p className={styles.text_story}>
                            <span className={styles.bride_name}>
                                <img src={images.brideImage.url} alt="Bride" />
                                {weddingData.bride}
                            </span>
                            {weddingData.brideStory}
                        </p>
                        <div className={styles.vector_img__bride}>
                            {!showBrideMap && (
                                <Image src={images.brideImage.url} alt="Bride image" width={300} height={300} />
                            )}
                            {showBrideMap && (
                                <div className={styles.map_bride}>
                                    <iframe
                                        src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                            <div className={styles.btn_map} onClick={handleBrideMapClick}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showBrideMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.count}>
                    <div className={styles.countdownContainer}>
                        <div className={styles.leftPanel}>
                            <div className={styles.profileImage}>
                                <img src={images.mainImage.url} alt="Profile" />
                            </div>
                        </div>
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

                <div className={styles.album_wedding}>
                    <div className={styles.title}>Album Wedding</div>
                    <div className={styles.bento_grid}>
                        <div className={styles.boxTall}>
                            <Image src={images.albumImage1.url} alt="Wedding photo 1" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src={images.albumImage2.url} alt="Wedding photo 2" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src={images.albumImage3.url} alt="Wedding photo 3" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide}>
                            <Image src={images.albumImage4.url} alt="Wedding photo 4" width={400} height={200} />
                        </div>
                        <div className={styles.box}>
                            <Image src={images.albumImage5.url} alt="Wedding photo 5" width={200} height={200} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src={images.albumImage6.url} alt="Wedding photo 6" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide}>
                            <Image src={images.albumImage7.url} alt="Wedding photo 7" width={400} height={200} />
                        </div>
                    </div>
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
                    <div className={styles.btn_invitionQR__popop} data-aos="fade-up" data-aos-delay="900">
                        {userId ? <InvitionsQR userId={userId} /> : <p>Lỗi: Không tìm thấy thông tin người dùng.</p>}
                    </div>
                    <Image src="/images/m7/ft_m7.png" alt="Footer image" width={500} height={200} />
                </div>
            </div>
        </div>
    );
};

export default Template9InviteeName;
