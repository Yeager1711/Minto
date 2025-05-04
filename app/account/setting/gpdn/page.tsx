'use client';
import * as React from 'react';
import { useState } from 'react';
import styles from './gpdn.module.scss';

function WeddingInvitation() {
    const [currentStep, setCurrentStep] = useState(0);
    const initialImages = ['/images/wd/3.jpg', '/images/wd/4.jpg', '/images/wd/5.jpg', '/images/wd/6.jpg'];

    const [mainImage, setMainImage] = useState(initialImages[0]);
    const [imageList, setImageList] = useState(initialImages.slice(1));

    const handleImageClick = (index: any, event: React.MouseEvent) => {
        event.stopPropagation(); // Ngăn sự kiện lan truyền lên div.invitationContainer
        const clickedImage = imageList[index];
        const newImageList = [...imageList];
        newImageList.splice(index, 1); // Xóa ảnh đã click khỏi list
        newImageList.push(mainImage); // Đưa ảnh chính hiện tại xuống cuối list
        setMainImage(clickedImage); // Cập nhật ảnh chính
        setImageList(newImageList);
    };

    const handleNextStep = () => {
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const daysInDecember = Array.from({ length: 31 }, (_, i) => i + 1);
    const weddingDate = 30;

    return (
        <div className={styles.invitationContainer} onClick={handleNextStep}>
            {currentStep === 0 && (
                <div className={styles.envelope}>
                    <div className={styles.flapLeft}></div>
                    <div className={styles.flapRight}></div>
                    <div className={styles.envelopeContent}>
                        <div className={styles.loveTheDate}>
                            <span className={styles.nameT}>Văn Hiệp</span>
                            <span className={styles.and}>&</span>
                            <span className={styles.nameN}>Anh Thi</span>
                        </div>
                        <p className={styles.eventDate}>30.12.2023</p>
                        <p className={styles.inviteText}>Trân trọng kính mời</p>
                    </div>
                </div>
            )}
            {currentStep === 1 && (
                <div className={styles.cardInner}>
                    <div className={styles.images}>
                        <img
                            key={mainImage} // Buộc render lại để kích hoạt animation
                            src={mainImage}
                            alt="Main"
                            className={styles.mainImage} // Class mới để áp dụng border và animation
                        />
                    </div>

                    <div className={styles.list_image}>
                        {imageList.map((image, index) => (
                            <div
                                key={index}
                                className={styles.image_item}
                                onClick={(event) => handleImageClick(index, event)}
                            >
                                <img src={image} alt={`Thumbnail ${index}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className={styles.cardInner}>
                    <div className={styles.innerContent}>
                        <div className={`${styles.card1} ${styles.fadeIn}`}>
                            <div className={styles.familySection}>
                                <div className={styles.family}>
                                    <h3>Nhà Trai</h3>
                                    <p>Ông: Nguyễn Văn Thành</p>
                                    <p>Bà Thanh Phước</p>
                                    <p>Thạnh Mỹ Lợi, Q. 2, Tp. HCM</p>
                                </div>
                                <div className={styles.family}>
                                    <h3>Nhà Gái</h3>
                                    <p>Ông: Nguyễn Đức Lộc</p>
                                    <p>Bà: Thanh Thị Minh Hiền</p>
                                    <p>Thạnh Mỹ Lợi, Q. 2, Tp. HCM</p>
                                </div>
                            </div>
                            <div className={styles.announcement}>
                                <p>Trân trọng báo tin lễ thành hôn của con chúng tôi</p>
                            </div>
                            <div className={styles.coupleNames}>
                                <div className={styles.groom}>
                                    {/* <span className={styles.title}>Trưởng nam</span> */}
                                    <span className={styles.name}>Huỳnh Văn Hiệp</span>
                                </div>

                                <div>
                                    -------------------------------------------------
                                </div>
                                <div className={styles.bride}>
                                    {/* <span className={styles.title}>Út nữ</span> */}
                                    <span className={styles.name}>Vũ Lê Anh Thi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {currentStep === 3 && (
                <div className={styles.cardInner}>
                    <div className={styles.innerContent}>
                        <div className={`${styles.card2} ${styles.fadeIn}`}>
                            <div className={styles.calendarSection}>
                                <h3>Tháng 12, 2023</h3>
                                <div className={styles.calendar}>
                                    {daysInDecember.map((day) => (
                                        <div
                                            key={day}
                                            className={`${styles.day} ${day === weddingDate ? styles.weddingDay : ''}`}
                                        >
                                            {day}
                                            {day === weddingDate && <span className={styles.heart}>❤️</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {currentStep === 4 && (
                <div className={styles.cardInner}>
                    <div className={styles.innerContent}>
                        <div className={`${styles.card3} ${styles.fadeIn}`}>
                            <div className={styles.coupleImages}>
                                <img
                                    src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                                    alt="Couple 1"
                                    className={styles.sideImage}
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
                                    alt="Couple 2"
                                    className={styles.centerImage}
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop"
                                    alt="Couple 3"
                                    className={styles.sideImage}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {currentStep === 5 && (
                <div className={styles.cardInner}>
                    <div className={styles.innerContent}>
                        <div className={`${styles.card4} ${styles.fadeIn}`}>
                            <div className={styles.messageSection}>
                                <p>
                                    Sự hiện diện của bạn là niềm vinh hạnh lớn lao đối với gia đình chúng tôi. Hãy cùng
                                    chúng tôi chia sẻ niềm vui trong ngày trọng đại này!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WeddingInvitation;
