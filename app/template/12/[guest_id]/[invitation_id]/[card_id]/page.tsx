'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from '../../../12.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faChevronCircleDown,
    faChevronDown,
    faChevronUp,
    faCirclePlay,
    faCirclePause,
    faChevronRight,
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { parse } from 'date-fns';
import InvitionsQR from 'app/QR_received/invitionsQR/invitionsQR';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';

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
    bar0Image1: { url: string; position: string };
    bar0Image2: { url: string; position: string };
    bar1Image1: { url: string; position: string };
    groomImage: { url: string; position: string };
    brideImage: { url: string; position: string };
    bar4Image1: { url: string; position: string };
    bar4Image2: { url: string; position: string };
    bar4Image3: { url: string; position: string };
    bar4Image4: { url: string; position: string };
    bar4Image5: { url: string; position: string };
    bar4Image6: { url: string; position: string };
    bar4Image7: { url: string; position: string };
}

const defaultImage = '/images/m12/choose_img.png';

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

const Template12InviteeName: React.FC = () => {
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [showBrideStory, setShowBrideStory] = useState<boolean>(false);
    const [showContent, setShowContent] = useState<boolean>(true);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [isCollapsing, setIsCollapsing] = useState<boolean>(false);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [expandedBar, setExpandedBar] = useState<number>(0);
    const [images, setImages] = useState<Images>({
        bar0Image1: { url: defaultImage, position: 'bar0_0' },
        bar0Image2: { url: defaultImage, position: 'bar0_1' },
        bar1Image1: { url: defaultImage, position: 'bar1_0' },
        groomImage: { url: defaultImage, position: 'groomImages_0' },
        brideImage: { url: defaultImage, position: 'brideImages_0' },
        bar4Image1: { url: defaultImage, position: 'bar4_0' },
        bar4Image2: { url: defaultImage, position: 'bar4_1' },
        bar4Image3: { url: defaultImage, position: 'bar4_2' },
        bar4Image4: { url: defaultImage, position: 'bar4_3' },
        bar4Image5: { url: defaultImage, position: 'bar4_4' },
        bar4Image6: { url: defaultImage, position: 'bar4_5' },
        bar4Image7: { url: defaultImage, position: 'bar4_6' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useDisableDevTools()

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100,
        });

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
                    bride: weddingData?.bride || 'Cô Dâu',
                    groom: weddingData?.groom || 'Chú Rể',
                    weddingDate: weddingData?.weddingDate || 'Chưa xác định',
                    weddingTime: weddingData?.weddingTime || 'Chưa xác định',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'Chưa xác định',
                    lunar_day: card.invitations[0]?.lunar_day || weddingData?.lunar_day || 'Chưa xác định',
                    familyGroom: weddingData?.familyGroom || { father: 'Cha Chú Rể', mother: 'Mẹ Chú Rể' },
                    familyBride: weddingData?.familyBride || { father: 'Cha Cô Dâu', mother: 'Mẹ Cô Dâu' },
                    brideStory:
                        card.invitations[0]?.story_bride ||
                        weddingData?.brideStory ||
                        'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
                    groomStory:
                        card.invitations[0]?.story_groom &&
                        card.invitations[0]?.story_groom !== card.invitations[0]?.story_bride
                            ? card.invitations[0]?.story_groom
                            : weddingData?.groomStory ||
                              'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
                    groomAddress: weddingData?.groomAddress || 'Chưa xác định',
                    brideAddress: weddingData?.brideAddress || 'Chưa xác định',
                    groomMapUrl: weddingData?.groomMapUrl || '(-37.824279633275246, 144.9558605214034)',
                    brideMapUrl: weddingData?.brideMapUrl || '(-37.824279633275246, 144.9558605214034)',
                    venue_groom: card.invitations[0]?.venue_groom || 'Chưa xác định',
                    venue_bride: card.invitations[0]?.venue_bride || 'Chưa xác định',
                };
                setWeddingData(updatedWeddingData);
                setGuestName(guest.full_name || 'Khách Mời');
                setUserId(card.user_id);

                const newImages: Images = {
                    bar0Image1: { url: defaultImage, position: 'bar0_0' },
                    bar0Image2: { url: defaultImage, position: 'bar0_1' },
                    bar1Image1: { url: defaultImage, position: 'bar1_0' },
                    groomImage: { url: defaultImage, position: 'groomImages_0' },
                    brideImage: { url: defaultImage, position: 'brideImages_0' },
                    bar4Image1: { url: defaultImage, position: 'bar4_0' },
                    bar4Image2: { url: defaultImage, position: 'bar4_1' },
                    bar4Image3: { url: defaultImage, position: 'bar4_2' },
                    bar4Image4: { url: defaultImage, position: 'bar4_3' },
                    bar4Image5: { url: defaultImage, position: 'bar4_4' },
                    bar4Image6: { url: defaultImage, position: 'bar4_5' },
                    bar4Image7: { url: defaultImage, position: 'bar4_6' },
                };

                card.thumbnails.forEach(
                    (thumbnail: { thumbnail_id: number; image_url: string; position: string; card_id: number }) => {
                        if (thumbnail.card_id === card.card_id) {
                            const key =
                                ({
                                    bar0_0: 'bar0Image1',
                                    bar0_1: 'bar0Image2',
                                    bar1_0: 'bar1Image1',
                                    groomImages_0: 'groomImage',
                                    brideImages_0: 'brideImage',
                                    bar4_0: 'bar4Image1',
                                    bar4_1: 'bar4Image2',
                                    bar4_2: 'bar4Image3',
                                    bar4_3: 'bar4Image4',
                                    bar4_4: 'bar4Image5',
                                    bar4_5: 'bar4Image6',
                                    bar4_6: 'bar4Image7',
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
        if (!isIntroOpen) {
            const timer = setTimeout(() => {
                AOS.refresh();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isIntroOpen]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

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

    const handleIntroClick = () => {
        setIsIntroOpen(false);
    };

    const handleScreenClick = () => {
        if (isCollapsing || isIntroOpen) return;

        setIsCollapsing(true);
        setShowContent(false);

        setTimeout(() => {
            setIsCollapsing(false);
            setShowContent(true);
            setExpandedBar((prev) => {
                switch (prev) {
                    case 0:
                        return 1;
                    case 1:
                        return 2;
                    case 2:
                        return 3;
                    case 3:
                        return 4;
                    case 4:
                        return 5;
                    default:
                        return 0;
                }
            });
            setShowMap(false);
        }, 500);
    };

    const handleStoryToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setShowContent(false);
        setShowBrideStory((prev) => !prev);
        setTimeout(() => setShowContent(true), 50);
        setShowMap(false);
    };

    const handleMapToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setShowMap((prev) => !prev);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
        e.stopPropagation();
    };

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

    const slideStyle: React.CSSProperties = {
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateX(0)' : showBrideStory ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
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

    return (
        <div className={styles.template11} onClick={handleScreenClick}>
            <div
                className={`${styles.dynamic} ${isExpanded ? styles.expanded : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand();
                }}
            >
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
                    <span>{weddingData.groom.trim() || 'Chú Rể'}</span>
                    <span>{weddingData.bride.trim() || 'Cô Dâu'}</span>
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
                    <strong>{guestName.trim() || 'Khách Mời'}</strong>
                </div>
            </div>

            <div className={`${styles.wrapper} ${isIntroOpen ? styles.wrapper_hidden : ''}`}>
                {expandedBar === 0 && showContent && (
                    <div className={`${styles.wrapper_imageMain} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.image_top}>
                            <Image src={images.bar0Image1.url} alt="Top Image" width={500} height={500} />
                        </div>
                        <div className={styles.image_bottom}>
                            <Image src={images.bar0Image2.url} alt="Bottom Image" width={500} height={500} />
                        </div>
                        <div className={styles.infomation}>
                            <h3>{weddingData.groom.trim() || 'Chú Rể'}</h3>
                            <h3>{weddingData.bride.trim() || 'Cô Dâu'}</h3>
                            <span>{weddingData.weddingDate || 'Chưa xác định'}</span>
                        </div>
                    </div>
                )}

                {expandedBar === 1 && showContent && (
                    <div
                        className={`${styles.weddingInfo} ${isCollapsing ? styles.collapse : styles.expand}`}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.wrapper_bar1}>
                            <div className={styles.step_1}>
                                <div className={styles.image_1} data-aos="fade-down">
                                    <Image src={images.bar1Image1.url} alt="Wedding" width={500} height={500} />
                                </div>
                                <div className={styles.al}>
                                    <div className={styles.dayWedding} data-aos="fade-up" data-aos-delay="200">
                                        <h1>
                                            {weddingDay} | {weddingMonth}
                                        </h1>
                                        <h1>{weddingYear}</h1>
                                    </div>
                                    <div className={styles.text}>
                                        join us to celebrate
                                        <h3>the Wedding of</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 2 && showContent && (
                    <div
                        className={`${styles.familyInfo} ${isCollapsing ? styles.collapse : styles.expand}`}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.wrapper_bar2}>
                            <h2 data-aos="fade-down">Our Families</h2>
                            <div className={styles.familyContainer}>
                                <h1>
                                    Trân Trọng kính mời đến dự buổi tiệc
                                    <br />
                                    Chung vui cùng gia đình chúng tôi
                                </h1>
                                <div className={styles.familySide}>
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyGroom.father.trim() || 'Cha Chú Rể'}</span>
                                    <span>Bà: {weddingData.familyGroom.mother.trim() || 'Mẹ Chú Rể'}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address:{' '}
                                        {weddingData.groomAddress || 'Chưa xác định'}
                                    </p>
                                </div>
                                <div className={styles.familySide}>
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyBride.father.trim() || 'Cha Cô Dâu'}</span>
                                    <span>Bà: {weddingData.familyBride.mother.trim() || 'Mẹ Cô Dâu'}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address:{' '}
                                        {weddingData.brideAddress || 'Chưa xác định'}
                                    </p>
                                </div>
                                <h1>
                                    Vào lúc:{' '}
                                    <strong>
                                        {formatTimeToHourMinute(weddingData.weddingTime) || 'Chưa xác định'}
                                    </strong>
                                    <br />
                                    <p>
                                        (Nhằm ngày <strong>{weddingData.lunar_day || 'Chưa xác định'}</strong>)
                                    </p>
                                    Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                                </h1>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 3 && showContent && (
                    <div
                        key={`story-${showBrideStory ? 'bride' : 'groom'}`}
                        className={`${styles.wrapper_bar3} ${isCollapsing ? styles.collapse : styles.expand}`}
                        style={slideStyle}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.btn_map} onClick={handleMapToggle}>
                            <FontAwesomeIcon icon={showMap ? faChevronUp : faChevronDown} />
                            {showMap ? '' : ''}
                        </div>
                        <div className={`${styles.mapContainer} ${showMap ? styles.show : styles.hide}`}>
                            <iframe
                                src={getMapEmbedUrlFromCoords(
                                    showBrideStory ? weddingData.brideMapUrl : weddingData.groomMapUrl
                                )}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        <div className={styles.step_3}>
                            <div className={styles.image_container} data-aos="fade-down">
                                <div className={styles.image_3}>
                                    <Image
                                        src={showBrideStory ? images.brideImage.url : images.groomImage.url}
                                        alt={showBrideStory ? 'Bride Image' : 'Groom Image'}
                                        width={300}
                                        height={300}
                                    />
                                </div>
                            </div>
                            <div className={showBrideStory ? styles.brideName : styles.groomName}>
                                <h1 data-aos="fade-up" data-aos-delay="200">
                                    {showBrideStory
                                        ? weddingData.bride.trim() || 'Cô Dâu'
                                        : weddingData.groom.trim() || 'Chú Rể'}
                                </h1>
                                <div
                                    className={`${styles.change_story__button} ${showBrideStory ? styles.bride : styles.groom}`}
                                    onClick={handleStoryToggle}
                                >
                                    <FontAwesomeIcon icon={faChevronCircleDown} />
                                </div>
                            </div>
                            <div className={styles.text_story}>
                                <p>{showBrideStory ? weddingData.brideStory : weddingData.groomStory}</p>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 4 && showContent && (
                    <div className={`${styles.album_wedding} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.title}>Album Wedding</div>
                        <div className={styles.bento_grid}>
                            {[
                                images.bar4Image1,
                                images.bar4Image2,
                                images.bar4Image3,
                                images.bar4Image4,
                                images.bar4Image5,
                                images.bar4Image6,
                                images.bar4Image7,
                            ].map((img, index) => (
                                <div
                                    key={index}
                                    className={
                                        index < 3 || index === 5
                                            ? styles.boxTall
                                            : index === 4
                                              ? styles.box
                                              : styles.boxWide
                                    }
                                >
                                    <Image
                                        src={img.url}
                                        alt={`Album Image ${index + 1}`}
                                        width={index < 3 || index === 5 ? 200 : index === 4 ? 200 : 400}
                                        height={index < 3 || index === 5 ? 300 : 200}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {expandedBar === 5 && showContent && (
                    <div className={`${styles.footer} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.column_text}>
                            <h3>Thank You</h3>
                            <span className={styles.subtext}>
                                Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                                <br />
                                trong ngày đặc biệt của chúng tôi.
                            </span>
                        </div>
                        <div
                            className={styles.btn_invitionQR__popop}
                            data-aos="fade-up"
                            data-aos-delay="900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {userId ? (
                                <InvitionsQR userId={userId} />
                            ) : (
                                <p>Lỗi: Không tìm thấy thông tin người dùng.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Template12InviteeName;
