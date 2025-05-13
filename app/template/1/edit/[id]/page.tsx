'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import weddingData from './weddingData_Mau1/weddingData';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './mau_1.module.css';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import EditControls from '../../../EditControl/EditControl';
import InviteePopup from 'app/popup/InviteePopup/InviteePopup';
import { useApi } from 'app/lib/apiContext/apiContext';

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
    calendar: { month: string; days: (string | number)[]; highlightDay: number }; // Removed year field
    location: {
        groomLocation: { name: string; address: string; mapEmbedUrl: string };
        brideLocation: { name: string; address: string; mapEmbedUrl: string };
    };
    coupleImages: { src: string; alt: string; isCenter?: boolean }[];
    thumnailImages: { src: string; alt: string; isCenter?: boolean }[];
}

const Template1Edit: React.FC = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const quantity = parseInt(searchParams.get('quantity') || '1');
    const totalPrice = parseInt(searchParams.get('totalPrice') || '0');

    const coupleImagesRef = useRef<HTMLDivElement>(null);
    const thumnailImagesRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<{
        type: 'banner' | 'groom' | 'bride' | 'couple' | 'thumnail';
        index?: number;
    } | null>(null);
    const [weddingImages, setWeddingImages] = useState<{ file: File; position: string }[]>([]);
    const [inviteeNames, setInviteeNames] = useState<string[]>([]);

    const api = useApi();

    const [weddingDataState, setWeddingDataState] = useState<Template1WeddingData>(() => {
        const savedData = localStorage.getItem('weddingData_template1');
        let parsedData: any;

        try {
            parsedData = savedData ? JSON.parse(savedData) : weddingData;
        } catch (error) {
            console.error('Lỗi khi parse localStorage:', error);
            parsedData = weddingData;
        }

        // Transform highlightDay to number and handle calendar.days
        const mergedData: Template1WeddingData = {
            ...weddingData,
            ...parsedData,
            invitation: {
                ...weddingData.invitation,
                ...parsedData.invitation,
                lunarDate: parsedData.invitation?.lunarDate || weddingData.invitation.lunarDate,
            },
            calendar: {
                month: parsedData.calendar?.month || weddingData.calendar.month,
                days: (parsedData.calendar?.days || weddingData.calendar.days).map((day: string) =>
                    day === '' ? '' : parseInt(day, 10)
                ) as (string | number)[], // Convert days to numbers where possible
                highlightDay: parseInt(parsedData.calendar?.highlightDay || weddingData.calendar.highlightDay, 10),
            },
        };

        console.log('Khởi tạo weddingDataState:', mergedData);
        return mergedData;
    });

    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showInviteePopup, setShowInviteePopup] = useState(false);

    const base64ToFile = (base64: string, filename: string): File => {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    useEffect(() => {
        const newWeddingImages: { file: File; position: string }[] = [];

        if (weddingDataState.banner.image.startsWith('data:image')) {
            newWeddingImages.push({
                file: base64ToFile(weddingDataState.banner.image, 'banner.png'),
                position: 'banner',
            });
        }

        if (weddingDataState.couple.groom.image.startsWith('data:image')) {
            newWeddingImages.push({
                file: base64ToFile(weddingDataState.couple.groom.image, 'groom.png'),
                position: 'groom',
            });
        }

        if (weddingDataState.couple.bride.image.startsWith('data:image')) {
            newWeddingImages.push({
                file: base64ToFile(weddingDataState.couple.bride.image, 'bride.png'),
                position: 'bride',
            });
        }

        weddingDataState.coupleImages.forEach((img, index) => {
            if (img.src.startsWith('data:image')) {
                newWeddingImages.push({
                    file: base64ToFile(img.src, `couple_${index}.png`),
                    position: `couple_${index}`,
                });
            }
        });

        weddingDataState.thumnailImages.forEach((img, index) => {
            if (img.src.startsWith('data:image')) {
                newWeddingImages.push({
                    file: base64ToFile(img.src, `thumnail_${index}.png`),
                    position: `thumnail_${index}`,
                });
            }
        });

        setWeddingImages(newWeddingImages);
    }, [weddingDataState]);

    const handleSaveEdit = (updatedData: Template1WeddingData) => {
        const dayNumber = parseInt(updatedData.invitation.day, 10);
        if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
            alert('Ngày cưới không hợp lệ. Vui lòng nhập số từ 1 đến 31.');
            return;
        }

        const updatedDays = Array.from({ length: Math.max(31, dayNumber) }, (_, i) => i + 1);

        const updatedDataWithHighlight = {
            ...weddingDataState,
            ...updatedData,
            calendar: {
                ...updatedData.calendar,
                highlightDay: dayNumber,
                days: updatedDays,
            },
        };

        console.log('Dữ liệu trước khi lưu:', updatedDataWithHighlight);
        setWeddingDataState(updatedDataWithHighlight);
        localStorage.setItem('weddingData_template1', JSON.stringify(updatedDataWithHighlight));
        console.log('Dữ liệu trong localStorage sau khi lưu:', localStorage.getItem('weddingData_template1'));
        setShowEditPopup(false);
    };

    const handleInviteePopupClose = () => {
        setShowInviteePopup(false);
    };

    const handleImageClick = (type: 'banner' | 'groom' | 'bride' | 'couple' | 'thumnail', index?: number) => {
        setSelectedImage({ type, index });
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedImage) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSizeInMB = 2;
            if (!validTypes.includes(file.type)) {
                alert('Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, hoặc GIF).');
                return;
            }
            if (file.size > maxSizeInMB * 1024 * 1024) {
                alert(`Kích thước file vượt quá ${maxSizeInMB}MB.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                setWeddingDataState((prevState) => {
                    const updatedData = { ...prevState };
                    switch (selectedImage.type) {
                        case 'banner':
                            updatedData.banner.image = imageUrl;
                            break;
                        case 'groom':
                            updatedData.couple.groom.image = imageUrl;
                            break;
                        case 'bride':
                            updatedData.couple.bride.image = imageUrl;
                            break;
                        case 'couple':
                            if (selectedImage.index !== undefined) {
                                updatedData.coupleImages[selectedImage.index] = {
                                    ...updatedData.coupleImages[selectedImage.index],
                                    src: imageUrl,
                                };
                            }
                            break;
                        case 'thumnail':
                            if (selectedImage.index !== undefined) {
                                updatedData.thumnailImages[selectedImage.index] = {
                                    ...updatedData.thumnailImages[selectedImage.index],
                                    src: imageUrl,
                                };
                            }
                            break;
                    }
                    localStorage.setItem('weddingData_template1', JSON.stringify(updatedData));
                    return updatedData;
                });
            };
            reader.readAsDataURL(file);
            event.target.value = '';
            setSelectedImage(null);
        }
    };

    const handleSaveCard = async () => {
        try {
            // Create FormData object to match the API expectation
            const formData = new FormData();
            formData.append('templateId', parseInt(id).toString());
            formData.append('weddingData', JSON.stringify(weddingDataState));
            formData.append('inviteeNames', JSON.stringify(inviteeNames));
            formData.append('totalPrice', totalPrice.toString());

            // Append weddingImages with their positions
            weddingImages.forEach((image, index) => {
                formData.append('weddingImages', image.file);
            });
            if (weddingImages.length > 0) {
                formData.append('positions', JSON.stringify(weddingImages.map((img) => img.position)));
            }

            // Log the FormData for debugging
            console.log('Dữ liệu gửi lên saveCard:', Array.from(formData.entries()));

            // Call saveCard with FormData
            const response = await api.saveCard(formData);
            console.log('Card saved:', response);

            // Clear localStorage after successful save
            localStorage.removeItem('weddingData_template1');
            localStorage.removeItem('weddingImages');
        } catch (error) {
            console.error('Lỗi khi lưu card:', error);
        }
    };

    useEffect(() => {
        AOS.init();
        const coupleImages = coupleImagesRef.current?.querySelectorAll(`.${styles.coupleImg}`);
        coupleImages?.forEach((img) => {
            const element = img as HTMLElement;
            element.addEventListener('click', () => {
                coupleImages.forEach((otherImg) => {
                    const otherElement = otherImg as HTMLElement;
                    otherElement.classList.remove(styles.centerImg);
                    otherElement.setAttribute('style', '');
                });
                element.classList.add(styles.centerImg);
                element.style.order = '0';
                let order = -1;
                coupleImages.forEach((otherImg) => {
                    if (otherImg !== img) {
                        const otherElement = otherImg as HTMLElement;
                        otherElement.style.order = order.toString();
                        order += 2;
                    }
                });
            });
        });

        const thumnailImages = thumnailImagesRef.current?.querySelectorAll(`.${styles.thumnailImg}`);
        thumnailImages?.forEach((img) => {
            const element = img as HTMLElement;
            element.addEventListener('click', () => {
                thumnailImages.forEach((otherImg) => {
                    const otherElement = otherImg as HTMLElement;
                    otherElement.classList.remove(styles.centerImg);
                });
                element.classList.add(styles.centerImg);
            });
        });

        return () => {
            coupleImages?.forEach((img) => img.removeEventListener('click', () => {}));
            thumnailImages?.forEach((img) => img.removeEventListener('click', () => {}));
        };
    }, []);

    useEffect(() => {
        console.log('weddingDataState.calendar:', weddingDataState.calendar);
        console.log('invitation.day:', weddingDataState.invitation.day);
        console.log('invitation.lunarDate:', weddingDataState.invitation.lunarDate);
    }, [weddingDataState]);

    if (!weddingDataState.calendar || !weddingDataState.calendar.days || !weddingDataState.calendar.highlightDay) {
        return <div>Đang tải dữ liệu lịch...</div>;
    }

    return (
        <div className={styles.bg}>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <div className={styles.bannerImageHeader} data-aos="fade-up" data-aos-duration="1000">
                <img
                    src={weddingDataState.banner.image}
                    alt="Wedding Banner"
                    onClick={() => handleImageClick('banner')}
                    style={{ cursor: 'pointer' }}
                />
                <div className={styles.contentHeader}>
                    <h3>
                        {weddingDataState.couple.groom.name} & {weddingDataState.couple.bride.name}
                    </h3>
                </div>
                <div className={styles.infomation}>
                    <h2>{weddingDataState.invitation.title}</h2>
                    <div className={styles.dateTime}>
                        <span>{`${weddingDataState.invitation.dayOfWeek} - ${weddingDataState.invitation.time}`}</span>
                        <div
                            className={styles.day}
                        >{`${weddingDataState.invitation.day}.${weddingDataState.invitation.month.replace('Tháng ', '')}.${weddingDataState.invitation.year}`}</div>
                    </div>
                </div>
            </div>

            <div className={styles.wrapper}>
                <div className={styles.wrapperBanner}>
                    <div className={styles.banner2} data-aos="fade-up" data-aos-duration="1200">
                        <div className={styles.loveQuote}>
                            <h2>Hôn nhân là chuyện cả đời</h2>
                            <h2>Yêu người vừa ý, cưới người mình thương, ...</h2>
                        </div>
                        <div className={styles.familyInfo}>
                            <div className={styles.groomFamily} data-aos="fade-right" data-aos-delay="200">
                                <h3>{weddingDataState.familyInfo.groomFamily.title}</h3>
                                <p>{`Ông: ${weddingDataState.familyInfo.groomFamily.father}`}</p>
                                <p>{`Bà: ${weddingDataState.familyInfo.groomFamily.mother}`}</p>
                            </div>
                            <div className={styles.brideFamily} data-aos="fade-left" data-aos-delay="200">
                                <h3>{weddingDataState.familyInfo.brideFamily.title}</h3>
                                <p>{`Ông: ${weddingDataState.familyInfo.brideFamily.father}`}</p>
                                <p>{`Bà: ${weddingDataState.familyInfo.brideFamily.mother}`}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.banner3} data-aos="zoom-in" data-aos-duration="1000">
                        <div className={styles.coupleInfo}>
                            <div className={styles.groom} data-aos="fade-right" data-aos-delay="300">
                                <img
                                    src={weddingDataState.couple.groom.image}
                                    alt="Groom"
                                    onClick={() => handleImageClick('groom')}
                                    style={{ cursor: 'pointer' }}
                                />
                                <h3>{weddingDataState.couple.groom.name}</h3>
                            </div>
                            <div className={styles.bride} data-aos="fade-left" data-aos-delay="300">
                                <img
                                    src={weddingDataState.couple.bride.image}
                                    alt="Bride"
                                    onClick={() => handleImageClick('bride')}
                                    style={{ cursor: 'pointer' }}
                                />
                                <h3>{weddingDataState.couple.bride.name}</h3>
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
                                onClick={() => handleImageClick('couple', index)}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </div>
                    <div className={styles.infomation} data-aos="fade-up" data-aos-duration="1200">
                        <p className={styles.eventDetails}>{weddingDataState.eventDetails}</p>
                        <p className={styles.eventTime}>Vào Lúc</p>
                        <div className={styles.dateContainer}>
                            <span className={styles.time}>{weddingDataState.invitation.time}</span>
                            <div className={styles.column}>
                                <span className={styles.dayOfWeek}>{weddingDataState.invitation.dayOfWeek}</span>
                                <span className={styles.day}>{weddingDataState.invitation.day}</span>
                                <span className={styles.month}>{weddingDataState.invitation.month}</span>
                            </div>
                            <span className={styles.year}>{weddingDataState.invitation.year}</span>
                        </div>
                        <p className={styles.lunarDate}>
                            {weddingDataState.invitation.lunarDate
                                ? `(${weddingDataState.invitation.lunarDate})`
                                : '(Chưa có ngày âm lịch)'}
                        </p>
                        <h2 className={styles.monthYear}>{weddingDataState.invitation.monthYear}</h2>
                    </div>
                    <div className={styles.calendar} data-aos="zoom-in" data-aos-duration="1000">
                        <h3>{weddingDataState.calendar.month}</h3>
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
                            {weddingDataState.calendar.days.map((day, index) => (
                                <span
                                    key={index}
                                    className={
                                        Number(day) === weddingDataState.calendar.highlightDay ? styles.highlight : ''
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
                            ))}
                        </div>
                    </div>

                    <div className={styles.location} data-aos="fade-up" data-aos-duration="1000">
                        <div className={styles.dotLeft}></div>
                        <div className={styles.dotRight}></div>
                        <h4>Địa điểm tổ chức</h4>
                        <div className={styles.locationContent}>
                            <h5>{weddingDataState.location.groomLocation.name}</h5>
                            <p>{weddingDataState.location.groomLocation.address}</p>
                            <iframe
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={weddingDataState.location.groomLocation.mapEmbedUrl}
                            ></iframe>
                        </div>
                        <div className={styles.locationContent}>
                            <h5>{weddingDataState.location.brideLocation.name}</h5>
                            <p>{weddingDataState.location.brideLocation.address}</p>
                            <iframe
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={weddingDataState.location.brideLocation.mapEmbedUrl}
                            ></iframe>
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
                                    onClick={() => handleImageClick('thumnail', index)}
                                    style={{ cursor: 'pointer' }}
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
            <EditControls
                weddingData={weddingDataState}
                quantity={quantity}
                totalPrice={totalPrice}
                id={id}
                showEditPopup={showEditPopup}
                showInviteePopup={showInviteePopup}
                setShowEditPopup={setShowEditPopup}
                setShowInviteePopup={setShowInviteePopup}
                onSaveEdit={handleSaveEdit}
                onInviteePopupClose={handleInviteePopupClose}
                templateType="template1"
                onSaveCard={handleSaveCard}
            />
            {showInviteePopup && (
                <InviteePopup
                    quantity={quantity}
                    totalPrice={totalPrice}
                    onClose={handleInviteePopupClose}
                    id={id}
                    weddingImages={weddingImages}
                    setInviteeNames={setInviteeNames}
                    weddingData={weddingDataState}
                />
            )}
        </div>
    );
};

export default Template1Edit;
