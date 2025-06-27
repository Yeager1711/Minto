'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './success.module.css';
import { showToastSuccess } from 'app/Ultils/toast';

interface WeddingData {
    groom?: string;
    bride?: string;
    weddingDate?: string;
    groomAddress?: string;
    brideAddress?: string;
    lunarDay?: string;
    [key: string]: unknown;
}

interface WeddingImage {
    url?: string;
}

interface SaveCardResponse {
    message?: string;
}

const SuccessPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    const templateId: string | undefined = pathname.split('/').pop();

    const handleComplete = async (): Promise<void> => {
        if (!templateId) {
            setError('Template ID không hợp lệ.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const orderCode: string | null = searchParams.get('orderCode');
        const status: string | null = searchParams.get('status');
        const id: string | null = searchParams.get('id');

        if (status !== 'PAID' || !orderCode || !id || !templateId) {
            setError('Thông tin thanh toán hoặc template không hợp lệ.');
            setIsLoading(false);
            return;
        }

        const weddingData: WeddingData = JSON.parse(localStorage.getItem(`WeddingData${templateId}`) || '{}');
        const imagesRaw: string | null = localStorage.getItem(`weddingImages${templateId}`);
        const weddingImages: WeddingImage[] = imagesRaw ? JSON.parse(imagesRaw) : [];

        console.log('weddingData', weddingData);
        console.log('imagesRaw', imagesRaw);
        console.log('weddingImages', weddingImages);

        if (
            !weddingData.groom ||
            !weddingData.bride ||
            !weddingData.weddingDate ||
            !weddingData.groomAddress ||
            !weddingData.brideAddress ||
            !weddingData.lunarDay
        ) {
            console.log('Missing fields:', {
                groom: weddingData.groom,
                bride: weddingData.bride,
                weddingDate: weddingData.weddingDate,
                groomAddress: weddingData.groomAddress,
                brideAddress: weddingData.brideAddress,
                lunarDay: weddingData.lunarDay,
            });
            setError('Dữ liệu không đầy đủ để lưu thiệp.');
            setIsLoading(false);
            return;
        }

        try {
            const token: string | null = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_BASE_URL}/cards/save-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderCode,
                    weddingData,
                    weddingImages,
                }),
            });

            const result: SaveCardResponse = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Lỗi khi lưu thiệp.');
            }

            setIsCompleted(true);
            setIsLoading(false);
            showToastSuccess('Lưu thiệp thành công!');
            router.push(`/account/info?templateId=${templateId}&feedback=true`);
        } catch (err) {
            console.error('Lỗi khi lưu thiệp:', err);
            setError('Không tìm thấy đơn hàng đã thanh toán');
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {isLoading ? (
                <div className={styles.loading}>Đang xử lý...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : isCompleted ? (
                <div className={styles.success}>
                    <h2>Thành công!</h2>
                    <p>Thiệp của bạn đã được lưu thành công.</p>
                    <button className={styles.button} onClick={() => router.push('/dashboard')}>
                        Về trang chính
                    </button>
                </div>
            ) : (
                <div className={styles.success}>
                    <h2>Thanh toán thành công!</h2>
                    <p>
                        Cảm ơn bạn đã thanh toán. Vui lòng nhấn nút <strong>Hoàn Thành</strong> để hoàn thành việc lưu
                        thiệp cưới.
                    </p>
                    <button className={styles.completeButton} onClick={handleComplete} disabled={isLoading}>
                        {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SuccessPage;
