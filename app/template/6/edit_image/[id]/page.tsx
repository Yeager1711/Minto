'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faChevronRight, faHeart } from '@fortawesome/free-solid-svg-icons';
import styles from '../../6.module.css';
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
    photo1: { url: string; position: string; fileName?: string };
    photo2: { url: string; position: string; fileName?: string };
    photo3: { url: string; position: string; fileName?: string };
    loveImage1: { url: string; position: string; fileName?: string };
    loveImage2: { url: string; position: string; fileName?: string };
    loveImage3: { url: string; position: string; fileName?: string };
    collageImage1: { url: string; position: string; fileName?: string };
    collageImage2: { url: string; position: string; fileName?: string };
    collageImage3: { url: string; position: string; fileName?: string };
    collageImage4: { url: string; position: string; fileName?: string };
    collageImage5: { url: string; position: string; fileName?: string };
    collageImage6: { url: string; position: string; fileName?: string };
}

function Template6Edit() {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity] = useState(parseInt(searchParams.get('quantity') || '1'));
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);
    const [isMapActive, setIsMapActive] = useState(false);
    const [mapType, setMapType] = useState<'groom' | 'bride' | null>(null);

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
        if (!date) return 'Chủ Nhật';
        const days = ['Chủ Nhật', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
        return days[date.getDay()];
    };

    // Format Time to HH:MM
    const formatTime = (time: string): string => {
        if (!time) return '10:00';
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

        return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15&maptype=satellite`;
    };

    const defaultWeddingData: TemplateWeddingData = {
        bride: 'Ngọc Khánh',
        groom: 'Việt Anh',
        weddingDate: new Date(2025, 7, 17),
        weddingTime: '10:00',
        weddingDayOfWeek: 'Chủ Nhật',
        lunarDay: '24 tháng 06 năm ất tỵ',
        familyGroom: { father: 'Nguyễn Văn A', mother: 'Trần Thị B' },
        familyBride: { father: 'Lê Văn C', mother: 'Phạm Thị D' },
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
                    mainImage: parsedImages.mainImage || { url: '/images/m6/choose_img.png', position: 'main' },
                    groomImage: parsedImages.groomImage || { url: '/images/m6/choose_img.png', position: 'groom' },
                    brideImage: parsedImages.brideImage || { url: '/images/m6/choose_img.png', position: 'bride' },
                    photo1: parsedImages.photo1 || { url: '/images/m6/choose_img.png', position: 'photo1' },
                    photo2: parsedImages.photo2 || { url: '/images/m6/choose_img.png', position: 'photo2' },
                    photo3: parsedImages.photo3 || { url: '/images/m6/choose_img.png', position: 'photo3' },
                    loveImage1: parsedImages.loveImage1 || { url: '/images/m6/choose_img.png', position: 'love1' },
                    loveImage2: parsedImages.loveImage2 || { url: '/images/m6/choose_img.png', position: 'love2' },
                    loveImage3: parsedImages.loveImage3 || { url: '/images/m6/choose_img.png', position: 'love3' },
                    collageImage1: parsedImages.collageImage1 || {
                        url: '/images/m6/choose_img.png',
                        position: 'collage1',
                    },
                    collageImage2: parsedImages.collageImage2 || {
                        url: '/images/m6/choose_img.png',
                        position: 'collage2',
                    },
                    collageImage3: parsedImages.collageImage3 || {
                        url: '/images/m6/choose_img.png',
                        position: 'collage3',
                    },
                    collageImage4: parsedImages.collageImage4 || {
                        url: '/images/m6/choose_img.png',
                        position: 'collage4',
                    },
                    collageImage5: parsedImages.collageImage5 || {
                        url: '/images/m6/choose_img.png',
                        position: 'collage5',
                    },
                    collageImage6: parsedImages.collageImage6 || {
                        url: '/images/m6/choose_img.png',
                        position: 'collage6',
                    },
                };
            } catch (e) {
                console.error('Failed to parse weddingImages from localStorage:', e);
            }
        }
        return {
            mainImage: { url: '/images/m6/choose_img.png', position: 'main' },
            groomImage: { url: '/images/m6/choose_img.png', position: 'groom' },
            brideImage: { url: '/images/m6/choose_img.png', position: 'bride' },
            photo1: { url: '/images/m6/choose_img.png', position: 'photo1' },
            photo2: { url: '/images/m6/choose_img.png', position: 'photo2' },
            photo3: { url: '/images/m6/choose_img.png', position: 'photo3' },
            loveImage1: { url: '/images/m6/choose_img.png', position: 'love1' },
            loveImage2: { url: '/images/m6/choose_img.png', position: 'love2' },
            loveImage3: { url: '/images/m6/choose_img.png', position: 'love3' },
            collageImage1: { url: '/images/m6/choose_img.png', position: 'collage1' },
            collageImage2: { url: '/images/m6/choose_img.png', position: 'collage2' },
            collageImage3: { url: '/images/m6/choose_img.png', position: 'collage3' },
            collageImage4: { url: '/images/m6/choose_img.png', position: 'collage4' },
            collageImage5: { url: '/images/m6/choose_img.png', position: 'collage5' },
            collageImage6: { url: '/images/m6/choose_img.png', position: 'collage6' },
        };
    });

    const fileInputRefs = {
        mainImage: useRef<HTMLInputElement>(null),
        groomImage: useRef<HTMLInputElement>(null),
        brideImage: useRef<HTMLInputElement>(null),
        photo1: useRef<HTMLInputElement>(null),
        photo2: useRef<HTMLInputElement>(null),
        photo3: useRef<HTMLInputElement>(null),
        loveImage1: useRef<HTMLInputElement>(null),
        loveImage2: useRef<HTMLInputElement>(null),
        loveImage3: useRef<HTMLInputElement>(null),
        collageImage1: useRef<HTMLInputElement>(null),
        collageImage2: useRef<HTMLInputElement>(null),
        collageImage3: useRef<HTMLInputElement>(null),
        collageImage4: useRef<HTMLInputElement>(null),
        collageImage5: useRef<HTMLInputElement>(null),
        collageImage6: useRef<HTMLInputElement>(null),
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

            console.log(`Bắt đầu upload ${key} với fileName: ${standardizedFileName}, library: ${folderPath}`);
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

    // Calendar logic
    const weddingDate = weddingData.weddingDate || new Date(2025, 7, 17);
    const daysInMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array(firstDayOfMonth).fill(null);

    useEffect(() => {
        console.log('Images state updated:', images);
    }, [images]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.template6}>
                <div className={styles.wrapper}>
                    <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                    <div className={styles.mainImage} onClick={() => triggerFileInput('mainImage')}>
                        <Image
                            src={images.mainImage.url || ''}
                            alt={images.mainImage.url ? 'Ảnh chính' : 'Chọn ảnh'}
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
                        <div className={styles.overlay}>
                            <div className={styles.content}>
                                <div className={styles.saveTheDate} data-aos="fade-in" data-aos-delay="200">
                                    Save the Date
                                </div>
                                <div className={styles.weddingOf} data-aos="fade-up" data-aos-delay="400">
                                    THE WEDDING OF
                                </div>
                                <div className={styles.names}>
                                    <div className={styles.names_flex}>
                                        <div data-aos="fade-right" data-aos-delay="600">
                                            {weddingData.groom}
                                        </div>
                                        <div className={styles.and} data-aos="fade-in" data-aos-delay="600">
                                            &
                                        </div>
                                        <div data-aos="fade-left" data-aos-delay="600">
                                            {weddingData.bride}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.dateTime} data-aos="fade-up" data-aos-delay="800">
                                    {weddingData.weddingDate?.getDate() || 17} Tháng{' '}
                                    {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 8},{' '}
                                    {weddingData.weddingDate?.getFullYear() || 2025} |{' '}
                                    {formatDayOfWeek(weddingData.weddingDate)}, Lúc:{' '}
                                    {formatTime(weddingData.weddingTime)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.info_family}>
                        <div className={styles.flex_representative}>
                            <div className={styles.representative_house} data-aos="fade-right" data-aos-delay="300">
                                <span>Nhà trai</span>
                                <h3>Ông: {weddingData.familyGroom.father}</h3>
                                <h3>Bà: {weddingData.familyGroom.mother}</h3>
                            </div>
                            <div className={styles.representative_house} data-aos="fade-left" data-aos-delay="300">
                                <span>Nhà gái</span>
                                <h3>Ông: {weddingData.familyBride.father}</h3>
                                <h3>Bà: {weddingData.familyBride.mother}</h3>
                            </div>
                        </div>

                        <div className={styles.name_groom__bride}>
                            <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="500">
                                {weddingData.groom}
                            </div>
                            <div className={styles.image_happy} data-aos="fade-in" data-aos-delay="500">
                                <Image src="/images/m6/happy_img.png" alt="Happy" width={100} height={100} />
                            </div>
                            <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="500">
                                {weddingData.bride}
                            </div>
                        </div>

                        <p className={styles.text} data-aos="fade-up" data-aos-delay="600">
                            Trân trọng kính mời Quý Khách
                            <br />
                            Đến dự Lễ Thành Hôn của hai con chúng tôi
                        </p>

                        <div className={styles.flex_info_map}>
                            <div className={styles.flex}>
                                <div className={styles.flex_left} data-aos="fade-right" data-aos-delay="300">
                                    <p className={styles.at}>Lúc {formatTime(weddingData.weddingTime)}</p>
                                    <div className={styles.dateBox}>
                                        <div>{formatDayOfWeek(weddingData.weddingDate)}</div>
                                        <div className={styles.day}>
                                            <strong>{weddingData.weddingDate?.getDate() || 17}</strong>
                                        </div>
                                        <div className={styles.month}>
                                            <strong>
                                                {weddingData.weddingDate
                                                    ? (weddingData.weddingDate.getMonth() + 1)
                                                          .toString()
                                                          .padStart(2, '0')
                                                    : '08'}
                                            </strong>
                                        </div>
                                    </div>
                                    <p className={styles.year}>
                                        <strong>{weddingData.weddingDate?.getFullYear() || 2025}</strong>
                                    </p>
                                </div>

                                <div className={styles.flex_right} data-aos="fade-left" data-aos-delay="500">
                                    <div className={styles.info}>
                                        <div className={styles.address_groom}>
                                            <h3>Địa chỉ nhà Trai</h3>
                                            <p>{weddingData.groomAddress}</p>
                                            <button
                                                className={styles.btn_location}
                                                onClick={() => {
                                                    setIsMapActive(true);
                                                    setMapType('groom');
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                            </button>
                                        </div>
                                        <div className={styles.address_bride}>
                                            <h3>Địa chỉ nhà Gái</h3>
                                            <p>{weddingData.brideAddress}</p>
                                            <button
                                                className={styles.btn_location}
                                                onClick={() => {
                                                    setIsMapActive(true);
                                                    setMapType('bride');
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.map} ${isMapActive ? styles.active : ''}`}>
                                <div className={styles.map_wrapper}>
                                    <div className={styles.btn_close} onClick={() => setIsMapActive(false)}>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </div>
                                    {mapType &&
                                        (weddingData[`${mapType}MapUrl`] ? (
                                            <iframe
                                                src={getMapEmbedUrlFromCoords(weddingData[`${mapType}MapUrl`])}
                                                width="100%"
                                                height="450"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        ) : (
                                            <div>{`Lỗi tải bản đồ nhà ${mapType === 'groom' ? 'trai' : 'gái'}. Vui lòng kiểm tra tọa độ.`}</div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.calendar} data-aos="fade-up" data-aos-delay="700">
                            <div className={styles.calendar_header}>
                                <h3>
                                    Tháng {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 8},{' '}
                                    {weddingData.weddingDate?.getFullYear() || 2025}
                                </h3>
                            </div>
                            <div className={styles.calendar_grid}>
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                    <div key={day} className={styles.calendar_day}>
                                        {day}
                                    </div>
                                ))}
                                {paddingDays.map((_, index) => (
                                    <div key={`pad-${index}`} className={styles.calendar_date}></div>
                                ))}
                                {days.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.calendar_date} ${
                                            day === weddingData.weddingDate?.getDate() ? styles.wedding_date : ''
                                        }`}
                                    >
                                        {day}
                                        {day === weddingData.weddingDate?.getDate() && (
                                            <FontAwesomeIcon icon={faHeart} className={styles.heart_icon} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className={styles.lunarDay} data-aos="fade-up" data-aos-delay="900">
                            (Nhằm {weddingData.lunarDay})
                        </p>
                        <p className={styles.note} data-aos="fade-up" data-aos-delay="1100">
                            Rất hân hạnh được đón tiếp!
                        </p>
                    </div>

                    <div className={styles.flex_photo}>
                        <div className={styles.box_photo}>
                            <Image
                                src={images.photo1.url || ''}
                                alt={images.photo1.url ? 'Ảnh 1' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                onClick={() => triggerFileInput('photo1')}
                                className={images.photo1.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                                data-aos="fade-right"
                                data-aos-delay="300"
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.photo1}
                                onChange={(e) => handleImageChange('photo1', 'photo1', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.box_photo}>
                            <Image
                                src={images.photo2.url || ''}
                                alt={images.photo2.url ? 'Ảnh 2' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                onClick={() => triggerFileInput('photo2')}
                                className={images.photo2.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                                data-aos="fade-in"
                                data-aos-delay="600"
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.photo2}
                                onChange={(e) => handleImageChange('photo2', 'photo2', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.box_photo}>
                            <Image
                                src={images.photo3.url || ''}
                                alt={images.photo3.url ? 'Ảnh 3' : 'Chọn ảnh'}
                                width={200}
                                height={200}
                                onClick={() => triggerFileInput('photo3')}
                                className={images.photo3.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                                data-aos="fade-left"
                                data-aos-delay="900"
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
                        <div className={styles.title} data-aos="fade-in" data-aos-delay="300">
                            <Image src="/images/m6/love_story.png" alt="Love Story" width={200} height={100} />
                        </div>

                        <div className={styles.groom}>
                            <div className={styles.wrapper_groom}>
                                <div className={styles.image_groom} data-aos="fade-right" data-aos-delay="300">
                                    <Image
                                        src={images.groomImage.url || ''}
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
                                <div className={styles.groom_name__story}>
                                    <p data-aos="fade-right" data-aos-delay="600">
                                        Chú Rể
                                    </p>
                                    <h3 data-aos="fade-right" data-aos-delay="900">
                                        {weddingData.groom}
                                    </h3>
                                </div>
                            </div>
                            <div className={styles.groom_str} data-aos="fade-up" data-aos-delay="1100">
                                <p>{weddingData.groomStory}</p>
                            </div>
                        </div>
                        <div className={styles.bride}>
                            <div className={styles.wrapper_bride}>
                                <div className={styles.bride_name__story}>
                                    <p data-aos="fade-left" data-aos-delay="600">
                                        Cô dâu
                                    </p>
                                    <h3 data-aos="fade-left" data-aos-delay="900">
                                        {weddingData.bride}
                                    </h3>
                                </div>
                                <div className={styles.image_bride} data-aos="fade-left" data-aos-delay="300">
                                    <Image
                                        src={images.brideImage.url || ''}
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
                            <div className={styles.bride_str} data-aos="fade-up" data-aos-delay="1100">
                                <p>{weddingData.brideStory}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.love_img}>
                        <div className={styles.flower_center}>
                            <Image src="/images/m6/flower_center.png" alt="Flower" width={150} height={150} />
                        </div>

                        <div className={styles.love_img__wrapper}>
                            <div className={styles.flex}>
                                <div className={styles.love_img__1} data-aos="fade-right" data-aos-delay="300">
                                    <Image
                                        src={images.loveImage1.url || ''}
                                        alt={images.loveImage1.url ? 'Ảnh 1' : 'Chọn ảnh'}
                                        width={200}
                                        height={200}
                                        onClick={() => triggerFileInput('loveImage1')}
                                        className={images.loveImage1.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.loveImage1}
                                        onChange={(e) => handleImageChange('loveImage1', 'love1', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className={styles.love_img__2} data-aos="fade-right" data-aos-delay="600">
                                    <Image
                                        src={images.loveImage2.url || ''}
                                        alt={images.loveImage2.url ? 'Ảnh 2' : 'Chọn ảnh'}
                                        width={200}
                                        height={200}
                                        onClick={() => triggerFileInput('loveImage2')}
                                        className={images.loveImage2.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.loveImage2}
                                        onChange={(e) => handleImageChange('loveImage2', 'love2', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className={styles.love_img__3} data-aos="fade-up" data-aos-delay="900">
                                <Image
                                    src={images.loveImage3.url || ''}
                                    alt={images.loveImage3.url ? 'Ảnh 3' : 'Chọn ảnh'}
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('loveImage3')}
                                    className={images.loveImage3.url ? '' : styles.imagePlaceholder}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.loveImage3}
                                    onChange={(e) => handleImageChange('loveImage3', 'love3', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.album_wedding}>
                        <div className={styles.title} data-aos="fade-in" data-aos-delay="300">
                            <Image
                                src="/images/m6/albumWedding_text.png"
                                alt="Album Wedding"
                                width={200}
                                height={100}
                            />
                        </div>

                        <div className={styles.wrapper_bg}>
                            <div className={styles.collage_left}>
                                <div className={styles.img1} data-aos="fade-up" data-aos-delay="300">
                                    <Image
                                        src={images.collageImage1.url || ''}
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
                                        src={images.collageImage2.url || ''}
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
                                <div className={styles.img3} data-aos="fade-up" data-aos-delay="900">
                                    <Image
                                        src={images.collageImage3.url || ''}
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
                                <div className={styles.img4} data-aos="fade-left" data-aos-delay="1100">
                                    <Image
                                        src={images.collageImage4.url || ''}
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
                                <div className={styles.img5} data-aos="fade-left" data-aos-delay="1400">
                                    <Image
                                        src={images.collageImage5.url || ''}
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
                                <div className={styles.img6} data-aos="fade-left" data-aos-delay="1700">
                                    <Image
                                        src={images.collageImage6.url || ''}
                                        alt={images.collageImage6.url ? 'Ảnh 6' : 'Chọn ảnh'}
                                        width={200}
                                        height={200}
                                        onClick={() => triggerFileInput('collageImage6')}
                                        className={images.collageImage6.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.collageImage6}
                                        onChange={(e) => handleImageChange('collageImage6', 'collage6', e)}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.column_text}>
                            <h3 data-aos="fade-up" data-aos-delay="1000">
                                Thank You
                            </h3>
                            <span className={styles.subtext} data-aos="fade-up" data-aos-delay="2000">
                                Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                                <br />
                                trong ngày đặc biệt của chúng tôi.
                            </span>
                        </div>
                        <img src="/images/m6/footer.png" alt="" />
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Template6Edit;
