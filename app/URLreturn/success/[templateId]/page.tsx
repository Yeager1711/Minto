'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './success.module.css';

const SuccessPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    // Lấy template_id từ path (ví dụ: /URLreturn/success/1 -> template_id = 1)
    const templateId = pathname.split('/').pop();
    console.log('templateId', templateId);

    const handleComplete = async () => {
        setIsLoading(true);
        setError(null);

        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');
        const id = searchParams.get('id'); // ID từ URL: bed09bfb4bbe498f849668e8de8dfd5a

        // Kiểm tra dữ liệu cần thiết
        if (status !== 'PAID' || !orderCode || !id || !templateId) {
            setError('Thông tin thanh toán hoặc template không hợp lệ.');
            setIsLoading(false);
            return;
        }

        // Lấy dữ liệu từ localStorage dựa trên id (không phải templateId)
        const weddingData = JSON.parse(localStorage.getItem(`WeddingData${templateId}`) || '{}');
        const imagesRaw = localStorage.getItem(`weddingImages${templateId}`);
        const weddingImages = imagesRaw ? JSON.parse(imagesRaw) : [];

        console.log('weddingData', weddingData);
        console.log('imagesRaw', imagesRaw);
        console.log('weddingImages', weddingImages);

        // Kiểm tra dữ liệu từ localStorage
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
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            }

            // Gọi API save-card với orderCode
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

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Lỗi khi lưu thiệp.');
            }

            setIsCompleted(true);
            setIsLoading(false);
            alert('Lưu thiệp thành công!');
            router.push('/dashboard');
        } catch (err) {
            console.error('Lỗi khi lưu thiệp:', err);
            setError('Không thể lưu thiệp. Vui lòng thử lại.');
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
                    <p>Cảm ơn bạn đã thanh toán. Vui lòng nhấn nút dưới đây để hoàn thành việc lưu thiệp cưới.</p>
                    <button className={styles.completeButton} onClick={handleComplete} disabled={isLoading}>
                        {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SuccessPage;
