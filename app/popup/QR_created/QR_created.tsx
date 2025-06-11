'use client';
import React, { useState } from 'react';
import styles from './QR_created.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronRight, faChevronLeft, faQrcode } from '@fortawesome/free-solid-svg-icons';

// Define the QrResponse interface
interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: Date;
    status: string;
}

interface QRPopupProps {
    isOpen: boolean;
    onClose: () => void;
    qrData: QrResponse | null;
}

const QRPopup: React.FC<QRPopupProps> = ({ isOpen, onClose, qrData }) => {
    const [isNavigating, setIsNavigating] = useState(false);
    const [showQR, setShowQR] = useState(false); // State to toggle QR code display

    const handleNavigate = () => {
        setIsNavigating((prev) => !prev); // Toggle navigation state
        if (showQR) setShowQR(false); // Reset QR view when toggling navigation
    };

    const handleQRClick = () => {
        setShowQR((prev) => !prev); // Toggle QR code display
    };

    if (!isOpen || !qrData) return null;

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div
                className={`${styles.popupContainer} ${isNavigating ? styles.navigating : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <FontAwesomeIcon icon={faArrowLeft} onClick={onClose} />
                    Trở lại
                </div>

                <div className={styles.cardsView}>
                    <div className={styles.cardWrapper}>
                        <div className={styles.blurCardLeft}></div>
                        <div className={styles.blurCardRight}></div>

                        <div className={styles.mainCard}>
                            <h3 className={styles.account_number}>Minto Editions Card</h3>
                            <h3 className={styles.create_at}>infinite</h3>
                        </div>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <span className={styles.cardLabel}>Card Holder</span>
                    <h4 className={styles.accountHolder}>{qrData.accountHolder || 'CLIENT NAME'}</h4>
                </div>

                <button
                    className={`${styles.rightButton} ${isNavigating ? styles.navigateActive : ''}`}
                    onClick={handleNavigate}
                >
                    <FontAwesomeIcon icon={isNavigating ? faChevronLeft : faChevronRight} />
                </button>

                <div className={styles.navigationPanel}>
                    <div
                        className={`${styles.mainCard} ${isNavigating ? styles.animateCard : ''} ${showQR ? styles.qrExpanded : ''}`}
                    >
                        {!showQR ? (
                            <>
                                <h3 className={styles.account_number}>
                                    {qrData.accountNumber
                                        ? qrData.accountNumber.replace(/(\d{4})/g, '$1 ').trim()
                                        : 'XXX XXX XXX'}
                                </h3>
                                <h3 className={styles.create_at}>
                                    {qrData.createdAt
                                        ? new Date(qrData.createdAt).toLocaleDateString('en-GB')
                                        : 'DD/MM/YYYY'}
                                </h3>
                                <FontAwesomeIcon className={styles.qr_icon} icon={faQrcode} onClick={handleQRClick} />
                            </>
                        ) : (
                            <img
                                className={styles.qrImage}
                                src={qrData.qrCodeUrl}
                                alt="QR Code"
                                onClick={handleQRClick}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRPopup;
