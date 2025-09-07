'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import styles from '../../15.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import { useApi } from 'app/lib/apiContext/apiContext';
import { showToastError, showToastSuccess } from 'app/Ultils/toast';
import imagekit from 'app/lib/imagekit/imagekit';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ButtonDown from 'app/template/buttonDown/ButtonDown';
import Loading from 'app/pages/DefaultLayouts/Loading_default/Loading';

// Define TypeScript interfaces
interface WeddingData {
    bride: string;
    groom: string;
    weddingDate: string | null;
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

interface Image {
    url: string;
    position: string;
    fileName?: string;
}

interface Images {
    mainImage: Image;
    photo1: Image;
    photo2: Image;
    photo3: Image;
    groomImage: Image;
    brideImage: Image;
    galleryImage1: Image;
    galleryImage2: Image;
    galleryImage3: Image;
    galleryImage4: Image;
    galleryImage5: Image;
    galleryImage6: Image;
    galleryImage7: Image;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface ImageFile {
    file: File;
    position: string;
}

const Template15Edit: React.FC = () => {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [quantity] = useState<number>(parseInt(searchParams.get('quantity') || '1', 10));
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [showMap, setShowMap] = useState<'none' | 'groom' | 'bride'>('none');

    useDisableDevTools();

    // Default wedding data
    const defaultWeddingData: WeddingData = {
        bride: '',
        groom: '',
        weddingDate: null,
        weddingTime: '',
        weddingDayOfWeek: '',
        lunarDay: '',
        familyGroom: { father: '', mother: '' },
        familyBride: { father: '', mother: '' },
        groomStory:
            'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
        brideStory:
            'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
        groomAddress: '',
        brideAddress: '',
        groomMapUrl: '',
        brideMapUrl: '',
    };

    const [weddingData, setWeddingData] = useState<WeddingData>(() => {
        const savedData = typeof window !== 'undefined' ? localStorage.getItem(`WeddingData${templateId}`) : null;
        if (savedData) {
            try {
                const parsedData: Partial<WeddingData> = JSON.parse(savedData);
                return {
                    ...defaultWeddingData,
                    ...parsedData,
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
        const defaultImages: Images = {
            mainImage: { url: '/images/m15/choose_img.png', position: 'main' },
            photo1: { url: '/images/m15/choose_img.png', position: 'photo1' },
            photo2: { url: '/images/m15/choose_img.png', position: 'photo2' },
            photo3: { url: '/images/m15/choose_img.png', position: 'photo3' },
            groomImage: { url: '/images/m15/choose_img.png', position: 'groom' },
            brideImage: { url: '/images/m15/choose_img.png', position: 'bride' },
            galleryImage1: { url: '/images/m15/choose_img.png', position: 'gallery1' },
            galleryImage2: { url: '/images/m15/choose_img.png', position: 'gallery2' },
            galleryImage3: { url: '/images/m15/choose_img.png', position: 'gallery3' },
            galleryImage4: { url: '/images/m15/choose_img.png', position: 'gallery4' },
            galleryImage5: { url: '/images/m15/choose_img.png', position: 'gallery5' },
            galleryImage6: { url: '/images/m15/choose_img.png', position: 'gallery6' },
            galleryImage7: { url: '/images/m15/choose_img.png', position: 'gallery7' },
        };

        if (savedImages) {
            try {
                const parsedImages: Partial<Images> = JSON.parse(savedImages);
                return {
                    ...defaultImages,
                    ...parsedImages,
                };
            } catch (e) {
                console.error('Failed to parse weddingImages from localStorage:', e);
                return defaultImages;
            }
        }
        return defaultImages;
    });

    const fileInputRefs = {
        mainImage: useRef<HTMLInputElement>(null),
        photo1: useRef<HTMLInputElement>(null),
        photo2: useRef<HTMLInputElement>(null),
        photo3: useRef<HTMLInputElement>(null),
        groomImage: useRef<HTMLInputElement>(null),
        brideImage: useRef<HTMLInputElement>(null),
        galleryImage1: useRef<HTMLInputElement>(null),
        galleryImage2: useRef<HTMLInputElement>(null),
        galleryImage3: useRef<HTMLInputElement>(null),
        galleryImage4: useRef<HTMLInputElement>(null),
        galleryImage5: useRef<HTMLInputElement>(null),
        galleryImage6: useRef<HTMLInputElement>(null),
        galleryImage7: useRef<HTMLInputElement>(null),
    };

    const handleImageChange = (key: keyof Images, position: string, e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages: Images = {
                    ...prev,
                    [key]: { url: `/images/m15/choose_img.png`, position, fileName: undefined },
                };
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

        void uploadImage(file, key, position);
        e.target.value = '';
    };

    const uploadImage = async (file: File, key: keyof Images, position: string): Promise<void> => {
        try {
            const authParams = await fetchAuthParams();
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
                return [...updatedFiles, { file: standardizedFile, position }];
            });

            setImages((prev) => {
                const newImages: Images = {
                    ...prev,
                    [key]: { url: uploadResponse.url, position, fileName: standardizedFileName },
                };
                try {
                    localStorage.setItem(`weddingImages${templateId}`, JSON.stringify(newImages));
                } catch (e) {
                    console.error('Lỗi khi lưu weddingImages vào localStorage:', e);
                }
                return newImages;
            });
            showToastSuccess('Tải ảnh lên thành công');
        } catch (error) {
            showToastError('Lỗi khi tải ảnh lên ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi tải ảnh lên ImageKit:', key, position, error);
        }
    };

    const triggerFileInput = (key: keyof typeof fileInputRefs): void => {
        fileInputRefs[key].current?.click();
    };

    const formatTime = (time: string): string => {
        if (!time) return '';
        const amPmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (amPmMatch) {
            let hours = parseInt(amPmMatch[1], 10);
            const minutes = amPmMatch[2];
            const period = amPmMatch[3].toUpperCase();
            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2];
            if (hours >= 0 && hours <= 23 && parseInt(minutes, 10) <= 59) {
                return `${hours.toString().padStart(2, '0')}:${minutes}`;
            }
        }
        return '';
    };

    // Countdown logic
    const calculateTimeLeft = useCallback((): TimeLeft => {
        const now = new Date();
        let targetDate = new Date();
        if (weddingData.weddingDate) {
            const [day, month, year] = weddingData.weddingDate.split('/').map(Number);
            targetDate = new Date(year, month - 1, day, 18, 0, 0);
        }
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    }, [weddingData.weddingDate]);

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    // Calendar logic
    const generateCalendarDays = (): (number | null)[] => {
        const [, month, year] = weddingData.weddingDate
            ? weddingData.weddingDate.split('/').map(Number)
            : [17, 9, 2025];
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const calendarDays: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(i);
        }
        const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        for (let i = calendarDays.length; i < totalSlots; i++) {
            calendarDays.push(null);
        }
        return calendarDays;
    };
    const calendarDays = generateCalendarDays();

