'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faTimes, faCirclePlay, faCirclePause } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../4.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Suspense } from 'react';
import { useApi } from 'app/lib/apiContext/apiContext';
import InvitionsQR from 'app/QR_received/invitionsQR/invitionsQR';
import IntroInvitation from 'app/template/introInvition/introInvition';

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

const getMapEmbedUrlFromCoords = (coords: string): string => {
    if (!coords) return '';

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

    return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15`;
};

function Template4InviteeName() {
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [isExpanded, setIsExpanded] = useState(false); // Thêm state cho hiệu ứng mở rộng
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({
        mainImage: { url: '/images/m4/1.jpg', position: 'main' },
        groomImage: { url: '/images/m4/3.jpg', position: 'groom' },
        brideImage: { url: '/images/m4/4.jpg', position: 'bride' },
        collageImage1: { url: '/images/m4/1.jpg', position: 'collage1' },
        collageImage2: { url: '/images/m4/2.jpg', position: 'collage2' },
        collageImage3: { url: '/images/m4/3.jpg', position: 'collage3' },
        collageImage4: { url: '/images/m4/4.jpg', position: 'collage4' },
        collageImage5: { url: '/images/m4/5.jpg', position: 'collage5' },
        footerImage1: { url: '/images/m4/1.jpg', position: 'footer1' },
        footerImage2: { url: '/images/m4/2.jpg', position: 'footer2' },
    });
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

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
                    bride: weddingData?.bride || '',
                    groom: weddingData?.groom || '',
                    weddingDate: weddingData?.weddingDate || '23/12/2025',
                    weddingTime: weddingData?.weddingTime || '11:00 AM',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'TUESDAY',
                    lunar_day: card.invitations[0]?.lunar_day || '17 Tháng 11, Năm Ất Tỵ',
                    familyGroom: weddingData?.familyGroom || { father: 'Huỳnh Văn A', mother: 'Trần Thị B' },
                    familyBride: weddingData?.familyBride || { father: 'Lê Văn C', mother: 'Trần Thị D' },
                    brideStory:
                        weddingData?.brideStory ||
                        'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
                    groomStory:
                        weddingData?.groomStory ||
                        'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
                    groomAddress: weddingData?.groomAddress || 'Ấp Mỹ Thạnh B, xã Long Tiên, Cai Lậy, Tiền Giang',
                    brideAddress: weddingData?.brideAddress || 'Ấp Mỹ Thạnh B, xã Long Tiên, Cai Lậy, Tiền Giang',
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
                    groomImage: { url: '', position: 'groom' },
                    brideImage: { url: '', position: 'bride' },
                    collageImage1: { url: '', position: 'collage1' },
                    collageImage2: { url: '', position: 'collage2' },
                    collageImage3: { url: '', position: 'collage3' },
                    collageImage4: { url: '', position: 'collage4' },
                    collageImage5: { url: '', position: 'collage5' },
                    footerImage1: { url: '', position: 'footer1' },
                    footerImage2: { url: '', position: 'footer2' },
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
                                case 'groom':
                                    key = 'groomImage';
                                    break;
                                case 'bride':
                                    key = 'brideImage';
                                    break;
                                case 'collage1':
                                    key = 'collageImage1';
                                    break;
                                case 'collage2':
                                    key = 'collageImage2';
                                    break;
                                case 'collage3':
                                    key = 'collageImage3';
                                    break;
                                case 'collage4':
                                    key = 'collageImage4';
                                    break;
                                case 'collage5':
                                    key = 'collageImage5';
                                    break;
                                case 'footer1':
                                    key = 'footerImage1';
                                    break;
                                case 'footer2':
                                    key = 'footerImage2';
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

    useEffect(() => {
        const updateCountdown = () => {
            if (!weddingData) return;
            const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 11, 23);
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

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 100 });
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

    const handleIntroClose = () => {
        setIsIntroOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleExpand = () => setIsExpanded(!isExpanded); // Hàm để mở/rút gọn audio control

    useEffect(() => {
        const handleScroll = () => {
            if (isExpanded) {
                setIsExpanded(false); // Rút gọn khi scroll
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

    const parseWeddingDate = (dateStr: string): Date | null => {
        if (!dateStr || !dateStr.includes('/')) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
    };

    const formatTimeToHourMinute = (time: string) => {
        if (!time || !time.includes(':')) return time;
        const [hours, minutes] = time.split(':');
        return `${hours}h${minutes}`;
    };

    if (error) {
        return <div className={styles.error}>Lỗi: {error}</div>;
    }

    if (!weddingData) {
        return <div></div>;
    }

    const weddingDateObj = parseWeddingDate(weddingData.weddingDate) || new Date(2025, 11, 23);
    const daysInMonth = new Date(weddingDateObj.getFullYear(), weddingDateObj.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(weddingDateObj.getFullYear(), weddingDateObj.getMonth(), 1).getDay();
    const daysInMonthArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array(firstDayOfMonth).fill(null);

    return (
        <Suspense fallback={<div></div>}>
            <div className={styles.template4}>
                <IntroInvitation
                    isIntroOpen={isIntroOpen}
                    onClose={handleIntroClose}
                    groomName={weddingData.groom}
                    brideName={weddingData.bride}
                    weddingDate={weddingData.weddingDate}
                    guestName={guestName}
                />

                <div
                    className={`${styles.template4_content} ${
                        isIntroOpen ? styles.content_hidden : styles.content_visible
                    }`}
                    style={{ pointerEvents: isIntroOpen ? 'none' : 'auto' }}
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
                            <h3>{isPlaying ? 'Đang Phát: Xứng đôi cưới thôi' : 'Xứng đôi cưới thôi'}</h3>
                        </div>
                        {isExpanded && (
                            <div className={styles.expanded_content}>
                                <div className={styles.song_info}>
                                    <h4>Xứng đối cưới thôi</h4>
                                    <p>Ca sĩ: Lê Thiện Hiếu</p>
                                </div>
                                <div className={styles.progress_bar}>
                                    <div className={styles.progress}></div>
                                </div>
                            </div>
                        )}
                        <audio ref={audioRef} src="/audio/xungdoicuoithoi.mp3" />
                    </div>

                    <div className={styles.mainImage} data-aos="fade-down">
                        <img src={images.mainImage.url} alt="Main couple" />
                        <div className={styles.torn_paper__header}>
                            <img src="/images/m4/1.1.png" alt="Torn paper decoration" />
                        </div>
                    </div>
                    <div className={styles.saveTheDate}>
                        <div className={styles.saveTheDate_wrapper}>
                            <div className={styles.img_std}>
                                <img src="/images/std/img_std.png" alt="Save the Date" />
                            </div>
                            <div className={styles.groom_bride__name}>
                                <h3 className={styles.groom_names} data-aos="fade-right" data-aos-delay="400">
                                    {weddingData.groom}
                                </h3>
                                <h3 className={styles.bride_names} data-aos="fade-left" data-aos-delay="400">
                                    {weddingData.bride}
                                </h3>
                            </div>
                            <p className={styles.text} data-aos="fade-up" data-aos-delay="700">
                                Thân mời Quý khách tới tham dự
                                <br />
                                Lễ Thành Hôn của hai chúng tôi
                            </p>
                            <p className={styles.at}>Vào lúc {formatTimeToHourMinute(weddingData.weddingTime)}</p>
                            <div className={styles.dateBox}>
                                <div>
                                    THỨ
                                    <br />
                                    {weddingData.weddingDayOfWeek}
                                </div>
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
                            <p className={styles.year}>{weddingDateObj.getFullYear()}</p>
                            <p className={styles.lunarDay}>(Tức {weddingData.lunar_day})</p>
                            <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                        </div>
                    </div>
                    <div className={styles.groom}>
                        <div className={styles.wrapper_groom}>
                            <div className={styles.image_groom} data-aos="fade-right" data-aos-delay="400">
                                <img src={images.groomImage.url} alt="Groom" />
                            </div>
                            <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="800">
                                <p>Chú Rể</p>
                                <h3>{weddingData.groom}</h3>
                            </div>
                        </div>
                        <div className={styles.groom_str} data-aos="fade-up" data-aos-delay="1200">
                            <p>{weddingData.groomStory}</p>
                        </div>
                    </div>
                    <div className={styles.bride}>
                        <div className={styles.wrapper_bride}>
                            <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="800">
                                <p>Cô dâu</p>
                                <h3>{weddingData.bride}</h3>
                            </div>
                            <div className={styles.image_bride} data-aos="fade-left" data-aos-delay="400">
                                <img src={images.brideImage.url} alt="Bride" />
                            </div>
                        </div>
                        <div className={styles.bride_str} data-aos="fade-up" data-aos-delay="1200">
                            <p>{weddingData.brideStory}</p>
                        </div>
                    </div>
                    <div className={styles.calendar} data-aos="fade-up" data-aos-delay="800">
                        <div className={styles.calendar_wrapper}>
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
                            <h3 className={styles.calendar_title}>
                                Tháng {weddingDateObj.getMonth() + 1}, {weddingDateObj.getFullYear()}
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
                                        className={`${styles.calendar_day} ${
                                            day === weddingDateObj.getDate() ? styles.wedding_day : ''
                                        }`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.countdown} data-aos="zoom-in" data-aos-delay="1000">
                            <div className={styles.countdown_wrapper}>
                                <h4 className={styles.countdown_title}>
                                    Đếm ngược thời gian tới ngày cưới của chúng mình
                                </h4>
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
                                <div className={styles.btn_show_the_way} onClick={() => setShowModal(true)}>
                                    Chỉ đường
                                    <FontAwesomeIcon icon={faLocationDot} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.collage}>
                        <div className={styles.collage_left}>
                            <div className={styles.img1} data-aos="fade-down" data-aos-delay="400">
                                <img src={images.collageImage1.url} alt="Collage 1" />
                            </div>
                            <div className={styles.img2} data-aos="fade-right" data-aos-delay="600">
                                <img src={images.collageImage2.url} alt="Collage 2" />
                            </div>
                            <div className={styles.img3} data-aos="fade-up" data-aos-delay="800">
                                <img src={images.collageImage3.url} alt="Collage 3" />
                            </div>
                        </div>
                        <div className={styles.collage_right}>
                            <div className={styles.img4} data-aos="fade-left" data-aos-delay="800">
                                <img src={images.collageImage4.url} alt="Collage 4" />
                            </div>
                            <div className={styles.img5} data-aos="fade-left" data-aos-delay="900">
                                <img src={images.collageImage5.url} alt="Collage 5" />
                            </div>
                        </div>
                    </div>
                    <div className={styles.footer} data-aos="fade-up" data-aos-delay="1400">
                        <h3>Cảm ơn quý khách vì đã trở thành một phần quan trọng trong ngày đặc biệt của chúng tôi.</h3>
                        {userId && <InvitionsQR userId={userId} />}
                    </div>
                    <div className={styles.footer_image}>
                        <div className={styles.image_f1}>
                            <img src={images.footerImage1.url} alt="Footer 1" />
                        </div>
                        <div className={styles.image_f2}>
                            <img src={images.footerImage2.url} alt="Footer 2" />
                        </div>
                    </div>

                    <div className={`${styles.model_showTheway} ${showModal ? styles.show : ''}`}>
                        <div className={`${styles.popup_showTheway__wrapper} ${showModal ? styles.show : ''}`}>
                            <button className={styles.close_button} onClick={() => setShowModal(false)}>
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
                                            <img src={images.groomImage.url} alt="Groom" />
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
                                            <img src={images.brideImage.url} alt="Bride" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Template4InviteeName;
