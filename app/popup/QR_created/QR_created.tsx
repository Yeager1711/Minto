'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    createdAt: string;
    status: string;
    representative: string;
}

interface Bank {
    id: string;
    name: string;
    logo?: string;
    bin?: string;
    shortName?: string;
    code?: string;
}

interface QRPopupProps {
    isOpen: boolean;
    onClose: () => void;
    qrData: QrResponse[] | null;
    banks: Bank[];
}

const QRPopupCreated: React.FC<QRPopupProps> = ({ isOpen, onClose, qrData, banks }) => {
    const [isNavigating, setIsNavigating] = useState(false);
    const [showQR, setShowQR] = useState<{ [key: number]: boolean }>({});
    const [currentCard, setCurrentCard] = useState<'groom' | 'bride'>('groom');
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        console.log('Banks received in QRPopup:', banks);
        console.log('Full qrData:', qrData);
        const currentQr = qrData?.find((qr) => qr.representative === currentCard);
        const currentQrBank = currentQr?.bank;
        console.log('Current QR bank (raw):', currentQrBank, 'Type:', typeof currentQrBank);
        banks.forEach((bank) => console.log('Bank id (raw):', bank.id, 'Type:', typeof bank.id));
        const foundBank = currentQr ? banks.find((bank) => String(bank.id) === String(currentQr.bank)) : undefined;
        console.log('Found bank:', foundBank);
    }, [banks, qrData, currentCard]);

    const handleNavigate = () => {
        setIsNavigating((prev) => !prev);
        setShowQR({});
    };

    const handleQRClick = (qrId: number) => {
        setShowQR((prev) => ({
            ...prev,
            [qrId]: !prev[qrId] || false,
        }));
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isNavigating) return;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isNavigating || touchStartY.current === null) return;

        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;

        if (deltaY > 50 && currentCard === 'groom') {
            setCurrentCard('bride');
        } else if (deltaY < -50 && currentCard === 'bride') {
            setCurrentCard('groom');
        }

        touchStartY.current = null;
    };

    if (!isOpen || !qrData) return null;

    // Sort qrData để groom luôn đầu tiên
    const sortedQrData = [...qrData].sort((a, b) => {
        if (a.representative === 'groom') return -1;
        if (b.representative === 'groom') return 1;
        return 0;
    });

    // Lọc dữ liệu cho thẻ hiện tại
    const currentQr = sortedQrData.find((qr) => qr.representative === currentCard);
    if (!currentQr) {
        console.error('No currentQr found for representative:', currentCard);
        return null;
    }

    // Tìm ngân hàng tương ứng với currentQr.bank
    const currentBank = banks.find((bank) => String(bank.id) === String(currentQr.bank));
    const bankName = currentBank?.shortName || currentBank?.name || 'Không xác định';
    console.log('Current bank name:', bankName);

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div
                className={`${styles.popupContainer} ${isNavigating ? styles.navigating : ''}`}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className={styles.header}>
                    <FontAwesomeIcon icon={faArrowLeft} onClick={onClose} />
                    Trở lại
                </div>

                <div className={styles.cardsView}>
                    <div className={styles.cardWrapper}>
                        <div className={styles.blurCardLeft}></div>
                        <div className={styles.blurCardRight}></div>
                        <div key={currentQr.qrId} className={`${styles.mainCard} ${styles.cardTransition}`}>
                            <h3 className={styles.account_number}>
                                {currentQr.representative === 'groom' ? 'GROOM CARD' : 'BRIDE CARD'}
                            </h3>
                            <p className={styles.name_bank}>{bankName}</p>
                            <h3 className={styles.create_at}>Minto Editions Card</h3>
                        </div>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <span className={styles.cardLabel}>Card Holder</span>
                    <h4 className={styles.accountHolder}>{currentQr.accountHolder || 'CLIENT NAME'}</h4>
                </div>

                <button
                    className={`${styles.rightButton} ${isNavigating ? styles.navigateActive : ''}`}
                    onClick={handleNavigate}
                >
                    <FontAwesomeIcon icon={isNavigating ? faChevronLeft : faChevronRight} />
                </button>

                <div className={styles.navigationPanel}>
                    <div
                        key={currentQr.qrId}
                        className={`${styles.mainCard} ${isNavigating ? styles.animateCard : ''} ${
                            showQR[currentQr.qrId] ? styles.qrExpanded : ''
                        }`}
                    >
                        {!showQR[currentQr.qrId] ? (
                            <>
                                <h3 className={styles.account_number}>
                                    {currentQr.accountNumber
                                        ? currentQr.accountNumber.replace(/(\d{4})/g, '$1 ').trim()
                                        : 'XXX XXX XXX'}
                                </h3>
                                <h3 className={styles.create_at}>
                                    Create at: {' '}
                                    {currentQr.createdAt
                                        ? new Date(currentQr.createdAt).toLocaleDateString('en-GB')
                                        : 'DD/MM/YYYY'}
                                </h3>
                                <FontAwesomeIcon
                                    className={styles.qr_icon}
                                    icon={faQrcode}
                                    onClick={() => handleQRClick(currentQr.qrId)}
                                />
                            </>
                        ) : (
                            <img
                                className={styles.qrImage}
                                src={currentQr.qrCodeUrl}
                                alt={`QR Code for ${currentQr.accountHolder}`}
                                onClick={() => handleQRClick(currentQr.qrId)}
                                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRPopupCreated;
