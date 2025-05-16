'use client';
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './mau_1.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCirclePlay, faCirclePause } from '@fortawesome/free-solid-svg-icons';
import { Suspense } from 'react';
import { useApi } from 'app/lib/apiContext/apiContext';

export const dynamic = 'force-dynamic';

interface Images {
    [key: string]: { url: string; position?: string };
    banner: { url: string; position?: string };
    groom: { url: string; position?: string };
    bride: { url: string; position?: string };
    couple_0: { url: string; position?: string };
    couple_1: { url: string; position?: string };
    couple_2: { url: string; position?: string };
    thumnail_0: { url: string; position?: string };
    thumnail_1: { url: string; position?: string };
    thumnail_2: { url: string; position?: string };
    thumnail_3: { url: string; position?: string };
}

interface WeddingData {
    bride: string;
    groom: string;
    weddingDate: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    lunarDay: string;
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
    return <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{fullName || 'bạn'}</span>;
}

function Template1Invitee() {
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const coupleImagesRef = useRef<HTMLDivElement>(null);
    const thumnailImagesRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({} as Images);
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL || 'http://localhost:10000';
    const apiUrl = 'http://localhost:10000';

    useEffect(() => {
        const fetchGuestAndCard = async () => {
            try {
                const parts = pathname.split('/').filter(Boolean);
                const template_id = parts[1];
                const guest_id = parts[2];
                const invitation_id = parts[3];

                if (!template_id || !guest_id || !invitation_id) {
                    throw new Error('Thiếu tham số trong URL');
                }

                const { guest, card } = await getGuestAndCard(template_id, guest_id, invitation_id);

                const weddingData = card.custom_data.weddingData as Partial<WeddingData> | undefined;
                const updatedWeddingData: WeddingData = {
                    bride: weddingData?.bride || 'Chưa xác định',
                    groom: weddingData?.groom || 'Chưa xác định',
                    weddingDate: weddingData?.weddingDate || 'Chưa xác định',
                    weddingTime: weddingData?.weddingTime || 'Chưa xác định',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'Chưa xác định',
                    lunarDay: card.invitations[0]?.lunar_day || 'Chưa xác định',
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
                setWeddingData(updatedWeddingData);
                setGuestName(guest.full_name);

                const newImages: Images = {} as Images;
                card.custom_data.weddingImages.forEach((img: { url: string; position: string }) => {
                    let key: keyof Images;
                    switch (img.position) {
                        case 'banner':
                            key = 'banner';
                            break;
                        case 'groom':
                            key = 'groom';
                            break;
                        case 'bride':
                            key = 'bride';
                            break;
                        case 'couple_0':
                            key = 'couple_0';
                            break;
                        case 'couple_1':
                            key = 'couple_1';
                            break;
                        case 'couple_2':
                            key = 'couple_2';
                            break;
                        case 'thumnail_0':
                            key = 'thumnail_0';
                            break;
                        case 'thumnail_1':
                            key = 'thumnail_1';
                            break;
                        case 'thumnail_2':
                            key = 'thumnail_2';
                            break;
                        case 'thumnail_3':
                            key = 'thumnail_3';
                            break;
                        default:
                            key = 'banner';
                    }
                    newImages[key] = {
                        url: img.url.startsWith('http') ? img.url : `${apiUrl}${img.url}`,
                        position: img.position,
                    };
                });
                setImages(newImages);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu thiệp cưới';
                setError(errorMessage);
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
        AOS.refresh();

        const addClickListener = (elements: NodeListOf<Element> | undefined, isCouple: boolean) => {
            elements?.forEach((img) => {
                const element = img as HTMLElement;
                element.addEventListener('click', () => {
                    elements.forEach((otherImg) => {
                        const otherElement = otherImg as HTMLElement;
                        otherElement.classList.remove(styles.centerImg);
                        if (isCouple) otherElement.setAttribute('style', '');
                    });
                    element.classList.add(styles.centerImg);
                    if (isCouple) {
                        element.style.order = '0';
                        let order = -1;
                        elements.forEach((otherImg) => {
                            if (otherImg !== img) {
                                (otherImg as HTMLElement).style.order = (order += 2).toString();
                            }
                        });
                    }
                });
            });
        };

        addClickListener(coupleImagesRef.current?.querySelectorAll(`.${styles.coupleImg}`), true);
        addClickListener(thumnailImagesRef.current?.querySelectorAll(`.${styles.thumnailImg}`), false);

        return () => {
            coupleImagesRef.current
                ?.querySelectorAll(`.${styles.coupleImg}`)
                .forEach((img) => img.removeEventListener('click', () => {}));
            thumnailImagesRef.current
                ?.querySelectorAll(`.${styles.thumnailImg}`)
                .forEach((img) => img.removeEventListener('click', () => {}));
        };
    }, []);

    if (error) {
        return <div className={styles.error}>Lỗi: {error}</div>;
    }

    if (!weddingData || Object.keys(images).length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.bg}>
                <div
                    className={`${styles.intro} ${isIntroOpen ? styles.visible : styles.hidden}`}
                    onClick={handleIntroClick}
                >
                    <div className={styles.card_cover}>
                        <img src="/images/m2/intro.png" alt="Card Cover" />
                        <div className={styles.intro_content}>
                            <h1 className={styles.groom_names}>{weddingData.groom}</h1>
                            <h1 className={styles.bride_names}>{weddingData.bride}</h1>
                            <h2 className={styles.invite_message}>
                                Kính mời: <InviteeNameContent fullName={guestName} />
                            </h2>
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
                        <h3>{isPlaying ? 'Đang Phát: Tỏ Tình' : 'Tỏ Tình'}</h3>
                    </div>
                    {isExpanded && (
                        <div className={styles.expanded_content}>
                            <div className={styles.album_art}>
                                {images.banner && <img src={images.banner.url} alt="Album Art" />}
                            </div>
                            <div className={styles.song_info}>
                                <h4>Tỏ Tình</h4>
                                <p>
                                    {weddingData.groom} x {weddingData.bride} Wedding
                                </p>
                            </div>
                            <div className={styles.progress_bar}>
                                <div className={styles.progress}></div>
                            </div>
                        </div>
                    )}
                    <audio ref={audioRef} src="/audio/totinh.mp3" />
                </div>
                <div className={`${styles.mau_1} ${isIntroOpen ? styles.content_hidden : styles.content_visible}`}>
                    <div className={styles.bannerImageHeader} data-aos="fade-up" data-aos-duration="1000">
                        {images.banner && <img src={images.banner.url} alt="Wedding Banner" />}
                        <div className={styles.contentHeader}>
                            <h3>
                                {weddingData.groom} & {weddingData.bride}
                            </h3>
                        </div>
                        <div className={styles.infomation}>
                            <h2>Thư Mời Tiệc Cưới</h2>
                            <div className={styles.dateTime}>
                                <span>{`${weddingData.weddingDayOfWeek} - ${weddingData.weddingTime}`}</span>
                                <div className={styles.day}>
                                    {`${weddingData.weddingDate.split('/')[0]}.${weddingData.weddingDate.split('/')[1]}.${weddingData.weddingDate.split('/')[2]}`}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.wrapper}>
                        <div className={styles.wrapperBanner}>
                            <div className={styles.banner2} data-aos="fade-up" data-aos-duration="1200">
                                <div className={styles.loveQuote}>
                                    <h2>Hôn nhân là chuyện cả đời,</h2>
                                    <h2>Yêu người vừa ý, cưới người mình thương, ...</h2>
                                </div>
                                <div className={styles.familyInfo}>
                                    <div className={styles.groomFamily} data-aos="fade-right" data-aos-delay="200">
                                        <h3>Nhà Trai</h3>
                                        <p>Ông: {weddingData.familyGroom.father}</p>
                                        <p>Bà: {weddingData.familyGroom.mother}</p>
                                    </div>
                                    <div className={styles.brideFamily} data-aos="fade-left" data-aos-delay="200">
                                        <h3>Nhà Gái</h3>
                                        <p>Ông: {weddingData.familyBride.father}</p>
                                        <p>Bà: {weddingData.familyBride.mother}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.banner3} data-aos="zoom-in" data-aos-duration="1000">
                                <div className={styles.coupleInfo}>
                                    <div className={styles.groom} data-aos="fade-right" data-aos-delay="300">
                                        {images.groom && <img src={images.groom.url} alt="Groom" />}
                                        <h3>{weddingData.groom}</h3>
                                    </div>
                                    <div className={styles.bride} data-aos="fade-left" data-aos-delay="300">
                                        {images.bride && <img src={images.bride.url} alt="Bride" />}
                                        <h3>{weddingData.bride}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.banner4} data-aos="fade-up" data-aos-duration="1000">
                            <div className={styles.contentHeader}>
                                <h2 className={styles.invitationTitle}>Thư Mời</h2>
                            </div>
                            <div className={styles.coupleImages} ref={coupleImagesRef}>
                                {images.couple_0 && (
                                    <img
                                        src={images.couple_0.url}
                                        alt="Ảnh Couple 1"
                                        className={styles.coupleImg}
                                        data-aos="fade-up"
                                        data-aos-delay="100"
                                    />
                                )}
                                {images.couple_1 && (
                                    <img
                                        src={images.couple_1.url}
                                        alt="Ảnh Couple 2"
                                        className={`${styles.coupleImg} ${styles.centerImg}`}
                                        data-aos="fade-up"
                                        data-aos-delay="200"
                                    />
                                )}
                                {images.couple_2 && (
                                    <img
                                        src={images.couple_2.url}
                                        alt="Ảnh Couple 3"
                                        className={styles.coupleImg}
                                        data-aos="fade-up"
                                        data-aos-delay="300"
                                    />
                                )}
                            </div>
                            <div className={styles.infomation} data-aos="fade-up" data-aos-duration="1200">
                                <p className={styles.eventDetails}>
                                    {weddingData.groomStory || weddingData.brideStory || ''}
                                </p>
                                <p className={styles.eventTime}>Vào Lúc</p>
                                <div className={styles.dateContainer}>
                                    <span className={styles.time}>{weddingData.weddingTime}</span>
                                    <div className={styles.column}>
                                        <span className={styles.dayOfWeek}>{weddingData.weddingDayOfWeek}</span>
                                        <span className={styles.day}>{weddingData.weddingDate.split('/')[0]}</span>
                                        <span className={styles.month}>
                                            Tháng {weddingData.weddingDate.split('/')[1]}
                                        </span>
                                    </div>
                                    <span className={styles.year}>{weddingData.weddingDate.split('/')[2]}</span>
                                </div>
                                <p className={styles.lunarDate}>(Tức Ngày {weddingData.lunarDay})</p>
                                <h2 className={styles.monthYear}>
                                    Tháng {weddingData.weddingDate.split('/')[1]}{' '}
                                    {weddingData.weddingDate.split('/')[2]}
                                </h2>
                            </div>
                            <div className={styles.calendar} data-aos="zoom-in" data-aos-duration="1000">
                                <h3>
                                    Tháng {weddingData.weddingDate.split('/')[1]}{' '}
                                    {weddingData.weddingDate.split('/')[2]}
                                </h3>
                                <div className={styles.calendarHeader}>
                                    <span>CN</span>
                                    <span>T2</span>
                                    <span>T3</span>
                                    <span>T4</span>
                                    <span>T5</span>
                                    <span>T6</span>
                                    <span>T7</span>
                                </div>
                                <div className={styles.calendarBody}>
                                    {Array(42)
                                        .fill('')
                                        .map((_, index) => {
                                            const day = index < 6 ? '' : (index - 5).toString();
                                            return (
                                                <span
                                                    key={index}
                                                    className={
                                                        parseInt(day) ===
                                                        parseInt(weddingData.weddingDate.split('/')[0])
                                                            ? styles.highlight
                                                            : ''
                                                    }
                                                >
                                                    {parseInt(day) ===
                                                    parseInt(weddingData.weddingDate.split('/')[0]) ? (
                                                        <span className={styles.highlightContent}>
                                                            <FontAwesomeIcon
                                                                icon={faHeart}
                                                                className={styles.heartIcon}
                                                            />
                                                            <span>{day}</span>
                                                        </span>
                                                    ) : (
                                                        day
                                                    )}
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                            <div className={styles.location} data-aos="fade-up" data-aos-duration="1000">
                                <div className={styles.dotLeft}></div>
                                <div className={styles.dotRight}></div>
                                <h4>Địa điểm tổ chức</h4>
                                <div className={styles.locationContent}>
                                    <h5>Nhà Trai -{weddingData.venue_groom}</h5>
                                    {weddingData.venue_groom && weddingData.groomMapUrl ? (
                                        <div className={styles.venueDetails}>
                                            <iframe
                                                src={weddingData.groomMapUrl}
                                                width="600"
                                                height="450"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    ) : (
                                        <p>Địa điểm của chú rể chưa cập nhật</p>
                                    )}
                                </div>
                                <div className={styles.locationContent}>
                                    <h5>Nhà Gái - {weddingData.venue_bride}</h5>
                                    {weddingData.venue_bride && weddingData.brideMapUrl ? (
                                        <div className={styles.venueDetails}>
                                            <iframe
                                                src={weddingData.brideMapUrl}
                                                width="600"
                                                height="450"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    ) : (
                                        <p>Địa điểm của cô dâu chưa cập nhật</p>
                                    )}
                                </div>
                            </div>
                            <div className={styles.thumnail} data-aos="fade-up" data-aos-duration="1000">
                                <div className={styles.dotLeft}></div>
                                <div className={styles.dotRight}></div>
                                <h4>Khoảnh khắc đáng nhớ</h4>
                                <div className={styles.thumnailImages} ref={thumnailImagesRef}>
                                    {images.thumnail_0 && (
                                        <img
                                            src={images.thumnail_0.url}
                                            alt="Ảnh Thumbnail 1"
                                            className={`${styles.thumnailImg} ${styles.centerImg}`}
                                            data-aos="fade-up"
                                            data-aos-delay="100"
                                        />
                                    )}
                                    {images.thumnail_1 && (
                                        <img
                                            src={images.thumnail_1.url}
                                            alt="Ảnh Thumbnail 2"
                                            className={styles.thumnailImg}
                                            data-aos="fade-up"
                                            data-aos-delay="200"
                                        />
                                    )}
                                    {images.thumnail_2 && (
                                        <img
                                            src={images.thumnail_2.url}
                                            alt="Ảnh Thumbnail 3"
                                            className={styles.thumnailImg}
                                            data-aos="fade-up"
                                            data-aos-delay="300"
                                        />
                                    )}
                                    {images.thumnail_3 && (
                                        <img
                                            src={images.thumnail_3.url}
                                            alt="Ảnh Thumbnail 4"
                                            className={styles.thumnailImg}
                                            data-aos="fade-up"
                                            data-aos-delay="400"
                                        />
                                    )}
                                </div>
                            </div>
                            <footer className={styles.bestRegards}>
                                <div className={styles.dotLeft}></div>
                                <div className={styles.dotRight}></div>
                                <h1>Thanks You</h1>
                                <span>
                                    Chúng tôi háo hức mong chờ <InviteeNameContent fullName={guestName} /> đến chung vui
                                    trong ngày trọng đại của đời mình – một dấu mốc thiêng liêng và đáng nhớ. Sẽ thật
                                    trọn vẹn và ý nghĩa biết bao nếu có sự hiện diện cùng lời chúc phúc chân thành từ
                                    bạn trong khoảnh khắc đặc biệt ấy.
                                </span>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Template1Invitee;
