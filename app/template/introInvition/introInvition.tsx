'use client';
import React, { useState, useEffect } from 'react';
import styles from './introInvition.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface IntroInvitationProps {
    isIntroOpen: boolean;
    onClose: () => void;
    groomName: string;
    brideName: string;
    weddingDate: string;
    guestName: string;
}

function IntroInvitation({ isIntroOpen, onClose, groomName, brideName, weddingDate, guestName }: IntroInvitationProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Handle swipe up with a lower threshold for sensitivity
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (touchStart && touchEnd) {
            const deltaY = touchStart - touchEnd;
            if (deltaY > 20) {
                // Reduced threshold to 20px for a light swipe
                onClose(); // Close intro on swipe up
            }
        }
        setTouchStart(null);
        setTouchEnd(null);
    };

    // Prevent default scroll when intro is open
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isIntroOpen) {
                e.preventDefault();
            }
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [isIntroOpen]);

    return (
        <div
            className={`${styles.intro_invition} ${isIntroOpen ? styles.visible : styles.hidden}`}
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className={styles.swipe_up}>
                <div className={styles.wrapper_swipeUp}>
                    <FontAwesomeIcon icon={faChevronUp} className={styles.chevron} />
                    <FontAwesomeIcon icon={faChevronUp} className={styles.chevron} />
                    <span> Click hoặc vuốt để mở</span>
                </div>
            </div>

            <div className={styles.wrapper}>
                <div className={styles.image_psb__TL}>
                    <img src="/images/m3/t2.png" alt="Top Left Decoration" />
                </div>
                <div className={styles.image_psb__BR}>
                    <img src="/images/m3/t2.png" alt="Bottom Right Decoration" />
                </div>
                <div className={styles.text}>Wedding Invitations</div>
                <div className={styles.mar}>
                    <div className={styles.groom_name}>{groomName}</div>
                    <div className={styles.and}>&</div>
                    <div className={styles.bride_name}>{brideName}</div>
                </div>
                <div className={styles.box_dateTime}>
                    <div className={styles.dateTime}>
                        <span className={styles.day}>{weddingDate.split('/')[0]}</span>
                        <span className={styles.month}>Tháng {weddingDate.split('/')[1]}</span>
                        <span className={styles.year}>{weddingDate.split('/')[2]}</span>
                    </div>
                    <div className={styles.inviton_name}>
                        <span className={styles.invition}>Kính mời</span>
                        <h3 className={styles.name}>
                            <span>{guestName || 'bạn'}</span>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IntroInvitation;
