'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './17.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompress } from '@fortawesome/free-solid-svg-icons';
import QRCodeDisplay from 'app/pages/DefaultLayouts/CodeDisplayTC/QRCodeDisplay';

// Define interfaces for the data structure
interface CountdownLabels {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
}

interface Images {
    countdown: string;
    coupleTop: string;
    coupleMiddle: string;
    coupleBottom: string;
    flow1: string;
    default1: string;
    gallery: {
        moment1: string;
        moment2: string;
        moment3: string;
        moment4: string;
        moment5: string;
        moment6: string;
        moment7: string;
    };
}

interface Family {
    father: string;
    mother: string;
    address: string;
    mapIframeSrc: string;
}

interface Couple {
    groom: {
        firstName: string;
        family: Family;
    };
    bride: {
        firstName: string;
        family: Family;
    };
}

interface InvitationDetails {
    date: string;
    location: string;
    time: string;
    day: string;
    lunarDate: string;
    saveTheDate: string;
}

interface Invitation {
    mainText: string;
    subText: string;
    footerText1: string;
    footerText2: string;
    groom: InvitationDetails;
    bride: InvitationDetails;
    googleMapButton: string;
}

interface ScheduleItem {
    time: string;
    event: string;
}

interface Schedule {
    groom: ScheduleItem[];
    bride: ScheduleItem[];
}

interface GalleryItem {
    time: string;
    image: string;
}

