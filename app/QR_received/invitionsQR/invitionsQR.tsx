'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useApi } from '../../lib/apiContext/apiContext';
import styles from './invitionsQR.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';

interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: Date;
    status: string;
    representative: string | null;
}

interface Bank {
    id: string;
    name: string;
    shortName?: string;
    code?: string;
    bin?: string;
}

interface InvitionsQRProps {
    userId: number;
}

const InvitionsQR: React.FC<InvitionsQRProps> = ({ userId }) => {
    const { getUserQrPublic } = useApi();
    const [qrData, setQrData] = useState<QrResponse[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getUserQrPublic(userId);
                const qrArray: QrResponse[] = Array.isArray(response) ? response : [response];
                setQrData(qrArray);

                const bankResponse = await fetch('https://api.vietqr.io/v1/banks');
                const bankData = await bankResponse.json();
                if (bankData.code === '00' && Array.isArray(bankData.data)) {
                    setBanks(bankData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [getUserQrPublic, userId]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải mã QR...</div>;
    }

    if (qrData.length === 0) {
        return <div></div>;
    }

    const groomQr = qrData.find((qr) => qr.representative === 'groom');
    const brideQr = qrData.find((qr) => qr.representative === 'bride');

    const getBankName = (bankId: string) => {
        const bank = banks.find((b) => String(b.id) === String(bankId));
        return bank?.shortName || bank?.name || 'Không xác định';
    };

    // Check if the QR is a test QR based on account number
    const isGroomTestQr = groomQr?.accountNumber === '171120018686';
    const isBrideTestQr = brideQr?.accountNumber === '19002891';

    return (
        <div className={styles.wrapper_gift}>
            <div className={styles.btn_gift_code} onClick={() => setIsOpen(!isOpen)}>
                Nhận Hỷ <FontAwesomeIcon icon={faGift} />
            </div>

            <div className={`${styles.flex} ${isOpen ? styles.open : ''}`}>
                {groomQr && (
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
                            width={0}
                            height={0}
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
                {brideQr && (
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
                            width={0}
                            height={0}
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
                {qrData.length > 2 && (
                    <div>
                        <h3>Thêm QR (Đang gỡ lỗi)</h3>
                        {qrData.map((qr) => (
                            <div key={qr.qrId}>
                                <p>
                                    Rep: {qr.representative}, Status: {qr.status}, Bank: {getBankName(qr.bank)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitionsQR;
