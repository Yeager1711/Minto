'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import weddingData from './weddingData_Mau1/weddingData';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './mau_1.module.scss';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import EditControls from '../../../control/EditControl';

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

    // Initialize weddingData with localStorage or default
    const [weddingDataState, setWeddingDataState] = useState<Template1WeddingData>(() => {
        const savedData = localStorage.getItem('weddingData_template1');
        return savedData ? JSON.parse(savedData) : weddingData;
    });

    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showInviteePopup, setShowInviteePopup] = useState(false);

    const handleSaveEdit = (updatedData: Template1WeddingData) => {
        setWeddingDataState(updatedData);
        localStorage.setItem('weddingData_template1', JSON.stringify(updatedData));
        setShowEditPopup(false);
    };

    const handleInviteePopupClose = () => setShowInviteePopup(false);

    // Handle image click to trigger file input
    const handleImageClick = (type: 'banner' | 'groom' | 'bride' | 'couple' | 'thumnail', index?: number) => {
        setSelectedImage({ type, index });
        fileInputRef.current?.click();
    };

    // Handle file selection and update state
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedImage) {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSizeInMB = 2; // 2MB limit to reduce Base64 size
            if (!validTypes.includes(file.type)) {
                alert('Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, hoặc GIF).');
                return;
            }
            if (file.size > maxSizeInMB * 1024 * 1024) {
                alert(`Kích thước file vượt quá ${maxSizeInMB}MB.`);
                return;
            }

            // Convert image to Base64
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;

                // Update state and save to localStorage
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
                    // Save to localStorage
                    localStorage.setItem('weddingData_template1', JSON.stringify(updatedData));
                    return updatedData;
                });
            };
            reader.readAsDataURL(file);

            // Reset file input and selected image
            event.target.value = '';
            setSelectedImage(null);
        }
    };

    useEffect(() => {
        AOS.init();

        // Handle couple images click for centering
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

        // Handle thumbnail images click for centering
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

        // Cleanup event listeners
        return () => {
            coupleImages?.forEach((img) => img.removeEventListener('click', () => {}));
            thumnailImages?.forEach((img) => img.removeEventListener('click', () => {}));
        };
    }, []);

    return (
        <div className={styles.bg}>
            {/* Hidden file input for image selection */}
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
                            <h2>{`"${weddingDataState.loveQuote_1}"`}</h2>
                            <h2>{`"${weddingDataState.loveQuote_2}"`}</h2>
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
                        <p className={styles.lunarDate}>{`(${weddingDataState.invitation.lunarDate})`}</p>
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
                                    className={day === weddingDataState.calendar.highlightDay ? styles.highlight : ''}
                                >
                                    {day === weddingDataState.calendar.highlightDay ? (
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
            />
        </div>
    );
};

export default Template1Edit;
