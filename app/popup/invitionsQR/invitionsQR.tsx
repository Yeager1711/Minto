'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { useApi } from '../../lib/apiContext/apiContext';

interface QrResponse {
    qrId: number;
    qrCodeUrl: string;
    status: string;
}

interface InvitionsQRProps {
    userId: number;
}

const InvitionsQR: React.FC<InvitionsQRProps> = ({ userId }) => {
    const { getUserQrPublic } = useApi();
    const [qrData, setQrData] = useState<QrResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // Removed unused setError state
    // const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQrData = async () => {
            try {
                setLoading(true);
                const response = await getUserQrPublic(userId);
                setQrData(response);
            } catch {
            } finally {
                setLoading(false);
            }
        };

        fetchQrData();
    }, [getUserQrPublic, userId]);

    if (loading) {
        return <div>Đang tải mã QR...</div>;
    }

    if (!qrData) {
        return null
    }

    if (qrData.status !== 'ACTIVE') {
        return <div>Mã QR không hoạt động</div>;
    }

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <Image
                src={qrData.qrCodeUrl}
                alt="Mã QR Thanh Toán"
                width={256}
                height={256}
                style={{ width: '256px', height: '256px' }}
            />
        </div>
    );
};

export default InvitionsQR;
