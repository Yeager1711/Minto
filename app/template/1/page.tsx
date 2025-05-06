// components/WeddingInvitation.tsx
'use client';
import { useEffect, useRef } from 'react';
import weddingData from './weddingData_Mau1/weddingData';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './mau_1.module.scss';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const WeddingInvitation: React.FC = () => {
    const coupleImagesRef = useRef<HTMLDivElement>(null);
    const thumnailImagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        AOS.init();

        // Handle couple images click
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

        // Handle thumbnail images click
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
            <div className={styles.bannerImageHeader} data-aos="fade-up" data-aos-duration="1000">
                <img src={weddingData.banner.image} alt="Wedding Banner" />
                <div className={styles.contentHeader}>
                    <h3>{weddingData.couple.names}</h3>
                </div>
                <div className={styles.infomation}>
                    <h2>{weddingData.invitation.title}</h2>
                    <div className={styles.dateTime}>
                        <span>{`${weddingData.invitation.dayOfWeek} - ${weddingData.invitation.time}`}</span>
                        <div
                            className={styles.day}
                        >{`${weddingData.invitation.day}.${weddingData.invitation.month.replace('Tháng ', '')}.${weddingData.invitation.year}`}</div>
                    </div>
                </div>
            </div>

            <div className={styles.wrapper}>
                <div className={styles.wrapperBanner}>
                    <div className={styles.banner2} data-aos="fade-up" data-aos-duration="1200">
                        <div className={styles.loveQuote}>
                            <h2>{`"${weddingData.loveQuote_1}"`}</h2>
                            <h2>{`"${weddingData.loveQuote_2}"`}</h2>
                        </div>
                        <div className={styles.familyInfo}>
                            <div className={styles.groomFamily} data-aos="fade-right" data-aos-delay="200">
                                <h3>{weddingData.familyInfo.groomFamily.title}</h3>
                                <p>{`Ông: ${weddingData.familyInfo.groomFamily.father}`}</p>
                                <p>{`Bà: ${weddingData.familyInfo.groomFamily.mother}`}</p>
                            </div>
                            <div className={styles.brideFamily} data-aos="fade-left" data-aos-delay="200">
                                <h3>{weddingData.familyInfo.brideFamily.title}</h3>
                                <p>{`Ông: ${weddingData.familyInfo.brideFamily.father}`}</p>
                                <p>{`Bà: ${weddingData.familyInfo.brideFamily.mother}`}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.banner3} data-aos="zoom-in" data-aos-duration="1000">
                        <div className={styles.coupleInfo}>
                            <div className={styles.groom} data-aos="fade-right" data-aos-delay="300">
                                <img src={weddingData.couple.groom.image} alt="Groom" />
                                <h3>{weddingData.couple.groom.name}</h3>
                            </div>
                            <div className={styles.bride} data-aos="fade-left" data-aos-delay="300">
                                <img src={weddingData.couple.bride.image} alt="Bride" />
                                <h3>{weddingData.couple.bride.name}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.banner4} data-aos="fade-up" data-aos-duration="1000">
                    <div className={styles.contentHeader}>
                        <h2 className={styles.invitationTitle}>{weddingData.invitation.title}</h2>
                        <h3 className={styles.eventTitle}>{weddingData.invitation.subtitle}</h3>
                    </div>
                    <div className={styles.coupleImages} ref={coupleImagesRef}>
                        {weddingData.coupleImages.map((img, index) => (
                            <img
                                key={index}
                                src={img.src}
                                alt={img.alt}
                                className={clsx(styles.coupleImg, { [styles.centerImg]: img.isCenter })}
                                data-aos="fade-up"
                                data-aos-delay={(100 * (index + 1)).toString()}
                            />
                        ))}
                    </div>
                    <div className={styles.infomation} data-aos="fade-up" data-aos-duration="1200">
                        <p className={styles.eventDetails}>{weddingData.eventDetails}</p>
                        <p className={styles.eventTime}>Vào Lúc</p>
                        <div className={styles.dateContainer}>
                            <span className={styles.time}>{weddingData.invitation.time}</span>
                            <div className={styles.column}>
                                <span className={styles.dayOfWeek}>{weddingData.invitation.dayOfWeek}</span>
                                <span className={styles.day}>{weddingData.invitation.day}</span>
                                <span className={styles.month}>{weddingData.invitation.month}</span>
                            </div>
                            <span className={styles.year}>{weddingData.invitation.year}</span>
                        </div>
                        <p className={styles.lunarDate}>{`(${weddingData.invitation.lunarDate})`}</p>
                        <h2 className={styles.monthYear}>{weddingData.invitation.monthYear}</h2>
                    </div>
                    <div className={styles.calendar} data-aos="zoom-in" data-aos-duration="1000">
                        <h3>{weddingData.calendar.month}</h3>
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
                            {weddingData.calendar.days.map((day, index) => (
                                <span
                                    key={index}
                                    className={day === weddingData.calendar.highlightDay ? styles.highlight : ''}
                                >
                                    {day === weddingData.calendar.highlightDay ? (
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
                            <h5>{weddingData.location.groomLocation.name}</h5>
                            <p>{weddingData.location.groomLocation.address}</p>
                            <iframe
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={weddingData.location.groomLocation.mapEmbedUrl}
                            ></iframe>
                        </div>
                        <div className={styles.locationContent}>
                            <h5>{weddingData.location.brideLocation.name}</h5>
                            <p>{weddingData.location.brideLocation.address}</p>
                            <iframe
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={weddingData.location.brideLocation.mapEmbedUrl}
                            ></iframe>
                        </div>
                    </div>

                    <div className={styles.thumnail} data-aos="fade-up" data-aos-duration="1000">
                        <div className={styles.dotLeft}></div>
                        <div className={styles.dotRight}></div>
                        <h4>Khoảnh khắc đáng nhớ</h4>
                        <div className={styles.thumnailImages} ref={thumnailImagesRef}>
                            {weddingData.thumnailImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.src}
                                    alt={img.alt}
                                    className={clsx(styles.thumnailImg, { [styles.centerImg]: img.isCenter })}
                                    data-aos="fade-up"
                                    data-aos-delay={(100 * (index + 1)).toString()}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.bestRegards}>
                        <div className={styles.dotLeft}></div>
                        <div className={styles.dotRight}></div>
                        <h1>Thanks You</h1>
                        <span>Sự hiện diện của bạn là niềm vinh hạnh </span>
                        <span style={{ display: 'block' }}>của chúng tôi</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeddingInvitation;
