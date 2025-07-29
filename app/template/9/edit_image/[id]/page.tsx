'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../../9.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import { useApi } from 'app/lib/apiContext/apiContext';
import { showToastError } from 'app/Ultils/toast';
import imagekit from 'app/lib/imagekit/imagekit';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ButtonDown from 'app/template/buttonDown/ButtonDown';

interface TemplateWeddingData {
    bride: string;
    groom: string;
    weddingDate: Date | null;
    weddingTime: string;
    weddingDayOfWeek: string;
    lunarDay: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    groomStory: string;
    brideStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string;
    brideMapUrl: string;
}

interface Images {
    mainImage: { url: string; position: string; fileName?: string };
    whiteBorderImage: { url: string; position: string; fileName?: string };
    profileImage: { url: string; position: string; fileName?: string };
    groomImage: { url: string; position: string; fileName?: string };
    brideImage: { url: string; position: string; fileName?: string };
    albumImage1: { url: string; position: string; fileName?: string };
    albumImage2: { url: string; position: string; fileName?: string };
    albumImage3: { url: string; position: string; fileName?: string };
    albumImage4: { url: string; position: string; fileName?: string };
    albumImage5: { url: string; position: string; fileName?: string };
    albumImage6: { url: string; position: string; fileName?: string };
    albumImage7: { url: string; position: string; fileName?: string };
}

