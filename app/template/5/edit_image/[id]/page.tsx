'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../../5.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';
import { Suspense } from 'react';
import { TemplateWeddingData } from 'app/edit/template/[templateId]/EditTemplate';
import ButtonDown from 'app/template/buttonDown/ButtonDown';
import imagekit from 'app/lib/imagekit/imagekit';
import { useApi } from '../../../../lib/apiContext/apiContext';
import { showToastError } from 'app/Ultils/toast';

interface Images {
    mainImage: { url: string; position: string; fileName?: string };
    groomImage: { url: string; position: string; fileName?: string };
    brideImage: { url: string; position: string; fileName?: string };
    collageImage1: { url: string; position: string; fileName?: string };
    collageImage2: { url: string; position: string; fileName?: string };
    collageImage3: { url: string; position: string; fileName?: string };
    collageImage4: { url: string; position: string; fileName?: string };
    collageImage5: { url: string; position: string; fileName?: string };
    footerImage: { url: string; position: string; fileName?: string };
    footerGridImage1: { url: string; position: string; fileName?: string };
    footerGridImage2: { url: string; position: string; fileName?: string };
    footerGridImage3: { url: string; position: string; fileName?: string };
    footerGridImage4: { url: string; position: string; fileName?: string };
    bottomImage: { url: string; position: string; fileName?: string };
}

