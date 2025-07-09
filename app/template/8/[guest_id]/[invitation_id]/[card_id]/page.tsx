'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from '../../../8.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useApi } from 'app/lib/apiContext/apiContext';
import { parse } from 'date-fns';
import InvitionsQR from 'app/QR_received/invitionsQR/invitionsQR';
export const dynamic = 'force-dynamic';
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

const Template8InviteeName: React.FC = () => {
    useDisableDevTools();
    const pathname = usePathname();
    const { getGuestAndCard } = useApi();
    const [showGroomMap, setShowGroomMap] = useState<boolean>(false);
    const [showBrideMap, setShowBrideMap] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
                    bride: weddingData?.bride || 'Mai Thảo',
                    groom: weddingData?.groom || 'Thiên Phúc',
                    weddingDate: weddingData?.weddingDate || '17/08/2025',
                    weddingTime: weddingData?.weddingTime || '10:00',
                    weddingDayOfWeek: weddingData?.weddingDayOfWeek || 'Chủ Nhật',
                    lunar_day: card.invitations[0]?.lunar_day || weddingData?.lunar_day || '24 tháng 06 năm ất tỵ',
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
                    groomMapUrl: weddingData?.groomMapUrl || '(-37.82425,144.956)',
                    brideMapUrl: weddingData?.brideMapUrl || '(-37.83333,144.96667)',
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
        <div className={styles.template8}>
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
                <div className={styles.mainImage} data-aos="fade-in" data-aos-delay="200">
                    <Image src={images.mainImage.url} alt="Wedding main image" width={500} height={500} />
                </div>
                <div className={styles.hy} data-aos="fade-in" data-aos-delay="300">
                    <img src="/images/m8/hy.png" alt="Decorative image" />
                </div>
                <div className={styles.info} data-aos="fade-up" data-aos-delay="400">
                    <div className={styles.bg}>
                        <img src="/images/m8/nen_1.png" />
                    </div>
                    <h3>
                        join us to celebrate
                        <br />
                        <strong> the Wedding Of</strong>
                    </h3>
                    <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="500">
                        {weddingData.groom}
                    </div>
                    <div className={styles.and} data-aos="fade-in" data-aos-delay="500">
                        &
                    </div>
                    <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="500">
                        {weddingData.bride}
                    </div>
                    <div className={styles.specific_time} data-aos="fade-up" data-aos-delay="600">
                        <h4>
                            Lúc: <strong>{formatTimeToHourMinute(weddingData.weddingTime)}</strong> ||{' '}
                            {weddingData.weddingDayOfWeek}, {weddingDay} Tháng {weddingMonth}, {weddingYear}
                        </h4>
                        <span>Đến dự buổi tiệc cùng gia đình chúng tôi.</span>
                        <div className={styles.info_family}>
                            <div className={styles.groom_family} data-aos="fade-right" data-aos-delay="700">
                                <span> * Nhà trai</span>
                                <h3>Ông: {weddingData.familyGroom.father}</h3>
                                <h3>Bà: {weddingData.familyGroom.mother}</h3>
                                <p>D/C: {weddingData.groomAddress}</p>
                            </div>
                            <div className={styles.bride_family} data-aos="fade-left" data-aos-delay="700">
                                <span> * Nhà gái</span>
                                <h3>Ông: {weddingData.familyBride.father}</h3>
                                <h3>Bà: {weddingData.familyBride.mother}</h3>
                                <p>D/C: {weddingData.brideAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.wrapper_story__love}>
                    <div className={styles.card_story__groom}>
                        <h1 data-aos="fade-right" data-aos-delay="300">
                            The Groom&apos;s Story
                        </h1>
                        <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="600">
                            {weddingData.groom}
                        </div>
                        <p className={styles.text_story} data-aos="fade-up" data-aos-delay="900">
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
                            <div
                                className={styles.btn_map}
                                onClick={handleGroomMapClick}
                                data-aos="fade-up"
                                data-aos-delay="400"
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showGroomMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>
                    <div className={styles.card_story__bride}>
                        <h1 data-aos="fade-left" data-aos-delay="300">
                            The Bride&apos;s Story
                        </h1>
                        <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="600">
                            {weddingData.bride}
                        </div>
                        <p className={styles.text_story} data-aos="fade-up" data-aos-delay="900">
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
                            <div
                                className={styles.btn_map}
                                onClick={handleBrideMapClick}
                                data-aos="fade-up"
                                data-aos-delay="400"
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showBrideMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.count} data-aos="fade-in" data-aos-delay="300">
                    <div className={styles.countdown}>
                        <div className={styles.countdown_bg}></div>
                        <div className={styles.countdown_content}>
                            <h2>Đếm ngược đến ngày cưới</h2>
                            <div className={styles.countdown_timer}>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.days}</span>
                                    <span className={styles.time_label}>Ngày</span>
                                </div>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.hours}</span>
                                    <span className={styles.time_label}>Giờ</span>
                                </div>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.minutes}</span>
                                    <span className={styles.time_label}>Phút</span>
                                </div>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.seconds}</span>
                                    <span className={styles.time_label}>Giây</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.album_wedding}>
                    <div className={styles.title}>Album Wedding</div>
                    <div className={styles.bento_grid}>
                        <div className={styles.boxTall} data-aos="fade-right" data-aos-delay="300">
                            <Image src={images.albumImage1.url} alt="Wedding photo 1" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall} data-aos="fade-right" data-aos-delay="600">
                            <Image src={images.albumImage2.url} alt="Wedding photo 2" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall} data-aos="fade-right" data-aos-delay="900">
                            <Image src={images.albumImage3.url} alt="Wedding photo 3" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide} data-aos="fade-up" data-aos-delay="1100">
                            <Image src={images.albumImage4.url} alt="Wedding photo 4" width={400} height={200} />
                        </div>
                        <div className={styles.box} data-aos="fade-up" data-aos-delay="1400">
                            <Image src={images.albumImage5.url} alt="Wedding photo 5" width={200} height={200} />
                        </div>
                        <div className={styles.boxTall} data-aos="fade-up" data-aos-delay="1700">
                            <Image src={images.albumImage6.url} alt="Wedding photo 6" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide} data-aos="fade-up" data-aos-delay="2000">
                            <Image src={images.albumImage7.url} alt="Wedding photo 7" width={400} height={200} />
                        </div>
                    </div>
                </div>
                <div className={styles.footer}>
                    <div className={styles.column_text} data-aos="fade-up" data-aos-delay="600">
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

export default Template8InviteeName;
