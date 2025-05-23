'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import styles from './cancel.module.scss';

// Define types for the API response
interface PaymentResponse {
    payment_id: string;
    transaction_id: string;
    status: string;
    user: { user_id: number };
    card?: { card_id: number; status: string };
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

export default function CancelPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderCode = searchParams.get('orderCode');
    const [error, setError] = useState<string | null>(null);

    const handleReturnHome = async () => {
        if (!orderCode) {
            setError('Không tìm thấy orderCode');
            console.error('No orderCode found in URL');
            router.push('/');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('Vui lòng đăng nhập để tiếp tục');
                console.error('No accessToken found');
                router.push('/login');
                return;
            }

            console.log('Sending PATCH request for orderCode:', orderCode, 'with token:', accessToken);
            const response = await axios.patch<PaymentResponse>(
                `${apiUrl}/payos/status/${orderCode}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log('Response from server:', response.data);
        } catch (error) {
            const axiosError = error as AxiosError;
            setError('Lỗi khi cập nhật trạng thái thanh toán');
            console.error('Error updating payment status:', axiosError.message, axiosError.response?.data);
        } finally {
            router.push('/');
        }
    };

    // Optional: Automatically trigger the PATCH request when the page loads
    useEffect(() => {
        if (!orderCode) {
            setError('Không tìm thấy orderCode');
            console.error('No orderCode found in URL');
            return;
        }

        const updatePaymentStatus = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setError('Vui lòng đăng nhập để tiếp tục');
                    console.error('No accessToken found');
                    return;
                }

                const response = await axios.patch<PaymentResponse>(
                    `${apiUrl}/payos/status/${orderCode}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                console.log(`Payment status updated:`, response.data);
            } catch (error) {
                const axiosError = error as AxiosError;
                setError('Lỗi khi cập nhật trạng thái thanh toán');
                console.error('Error updating payment status:', axiosError.message);
            }
        };

        updatePaymentStatus();
    }, [orderCode]);

    return (
        <div className={styles.container}>
            <h1>Thanh toán đã bị hủy!</h1>
            <p>Rất tiếc, thanh toán của bạn đã bị hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần trợ giúp.</p>
            {error && <p className={styles.error}>{error}</p>}
            <button onClick={handleReturnHome} className={styles.button}>
                Quay lại trang chủ
            </button>
        </div>
    );
}
