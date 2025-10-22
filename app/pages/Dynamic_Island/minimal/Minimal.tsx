'use client';
import * as React from 'react';
import styles from './minimal.module.css';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

interface DynamicPayload {
    state: 'minimal' | 'compact' | 'expanded';
    TypeContextCollapsed?: boolean;
    action: 'success' | 'failure';
    actionTitle?: string;
    describle?: string;
    time?: string;
    type?: string;
    duration?: number;
    [key: string]: unknown;
}

interface MinimalProps {
    payload: DynamicPayload;
    onClose: () => void;
}

function Minimal({ payload, onClose }: MinimalProps) {
    const [expanded, setExpanded] = React.useState(true);
    const [isVisible, setIsVisible] = React.useState(true);
    const [showExpandPayment, setShowExpandPayment] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isSaved, setIsSaved] = React.useState(false);
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [orderCode, setOrderCode] = React.useState<string | null>(null);
    const [amount, setAmount] = React.useState<number | null>(null);

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

    React.useEffect(() => {
        const code = searchParams.get('orderCode');
        const amt = searchParams.get('amount');
        setOrderCode(code);
        setAmount(amt ? parseInt(amt, 10) : null);
    }, [searchParams]);

    React.useEffect(() => {
        console.log('Minimal: Component mounted, delaying initialization');
        const initTimer = setTimeout(() => {
            console.log('Minimal: Initialization complete, showing layout');
            setIsInitialized(true);
            const expandTimer = setTimeout(() => {
                console.log('Minimal: Starting animation by setting expanded to false');
                setExpanded(false);
            }, 800);
            return () => clearTimeout(expandTimer);
        }, 1000);

        return () => {
            clearTimeout(initTimer);
            console.log('Minimal: Component unmounted');
        };
    }, []);

    React.useEffect(() => {
        const node = wrapperRef.current;
        if (!node || !isInitialized) return;

        const handleWrapperTransitionEnd = (e: TransitionEvent) => {
            console.log('Minimal: Transition end, property:', e.propertyName, 'expanded:', expanded);
            if (e.propertyName === 'width' && !expanded) {
                console.log('Minimal: Setting showExpandPayment to true');
                setShowExpandPayment(true);
            }
        };

        node.addEventListener('transitionend', handleWrapperTransitionEnd);
        return () => {
            node.removeEventListener('transitionend', handleWrapperTransitionEnd);
            console.log('Minimal: Cleanup transitionend listener');
        };
    }, [expanded, isInitialized]);

    const handleComplete = async () => {
        const templateId = searchParams.get('templateId');
        const orderCode = searchParams.get('orderCode');
        const paymentStatus = searchParams.get('status');
        const id = searchParams.get('id');

        console.log('Minimal: handleComplete called', { templateId, orderCode, paymentStatus, id });

        if (!templateId || !orderCode || paymentStatus !== 'PAID' || !id) {
            console.log('Minimal: Invalid payment data, setting error');
            setError('Dữ liệu thanh toán không hợp lệ.');
            setExpanded(false);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Không tìm thấy token.');

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
                throw new Error('Dữ liệu thiệp không đầy đủ.');
            }

            console.log('Minimal: Sending save-card request', { orderCode, weddingData, weddingImages });

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
            if (!response.ok) throw new Error(result.message || 'Lỗi khi lưu thiệp.');

            console.log('Minimal: Card saved successfully, updating payment status');
            await axios.patch(
                `${apiUrl}/payos/status/${orderCode}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Minimal: Setting isSaved to true after successful save');
            setIsSaved(true);
            setExpanded(false);
        } catch (err) {
            console.error('Minimal: Error saving card:', err);
            setError((err as Error).message || 'Không thể lưu thiệp.');
            setExpanded(false);
        } finally {
            setIsSaving(false);
        }
    };

    // Hàm handleClose mới, tích hợp logic từ DynamicSystem
    const handleClose = async () => {
        console.log('Minimal: handleClose called, initiating close sequence');
        setExpanded(true); // Kích hoạt animation đóng (nếu CSS yêu cầu)

        if (orderCode) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) throw new Error('Vui lòng đăng nhập để tiếp tục');

                console.log('Minimal: Updating payment status for orderCode:', orderCode);
                await axios.patch(
                    `${apiUrl}/payos/status/${orderCode}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log('Minimal: Payment status updated successfully for orderCode:', orderCode);
            } catch (err) {
                console.error('Minimal: Error updating payment status:', (err as Error).message);
            }
        } else {
            console.warn('Minimal: No orderCode found in URL');
        }

        // Chờ animation hoàn tất (giả sử animation kéo dài 300ms)
        setTimeout(() => {
            console.log('Minimal: Animation complete, closing component');
            setIsVisible(false);
            onClose();
            router.push('/');
        }, 300); // Điều chỉnh thời gian khớp với CSS animation
    };

    React.useEffect(() => {
        if (isSaved) {
            console.log('Minimal: Scheduling auto-close after 1s');
            const timer = setTimeout(() => {
                console.log('Minimal: Auto-closing component');
                setIsVisible(false);
                onClose();
                router.push('/');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isSaved, onClose, router]);

    if (!isVisible || !isInitialized) return null;

    console.log('Minimal: Rendering, states:', { isVisible, expanded, showExpandPayment, error, isSaving, isSaved });
    const formatAmount = (amt: number | null) => (amt ? new Intl.NumberFormat('vi-VN').format(amt) + ' VNĐ' : '0');
    return (
        <div className={styles.Minimal}>
            <div ref={wrapperRef} className={`${styles.Minimal_wrapper} ${expanded ? styles.expanded : styles.shrunk}`}>
                <div className={styles.stage_wrapper}>
                    <div className={styles.object_content}>
                        <div className={styles.action}>{payload.actionTitle || 'Thanh toán'}</div>
                        <div
                            className={`${styles.object_status} ${payload.action === 'success' ? styles.success : styles.fail}`}
                        >
                            <FontAwesomeIcon icon={payload.action === 'success' ? faCheck : faXmark} />
                        </div>
                    </div>

                    <div className={`${styles.expand_payment} ${showExpandPayment ? styles.show : ''}`}>
                        <div className={styles.expand_payment__wrapper}>
                            {error ? (
                                <div style={{ display: 'flex' }}>
                                    <div>
                                        <h3>Thanh toán lỗi</h3>
                                        <span>
                                            Mã đơn hàng: <strong>#{orderCode || 'xxx'}</strong>
                                        </span>
                                        <p>Dữ liệu thanh toán không hợp lệ hoặc lỗi hệ thống: {error}</p>
                                    </div>
                                    <div>
                                        <span>
                                            <strong>{formatAmount(amount)}</strong>
                                        </span>
                                        <button
                                            className={styles.btn_cancel}
                                            onClick={handleClose} // Sử dụng handleClose thay vì inline function
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            ) : isSaving ? (
                                <>
                                    <div>
                                        <h3>Đang lưu thiệp...</h3>
                                        <p>Vui lòng chờ trong giây lát.</p>
                                        <br />
                                    </div>
                                    <div>
                                        <button className={styles.btn_success} disabled={true}>
                                            Đang lưu...
                                        </button>
                                    </div>
                                </>
                            ) : isSaved ? (
                                <>
                                    <div className={styles.flex_saved}>
                                        <h3>Thiệp đã được lưu</h3>
                                        <p>Thiệp cưới của bạn đã được lưu thành công.</p>
                                    </div>
                                </>
                            ) : payload.action === 'success' ? (
                                <div className={styles.typeSuccess}>
                                    <div className={styles.typeSuccess_left}>
                                        <h3>Thanh toán thành công</h3>
                                        <span>
                                            Mã đơn hàng: <strong>#{orderCode || 'xxx'}</strong>
                                        </span>
                                        <em>
                                            ✧ Nhấn vào nút <strong>Hoàn thành</strong> để lưu
                                        </em>
                                    </div>
                                    <div className={styles.typeSuccess_right}>
                                        <p className={styles.big_number}>
                                            <strong>{formatAmount(amount)}</strong>
                                        </p>
                                        <button
                                            className={styles.btn_success}
                                            onClick={handleComplete}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Đang lưu...' : 'Hoàn thành'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3>Thanh toán thất bại</h3>
                                        <p>{payload.describle || 'Lý do không xác định, vui lòng thử lại.'}</p>
                                        <span>
                                            Mã đơn hàng: <strong>#{orderCode || 'xxx'}</strong>
                                        </span>
                                    </div>
                                    <div>
                                        <span>
                                            <p className={styles.big_number}>
                                                <strong>{formatAmount(amount)}</strong>
                                            </p>
                                        </span>
                                        <button
                                            className={styles.btn_cancel}
                                            onClick={handleClose} // Sử dụng handleClose thay vì inline function
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Minimal;
