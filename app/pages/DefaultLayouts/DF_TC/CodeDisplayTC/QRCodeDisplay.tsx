'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './QRCodeDisplay.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';

interface QRCode {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: string;
    status: 'SUCCESS' | 'ACTIVE';
    representative?: string | null;
}

interface Bank {
    id: string;
    name: string;
    shortName?: string;
    code?: string;
    bin?: string;
}

interface QRCodeDisplayProps {
    userId: number;
    guestType: 'groom' | 'bride' | null;
}

const apiUrl: string | undefined = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ userId, guestType }) => {
    const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingQRs, setLoadingQRs] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isQrOpen, setIsQrOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoadingQRs(true);
                setError(null);

                if (!apiUrl) {
                    throw new Error('API URL không được định nghĩa trong biến môi trường.');
                }

                // Fetch QR codes
                const qrResponse = await fetch(`${apiUrl}/qr/public/qrs/${userId}`);
                if (!qrResponse.ok) {
                    throw new Error(`Failed to fetch QR codes: ${qrResponse.statusText}`);
                }
                const qrData: unknown = await qrResponse.json();
                const qrArray: QRCode[] = Array.isArray(qrData) ? qrData : [qrData as QRCode];
                setQrCodes(qrArray);

                // Fetch banks
                const bankResponse = await fetch('https://api.vietqr.io/v1/banks');
                const bankData: { code: string; data: Bank[] } = await bankResponse.json();
                if (bankData.code === '00' && Array.isArray(bankData.data)) {
                    setBanks(bankData.data);
                } else {
                    throw new Error('Không thể tải danh sách ngân hàng.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(`Không thể tải mã QR. Vui lòng thử lại sau. Chi tiết: ${(error as Error).message}`);
            } finally {
                setLoadingQRs(false);
            }
        };

        fetchData();
    }, [userId]);

    const getBankName = (bankId: string): string => {
        const bank: Bank | undefined = banks.find((b) => String(b.id) === String(bankId));
        return bank?.shortName || bank?.name || 'Không xác định';
    };

    const groomQr: QRCode | undefined = qrCodes.find((qr) => qr.representative === 'groom');
    const brideQr: QRCode | undefined = qrCodes.find((qr) => qr.representative === 'bride');
    const isGroomTestQr: boolean = groomQr?.accountNumber === '171120018686' || false;
    const isBrideTestQr: boolean = brideQr?.accountNumber === '19002891' || false;

    return (
        <div className={styles.btn_invitionQR__popop} style={{ margin: '2rem 0' }}>
            {loadingQRs ? (
                <p>Đang tải mã QR...</p>
            ) : error ? (
                <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
            ) : qrCodes.length === 0 ? (
                <p>Không tìm thấy mã QR nào.</p>
            ) : (
                <div className={styles.wrapper_gift}>
                    <div className={styles.flex_center}>
                        <div className={styles.btn_gift_code} onClick={() => setIsQrOpen(!isQrOpen)}>
                            Nhận Hỷ <FontAwesomeIcon icon={faGift} />
                        </div>
                        <div className={`${styles.flex} ${isQrOpen ? styles.open : ''}`}>
                            {groomQr && (!guestType || guestType === 'groom') && (
                                <div className={styles.groom}>
                                    <h3>
                                        {isGroomTestQr
                                            ? 'QR đang test của Admin'
                                            : `QR của Chú Rể ${groomQr.status !== 'ACTIVE' ? '(Không hoạt động)' : ''}`}
                                    </h3>
                                    <p>
                                        <strong>Ngân hàng</strong> {getBankName(groomQr.bank)}
                                    </p>
                                    <Image
                                        src={groomQr.qrCodeUrl}
                                        alt="Mã QR Thanh Toán Chú Rể"
                                        width={320}
                                        height={320}
                                        sizes="100vw"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                    <p>
                                        <strong>Số tài khoản</strong> {groomQr.accountNumber}
                                    </p>
                                    <p>
                                        <strong>Chủ tài khoản</strong> {groomQr.accountHolder}
                                    </p>
                                </div>
                            )}
                            {brideQr && (!guestType || guestType === 'bride') && (
                                <div className={styles.bride}>
                                    <h3>
                                        {isBrideTestQr
                                            ? 'QR đang test của Admin'
                                            : `QR của Cô Dâu ${brideQr.status !== 'ACTIVE' ? '(Không hoạt động)' : ''}`}
                                    </h3>
                                    <p>
                                        <strong>Ngân hàng</strong> {getBankName(brideQr.bank)}
                                    </p>
                                    <Image
                                        src={brideQr.qrCodeUrl}
                                        alt="Mã QR Thanh Toán Cô Dâu"
                                        width={320}
                                        height={320}
                                        sizes="100vw"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                    <p>
                                        <strong>Số tài khoản</strong> {brideQr.accountNumber}
                                    </p>
                                    <p>
                                        <strong>Chủ tài khoản</strong> {brideQr.accountHolder}
                                    </p>
                                </div>
                            )}
                            {!groomQr && !brideQr && <div>Không có mã QR cho chú rể hoặc cô dâu</div>}
                            {qrCodes.length > 2 && (
                                <div>
                                    <h3>Thêm QR (Đang gỡ lỗi)</h3>
                                    {qrCodes.map((qr) => (
                                        <div key={qr.qrId}>
                                            <p>
                                                Rep: {qr.representative}, Status: {qr.status}, Bank:{' '}
                                                {getBankName(qr.bank)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeDisplay;
