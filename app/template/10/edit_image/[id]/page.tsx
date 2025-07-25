'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import styles from '../../10.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import { useApi } from 'app/lib/apiContext/apiContext';
import { showToastError, showToastSuccess } from 'app/Ultils/toast';
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
    groomImage1: { url: string; position: string; fileName?: string };
    groomImage2: { url: string; position: string; fileName?: string };
    groomImage3: { url: string; position: string; fileName?: string };
    brideImage1: { url: string; position: string; fileName?: string };
    brideImage2: { url: string; position: string; fileName?: string };
    brideImage3: { url: string; position: string; fileName?: string };
    saveTheDateImage: { url: string; position: string; fileName?: string };
    albumImage1: { url: string; position: string; fileName?: string };
    albumImage2: { url: string; position: string; fileName?: string };
    albumImage3: { url: string; position: string; fileName?: string };
    albumImage4: { url: string; position: string; fileName?: string };
    albumImage5: { url: string; position: string; fileName?: string };
    albumImage6: { url: string; position: string; fileName?: string };
    albumImage7: { url: string; position: string; fileName?: string };
}

function Template10Edit() {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity] = useState(parseInt(searchParams.get('quantity') || '1'));
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);
    const [showImagePicker, setShowImagePicker] = useState<boolean>(true);
    const [pendingMainImage, setPendingMainImage] = useState<{ file: File | null; url: string }>({
        file: null,
        url: '/images/m10/choose_img.png',
    });
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

    const formatTime = (time: string): string => {
        if (!time) return '00:00';
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

    const toggleGroomMap = () => {
        setShowGroomMap(!showGroomMap);
        setShowBrideMap(false);
    };

    const toggleBrideMap = () => {
        setShowBrideMap(!showBrideMap);
        setShowGroomMap(false);
    };

    const defaultWeddingData: TemplateWeddingData = {
        bride: ' ',
        groom: ' ',
        weddingDate: new Date(0, 0, 0),
        weddingTime: '',
        weddingDayOfWeek: ' ',
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
        const defaultImages: Images = {
            mainImage: { url: '/images/m10/choose_img.png', position: 'main' },
            groomImage1: { url: '/images/m10/choose_img.png', position: 'groom1' },
            groomImage2: { url: '/images/m10/choose_img.png', position: 'groom2' },
            groomImage3: { url: '/images/m10/choose_img.png', position: 'groom3' },
            brideImage1: { url: '/images/m10/choose_img.png', position: 'bride1' },
            brideImage2: { url: '/images/m10/choose_img.png', position: 'bride2' },
            brideImage3: { url: '/images/m10/choose_img.png', position: 'bride3' },
            saveTheDateImage: { url: '/images/m10/choose_img.png', position: 'saveTheDate' },
            albumImage1: { url: '/images/m10/choose_img.png', position: 'album1' },
            albumImage2: { url: '/images/m10/choose_img.png', position: 'album2' },
            albumImage3: { url: '/images/m10/choose_img.png', position: 'album3' },
            albumImage4: { url: '/images/m10/choose_img.png', position: 'album4' },
            albumImage5: { url: '/images/m10/choose_img.png', position: 'album5' },
            albumImage6: { url: '/images/m10/choose_img.png', position: 'album6' },
            albumImage7: { url: '/images/m10/choose_img.png', position: 'album7' },
        };

        if (savedImages) {
            try {
                const parsedImages = JSON.parse(savedImages);
                // Gộp dữ liệu từ localStorage với defaultImages, đảm bảo không thiếu key
                return {
                    ...defaultImages,
                    ...parsedImages,
                    // Đảm bảo mỗi key có giá trị hợp lệ
                    mainImage: parsedImages.mainImage ?? defaultImages.mainImage,
                    groomImage1: parsedImages.groomImage1 ?? defaultImages.groomImage1,
                    groomImage2: parsedImages.groomImage2 ?? defaultImages.groomImage2,
                    groomImage3: parsedImages.groomImage3 ?? defaultImages.groomImage3,
                    brideImage1: parsedImages.brideImage1 ?? defaultImages.brideImage1,
                    brideImage2: parsedImages.brideImage2 ?? defaultImages.brideImage2,
                    brideImage3: parsedImages.brideImage3 ?? defaultImages.brideImage3,
                    saveTheDateImage: parsedImages.saveTheDateImage ?? defaultImages.saveTheDateImage,
                    albumImage1: parsedImages.albumImage1 ?? defaultImages.albumImage1,
                    albumImage2: parsedImages.albumImage2 ?? defaultImages.albumImage2,
                    albumImage3: parsedImages.albumImage3 ?? defaultImages.albumImage3,
                    albumImage4: parsedImages.albumImage4 ?? defaultImages.albumImage4,
                    albumImage5: parsedImages.albumImage5 ?? defaultImages.albumImage5,
                    albumImage6: parsedImages.albumImage6 ?? defaultImages.albumImage6,
                    albumImage7: parsedImages.albumImage7 ?? defaultImages.albumImage7,
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
        groomImage1: useRef<HTMLInputElement>(null),
        groomImage2: useRef<HTMLInputElement>(null),
        groomImage3: useRef<HTMLInputElement>(null),
        brideImage1: useRef<HTMLInputElement>(null),
        brideImage2: useRef<HTMLInputElement>(null),
        brideImage3: useRef<HTMLInputElement>(null),
        saveTheDateImage: useRef<HTMLInputElement>(null),
        albumImage1: useRef<HTMLInputElement>(null),
        albumImage2: useRef<HTMLInputElement>(null),
        albumImage3: useRef<HTMLInputElement>(null),
        albumImage4: useRef<HTMLInputElement>(null),
        albumImage5: useRef<HTMLInputElement>(null),
        albumImage6: useRef<HTMLInputElement>(null),
        albumImage7: useRef<HTMLInputElement>(null),
    };

    const handleImageChange = (key: keyof Images, position: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: { url: `/images/m10/${position}.jpg`, position, fileName: undefined },
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

        if (key === 'mainImage') {
            const newImageUrl = URL.createObjectURL(file);
            setPendingMainImage({ file, url: newImageUrl });
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
        } catch (error) {
            showToastError('Lỗi khi tải ảnh lên ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi tải ảnh lên ImageKit:', key, position, error);
        }
    };

    const handleDoneClick = async () => {
        if (pendingMainImage.file) {
            await uploadImage(pendingMainImage.file, 'mainImage', 'main');
            showToastSuccess('Chọn ảnh hoàn tất');
        }
        setShowImagePicker(false);
    };

    const triggerFileInput = (key: keyof typeof fileInputRefs) => {
        fileInputRefs[key].current?.click();
    };

    const hexPositions = [
        { top: -215, right: 360 },
        { top: -205, right: -105 },
        { top: 270, right: 120 },
        { top: 270, right: 595 },
        { top: 780, right: 360 },
        { top: 760, right: -110 },
        { top: 1245, right: 125 },
    ];

    const wrapperWidth = 350;
    const wrapperHeight = 480;

    const firstDayOfMonth = weddingData.weddingDate
        ? new Date(weddingData.weddingDate.getFullYear(), weddingData.weddingDate.getMonth(), 1).getDay()
        : 5;
    const daysInMonth = weddingData.weddingDate
        ? new Date(weddingData.weddingDate.getFullYear(), weddingData.weddingDate.getMonth() + 1, 0).getDate()
        : 31;
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }
    while (calendarDays.length < 42) {
        calendarDays.push(null);
    }

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
            : new Date('2025-08-17T10:00:00+07:00').getTime();

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
        <div className={styles.template10}>
            <div className={styles.wrapper}>
                <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                <div className={styles.pss}>
                    <div className={styles.main}>
                        <div className={styles.text}>
                            <span className={styles.line_shortest}></span>
                        </div>

                        <div className={styles.hexWrapper}>
                            {hexPositions.map((pos, i) => {
                                const bgX = ((wrapperWidth - pos.right) / wrapperWidth) * 100;
                                const bgY = (pos.top / wrapperHeight) * 60;

                                return (
                                    <div key={i} className={`${styles.hex} ${styles[`hex${i}`]}`}>
                                        <div
                                            className={styles.hexIn}
                                            style={{
                                                backgroundImage: `url(${pendingMainImage.url})`,
                                                backgroundPosition: `${bgX}% ${bgY}%`,
                                                backgroundSize: `${wrapperWidth}px ${wrapperHeight}px`,
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.text_info}>
                            <div className={styles.date}>
                                {weddingData.weddingDate
                                    ? `${weddingData.weddingDate.getDate()} tháng ${weddingData.weddingDate.getMonth() + 1} năm ${weddingData.weddingDate.getFullYear()}`
                                    : '17 tháng 08 năm 2025'}
                            </div>
                            <div className={styles.decorLeft} />
                            <h1 className={styles.groom_name}>{weddingData.groom}</h1>
                            <h1 className={styles.bride_name}>{weddingData.bride}</h1>

                            <p className={styles.description}>
                                Với tất cả tình yêu và lòng biết ơn,
                                <br />
                                chúng tôi hân hoan mời bạn đến chứng kiến khoảnh khắc
                                <br />
                                hai tâm hồn hoà làm một trong lời hứa trọn đời,
                                <br />
                                giữa vòng tay ấm áp của gia đình và những người thân yêu.
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles.flex_btn_choose_image}>
                    {showImagePicker && (
                        <>
                            <h3>Nên tùy chọn ảnh cân xứng nhất, vì Hexagon có thể không tương thích với 1 số ảnh</h3>
                            <div className={styles.btn_choose} onClick={() => triggerFileInput('mainImage')}>
                                Chọn Ảnh
                            </div>
                            <input
                                type="file"
                                ref={fileInputRefs.mainImage}
                                onChange={(e) => handleImageChange('mainImage', 'main', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div className={styles.btn_success} onClick={handleDoneClick}>
                                Xong
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.story_groom}>
                    <div className={styles.story_groom__wrapper}>
                        <h1>The Groom&apos;s Story</h1>
                        <h3 className={styles.for_groom}>{weddingData.groom}</h3>
                        <span className={styles.story_text}>{weddingData.groomStory || defaultWeddingData.groomStory}</span>
                    </div>

                    <div className={styles.flex_image_groom}>
                        <div className={styles.box_image} onClick={() => triggerFileInput('groomImage1')}>
                            <Image
                                src={images.groomImage1.url}
                                alt={images.groomImage1.url ? 'Groom photo 1' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                className={images.groomImage1.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.groomImage1}
                                onChange={(e) => handleImageChange('groomImage1', 'groom1', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.box_image} onClick={() => triggerFileInput('groomImage2')}>
                            <Image
                                src={images.groomImage2.url}
                                alt={images.groomImage2.url ? 'Groom photo 2' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                className={images.groomImage2.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.groomImage2}
                                onChange={(e) => handleImageChange('groomImage2', 'groom2', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.box_image} onClick={() => triggerFileInput('groomImage3')}>
                            <Image
                                src={images.groomImage3.url}
                                alt={images.groomImage3.url ? 'Groom photo 3' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                className={images.groomImage3.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.groomImage3}
                                onChange={(e) => handleImageChange('groomImage3', 'groom3', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.story_bride}>
                    <div className={styles.story_bride__wrapper}>
                        <h1>The Bride&apos;s Story</h1>
                        <h3 className={styles.for_bride}>{weddingData.bride}</h3>
                        <span className={styles.story_text}>{weddingData.brideStory || defaultWeddingData.brideStory}</span>
                    </div>

                    <div className={styles.flex_image_groom}>
                        <div className={styles.box_image} onClick={() => triggerFileInput('brideImage1')}>
                            <Image
                                src={images.brideImage1.url}
                                alt={images.brideImage1.url ? 'Bride photo 1' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                className={images.brideImage1.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.brideImage1}
                                onChange={(e) => handleImageChange('brideImage1', 'bride1', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.box_image} onClick={() => triggerFileInput('brideImage2')}>
                            <Image
                                src={images.brideImage2.url}
                                alt={images.brideImage2.url ? 'Bride photo 2' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                className={images.brideImage2.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.brideImage2}
                                onChange={(e) => handleImageChange('brideImage2', 'bride2', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.box_image} onClick={() => triggerFileInput('brideImage3')}>
                            <Image
                                src={images.brideImage3.url}
                                alt={images.brideImage3.url ? 'Bride photo 3' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                className={images.brideImage3.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.brideImage3}
                                onChange={(e) => handleImageChange('brideImage3', 'bride3', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.info}>
                    <h3>
                        Trân Trọng kính mời đến dự buổi tiệc
                        <br />
                        <strong>Chung vui cùng gia đình chúng tôi</strong>
                    </h3>

                    <div className={styles.specific_time}>
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

                        <div className={styles.groom_name}>{weddingData.groom}</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>{weddingData.bride}</div>

                        <h4>
                            Lúc: <strong>{formatTime(weddingData.weddingTime)}</strong> ||{' '}
                            {formatDayOfWeek(weddingData.weddingDate)},{' '}
                            {weddingData.weddingDate
                                ? `${weddingData.weddingDate.getDate()} Tháng ${weddingData.weddingDate.getMonth() + 1}, ${weddingData.weddingDate.getFullYear()}`
                                : '17 Tháng 08, 2025'}
                        </h4>

                        <span className={styles.lunar_day}>(Nhằm {weddingData.lunarDay})</span>
                    </div>
                </div>

                <div className={styles.flex_time_details}>
                    <div className={styles.image} onClick={() => triggerFileInput('saveTheDateImage')}>
                        <Image
                            src={images.saveTheDateImage.url}
                            alt={images.saveTheDateImage.url ? 'Save the date' : 'Chọn ảnh'}
                            width={200}
                            height={200}
                            className={images.saveTheDateImage.url ? '' : styles.imagePlaceholder}
                            style={{ cursor: 'pointer' }}
                        />
                        <input
                            type="file"
                            ref={fileInputRefs.saveTheDateImage}
                            onChange={(e) => handleImageChange('saveTheDateImage', 'saveTheDate', e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className={styles.box}>
                        <h1>Save the date</h1>
                        <span>
                            {weddingData.weddingDate
                                ? `${weddingData.weddingDate.getDate()}.${weddingData.weddingDate.getMonth() + 1}.${weddingData.weddingDate.getFullYear()}`
                                : '17.08.2025'}
                        </span>
                    </div>
                </div>

                <div className={styles.calendar}>
                    <div className={styles.calendarHeader}>
                        <h3>
                            Tháng {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 8},{' '}
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
                        {calendarDays.map((day, index) => {
                            const isWeddingDay = day === (weddingData.weddingDate?.getDate() || 17);
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

                <div className={styles.wrapper_map}>
                    <div className={styles.flex_btn__map}>
                        <button
                            className={styles.map_groom}
                            onClick={showGroomMap ? openGroomMapInGoogle : toggleGroomMap}
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showGroomMap ? 'Mở map lớn' : 'Chỉ đường chú rể'}
                        </button>
                        <button
                            className={styles.map_bride}
                            onClick={showBrideMap ? openBrideMapInGoogle : toggleBrideMap}
                        >
                            <FontAwesomeIcon icon={faLocationDot} />
                            {showBrideMap ? 'Mở map lớn' : 'Chỉ đường cô dâu'}
                        </button>
                    </div>

                    <div className={styles.google_map}>
                        {showGroomMap && (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                width="100%"
                                height="400"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {showBrideMap && (
                            <iframe
                                src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                width="100%"
                                height="400"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        )}
                        {!showGroomMap && !showBrideMap && <img src="/images/m10/icon_map.png" />}
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
                </div>
            </div>
        </div>
    );
}

export default Template10Edit;
