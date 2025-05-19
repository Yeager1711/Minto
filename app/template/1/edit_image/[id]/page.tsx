'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './mau_1.module.css';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { showToastError } from 'app/Ultils/toast';
import ButtonDown from 'app/template/buttonDown/ButtonDown';
import imagekit from 'app/lib/imagekit/imagekit';
import { useApi } from '../../../../lib/apiContext/apiContext'; // Import useApi

interface Template1WeddingData {
    banner: { image: string };
    couple: {
        names: string;
        groom: { name: string; image: string };
        bride: { name: string; image: string };
    };
    invitation: {
        title: string;
        subtitle: string;
        day: string;
        month: string;
        year: string;
        dayOfWeek: string;
        time: string;
        lunarDate: string;
        monthYear: string;
    };
    loveQuote_1: string;
    loveQuote_2: string;
    familyInfo: {
        groomFamily: { title: string; father: string; mother: string };
        brideFamily: { title: string; father: string; mother: string };
    };
    eventDetails: string;
    calendar: { month: string; days: (string | number)[]; highlightDay: number };
    location: {
        groomLocation: { name: string; address: string; mapEmbedUrl: string };
        brideLocation: { name: string; address: string; mapEmbedUrl: string };
    };
    coupleImages: { src: string; alt: string; isCenter?: boolean }[];
    thumnailImages: { src: string; alt: string; isCenter?: boolean }[];
}

interface TemplateWeddingData {
    bride: string;
    groom: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    lunarDay: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    brideStory: string;
    groomStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string;
    brideMapUrl: string;
    weddingDate: string;
}

interface Images {
    banner: { url: string; position: string; fileName?: string };
    groom: { url: string; position: string; fileName?: string };
    bride: { url: string; position: string; fileName?: string };
    couple_0: { url: string; position: string; fileName?: string };
    couple_1: { url: string; position: string; fileName?: string };
    couple_2: { url: string; position: string; fileName?: string };
    thumnail_0: { url: string; position: string; fileName?: string };
    thumnail_1: { url: string; position: string; fileName?: string };
    thumnail_2: { url: string; position: string; fileName?: string };
    thumnail_3: { url: string; position: string; fileName?: string };
}

// Function to generate calendar data
const generateCalendarData = (weddingDate: string, monthDisplay: string) => {
    const [day, month, year] = weddingDate.split('/').map(Number);
    const date = new Date(year, month - 1, 1);
    const firstDay = date.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const days: (string | number)[] = [];
    for (let i = 0; i < firstDay; i++) days.push('');
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return { month: monthDisplay || `Tháng ${month}`, days, highlightDay: day };
};

// Default wedding data
const defaultWeddingData: Template1WeddingData = {
    banner: { image: '/placeholder.png' },
    couple: {
        names: '',
        groom: { name: '', image: '/placeholder.png' },
        bride: { name: '', image: '/placeholder.png' },
    },
    invitation: {
        title: 'Thư Mời Tiệc Cưới',
        subtitle: '',
        day: '',
        month: '',
        year: '',
        dayOfWeek: '',
        time: '',
        lunarDate: '',
        monthYear: '',
    },
    loveQuote_1: '',
    loveQuote_2: '',
    familyInfo: {
        groomFamily: { title: 'Nhà Trai', father: '', mother: '' },
        brideFamily: { title: 'Nhà Gái', father: '', mother: '' },
    },
    eventDetails: '',
    calendar: {
        month: 'Tháng 1',
        days: Array(31)
            .fill(0)
            .map((_, i) => i + 1),
        highlightDay: 1,
    },
    location: {
        groomLocation: { name: 'Nhà Trai', address: '', mapEmbedUrl: '' },
        brideLocation: { name: 'Nhà Gái', address: '', mapEmbedUrl: '' },
    },
    coupleImages: [
        { src: '/placeholder.png', alt: 'Chọn ảnh Couple 1', isCenter: false },
        { src: '/placeholder.png', alt: 'Chọn ảnh Couple 2', isCenter: true },
        { src: '/placeholder.png', alt: 'Chọn ảnh Couple 3', isCenter: false },
    ],
    thumnailImages: [
        { src: '/placeholder.png', alt: 'Chọn ảnh Thumbnail 1', isCenter: true },
        { src: '/placeholder.png', alt: 'Chọn ảnh Thumbnail 2', isCenter: false },
        { src: '/placeholder.png', alt: 'Chọn ảnh Thumbnail 3', isCenter: false },
        { src: '/placeholder.png', alt: 'Chọn ảnh Thumbnail 4', isCenter: false },
    ],
};