    // Map functions
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
        return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15&maptype=roadmap`;
    };

    const openGroomMapInGoogle = (): void => {
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

    const openBrideMapInGoogle = (): void => {
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

    const handleShowMap = (mapType: 'groom' | 'bride'): void => {
        setShowMap(mapType);
    };

    const handleCloseMap = (): void => {
        setShowMap('none');
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 100 });

        setWeddingData((prev) => {
            const updatedData = { ...prev };
            try {
                localStorage.setItem(`WeddingData${templateId}`, JSON.stringify(updatedData));
            } catch (e) {
                console.error('Lỗi khi lưu weddingData vào localStorage:', e);
            }
            return updatedData;
        });

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setIsLoading(false);

        return () => {
            AOS.refresh();
            clearInterval(timer);
        };
    }, [templateId, calculateTimeLeft]);

    if (isLoading) {
        return (
            <div>
                <Loading />
            </div>
        );
    }

    return (
        <div className={styles.Template15}>
            <div className={styles.wrapper}>
                <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                <div className={styles.mainImage} data-aos="fade-up" onClick={() => triggerFileInput('mainImage')}>
                    <div onClick={() => triggerFileInput('mainImage')}>
                        <Image
                            src={images.mainImage.url}
                            alt={images.mainImage.url ? 'Main photo' : 'Chọn ảnh'}
                            width={600}
                            height={400}
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
                    </div>
                    <div className={styles.content_main}>
                        <div className={styles.groom_name}>{weddingData.groom}</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>{weddingData.bride}</div>
                    </div>
                </div>

                <div className={styles.familyInfo} data-aos="fade-up">
                    <div className={styles.wrapper_bar2}>
                        <div className={styles.familyContainer}>
                            <h1>
                                We joyfully invite you to join us in celebrating the wedding of our beloved children
                            </h1>
                            <div className={styles.flex}>
                                <div className={styles.familySide}>
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyGroom.father}</span>
                                    <span>Bà: {weddingData.familyGroom.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> {weddingData.groomAddress}
                                    </p>
                                </div>
                                <div className={styles.familySide}>
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyBride.father}</span>
                                    <span>Bà: {weddingData.familyBride.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> {weddingData.brideAddress}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.groom_and_bride}>
                                <div>{weddingData.groom}</div>
                                <div>{weddingData.bride}</div>
                            </div>
                            <div className={styles.dat}>
                                Lúc:{' '}
                                <strong>
                                    {formatTime(weddingData.weddingTime)} || {weddingData.weddingDayOfWeek},{' '}
                                    {weddingData.weddingDate || ''}
                                </strong>
                                <br />
                                <p>(Nhằm {weddingData.lunarDay})</p>
                                Your presence will be our greatest joy and honor.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.banner_date} data-aos="fade-up">
                    <div className={styles.text_png}>
                        <Image src="/images/m15/std_1__text.png" alt="Text decoration" width={200} height={100} />
                    </div>
                    <div className={styles.dateRow}>
                        <span>{weddingData.weddingDate ? weddingData.weddingDate.split('/')[0] : ''}</span>
                        <span>{weddingData.weddingDate ? weddingData.weddingDate.split('/')[1] : ''}</span>
                        <span>{weddingData.weddingDate ? weddingData.weddingDate.split('/')[2].slice(-2) : ''}</span>
                    </div>
                    <div className={styles.photos}>
                        <div onClick={() => triggerFileInput('photo1')} className={styles.banner_img__1}>
                            <Image
                                src={images.photo1.url}
                                alt={images.photo1.url ? 'Wedding photo 1' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.photo1.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.photo1}
                                onChange={(e) => handleImageChange('photo1', 'photo1', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div onClick={() => triggerFileInput('photo2')} className={styles.banner_img__2}>
                            <Image
                                src={images.photo2.url}
                                alt={images.photo2.url ? 'Wedding photo 2' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.photo2.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.photo2}
                                onChange={(e) => handleImageChange('photo2', 'photo2', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div onClick={() => triggerFileInput('photo3')} className={styles.banner_img__3}>
                            <Image
                                src={images.photo3.url}
                                alt={images.photo3.url ? 'Wedding photo 3' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.photo3.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.photo3}
                                onChange={(e) => handleImageChange('photo3', 'photo3', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                    <div className={styles.love_story}>
                        <div className={styles.image_title}>
                            <Image src="/images/m15/love_story.png" alt="Love Story" width={200} height={100} />
                        </div>
                        <div className={styles.story_wrapper}>
                            <div className={styles.story_box}>
                                <div className={styles.story_image} onClick={() => triggerFileInput('groomImage')}>
                                    <Image
                                        src={images.groomImage.url}
                                        alt={images.groomImage.url ? 'Groom photo' : 'Chọn ảnh'}
                                        width={300}
                                        height={400}
                                        className={images.groomImage.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.groomImage}
                                        onChange={(e) => handleImageChange('groomImage', 'groom', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className={styles.story_text}>
                                    <h3>The Groom&apos;s Story</h3>
                                    <p>{weddingData.groomStory || defaultWeddingData.groomStory}</p>
                                </div>
                            </div>
                            <div className={`${styles.story_box} ${styles.reverse}`}>
                                <div className={styles.story_image} onClick={() => triggerFileInput('brideImage')}>
                                    <Image
                                        src={images.brideImage.url}
                                        alt={images.brideImage.url ? 'Bride photo' : 'Chọn ảnh'}
                                        width={300}
                                        height={400}
                                        className={images.brideImage.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.brideImage}
                                        onChange={(e) => handleImageChange('brideImage', 'bride', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className={styles.story_text}>
                                    <h3>The Bride&apos;s Story</h3>
                                    <p>{weddingData.brideStory || defaultWeddingData.brideStory}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_teeth} data-aos="fade-up">
                    <div className={styles.teethTop}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>

                    <div className={styles.calendar}>
                        <div className={styles.calendarHeader}>
                            <h3>
                                Tháng {weddingData.weddingDate ? weddingData.weddingDate.split('/')[1] : 9},{' '}
                                {weddingData.weddingDate ? weddingData.weddingDate.split('/')[2] : 2025}
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
                            {calendarDays.map((day, index) => {
                                const isWeddingDay = weddingData.weddingDate
                                    ? day === Number(weddingData.weddingDate.split('/')[0])
                                    : false;
                                const isValidDay = day !== null;
                                return (
                                    <div
                                        key={index}
                                        className={`${styles.calendarDay} ${isWeddingDay ? styles.weddingDay : ''} ${
                                            !isValidDay ? styles.emptyDay : ''
                                        }`}
                                    >
                                        {isValidDay && (
                                            <>
                                                {isWeddingDay ? (
                                                    <span className={styles.weddingDayContent}>
                                                        {day}
                                                        <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
                                                    </span>
                                                ) : (
                                                    day
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.count}>
                        <div className={styles.countdownContainer}>
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

                    <div className={styles.flex_btn__map}>
                        <button
                            className={styles.map_groom}
                            onClick={showMap === 'groom' ? openGroomMapInGoogle : () => handleShowMap('groom')}
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showMap === 'groom' ? 'Mở bản đồ lớn' : 'Chỉ đường chú rể'}
                        </button>
                        <button
                            className={styles.map_bride}
                            onClick={showMap === 'bride' ? openBrideMapInGoogle : () => handleShowMap('bride')}
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showMap === 'bride' ? 'Mở bản đồ lớn' : 'Chỉ đường cô dâu'}
                        </button>
                    </div>

                    <div className={styles.teethBottom}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>
                </div>

                <div className={styles.wrapper_map} data-aos="fade-up">
                    <div className={`${styles.google_map} ${showMap !== 'none' ? styles.showMap : ''}`}>
                        {showMap !== 'none' && (
                            <button className={styles.closeButton} onClick={handleCloseMap}></button>
                        )}
                        {showMap === 'groom' && (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showMap === 'bride' && (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                width="100%"
                                height="500"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showMap === 'none' && (
                            <Image src="/images/m10/icon_map.png" alt="Map placeholder" width={200} height={200} />
                        )}
                    </div>
                </div>

                <div className={styles.galary} data-aos="fade-up">
                    <div onClick={() => triggerFileInput('galleryImage1')}>
                        <Image
                            src={images.galleryImage1.url}
                            alt={images.galleryImage1.url ? 'Gallery photo 1' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.galleryImage1.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.galleryImage1}
                            onChange={(e) => handleImageChange('galleryImage1', 'gallery1', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div onClick={() => triggerFileInput('galleryImage2')}>
                        <Image
                            src={images.galleryImage2.url}
                            alt={images.galleryImage2.url ? 'Gallery photo 2' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.galleryImage2.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.galleryImage2}
                            onChange={(e) => handleImageChange('galleryImage2', 'gallery2', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div onClick={() => triggerFileInput('galleryImage3')}>
                        <Image
                            src={images.galleryImage3.url}
                            alt={images.galleryImage3.url ? 'Gallery photo 3' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.galleryImage3.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.galleryImage3}
                            onChange={(e) => handleImageChange('galleryImage3', 'gallery3', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div onClick={() => triggerFileInput('galleryImage4')}>
                        <Image
                            src={images.galleryImage4.url}
                            alt={images.galleryImage4.url ? 'Gallery photo 4' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.galleryImage4.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.galleryImage4}
                            onChange={(e) => handleImageChange('galleryImage4', 'gallery4', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div onClick={() => triggerFileInput('galleryImage5')}>
                        <Image
                            src={images.galleryImage5.url}
                            alt={images.galleryImage5.url ? 'Gallery photo 5' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.galleryImage5.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.galleryImage5}
                            onChange={(e) => handleImageChange('galleryImage5', 'gallery5', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div onClick={() => triggerFileInput('galleryImage6')}>
                        <Image
                            src={images.galleryImage6.url}
                            alt={images.galleryImage6.url ? 'Gallery photo 6' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.galleryImage6.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.galleryImage6}
                            onChange={(e) => handleImageChange('galleryImage6', 'gallery6', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div onClick={() => triggerFileInput('galleryImage7')}>
                        <Image
                            src={images.galleryImage7.url}
                            alt={images.galleryImage7.url ? 'Gallery photo 7' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.galleryImage7.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.galleryImage7}
                            onChange={(e) => handleImageChange('galleryImage7', 'gallery7', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
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
                </div>
            </div>
        </div>
    );
};

export default Template15Edit;