function Template5Edit() {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity] = useState(parseInt(searchParams.get('quantity') || '1'));
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Parse weddingDate from localStorage string to Date | null
    const parseWeddingDate = (dateStr: string | Date | null): Date | null => {
        if (typeof dateStr === 'string' && dateStr.trim()) {
            const [day, month, year] = dateStr.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    };

    // Format Day of Week
    const formatDayOfWeek = (date: Date | null): string => {
        if (!date) return 'THỨ BA';
        const days = ['Chủ Nhật', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
        return days[date.getDay()];
    };

    // Format Time to HH:MM
    const formatTime = (time: string): string => {
        if (!time) return '11:00';
        return time;
    };

    // Function to generate Google Maps embed URL from coordinates
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

    const defaultWeddingData: TemplateWeddingData = {
        bride: 'Bảo Ngọc',
        groom: 'Anh Duy',
        weddingDate: new Date(2025, 11, 23),
        weddingTime: '11:00',
        weddingDayOfWeek: 'THỨ BA',
        lunarDay: '17 tháng 11 năm ất tỵ',
        familyGroom: { father: 'Huỳnh Văn A', mother: 'Trần Thị B' },
        familyBride: { father: 'Lê Văn C', mother: 'Trần Thị D' },
        brideStory:
            'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
        groomStory:
            'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
        groomAddress: 'Trung tâm Hội nghị - Tiệc cưới Diamond Place',
        brideAddress: 'Trung tâm Hội nghị - Tiệc cưới Diamond Place',
        groomMapUrl: '(10.800840,106.672672)',
        brideMapUrl: '(10.800840,106.672672)',
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
                    mainImage: parsedImages.mainImage || { url: '/images/m5/placeholder-image.png', position: 'main' },
                    groomImage: parsedImages.groomImage || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'groom',
                    },
                    brideImage: parsedImages.brideImage || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'bride',
                    },
                    collageImage1: parsedImages.collageImage1 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'collage1',
                    },
                    collageImage2: parsedImages.collageImage2 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'collage2',
                    },
                    collageImage3: parsedImages.collageImage3 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'collage3',
                    },
                    collageImage4: parsedImages.collageImage4 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'collage4',
                    },
                    collageImage5: parsedImages.collageImage5 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'collage5',
                    },
                    footerImage: parsedImages.footerImage || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'footer',
                    },
                    footerGridImage1: parsedImages.footerGridImage1 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'footerGrid1',
                    },
                    footerGridImage2: parsedImages.footerGridImage2 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'footerGrid2',
                    },
                    footerGridImage3: parsedImages.footerGridImage3 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'footerGrid3',
                    },
                    footerGridImage4: parsedImages.footerGridImage4 || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'footerGrid4',
                    },
                    bottomImage: parsedImages.bottomImage || {
                        url: '/images/m5/placeholder-image.png',
                        position: 'bottom',
                    },
                };
            } catch (e) {
                console.error('Failed to parse weddingImages from localStorage:', e);
            }
        }
        return {
            mainImage: { url: '/images/m5/placeholder-image.png', position: 'main' },
            groomImage: { url: '/images/m5/placeholder-image.png', position: 'groom' },
            brideImage: { url: '/images/m5/placeholder-image.png', position: 'bride' },
            collageImage1: { url: '/images/m5/placeholder-image.png', position: 'collage1' },
            collageImage2: { url: '/images/m5/placeholder-image.png', position: 'collage2' },
            collageImage3: { url: '/images/m5/placeholder-image.png', position: 'collage3' },
            collageImage4: { url: '/images/m5/placeholder-image.png', position: 'collage4' },
            collageImage5: { url: '/images/m5/placeholder-image.png', position: 'collage5' },
            footerImage: { url: '/images/m5/placeholder-image.png', position: 'footer' },
            footerGridImage1: { url: '/images/m5/placeholder-image.png', position: 'footerGrid1' },
            footerGridImage2: { url: '/images/m5/placeholder-image.png', position: 'footerGrid2' },
            footerGridImage3: { url: '/images/m5/placeholder-image.png', position: 'footerGrid3' },
            footerGridImage4: { url: '/images/m5/placeholder-image.png', position: 'footerGrid4' },
            bottomImage: { url: '/images/m5/placeholder-image.png', position: 'bottom' },
        };
    });

    const fileInputRefs = {
        mainImage: useRef<HTMLInputElement>(null),
        groomImage: useRef<HTMLInputElement>(null),
        brideImage: useRef<HTMLInputElement>(null),
        collageImage1: useRef<HTMLInputElement>(null),
        collageImage2: useRef<HTMLInputElement>(null),
        collageImage3: useRef<HTMLInputElement>(null),
        collageImage4: useRef<HTMLInputElement>(null),
        collageImage5: useRef<HTMLInputElement>(null),
        footerImage: useRef<HTMLInputElement>(null),
        footerGridImage1: useRef<HTMLInputElement>(null),
        footerGridImage2: useRef<HTMLInputElement>(null),
        footerGridImage3: useRef<HTMLInputElement>(null),
        footerGridImage4: useRef<HTMLInputElement>(null),
        bottomImage: useRef<HTMLInputElement>(null),
    };

    const handleImageChange = async (key: keyof Images, position: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log(`File selected for ${key}:`, file);

        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: { url: '', position, fileName: undefined },
                };
                try {
                    localStorage.setItem(`weddingImages${templateId}`, JSON.stringify(newImages));
                    console.log(`Đã xóa ${key} khỏi localStorage`, newImages);
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
            console.log('Auth params lấy thành công:', authParams);
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

            console.log(`Bắt đầu upload ${key} với fileName: ${standardizedFileName}, folder: ${folderPath}`);
            const uploadResponse = await imagekit.upload({
                file,
                fileName: standardizedFileName,
                folder: folderPath,
                token: authParams.token,
                expire: authParams.expire,
                signature: authParams.signature,
            });

            console.log('Upload response:', uploadResponse);
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
                    console.log(`Đã lưu ${key} vào localStorage`, newImages);
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
        console.log(`Triggered file input for ${key}`);
    };

    // Countdown logic
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 100 });

        const updateCountdown = () => {
            const now = new Date('2025-06-20T14:01:00+07:00'); // Updated to current time
            const weddingDateTime = weddingData.weddingDate
                ? new Date(
                      weddingData.weddingDate.getFullYear(),
                      weddingData.weddingDate.getMonth(),
                      weddingData.weddingDate.getDate(),
                      parseInt(weddingData.weddingTime.split(':')[0]) || 11,
                      parseInt(weddingData.weddingTime.split(':')[1]) || 0,
                      0
                  )
                : new Date(2025, 11, 23, 11, 0, 0);
            const timeDiff = weddingDateTime.getTime() - now.getTime();

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
            clearInterval(interval);
            AOS.refresh();
        };
    }, [templateId, weddingData.weddingDate, weddingData.weddingTime]);

    // Generate calendar data
    const weddingDate = weddingData.weddingDate || new Date(2025, 11, 23);
    const daysInMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), 1).getDay();
    const daysInMonthArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array(firstDayOfMonth).fill(null);

    useEffect(() => {
        console.log('Images state updated:', images);
    }, [images]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.template5}>
                <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                <div className={styles.wrapper}>
                    <div className={styles.saveTheDate} data-aos="fade-up">
                        <div className={styles.saveTheDate_wrapper}>
                            <div className={styles.img_std}>
                                <Image src="/images/std/img_std.png" alt="Save the Date" width={200} height={100} />
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
                                Thân mời Quý Khách tới tham dự
                                <br />
                                Lễ Thành Hôn của hai chúng tôi
                            </p>
                            <p className={styles.at}>Vào lúc {formatTime(weddingData.weddingTime)}</p>
                            <div className={styles.dateBox}>
                                <div>{formatDayOfWeek(weddingData.weddingDate)}</div>
                                <div className={styles.day}>
                                    NGÀY
                                    <br />
                                    <strong>{weddingData.weddingDate?.getDate() || 23}</strong>
                                </div>
                                <div>
                                    THÁNG
                                    <br />
                                    {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 12}
                                </div>
                            </div>
                            <p className={styles.year}>Năm {weddingData.weddingDate?.getFullYear() || 2025}</p>
                            <p className={styles.lunarDay}>(Tức {weddingData.lunarDay})</p>
                            <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                        </div>
                    </div>
                    <div className={styles.groom} data-aos="fade-up">
                        <div className={styles.wrapper_groom}>
                            <div className={styles.image_groom} data-aos="fade-right" data-aos-delay="400">
                                <Image
                                    src={images.groomImage.url || '/placeholder-image.png'}
                                    alt={images.groomImage.url ? 'Ảnh chú rể' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('groomImage')}
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
                            <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="800">
                                <p>Chú Rể</p>
                                <h3>{weddingData.groom}</h3>
                            </div>
                        </div>
                        <div className={styles.groom_str} data-aos="fade-up" data-aos-delay="1200">
                            <p>{weddingData.groomStory}</p>
                        </div>
                    </div>
                    <div className={styles.bride} data-aos="fade-up">
                        <div className={styles.wrapper_bride}>
                            <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="800">
                                <p>Cô dâu</p>
                                <h3>{weddingData.bride}</h3>
                            </div>
                            <div className={styles.image_bride} data-aos="fade-left" data-aos-delay="400">
                                <Image
                                    src={images.brideImage.url || '/placeholder-image.png'}
                                    alt={images.brideImage.url ? 'Ảnh cô dâu' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('brideImage')}
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
                        </div>
                        <div className={styles.bride_str} data-aos="fade-up" data-aos-delay="1200">
                            <p>{weddingData.brideStory}</p>
                        </div>
                    </div>
                    
                    <div className={styles.calendar} data-aos="fade-up">
                        <div className={styles.imageMainCalendar} data-aos="fade-down" data-aos-delay="400">
                            <Image
                                src={images.mainImage.url || '/images/m5/placeholder-image.png'}
                                alt={images.mainImage.url ? 'Ảnh chính' : 'Chọn ảnh'}
                                width={300}
                                height={200}
                                className={images.mainImage.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                                onClick={() => triggerFileInput('mainImage')}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.mainImage}
                                onChange={(e) => handleImageChange('mainImage', 'main', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.calendar_wrapper} onClick={() => triggerFileInput('mainImage')}>
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
                                <span>
                                    Tháng {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 12},{' '}
                                    {weddingData.weddingDate?.getFullYear() || 2025}
                                </span>
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
                                        className={`${styles.calendar_day} ${day === weddingData.weddingDate?.getDate() ? styles.wedding_day : ''}`}
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
                    <div className={styles.collage} data-aos="fade-up">
                        <div className={styles.collage_left}>
                            <div className={styles.img1} data-aos="fade-down" data-aos-delay="400">
                                <Image
                                    src={images.collageImage1.url || '/placeholder-image.png'}
                                    alt={images.collageImage1.url ? 'Ảnh 1' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('collageImage1')}
                                    className={images.collageImage1.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.collageImage1}
                                    onChange={(e) => handleImageChange('collageImage1', 'collage1', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div className={styles.img2} data-aos="fade-right" data-aos-delay="600">
                                <Image
                                    src={images.collageImage2.url || '/placeholder-image.png'}
                                    alt={images.collageImage2.url ? 'Ảnh 2' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('collageImage2')}
                                    className={images.collageImage2.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.collageImage2}
                                    onChange={(e) => handleImageChange('collageImage2', 'collage2', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div className={styles.img3} data-aos="fade-up" data-aos-delay="800">
                                <Image
                                    src={images.collageImage3.url || '/placeholder-image.png'}
                                    alt={images.collageImage3.url ? 'Ảnh 3' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('collageImage3')}
                                    className={images.collageImage3.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.collageImage3}
                                    onChange={(e) => handleImageChange('collageImage3', 'collage3', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                        <div className={styles.collage_right}>
                            <div className={styles.img4} data-aos="fade-left" data-aos-delay="800">
                                <Image
                                    src={images.collageImage4.url || '/placeholder-image.png'}
                                    alt={images.collageImage4.url ? 'Ảnh 4' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('collageImage4')}
                                    className={images.collageImage4.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.collageImage4}
                                    onChange={(e) => handleImageChange('collageImage4', 'collage4', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div className={styles.img5} data-aos="fade-left" data-aos-delay="900">
                                <Image
                                    src={images.collageImage5.url || '/placeholder-image.png'}
                                    alt={images.collageImage5.url ? 'Ảnh 5' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('collageImage5')}
                                    className={images.collageImage5.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.collageImage5}
                                    onChange={(e) => handleImageChange('collageImage5', 'collage5', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.footer} data-aos="fade-up" data-aos-delay="1400">
                       
                    </div>
                    <div className={styles.footer_image} data-aos="fade-up">
                        <div className={styles.image_ft}>
                            <Image
                                src={images.footerImage.url || '/placeholder-image.png'}
                                alt={images.footerImage.url ? 'Ảnh chân trang' : 'Chọn ảnh'}
                                width={300}
                                height={200}
                                onClick={() => triggerFileInput('footerImage')}
                                className={images.footerImage.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.footerImage}
                                onChange={(e) => handleImageChange('footerImage', 'footer', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.wrapper_ft__grid}>
                            <div className={styles.column}>
                                <div className={styles.image_grid}>
                                    <Image
                                        src={images.footerGridImage1.url || '/placeholder-image.png'}
                                        alt={images.footerGridImage1.url ? 'Ảnh lưới 1' : 'Chọn ảnh'}
                                        width={150}
                                        height={150}
                                        onClick={() => triggerFileInput('footerGridImage1')}
                                        className={images.footerGridImage1.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.footerGridImage1}
                                        onChange={(e) => handleImageChange('footerGridImage1', 'footerGrid1', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <Image
                                        src={images.footerGridImage2.url || '/placeholder-image.png'}
                                        alt={images.footerGridImage2.url ? 'Ảnh lưới 2' : 'Chọn ảnh'}
                                        width={150}
                                        height={150}
                                        onClick={() => triggerFileInput('footerGridImage2')}
                                        className={images.footerGridImage2.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.footerGridImage2}
                                        onChange={(e) => handleImageChange('footerGridImage2', 'footerGrid2', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className={styles.column_text}>
                                <h3>Thank You</h3>
                                <span className={styles.subtext}>
                                    Cảm ơn Quý Khách vì đã trở thành một phần quan trọng trong ngày đặc biệt của chúng
                                    tôi.
                                </span>
                                <span className={styles.details}>
                                    {weddingData.groom} & {weddingData.bride}
                                </span>
                            </div>
                            <div className={styles.column}>
                                <div className={styles.image_grid}>
                                    <Image
                                        src={images.footerGridImage3.url || '/placeholder-image.png'}
                                        alt={images.footerGridImage3.url ? 'Ảnh lưới 3' : 'Chọn ảnh'}
                                        width={150}
                                        height={150}
                                        onClick={() => triggerFileInput('footerGridImage3')}
                                        className={images.footerGridImage3.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.footerGridImage3}
                                        onChange={(e) => handleImageChange('footerGridImage3', 'footerGrid3', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <Image
                                        src={images.footerGridImage4.url || '/placeholder-image.png'}
                                        alt={images.footerGridImage4.url ? 'Ảnh lưới 4' : 'Chọn ảnh'}
                                        width={150}
                                        height={150}
                                        onClick={() => triggerFileInput('footerGridImage4')}
                                        className={images.footerGridImage4.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.footerGridImage4}
                                        onChange={(e) => handleImageChange('footerGridImage4', 'footerGrid4', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.bottom_image}>
                            <Image
                                src={images.bottomImage.url || '/placeholder-image.png'}
                                alt={images.bottomImage.url ? 'Ảnh cuối trang' : 'Chọn ảnh'}
                                width={300}
                                height={200}
                                onClick={() => triggerFileInput('bottomImage')}
                                className={images.bottomImage.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.bottomImage}
                                onChange={(e) => handleImageChange('bottomImage', 'bottom', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
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
                                    height="450"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            ) : (
                                <div>Lỗi tải bản đồ nhà trai. Vui lòng kiểm tra tọa độ.</div>
                            )}
                            <div className={styles.content_groom}>
                                <div className={styles.wrapper_groom}>
                                    <div className={styles.groom_name}>
                                        <p>Chú Rể</p>
                                        <h3>{weddingData.groom}</h3>
                                    </div>
                                    <div className={styles.image_groom}>
                                        <Image
                                            src={images.groomImage.url || '/placeholder-image.png'}
                                            alt={images.groomImage.url ? 'Ảnh chú rể' : 'Chọn ảnh'}
                                            width={200}
                                            height={200}
                                            onClick={() => triggerFileInput('groomImage')}
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
                                </div>
                            </div>
                        </div>
                        <div className={styles.locaion_bride}>
                            {weddingData.brideMapUrl ? (
                                <iframe
                                    src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                    width="100%"
                                    height="450"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            ) : (
                                <div>Lỗi tải bản đồ nhà gái. Vui lòng kiểm tra tọa độ.</div>
                            )}
                            <div className={styles.content_bride}>
                                <div className={styles.wrapper_bride}>
                                    <div className={styles.bride_name}>
                                        <p>Cô dâu</p>
                                        <h3>{weddingData.bride}</h3>
                                    </div>
                                    <div className={styles.image_bride}>
                                        <Image
                                            src={images.brideImage.url || '/placeholder-image.png'}
                                            alt={images.brideImage.url ? 'Ảnh cô dâu' : 'Chọn ảnh'}
                                            width={200}
                                            height={200}
                                            onClick={() => triggerFileInput('brideImage')}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Template5Edit;
