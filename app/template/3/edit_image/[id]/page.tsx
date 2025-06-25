'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import styles from '../../3.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
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
    flexImage1: { url: string; position: string; fileName?: string };
    flexImage2: { url: string; position: string; fileName?: string };
    flexImage3: { url: string; position: string; fileName?: string };
    galleryImage1: { url: string; position: string; fileName?: string };
    galleryImage2: { url: string; position: string; fileName?: string };
    galleryImage3: { url: string; position: string; fileName?: string };
    galleryImage4: { url: string; position: string; fileName?: string };
    galleryImage5: { url: string; position: string; fileName?: string };
    galleryImage6: { url: string; position: string; fileName?: string };
    footerImage: { url: string; position: string; fileName?: string };
}

const defaultImages: Images = {
    mainImage: { url: '/images/m3/placeholder-image.png', position: 'main' },
    flexImage1: { url: '/images/m3/placeholder-image.png', position: 'flex1' },
    flexImage2: { url: '/images/m3/placeholder-image.png', position: 'flex2' },
    flexImage3: { url: '/images/m3/placeholder-image.png', position: 'flex3' },
    galleryImage1: { url: '/images/m3/placeholder-image.png', position: 'gallery1' },
    galleryImage2: { url: '/images/m3/placeholder-image.png', position: 'gallery2' },
    galleryImage3: { url: '/images/m3/placeholder-image.png', position: 'gallery3' },
    galleryImage4: { url: '/images/m3/placeholder-image.png', position: 'gallery4' },
    galleryImage5: { url: '/images/m3/placeholder-image.png', position: 'gallery5' },
    galleryImage6: { url: '/images/m3/placeholder-image.png', position: 'gallery6' },
    footerImage: { url: '/images/m3/placeholder-image.png', position: 'footer' },
};

