'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import styles from '../../14.module.css';
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

// Define TypeScript interfaces
interface WeddingData {
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
    mainImage1: { url: string; position: string; fileName?: string };
    mainImage2: { url: string; position: string; fileName?: string };
    mainImage3: { url: string; position: string; fileName?: string };
    groomImage: { url: string; position: string; fileName?: string };
    brideImage: { url: string; position: string; fileName?: string };
    albumImage1: { url: string; position: string; fileName?: string };
    albumImage2: { url: string; position: string; fileName?: string };
    albumImage3: { url: string; position: string; fileName?: string };
    albumImage4: { url: string; position: string; fileName?: string };
    albumImage5: { url: string; position: string; fileName?: string };
    albumImage6: { url: string; position: string; fileName?: string };
    albumImage7: { url: string; position: string; fileName?: string };
    albumImage8: { url: string; position: string; fileName?: string };
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const Template14InviteeName: React.FC = () => {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity] = useState(parseInt(searchParams.get('quantity') || '1'));
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);
    const [showMap, setShowMap] = useState<'none' | 'groom' | 'bride'>('none');

    useDisableDevTools();

    // Default wedding data
    const defaultWeddingData: WeddingData = {
        bride: '',
        groom: '',
        weddingDate: new Date(0, 0, 0, 100, 0, 0),
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
        groomMapUrl: '', // Default coordinates for Crown Melbourne
        brideMapUrl: '', // Default coordinates for Melbourne Convention and Exhibition Centre
    };

    const [weddingData, setWeddingData] = useState<WeddingData>(() => {
        const savedData = typeof window !== 'undefined' ? localStorage.getItem(`WeddingData${templateId}`) : null;
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                let parsedDate: Date | null = null;
                if (parsedData.weddingDate) {
                    if (typeof parsedData.weddingDate === 'string') {
                        const [day, month, year] = parsedData.weddingDate.split('/').map(Number);
                        parsedDate = new Date(year, month - 1, day, 18, 0, 0); // Default to 6:00 PM
                    } else if (parsedData.weddingDate instanceof Date) {
                        parsedDate = new Date(parsedData.weddingDate);
                    }
                }
                const finalDate =
                    parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : defaultWeddingData.weddingDate;
                return {
                    ...defaultWeddingData,
                    ...parsedData,
                    weddingDate: finalDate,
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
            mainImage1: { url: '/images/m14/choose_img.png', position: 'main1' },
            mainImage2: { url: '/images/m14/choose_img.png', position: 'main2' },
            mainImage3: { url: '/images/m14/choose_img.png', position: 'main3' },
            groomImage: { url: '/images/m14/choose_img.png', position: 'groom' },
            brideImage: { url: '/images/m14/choose_img.png', position: 'bride' },
            albumImage1: { url: '/images/m14/choose_img.png', position: 'album1' },
            albumImage2: { url: '/images/m14/choose_img.png', position: 'album2' },
            albumImage3: { url: '/images/m14/choose_img.png', position: 'album3' },
            albumImage4: { url: '/images/m14/choose_img.png', position: 'album4' },
            albumImage5: { url: '/images/m14/choose_img.png', position: 'album5' },
            albumImage6: { url: '/images/m14/choose_img.png', position: 'album6' },
            albumImage7: { url: '/images/m14/choose_img.png', position: 'album7' },
            albumImage8: { url: '/images/m14/choose_img.png', position: 'album8' },
        };

        if (savedImages) {
            try {
                const parsedImages = JSON.parse(savedImages);
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
        mainImage1: useRef<HTMLInputElement>(null),
        mainImage2: useRef<HTMLInputElement>(null),
        mainImage3: useRef<HTMLInputElement>(null),
        groomImage: useRef<HTMLInputElement>(null),
        brideImage: useRef<HTMLInputElement>(null),
        albumImage1: useRef<HTMLInputElement>(null),
        albumImage2: useRef<HTMLInputElement>(null),
        albumImage3: useRef<HTMLInputElement>(null),
        albumImage4: useRef<HTMLInputElement>(null),
        albumImage5: useRef<HTMLInputElement>(null),
        albumImage6: useRef<HTMLInputElement>(null),
        albumImage7: useRef<HTMLInputElement>(null),
        albumImage8: useRef<HTMLInputElement>(null),
    };

    const handleImageChange = (key: keyof Images, position: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: { url: `/images/m14/${position}.jpg`, position, fileName: undefined },
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

        uploadImage(file, key, position);
        e.target.value = '';
    };

    const uploadImage = async (file: File, key: keyof Images, position: string) => {
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
                const newImages = {
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

    const triggerFileInput = (key: keyof typeof fileInputRefs) => {
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
    const calculateTimeLeft = (): TimeLeft => {
        const now = new Date(); // Current date and time
        const difference =
            (weddingData.weddingDate?.getTime() || new Date().getTime()) - now.getTime();

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    // Calendar logic
    const generateCalendarDays = (): (number | null)[] => {
        const year = weddingData.weddingDate ? weddingData.weddingDate.getFullYear() : 2025;
        const month = weddingData.weddingDate ? weddingData.weddingDate.getMonth() : 8; // August
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const calendarDays: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(day);
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

    const handleShowMap = (mapType: 'groom' | 'bride') => {
        setShowMap(mapType);
    };

    const handleCloseMap = () => {
        setShowMap('none');
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
                            : '',
                    })
                );
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
    }, [templateId, weddingData.weddingDate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.template14}>
            <div className={styles.wrapper}>
                <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                <div className={styles.header_content}>
                    <div className={styles.image_flower_blue}>
                        <Image src="/images/m14/14.1.jpg" alt="Flower background" width={600} height={400} />
                    </div>

                    <div className={styles.wrapper_main}>
                        <div className={styles.img_main_1} onClick={() => triggerFileInput('mainImage1')}>
                            <Image
                                src={images.mainImage1.url}
                                alt={images.mainImage1.url ? 'Main photo 1' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.mainImage1.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.mainImage1}
                                onChange={(e) => handleImageChange('mainImage1', 'main1', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.img_main_2} onClick={() => triggerFileInput('mainImage2')}>
                            <Image
                                src={images.mainImage2.url}
                                alt={images.mainImage2.url ? 'Main photo 2' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.mainImage2.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.mainImage2}
                                onChange={(e) => handleImageChange('mainImage2', 'main2', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.img_main_3} onClick={() => triggerFileInput('mainImage3')}>
                            <Image
                                src={images.mainImage3.url}
                                alt={images.mainImage3.url ? 'Main photo 3' : 'Chọn ảnh'}
                                width={200}
                                height={300}
                                className={images.mainImage3.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.mainImage3}
                                onChange={(e) => handleImageChange('mainImage3', 'main3', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className={styles.content_header}>
                        <span>Please join us for</span>
                        <h3>The Wedding of</h3>
                        <div className={styles.groom}>{weddingData.groom}</div>
                        <div className={styles.and}>and</div>
                        <div className={styles.bride}>{weddingData.bride}</div>
                    </div>
                </div>

                <div className={styles.familyInfo}>
                    <div className={styles.wrapper_bar2}>
                        <div className={styles.teethTop}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={styles.tooth}></div>
                            ))}
                        </div>

                        <div className={styles.familyContainer}>
                            <h1>
                                Trân Trọng kính mời đến dự buổi tiệc
                                <br />
                                Chung vui cùng gia đình chúng tôi
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
                                    {weddingData.weddingDate && !isNaN(weddingData.weddingDate.getTime())
                                        ? `${weddingData.weddingDate.getDate()} Tháng ${weddingData.weddingDate.getMonth() + 1}, ${weddingData.weddingDate.getFullYear()}`
                                        : ''}
                                </strong>
                                <br />
                                <p>(Nhằm {weddingData.lunarDay})</p>
                                Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                            </div>
                        </div>

                        <div className={styles.teethBottom}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={styles.tooth}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.story}>
                    <div className={styles.story_groom}>
                        <div className={styles.preview_select}>
                            <div className={styles.flex_content}>
                                <div
                                    className={styles.image_story__groom}
                                    onClick={() => triggerFileInput('groomImage')}
                                >
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
                                <div className={styles.text_story}>
                                    <h1>The Groom&apos;s Story</h1>
                                    <p>{weddingData.groomStory || defaultWeddingData.groomStory}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.story_bride}>
                        <div className={styles.preview_select}>
                            <div className={styles.flex_content}>
                                <div
                                    className={styles.image_story__bride}
                                    onClick={() => triggerFileInput('brideImage')}
                                >
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
                                <div className={styles.text_story}>
                                    <h1>The Bride&apos;s Story</h1>
                                    <p>{weddingData.brideStory || defaultWeddingData.brideStory}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_teeth}>
                    <div className={styles.teethTop}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>

                    <div className={styles.calendar}>
                        <div className={styles.text_std__image}>
                            <Image src="/images/m14/std_txt.png" alt="Calendar decoration" width={200} height={100} />
                        </div>
                        <div className={styles.calendarHeader}>
                            <h3>
                                Tháng{' '}
                                {weddingData.weddingDate && !isNaN(weddingData.weddingDate.getTime())
                                    ? weddingData.weddingDate.getMonth() + 1
                                    : 8}
                                , {weddingData.weddingDate?.getFullYear() || 2025}
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
                                const isWeddingDay =
                                    weddingData.weddingDate && !isNaN(weddingData.weddingDate.getTime())
                                        ? day === weddingData.weddingDate.getDate()
                                        : day === 21; // Default to 21st (today's date)
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

                    <div className={styles.wrapper_map}>
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
                        <div className={`${styles.google_map} ${showMap !== 'none' ? styles.showMap : ''}`}>
                            {showMap !== 'none' && (
                                <button className={styles.closeButton} onClick={handleCloseMap}>
                                    Đóng
                                </button>
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

                    <div className={styles.teethBottom}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className={styles.tooth}></div>
                        ))}
                    </div>
                </div>

                <div className={styles.title_album}>Wedding Album</div>
                <div className={styles.bento_image}>
                    <div className={styles.img1} onClick={() => triggerFileInput('albumImage1')}>
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
                    <div className={styles.img2} onClick={() => triggerFileInput('albumImage2')}>
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
                    <div className={styles.img3} onClick={() => triggerFileInput('albumImage3')}>
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
                    <div className={styles.img4} onClick={() => triggerFileInput('albumImage4')}>
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
                    <div className={styles.img5} onClick={() => triggerFileInput('albumImage5')}>
                        <Image
                            src={images.albumImage5.url}
                            alt={images.albumImage5.url ? 'Wedding photo 5' : 'Chọn ảnh'}
                            width={200}
                            height={300}
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
                    <div className={styles.img6} onClick={() => triggerFileInput('albumImage6')}>
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
                    <div className={styles.img7} onClick={() => triggerFileInput('albumImage7')}>
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
                    <div className={styles.img8} onClick={() => triggerFileInput('albumImage8')}>
                        <Image
                            src={images.albumImage8.url}
                            alt={images.albumImage8.url ? 'Wedding photo 8' : 'Chọn ảnh'}
                            width={200}
                            height={300}
                            className={images.albumImage8.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.albumImage8}
                            onChange={(e) => handleImageChange('albumImage8', 'album8', e)}
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

export default Template14InviteeName;
