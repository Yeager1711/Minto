'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './loginCenter.module.css';
import Image from 'next/image';

interface LoginCenterProps {
    startAnimation: boolean;
    fullName: string;
    onFinish: () => void;
}

const LoginCenter: React.FC<LoginCenterProps> = ({ startAnimation, fullName, onFinish }) => {
    const [showFlow2, setShowFlow2] = useState(false);
    const [expandFlow2, setExpandFlow2] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [hidePopup, setHidePopup] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        if (!startAnimation) return;

        setShowFlow2(true); // Step 1: Hiện flow_2 (bắt đầu animateContainerOut)

        const expandTimer = setTimeout(() => {
            if (!isMounted.current) return;
            setExpandFlow2(true); // Step 2: Mở rộng block .flow_2 (expand)

            const showContentTimer = setTimeout(() => {
                if (!isMounted.current) return;
                setShowContent(true); // Step 3: Hiện nội dung chào mừng
            }, 300);

            const collapseTimer = setTimeout(() => {
                if (!isMounted.current) return;
                setShowContent(false);
                setExpandFlow2(false); // Step 4: Thu lại .flow_2

                const hideTimer = setTimeout(() => {
                    if (!isMounted.current) return;
                    setHidePopup(true); // Step 5: Ẩn toàn bộ popup
                    onFinish(); // Gọi callback sau animation
                }, 400);

                return () => clearTimeout(hideTimer);
            }, 2000);

            return () => {
                clearTimeout(showContentTimer);
                clearTimeout(collapseTimer);
            };
        }, 1000); // Delay để cho animateContainerOut chạy xong

        return () => {
            clearTimeout(expandTimer);
        };
    }, [startAnimation, onFinish]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            console.log('Overlay clicked - closing popup');
        }
    };

    return (
        <div className={`${styles.loginPopupOverlay} ${hidePopup ? styles.fadeOut : ''}`} onClick={handleOverlayClick}>
            <div
                className={`
                    ${styles.loginPopupContainer}
                    ${showFlow2 ? styles.animateContainerOut : styles.animateContainerIn}
                    ${expandFlow2 ? styles.expandedContainer : ''}
                    ${hidePopup ? styles.scaleOut : ''}
                `}
            >
                {!showFlow2 && <div className={styles.flow_1} />}
                {showFlow2 && (
                    <div
                        className={`
                            ${styles.flow_2}
                            ${styles.animateContainerIn}
                            ${expandFlow2 ? styles.expand : ''}
                        `}
                    >
                        <div className={styles.image_logo}>
                            <Image
                                src="/images/logo.png"
                                alt="Minto Logo"
                                width={100}
                                height={100}
                                style={{ borderRadius: '1rem', objectFit: 'cover' }}
                            />
                        </div>
                        {expandFlow2 && (
                            <div className={`${styles.content} ${showContent ? styles.show : ''}`}>
                                <p>Chào mừng bạn đến Minto</p>
                                <h3>{fullName}</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginCenter;