function Template3Edit() {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const quantity = parseInt(searchParams.get('quantity') || '1');
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);

    // Parse weddingDate from localStorage string to Date | null
    const parseWeddingDate = (dateStr: string | Date | null): Date | null => {
        if (typeof dateStr === 'string' && dateStr.trim()) {
            const [day, month, year] = dateStr.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    };

    // Format Date to DD/MM/YYYY
    const formatDateToDDMMYYYY = (date: Date | null): string => {
        if (!date) return '06/06/2025';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Format Day of Week
    const formatDayOfWeek = (date: Date | null): string => {
        if (!date) return 'FRIDAY';
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        return days[date.getDay()];
    };

    // Function to generate Google Maps embed URL from coordinates in (latitude,longitude) format
    const getMapEmbedUrlFromCoords = (coords: string): string => {
        if (!coords) return '';

        // Match coordinates in the format (latitude,longitude)
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

        // Construct a simpler Embed API URL with a pin at the coordinates
        return `https://www.google.com/maps/embed/v1/place?key=${apiMapKey}&q=${lat},${lng}&zoom=15`;
    };

    const defaultWeddingData: TemplateWeddingData = {
        bride: '',
        groom: '',
        weddingDate: new Date(2025, 5, 6),
        weddingTime: '',
        weddingDayOfWeek: '',
        lunarDay: '',
        familyGroom: { father: '', mother: '' },
        familyBride: { father: '', mother: '' },
        brideStory: '',
        groomStory: '',
        groomAddress: '',
        brideAddress: '',
        groomMapUrl: '', // Default coordinates for Thủ Đức
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
                    mainImage: parsedImages.mainImage || defaultImages.mainImage,
                    flexImage1: parsedImages.flexImage1 || defaultImages.flexImage1,
                    flexImage2: parsedImages.flexImage2 || defaultImages.flexImage2,
                    flexImage3: parsedImages.flexImage3 || defaultImages.flexImage3,
                    galleryImage1: parsedImages.galleryImage1 || defaultImages.galleryImage1,
                    galleryImage2: parsedImages.galleryImage2 || defaultImages.galleryImage2,
                    galleryImage3: parsedImages.galleryImage3 || defaultImages.galleryImage3,
                    galleryImage4: parsedImages.galleryImage4 || defaultImages.galleryImage4,
                    galleryImage5: parsedImages.galleryImage5 || defaultImages.galleryImage5,
                    galleryImage6: parsedImages.galleryImage6 || defaultImages.galleryImage6,
                    footerImage: parsedImages.footerImage || defaultImages.footerImage,
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
        flexImage1: useRef<HTMLInputElement>(null),
        flexImage2: useRef<HTMLInputElement>(null),
        flexImage3: useRef<HTMLInputElement>(null),
        galleryImage1: useRef<HTMLInputElement>(null),
        galleryImage2: useRef<HTMLInputElement>(null),
        galleryImage3: useRef<HTMLInputElement>(null),
        galleryImage4: useRef<HTMLInputElement>(null),
        galleryImage5: useRef<HTMLInputElement>(null),
        galleryImage6: useRef<HTMLInputElement>(null),
        footerImage: useRef<HTMLInputElement>(null),
    };

    const handleImageChange = async (key: keyof Images, position: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: { url: defaultImages[key].url, position, fileName: undefined },
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

        let authParams;
        try {
            authParams = await fetchAuthParams();
        } catch {
            showToastError('Không thể kết nối với ImageKit. Vui lòng thử lại.');
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
                return [...updatedFiles, { file: standardizedFile, position }];
            });

            setImages((prev: Images) => {
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
        } catch {
            showToastError('Lỗi khi tải ảnh lên ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi tải ảnh lên ImageKit:', key, position);
        }
        e.target.value = '';
    };

    const triggerFileInput = (key: keyof typeof fileInputRefs) => fileInputRefs[key].current?.click();

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
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
    }, [templateId]);

    // Generate calendar data
    const weddingDate = weddingData.weddingDate || new Date(2025, 5, 6);
    const daysInMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), 1).getDay();
    const daysInMonthArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.template3}>
                <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                <div className={styles.header} data-aos="fade-up">
                    <div className={styles.flower_left} data-aos="fade-right" data-aos-delay="200">
                        <Image src="/images/m3/t1.png" alt="Flower decoration left" width={100} height={100} />
                    </div>
                    <div className={styles.flower_right} data-aos="fade-left" data-aos-delay="200">
                        <Image src="/images/m3/t1.png" alt="Flower decoration right" width={100} height={100} />
                    </div>
                    <div className={styles.header_content}>
                        <h4 data-aos="zoom-in" data-aos-delay="300">
                            Save the Date
                        </h4>
                        <div className={styles.imageMain} data-aos="fade-up" data-aos-delay="600">
                            <Image
                                src={images.mainImage.url || '/placeholder.png'}
                                alt="Chọn ảnh"
                                width={300}
                                height={300}
                                onClick={() => triggerFileInput('mainImage')}
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
                        <div className={styles.groom_bride} data-aos="fade-up" data-aos-delay="400">
                            <h3>
                                {weddingData.groom} & {weddingData.bride}
                            </h3>
                        </div>
                        <div className={styles.invitation_details} data-aos="fade-up" data-aos-delay="500">
                            <p>WE INVITE YOU TO JOIN OUR WEDDING CEREMONY ON</p>
                            <p className={styles.date_time}>
                                <span>{formatDayOfWeek(weddingData.weddingDate)}</span>
                                <span>{formatDateToDDMMYYYY(weddingData.weddingDate)}</span>
                                <span>AT {weddingData.weddingTime}</span>
                            </p>
                            <p className={styles.year}>
                                {weddingData.weddingDate ? weddingData.weddingDate.getFullYear() : '2025'}
                            </p>
                            <div className={styles.location}>
                                <p style={{ display: 'none' }}>{weddingData.groomAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.info_groom_bride} data-aos="fade-up">
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
                    <div className={styles.mar} data-aos="fade-up" data-aos-delay="300">
                        <div className={styles.groom_name}>{weddingData.groom}</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>{weddingData.bride}</div>
                    </div>
                    <div className={styles.best_regards} data-aos="fade-up" data-aos-delay="400">
                        Trân trọng kính mời
                    </div>
                    <div className={styles.text} data-aos="fade-up" data-aos-delay="500">
                        Đến dự buổi tiệc chung vui cùng gia đình chúng tôi
                    </div>

                    <div className={styles.flex_image} data-aos="fade-up" data-aos-delay="600">
                        <div className={styles.image_1}>
                            <Image
                                src={images.flexImage1.url || '/placeholder.png'}
                                alt="Chọn ảnh"
                                width={150}
                                height={150}
                                onClick={() => triggerFileInput('flexImage1')}
                                className={images.flexImage1.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.flexImage1}
                                onChange={(e) => handleImageChange('flexImage1', 'flex1', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.image_2}>
                            <Image
                                src={images.flexImage2.url || '/placeholder.png'}
                                alt="Chọn ảnh"
                                width={150}
                                height={150}
                                onClick={() => triggerFileInput('flexImage2')}
                                className={images.flexImage2.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.flexImage2}
                                onChange={(e) => handleImageChange('flexImage2', 'flex2', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.image_3}>
                            <Image
                                src={images.flexImage3.url || '/placeholder.png'}
                                alt="Chọn ảnh"
                                width={150}
                                height={150}
                                onClick={() => triggerFileInput('flexImage3')}
                                className={images.flexImage3.url ? '' : styles.imagePlaceholder}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                ref={fileInputRefs.flexImage3}
                                onChange={(e) => handleImageChange('flexImage3', 'flex3', e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className={styles.specifically} data-aos="fade-up" data-aos-delay="700">
                        <div className={styles.time_specifically}>
                            <span className={styles.time}>Thời Gian: {weddingData.weddingTime}</span>
                            <span className={styles.day_specifically}>{weddingData.weddingDayOfWeek}</span>
                        </div>
                        <div className={styles.date_specifically}>{formatDateToDDMMYYYY(weddingData.weddingDate)}</div>
                        <div className={styles.dateLunar_specifically}>(Tức ngày {weddingData.lunarDay})</div>
                        <div className={styles.calendar}>
                            <Image
                                src={images.mainImage.url || '/placeholder.png'}
                                alt="Chọn ảnh"
                                className={`${styles.calendarBackground} ${images.mainImage.url ? '' : styles.imagePlaceholder}`}
                                width={300}
                                height={300}
                            />
                            <div className={styles.calendarHeader}>
                                Tháng {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : '6'},{' '}
                                {weddingData.weddingDate ? weddingData.weddingDate.getFullYear() : '2025'}
                            </div>
                            <div className={styles.calendarGrid}>
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                    <div key={day} className={styles.calendarDayHeader}>
                                        {day}
                                    </div>
                                ))}
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                    <div key={`empty-${i}`} className={styles.calendarEmpty}></div>
                                ))}
                                {daysInMonthArray.map((day) => (
                                    <div
                                        key={day}
                                        className={`${styles.calendarDay} ${day === weddingData.weddingDate?.getDate() ? styles.selectedDay : ''}`}
                                    >
                                        {day}
                                        {day === weddingData.weddingDate?.getDate() && (
                                            <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.locations} data-aos="fade-up" data-aos-delay="800">
                        <div className={styles.organization_location_groom} data-aos="fade-right" data-aos-delay="200">
                            <div className={styles.text_organization__location}>
                                <h4>Địa điểm tổ chức nhà trai</h4>
                                <span>{weddingData.groomAddress}</span>
                            </div>
                            <div className={styles.map_organization__location}>
                                {weddingData.groomMapUrl ? (
                                    <iframe
                                        src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                        width="300"
                                        height="200"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                ) : (
                                    <div>Lỗi tải bản đồ nhà trai. Vui lòng kiểm tra tọa độ.</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.organization_location_bride} data-aos="fade-left" data-aos-delay="300">
                            <div className={styles.map_organization__location}>
                                {weddingData.brideMapUrl ? (
                                    <iframe
                                        src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                        width="300"
                                        height="200"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                ) : (
                                    <div>Lỗi tải bản đồ nhà gái. Vui lòng kiểm tra tọa độ.</div>
                                )}
                            </div>
                            <div className={styles.text_organization__location}>
                                <h4>Địa điểm tổ chức nhà gái</h4>
                                <span>{weddingData.brideAddress}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.album_story} data-aos="fade-up" data-aos-delay="900">
                        <h3 data-aos="zoom-in" data-aos-delay="200">
                            Album ảnh
                        </h3>
                        <div className={styles.wrapper_album}>
                            <div data-aos="fade-left" data-aos-delay="300">
                                <Image
                                    src={images.galleryImage1.url || '/placeholder.png'}
                                    alt="Chọn ảnh"
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('galleryImage1')}
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
                            <div data-aos="fade-right" data-aos-delay="400">
                                <Image
                                    src={images.galleryImage2.url || '/placeholder.png'}
                                    alt="Chọn ảnh"
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('galleryImage2')}
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
                            <div data-aos="fade-right" data-aos-delay="500">
                                <Image
                                    src={images.galleryImage3.url || '/placeholder.png'}
                                    alt="Chọn ảnh"
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('galleryImage3')}
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
                            <div data-aos="fade-left" data-aos-delay="600">
                                <Image
                                    src={images.galleryImage4.url || '/placeholder.png'}
                                    alt="Chọn ảnh"
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('galleryImage4')}
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
                            <div data-aos="fade-up" data-aos-delay="700">
                                <Image
                                    src={images.galleryImage5.url || '/placeholder.png'}
                                    alt="Chọn ảnh"
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('galleryImage5')}
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
                            <div data-aos="fade-up" data-aos-delay="700">
                                <Image
                                    src={images.galleryImage6.url || '/placeholder.png'}
                                    alt="Chọn ảnh"
                                    width={200}
                                    height={200}
                                    onClick={() => triggerFileInput('galleryImage6')}
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
                        </div>
                    </div>

                    <div className={styles.footer_thanks}>
                        <div className={styles.image_footer} data-aos="fade-up" data-aos-delay="300">
                            <Image
                                src={images.footerImage.url || '/placeholder.png'}
                                alt="Chọn ảnh"
                                width={300}
                                height={300}
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
                            <div className={styles.content}>
                                <span data-aos="fade-left" data-aos-delay="600">
                                    Rất hân hạnh được đón tiếp
                                </span>
                                <h3 data-aos="fade-right" data-aos-delay="900">
                                    Thanks You
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Template3Edit;
