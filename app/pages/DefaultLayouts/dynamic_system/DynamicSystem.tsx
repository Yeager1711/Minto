'use client';

import * as React from 'react';
import styles from './DynamicSystem.module.scss';
import { useRouter, useSearchParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';

interface DynamicSystemProps {
    status?: string | null; // success, error, CANCELLED, hoặc null
    mode?: DynamicMode;
    action?: string; // Tên chức năng, ví dụ: "Tạo thẻ, ....      "
    actionContent?: React.ReactNode;
}

interface PaymentResponse {
    payment_id: string;
    transaction_id: string;
    status: string;
    user: { user_id: number };
    card?: { card_id: number; status: string };
}

type DynamicMode = 'payment' | 'action' | 'notifications';

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

function DynamicSystem({ status, mode, action, actionContent }: DynamicSystemProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = React.useState(false); // Ban đầu là false để kích hoạt animation
    const [closing, setClosing] = React.useState(false);
    const [completed, setCompleted] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Extract params
    const templateId = searchParams.get('templateId');
    const checkOut = searchParams.get('checkOut') === 'true';
    const isCancelled = status === 'CANCELLED';

    React.useEffect(() => {
        if (!checkOut || !templateId) {
            setError('Template ID hoặc thông tin checkout không hợp lệ.');
        }
        // Kích hoạt animation open sau khi component mount
        const timer = setTimeout(() => setOpen(true), 0);
        return () => clearTimeout(timer);
    }, [checkOut, templateId]);

    const handleComplete = async () => {
        if (!templateId) {
            setError('Template ID không hợp lệ.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const orderCode = searchParams.get('orderCode');
        const paymentStatus = searchParams.get('status');
        const id = searchParams.get('id');

        if (paymentStatus !== 'PAID' || !orderCode || !id) {
            setError('Thông tin thanh toán hoặc template không hợp lệ.');
            setIsLoading(false);
            return;
        }

        const weddingData = JSON.parse(localStorage.getItem(`WeddingData${templateId}`) || '{}');
        const imagesRaw = localStorage.getItem(`weddingImages${templateId}`);
        const weddingImages = imagesRaw ? JSON.parse(imagesRaw) : [];

        if (
            !weddingData.groom ||
            !weddingData.bride ||
            !weddingData.weddingDate ||
            !weddingData.groomAddress ||
            !weddingData.brideAddress ||
            !weddingData.lunarDay
        ) {
            setError('Dữ liệu không đầy đủ để lưu thiệp.');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');

            const response = await fetch(`${apiUrl}/cards/save-card`, {
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

            setCompleted(true);
            setIsLoading(false);
            handleClose();
        } catch (err) {
            console.error('Lỗi khi lưu thiệp:', err);
            setError('Không tìm thấy đơn hàng đã thanh toán');
            setIsLoading(false);
        }
    };

    const handleClose = async () => {
        setClosing(true);

        const orderCode = searchParams.get('orderCode');
        if (orderCode) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) throw new Error('Vui lòng đăng nhập để tiếp tục');

                await axios.patch<PaymentResponse>(
                    `${apiUrl}/payos/status/${orderCode}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log('Payment status updated for orderCode:', orderCode);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error('Error updating payment status:', axiosError.message);
            }
        } else {
            console.warn('No orderCode found in URL');
        }

        // Chờ animation hoàn tất (giả sử animation kéo dài 500ms)
        setTimeout(() => {
            router.push('/');
        }, 500);
    };

    // Handle toggle for action mode
    const handleToggle = () => {
        if (mode === 'action') {
            if (!closing) {
                setClosing(true);
            }
        }
    };

    // Mode: Notifications
    if (mode === 'notifications') {
        return (
            <div className={[styles.dynamicSystem_Notifications, closing ? styles.closing : ''].join(' ')}>
                <div
                    className={[
                        styles.dynamicSystem_wrapper,
                        open ? styles.open : '',
                        closing ? styles.closing : '',
                    ].join(' ')}
                >
                    <div className={styles.notificationBox}>{actionContent || <p>Đây là thông báo mặc định</p>}</div>
                </div>
            </div>
        );
    }

    // Mode: Action
    if (mode === 'action' && action) {
        return (
            <div className={[styles.dynamicSystem_Action, closing ? styles.closing : ''].join(' ')}>
                <div
                    className={[
                        styles.dynamicSystem_wrapper_Action,
                        open ? styles.open : '',
                        closing ? styles.closing : '',
                    ].join(' ')}
                    onClick={handleToggle}
                >
                    <div className={styles.actionContent}>
                        <div
                            className={`${styles.actionContent__wrapper} ${
                                closing ? styles.exit : open ? styles.enter : ''
                            }`}
                        >
                            <div className={styles.left}>
                                <h3>{status === 'success' ? `${action} thành công` : `${action} thất bại`}</h3>
                                <p>
                                    {status === 'success'
                                        ? `${action} của bạn đã được thực hiện thành công!`
                                        : `Có lỗi xảy ra khi ${action.toLowerCase()}, vui lòng thử lại.`}
                                </p>
                            </div>
                            <div className={styles.right}>
                                <div className="icon">
                                    <FontAwesomeIcon icon={status === 'success' ? faCheck : faXmark} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mode: Payment
    if (mode === 'payment') {
        return (
            <div className={[styles.dynamicSystem_Payment, closing ? styles.closing : ''].join(' ')}>
                <div
                    className={[
                        styles.dynamicSystem_wrapper_Payment,
                        open ? styles.open : '',
                        closing ? styles.closing : '',
                    ].join(' ')}
                >
                    <div
                        className={[
                            styles.dynamic_flow1,
                            open ? styles.openFlow : '',
                            closing ? styles.closingFlow : '',
                        ].join(' ')}
                    >
                        <div
                            className={[
                                styles.title_content,
                                open ? styles.openTitle : '',
                                closing ? styles.closingTitle : '',
                                completed ? styles.completedTitle : '',
                                isCancelled ? styles.cancellTitle : '',
                            ].join(' ')}
                        >
                            {isCancelled
                                ? 'Thanh toán thất bại'
                                : completed
                                  ? 'Lưu thành công'
                                  : 'Thanh toán thành công'}
                        </div>

                        <div
                            className={[
                                styles.statusDot,
                                open ? styles.openStatusDot : '',
                                closing ? styles.closingStatusDot : '',
                            ].join(' ')}
                        ></div>

                        <div
                            className={[
                                styles.status,
                                open ? styles.openStatus : '',
                                closing ? styles.closingStatus : '',
                                isCancelled ? styles.cancelledStatus : '',
                            ].join(' ')}
                        >
                            {isCancelled ? '✖' : completed ? '✔' : '90%'}
                        </div>
                    </div>
                </div>

                <div className={[styles.content, open ? styles.open : '', closing ? styles.closing : ''].join(' ')}>
                    {error ? (
                        <div className={styles.error}>{error}</div>
                    ) : isLoading ? (
                        <div className={styles.loading}>Đang xử lý...</div>
                    ) : completed ? (
                        <>
                            <h3>Lưu thành công</h3>
                            <p>Thiệp của bạn đã được lưu thành công.</p>
                            <button className={styles.completeBtn} onClick={handleClose}>
                                Đóng
                            </button>
                        </>
                    ) : isCancelled ? (
                        <>
                            <h3>Thanh toán thất bại</h3>
                            <p>Vui lòng thử lại hoặc chọn phương thức khác.</p>
                            <button className={styles.completeBtn} onClick={handleClose}>
                                Đóng
                            </button>
                        </>
                    ) : (
                        <>
                            <h3>Thanh toán thành công</h3>
                            <em>
                                ✧ Nhấn vào nút <strong>Hoàn thành</strong> để lưu thiệp
                            </em>
                            <button className={styles.completeBtn} onClick={handleComplete} disabled={isLoading}>
                                {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return null;
}

export default DynamicSystem;
