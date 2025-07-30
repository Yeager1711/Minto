'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from '../../12.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faChevronCircleDown,
    faChevronDown,
    faChevronUp,
    faCheckCircle,
    faImage,
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import { useApi } from 'app/lib/apiContext/apiContext';
import { showToastError } from 'app/Ultils/toast';
import imagekit from 'app/lib/imagekit/imagekit';
import ButtonDown from 'app/template/buttonDown/ButtonDown';

// Định nghĩa interface cho dữ liệu đám cưới
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

// Định nghĩa interface cho dữ liệu tiến trình
interface ProgressItem {
    maxImages: number;
    currentImages: number;
}

// Định nghĩa interface cho danh sách ảnh
interface ImageItem {
    url: string;
    position: string;
    fileName?: string;
}

interface ImageState {
    bar0: ImageItem[];
    bar1: ImageItem[];
    groomImages: ImageItem[];
    brideImages: ImageItem[];
    bar4: ImageItem[];
}

// Định nghĩa type cho keys của ImageState
type ImageSection = keyof ImageState;

// Component chính
const Template12Edit: React.FC = () => {
    const params = useParams();
    const templateId = params.id as string;
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi();
    const [expandedBar, setExpandedBar] = useState<number>(0);
    const [showBrideStory, setShowBrideStory] = useState<boolean>(false);
    const [showContent, setShowContent] = useState<boolean>(true);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [isCollapsing, setIsCollapsing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [quantity] = useState<number>(parseInt(searchParams.get('quantity') || '1', 10));
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const parseWeddingDate = (dateStr: string | Date | null): Date | null => {
        if (typeof dateStr === 'string' && dateStr.trim()) {
            const [day, month, year] = dateStr.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    };

    useDisableDevTools();

    // Dữ liệu mặc định cho đám cưới
    const defaultWeddingData: TemplateWeddingData = {
        bride: ' ',
        groom: ' ',
        weddingDate: null,
        weddingTime: '',
        weddingDayOfWeek: ' ',
        lunarDay: '',
        familyGroom: { father: ' ', mother: ' ' },
        familyBride: { father: ' ', mother: ' ' },
        brideStory:
            'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!',
        groomStory:
            'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!',
        groomAddress: '',
        brideAddress: '',
        groomMapUrl: '',
        brideMapUrl: '',
    };

    const weddingData: TemplateWeddingData = (() => {
        const savedData = typeof window !== 'undefined' ? localStorage.getItem(`WeddingData${templateId}`) : null;
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData) as TemplateWeddingData;
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
    })();

    // Khởi tạo state images từ localStorage
    const [images, setImages] = useState<ImageState>(() => {
        const savedImages = typeof window !== 'undefined' ? localStorage.getItem(`weddingImages${templateId}`) : null;
        const defaultImages: ImageState = {
            bar0: [
                { url: '/images/m12/choose_img.png', position: 'bar0_0' },
                { url: '/images/m12/choose_img.png', position: 'bar0_1' },
            ],
            bar1: [{ url: '/images/m12/choose_img.png', position: 'bar1_0' }],
            groomImages: [{ url: '/images/m12/choose_img.png', position: 'groom_0' }],
            brideImages: [{ url: '/images/m12/choose_img.png', position: 'bride_0' }],
            bar4: [
                { url: '/images/m12/choose_img.png', position: 'bar4_0' },
                { url: '/images/m12/choose_img.png', position: 'bar4_1' },
                { url: '/images/m12/choose_img.png', position: 'bar4_2' },
                { url: '/images/m12/choose_img.png', position: 'bar4_3' },
                { url: '/images/m12/choose_img.png', position: 'bar4_4' },
                { url: '/images/m12/choose_img.png', position: 'bar4_5' },
                { url: '/images/m12/choose_img.png', position: 'bar4_6' },
            ],
        };
        if (savedImages) {
            try {
                const parsedImages = JSON.parse(savedImages) as ImageState;
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

    const [progressData, setProgressData] = useState<ProgressItem[]>([
        { maxImages: 2, currentImages: 0 }, // expandedBar === 0
        { maxImages: 1, currentImages: 0 }, // expandedBar === 1
        { maxImages: 0, currentImages: 0 }, // expandedBar === 2
        { maxImages: 2, currentImages: 0 }, // expandedBar === 3 (1 ảnh chú rể + 1 ảnh cô dâu)
        { maxImages: 7, currentImages: 0 }, // expandedBar === 4
        { maxImages: 0, currentImages: 0 }, // expandedBar === 5
    ]);

    // Ref cho input file
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({
        bar0_0: null,
        bar0_1: null,
        bar1_0: null,
        groom_0: null,
        bride_0: null,
        bar4_0: null,
        bar4_1: null,
        bar4_2: null,
        bar4_3: null,
        bar4_4: null,
        bar4_5: null,
        bar4_6: null,
    });

    // Kiểm tra xem section có hoàn thành đầy đủ ảnh không
    const isSectionComplete = (section: ImageSection): boolean => {
        if (section === 'groomImages' || section === 'brideImages') {
            const groomComplete = images.groomImages[0]?.url !== '/images/m12/choose_img.png';
            const brideComplete = images.brideImages[0]?.url !== '/images/m12/choose_img.png';
            return groomComplete && brideComplete;
        }
        const sectionIndex = parseInt(section.replace('bar', ''));
        return progressData[sectionIndex]?.currentImages === progressData[sectionIndex]?.maxImages;
    };

    // Tính phần trăm hoàn thành cho mỗi expandedBar
    const calculateProgress = (): number[] => {
        return progressData.map((data, index) => {
            if (data.maxImages === 0) return 100;
            if (index === 3) {
                let completedImages = 0;
                if (images.groomImages[0]?.url !== '/images/m12/choose_img.png') completedImages++;
                if (images.brideImages[0]?.url !== '/images/m12/choose_img.png') completedImages++;
                return Math.min((completedImages / data.maxImages) * 100, 100);
            }
            return Math.min((data.currentImages / data.maxImages) * 100, 100);
        });
    };

    // Tính tổng phần trăm hoàn thành
    const totalProgress = (): number => {
        const progress = calculateProgress();
        const validSections = progress.filter((_, index) => progressData[index].maxImages > 0);
        return validSections.length > 0
            ? Math.round(validSections.reduce((sum, curr) => sum + curr, 0) / validSections.length)
            : 100;
    };

    // Xử lý chọn ảnh
    const handleImageSelect = async (
        e: React.ChangeEvent<HTMLInputElement>,
        section: ImageSection,
        index: number
    ): Promise<void> => {
        e.stopPropagation();
        const file = e.target.files?.[0];
        const position = `${section}_${index}`;
        const inputRef = fileInputRefs.current[position];

        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== position));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [section]: prev[section].map((img, i) =>
                        i === index ? { url: '/images/m12/choose_img.png', position, fileName: undefined } : img
                    ),
                };
                try {
                    localStorage.setItem(`weddingImages${templateId}`, JSON.stringify(newImages));
                } catch (e) {
                    console.error('Lỗi khi lưu weddingImages vào localStorage:', e);
                }
                return newImages;
            });
            if (inputRef) inputRef.value = '';
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showToastError('Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, hoặc GIF).');
            if (inputRef) inputRef.value = '';
            return;
        }

        let authParams;
        try {
            authParams = await fetchAuthParams();
        } catch (error) {
            showToastError('Không thể kết nối với ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi lấy auth params:', error);
            if (inputRef) inputRef.value = '';
            return;
        }

        try {
            const timestamp = Date.now();
            const standardizedFileName = `${timestamp}-${section}_${index}.jpg`;
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

            const imageUrl = uploadResponse.url;
            setPreviewImage(imageUrl);
            setTimeout(() => {
                setImages((prev) => {
                    const newImages = {
                        ...prev,
                        [section]: prev[section].map((img, i) =>
                            i === index ? { url: imageUrl, position, fileName: standardizedFileName } : img
                        ),
                    };
                    try {
                        localStorage.setItem(`weddingImages${templateId}`, JSON.stringify(newImages));
                    } catch (e) {
                        console.error('Lỗi khi lưu weddingImages vào localStorage:', e);
                    }
                    return newImages;
                });

                setProgressData((prev) =>
                    prev.map((data, i) => {
                        const sectionIndex =
                            section === 'groomImages' || section === 'brideImages'
                                ? 3
                                : parseInt(section.replace('bar', ''));
                        if (
                            i === sectionIndex &&
                            data.currentImages < data.maxImages &&
                            images[section][index]?.url === '/images/m12/choose_img.png'
                        ) {
                            return { ...data, currentImages: data.currentImages + 1 };
                        }
                        return data;
                    })
                );

                toast.success('Ảnh đã được chọn thành công!');
                setPreviewImage(null);
            }, 2000);
        } catch (error) {
            showToastError('Lỗi khi tải ảnh lên ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi tải ảnh lên ImageKit:', section, index, error);
        }

        if (inputRef) inputRef.value = '';
    };

    // Mở input file
    const openFileInput = (section: ImageSection, index: number): void => {
        const key =
            section === 'groomImages' ? 'groom_0' : section === 'brideImages' ? 'bride_0' : `${section}_${index}`;
        const inputRef = fileInputRefs.current[key];
        if (inputRef) {
            inputRef.click();
        } else {
            console.error(
                `File input ref for ${key} is not available. Available refs:`,
                Object.keys(fileInputRefs.current)
            );
        }
    };

    // Xử lý touch start
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
        if (!(e.target instanceof HTMLImageElement) && !(e.target instanceof HTMLInputElement)) {
            e.stopPropagation();
        }
    };

    // Xử lý click màn hình
    const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        if (isCollapsing) return;

        const currentSectionKey =
            expandedBar === 3
                ? showBrideStory
                    ? 'brideImages'
                    : 'groomImages'
                : (`bar${expandedBar}` as ImageSection);
        if (progressData[expandedBar].maxImages > 0 && !isSectionComplete(currentSectionKey)) {
            toast.warn('Vui lòng chọn đủ ảnh cho cả chú rể và cô dâu trước khi chuyển sang phần tiếp theo!');
            return;
        }

        setIsCollapsing(true);
        setShowContent(false);

        setTimeout(() => {
            setIsCollapsing(false);
            setShowContent(true);
            setExpandedBar((prev) => {
                switch (prev) {
                    case 0:
                        return 1;
                    case 1:
                        return 2;
                    case 2:
                        return 3;
                    case 3:
                        return 4;
                    case 4:
                        return 5;
                    default:
                        return 0;
                }
            });
            setShowMap(false);
        }, 500);
    };

    // Xử lý toggle câu chuyện
    const handleStoryToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setShowContent(false);
        setShowBrideStory((prev) => !prev);
        setTimeout(() => setShowContent(true), 50);
        setShowMap(false);
    };

    // Xử lý toggle bản đồ
    const handleMapToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setShowMap((prev) => !prev);
    };

    // Xử lý mở bản đồ Google
    const openMapInGoogle = (coords: string): void => {
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

    // Chuyển đổi tọa độ thành URL nhúng Google Maps
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

    useEffect(() => {
        AOS.init({ duration: 1000 });
        AOS.refresh();
    }, []);

    // Khởi tạo AOS và quản lý localStorage
    useEffect(() => {
        if (expandedBar !== null) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
        }

        // Save weddingData to localStorage
        try {
            localStorage.setItem(
                `WeddingData${templateId}`,
                JSON.stringify({
                    ...weddingData,
                    weddingDate: weddingData.weddingDate
                        ? `${weddingData.weddingDate.getDate()}/${weddingData.weddingDate.getMonth() + 1}/${weddingData.weddingDate.getFullYear()}`
                        : null,
                })
            );
        } catch (e) {
            console.error('Lỗi khi lưu weddingData vào localStorage:', e);
        }

        // Compute updated progressData
        const updatedProgressData = progressData.map((data, i) => {
            if (data.maxImages === 0) return data;
            if (i === 3) {
                let completedImages = 0;
                if (images.groomImages[0]?.url !== '/images/m12/choose_img.png') completedImages++;
                if (images.brideImages[0]?.url !== '/images/m12/choose_img.png') completedImages++;
                return { ...data, currentImages: completedImages };
            }
            const section = `bar${i}` as ImageSection;
            const currentImages =
                images[section]?.filter((img) => img.url !== '/images/m12/choose_img.png').length || 0;
            return { ...data, currentImages };
        });

        setProgressData(updatedProgressData);

        setIsLoading(false);

        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
            Object.values(images)
                .flat()
                .forEach((img) => {
                    if (img.url?.startsWith('blob:')) {
                        URL.revokeObjectURL(img.url);
                    }
                });
        };
    }, [expandedBar, images, templateId, weddingData, progressData]);

    // Style cho hiệu ứng slide
    const slideStyle: React.CSSProperties = {
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateX(0)' : showBrideStory ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.template11} onClick={handleScreenClick}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className={styles.wrapper}>
                <ButtonDown templateId={templateId} quantity={quantity} weddingImages={imageFiles} />
                {/* Preview ảnh */}
                {previewImage && (
                    <div className={styles.preview_container}>
                        <Image
                            src={previewImage}
                            alt="Preview"
                            width={300}
                            height={300}
                            className={styles.preview_image}
                        />
                        <p>Đang xem trước ảnh...</p>
                    </div>
                )}

                {expandedBar === 0 && showContent && (
                    <div className={`${styles.wrapper_imageMain} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.image_top}>
                            <Image
                                src={images.bar0[0]?.url}
                                alt={images.bar0[0]?.url !== '/images/m12/choose_img.png' ? 'Top Image' : 'Chọn ảnh'}
                                width={500}
                                height={500}
                                className={
                                    images.bar0[0]?.url !== '/images/m12/choose_img.png' ? '' : styles.image_selectable
                                }
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFileInput('bar0', 0);
                                }}
                            />
                            <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                            <input
                                type="file"
                                accept="image/*"
                                ref={(el) => {
                                    fileInputRefs.current.bar0_0 = el;
                                }}
                                style={{ display: 'none' }}
                                onChange={(e) => handleImageSelect(e, 'bar0', 0)}
                            />
                        </div>
                        <div className={styles.image_bottom}>
                            <Image
                                src={images.bar0[1]?.url}
                                alt={images.bar0[1]?.url !== '/images/m12/choose_img.png' ? 'Bottom Image' : 'Chọn ảnh'}
                                width={500}
                                height={500}
                                className={
                                    images.bar0[1]?.url !== '/images/m12/choose_img.png' ? '' : styles.image_selectable
                                }
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFileInput('bar0', 1);
                                }}
                            />
                            <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                            <input
                                type="file"
                                accept="image/*"
                                ref={(el) => {
                                    fileInputRefs.current.bar0_1 = el;
                                }}
                                style={{ display: 'none' }}
                                onChange={(e) => handleImageSelect(e, 'bar0', 1)}
                            />
                        </div>
                        <div className={styles.infomation}>
                            <h3>{weddingData.groom}</h3>
                            <h3>{weddingData.bride}</h3>
                            <span>
                                {weddingData.weddingDate
                                    ? `${weddingData.weddingDate.getDate()}.${weddingData.weddingDate.getMonth() + 1}.${weddingData.weddingDate.getFullYear()}`
                                    : '24.09.2025'}
                            </span>
                        </div>
                    </div>
                )}

                {expandedBar === 1 && showContent && (
                    <div
                        className={`${styles.weddingInfo} ${isCollapsing ? styles.collapse : styles.expand}`}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.wrapper_bar1}>
                            <div className={styles.step_1}>
                                <div className={styles.image_1} data-aos="fade-down">
                                    <Image
                                        src={images.bar1[0]?.url}
                                        alt={
                                            images.bar1[0]?.url !== '/images/m12/choose_img.png'
                                                ? 'Wedding'
                                                : 'Chọn ảnh'
                                        }
                                        width={500}
                                        height={500}
                                        className={
                                            images.bar1[0]?.url !== '/images/m12/choose_img.png'
                                                ? ''
                                                : styles.image_selectable
                                        }
                                        style={{ cursor: 'pointer' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openFileInput('bar1', 0);
                                        }}
                                    />
                                    <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={(el) => {
                                            fileInputRefs.current.bar1_0 = el;
                                        }}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageSelect(e, 'bar1', 0)}
                                    />
                                </div>
                                <div className={styles.al}>
                                    <div className={styles.dayWedding} data-aos="fade-up" data-aos-delay="200">
                                        <h1>
                                            {weddingData.weddingDate
                                                ? `${weddingData.weddingDate.getDate()} | ${weddingData.weddingDate.getMonth() + 1}`
                                                : '24 | 09'}
                                        </h1>
                                        <h1>{weddingData.weddingDate?.getFullYear() || '2025'}</h1>
                                    </div>
                                    <div className={styles.text}>
                                        join us to celebrate
                                        <h3>the Wedding of</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 2 && showContent && (
                    <div
                        className={`${styles.familyInfo} ${isCollapsing ? styles.collapse : styles.expand}`}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.wrapper_bar2}>
                            <h2 data-aos="fade-down">Our Families</h2>
                            <div className={styles.familyContainer}>
                                <h1>
                                    Trân Trọng kính mời đến dự buổi tiệc
                                    <br />
                                    Chung vui cùng gia đình chúng tôi
                                </h1>
                                <div className={styles.familySide}>
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyGroom.father}</span>
                                    <span>Bà: {weddingData.familyGroom.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: {weddingData.groomAddress}
                                    </p>
                                </div>
                                <div className={styles.familySide}>
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: {weddingData.familyBride.father}</span>
                                    <span>Bà: {weddingData.familyBride.mother}</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: {weddingData.brideAddress}
                                    </p>
                                </div>
                                <h1>
                                    Vào lúc:{' '}
                                    <strong>
                                        {weddingData.weddingTime} || Ngày {weddingData.weddingDate?.getDate() || '24'}{' '}
                                        tháng {weddingData.weddingDate ? weddingData.weddingDate.getMonth() + 1 : '09'},{' '}
                                        {weddingData.weddingDate?.getFullYear() || '2025'}
                                    </strong>
                                    <br />
                                    <p>(Nhằm {weddingData.lunarDay})</p>
                                    Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                                </h1>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 3 && showContent && (
                    <div
                        key={`story-${showBrideStory ? 'bride' : 'groom'}`}
                        className={`${styles.wrapper_bar3} ${isCollapsing ? styles.collapse : styles.expand}`}
                        style={slideStyle}
                    >
                        <div
                            className={styles.btn_map}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (showMap) {
                                    openMapInGoogle(showBrideStory ? weddingData.brideMapUrl : weddingData.groomMapUrl);
                                } else {
                                    handleMapToggle(e);
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={showMap ? faChevronUp : faChevronDown} />
                            {showMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                        </div>
                        <div className={`${styles.mapContainer} ${showMap ? styles.show : styles.hide}`}>
                            <iframe
                                src={getMapEmbedUrlFromCoords(
                                    showBrideStory ? weddingData.brideMapUrl : weddingData.groomMapUrl
                                )}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        <div className={styles.step_3}>
                            <div className={styles.image_container} data-aos="fade-down">
                                <div className={styles.image_3}>
                                    <Image
                                        src={showBrideStory ? images.brideImages[0]?.url : images.groomImages[0]?.url}
                                        alt={
                                            showBrideStory
                                                ? images.brideImages[0]?.url !== '/images/m12/choose_img.png'
                                                    ? 'Bride Image 1'
                                                    : 'Chọn ảnh'
                                                : images.groomImages[0]?.url !== '/images/m12/choose_img.png'
                                                  ? 'Groom Image 1'
                                                  : 'Chọn ảnh'
                                        }
                                        width={300}
                                        height={300}
                                        className={
                                            showBrideStory
                                                ? images.brideImages[0]?.url !== '/images/m12/choose_img.png'
                                                    ? ''
                                                    : styles.image_selectable
                                                : images.groomImages[0]?.url !== '/images/m12/choose_img.png'
                                                  ? ''
                                                  : styles.image_selectable
                                        }
                                        style={{ cursor: 'pointer', zIndex: 10, position: 'relative' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openFileInput(showBrideStory ? 'brideImages' : 'groomImages', 0);
                                        }}
                                    />
                                    <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={(el) => {
                                            fileInputRefs.current.bride_0 = el;
                                        }}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageSelect(e, 'brideImages', 0)}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={(el) => {
                                            fileInputRefs.current.groom_0 = el;
                                        }}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageSelect(e, 'groomImages', 0)}
                                    />
                                </div>
                            </div>
                            <div className={showBrideStory ? styles.brideName : styles.groomName}>
                                <h1 data-aos="fade-up" data-aos-delay="200">
                                    {showBrideStory ? weddingData.bride : weddingData.groom}
                                </h1>
                                <div
                                    className={`${styles.change_story__button} ${showBrideStory ? styles.bride : styles.groom}`}
                                    onClick={handleStoryToggle}
                                >
                                    <FontAwesomeIcon icon={faChevronCircleDown} />
                                </div>
                            </div>
                            <div className={styles.text_story}>
                                <p>
                                    {showBrideStory
                                        ? weddingData.brideStory || defaultWeddingData.brideStory
                                        : weddingData.groomStory || defaultWeddingData.groomStory}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 4 && showContent && (
                    <div className={`${styles.album_wedding} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.title}>Album Wedding</div>
                        <div className={styles.bento_grid}>
                            {images.bar4.map((img, index) => (
                                <div
                                    key={index}
                                    className={
                                        index < 3 || index === 5
                                            ? styles.boxTall
                                            : index === 4
                                              ? styles.box
                                              : styles.boxWide
                                    }
                                >
                                    <Image
                                        src={img.url}
                                        alt={
                                            img.url !== '/images/m12/choose_img.png'
                                                ? `Album Image ${index + 1}`
                                                : 'Chọn ảnh'
                                        }
                                        width={index < 3 || index === 5 ? 200 : index === 4 ? 200 : 400}
                                        height={index < 3 || index === 5 ? 300 : 200}
                                        className={
                                            img.url !== '/images/m12/choose_img.png' ? '' : styles.image_selectable
                                        }
                                        style={{ cursor: 'pointer' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openFileInput('bar4', index);
                                        }}
                                    />
                                    <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={(el) => {
                                            fileInputRefs.current[`bar4_${index}`] = el;
                                        }}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleImageSelect(e, 'bar4', index)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {expandedBar === 5 && showContent && (
                    <div className={`${styles.footer} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.column_text}>
                            <h3>Thank You</h3>
                            <span className={styles.subtext}>
                                Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                                <br />
                                trong ngày đặc biệt của chúng tôi.
                            </span>
                        </div>
                    </div>
                )}

                {/* Thanh tiến trình */}
                <div className={styles.progress_bar}>
                    <div className={styles.progress_container}>
                        <div className={styles.progress_fill} style={{ width: `${totalProgress()}%` }} />
                    </div>
                    <div className={styles.progress_steps}>
                        {progressData.map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.step} ${
                                    calculateProgress()[index] === 100 ? styles.completed : ''
                                } ${expandedBar === index ? styles.active : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsCollapsing(true);
                                    setShowContent(false);
                                    setTimeout(() => {
                                        setExpandedBar(index);
                                        setIsCollapsing(false);
                                        setShowContent(true);
                                        setShowMap(false);
                                    }, 500);
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className={calculateProgress()[index] === 100 ? styles.checked : styles.unchecked}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Template12Edit;
