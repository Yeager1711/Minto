'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import styles from '../../7.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { Suspense } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import imagekit from 'app/lib/imagekit/imagekit';
import { useApi } from '../../../../lib/apiContext/apiContext';
import { showToastError } from 'app/Ultils/toast';
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
    groomImage: { url: string; position: string; fileName?: string };
    brideImage: { url: string; position: string; fileName?: string };
    locationGroomImage: { url: string; position: string; fileName?: string };
    locationBrideImage: { url: string; position: string; fileName?: string };
    albumImage1: { url: string; position: string; fileName?: string };
    albumImage2: { url: string; position: string; fileName?: string };
    albumImage3: { url: string; position: string; fileName?: string };
    albumImage4: { url: string; position: string; fileName?: string };
    albumImage5: { url: string; position: string; fileName?: string };
    albumImage6: { url: string; position: string; fileName?: string };
    albumImage7: { url: string; position: string; fileName?: string };
}

function Template7Edit() {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [isLoading, setIsLoading] = useState(true);
    const [quantity] = useState(parseInt(searchParams.get('quantity') || '1'));
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);
    const [showGroomMap, setShowGroomMap] = useState(false);
    const [showBrideMap, setShowBrideMap] = useState(false);

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

    // Function to open Google Maps in a new tab
    const openMapInGoogle = (coords: string) => {
        const match = coords.match(/^\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/);
        if (!match) {
            showToastError('Tọa độ không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[3]);
        if (isNaN(lat) || isNaN(lng)) {
            showToastError('Tọa độ không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=vi`;
        window.open(mapUrl, '_blank');
    };

    const defaultWeddingData: TemplateWeddingData = {
        bride: 'Trúc Lam',
        groom: 'Nam Khánh',
        weddingDate: new Date(2025, 7, 17),
        weddingTime: '10:00',
        weddingDayOfWeek: 'Chủ Nhật',
        lunarDay: '24 tháng 06 năm ất tỵ',
        familyGroom: { father: 'Nguyễn Văn An', mother: 'Trần Thị Bảy' },
        familyBride: { father: 'Lê Văn Chung', mother: 'Phạm Thị Dung' },
        brideStory:
            'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
        groomStory:
            'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
        groomAddress: 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
        brideAddress: 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
        groomMapUrl: '(-37.82425,144.956)',
        brideMapUrl: '(-37.83333,144.96667)',
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
                    mainImage: parsedImages.mainImage || { url: '/images/m7/choose_img.png', position: 'main' },
                    groomImage: parsedImages.groomImage || { url: '/images/m7/choose_img.png', position: 'groom' },
                    brideImage: parsedImages.brideImage || { url: '/images/m7/choose_img.png', position: 'bride' },
                    locationGroomImage: parsedImages.locationGroomImage || {
                        url: '/images/m7/choose_img.png',
                        position: 'locationGroom',
                    },
                    locationBrideImage: parsedImages.locationBrideImage || {
                        url: '/images/m7/choose_img.png',
                        position: 'locationBride',
                    },
                    albumImage1: parsedImages.albumImage1 || { url: '/images/m7/choose_img.png', position: 'album1' },
                    albumImage2: parsedImages.albumImage2 || { url: '/images/m7/choose_img.png', position: 'album2' },
                    albumImage3: parsedImages.albumImage3 || { url: '/images/m7/choose_img.png', position: 'album3' },
                    albumImage4: parsedImages.albumImage4 || { url: '/images/m7/choose_img.png', position: 'album4' },
                    albumImage5: parsedImages.albumImage5 || { url: '/images/m7/choose_img.png', position: 'album5' },
                    albumImage6: parsedImages.albumImage6 || { url: '/images/m7/choose_img.png', position: 'album6' },
                    albumImage7: parsedImages.albumImage7 || { url: '/images/m7/choose_img.png', position: 'album7' },
                };
            } catch (e) {
                console.error('Failed to parse weddingImages from localStorage:', e);
            }
        }
        return {
            mainImage: { url: '/images/m7/choose_img.png', position: 'main' },
            groomImage: { url: '/images/m7/choose_img.png', position: 'groom' },
            brideImage: { url: '/images/m7/choose_img.png', position: 'bride' },
            locationGroomImage: { url: '/images/m7/choose_img.png', position: 'locationGroom' },
            locationBrideImage: { url: '/images/m7/choose_img.png', position: 'locationBride' },
            albumImage1: { url: '/images/m7/choose_img.png', position: 'album1' },
            albumImage2: { url: '/images/m7/choose_img.png', position: 'album2' },
            albumImage3: { url: '/images/m7/choose_img.png', position: 'album3' },
            albumImage4: { url: '/images/m7/choose_img.png', position: 'album4' },
            albumImage5: { url: '/images/m7/choose_img.png', position: 'album5' },
            albumImage6: { url: '/images/m7/choose_img.png', position: 'album6' },
            albumImage7: { url: '/images/m7/choose_img.png', position: 'album7' },
        };
    });

    const fileInputRefs = {
        mainImage: useRef<HTMLInputElement>(null),
        groomImage: useRef<HTMLInputElement>(null),
        brideImage: useRef<HTMLInputElement>(null),
        locationGroomImage: useRef<HTMLInputElement>(null),
        locationBrideImage: useRef<HTMLInputElement>(null),
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
        console.log(`File selected for ${key}:`, file);

        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: { url: '/images/m7/choose_img.png', position, fileName: undefined },
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

    useEffect(() => {
        console.log('Images state updated:', images);
    }, [images]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.template7}>
                <div className={styles.wrapper}>
                    <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                    <div className={styles.header} onClick={() => triggerFileInput('mainImage')}>
                        <div className={styles.mainImage}>
                            <Image
                                src={images.mainImage.url}
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
                        </div>
                        <div className={styles.overlay_content}>
                            <div className={styles.layout_paper}>
                                <img src="/images/m7/png_5.png" alt="" />
                                <div className={styles.content}>
                                    <div className={styles.saveTheDate}>
                                        <img src="/images/m7/std_text2.png" alt="" />
                                    </div>
                                    <div className={styles.weddingOf}>THE WEDDING OF</div>
                                    <div className={styles.names}>
                                        <div className={styles.names_flex}>
                                            <div>{weddingData.groom}</div>
                                            <div className={styles.and}>&</div>
                                            <div>{weddingData.bride}</div>
                                        </div>
                                    </div>
                                    <div className={styles.dateTime}>
                                        {weddingData.weddingDate?.getDate() || 17} Tháng{' '}
                                        {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : 8},{' '}
                                        {weddingData.weddingDate?.getFullYear() || 2025} |{' '}
                                        {formatDayOfWeek(weddingData.weddingDate)}, Lúc:{' '}
                                        {formatTime(weddingData.weddingTime)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.info_family}>
                        <div className={styles.wrapper_info}>
                            <div className={styles.flex_representative}>
                                <div className={styles.representative_house}>
                                    <span>Nhà trai</span>
                                    <h3>Ông: {weddingData.familyGroom.father}</h3>
                                    <h3>Bà: {weddingData.familyGroom.mother}</h3>
                                    <p className={styles.address}>
                                        <strong>
                                            <FontAwesomeIcon icon={faLocationDot} />
                                        </strong>{' '}
                                        {weddingData.groomAddress}
                                    </p>
                                </div>
                                <div className={styles.representative_house}>
                                    <span>Nhà gái</span>
                                    <h3>Ông: {weddingData.familyBride.father}</h3>
                                    <h3>Bà: {weddingData.familyBride.mother}</h3>
                                    <p className={styles.address}>
                                        <strong>
                                            <FontAwesomeIcon icon={faLocationDot} />
                                        </strong>{' '}
                                        {weddingData.brideAddress}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.name_groom__bride}>
                                <div className={styles.groom_name}>{weddingData.groom}</div>
                                <div className={styles.and_happy}>&</div>
                                <div className={styles.bride_name}>{weddingData.bride}</div>
                            </div>

                            <p className={styles.text}>
                                Trân trọng kính mời Quý Khách
                                <br />
                                Đến dự Lễ Thành Hôn của hai con chúng tôi
                            </p>

                            <p className={styles.lunarDay}>(Nhằm {weddingData.lunarDay})</p>
                            <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                        </div>
                    </div>

                    <div className={styles.groom_bride}>
                        <div className={styles.groom_bride__wrapper}>
                            <div className={styles.groom}>
                                <div className={styles.img_groom} onClick={() => triggerFileInput('groomImage')}>
                                    <Image
                                        src={images.groomImage.url}
                                        alt={images.groomImage.url ? 'Ảnh chú rể' : 'Chọn ảnh'}
                                        width={200}
                                        height={200}
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
                                <div className={styles.info}>
                                    <span>Chú rể</span>
                                    <div className={styles.name}>{weddingData.groom}</div>
                                </div>
                            </div>

                            <div className={styles.love_story__groom}>
                                <p>{weddingData.groomStory || defaultWeddingData.groomStory}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.bride_bride}>
                        <div className={styles.bride_bride__wrapper}>
                            <div className={styles.bride}>
                                <div className={styles.info}>
                                    <span>Cô Dâu</span>
                                    <div className={styles.name}>{weddingData.bride}</div>
                                </div>
                                <div className={styles.img_bride} onClick={() => triggerFileInput('brideImage')}>
                                    <Image
                                        src={images.brideImage.url}
                                        alt={images.brideImage.url ? 'Ảnh cô dâu' : 'Chọn ảnh'}
                                        width={200}
                                        height={200}
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

                            <div className={styles.love_story__bride}>
                                <p>{weddingData.brideStory || defaultWeddingData.brideStory}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.location}>
                        <div className={styles.wrapper_img__location}>
                            <div className={styles.img_top} onClick={() => triggerFileInput('locationGroomImage')}>
                                {!showGroomMap && (
                                    <Image
                                        src={images.locationGroomImage.url}
                                        alt={images.locationGroomImage.url ? 'Ảnh địa điểm nhà trai' : 'Chọn ảnh'}
                                        width={600}
                                        height={450}
                                        className={images.locationGroomImage.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRefs.locationGroomImage}
                                    onChange={(e) => handleImageChange('locationGroomImage', 'locationGroom', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                {showGroomMap && (
                                    <div className={styles.map_groom}>
                                        <iframe
                                            src={getMapEmbedUrlFromCoords(weddingData.groomMapUrl)}
                                            width="600"
                                            height="450"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                )}
                            </div>

                            <div className={styles.torn_paper}>
                                <img src="/images/m7/top_bottom.png" alt="" />
                                <div className={styles.show_theWay}>
                                    <h3>Địa điểm tổ chức</h3>
                                    <div className={styles.flex_location}>
                                        <button
                                            className={styles.btn_showTheway__groom}
                                            onClick={() => {
                                                if (showGroomMap) {
                                                    openMapInGoogle(weddingData.groomMapUrl);
                                                } else {
                                                    setShowGroomMap(true);
                                                    setShowBrideMap(false);
                                                }
                                            }}
                                        >
                                            {showGroomMap ? 'Xem trên bản đồ lớn' : 'Google map nhà trai'}
                                        </button>
                                        <button
                                            className={styles.btn_showTheway__bride}
                                            onClick={() => {
                                                if (showBrideMap) {
                                                    openMapInGoogle(weddingData.brideMapUrl);
                                                } else {
                                                    setShowBrideMap(true);
                                                    setShowGroomMap(false);
                                                }
                                            }}
                                        >
                                            {showBrideMap ? 'Xem trên bản đồ lớn' : 'Google map nhà gái'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.img_bottom} onClick={() => triggerFileInput('locationBrideImage')}>
                                {!showBrideMap && (
                                    <Image
                                        src={images.locationBrideImage.url}
                                        alt={images.locationBrideImage.url ? 'Ảnh địa điểm nhà gái' : 'Chọn ảnh'}
                                        width={600}
                                        height={450}
                                        className={images.locationBrideImage.url ? '' : styles.imagePlaceholder}
                                        style={{ cursor: 'pointer' }}
                                    />
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRefs.locationBrideImage}
                                    onChange={(e) => handleImageChange('locationBrideImage', 'locationBride', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                {showBrideMap && (
                                    <div className={styles.map_bride}>
                                        <iframe
                                            src={getMapEmbedUrlFromCoords(weddingData.brideMapUrl)}
                                            width="100%"
                                            height="100%"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.album_wedding}>
                        <div className={styles.title}>
                            <img src="/images/m6/albumWedding_text.png" alt="" />
                        </div>

                        <div className={styles.bento_grid}>
                            <div className={styles.boxTall} onClick={() => triggerFileInput('albumImage1')}>
                                <Image
                                    src={images.albumImage1.url}
                                    alt={images.albumImage1.url ? 'Ảnh 1' : 'Chọn ảnh'}
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
                                    alt={images.albumImage2.url ? 'Ảnh 2' : 'Chọn ảnh'}
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
                                    alt={images.albumImage3.url ? 'Ảnh 3' : 'Chọn ảnh'}
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
                                    alt={images.albumImage4.url ? 'Ảnh 4' : 'Chọn ảnh'}
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
                                    alt={images.albumImage5.url ? 'Ảnh 5' : 'Chọn ảnh'}
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
                                    alt={images.albumImage6.url ? 'Ảnh 6' : 'Chọn ảnh'}
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
                                    alt={images.albumImage7.url ? 'Ảnh 7' : 'Chọn ảnh'}
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
                        <img src="/images/m7/ft_m7.png" alt="" />
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Template7Edit;
