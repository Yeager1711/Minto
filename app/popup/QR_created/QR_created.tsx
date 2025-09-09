'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faQrcode, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './QR_created.module.css';

interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: Date | string;
    status: string;
    representative: string | null;
}

interface Bank {
    id: string;
    name: string;
    shortName?: string;
    code?: string;
    bin?: string;
    logo?: string;
}

interface QR_CreatedProps {
    isOpen: boolean;
    onClose: () => void;
    qrData: QrResponse[] | null;
    banks: Bank[];
    createdAt?: string | Date | null;
}

const QR_Created: React.FC<QR_CreatedProps> = ({ isOpen, onClose, qrData, banks, createdAt }) => {
    const [showQR, setShowQR] = useState<{ [key: number]: boolean }>({});

    const getBank = (bankId: string) => {
        return banks.find((b) => String(b.id) === String(bankId));
    };

    const handleQRClick = (qrId: number) => {
        setShowQR((prev) => ({
            ...prev,
            [qrId]: !prev[qrId] || false,
        }));
    };

    if (!isOpen) return null;

    if (!qrData) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu QR.</div>;
    }

    const groomQr = qrData.find((qr) => qr.representative === 'groom');
    const brideQr = qrData.find((qr) => qr.representative === 'bride');

    // Sort QR items by createdAt (earlier date goes below)
    const sortedQrs = [groomQr, brideQr]
        .filter((qr): qr is QrResponse => !!qr)
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB; // Earlier date comes first (will be reversed in rendering)
        });

    // Determine if timeline should be marked as completed
    const isTimelineCompleted =
        groomQr && brideQr && groomQr.status === 'ACTIVE' && brideQr.status === 'ACTIVE' && createdAt;

    return (
        <div className={styles.QR_CheckAsset} onClick={onClose}>
            <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header} onClick={onClose}>
                    <FontAwesomeIcon className={styles.btn_close} icon={faArrowLeft} />
                    Trở lại
                </div>
                <div className={styles.current_day}>
                    {new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric',
                    })}
                    <br />
                    <h3>Today</h3>
                </div>

                <div className={styles.progress_checkTask}>
                    <div className={styles.progress_wrapper}>
                        <div className={`${styles.timeline} ${isTimelineCompleted ? styles.completed : ''}`}>
                            {/* Render sorted QR items in reverse order (earlier below) */}
                            {sortedQrs.reverse().map((qr) => (
                                <div
                                    key={qr.qrId}
                                    className={`${styles.item} ${qr.status === 'ACTIVE' ? styles.completed : ''}`} // Using 'ACTIVE' as per image
                                >
                                    <div className={styles.time}>
                                        {qr.representative === 'groom' ? 'Groom' : 'Bride'}
                                    </div>
                                    <div className={styles.schedule_content}>
                                        <div className={styles.card}>
                                            <h3>QR của {qr.representative === 'groom' ? 'Chú Rể' : 'Cô Dâu'}</h3>
                                            <div className={styles.image_bank}>
                                                {showQR[qr.qrId] ? (
                                                    <Image
                                                        src={qr.qrCodeUrl}
                                                        alt={`QR ${qr.representative}`}
                                                        width={200}
                                                        height={200}
                                                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                ) : getBank(qr.bank)?.logo ? (
                                                    <Image
                                                        src={getBank(qr.bank)?.logo || '/placeholder.png'}
                                                        alt="Bank Logo"
                                                        width={50}
                                                        height={50}
                                                        style={{ objectFit: 'cover' }}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                ) : (
                                                    <Image
                                                        src={qr.qrCodeUrl}
                                                        alt={`QR ${qr.representative}`}
                                                        width={200}
                                                        height={200}
                                                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                )}
                                            </div>

                                            <div className={styles.QR_code}>
                                                {!showQR[qr.qrId] && (
                                                    <FontAwesomeIcon
                                                        className={styles.qr_icon}
                                                        icon={faQrcode}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.number_banks}>
                                                {qr.accountNumber
                                                    ? qr.accountNumber.replace(/(\d{4})/g, '$1 ').trim()
                                                    : 'XXX XXX XXX'}
                                            </div>
                                            <div className={styles.create_at}>
                                                Created: {new Date(qr.createdAt).toLocaleDateString('en-GB')}
                                            </div>
                                            <div className={styles.name_banks}>
                                                {getBank(qr.bank)?.shortName || getBank(qr.bank)?.name || 'Ngân hàng'}
                                            </div>
                                        </div>
                                        <div className={styles.status}>
                                            Trạng thái: <strong>{qr.status}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Unfinished */}
                            <div className={`${styles.item} ${!groomQr || !brideQr ? '' : styles.completed}`}>
                                <div className={styles.schedule_content}>
                                    <h4>Tạo QR thẻ Ngân hàng</h4>
                                    {!groomQr || !brideQr ? (
                                        <p className={styles.unfinished}>Chưa Tạo</p>
                                    ) : (
                                        <p className={styles.status}>Đã đủ QR</p>
                                    )}
                                </div>
                            </div>

                            {/* Display created_at */}
                            <div className={`${styles.item} ${createdAt ? styles.completed : ''}`}>
                                <div className={styles.time}>
                                    {createdAt
                                        ? new Date(createdAt).toLocaleDateString('en-US', {
                                              month: 'long',
                                              day: '2-digit',
                                              year: 'numeric',
                                          })
                                        : 'Chưa có ngày tạo'}
                                </div>
                                <div className={styles.schedule_content}>
                                    <h4>Tạo tài khoản</h4>
                                    <p className={styles.status}>Đang hoạt động</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QR_Created;
