'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronRight,
    faChevronLeft,
    faLocationDot,
    faCirclePlay,
    faCirclePause,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../7.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useApi } from 'app/lib/apiContext/apiContext';
import { parse } from 'date-fns';
import InvitionsQR from 'app/QR_received/invitionsQR/invitionsQR';
import Loading from 'app/pages/DefaultLayouts/Loading_default/Loading';
export const dynamic = 'force-dynamic';

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
    locationGroomImage: { url: string; position: string };
    locationBrideImage: { url: string; position: string };
    albumImage1: { url: string; position: string };
    albumImage2: { url: string; position: string };
    albumImage3: { url: string; position: string };
    albumImage4: { url: string; position: string };
    albumImage5: { url: string; position: string };
    albumImage6: { url: string; position: string };
    albumImage7: { url: string; position: string };
}

const defaultImage = '/images/m7/choose_img.png';

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

function Template7InviteeName() {
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage: { url: defaultImage, position: 'main' },
        groomImage: { url: defaultImage, position: 'groom' },
        brideImage: { url: defaultImage, position: 'bride' },
        locationGroomImage: { url: defaultImage, position: 'locationGroom' },
        locationBrideImage: { url: defaultImage, position: 'locationBride' },
        albumImage1: { url: defaultImage, position: 'album1' },
        albumImage2: { url: defaultImage, position: 'album2' },
        albumImage3: { url: defaultImage, position: 'album3' },
        albumImage4: { url: defaultImage, position: 'album4' },
        albumImage5: { url: defaultImage, position: 'album5' },
        albumImage6: { url: defaultImage, position: 'album6' },
        albumImage7: { url: defaultImage, position: 'album7' },
    });
    const [guestName, setGuestName] = useState<string>('Huỳnh Nam');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showGroomMap, setShowGroomMap] = useState(false);
    const [showBrideMap, setShowBrideMap] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
                    bride: weddingData?.bride || 'Trúc Lam',
                    groom: weddingData?.groom || 'Nam Khánh',
                    weddingDate: weddingData?.weddingDate || '17/08/2025',
                    weddingTime: weddingData?.weddingTime || '10:00',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'Chủ Nhật',
                    lunar_day: card.invitations[0]?.lunar_day || weddingData?.lunar_day || '24 tháng 06 năm ất tỵ',
                    familyGroom: weddingData?.familyGroom || { father: 'Nguyễn Văn An', mother: 'Trần Thị Bảy' },
                    familyBride: weddingData?.familyBride || { father: 'Lê Văn Chung', mother: 'Phạm Thị Dung' },
                    brideStory:
                        weddingData?.brideStory ||
                        'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
                    groomStory:
                        weddingData?.groomStory ||
                        'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
                    groomAddress: weddingData?.groomAddress || 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
                    brideAddress: weddingData?.brideAddress || 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
                    groomMapUrl: weddingData?.groomMapUrl || '(-37.82425,144.956)',
                    brideMapUrl: weddingData?.brideMapUrl || '(-37.83333,144.96667)',
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
                    locationGroomImage: { url: defaultImage, position: 'locationGroom' },
                    locationBrideImage: { url: defaultImage, position: 'locationBride' },
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
                                    locationGroom: 'locationGroomImage',
                                    locationBride: 'locationBrideImage',
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
        return `${hours}:${minutes}`;
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

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    const toggleExpand = () => setIsExpanded(!isExpanded);

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

    const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 7, 17);
    const weddingDay = weddingDateObj.getDate();
    const weddingMonth = weddingDateObj.getMonth() + 1;
    const weddingYear = weddingDateObj.getFullYear();

    return (
        <div className={styles.template7}>
            <div className={`${styles.intro} ${isIntroOpen ? '' : styles.intro_closed}`} onClick={handleIntroClick}>
                <div className={styles.colum_center}></div>
                <div className={styles.wrapper_intro}>
                    <div className={styles.border_center__img}>
                        <img src="/images/m7/center.png" alt="Center Image" loading="lazy" data-aos="fade-in" />
                    </div>
                </div>
                <div className={styles.wrapper_animation__Click}>
                    <div className={styles.icon_arrow__left} data-aos="fade-right" data-aos-delay="300">
                        <FontAwesomeIcon icon={faChevronRight} className={styles.chevronLeft} />
                        <FontAwesomeIcon icon={faChevronRight} className={styles.chevronLeft} />
                    </div>
                    <div className={styles.text} data-aos="fade-in" data-aos-delay="400">
                        Click vào màn hình để mở
                    </div>
                    <div className={styles.icon_arrow__right} data-aos="fade-left" data-aos-delay="300">
                        <FontAwesomeIcon icon={faChevronLeft} className={styles.chevronRight} />
                        <FontAwesomeIcon icon={faChevronLeft} className={styles.chevronRight} />
                    </div>
                </div>
                <div className={styles.invition_name}>
                    <span>Trân Trọng Kính Mời</span>
                    <strong>{guestName}</strong>
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
                    <h3>{isPlaying ? 'Đang Phát: Until You' : 'Until You'}</h3>
                </div>
                {isExpanded && (
                    <div className={styles.expanded_content}>
                        <div className={styles.song_info}>
                            <h4>Until You</h4>
                            <p>Ca sĩ: Shayne Ward</p>
                        </div>
                        <div className={styles.progress_bar}>
                            <div className={styles.progress}></div>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} src="/audio/untilyou.mp3" />
            </div>

            <div className={`${styles.wrapper} ${isIntroOpen ? styles.wrapper_hidden : ''}`}>
                <div className={styles.header}>
                    <div className={styles.mainImage}>
                        <img
                            src={images.mainImage.url}
                            alt="Main Wedding"
                            loading="lazy"
                            data-aos="fade-in"
                            data-aos-delay="200"
                        />
                    </div>
                    <div className={styles.overlay_content}>
                        <div className={styles.layout_paper}>
                            <img src="/images/m7/png_5.png" alt="Overlay" loading="lazy" />
                            <div className={styles.content}>
                                <div className={styles.saveTheDate} data-aos="fade-in" data-aos-delay="300">
                                    <img src="/images/m7/std_text2.png" alt="Save the Date" loading="lazy" />
                                </div>
                                <div className={styles.weddingOf} data-aos="fade-up" data-aos-delay="400">
                                    THE WEDDING OF
                                </div>
                                <div className={styles.names}>
                                    <div className={styles.names_flex}>
                                        <div data-aos="fade-right" data-aos-delay="500">
                                            {weddingData.groom}
                                        </div>
                                        <div className={styles.and} data-aos="fade-in" data-aos-delay="500">
                                            &
                                        </div>
                                        <div data-aos="fade-left" data-aos-delay="500">
                                            {weddingData.bride}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.dateTime} data-aos="fade-up" data-aos-delay="600">
                                    {weddingDay} Tháng {weddingMonth}, {weddingYear} | {weddingData.weddingDayOfWeek},
                                    Lúc: {formatTimeToHourMinute(weddingData.weddingTime)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.info_family}>
                    <div className={styles.wrapper_info}>
                        <div className={styles.flex_representative}>
                            <div className={styles.representative_house} data-aos="fade-right" data-aos-delay="300">
                                <span>Nhà trai</span>
                                <h3>Ông: {weddingData.familyGroom.father}</h3>
                                <h3>Bà: {weddingData.familyGroom.mother}</h3>
                                <p className={styles.address}>
                                    <strong>
                                        <FontAwesomeIcon icon={faLocationDot} />
                                    </strong>{' '}
                                    {weddingData.groomAddress}
                                </p>
                            </div>
                            <div className={styles.representative_house} data-aos="fade-left" data-aos-delay="300">
                                <span>Nhà gái</span>
                                <h3>Ông: {weddingData.familyBride.father}</h3>
                                <h3>Bà: {weddingData.familyBride.mother}</h3>
                                <p className={styles.address}>
                                    <strong>
                                        <FontAwesomeIcon icon={faLocationDot} />
                                    </strong>{' '}
                                    {weddingData.brideAddress}
                                </p>
                            </div>
                        </div>
                        <div className={styles.name_groom__bride}>
                            <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="400">
                                {weddingData.groom}
                            </div>
                            <div className={styles.and_happy} data-aos="fade-in" data-aos-delay="400">
                                &
                            </div>
                            <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="400">
                                {weddingData.bride}
                            </div>
                        </div>
                        <p className={styles.text} data-aos="fade-up" data-aos-delay="500">
                            Trân trọng kính mời Quý Khách
                            <br />
                            Đến dự Lễ Thành Hôn của hai con chúng tôi
                        </p>
                        <p className={styles.lunarDay} data-aos="fade-up" data-aos-delay="600">
                            (Nhằm {weddingData.lunar_day})
                        </p>
                        <p className={styles.note} data-aos="fade-up" data-aos-delay="700">
                            Rất hân hạnh được đón tiếp!
                        </p>
                    </div>
                </div>
                <div className={styles.groom_bride}>
                    <div className={styles.groom_bride__wrapper}>
                        <div className={styles.groom}>
                            <div className={styles.img_groom} data-aos="fade-right" data-aos-delay="300">
                                <img src={images.groomImage.url} alt="Groom" loading="lazy" />
                            </div>
                            <div className={styles.info} data-aos="fade-left" data-aos-delay="400">
                                <span>Chú rể</span>
                                <div className={styles.name}>{weddingData.groom}</div>
                            </div>
                        </div>
                        <div className={styles.love_story__groom} data-aos="fade-up" data-aos-delay="500">
                            <p>{weddingData.groomStory}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.bride_bride}>
                    <div className={styles.bride_bride__wrapper}>
                        <div className={styles.bride}>
                            <div className={styles.info} data-aos="fade-right" data-aos-delay="400">
                                <span>Cô Dâu</span>
                                <div className={styles.name}>{weddingData.bride}</div>
                            </div>
                            <div className={styles.img_bride} data-aos="fade-left" data-aos-delay="300">
                                <img src={images.brideImage.url} alt="Bride" loading="lazy" />
                            </div>
                        </div>
                        <div className={styles.love_story__bride} data-aos="fade-up" data-aos-delay="500">
                            <p>{weddingData.brideStory}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.location}>
                    <div className={styles.wrapper_img__location}>
                        <div className={styles.img_top} data-aos="fade-up" data-aos-delay="300">
                            {!showGroomMap && (
                                <img src={images.locationGroomImage.url} alt="Groom Location" loading="lazy" />
                            )}
                            {showGroomMap && (
                                <div className={styles.map_groom}>
                                    <iframe
                                        src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                        width="600"
                                        height="450"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                        <div className={styles.torn_paper}>
                            <img src="/images/m7/top_bottom.png" alt="Torn Paper" loading="lazy" />
                            <div className={styles.show_theWay}>
                                <h3>Địa điểm tổ chức</h3>
                                <div className={styles.flex_location}>
                                    <button
                                        className={styles.btn_showTheway__groom}
                                        onClick={handleGroomMapClick}
                                        data-aos="fade-right"
                                        data-aos-delay="400"
                                    >
                                        {showGroomMap ? 'Xem trên bản đồ lớn' : 'Google map nhà trai'}
                                    </button>
                                    <button
                                        className={styles.btn_showTheway__bride}
                                        onClick={handleBrideMapClick}
                                        data-aos="fade-left"
                                        data-aos-delay="400"
                                    >
                                        {showBrideMap ? 'Xem trên bản đồ lớn' : 'Google map nhà gái'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.img_bottom} data-aos="fade-up" data-aos-delay="300">
                            {!showBrideMap && (
                                <img src={images.locationBrideImage.url} alt="Bride Location" loading="lazy" />
                            )}
                            {showBrideMap && (
                                <div className={styles.map_bride}>
                                    <iframe
                                        src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                        width="100%"
                                        height="100%"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.album_wedding}>
                    <div className={styles.title} data-aos="fade-in" data-aos-delay="300">
                        <img src="/images/m6/albumWedding_text.png" alt="Album Wedding" loading="lazy" />
                    </div>
                    <div className={styles.bento_grid}>
                        <div className={styles.boxTall} data-aos="fade-right" data-aos-delay="300">
                            <img src={images.albumImage1.url} alt="Album 1" loading="lazy" />
                        </div>
                        <div className={styles.boxTall} data-aos="fade-right" data-aos-delay="500">
                            <img src={images.albumImage2.url} alt="Album 2" loading="lazy" />
                        </div>
                        <div className={styles.boxTall} data-aos="fade-right" data-aos-delay="700">
                            <img src={images.albumImage3.url} alt="Album 3" loading="lazy" />
                        </div>
                        <div className={styles.boxWide} data-aos="fade-up" data-aos-delay="900">
                            <img src={images.albumImage4.url} alt="Album 4" loading="lazy" />
                        </div>
                        <div className={styles.box} data-aos="fade-up" data-aos-delay="1100">
                            <img src={images.albumImage5.url} alt="Album 5" loading="lazy" />
                        </div>
                        <div className={styles.boxTall} data-aos="fade-up" data-aos-delay="1300">
                            <img src={images.albumImage6.url} alt="Album 6" loading="lazy" />
                        </div>
                        <div className={styles.boxWide} data-aos="fade-up" data-aos-delay="1500">
                            <img src={images.albumImage7.url} alt="Album 7" loading="lazy" />
                        </div>
                    </div>
                </div>
                <div className={styles.footer} data-aos="fade-up" data-aos-delay="300">
                    <div className={styles.column_text}>
                        <h3>Thank You</h3>
                        <span className={styles.subtext}>
                            Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                            <br />
                            trong ngày đặc biệt của chúng tôi.
                        </span>
                    </div>
                    <div className={styles.btn_invitionQR__popop}>
                        {userId ? <InvitionsQR userId={userId} /> : <p>Lỗi: Không tìm thấy thông tin người dùng.</p>}
                    </div>
                    <img src="/images/m7/ft_m7.png" alt="Footer" loading="lazy" />
                </div>
            </div>
        </div>
    );
}

export default Template7InviteeName;
