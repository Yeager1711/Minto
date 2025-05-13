'use client';

import React, { useState } from 'react';
import styles from './InviteePopup.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { useApi } from 'app/lib/apiContext/apiContext';

interface InviteePopupProps {
    quantity: number;
    totalPrice: number;
    onClose: () => void;
    id: string;
    weddingImages: { file: File; position: string }[];
}

const InviteePopup: React.FC<InviteePopupProps> = ({ quantity, totalPrice, onClose, id, weddingImages }) => {
    const { saveCard } = useApi();
    const [isClosing, setIsClosing] = useState(false);
    const [inviteeNames, setInviteeNames] = useState<string[]>(Array(quantity).fill(''));
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [confirmationClosing, setConfirmationClosing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setIsClosing(true);
        }
    };

    const handleCloseAnimationEnd = () => {
        if (isClosing) {
            onClose();
        }
    };

    const handleConfirmationOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setConfirmationClosing(true);
        }
    };

    const handleConfirmationCloseAnimationEnd = () => {
        if (confirmationClosing) {
            setShowConfirmationPopup(false);
            setConfirmationClosing(false);
        }
    };

    const handleNameChange = (index: number, value: string) => {
        const updatedNames = [...inviteeNames];
        updatedNames[index] = value;
        setInviteeNames(updatedNames);
    };

    const handleSubmit = async () => {
        if (inviteeNames.some((name) => name.trim() === '')) {
            alert('Vui lòng nhập đầy đủ tên của tất cả người được mời.');
            return;
        }

        setIsLoading(true);
        try {
            const weddingData = JSON.parse(localStorage.getItem('weddingData') || '{}');

            console.log('WeddingImages to send:', weddingImages);

            await saveCard({
                templateId: parseInt(id),
                weddingData,
                weddingImages: weddingImages.length > 0 ? weddingImages : [],
                inviteeNames,
                totalPrice, // Thêm totalPrice vào payload
            });

            localStorage.removeItem('weddingData');
            localStorage.removeItem('weddingImages')
            setShowConfirmationPopup(true);
        } catch (error) {
            console.error('Lỗi khi lưu thiệp:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        const data = inviteeNames.map((name) => ({
            Tên: name,
            'Link Mời': `/template/${id}?inviteeName=${encodeURIComponent(name)}`,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitees');
        XLSX.writeFile(workbook, 'invitees.xlsx');
    };

    const formattedTotalPrice = totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ';

    return (
        <>
            <div className={styles.popupOverlay} onClick={handleOverlayClick}>
                <button className={styles.closeButton} onClick={() => setIsClosing(true)}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div
                    className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}
                    onAnimationEnd={handleCloseAnimationEnd}
                >
                    <div className={styles.popupHeader}>
                        <h2 className={styles.popupTitle}>Nhập tên người được mời</h2>
                        <p className={styles.popupSubtitle}>
                            Số lượng: {quantity} lời mời • Tổng giá: {formattedTotalPrice}
                        </p>
                    </div>
                    <div className={styles.popupBody}>
                        <div className={styles.inviteeSection}>
                            {Array.from({ length: quantity }, (_, index) => (
                                <div key={index} className={styles.inviteeInput}>
                                    <label htmlFor={`invitee-${index}`}>Tên người mời {index + 1}:</label>
                                    <input
                                        type="text"
                                        id={`invitee-${index}`}
                                        value={inviteeNames[index]}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        placeholder={`Nhập tên người mời ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className={styles.actionButtons}>
                            <button className={styles.customizeButton} onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Thanh toán'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmationPopup && (
                <div className={styles.popupOverlay} onClick={handleConfirmationOverlayClick}>
                    <button className={styles.closeButton} onClick={() => setConfirmationClosing(true)}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                    <div
                        className={`${styles.popupContent} ${confirmationClosing ? styles.closing : ''}`}
                        onAnimationEnd={handleConfirmationCloseAnimationEnd}
                    >
                        <div className={styles.popupHeader}>
                            <h2 className={styles.popupTitle}>Danh sách khách mời</h2>
                            <p className={styles.popupSubtitle}>Dưới đây là danh sách tên khách mời và link mời:</p>
                        </div>
                        <div className={styles.popupBody}>
                            <div className={styles.namesList}>
                                {inviteeNames.map((name, index) => (
                                    <div key={index} className={styles.nameItem}>
                                        <span>{name}</span>
                                        <Link
                                            href={{
                                                pathname: `/template/${id}`,
                                                query: { inviteeName: encodeURIComponent(name) },
                                            }}
                                            className={styles.nameLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            /template/{id}/{name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.actionButtons}>
                                <button className={styles.customizeButton} onClick={exportToExcel}>
                                    Lưu danh sách
                                </button>
                                <button className={styles.customizeButton} onClick={() => setConfirmationClosing(true)}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InviteePopup;
