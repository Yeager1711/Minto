'use client';
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './mau_2.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCirclePlay, faCirclePause } from '@fortawesome/free-solid-svg-icons';
import { formatTime } from 'app/Ultils/formatTime';
import { Suspense } from 'react';
import axios from 'axios';

export const dynamic = 'force-dynamic';

interface Images {
    [key: string]: { url: string; position?: string };
    mainImage: { url: string; position?: string };
    thumbnail1: { url: string; position?: string };
    thumbnail2: { url: string; position?: string };
    thumbnail3: { url: string; position?: string };
    thumbnail4: { url: string; position?: string };
    storyImage1: { url: string; position?: string };
    storyImage2: { url: string; position?: string };
    brideImage: { url: string; position?: string };
    groomImage: { url: string; position?: string };
    galleryImage1: { url: string; position?: string };
    galleryImage2: { url: string; position?: string };
    galleryImage3: { url: string; position?: string };
    galleryImage4: { url: string; position?: string };
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

interface Guest {
    guest_id: number;
    invitation_id: number;
    full_name: string;
    sharedLinks: {
        link_id: number;
        guest_id: number;
        share_url: string;
        created_at: string;
        expires_at: string;
    }[];
}

interface Card {
    card_id: number;
    created_at: string;
    status: string;
    custom_data: {
        weddingData: WeddingData;
        weddingImages: { url: string; position: string }[];
    };
    template: {
        template_id: number;
        name: string;
        description: string;
        image_url: string;
        price: string;
        status: string;
    };
    thumbnails: { thumbnail_id: number; image_url: string; position: string; description: string }[];
    invitations: {
        invitation_id: number;
        groom_name: string;
        bride_name: string;
        wedding_date: string;
        venue_groom: string;
        venue_bride: string;
        lunar_day: string;
        story_groom: string;
        story_bride: string;
        custom_image: string;
    }[];
}

interface ApiResponse {
    guest: Guest;
    card: Card;
}

function InviteeNameContent({ fullName }: { fullName: string }) {
    return <span>{fullName || 'bạn'}</span>;
}

function Mau2InviteeName() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isIntroOpen, setIsIntroOpen] = useState(true);
    const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
    const [images, setImages] = useState<Images>({} as Images);
    const [guestName, setGuestName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchGuestAndCard = async () => {
            try {
                if (!apiUrl) {
                    throw new Error('API base URL is not defined in environment variables');
                }

                const parts = pathname.split('/').filter(Boolean);
                const template_id = parts[1];
                const guest_id = parts[2];
                const invitation_id = parts[3];

                if (!template_id || !guest_id || !invitation_id) {
                    throw new Error(
                        `Thiếu tham số: template_id=${template_id}, guest_id=${guest_id}, invitation_id=${invitation_id}`
                    );
                }

                const response = await axios.get<ApiResponse>(
                    `${apiUrl}/cards/guest/${template_id}/${guest_id}/${invitation_id}`,
                    {
                        headers: {
                            'ngrok-skip-browser-warning': 'true',
                        },
                    }
                );

                const { guest, card } = response.data;
                const updatedWeddingData = {
                    ...card.custom_data.weddingData,
                    lunar_day: card.invitations[0]?.lunar_day || 'Chưa xác định',
                    venue_groom: card.invitations[0]?.venue_groom || 'Chưa xác định',
                    venue_bride: card.invitations[0]?.venue_bride || 'Chưa xác định',
                };
                setWeddingData(updatedWeddingData);
                setGuestName(guest.full_name);

                const newImages: Images = {} as Images;
                card.custom_data.weddingImages.forEach((img: { url: string; position: string }) => {
                    let key: keyof Images;
                    switch (img.position) {
                        case 'main':
                            key = 'mainImage';
                            break;
                        case 'thumbnail1':
                            key = 'thumbnail1';
                            break;
                        case 'thumbnail2':
                            key = 'thumbnail2';
                            break;
                        case 'thumbnail3':
                            key = 'thumbnail3';
                            break;
                        case 'thumbnail4':
                            key = 'thumbnail4';
                            break;
                        case 'story1':
                            key = 'storyImage1';
                            break;
                        case 'story2':
                            key = 'storyImage2';
                            break;
                        case 'bride':
                            key = 'brideImage';
                            break;
                        case 'groom':
                            key = 'groomImage';
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
                        default:
                            key = 'mainImage';
                    }
                    newImages[key] = { url: `${apiUrl}${img.url}`, position: img.position };
                });
                setImages(newImages);
                console.log('Images after setting:', newImages);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu thiệp cưới';
                setError(errorMessage);
                console.error('Error fetching data:', err);
            }
        };

        fetchGuestAndCard();
    }, [pathname]);

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

    if (error) {
        return <div className={styles.error}>Lỗi: {error}</div>;
    }

    if (!weddingData || Object.keys(images).length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.mau_2_container}>
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
                        <h3>{isPlaying ? 'Đang Phát: Bài này không để đi diễn' : 'Bài này không để đi diễn'}</h3>
                    </div>
                    {isExpanded && (
                        <div className={styles.expanded_content}>
                            <div className={styles.album_art}>
                                {images.mainImage && (
                                    <img
                                        src={images.mainImage.url}
                                        alt="Album Art"
                                        onError={(e) => console.log('Error loading mainImage:', e.currentTarget.src)}
                                    />
                                )}
                            </div>
                            <div className={styles.song_info}>
                                <h4>Bài này không để đi diễn</h4>
                                <p>Anh Tu Atus x DieuNhiOfficial Wedding</p>
                            </div>
                            <div className={styles.progress_bar}>
                                <div className={styles.progress}></div>
                            </div>
                        </div>
                    )}
                    <audio ref={audioRef} src="/audio/song.mp3" />
                </div>
                <div className={`${styles.mau_2} ${isIntroOpen ? styles.content_hidden : styles.content_visible}`}>
                    <div className={styles.mau_2__wrapper}>
                        <div className={styles.page_2}>
                            <img src="/images/m2/page2.png" alt="" />
                        </div>
                        <div className={styles.image_mau2}>
                            {images.mainImage && (
                                <img
                                    src={images.mainImage.url}
                                    alt=""
                                    onError={(e) => console.log('Error loading mainImage:', e.currentTarget.src)}
                                />
                            )}
                            <div className={styles.Save_the_date} data-aos="fade-right" data-aos-delay="400">
                                <span className={styles.save}>Save</span>
                                <span className={styles.the}>The</span>
                                <span className={styles.date}>Date</span>
                                <span className={styles.time}>{weddingData.weddingDate}</span>
                            </div>
                            <div className={styles.bride_groom} data-aos="fade-up" data-aos-delay="600">
                                <h3>{weddingData.groom}</h3>
                                <span>&</span>
                                <h3>{weddingData.bride}</h3>
                            </div>
                            <div className={styles.thumnails}>
                                {images.thumbnail1 && (
                                    <img
                                        src={images.thumbnail1.url}
                                        alt="Thumbnail 1"
                                        className={styles.thumnailImages_1}
                                        data-aos="fade-up"
                                        data-aos-delay="200"
                                        onError={(e) => console.log('Error loading thumbnail1:', e.currentTarget.src)}
                                    />
                                )}
                                {images.thumbnail2 && (
                                    <img
                                        src={images.thumbnail2.url}
                                        alt="Thumbnail 2"
                                        className={styles.thumnailImages_2}
                                        data-aos="fade-right"
                                        data-aos-delay="600"
                                        onError={(e) => console.log('Error loading thumbnail2:', e.currentTarget.src)}
                                    />
                                )}
                                {images.thumbnail3 && (
                                    <img
                                        src={images.thumbnail3.url}
                                        alt="Thumbnail 3"
                                        className={styles.thumnailImages_3}
                                        data-aos="fade-left"
                                        data-aos-delay="600"
                                        onError={(e) => console.log('Error loading thumbnail3:', e.currentTarget.src)}
                                    />
                                )}
                                {images.thumbnail4 && (
                                    <img
                                        src={images.thumbnail4.url}
                                        alt="Thumbnail 4"
                                        className={styles.thumnailImages_4}
                                        data-aos="fade-up"
                                        data-aos-delay="800"
                                        onError={(e) => console.log('Error loading thumbnail4:', e.currentTarget.src)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.torn_page}>
                        <img src="/images/m2/page.png" alt="" />
                    </div>
                    <div className={styles.story} data-aos="fade-up" data-aos-delay="200">
                        <div className={styles.Timing_Hook}>
                            <img src="/images/m2/tape.png" alt="" className={styles.tape} />
                            <div className={styles.Timing_Hook__content} data-aos="fade-right" data-aos-delay="400">
                                <h3>Chuyện</h3>
                                <h4>
                                    <span>Của</span> Chúng mình
                                </h4>
                            </div>
                        </div>
                        <div className={styles.content_story}>
                            <div className={styles.header_content}>
                                <div className={styles.left} data-aos="fade-right" data-aos-delay="600">
                                    {images.storyImage1 && (
                                        <img
                                            src={images.storyImage1.url}
                                            alt=""
                                            onError={(e) =>
                                                console.log('Error loading storyImage1:', e.currentTarget.src)
                                            }
                                        />
                                    )}
                                </div>
                                <div className={styles.right} data-aos="fade-left" data-aos-delay="800">
                                    <span>
                                        Trong một thị trấn nhỏ dọc bờ biển, {weddingData.groom} – chàng họa sĩ trẻ, tình
                                        cờ gặp {weddingData.bride} – cô gái bán sách cũ, khi cô đánh rơi một quyển sách
                                        trên con dốc gió lộng. Anh nhặt lên, trao lại, và họ nhìn nhau
                                    </span>
                                </div>
                            </div>
                            <div className={styles.footer_content}>
                                <div className={styles.left} data-aos="fade-right" data-aos-delay="1000">
                                    <span>
                                        Tình yêu giữa {weddingData.groom} và {weddingData.bride} bắt đầu bằng một bản
                                        nhạc cũ vang lên trong quán cà phê ven biển. Cô ngồi ở góc quán, lặng lẽ đọc
                                        sách, còn anh vừa bước vào đã sững người khi nghe giai điệu quen thuộc – bài hát
                                        mẹ anh thường bật những ngày mưa.
                                    </span>
                                </div>
                                <div className={styles.right} data-aos="fade-left" data-aos-delay="1200">
                                    {images.storyImage2 && (
                                        <img
                                            src={images.storyImage2.url}
                                            alt=""
                                            onError={(e) =>
                                                console.log('Error loading storyImage2:', e.currentTarget.src)
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.story_bride}>
                            <div className={styles.story_bride_wrapper}>
                                <div className={styles.story_bride__content} data-aos="zoom-in" data-aos-delay="400">
                                    <div className={styles.left}>
                                        <h3>Chuyện</h3>
                                        <h4>
                                            <span>Của</span> Cô Dâu
                                        </h4>
                                    </div>
                                    <div className={styles.right}>
                                        <h2>{weddingData.bride}</h2>
                                    </div>
                                </div>
                                <div className={styles.content} data-aos="fade-up" data-aos-delay="800">
                                    <span>{weddingData.brideStory || 'Chưa có câu chuyện cô dâu.'}</span>
                                    <div className={styles.img_story__bride} data-aos="fade-left" data-aos-delay="600">
                                        {images.brideImage && (
                                            <img
                                                src={images.brideImage.url}
                                                alt=""
                                                onError={(e) =>
                                                    console.log('Error loading brideImage:', e.currentTarget.src)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.story_groom} data-aos="fade-up" data-aos-delay="200">
                            <div className={styles.story_groom_wrapper}>
                                <div className={styles.story_groom__content} data-aos="zoom-in" data-aos-delay="400">
                                    <div className={styles.left}>
                                        <h3>Chuyện</h3>
                                        <h4>
                                            <span>Của</span> Chú Rể
                                        </h4>
                                    </div>
                                    <div className={styles.right}>
                                        <h2>{weddingData.groom}</h2>
                                    </div>
                                </div>
                                <div className={styles.content} data-aos="fade-up" data-aos-delay="600">
                                    <span>{weddingData.groomStory || 'Chưa có câu chuyện chú rể.'}</span>
                                    <div className={styles.img_story__groom} data-aos="fade-left" data-aos-delay="800">
                                        {images.groomImage && (
                                            <img
                                                src={images.groomImage.url}
                                                alt=""
                                                onError={(e) =>
                                                    console.log('Error loading groomImage:', e.currentTarget.src)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.time_location}>
                            <div className={styles.wrapper}>
                                <h3>Tới dự buổi tiệc mừng Lễ thành hôn</h3>
                                <h3>Của Chúng Tôi</h3>
                                <div className={styles.img_t1}>
                                    <img src="/images/m2/t1.png" alt="" />
                                </div>
                                <div className={styles.img_t2}>
                                    <img src="/images/m2/t1.png" alt="" />
                                </div>
                                <div className={styles.family_section}>
                                    <div className={styles.family_wrapper}>
                                        <div className={styles.family_box}>
                                            <h4>Nhà Trai</h4>
                                            <p>Ông: {weddingData.familyGroom.father}</p>
                                            <p>Bà: {weddingData.familyGroom.mother}</p>
                                        </div>
                                        <div className={styles.family_box}>
                                            <h4>Nhà Gái</h4>
                                            <p>Ông: {weddingData.familyBride.father}</p>
                                            <p>Bà: {weddingData.familyBride.mother}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.flex}>
                                    <div className={styles.flex_gap}>
                                        <div>{weddingData.groom}</div>
                                        <span>囍</span>
                                        <div>{weddingData.bride}</div>
                                    </div>
                                </div>
                                <div className={styles.infomation} data-aos="fade-up" data-aos-duration="1200">
                                    <p className={styles.eventDetails}>TIỆC MỪNG VU QUY</p>
                                    <p className={styles.eventTime}>Vào Lúc</p>
                                    <div className={styles.dateContainer}>
                                        <span className={styles.time}>{weddingData.weddingDayOfWeek}</span>
                                        <div className={styles.column}>
                                            <span className={styles.dayOfWeek}>
                                                {formatTime(weddingData.weddingTime)}
                                            </span>
                                            <span className={styles.day}>{weddingData.weddingDate.split('/')[0]}</span>
                                            <span className={styles.month}>
                                                Tháng {weddingData.weddingDate.split('/')[1]}
                                            </span>
                                        </div>
                                        <span className={styles.year}>{weddingData.weddingDate.split('/')[2]}</span>
                                    </div>
                                </div>
                                <div className={styles.Lunar_day} data-aos="fade-up" data-aos-delay="200">
                                    (Tức Ngày {weddingData.lunar_day})
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
                            </div>
                        </div>
                        <div className={styles.address} data-aos="fade-up" data-aos-duration="1000">
                            <div className={styles.dotLeft}></div>
                            <div className={styles.dotRight}></div>
                            <h4>Địa điểm tổ chức</h4>
                            <div className={styles.addressContent}>
                                <h5>Nhà Trai</h5>
                                {weddingData.venue_groom && weddingData.groomMapUrl ? (
                                    <div className={styles.venueDetails}>
                                        <p className={styles.venueText}>{weddingData.venue_groom}</p>
                                        <iframe
                                            src={weddingData.groomMapUrl}
                                            width="600"
                                            height="450"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <p className={styles.venueText}>Địa điểm của chú rể chưa cập nhật</p>
                                )}
                            </div>
                            <div className={styles.addressContent}>
                                <h5>Nhà Gái</h5>
                                {weddingData.venue_bride && weddingData.brideMapUrl ? (
                                    <div className={styles.venueDetails}>
                                        <p className={styles.venueText}>{weddingData.venue_bride}</p>
                                        <iframe
                                            src={weddingData.brideMapUrl}
                                            width="600"
                                            height="450"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <p className={styles.venueText}>Địa điểm của cô dâu chưa cập nhật</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.photo_gallery}>
                            <div className={styles.gallery_container}>
                                <div
                                    className={`${styles.gallery_item} ${styles.item_1}`}
                                    data-aos="fade-up"
                                    data-aos-delay="200"
                                >
                                    <div className={styles.card_content}>
                                        {images.galleryImage1 && (
                                            <img
                                                src={images.galleryImage1.url}
                                                alt="Wedding Photo 1"
                                                className={styles.card_image}
                                                onError={(e) =>
                                                    console.log('Error loading galleryImage1:', e.currentTarget.src)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`${styles.gallery_item} ${styles.item_2}`}
                                    data-aos="fade-up"
                                    data-aos-delay="400"
                                >
                                    <div className={styles.card_content}>
                                        {images.galleryImage2 && (
                                            <img
                                                src={images.galleryImage2.url}
                                                alt="Wedding Photo 2"
                                                className={styles.card_image}
                                                onError={(e) =>
                                                    console.log('Error loading galleryImage2:', e.currentTarget.src)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`${styles.gallery_item} ${styles.item_3}`}
                                    data-aos="fade-up"
                                    data-aos-delay="600"
                                >
                                    <div className={styles.card_content}>
                                        {images.galleryImage3 && (
                                            <img
                                                src={images.galleryImage3.url}
                                                alt="Wedding Photo 3"
                                                className={styles.card_image}
                                                onError={(e) =>
                                                    console.log('Error loading galleryImage3:', e.currentTarget.src)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`${styles.gallery_item} ${styles.item_4}`}
                                    data-aos="fade-up"
                                    data-aos-delay="800"
                                >
                                    <div className={styles.card_content}>
                                        {images.galleryImage4 && (
                                            <img
                                                src={images.galleryImage4.url}
                                                alt="Wedding Photo 4"
                                                className={styles.card_image}
                                                onError={(e) =>
                                                    console.log('Error loading galleryImage4:', e.currentTarget.src)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <footer>
                            <div className={styles.dotLeft}></div>
                            <div className={styles.dotRight}></div>
                            <div className={styles.Save_the_date} data-aos="fade-right" data-aos-delay="400">
                                <span className={styles.save}>Save</span>
                                <span className={styles.the}>The</span>
                                <span className={styles.date}>Date</span>
                                <span className={styles.time}>{weddingData.weddingDate}</span>
                            </div>
                            <div className={styles.bride_groom} data-aos="fade-up" data-aos-delay="600">
                                <h3>{weddingData.bride}</h3>
                                <span>&</span>
                                <h3>{weddingData.groom}</h3>
                            </div>
                            <div className={styles.content_foooter}>
                                <span data-aos="fade-up" data-aos-duration="1000">
                                    Chúng tôi háo hức mong chờ <InviteeNameContent fullName={guestName} /> đến chung vui
                                    trong ngày trọng đại của đời mình – một dấu mốc thiêng liêng và đáng nhớ. Sẽ thật
                                    trọn vẹn và ý nghĩa biết bao nếu có sự hiện diện cùng lời chúc phúc chân thành từ
                                    bạn trong khoảnh khắc đặc biệt ấy.
                                </span>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Mau2InviteeName;
