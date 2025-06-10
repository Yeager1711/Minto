'use client';
import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../../../3.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCirclePlay, faCirclePause, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Suspense } from 'react';
import { useApi } from 'app/lib/apiContext/apiContext';
import InvitionsQR from 'app/popup/invitionsQR/invitionsQR';

export const dynamic = 'force-dynamic';

interface Images {
    mainImage: { url: string; position?: string };
    flexImage1: { url: string; position?: string };
    flexImage2: { url: string; position?: string };
    flexImage3: { url: string; position?: string };
    galleryImage1: { url: string; position?: string };
    galleryImage2: { url: string; position?: string };
    galleryImage3: { url: string; position?: string };
    galleryImage4: { url: string; position?: string };
    galleryImage5: { url: string; position?: string };
    galleryImage6: { url: string; position?: string };
    footerImage: { url: string; position?: string };
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

function InviteeNameContent({ fullName }: { fullName: string }) {
    return <span>{fullName || 'bạn'}</span>;
}

// Function to generate Google Maps embed URL from coordinates in (latitude,longitude) format
const getMapEmbedUrlFromCoords = (coords: string): string => {
    if (!coords) return '';

    // Match coordinates in the format (latitude,longitude)
    const match = coords.match(/^\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
    if (!match) return '';

    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    if (isNaN(lat) || isNaN(lng)) return '';

    const apiMapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (!apiMapKey) {
        console.error('Google Maps API key is missing');
        return '';
    }

    // Construct a simpler Embed API URL with a pin at the coordinates
    return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15`;
};

function Template3InviteeName() {
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage: { url: '/images/m3/3.jpg', position: 'main' },
        flexImage1: { url: '/images/m3/3.jpg', position: 'flex1' },
        flexImage2: { url: '/images/m3/3.jpg', position: 'flex2' },
        flexImage3: { url: '/images/m3/3.jpg', position: 'flex3' },
        galleryImage1: { url: '/images/m3/3.jpg', position: 'gallery1' },
        galleryImage2: { url: '/images/m3/3.jpg', position: 'gallery2' },
        galleryImage3: { url: '/images/m3/3.jpg', position: 'gallery3' },
        galleryImage4: { url: '/images/m3/3.jpg', position: 'gallery4' },
        galleryImage5: { url: '/images/m3/3.jpg', position: 'gallery5' },
        galleryImage6: { url: '/images/m3/3.jpg', position: 'gallery6' },
        footerImage: { url: '/images/m3/3.jpg', position: 'footer' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchGuestAndCard = async () => {
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

                const weddingData = card.custom_data.weddingData as Partial<WeddingData> | undefined;
                const updatedWeddingData: WeddingData = {
                    bride: weddingData?.bride || 'Chưa xác định',
                    groom: weddingData?.groom || 'Chưa xác định',
                    weddingDate: weddingData?.weddingDate || '06/06/2025',
                    weddingTime: weddingData?.weddingTime || '11:30 AM',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'FRIDAY',
                    lunar_day: card.invitations[0]?.lunar_day || '11 Tháng 05, Năm Ất Tỵ',
                    familyGroom: weddingData?.familyGroom || { father: 'Chưa xác định', mother: 'Chưa xác định' },
                    familyBride: weddingData?.familyBride || { father: 'Chưa xác định', mother: 'Chưa xác định' },
                    brideStory: weddingData?.brideStory || 'Chưa xác định',
                    groomStory: weddingData?.groomStory || 'Chưa xác định',
                    groomAddress: weddingData?.groomAddress || 'Chưa xác định',
                    brideAddress: weddingData?.brideAddress || 'Chưa xác định',
                    groomMapUrl: weddingData?.groomMapUrl || '',
                    brideMapUrl: weddingData?.brideMapUrl || '',
                    venue_groom: card.invitations[0]?.venue_groom || 'Chưa xác định',
                    venue_bride: card.invitations[0]?.venue_bride || 'Chưa xác định',
                };
                setWeddingData(updatedWeddingData);
                setGuestName(guest.full_name);
                setUserId(card.user_id);

                const newImages: Images = {
                    mainImage: { url: '', position: 'main' },
                    flexImage1: { url: '', position: 'flex1' },
                    flexImage2: { url: '', position: 'flex2' },
                    flexImage3: { url: '', position: 'flex3' },
                    galleryImage1: { url: '', position: 'gallery1' },
                    galleryImage2: { url: '', position: 'gallery2' },
                    galleryImage3: { url: '', position: 'gallery3' },
                    galleryImage4: { url: '', position: 'gallery4' },
                    galleryImage5: { url: '', position: 'gallery5' },
                    galleryImage6: { url: '', position: 'gallery6' },
                    footerImage: { url: '', position: 'footer' },
                };
                card.thumbnails.forEach(
                    (thumbnail: {
                        thumbnail_id: number;
                        image_url: string;
                        position: string;
                        description: string;
                        card_id: number;
                    }) => {
                        if (thumbnail.card_id === card.card_id) {
                            let key: keyof Images;
                            switch (thumbnail.position) {
                                case 'main':
                                    key = 'mainImage';
                                    break;
                                case 'flex1':
                                    key = 'flexImage1';
                                    break;
                                case 'flex2':
                                    key = 'flexImage2';
                                    break;
                                case 'flex3':
                                    key = 'flexImage3';
                                    break;
                                case 'gallery1':
                                    key = 'galleryImage1';
                                    break;
                                case 'gallery2':
                                    key = 'galleryImage2';
                                    break;
                                case 'gallery3':
                                    key = 'galleryImage3';
                                    break;
                                case 'gallery4':
                                    key = 'galleryImage4';
                                    break;
                                case 'gallery5':
                                    key = 'galleryImage5';
                                    break;
                                case 'gallery6':
                                    key = 'galleryImage6';
                                    break;
                                case 'footer':
                                    key = 'footerImage';
                                    break;
                                default:
                                    return;
                            }
                            newImages[key] = {
                                url: thumbnail.image_url.startsWith('http')
                                    ? thumbnail.image_url
                                    : `${thumbnail.image_url}`,
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
            }
        };

        fetchGuestAndCard();
    }, [pathname, getGuestAndCard]);

    const toggleExpand = () => setIsExpanded(!isExpanded);

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

    const handleIntroClick = () => setIsIntroOpen(false);

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

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    const formatTimeToHourMinute = (time: string) => {
        if (!time || !time.includes(':')) return time;
        const [hours, minutes] = time.split(':');
        return `${hours}h${minutes}`;
    };

    const parseWeddingDate = (dateStr: string): Date | null => {
        if (!dateStr || !dateStr.includes('/')) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
    };

    const formatDateToDDMMYYYY = (dateStr: string): string => {
        const date = parseWeddingDate(dateStr);
        if (!date) return '06.06.2025';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    if (error) {
        return <div className={styles.error}>Lỗi: {error}</div>;
    }

    if (!weddingData) {
        return <div></div>;
    }

    const weddingDate = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 5, 6);
    const daysInMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), 1).getDay();
    const daysInMonthArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <Suspense fallback={<div></div>}>
            <div className={styles.template3}>
                <div
                    className={`${styles.intro_invition} ${isIntroOpen ? styles.visible : styles.hidden}`}
                    onClick={handleIntroClick}
                >
                    <div className={styles.swipe_up}>
                        <div className={styles.wrapper_swipeUp}>
                            <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
                            <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
                            <span> Click hoặc vuốt để mở</span>
                        </div>
                    </div>

                    <div className={styles.wrapper}>
                        <div className={styles.image_psb__TL}>
                            <img src="/images/m3/t2.png" alt="Top Left Decoration" />
                        </div>
                        <div className={styles.image_psb__BR}>
                            <img src="/images/m3/t2.png" alt="Bottom Right Decoration" />
                        </div>
                        <div className={styles.text}>Wedding Invitations</div>
                        <div className={styles.mar}>
                            <div className={styles.groom_name}>{weddingData.groom}</div>
                            <div className={styles.and}>&</div>
                            <div className={styles.bride_name}>{weddingData.bride}</div>
                        </div>
                        <div className={styles.box_dateTime}>
                            <div className={styles.dateTime}>
                                <span className={styles.day}>{weddingData.weddingDate.split('/')[0]}</span>
                                <span className={styles.month}>Tháng {weddingData.weddingDate.split('/')[1]}</span>
                                <span className={styles.year}>{weddingData.weddingDate.split('/')[2]}</span>
                            </div>
                            <div className={styles.inviton_name}>
                                <span className={styles.invition}>Kính mời</span>
                                <h3 className={styles.name}>
                                    <InviteeNameContent fullName={guestName} />
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`${styles.template3_content} ${isIntroOpen ? styles.content_hidden : styles.content_visible}`}
                >
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
                            <h3>{isPlaying ? 'Đang Phát: Hơn cả yêu' : 'Hơn cả yêu'}</h3>
                        </div>
                        {isExpanded && (
                            <div className={styles.expanded_content}>
                                <div className={styles.album_art}>
                                    <img src={images.mainImage.url} alt="Album Art" />
                                </div>
                                <div className={styles.song_info}>
                                    <h4>Hơn cả yêu</h4>
                                    <p>Ca sĩ: Đức Phúc</p>
                                </div>
                                <div className={styles.progress_bar}>
                                    <div className={styles.progress}></div>
                                </div>
                            </div>
                        )}
                        <audio ref={audioRef} src="/audio/honcayeu.mp3" />
                    </div>

                    <div className={styles.header} data-aos="fade-up">
                        <div className={styles.flower_left} data-aos="fade-right" data-aos-delay="200">
                            <img src="/images/m3/t1.png" alt="Flower decoration left" />
                        </div>
                        <div className={styles.flower_right} data-aos="fade-left" data-aos-delay="200">
                            <img src="/images/m3/t1.png" alt="Flower decoration right" />
                        </div>
                        <div className={styles.header_content}>
                            <h4 data-aos="zoom-in" data-aos-delay="300">
                                Save the Date
                            </h4>
                            <div className={styles.imageMain} data-aos="fade-up" data-aos-delay="600">
                                <img src={images.mainImage.url} alt="Couple" />
                            </div>
                            <div className={styles.groom_bride} data-aos="fade-up" data-aos-delay="400">
                                <h3>
                                    {weddingData.groom} & {weddingData.bride}
                                </h3>
                            </div>
                            <div className={styles.invitation_details} data-aos="fade-up" data-aos-delay="500">
                                <p>WE INVITE YOU TO JOIN OUR WEDDING CEREMONY ON</p>
                                <p className={styles.date_time}>
                                    <span>{weddingData.weddingDayOfWeek}</span>
                                    <span>{weddingData.weddingDate.toUpperCase()}</span>
                                    <span>AT {weddingData.weddingTime}</span>
                                </p>
                                <p className={styles.year}>{weddingData.weddingDate.split('/')[2]}</p>
                                <div className={styles.location}>
                                    <p style={{ display: 'none' }}>{weddingData.venue_groom}</p>
                                    <p style={{ display: 'none' }}>{weddingData.groomAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.info_groom_bride} data-aos="fade-up">
                        <div className={styles.info_wrapper} data-aos="zoom-in" data-aos-delay="200">
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
                        <div className={styles.mar} data-aos="fade-up" data-aos-delay="300">
                            <div className={styles.groom_name}>{weddingData.groom}</div>
                            <div className={styles.and}>&</div>
                            <div className={styles.bride_name}>{weddingData.bride}</div>
                        </div>
                        <div className={styles.best_regards} data-aos="fade-up" data-aos-delay="400">
                            Trân trọng kính mời
                        </div>
                        <div className={styles.text} data-aos="fade-up" data-aos-delay="500">
                            Đến dự buổi tiệc chung vui cùng gia đình chúng tôi
                        </div>

                        <div className={styles.flex_image} data-aos="fade-up" data-aos-delay="600">
                            <div className={styles.image_1}>
                                <img src={images.flexImage1.url} alt="Flex image 1" />
                            </div>
                            <div className={styles.image_2}>
                                <img src={images.flexImage2.url} alt="Flex image 2" />
                            </div>
                            <div className={styles.image_3}>
                                <img src={images.flexImage3.url} alt="Flex image 3" />
                            </div>
                        </div>

                        <div className={styles.specifically} data-aos="fade-up" data-aos-delay="700">
                            <div className={styles.time_specifically}>
                                <span className={styles.time}>
                                    Thời Gian: {formatTimeToHourMinute(weddingData.weddingTime)}
                                </span>
                                <span className={styles.day_specifically}>{weddingData.weddingDayOfWeek}</span>
                            </div>
                            <div className={styles.date_specifically}>
                                {formatDateToDDMMYYYY(weddingData.weddingDate)}
                            </div>
                            <div className={styles.dateLunar_specifically}>(Tức ngày {weddingData.lunar_day})</div>
                            <div className={styles.calendar}>
                                <img
                                    src={images.mainImage.url}
                                    alt="Calendar Background"
                                    className={styles.calendarBackground}
                                />
                                <div className={styles.calendarHeader}>
                                    Tháng {weddingDate.getMonth() + 1}, {weddingDate.getFullYear()}
                                </div>
                                <div className={styles.calendarGrid}>
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                        <div key={day} className={styles.calendarDayHeader}>
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className={styles.calendarEmpty}></div>
                                    ))}
                                    {daysInMonthArray.map((day) => (
                                        <div
                                            key={day}
                                            className={`${styles.calendarDay} ${
                                                day === weddingDate.getDate() ? styles.selectedDay : ''
                                            }`}
                                        >
                                            {day}
                                            {day === weddingDate.getDate() && (
                                                <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.locations} data-aos="fade-up" data-aos-delay="800">
                            <div
                                className={styles.organization_location_groom}
                                data-aos="fade-right"
                                data-aos-delay="200"
                            >
                                <div className={styles.text_organization__location}>
                                    <h4>Địa điểm tổ chức nhà trai </h4>
                                    <span>{weddingData.groomAddress || 'Địa điểm nhà trai chưa cập nhật'}</span>
                                </div>
                                <div className={styles.map_organization__location}>
                                    {weddingData.groomMapUrl ? (
                                        <iframe
                                            src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                            width="300"
                                            height="200"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    ) : (
                                        <p>Lỗi tải bản đồ nhà trai. Vui lòng kiểm tra tọa độ.</p>
                                    )}
                                </div>
                            </div>

                            <div
                                className={styles.organization_location_bride}
                                data-aos="fade-left"
                                data-aos-delay="300"
                            >
                                <div className={styles.map_organization__location}>
                                    {weddingData.brideMapUrl ? (
                                        <iframe
                                            src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                            width="300"
                                            height="200"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    ) : (
                                        <p>Lỗi tải bản đồ nhà gái. Vui lòng kiểm tra tọa độ.</p>
                                    )}
                                </div>
                                <div className={styles.text_organization__location}>
                                    <h4>Địa điểm tổ chức nhà gái </h4>
                                    <span>{weddingData.brideAddress || 'Địa điểm nhà gái chưa cập nhật'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.album_story} data-aos="fade-up" data-aos-delay="900">
                            <h3 data-aos="zoom-in" data-aos-delay="200">
                                Album ảnh
                            </h3>
                            <div className={styles.wrapper_album}>
                                <div data-aos="fade-left" data-aos-delay="300">
                                    <img src={images.galleryImage1.url} alt="Wedding moment 1" />
                                </div>
                                <div data-aos="fade-right" data-aos-delay="400">
                                    <img src={images.galleryImage2.url} alt="Wedding moment 2" />
                                </div>
                                <div data-aos="fade-right" data-aos-delay="500">
                                    <img src={images.galleryImage3.url} alt="Wedding moment 3" />
                                </div>
                                <div data-aos="fade-left" data-aos-delay="600">
                                    <img src={images.galleryImage4.url} alt="Wedding moment 4" />
                                </div>
                                <div data-aos="fade-up" data-aos-delay="700">
                                    <img src={images.galleryImage5.url} alt="Wedding moment 5" />
                                </div>
                                <div data-aos="fade-up" data-aos-delay="700">
                                    <img src={images.galleryImage6.url} alt="Wedding moment 6" />
                                </div>
                            </div>
                        </div>

                        {userId && <InvitionsQR userId={userId} />}
                    </div>

                    <div className={styles.footer_thanks}>
                        <div className={styles.image_footer} data-aos="fade-up" data-aos-delay="300">
                            <img src={images.footerImage.url} alt="Footer image" />
                            <div className={styles.content}>
                                <span data-aos="fade-left" data-aos-delay="600">
                                    Rất hân hạnh được đón tiếp
                                </span>
                                <h3 data-aos="fade-right" data-aos-delay="700">
                                    Thanks You
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Template3InviteeName;
