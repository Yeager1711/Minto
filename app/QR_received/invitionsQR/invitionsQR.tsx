'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useApi } from '../../lib/apiContext/apiContext';
import styles from './invitionsQR.module.css';

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

interface InvitionsQRProps {
    userId: number;
}

const InvitionsQR: React.FC<InvitionsQRProps> = ({ userId }) => {
    const { getUserQrPublic } = useApi();
    const [qrData, setQrData] = useState<QrResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchQrData = async () => {
            try {
                setLoading(true);
                const response = await getUserQrPublic(userId);
                console.log('API Response:', response); // Debug: Check API response
                const qrArray: QrResponse[] = Array.isArray(response) ? response : [response];
                setQrData(qrArray);
                console.log('qrData State:', qrArray); // Debug: Check state update
            } catch {
            } finally {
                setLoading(false);
            }
        };

        fetchQrData();
    }, [getUserQrPublic, userId]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải mã QR...</div>;
    }

    if (qrData.length === 0) {
        return <div></div>;
    }

    const groomQr = qrData.find((qr) => qr.representative === 'groom');
    const brideQr = qrData.find((qr) => qr.representative === 'bride');
    console.log('Groom QR:', groomQr, 'Bride QR:', brideQr); // Debug: Check found QR codes

    return (
        <div className={styles.flex}>
            {groomQr && (
                <div className={styles.groom}>
                    <h3>QR của Chú Rể {groomQr.status !== 'ACTIVE' && '(Không hoạt động)'}</h3>
                    <Image src={groomQr.qrCodeUrl} alt="Mã QR Thanh Toán Chú Rể" width={0} height={0} />
                    <p>
                        <strong>Số tài khoản:</strong> {groomQr.accountNumber}
                    </p>
                    <p>
                        <strong>Chủ tài khoản:</strong> {groomQr.accountHolder}
                    </p>
                </div>
            )}
            {brideQr && (
                <div className={styles.bride}>
                    <h3>QR của Cô Dâu {brideQr.status !== 'ACTIVE' && '(Không hoạt động)'}</h3>
                    <Image src={brideQr.qrCodeUrl} alt="Mã QR Thanh Toán Cô Dâu" width={0} height={0} />
                    <p>
                        <strong>Số tài khoản:</strong> {brideQr.accountNumber}
                    </p>
                    <p>
                        <strong>Chủ tài khoản:</strong> {brideQr.accountHolder}
                    </p>
                </div>
            )}
            {!groomQr && !brideQr && <div>Không có mã QR cho chú rể hoặc cô dâu</div>}
            {/* Fallback to display all QR codes for debugging */}
            {qrData.length > 2 && (
                <div>
                    <h3>Thêm QR (Đang gỡ lỗi)</h3>
                    {qrData.map((qr, index) => (
                        <div key={index}>
                            <p>
                                Rep: {qr.representative}, Status: {qr.status}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvitionsQR;
