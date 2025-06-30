'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faHeart,
    faCirclePlay,
    faCirclePause,
    faChevronRight,
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../6.module.css';
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
    photo1: { url: string; position?: string };
    photo2: { url: string; position?: string };
    photo3: { url: string; position?: string };
    loveImage1: { url: string; position?: string };
    loveImage2: { url: string; position?: string };
    loveImage3: { url: string; position?: string };
    collageImage1: { url: string; position?: string };
    collageImage2: { url: string; position?: string };
    collageImage3: { url: string; position?: string };
    collageImage4: { url: string; position?: string };
    collageImage5: { url: string; position?: string };
    collageImage6: { url: string; position?: string };
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
    return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15&maptype=satellite`;
};

function Template6InviteeName() {
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage: { url: defaultImage, position: 'main' },
        groomImage: { url: defaultImage, position: 'groom' },
        brideImage: { url: defaultImage, position: 'bride' },
        photo1: { url: defaultImage, position: 'photo1' },
        photo2: { url: defaultImage, position: 'photo2' },
        photo3: { url: defaultImage, position: 'photo3' },
        loveImage1: { url: defaultImage, position: 'love1' },
        loveImage2: { url: defaultImage, position: 'love2' },
        loveImage3: { url: defaultImage, position: 'love3' },
        collageImage1: { url: defaultImage, position: 'collage1' },
        collageImage2: { url: defaultImage, position: 'collage2' },
        collageImage3: { url: defaultImage, position: 'collage3' },
        collageImage4: { url: defaultImage, position: 'collage4' },
        collageImage5: { url: defaultImage, position: 'collage5' },
        collageImage6: { url: defaultImage, position: 'collage6' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMapActive, setIsMapActive] = useState(false);
    const [mapType, setMapType] = useState<'groom' | 'bride' | null>(null);

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
                    weddingTime: weddingData?.weddingTime || '11:00',
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
                setGuestName(guest.full_name || 'Huỳnh Nam');
                setUserId(card.user_id);

                const newImages: Images = {
                    mainImage: { url: defaultImage, position: 'main' },
                    groomImage: { url: defaultImage, position: 'groom' },
                    brideImage: { url: defaultImage, position: 'bride' },
                    photo1: { url: defaultImage, position: 'photo1' },
                    photo2: { url: defaultImage, position: 'photo2' },
                    photo3: { url: defaultImage, position: 'photo3' },
                    loveImage1: { url: defaultImage, position: 'love1' },
                    loveImage2: { url: defaultImage, position: 'love2' },
                    loveImage3: { url: defaultImage, position: 'love3' },
                    collageImage1: { url: defaultImage, position: 'collage1' },
                    collageImage2: { url: defaultImage, position: 'collage2' },
                    collageImage3: { url: defaultImage, position: 'collage3' },
                    collageImage4: { url: defaultImage, position: 'collage4' },
                    collageImage5: { url: defaultImage, position: 'collage5' },
                    collageImage6: { url: defaultImage, position: 'collage6' },
                };

                card.thumbnails.forEach(
                    (thumbnail: { thumbnail_id: number; image_url: string; position: string; card_id: number }) => {
                        if (thumbnail.card_id === card.card_id) {
                            const key =
                                ({
                                    main: 'mainImage',
                                    groom: 'groomImage',
                                    bride: 'brideImage',
                                    photo1: 'photo1',
                                    photo2: 'photo2',
                                    photo3: 'photo3',
                                    love1: 'loveImage1',
                                    love2: 'loveImage2',
                                    love3: 'loveImage3',
                                    collage1: 'collageImage1',
                                    collage2: 'collageImage2',
                                    collage3: 'collageImage3',
                                    collage4: 'collageImage4',
                                    collage5: 'collageImage5',
                                    collage6: 'collageImage6',
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

    const toggleMap = () => {
        setIsMapActive(!isMapActive);
    };

    const handleMapClick = (type: 'groom' | 'bride') => {
        setIsMapActive(true);
        setMapType(type);
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
    const weddingMonth = weddingDateObj.getMonth() + 1; // 0-based to 1-based
    const weddingYear = weddingDateObj.getFullYear();
    const firstDayOfMonth = new Date(weddingYear, weddingDateObj.getMonth(), 1).getDay();
    const daysInMonth = new Date(weddingYear, weddingDateObj.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div className={styles.template6}>
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
                    <h3>{isPlaying ? 'Đang Phát: My Love' : 'My Love'}</h3>
                </div>
                {isExpanded && (
                    <div className={styles.expanded_content}>
                        <div className={styles.song_info}>
                            <h4>My Love</h4>
                            <p>Ca sĩ: Westlife</p>
                        </div>
                        <div className={styles.progress_bar}>
                            <div className={styles.progress}></div>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} src="/audio/mylove.mp3" />
            </div>

            <div className={`${styles.wrapper} ${isIntroOpen ? styles.wrapper_hidden : ''}`}>
                <div className={`${styles.intro} ${isIntroOpen ? '' : styles.intro_closed}`} onClick={handleIntroClick}>
                    <div className={styles.intro}>
                        <div className={styles.flower_1}>
                            <img src="/images/m6/6.6.jpg" alt="Flower 1" loading="lazy" />
                        </div>
                        <div className={styles.flower_2}>
                            <img src="/images/m6/6.1.jpg" alt="Flower 2" loading="lazy" />
                        </div>
                        <div className={styles.wrapper_info}>
                            <div className={styles.name_groom} data-aos="fade-right" data-aos-delay="200">
                                {weddingData.groom}
                            </div>
                            <div className={styles.sh} data-aos="fade-in" data-aos-delay="400">
                                <img src="/images/m6/moc_intro.png" alt="Symbol" loading="lazy" />
                            </div>
                            <div className={styles.name_bride} data-aos="fade-left" data-aos-delay="200">
                                {weddingData.bride}
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
                        <div className={styles.invition_name}>
                            Trân trọng kính mời: <strong>{guestName}</strong>
                        </div>
                    </div>
                </div>
                <div className={styles.mainImage}>
                    <img src={images.mainImage.url} alt="Wedding couple" loading="lazy" />
                    <div className={styles.overlay}>
                        <div className={styles.content}>
                            <div className={styles.saveTheDate} data-aos="fade-in" data-aos-delay="200">
                                Save the Date
                            </div>
                            <div className={styles.weddingOf} data-aos="fade-up" data-aos-delay="400">
                                THE WEDDING OF
                            </div>
                            <div className={styles.names}>
                                <div className={styles.names_flex}>
                                    <div data-aos="fade-right" data-aos-delay="600">
                                        {weddingData.groom}
                                    </div>
                                    <div className={styles.and} data-aos="fade-in" data-aos-delay="600">
                                        &
                                    </div>
                                    <div data-aos="fade-left" data-aos-delay="600">
                                        {weddingData.bride}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.dateTime} data-aos="fade-up" data-aos-delay="800">
                                {weddingDay} Tháng {weddingMonth}, {weddingYear} | {weddingData.weddingDayOfWeek}, Lúc:{' '}
                                {formatTimeToHourMinute(weddingData.weddingTime)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.info_family}>
                    <div className={styles.flex_representative}>
                        <div className={styles.representative_house} data-aos="fade-right" data-aos-delay="300">
                            <span>Nhà trai</span>
                            <h3>Ông: {weddingData.familyGroom.father}</h3>
                            <h3>Bà: {weddingData.familyGroom.mother}</h3>
                        </div>
                        <div className={styles.representative_house} data-aos="fade-left" data-aos-delay="300">
                            <span>Nhà gái</span>
                            <h3>Ông: {weddingData.familyBride.father}</h3>
                            <h3>Bà: {weddingData.familyBride.mother}</h3>
                        </div>
                    </div>

                    <div className={styles.name_groom__bride}>
                        <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="500">
                            {weddingData.groom}
                        </div>
                        <div className={styles.image_happy} data-aos="fade-in" data-aos-delay="500">
                            <img src="/images/m6/happy_img.png" alt="Happy" loading="lazy" />
                        </div>
                        <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="500">
                            {weddingData.bride}
                        </div>
                    </div>

                    <p className={styles.text} data-aos="fade-up" data-aos-delay="600">
                        Trân trọng kính mời Quý Khách
                        <br />
                        Đến dự Lễ Thành Hôn của hai con chúng tôi
                    </p>

                    <div className={styles.flex_info_map}>
                        <div className={styles.flex}>
                            <div className={styles.flex_left} data-aos="fade-right" data-aos-delay="300">
                                <p className={styles.at}>Lúc {formatTimeToHourMinute(weddingData.weddingTime)}</p>
                                <div className={styles.dateBox}>
                                    <div>{weddingData.weddingDayOfWeek}</div>
                                    <div className={styles.day}>
                                        <strong>{weddingDay}</strong>
                                    </div>
                                    <div className={styles.month}>
                                        <strong>{weddingMonth.toString().padStart(2, '0')}</strong>
                                    </div>
                                </div>
                                <p className={styles.year}>
                                    <strong>{weddingYear}</strong>
                                </p>
                            </div>

                            <div className={styles.flex_right} data-aos="fade-left" data-aos-delay="500">
                                <div className={styles.info}>
                                    <div className={styles.address_groom}>
                                        <h3>Địa chỉ nhà Trai</h3>
                                        <p>{weddingData.groomAddress}</p>
                                        <button className={styles.btn_location} onClick={() => handleMapClick('groom')}>
                                            <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                        </button>
                                    </div>
                                    <div className={styles.address_bride}>
                                        <h3>Địa chỉ nhà Gái</h3>
                                        <p>{weddingData.brideAddress}</p>
                                        <button className={styles.btn_location} onClick={() => handleMapClick('bride')}>
                                            <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.map} ${isMapActive ? styles.active : ''}`}>
                            <div className={styles.map_wrapper}>
                                <div className={styles.btn_close} onClick={toggleMap}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </div>
                                {mapType &&
                                    (weddingData[`${mapType}MapUrl`] ? (
                                        <iframe
                                            src={getMapEmbedUrlFromCoords(weddingData[`${mapType}MapUrl`])}
                                            width="100%"
                                            height="450"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    ) : (
                                        <div>{`Lỗi tải bản đồ nhà ${mapType === 'groom' ? 'trai' : 'gái'}. Vui lòng kiểm tra tọa độ.`}</div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.calendar} data-aos="fade-up" data-aos-delay="700">
                        <div className={styles.calendar_header}>
                            <h3>
                                Tháng {weddingMonth}, {weddingYear}
                            </h3>
                        </div>
                        <div className={styles.calendar_grid}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                <div key={day} className={styles.calendar_day}>
                                    {day}
                                </div>
                            ))}
                            {days.map((day, index) => (
                                <div
                                    key={index}
                                    className={`${styles.calendar_date} ${day === weddingDay ? styles.wedding_date : ''}`}
                                >
                                    {day || ''}
                                    {day === weddingDay && (
                                        <FontAwesomeIcon icon={faHeart} className={styles.heart_icon} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className={styles.lunarDay} data-aos="fade-up" data-aos-delay="900">
                        (Nhằm {weddingData.lunar_day})
                    </p>
                    <p className={styles.note} data-aos="fade-up" data-aos-delay="1100">
                        Rất hân hạnh được đón tiếp!
                    </p>
                </div>

                <div className={styles.flex_photo}>
                    <div className={styles.box_photo}>
                        <img
                            src={images.photo1.url}
                            alt="Photo 1"
                            data-aos="fade-right"
                            data-aos-delay="300"
                            loading="lazy"
                        />
                    </div>
                    <div className={styles.box_photo}>
                        <img
                            src={images.photo2.url}
                            alt="Photo 2"
                            data-aos="fade-in"
                            data-aos-delay="600"
                            loading="lazy"
                        />
                    </div>
                    <div className={styles.box_photo}>
                        <img
                            src={images.photo3.url}
                            alt="Photo 3"
                            data-aos="fade-left"
                            data-aos-delay="900"
                            loading="lazy"
                        />
                    </div>
                </div>

                <div className={styles.love_story}>
                    <div className={styles.title} data-aos="fade-in" data-aos-delay="300">
                        <img src="/images/m6/love_story.png" alt="Love Story" loading="lazy" />
                    </div>

                    <div className={styles.groom}>
                        <div className={styles.wrapper_groom}>
                            <div className={styles.image_groom} data-aos="fade-right" data-aos-delay="300">
                                <img src={images.groomImage.url} alt="Groom" loading="lazy" />
                            </div>
                            <div className={styles.groom_name__story}>
                                <p data-aos="fade-right" data-aos-delay="600">
                                    Chú Rể
                                </p>
                                <h3 data-aos="fade-right" data-aos-delay="900">
                                    {weddingData.groom || weddingData?.groomStory}
                                </h3>
                            </div>
                        </div>
                        <div className={styles.groom_str} data-aos="fade-up" data-aos-delay="1100">
                            <p>{weddingData.groomStory}</p>
                        </div>
                    </div>
                    <div className={styles.bride}>
                        <div className={styles.wrapper_bride}>
                            <div className={styles.bride_name__story}>
                                <p data-aos="fade-left" data-aos-delay="600">
                                    Cô dâu
                                </p>
                                <h3 data-aos="fade-left" data-aos-delay="900">
                                    {weddingData.bride || weddingData?.brideStory}
                                </h3>
                            </div>
                            <div className={styles.image_bride} data-aos="fade-left" data-aos-delay="300">
                                <img src={images.brideImage.url} alt="Bride" loading="lazy" />
                            </div>
                        </div>
                        <div className={styles.bride_str} data-aos="fade-up" data-aos-delay="1100">
                            <p>{weddingData.brideStory}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.love_img}>
                    <div className={styles.flower_center}>
                        <img src="/images/m6/flower_center.png" alt="Flower" loading="lazy" />
                    </div>

                    <div className={styles.love_img__wrapper}>
                        <div className={styles.flex}>
                            <div className={styles.love_img__1} data-aos="fade-right" data-aos-delay="300">
                                <img src={images.loveImage1.url} alt="Love Image 1" loading="lazy" />
                            </div>
                            <div className={styles.love_img__2} data-aos="fade-right" data-aos-delay="600">
                                <img src={images.loveImage2.url} alt="Love Image 2" loading="lazy" />
                            </div>
                        </div>
                        <div className={styles.love_img__3} data-aos="fade-up" data-aos-delay="900">
                            <img src={images.loveImage3.url} alt="Love Image 3" loading="lazy" />
                        </div>
                    </div>
                </div>

                <div className={styles.album_wedding}>
                    <div className={styles.title} data-aos="fade-in" data-aos-delay="300">
                        <img src="/images/m6/albumWedding_text.png" alt="Album Wedding" loading="lazy" />
                    </div>

                    <div className={styles.wrapper_bg}>
                        <div className={styles.collage_left}>
                            <div className={styles.img1} data-aos="fade-up" data-aos-delay="300">
                                <img src={images.collageImage1.url} alt="Collage 1" loading="lazy" />
                            </div>
                            <div className={styles.img2} data-aos="fade-right" data-aos-delay="600">
                                <img src={images.collageImage2.url} alt="Collage 2" loading="lazy" />
                            </div>
                            <div className={styles.img3} data-aos="fade-up" data-aos-delay="900">
                                <img src={images.collageImage3.url} alt="Collage 3" loading="lazy" />
                            </div>
                        </div>
                        <div className={styles.collage_right}>
                            <div className={styles.img4} data-aos="fade-left" data-aos-delay="1100">
                                <img src={images.collageImage4.url} alt="Collage 4" loading="lazy" />
                            </div>
                            <div className={styles.img5} data-aos="fade-left" data-aos-delay="1400">
                                <img src={images.collageImage5.url} alt="Collage 5" loading="lazy" />
                            </div>
                            <div className={styles.img6} data-aos="fade-left" data-aos-delay="1700">
                                <img src={images.collageImage6.url} alt="Collage 6" loading="lazy" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer} data-aos="fade-up">
                    <div className={styles.column_text}>
                        <h3 data-aos="fade-up" data-aos-delay="1000">
                            Thank You
                        </h3>
                        <span className={styles.subtext} data-aos="fade-up" data-aos-delay="2000">
                            Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                            <br />
                            trong ngày đặc biệt của chúng tôi.
                        </span>
                    </div>
                    <div className={styles.btn_invitionQR__popop}>
                        {userId ? <InvitionsQR userId={userId} /> : <p>Lỗi: Không tìm thấy thông tin người dùng.</p>}
                    </div>
                    <img src="/images/m6/footer.png" alt="" />
                </div>
            </div>
        </div>
    );
}

export default Template6InviteeName;