interface DefaultData {
    weddingDates: {
        groom: string;
        bride: string;
    };
    countdownLabels: CountdownLabels;
    images: Images;
    couple: Couple;
    invitation: Invitation;
    schedule: Schedule;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const defaultData: DefaultData = {
    weddingDates: {
        groom: '2025-09-28T23:30:00',
        bride: '2025-09-27T23:30:00',
    },
    countdownLabels: {
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds',
    },
    images: {
        countdown: '/images/m17/8.jpg',
        coupleTop: '/images/m17/4.jpg',
        coupleMiddle: '/images/m17/3.jpg',
        coupleBottom: '/images/m17/2.jpg',
        flow1: '/images/m17/flow_1.png',
        default1: '/images/m17/91f22ed5da8ce8a9cd7df67d55ec9907-Photoroom.png',
        gallery: {
            moment1: '/images/m17/4.jpg',
            moment2: '/images/m17/2.jpg',
            moment3: '/images/m17/3.jpg',
            moment4: '/images/m17/1.jpg',
            moment5: '/images/m17/5.jpg',
            moment6: '/images/m17/6.jpg',
            moment7: '/images/m17/9.jpg',
        },
    },
    couple: {
        groom: {
            firstName: 'Quốc Hưng',
            family: {
                father: 'Nguyễn Văn A',
                mother: 'Trần Thị B',
                address: '1 Convention Centre Pl, South Wharf VIC 3006, Australia',
                mapIframeSrc:
                    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239454.4037726524!2d144.9078101544932!3d-37.76250956459615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad64ef0d456f689%3A0x9caeec3cabf3f72f!2sThe%20Grande%20Reception%20%26%20Function%20Centre%20-%20Wedding%20Venue%20Melbourne!5e1!3m2!1svi!2s!4v1757921801414!5m2!1svi!2s',
            },
        },
        bride: {
            firstName: 'Bảo Yến',
            family: {
                father: 'Lê Văn C',
                mother: 'Phạm Thị D',
                address: '420 Ringwood-Warrandyte Rd, Warrandyte VIC 3113, Australia',
                mapIframeSrc:
                    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239454.4037726524!2d144.9078101544932!3d-37.76250956459615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6365b979d3d87%3A0x2f87137243a2a210!2sBallara%20Receptions%20-%20Wedding%20Venue%20Melbourne!5e1!3m2!1svi!2s!4v1757921814792!5m2!1svi!2s',
            },
        },
    },
    invitation: {
        mainText: 'TOGETHER WITH OUR FAMILIES INVITE YOU TO <br /> JOIN US IN CELEBRATING OUR WEDDING',
        subText: 'WITH GREAT <br /> PLEASURE THAT WE',
        footerText1: 'Sincerely Invite You',
        footerText2: 'Join us to celebrate our wedding and happiness',
        groom: {
            date: '28.09.2025',
            location: 'The Grande Reception & Function Centre',
            time: '11:30',
            day: 'Chủ Nhật',
            lunarDate: 'Nhằm Ngày 07/08 Âm Lịch Năm Ất Tỵ',
            saveTheDate: 'September 28, 2025 | 11:30 P.M.',
        },
        bride: {
            date: '27.09.2025',
            location: 'Ballara Receptions',
            time: '11:30',
            day: 'Thứ Bảy',
            lunarDate: 'Nhằm Ngày 06/08 Âm Lịch Năm Ất Tỵ',
            saveTheDate: 'September 27, 2025 | 11:30 P.M.',
        },
        googleMapButton: 'Chỉ đường Google Map',
    },
    schedule: {
        groom: [
            { time: 'Đón khách', event: '' },
            { time: '', event: 'Làm lễ' },
            { time: 'Chụp ảnh', event: '' },
            { time: '', event: 'Nhập tiệc cưới' },
        ],
        bride: [
            { time: 'Đón khách', event: '' },
            { time: '', event: 'Lễ cưới' },
            { time: 'Chụp hình', event: '' },
            { time: '', event: 'Tiệc cưới' },
        ],
    },
};

const Template17C: React.FC = () => {
    const userId: number = 999999; // Unique userId for this instance
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [guestType, setGuestType] = useState<'groom' | 'bride' | null>(null);
    const [showMapPopup, setShowMapPopup] = useState<boolean>(false);
    const [closing, setClosing] = useState(false);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [isCollapsing, setIsCollapsing] = useState<boolean>(false);

    useEffect(() => {
        if (!guestType) return;

        const targetDate = new Date(
            guestType === 'bride' ? defaultData.weddingDates.bride : defaultData.weddingDates.groom
        ).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [guestType]);

    const handleGuestSelection = (type: 'groom' | 'bride'): void => {
        setGuestType(type);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
    };

    const handleCollapse = (): void => {
        setIsCollapsing(true);
        setTimeout(() => {
            setGuestType(null);
            setIsCollapsing(false);
        }, 700);
    };

    const handleMapButtonClick = (): void => {
        setShowMapPopup(true);
    };

    const closeMapPopup = () => {
        setClosing(true);
        setTimeout(() => {
            setShowMapPopup(false);
            setClosing(false);
        }, 500);
    };

    const handleImageClick = (image: string) => {
        setExpandedImage(expandedImage === image ? null : image);
    };

    const invitationData: InvitationDetails =
        guestType === 'bride' ? defaultData.invitation.bride : defaultData.invitation.groom;
    const scheduleData: ScheduleItem[] =
        guestType === 'bride' ? defaultData.schedule.bride : defaultData.schedule.groom;
    const mapIframeSrc: string =
        guestType === 'bride'
            ? defaultData.couple.bride.family.mapIframeSrc
            : defaultData.couple.groom.family.mapIframeSrc;

    const galleryItems: GalleryItem[] = [
        { time: 'Khoảnh khắc đầu tiên', image: defaultData.images.gallery.moment1 },
        { time: 'Giây phút hạnh phúc', image: defaultData.images.gallery.moment2 },
        { time: 'Lời thề nguyện', image: defaultData.images.gallery.moment3 },
        { time: 'Nụ cười & niềm vui', image: defaultData.images.gallery.moment4 },
        { time: 'Khoảnh khắc ngọt ngào', image: defaultData.images.gallery.moment5 },
        { time: 'Bên nhau trọn đời', image: defaultData.images.gallery.moment6 },
        { time: 'Hạnh phúc viên mãn', image: defaultData.images.gallery.moment7 },
    ];

    return (
        <div className={styles.template17c}>
            {guestType === null && (
                <div className={styles.guestPopup}>
                    <div className={styles.guestPopup__content}>
                        <h2>Bạn là khách mời của ai?</h2>
                        <button onClick={() => handleGuestSelection('groom')}>
                            Khách của chú rể ({defaultData.couple.groom.firstName})
                        </button>
                        <button onClick={() => handleGuestSelection('bride')}>
                            Khách của cô dâu ({defaultData.couple.bride.firstName})
                        </button>
                    </div>
                </div>
            )}
            {guestType && (
                <>
                    <div className={styles.expand_invitions} onClick={handleCollapse}>
                        <FontAwesomeIcon icon={faCompress} className={styles.icon} />
                    </div>
                    <div
                        className={`${styles.wrapper} ${isAnimating ? styles.animate : ''} ${isCollapsing ? styles.collapse : ''}`}
                    >
                        <div className={styles.first}>
                            <div
                                className={styles.text_1}
                                dangerouslySetInnerHTML={{ __html: defaultData.invitation.mainText }}
                            />
                            <div className={styles.center_pss}>
                                <div className={styles.center_abs}>
                                    <div
                                        className={styles.text_2}
                                        dangerouslySetInnerHTML={{ __html: defaultData.invitation.subText }}
                                    />
                                    <div className={styles.groom_name}>
                                        {defaultData.couple.groom.firstName}
                                        <div className={styles.and}>&</div>
                                    </div>
                                    <div className={styles.bride_name}>{defaultData.couple.bride.firstName}</div>
                                </div>
                            </div>
                            <div className={styles.footer}>
                                <div className={styles.text_3}>{defaultData.invitation.footerText1}</div>
                                <div className={styles.text_4}>{defaultData.invitation.footerText2}</div>
                                <div className={styles.DateTime}>{invitationData.date}</div>
                            </div>
                            <div className={styles.image_flow1}>
                                <img src={defaultData.images.flow1} alt="Flow decoration" />
                            </div>
                        </div>

                        <div className={styles.family_info__wrapper}>
                            <div className={styles.family_info}>
                                <div className={styles.groom_family}>
                                    <span>groom&apos;s family</span>
                                    <div style={{ marginTop: '1.5rem' }}>
                                        Ông: <strong>{defaultData.couple.groom.family.father}</strong>
                                    </div>
                                    <div>
                                        Bà: <strong>{defaultData.couple.groom.family.mother}</strong>
                                    </div>
                                    <div className={styles.location}>{defaultData.couple.groom.family.address}</div>
                                </div>
                                <div className={styles.bride_family}>
                                    <span>bride&apos;s family</span>
                                    <div style={{ marginTop: '1.5rem' }}>
                                        Ông: <strong>{defaultData.couple.bride.family.father}</strong>
                                    </div>
                                    <div>
                                        Bà: <strong>{defaultData.couple.bride.family.mother}</strong>
                                    </div>
                                    <div className={styles.location}>{defaultData.couple.bride.family.address}</div>
                                </div>
                            </div>

                            <div className={styles.invitation_sub}>
                                <p className={styles.subtilte}>Trân trọng báo tin Lễ Thành Hôn</p>
                                <div className={styles.invitation__names}>
                                    <div className={styles.groom__names}>{defaultData.couple.groom.firstName}</div>
                                    <div className={styles.and}>&</div>
                                    <div className={styles.bride__names}>{defaultData.couple.bride.firstName}</div>
                                </div>
                                <p className={styles.invitation__location}>
                                    Hôn Lễ được cử hành tại <br />
                                    {invitationData.location}
                                </p>
                                <div className={styles.invitation__datetime}>
                                    <div className={styles.dateTime_flex}>
                                        <div className={styles.flex_left}>
                                            <span>
                                                Vào Lúc: <strong>{invitationData.time}</strong>
                                            </span>
                                            <span>{invitationData.day}</span>
                                        </div>
                                        <div className={styles.flex_right}>
                                            <span>{invitationData.date.split('.')[0]}</span>
                                            <span>{invitationData.date.split('.')[2]}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.lunarDay}>({invitationData.lunarDate})</div>
                                <div className={styles.img_default_1}>
                                    <img src={defaultData.images.default1} alt="Decoration" />
                                </div>
                                <button className={styles.btn_googleMap} onClick={handleMapButtonClick}>
                                    {defaultData.invitation.googleMapButton}
                                </button>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.card__imageTop}>
                                    <img src={defaultData.images.coupleTop} alt="Couple" />
                                </div>
                                <div className={styles.card__saveDate}>
                                    <h2 className={styles.card__saveDateTitle}>SAVE THE DATE</h2>
                                    <p className={styles.card__saveDateInfo}>{invitationData.saveTheDate}</p>
                                </div>
                                <div className={styles.card__imageMiddle}>
                                    <img src={defaultData.images.coupleMiddle} alt="Couple" />
                                </div>
                                <div className={styles.card__coupleNames}>
                                    {defaultData.couple.groom.firstName} &amp; {defaultData.couple.bride.firstName}
                                </div>
                                <div className={styles.card__imageBottom}>
                                    <img src={defaultData.images.coupleBottom} alt="Couple" />
                                </div>
                                <div className={styles.card__footer}>And you are invited</div>
                            </div>

                            <section className={styles.Schedule}>
                                <h2 className={styles.Schedule__title}>Wedding Program</h2>
                                <ul className={styles.Schedule__list}>
                                    {scheduleData.map((item: ScheduleItem, index: number) => (
                                        <li key={index}>
                                            <span className={styles.time}>
                                                <em>{item.time}</em>
                                            </span>
                                            <span className={styles.dot}></span>
                                            <span className={styles.event}>
                                                <em>{item.event}</em>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        <div className={styles.countdown}>
                            <img src={defaultData.images.countdown} alt="Countdown background" />
                            <div className={styles.countdown__timer}>
                                <div className={styles.countdown__item}>
                                    <span>{timeLeft.days}</span>
                                    <span>{defaultData.countdownLabels.days}</span>
                                </div>
                                <div className={styles.countdown__item}>
                                    <span>{timeLeft.hours}</span>
                                    <span>{defaultData.countdownLabels.hours}</span>
                                </div>
                                <div className={styles.countdown__item}>
                                    <span>{timeLeft.minutes}</span>
                                    <span>{defaultData.countdownLabels.minutes}</span>
                                </div>
                                <div className={styles.countdown__item}>
                                    <span>{timeLeft.seconds}</span>
                                    <span>{defaultData.countdownLabels.seconds}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.schedule_galaryImage}>
                            <h3>Gallery Image</h3>
                            <div className={styles.timeline}>
                                {galleryItems.map((item, index) => (
                                    <div className={styles.item} key={index}>
                                        <div
                                            className={`${styles.schedule_content} ${
                                                expandedImage === item.image ? styles.expanded : ''
                                            }`}
                                            onClick={() => handleImageClick(item.image)}
                                        >
                                            <img src={item.image} alt={item.time} />
                                            <div className={styles.time}>{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <QRCodeDisplay userId={userId} guestType={guestType} />

                        <div className={styles.text_ThanksYou}>
                            Thanks You
                        </div>
                    </div>

                    {showMapPopup && (
                        <div
                            className={`${styles.mapPopup} ${
                                closing ? styles.mapPopup__closeAnim : styles.mapPopup__open
                            }`}
                        >
                            <div className={styles.mapPopup__content}>
                                <button className={styles.mapPopup__close} onClick={closeMapPopup}>
                                    ✕
                                </button>
                                <iframe
                                    src={mapIframeSrc}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={false}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {expandedImage && (
                        <div className={styles.imageOverlay} onClick={() => setExpandedImage(null)}>
                            <div className={styles.expandedImageContainer}>
                                <img src={expandedImage} alt="Expanded" className={styles.expandedImage} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Template17C;