const Template9Edit: React.FC = () => {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity] = useState(parseInt(searchParams.get('quantity') || '1'));
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);
    const [showGroomMap, setShowGroomMap] = useState<boolean>(false);
    const [showBrideMap, setShowBrideMap] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useDisableDevTools();

    const parseWeddingDate = (dateStr: string | Date | null): Date | null => {
        if (typeof dateStr === 'string' && dateStr.trim()) {
            const [day, month, year] = dateStr.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    };

    const formatDayOfWeek = (date: Date | null): string => {
        if (!date) return 'Chủ Nhật';
        const days = ['Chủ Nhật', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
        return days[date.getDay()];
    };

    // Updated formatTime function
    const formatTime = (time: string): string => {
        if (!time) return '00:00';

        // Handle 12-hour format with AM/PM (e.g., "6:00 PM" or "6:00PM")
        const amPmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (amPmMatch) {
            let hours = parseInt(amPmMatch[1], 10);
            const minutes = amPmMatch[2];
            const period = amPmMatch[3].toUpperCase();

            // Convert to 24-hour format
            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }

        // Handle 24-hour format (e.g., "18:00")
        const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2];
            if (hours >= 0 && hours <= 23 && parseInt(minutes, 10) <= 59) {
                return `${hours.toString().padStart(2, '0')}:${minutes}`;
            }
        }

        // Return default if format is invalid
        return '00:00';
    };

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
        return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15&maptype=satellite`;
    };

    const openGroomMapInGoogle = () => {
        const match = weddingData.groomMapUrl.match(/^\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
        if (!match) {
            showToastError('Tọa độ nhà trai không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[3]);
        if (isNaN(lat) || isNaN(lng)) {
            showToastError('Tọa độ nhà trai không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }
        const groomMapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=vi`;
        window.open(groomMapUrl, '_blank');
    };

    const openBrideMapInGoogle = () => {
        const match = weddingData.brideMapUrl.match(/^\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
        if (!match) {
            showToastError('Tọa độ nhà gái không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[3]);
        if (isNaN(lat) || isNaN(lng)) {
            showToastError('Tọa độ nhà gái không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }
        const brideMapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=vi`;
        window.open(brideMapUrl, '_blank');
    };

    const toggleGroomMap = () => {
        setShowGroomMap(!showGroomMap);
        setShowBrideMap(false);
    };

    const toggleBrideMap = () => {
        setShowBrideMap(!showBrideMap);
        setShowGroomMap(false);
    };

    const defaultWeddingData: TemplateWeddingData = {
        bride: '',
        groom: '',
        weddingDate: new Date(2025, 6, 20),
        weddingTime: '',
        weddingDayOfWeek: '',
        lunarDay: '',
        familyGroom: { father: '', mother: '' },
        familyBride: { father: '', mother: '' },
        brideStory:
            'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
        groomStory:
            'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
        groomAddress: '',
        brideAddress: '',
        groomMapUrl: '',
        brideMapUrl: '',
    };

    const [weddingData, setWeddingData] = useState<TemplateWeddingData>(() => {
        const savedData = typeof window !== 'undefined' ? localStorage.getItem(`WeddingData${templateId}`) : null;
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                return {
                    ...parsedData,
                    weddingDate: parseWeddingDate(parsedData.weddingDate),
                    groomMapUrl: parsedData.groomMapUrl || defaultWeddingData.groomMapUrl,
                    brideMapUrl: parsedData.brideMapUrl || defaultWeddingData.brideMapUrl,
                };
            } catch (e) {
                console.error('Failed to parse WeddingData from localStorage:', e);
                return defaultWeddingData;
            }
        }
        return defaultWeddingData;
    });

    const [images, setImages] = useState<Images>(() => {
        const savedImages = typeof window !== 'undefined' ? localStorage.getItem(`weddingImages${templateId}`) : null;
        if (savedImages) {
            try {
                const parsedImages = JSON.parse(savedImages);
                return {
                    mainImage: parsedImages.mainImage || { url: '/images/m9/choose_img.png', position: 'main' },
                    whiteBorderImage: parsedImages.whiteBorderImage || {
                        url: '/images/m9/choose_img.png',
                        position: 'whiteBorder',
                    },
                    profileImage: parsedImages.profileImage || {
                        url: '/images/m9/choose_img.png',
                        position: 'profile',
                    },
                    groomImage: parsedImages.groomImage || { url: '/images/m9/choose_img.png', position: 'groom' },
                    brideImage: parsedImages.brideImage || { url: '/images/m9/choose_img.png', position: 'bride' },
                    albumImage1: parsedImages.albumImage1 || { url: '/images/m9/choose_img.png', position: 'album1' },
                    albumImage2: parsedImages.albumImage2 || { url: '/images/m9/choose_img.png', position: 'album2' },
                    albumImage3: parsedImages.albumImage3 || { url: '/images/m9/choose_img.png', position: 'album3' },
                    albumImage4: parsedImages.albumImage4 || { url: '/images/m9/choose_img.png', position: 'album4' },
                    albumImage5: parsedImages.albumImage5 || { url: '/images/m9/choose_img.png', position: 'album5' },
                    albumImage6: parsedImages.albumImage6 || { url: '/images/m9/choose_img.png', position: 'album6' },
                    albumImage7: parsedImages.albumImage7 || { url: '/images/m9/choose_img.png', position: 'album7' },
                };
            } catch (e) {
                console.error('Failed to parse weddingImages from localStorage:', e);
            }
        }
        return {
            mainImage: { url: '/images/m9/choose_img.png', position: 'main' },
            whiteBorderImage: { url: '/images/m9/choose_img.png', position: 'whiteBorder' },
            profileImage: { url: '/images/m9/choose_img.png', position: 'profile' },
            groomImage: { url: '/images/m9/choose_img.png', position: 'groom' },
            brideImage: { url: '/images/m9/choose_img.png', position: 'bride' },
            albumImage1: { url: '/images/m9/choose_img.png', position: 'album1' },
            albumImage2: { url: '/images/m9/choose_img.png', position: 'album2' },
            albumImage3: { url: '/images/m9/choose_img.png', position: 'album3' },
            albumImage4: { url: '/images/m9/choose_img.png', position: 'album4' },
            albumImage5: { url: '/images/m9/choose_img.png', position: 'album5' },
            albumImage6: { url: '/images/m9/choose_img.png', position: 'album6' },
            albumImage7: { url: '/images/m9/choose_img.png', position: 'album7' },
        };
    });

    const fileInputRefs = {
        mainImage: useRef<HTMLInputElement>(null),
        whiteBorderImage: useRef<HTMLInputElement>(null),
        profileImage: useRef<HTMLInputElement>(null),
        groomImage: useRef<HTMLInputElement>(null),
        brideImage: useRef<HTMLInputElement>(null),
        albumImage1: useRef<HTMLInputElement>(null),
        albumImage2: useRef<HTMLInputElement>(null),
        albumImage3: useRef<HTMLInputElement>(null),
        albumImage4: useRef<HTMLInputElement>(null),
        albumImage5: useRef<HTMLInputElement>(null),
        albumImage6: useRef<HTMLInputElement>(null),
        albumImage7: useRef<HTMLInputElement>(null),
    };

    const handleImageChange = async (key: keyof Images, position: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: {
                        url: `/images/m9/choose_img.png`,
                        position,
                        fileName: undefined,
                    },
                };
                if (key === 'mainImage') {
                    newImages.whiteBorderImage = {
                        url: `/images/m9/choose_img.png`,
                        position: 'whiteBorder',
                        fileName: undefined,
                    };
                }
                try {
                    localStorage.setItem(`weddingImages${templateId}`, JSON.stringify(newImages));
                } catch (e) {
                    console.error('Lỗi khi lưu weddingImages vào localStorage:', e);
                }
                return newImages;
            });
            e.target.value = '';
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showToastError('Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, hoặc GIF).');
            e.target.value = '';
            return;
        }

        let authParams;
        try {
            authParams = await fetchAuthParams();
        } catch (error) {
            showToastError('Không thể kết nối với ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi lấy auth params:', error);
            e.target.value = '';
            return;
        }

        try {
            const timestamp = Date.now();
            const standardizedFileName = `${timestamp}-${key}.jpg`;
            const currentDate = new Date();
            const dateFolder = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
            const folderPath = `/wedding_${templateId}/${dateFolder}`;

            const uploadResponse = await imagekit.upload({
                file,
                fileName: standardizedFileName,
                folder: folderPath,
                token: authParams.token,
                expire: authParams.expire,
                signature: authParams.signature,
            });

            if (!uploadResponse.url) {
                throw new Error('Tải ảnh lên ImageKit thất bại: Không nhận được URL');
            }

            const standardizedFile = new File([file], standardizedFileName, { type: 'image/jpeg' });
            setImageFiles((prev) => {
                const updatedFiles = prev.filter((item) => item.position !== position);
                const newFiles = [{ file: standardizedFile, position }];
                if (key === 'mainImage') {
                    newFiles.push({ file: standardizedFile, position: 'whiteBorder' });
                }
                return [...updatedFiles, ...newFiles];
            });

            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: { url: uploadResponse.url, position, fileName: standardizedFileName },
                };
                if (key === 'mainImage') {
                    newImages.whiteBorderImage = {
                        url: uploadResponse.url,
                        position: 'whiteBorder',
                        fileName: standardizedFileName,
                    };
                }
                try {
                    localStorage.setItem(`weddingImages${templateId}`, JSON.stringify(newImages));
                } catch (e) {
                    console.error('Lỗi khi lưu weddingImages vào localStorage:', e);
                }
                return newImages;
            });
        } catch (error) {
            showToastError('Lỗi khi tải ảnh lên ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi tải ảnh lên ImageKit:', key, position, error);
        }
        e.target.value = '';
    };

    const triggerFileInput = (key: keyof typeof fileInputRefs) => {
        fileInputRefs[key].current?.click();
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 100 });

        setWeddingData((prev) => {
            const updatedData = { ...prev };
            
            try {
                localStorage.setItem(
                    `WeddingData${templateId}`,
                    JSON.stringify({
                        ...updatedData,
                        weddingDate: updatedData.weddingDate
                            ? `${updatedData.weddingDate.getDate()}/${updatedData.weddingDate.getMonth() + 1}/${updatedData.weddingDate.getFullYear()}`
                            : null,
                    })
                );
            } catch (e) {
                console.error('Lỗi khi lưu weddingData vào localStorage:', e);
            }
            return updatedData;
        });

        setIsLoading(false);

        return () => {
            AOS.refresh();
        };
    }, [templateId, weddingData.weddingDate, weddingData.weddingTime]);

    useEffect(() => {
        const weddingDate = weddingData.weddingDate
            ? weddingData.weddingDate.getTime()
            : new Date('2025-07-20T10:00:00+07:00').getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const timeDiff = weddingDate - now;

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
    }, [weddingData.weddingDate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.template9}>
            <div className={styles.wrapper}>
                <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                <div className={styles.mainImage} onClick={() => triggerFileInput('mainImage')}>
                    <Image
                        src={images.mainImage.url}
                        alt={images.mainImage.url ? 'Wedding main image' : 'Chọn ảnh'}
                        width={500}
                        height={500}
                        className={images.mainImage.url ? '' : styles.imagePlaceholder}
                        style={{ cursor: 'pointer' }}
                    />
                    <input
                        type="file"
                        ref={fileInputRefs.mainImage}
                        onChange={(e) => handleImageChange('mainImage', 'main', e)}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <div className={styles.imgFrame}></div>

                    <div className={styles.whiteBorder} onClick={() => triggerFileInput('whiteBorderImage')}>
                        <Image
                            src={images.whiteBorderImage.url}
                            alt={images.whiteBorderImage.url ? 'Wedding main image' : 'Chọn ảnh'}
                            width={250}
                            height={250}
                            className={`${styles.roundedImage} ${images.whiteBorderImage.url ? '' : styles.imagePlaceholder}`}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.whiteBorderImage}
                            onChange={(e) => handleImageChange('whiteBorderImage', 'whiteBorder', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
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
                            Vào Lúc: <strong>{formatTime(weddingData.weddingTime)}</strong>
                            <br />
                            <div className={styles.wrapper_times}>
                                <div className={styles.flex}>
                                    {formatDayOfWeek(weddingData.weddingDate)}
                                    <div className={styles.br}>
                                        <strong>{weddingData.weddingDate?.getDate() || 20}</strong>
                                        <br />
                                        <span>{weddingData.weddingDate?.getFullYear() || 2025}</span>
                                    </div>
                                    Tháng {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 7}
                                </div>
                            </div>
                        </div>
                    </div>
                    <span className={styles.lunar_day}>(Nhằm {weddingData.lunarDay})</span>

                    <div className={styles.calendar}>
                        <div className={styles.vignette}>
                            <img src="/images/m9/vignette_1.png" alt="" />
                        </div>
                        <div className={styles.calendarHeader}>
                            <h3>
                                Tháng {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 7},{' '}
                                {weddingData.weddingDate?.getFullYear() || 2025}
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
                                        const isWeddingDay = day === (weddingData.weddingDate?.getDate() || 20);
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

                    <div className={styles.wedding_program}></div>

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
                                <Image
                                    src={images.groomImage.url}
                                    alt={images.groomImage.url ? 'Groom' : 'Chọn ảnh'}
                                    width={50}
                                    height={50}
                                    className={images.groomImage.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => triggerFileInput('groomImage')}
                                />
                                {weddingData.groom}
                            </span>
                            {weddingData.groomStory || defaultWeddingData.groomStory}
                        </p>
                        <div className={styles.vector_img__groom}>
                            {!showGroomMap && (
                                <Image
                                    src={images.groomImage.url}
                                    alt={images.groomImage.url ? 'Groom image' : 'Chọn ảnh'}
                                    width={300}
                                    height={300}
                                    className={images.groomImage.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => triggerFileInput('groomImage')}
                                />
                            )}
                            <input
                                type="file"
                                ref={fileInputRefs.groomImage}
                                onChange={(e) => handleImageChange('groomImage', 'groom', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
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
                                onClick={showGroomMap ? openGroomMapInGoogle : toggleGroomMap}
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showGroomMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>

                    <div className={styles.card_story__bride}>
                        <h1>The Bride&apos;s Story</h1>
                        <p className={styles.text_story}>
                            <span className={styles.bride_name}>
                                <Image
                                    src={images.brideImage.url}
                                    alt={images.brideImage.url ? 'Bride' : 'Chọn ảnh'}
                                    width={50}
                                    height={50}
                                    className={images.brideImage.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => triggerFileInput('brideImage')}
                                />
                                {weddingData.bride}
                            </span>
                            {weddingData.brideStory || defaultWeddingData.brideStory}
                        </p>
                        <div className={styles.vector_img__bride}>
                            {!showBrideMap && (
                                <Image
                                    src={images.brideImage.url}
                                    alt={images.brideImage.url ? 'Bride image' : 'Chọn ảnh'}
                                    width={300}
                                    height={300}
                                    className={images.brideImage.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => triggerFileInput('brideImage')}
                                />
                            )}
                            <input
                                type="file"
                                ref={fileInputRefs.brideImage}
                                onChange={(e) => handleImageChange('brideImage', 'bride', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
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
                                onClick={showBrideMap ? openBrideMapInGoogle : toggleBrideMap}
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showBrideMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.count}>
                    <div className={styles.countdownContainer}>
                        <div className={styles.leftPanel}>
                            <div className={styles.profileImage} onClick={() => triggerFileInput('profileImage')}>
                                <Image
                                    src={images.profileImage.url}
                                    alt={images.profileImage.url ? 'Profile' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    className={images.profileImage.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.profileImage}
                                    onChange={(e) => handleImageChange('profileImage', 'profile', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
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
                                    <span className={styles.timeUnit}>phút</span>
                                </div>
                                <div className={styles.timeGroup}>
                                    <span className={styles.timeValue}>{timeLeft.seconds}</span>
                                    <span className={styles.timeUnit}>giây</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.album_wedding}>
                    <div className={styles.title}>Album Wedding</div>

                    <div className={styles.bento_grid}>
                        <div className={styles.boxTall} onClick={() => triggerFileInput('albumImage1')}>
                            <Image
                                src={images.albumImage1.url}
                                alt={images.albumImage1.url ? 'Wedding photo 1' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.albumImage1.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.albumImage1}
                                onChange={(e) => handleImageChange('albumImage1', 'album1', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.boxTall} onClick={() => triggerFileInput('albumImage2')}>
                            <Image
                                src={images.albumImage2.url}
                                alt={images.albumImage2.url ? 'Wedding photo 2' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.albumImage2.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.albumImage2}
                                onChange={(e) => handleImageChange('albumImage2', 'album2', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.boxTall} onClick={() => triggerFileInput('albumImage3')}>
                            <Image
                                src={images.albumImage3.url}
                                alt={images.albumImage3.url ? 'Wedding photo 3' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.albumImage3.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.albumImage3}
                                onChange={(e) => handleImageChange('albumImage3', 'album3', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.boxWide} onClick={() => triggerFileInput('albumImage4')}>
                            <Image
                                src={images.albumImage4.url}
                                alt={images.albumImage4.url ? 'Wedding photo 4' : 'Chọn ảnh'}
                                width={400}
                                height={200}
                                className={images.albumImage4.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.albumImage4}
                                onChange={(e) => handleImageChange('albumImage4', 'album4', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.box} onClick={() => triggerFileInput('albumImage5')}>
                            <Image
                                src={images.albumImage5.url}
                                alt={images.albumImage5.url ? 'Wedding photo 5' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                className={images.albumImage5.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.albumImage5}
                                onChange={(e) => handleImageChange('albumImage5', 'album5', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.boxTall} onClick={() => triggerFileInput('albumImage6')}>
                            <Image
                                src={images.albumImage6.url}
                                alt={images.albumImage6.url ? 'Wedding photo 6' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.albumImage6.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.albumImage6}
                                onChange={(e) => handleImageChange('albumImage6', 'album6', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.boxWide} onClick={() => triggerFileInput('albumImage7')}>
                            <Image
                                src={images.albumImage7.url}
                                alt={images.albumImage7.url ? 'Wedding photo 7' : 'Chọn ảnh'}
                                width={400}
                                height={200}
                                className={images.albumImage7.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.albumImage7}
                                onChange={(e) => handleImageChange('albumImage7', 'album7', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
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

                    <Image src="/images/m7/ft_m7.png" alt="Footer image" width={500} height={200} />
                </div>
            </div>
        </div>
    );
};

export default Template9Edit;