const defaultImages: Images = {
    banner: { url: '/placeholder.png', position: 'banner' },
    groom: { url: '/placeholder.png', position: 'groom' },
    bride: { url: '/placeholder.png', position: 'bride' },
    couple_0: { url: '/placeholder.png', position: 'couple_0' },
    couple_1: { url: '/placeholder.png', position: 'couple_1' },
    couple_2: { url: '/placeholder.png', position: 'couple_2' },
    thumnail_0: { url: '/placeholder.png', position: 'thumnail_0' },
    thumnail_1: { url: '/placeholder.png', position: 'thumnail_1' },
    thumnail_2: { url: '/placeholder.png', position: 'thumnail_2' },
    thumnail_3: { url: '/placeholder.png', position: 'thumnail_3' },
};

const Template1Edit: React.FC = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const { fetchAuthParams } = useApi(); // Use ApiContext
    const id = params.id as string;
    const quantity = parseInt(searchParams.get('quantity') || '1');

    // Initialize images state from localStorage
    const [images, setImages] = useState<Images>(() => {
        if (typeof window === 'undefined') return defaultImages;
        const savedImages = localStorage.getItem(`weddingImages${id}`);
        if (savedImages) {
            try {
                return JSON.parse(savedImages) as Images;
            } catch (e) {
                console.error('Failed to parse weddingImages from localStorage:', e);
                return defaultImages;
            }
        }
        return defaultImages;
    });

    // Initialize imageFiles state
    const [imageFiles, setImageFiles] = useState<{ file: File; position: string }[]>([]);

    // Initialize weddingDataState
    const [weddingDataState, setWeddingDataState] = useState<Template1WeddingData>(() => {
        if (typeof window === 'undefined') return defaultWeddingData;
        const savedEditData = localStorage.getItem(`WeddingData${id}`);
        const editData: TemplateWeddingData | null = savedEditData ? JSON.parse(savedEditData) : null;

        let mergedData = { ...defaultWeddingData };
        if (editData) {
            const [day, month, year] = editData.weddingDate.split('/').map(Number);
            const monthDisplay = `Tháng ${month}`;
            const calendarData = generateCalendarData(editData.weddingDate, monthDisplay);

            mergedData = {
                ...defaultWeddingData,
                banner: { image: images.banner.url },
                couple: {
                    names: `${editData.groom} & ${editData.bride}`,
                    groom: { name: editData.groom, image: images.groom.url },
                    bride: { name: editData.bride, image: images.bride.url },
                },
                invitation: {
                    title: 'Thư Mời Tiệc Cưới',
                    subtitle: '',
                    day: day.toString().padStart(2, '0'),
                    month: `Tháng ${month}`,
                    year: year.toString(),
                    dayOfWeek: editData.weddingDayOfWeek,
                    time: editData.weddingTime,
                    lunarDate: editData.lunarDay,
                    monthYear: `${monthDisplay} ${year}`,
                },
                loveQuote_1: '',
                loveQuote_2: '',
                familyInfo: {
                    groomFamily: {
                        title: 'Nhà Trai',
                        father: editData.familyGroom.father,
                        mother: editData.familyGroom.mother,
                    },
                    brideFamily: {
                        title: 'Nhà Gái',
                        father: editData.familyBride.father,
                        mother: editData.familyBride.mother,
                    },
                },
                eventDetails: `${editData.groomStory}\n${editData.brideStory}`,
                calendar: calendarData,
                location: {
                    groomLocation: {
                        name: 'Nhà Trai',
                        address: editData.groomAddress,
                        mapEmbedUrl: editData.groomMapUrl,
                    },
                    brideLocation: {
                        name: 'Nhà Gái',
                        address: editData.brideAddress,
                        mapEmbedUrl: editData.brideMapUrl,
                    },
                },
                coupleImages: [
                    { src: images.couple_0.url, alt: 'Chọn ảnh Couple 1', isCenter: false },
                    { src: images.couple_1.url, alt: 'Chọn ảnh Couple 2', isCenter: true },
                    { src: images.couple_2.url, alt: 'Chọn ảnh Couple 3', isCenter: false },
                ],
                thumnailImages: [
                    { src: images.thumnail_0.url, alt: 'Chọn ảnh Thumbnail 1', isCenter: true },
                    { src: images.thumnail_1.url, alt: 'Chọn ảnh Thumbnail 2', isCenter: false },
                    { src: images.thumnail_2.url, alt: 'Chọn ảnh Thumbnail 3', isCenter: false },
                    { src: images.thumnail_3.url, alt: 'Chọn ảnh Thumbnail 4', isCenter: false },
                ],
            };
        }
        return mergedData;
    });

    const fileInputRefs = {
        banner: useRef<HTMLInputElement>(null),
        groom: useRef<HTMLInputElement>(null),
        bride: useRef<HTMLInputElement>(null),
        couple_0: useRef<HTMLInputElement>(null),
        couple_1: useRef<HTMLInputElement>(null),
        couple_2: useRef<HTMLInputElement>(null),
        thumnail_0: useRef<HTMLInputElement>(null),
        thumnail_1: useRef<HTMLInputElement>(null),
        thumnail_2: useRef<HTMLInputElement>(null),
        thumnail_3: useRef<HTMLInputElement>(null),
    };

    const coupleImagesRef = useRef<HTMLDivElement>(null);
    const thumnailImagesRef = useRef<HTMLDivElement>(null);

    const handleImageChange = async (key: keyof Images, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFiles((prev) => prev.filter((item) => item.position !== key));
            setImages((prev) => {
                const newImages = {
                    ...prev,
                    [key]: { url: defaultImages[key].url, position: key, fileName: undefined },
                };
                try {
                    localStorage.setItem(`weddingImages${id}`, JSON.stringify(newImages));
                } catch (e) {
                    console.error('Lỗi khi lưu weddingImages vào localStorage:', e);
                }
                return newImages;
            });
            setWeddingDataState((prev) => {
                const updatedData = { ...prev };
                switch (key) {
                    case 'banner':
                        updatedData.banner.image = defaultImages.banner.url;
                        break;
                    case 'groom':
                        updatedData.couple.groom.image = defaultImages.groom.url;
                        break;
                    case 'bride':
                        updatedData.couple.bride.image = defaultImages.bride.url;
                        break;
                    case 'couple_0':
                    case 'couple_1':
                    case 'couple_2':
                        const coupleIndex = parseInt(key.split('_')[1]);
                        updatedData.coupleImages[coupleIndex] = {
                            ...updatedData.coupleImages[coupleIndex],
                            src: defaultImages[`couple_${coupleIndex}` as keyof Images].url,
                        };
                        break;
                    case 'thumnail_0':
                    case 'thumnail_1':
                    case 'thumnail_2':
                    case 'thumnail_3':
                        const thumnailIndex = parseInt(key.split('_')[1]);
                        updatedData.thumnailImages[thumnailIndex] = {
                            ...updatedData.thumnailImages[thumnailIndex],
                            src: defaultImages[`thumnail_${thumnailIndex}` as keyof Images].url,
                        };
                        break;
                }
                try {
                    localStorage.setItem(`WeddingData${id}`, JSON.stringify(standardizeWeddingData(updatedData)));
                } catch (e) {
                    console.error('Lỗi khi lưu WeddingData vào localStorage:', e);
                }
                return updatedData;
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
            authParams = await fetchAuthParams(); // Use fetchAuthParams from ApiContext
        } catch {
            showToastError('Không thể kết nối với ImageKit. Vui lòng thử lại.');
            return;
        }
        try {
            const timestamp = Date.now();
            const standardizedFileName = `${timestamp}-${key}.jpg`;
            const currentDate = new Date();
            const dateFolder = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
            const folderPath = `/wedding_${id}/${dateFolder}`; // Add date subfolder

            const uploadResponse = await imagekit.upload({
                file,
                fileName: standardizedFileName,
                folder: folderPath, // Updated folder path
                token: authParams.token,
                expire: authParams.expire,
                signature: authParams.signature,
            });

            if (!uploadResponse.url) {
                throw new Error('Tải ảnh lên ImageKit thất bại: Không nhận được URL');
            }

            const standardizedFile = new File([file], standardizedFileName, { type: 'image/jpeg' });
            setImageFiles((prev) => {
                const updatedFiles = prev.filter((item) => item.position !== key);
                return [...updatedFiles, { file: standardizedFile, position: key }];
            });

            setImages((prev: Images) => {
                const newImages = {
                    ...prev,
                    [key]: { url: uploadResponse.url, position: key, fileName: standardizedFileName },
                };
                try {
                    localStorage.setItem(`weddingImages${id}`, JSON.stringify(newImages));
                } catch (e) {
                    console.error('Lỗi khi lưu weddingImages vào localStorage:', e);
                }
                return newImages;
            });

            setWeddingDataState((prev) => {
                const updatedData = { ...prev };
                switch (key) {
                    case 'banner':
                        updatedData.banner.image = uploadResponse.url;
                        break;
                    case 'groom':
                        updatedData.couple.groom.image = uploadResponse.url;
                        break;
                    case 'bride':
                        updatedData.couple.bride.image = uploadResponse.url;
                        break;
                    case 'couple_0':
                    case 'couple_1':
                    case 'couple_2':
                        const coupleIndex = parseInt(key.split('_')[1]);
                        updatedData.coupleImages[coupleIndex] = {
                            ...updatedData.coupleImages[coupleIndex],
                            src: uploadResponse.url,
                        };
                        break;
                    case 'thumnail_0':
                    case 'thumnail_1':
                    case 'thumnail_2':
                    case 'thumnail_3':
                        const thumnailIndex = parseInt(key.split('_')[1]);
                        updatedData.thumnailImages[thumnailIndex] = {
                            ...updatedData.thumnailImages[thumnailIndex],
                            src: uploadResponse.url,
                        };
                        break;
                }
                try {
                    localStorage.setItem(`WeddingData${id}`, JSON.stringify(standardizeWeddingData(updatedData)));
                } catch (e) {
                    console.error('Lỗi khi lưu WeddingData vào localStorage:', e);
                }
                return updatedData;
            });
        } catch (error) {
            showToastError('Lỗi khi tải ảnh lên ImageKit. Vui lòng thử lại.');
            console.error('Lỗi khi tải ảnh lên ImageKit:', error);
        }
        e.target.value = '';
    };

    const triggerFileInput = (key: keyof typeof fileInputRefs, position: string) => {
        console.debug(`Triggering file input for key: ${key}, position: ${position}`);
        fileInputRefs[key].current?.click();
    };

    const standardizeWeddingData = (data: Template1WeddingData): TemplateWeddingData => {
        const { day, month, year } = {
            day: data.invitation.day,
            month: data.invitation.month.replace('Tháng ', ''),
            year: data.invitation.year,
        };
        const weddingDate = `${day}/${month}/${year}`;

        return {
            groom: data.couple.groom.name || 'Chưa có thông tin',
            bride: data.couple.bride.name || 'Chưa có thông tin',
            weddingDate,
            weddingTime: data.invitation.time || '',
            weddingDayOfWeek: data.invitation.dayOfWeek || '',
            lunarDay: data.invitation.lunarDate || '',
            groomAddress: data.location.groomLocation.address || '',
            brideAddress: data.location.brideLocation.address || '',
            groomMapUrl: data.location.groomLocation.mapEmbedUrl || '',
            brideMapUrl: data.location.brideLocation.mapEmbedUrl || '',
            familyGroom: {
                father: data.familyInfo.groomFamily.father || '',
                mother: data.familyInfo.groomFamily.mother || '',
            },
            familyBride: {
                father: data.familyInfo.brideFamily.father || '',
                mother: data.familyInfo.brideFamily.mother || '',
            },
            groomStory: data.eventDetails.split('\n')[0] || '',
            brideStory: data.eventDetails.split('\n')[1] || '',
        };
    };

    // Sync weddingDataState with images when images change
    useEffect(() => {
        setWeddingDataState((prev) => {
            const updatedData = { ...prev };
            updatedData.banner.image = images.banner.url;
            updatedData.couple.groom.image = images.groom.url;
            updatedData.couple.bride.image = images.bride.url;
            updatedData.coupleImages = [
                { ...prev.coupleImages[0], src: images.couple_0.url },
                { ...prev.coupleImages[1], src: images.couple_1.url },
                { ...prev.coupleImages[2], src: images.couple_2.url },
            ];
            updatedData.thumnailImages = [
                { ...prev.thumnailImages[0], src: images.thumnail_0.url },
                { ...prev.thumnailImages[1], src: images.thumnail_1.url },
                { ...prev.thumnailImages[2], src: images.thumnail_2.url },
                { ...prev.thumnailImages[3], src: images.thumnail_3.url },
            ];
            try {
                localStorage.setItem(`WeddingData${id}`, JSON.stringify(standardizeWeddingData(updatedData)));
            } catch (e) {
                console.error('Lỗi khi lưu WeddingData vào localStorage:', e);
            }
            return updatedData;
        });
    }, [images, id]);

    // Initialize AOS and add click listeners for images
    useEffect(() => {
        AOS.init();
        const addClickListener = (elements: NodeListOf<Element> | undefined, isCouple: boolean) => {
            elements?.forEach((img) => {
                const element = img as HTMLElement;
                element.addEventListener('click', () => {
                    elements.forEach((otherImg) => {
                        const otherElement = otherImg as HTMLElement;
                        otherElement.classList.remove(styles.centerImg);
                        if (isCouple) otherElement.setAttribute('style', '');
                    });
                    element.classList.add(styles.centerImg);
                    if (isCouple) {
                        element.style.order = '0';
                        let order = -1;
                        elements.forEach((otherImg) => {
                            if (otherImg !== img) (otherImg as HTMLElement).style.order = (order += 2).toString();
                        });
                    }
                });
            });
        };
        addClickListener(coupleImagesRef.current?.querySelectorAll(`.${styles.coupleImg}`), true);
        addClickListener(thumnailImagesRef.current?.querySelectorAll(`.${styles.thumnailImg}`), false);
        return () => {
            coupleImagesRef.current
                ?.querySelectorAll(`.${styles.coupleImg}`)
                .forEach((img) => img.removeEventListener('click', () => {}));
            thumnailImagesRef.current
                ?.querySelectorAll(`.${styles.thumnailImg}`)
                .forEach((img) => img.removeEventListener('click', () => {}));
        };
    }, []);

    // JSX interface
    return (
        <div className={styles.bg}>
            <ButtonDown templateId={id} quantity={quantity} weddingImages={imageFiles} />
            <div className={styles.bannerImageHeader} data-aos="fade-up" data-aos-duration="1000">
                <img
                    src={images.banner.url}
                    onClick={() => triggerFileInput('banner', 'banner')}
                    style={{ cursor: 'pointer' }}
                />
                <input
                    type="file"
                    ref={fileInputRefs.banner}
                    onChange={(e) => handleImageChange('banner', e)}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <div className={styles.contentHeader}>
                    <h3>
                        {weddingDataState.couple.groom.name || 'Chú Rể'} &{' '}
                        {weddingDataState.couple.bride.name || 'Cô Dâu'}
                    </h3>
                </div>
                <div className={styles.infomation}>
                    <h3>{weddingDataState.invitation.title}</h3>
                    <div className={styles.dateTime}>
                        <span>{`${weddingDataState.invitation.dayOfWeek || ''} - ${weddingDataState.invitation.time || ''}`}</span>
                        <div className={styles.day}>
                            {weddingDataState.invitation.day &&
                            weddingDataState.invitation.month &&
                            weddingDataState.invitation.year
                                ? `${weddingDataState.invitation.day}.${weddingDataState.invitation.month.replace('Tháng ', '')}.${weddingDataState.invitation.year}`
                                : 'Chưa có ngày cưới'}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.wrapper}>
                <div className={styles.wrapperBanner}>
                    <div className={styles.banner2} data-aos="fade-up" data-aos-duration="1200">
                        <div className={styles.loveQuote}>
                            <h2>Hôn nhân là chuyện cả đời,</h2>
                            <h2>Yêu người vừa ý, cưới người mình thương, ...</h2>
                        </div>
                        <div className={styles.familyInfo}>
                            <div className={styles.groomFamily} data-aos="fade-right" data-aos-delay="200">
                                <h3>{weddingDataState.familyInfo.groomFamily.title}</h3>
                                <p>{`Ông: ${weddingDataState.familyInfo.groomFamily.father || ''}`}</p>
                                <p>{`Bà: ${weddingDataState.familyInfo.groomFamily.mother || ''}`}</p>
                            </div>
                            <div className={styles.brideFamily} data-aos="fade-left" data-aos-delay="200">
                                <h3>{weddingDataState.familyInfo.brideFamily.title}</h3>
                                <p>{`Ông: ${weddingDataState.familyInfo.brideFamily.father || ''}`}</p>
                                <p>{`Bà: ${weddingDataState.familyInfo.brideFamily.mother || ''}`}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.banner3} data-aos="zoom-in" data-aos-duration="1000">
                        <div className={styles.coupleInfo}>
                            <div className={styles.groom} data-aos="fade-right" data-aos-delay="300">
                                <img
                                    src={images.groom.url}
                                    alt="Chọn Ảnh Chú Rể"
                                    onClick={() => triggerFileInput('groom', 'groom')}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.groom}
                                    onChange={(e) => handleImageChange('groom', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <h3>{weddingDataState.couple.groom.name || 'Chú Rể'}</h3>
                            </div>
                            <div className={styles.bride} data-aos="fade-left" data-aos-delay="300">
                                <img
                                    src={images.bride.url}
                                    alt="Chọn Ảnh Cô Dâu"
                                    onClick={() => triggerFileInput('bride', 'bride')}
                                    style={{ cursor: 'pointer' }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.bride}
                                    onChange={(e) => handleImageChange('bride', e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <h3>{weddingDataState.couple.bride.name || 'Cô Dâu'}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.banner4} data-aos="fade-up" data-aos-duration="1000">
                    <div className={styles.contentHeader}>
                        <h2 className={styles.invitationTitle}>{weddingDataState.invitation.title}</h2>
                        <h3 className={styles.eventTitle}>{weddingDataState.invitation.subtitle}</h3>
                    </div>
                    <div className={styles.coupleImages} ref={coupleImagesRef}>
                        {weddingDataState.coupleImages.map((img, index) => (
                            <img
                                key={index}
                                src={img.src}
                                alt={img.alt}
                                className={clsx(styles.coupleImg, { [styles.centerImg]: img.isCenter })}
                                data-aos="fade-up"
                                data-aos-delay={(100 * (index + 1)).toString()}
                                onClick={() =>
                                    triggerFileInput(`couple_${index}` as keyof typeof fileInputRefs, `couple_${index}`)
                                }
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                        {weddingDataState.coupleImages.map((_, index) => (
                            <input
                                key={`couple_${index}`}
                                type="file"
                                ref={fileInputRefs[`couple_${index}` as keyof typeof fileInputRefs]}
                                onChange={(e) => handleImageChange(`couple_${index}` as keyof Images, e)}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        ))}
                    </div>

                    <div className={styles.infomation} data-aos="fade-up" data-aos-duration="1200">
                        <p className={styles.eventDetails}>{weddingDataState.eventDetails || ''}</p>
                        <p className={styles.eventTime}>Vào Lúc</p>
                        <div className={styles.dateContainer}>
                            <span className={styles.time}>{weddingDataState.invitation.time || ''}</span>
                            <div className={styles.column}>
                                <span className={styles.dayOfWeek}>
                                    {weddingDataState.invitation.dayOfWeek || 'Destination'}
                                </span>
                                <span className={styles.day}>{weddingDataState.invitation.day || ''}</span>
                                <span className={styles.month}>{weddingDataState.invitation.month || ''}</span>
                            </div>
                            <span className={styles.year}>{weddingDataState.invitation.year || ''}</span>
                        </div>
                        <p className={styles.lunarDate}>
                            {weddingDataState.invitation.lunarDate
                                ? `(${weddingDataState.invitation.lunarDate})`
                                : '(Chưa có ngày âm lịch)'}
                        </p>
                        <h2 className={styles.monthYear}>{weddingDataState.invitation.monthYear || ''}</h2>
                    </div>
                    <div className={styles.calendar} data-aos="zoom-in" data-aos-duration="1000">
                        <h3>{weddingDataState.calendar.month || ''}</h3>
                        <div className={styles.calendarHeader}>
                            <span>CN</span>
                            <span>T2</span>
                            <span>T3</span>
                            <span>T4</span>
                            <span>T5</span>
                            <span>T6</span>
                            <span>T7</span>
                        </div>
                        <div className={styles.calendarBody}>
                            {weddingDataState.calendar.days?.length > 0 ? (
                                weddingDataState.calendar.days.map((day, index) => (
                                    <span
                                        key={index}
                                        className={
                                            Number(day) === weddingDataState.calendar.highlightDay
                                                ? styles.highlight
                                                : ''
                                        }
                                    >
                                        {Number(day) === weddingDataState.calendar.highlightDay ? (
                                            <span className={styles.highlightContent}>
                                                <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
                                                <span>{day}</span>
                                            </span>
                                        ) : (
                                            day
                                        )}
                                    </span>
                                ))
                            ) : (
                                <span>Chưa có dữ liệu lịch</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.location} data-aos="fade-up" data-aos-duration="1000">
                        <div className={styles.dotLeft}></div>
                        <div className={styles.dotRight}></div>
                        <h4>Địa điểm tổ chức</h4>
                        <div className={styles.locationContent}>
                            <h5>
                                {weddingDataState.location.groomLocation.name}{' '}
                                {weddingDataState.location.groomLocation.address}
                            </h5>
                            <iframe
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={weddingDataState.location.groomLocation.mapEmbedUrl}
                            />
                        </div>
                        <div className={styles.locationContent}>
                            <h5>
                                {weddingDataState.location.brideLocation.name}{' '}
                                {weddingDataState.location.brideLocation.address}
                            </h5>
                            <iframe
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={weddingDataState.location.brideLocation.mapEmbedUrl}
                            />
                        </div>
                    </div>

                    <div className={styles.thumnail} data-aos="fade-up" data-aos-duration="1000">
                        <div className={styles.dotLeft}></div>
                        <div className={styles.dotRight}></div>
                        <h4>Khoảnh khắc đáng nhớ</h4>
                        <div className={styles.thumnailImages} ref={thumnailImagesRef}>
                            {weddingDataState.thumnailImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.src}
                                    alt={img.alt}
                                    className={clsx(styles.thumnailImg, { [styles.centerImg]: img.isCenter })}
                                    data-aos="fade-up"
                                    data-aos-delay={(100 * (index + 1)).toString()}
                                    onClick={() =>
                                        triggerFileInput(
                                            `thumnail_${index}` as keyof typeof fileInputRefs,
                                            `thumnail_${index}`
                                        )
                                    }
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                            {weddingDataState.thumnailImages.map((_, index) => (
                                <input
                                    key={`thumnail_${index}`}
                                    type="file"
                                    ref={fileInputRefs[`thumnail_${index}` as keyof typeof fileInputRefs]}
                                    onChange={(e) => handleImageChange(`thumnail_${index}` as keyof Images, e)}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.bestRegards}>
                        <div className={styles.dotLeft}></div>
                        <div className={styles.dotRight}></div>
                        <h1>Thanks You</h1>
                        <span>
                            Chúng tôi háo hức mong chờ đến chung vui trong ngày trọng đại của đời mình, một dấu mốc
                            thiêng liêng và đáng nhớ. Sẽ thật trọn vẹn và ý nghĩa biết bao nếu có sự hiện diện cùng lời
                            chúc phúc chân thành từ bạn trong
                        </span>
                        <span style={{ display: 'block' }}>khoảnh khắc đặc biệt ấy.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Template1Edit;
