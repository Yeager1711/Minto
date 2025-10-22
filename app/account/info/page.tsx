'use client';

import React, { useState, useEffect } from 'react';
import styles from './account_info.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faCopy, faBell, faPencil, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { useRouter, useSearchParams } from 'next/navigation';
import QR_Created from 'app/pages/DefaultLayouts/QR_created/QR_created';
import UserFeedback from 'app/feedback/userFeedback/userFeedBack';

interface UserProfile {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    created_at: Date;
    role: {
        role_id: number;
        name: string;
    };
}

interface Guest {
    guest_id: number;
    invitation_id: number;
    full_name: string;
}

interface UserTemplateItem {
    card_id: number;
    template: {
        template_id: number;
        name: string;
        image_url: string;
        price: string;
        payments: {
            amount: string;
            payment_date: string;
            status: string;
            payment_method: string;
        }[];
        guests: Guest[];
    };
}

interface UserTemplatesResponse {
    paidTemplates: {
        orders_success: UserTemplateItem[];
        orders_cancel: UserTemplateItem[];
    };
}

interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: string;
    status: string;
    representative: string;
}

interface Bank {
    id: string;
    name: string;
    logo?: string;
    bin?: string;
    shortName?: string;
    code?: string;
}

interface DiscountEligibilityResponse {
    isEligible: boolean;
    message?: string;
}

interface ErrorFeedback {
    feedback_id: number;
    error_message: string;
    submitted_at: Date;
    status: string;
    resolved_at: Date | null;
    resolution_notes: string | null;
    is_read: number;
    user: {
        user_id: number;
        full_name: string;
        email: string;
    };
}

interface SelectedGuests {
    guests: Guest[];
    templateName: string;
    template_id: number;
    card_id: number; // Added card_id
    price: string;
    paymentAmount?: string;
    paymentDate?: string;
}

const AccountInfo: React.FC = () => {
    const { getUserProfile, getUserTemplates, accessToken, updateUserName, getUserQr, checkDiscountEligibility } =
        useApi();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isQrLoading, setIsQrLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedFullName, setEditedFullName] = useState<string>('');
    const [templates, setTemplates] = useState<UserTemplatesResponse>({
        paidTemplates: { orders_success: [], orders_cancel: [] },
    });
    const [activeTab, setActiveTab] = useState<'success' | 'cancel'>('success');
    const [showGuestsModal, setShowGuestsModal] = useState<boolean>(false);
    const [selectedGuests, setSelectedGuests] = useState<SelectedGuests | null>(null);
    const [showQrPopup, setShowQrPopup] = useState<boolean>(false);
    const [qrData, setQrData] = useState<QrResponse[] | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [templateId, setTemplateId] = useState<number | null>(null);
    const [isEligibleForDiscount, setIsEligibleForDiscount] = useState<boolean>(false);
    const [discountEndDate, setDiscountEndDate] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [processedFeedbacks, setProcessedFeedbacks] = useState<ErrorFeedback[]>([]);
    const [isNotificationsActive, setIsNotificationsActive] = useState<boolean>(false);
    const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
    const [readFeedbackIds, setReadFeedbackIds] = useState<number[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();
    const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL ?? '';

    useEffect(() => {
        if (!accessToken) {
            router.push('/');
            return;
        }

        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const [userData, templateData, bankData, feedbackData] = await Promise.all([
                    getUserProfile(),
                    getUserTemplates(),
                    fetch('https://api.vietqr.io/v1/banks').then((res) => res.json()),
                    fetch(`${apiUrl}/error-feedback/user-feedbacks/processed`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'ngrok-skip-browser-warning': 'true',
                        },
                    }).then((res) => res.json()),
                ]);

                setUser(userData);
                setEditedFullName(userData.full_name);
                setTemplates(templateData);
                setError('');

                if (bankData.code === '00' && Array.isArray(bankData.data)) {
                    setBanks(bankData.data);
                } else {
                    console.warn('Bank API returned invalid data:', bankData);
                }

                if (feedbackData.feedbacks && Array.isArray(feedbackData.feedbacks)) {
                    setProcessedFeedbacks(
                        feedbackData.feedbacks.map((fb: ErrorFeedback) => ({
                            ...fb,
                            submitted_at: new Date(fb.submitted_at),
                            resolved_at: fb.resolved_at ? new Date(fb.resolved_at) : null,
                        }))
                    );
                } else {
                    console.warn('No processed feedbacks found:', feedbackData);
                }

                const discountResponse: DiscountEligibilityResponse = await checkDiscountEligibility();
                setIsEligibleForDiscount(discountResponse.isEligible);
                if (discountResponse.isEligible && userData.created_at) {
                    const eligibilityEndDate = new Date(userData.created_at);
                    eligibilityEndDate.setDate(eligibilityEndDate.getDate() + 7);
                    const now = new Date();
                    if (eligibilityEndDate > now) {
                        setDiscountEndDate(eligibilityEndDate);
                    } else {
                        setIsEligibleForDiscount(false);
                    }
                }
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : typeof err === 'object' && err !== null && 'message' in err
                          ? (err as { message: string }).message
                          : 'Không thể lấy dữ liệu';
                setError(errorMessage);
                console.error('Fetch error:', errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [accessToken, getUserProfile, getUserTemplates, checkDiscountEligibility, router, apiUrl]);

    useEffect(() => {
        const templateIdFromQuery = searchParams.get('templateId');
        const feedbackFromQuery = searchParams.get('feedback');
        if (templateIdFromQuery && feedbackFromQuery === 'true') {
            setTemplateId(Number(templateIdFromQuery));
            setShowFeedback(true);
        }
    }, [searchParams]);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (discountEndDate && isEligibleForDiscount) {
            const calculateTimeLeft = (): void => {
                const now = new Date();
                const difference = discountEndDate.getTime() - now.getTime();

                if (difference <= 0) {
                    setIsEligibleForDiscount(false);
                    setTimeLeft('Hết hạn');
                    return;
                }

                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft(`${days}D ${hours}h ${minutes}m ${seconds}s`);
            };

            calculateTimeLeft();
            timer = setInterval(calculateTimeLeft, 1000);

            return () => clearInterval(timer);
        }
    }, [discountEndDate, isEligibleForDiscount]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const notificationsElement = document.querySelector(`.${styles.notifications}`);
            if (notificationsElement && !notificationsElement.contains(e.target as Node)) {
                if (readFeedbackIds.length > 0) {
                    readFeedbackIds.forEach(async (feedbackId) => {
                        try {
                            const response = await fetch(`${apiUrl}/error-feedback/${feedbackId}/read`, {
                                method: 'PATCH',
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                    'ngrok-skip-browser-warning': 'true',
                                },
                            });
                            if (!response.ok) {
                                throw new Error('Failed to mark feedback as read');
                            }
                            setProcessedFeedbacks((prev) => prev.filter((fb) => fb.feedback_id !== feedbackId));
                        } catch (err: unknown) {
                            console.error(`Failed to mark feedback ${feedbackId} as read:`, err);
                        }
                    });
                    setReadFeedbackIds([]);
                }
                setIsNotificationsActive(false);
                setSelectedFeedbackId(null);
            }
        };

        const handleScroll = () => {
            if (readFeedbackIds.length > 0) {
                readFeedbackIds.forEach(async (feedbackId) => {
                    try {
                        const response = await fetch(`${apiUrl}/error-feedback/${feedbackId}/read`, {
                            method: 'PATCH',
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                                'ngrok-skip-browser-warning': 'true',
                            },
                        });
                        if (!response.ok) {
                            throw new Error('Failed to mark feedback as read');
                        }
                        setProcessedFeedbacks((prev) => prev.filter((fb) => fb.feedback_id !== feedbackId));
                    } catch (err: unknown) {
                        console.error(`Failed to mark feedback ${feedbackId} as read:`, err);
                    }
                });
                setReadFeedbackIds([]);
            }
            setIsNotificationsActive(false);
            setSelectedFeedbackId(null);
        };

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [readFeedbackIds, accessToken, apiUrl]);

    const handleEdit = (): void => setIsEditing(true);

    const handleSave = async (): Promise<void> => {
        try {
            const updatedUser = await updateUserName(editedFullName);
            setUser(updatedUser);
            setIsEditing(false);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === 'object' && err !== null && 'message' in err
                      ? (err as { message: string }).message
                      : 'Không thể cập nhật tên';
            setError(errorMessage);
        }
    };

    const handleShowGuests = (
        guests: Guest[],
        templateName: string,
        template_id: number,
        card_id: number, // Added card_id
        price: string,
        paymentAmount?: string,
        paymentDate?: string
    ): void => {
        setSelectedGuests({ guests, templateName, template_id, card_id, price, paymentAmount, paymentDate });
        setShowGuestsModal(true);
    };

    const handleCloseGuestsModal = (): void => {
        setShowGuestsModal(false);
        setSelectedGuests(null);
    };

    const handleShowQrPopup = async (): Promise<void> => {
        setIsQrLoading(true);
        try {
            const qrList = await getUserQr();
            if (qrList.length > 0) {
                const convertedQrList: QrResponse[] = qrList.map((qr) => ({
                    ...qr,
                    createdAt:
                        qr.createdAt instanceof Date
                            ? qr.createdAt.toISOString()
                            : new Date(qr.createdAt).toISOString(),
                }));
                setQrData(convertedQrList);
                setShowQrPopup(true);
            } else {
                throw new Error('Bạn chưa tạo mã QR');
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === 'object' && err !== null && 'message' in err
                      ? (err as { message: string }).message
                      : 'Bạn chưa tạo thẻ, hoặc lỗi không thể lấy mã QR';
            setError(errorMessage);
        } finally {
            setIsQrLoading(false);
        }
    };

    const handleCloseQrPopup = (): void => {
        setShowQrPopup(false);
        setQrData(null);
    };

    const exportGuestLinks = (): void => {
        if (!selectedGuests || !selectedGuests.guests.length || !selectedGuests.card_id) {
            setError('Không có khách mời hoặc card_id không hợp lệ để xuất file.');
            return;
        }

        const baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL ?? '';
        const links: string = selectedGuests.guests
            .map(
                (guest: Guest) =>
                    `${guest.full_name}: ${baseUrl}/template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}/${selectedGuests.card_id}`
            )
            .join('\n');

        const blob = new Blob([links], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `guest_links_${selectedGuests.template_id}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text: string): void => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                alert('Đường link đã được sao chép!');
            })
            .catch((err) => {
                console.error('Lỗi khi sao chép: ', err);
                alert('Không thể sao chép đường link.');
            });
    };

    const totalSpending = templates.paidTemplates[activeTab === 'success' ? 'orders_success' : 'orders_cancel'].reduce(
        (total: number, template: UserTemplateItem) => {
            const payment = template.template.payments[0];
            return total + (payment ? parseFloat(payment.amount) : 0);
        },
        0
    );

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon ☀️';
        return 'Good Evening';
    };

    const handleToggleNotifications = (e: React.MouseEvent): void => {
        e.stopPropagation();
        setIsNotificationsActive((prev) => !prev);
    };

    const handleFeedbackClick = (e: React.MouseEvent, feedbackId: number): void => {
        e.stopPropagation();
        setSelectedFeedbackId((prev) => (prev === feedbackId ? null : feedbackId));
        setReadFeedbackIds((prev) => {
            if (
                !prev.includes(feedbackId) &&
                processedFeedbacks.find((fb) => fb.feedback_id === feedbackId)?.is_read === 0
            ) {
                return [...prev, feedbackId];
            }
            return prev;
        });
    };

    const getRelativeTime = (date: string | Date | null): string => {
        if (!date) return 'Chưa xử lý';

        const now = new Date();
        const resolvedDate = new Date(date);
        const diffInMs = now.getTime() - resolvedDate.getTime();
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        if (diffInDays < 30) return `${diffInDays} ngày trước`;
        return resolvedDate.toLocaleDateString('vi-VN');
    };

    return (
        <div className={styles.accountInfo}>
            <div className={styles.accountInfo_wrapper}>
                <div className={styles.accountInfo_header}>
                    <div className={styles.QR_created}>
                        <FontAwesomeIcon icon={faQrcode} onClick={handleShowQrPopup} aria-label="Xem mã QR" />
                        {isEditing ? (
                            <button className={styles.save_name} onClick={handleSave} aria-label="Lưu tên">
                                Lưu
                            </button>
                        ) : (
                            <button className={styles.edit_name} onClick={handleEdit} aria-label="Chỉnh sửa tên">
                                <FontAwesomeIcon icon={faPencil} />
                            </button>
                        )}
                    </div>
                    <div
                        className={`${styles.notifications} ${isNotificationsActive ? styles.active : ''}`}
                        onClick={handleToggleNotifications}
                    >
                        <FontAwesomeIcon icon={faBell} aria-label="Thông báo" />
                        <div className={styles.total_notRead}>
                            {processedFeedbacks.filter((fb) => fb.is_read === 0).length}
                        </div>
                        <div className={styles.feedback_items}>
                            <h4>Thông báo</h4>
                            {isNotificationsActive && processedFeedbacks.length > 0 ? (
                                processedFeedbacks.map((feedback: ErrorFeedback) => (
                                    <div
                                        key={feedback.feedback_id}
                                        className={styles.item}
                                        onClick={(e) => handleFeedbackClick(e, feedback.feedback_id)}
                                    >
                                        <h3>{feedback.error_message}</h3>
                                        <div className={styles.time_action}>
                                            <span>{feedback.status === 'RESOLVED' ? 'Đã xử lý' : feedback.status}</span>
                                            |<span>{getRelativeTime(feedback.resolved_at)}</span>
                                        </div>
                                        {selectedFeedbackId === feedback.feedback_id && (
                                            <span className={styles.notes} onClick={(e) => e.stopPropagation()}>
                                                <strong>✧</strong> Ghi chú:{' '}
                                                {feedback.resolution_notes || 'Không có ghi chú'}
                                            </span>
                                        )}
                                        <div className={styles.dot}></div>
                                    </div>
                                ))
                            ) : isNotificationsActive ? (
                                <div className={styles.item_null}>Chưa có phản hồi nào.</div>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className={styles.header}>
                    <div className={styles.User_name}>
                        <span>{getGreeting()}</span>
                        {isLoading ? (
                            <div className={`${styles.skeleton} ${styles.skeleton_text}`}></div>
                        ) : isEditing ? (
                            <div>
                                <input
                                    type="text"
                                    value={editedFullName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setEditedFullName(e.target.value)
                                    }
                                    className={styles.input}
                                    aria-label="Chỉnh sửa họ và tên"
                                />
                            </div>
                        ) : (
                            <h3>Hi {user?.full_name ?? 'Chưa cập nhật'}!</h3>
                        )}
                    </div>
                </div>
                {error && <p className={styles.error}>Lỗi: {error}</p>}
                <div className={styles.body}>
                    <div className={styles.body_header}>
                        <div className={styles.box_eventNewAccount}>
                            <h3>Ưu đãi khi lần đầu sử dụng</h3>
                            <div className={styles.flex}>
                                {isEligibleForDiscount && timeLeft ? (
                                    <>
                                        <span className={styles.day}>{timeLeft.split(' ')[0]}</span>
                                        <span className={styles.hour}>{timeLeft.split(' ')[1]}</span>
                                        <span className={styles.minutes}>{timeLeft.split(' ')[2]}</span>
                                        <span className={styles.seconds}>{timeLeft.split(' ')[3]}</span>
                                    </>
                                ) : (
                                    <span className={styles.hasExpired}>Hết hạn hoặc không đủ điều kiện !</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.Total_spending}>
                            <span>Tổng chi tiêu</span>
                            <h3>{isLoading ? '...' : `${totalSpending.toLocaleString('vi-VN')} VNĐ`}</h3>
                        </div>
                    </div>
                    <div className={styles.list_orders}>
                        <div className={styles.flex}>
                            <div>
                                <h4>Đơn hàng và hóa đơn</h4>
                            </div>
                            <div className={styles.btn_change__list}>
                                <button
                                    className={activeTab === 'success' ? styles.active : ''}
                                    onClick={() => setActiveTab('success')}
                                >
                                    Đơn hàng thành công
                                </button>
                                <button
                                    className={activeTab === 'cancel' ? styles.active : ''}
                                    onClick={() => setActiveTab('cancel')}
                                >
                                    Đơn hàng bị hủy
                                </button>
                            </div>
                        </div>
                        <div className={styles.list_item}>
                            <table className={styles.table} role="grid">
                                <thead>
                                    <tr>
                                        <th>Tên template</th>
                                        <th>Giá template</th>
                                        <th>Giá thanh toán</th>
                                        <th>Ngày thanh toán</th>
                                        <th>Trạng thái</th>
                                        {activeTab === 'success' && <th>Danh sách khách mời</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        Array.from({ length: 3 }).map((_, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {Array.from({ length: activeTab === 'success' ? 6 : 5 }).map(
                                                    (_, cellIndex) => (
                                                        <td key={cellIndex}>
                                                            <div
                                                                className={`${styles.skeleton} ${styles.skeleton_cell}`}
                                                            ></div>
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        ))
                                    ) : !templates.paidTemplates ||
                                      templates.paidTemplates[
                                          activeTab === 'success' ? 'orders_success' : 'orders_cancel'
                                      ].length === 0 ? (
                                        <tr>
                                            <td colSpan={activeTab === 'success' ? 6 : 5}>
                                                {activeTab === 'success'
                                                    ? 'Chưa có đơn hàng thành công.'
                                                    : 'Chưa có đơn hàng bị hủy.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        templates.paidTemplates[
                                            activeTab === 'success' ? 'orders_success' : 'orders_cancel'
                                        ]
                                            .sort((a, b) => {
                                                const latestPaymentA =
                                                    a.template.payments.length > 0
                                                        ? new Date(a.template.payments[0].payment_date).getTime()
                                                        : 0;
                                                const latestPaymentB =
                                                    b.template.payments.length > 0
                                                        ? new Date(b.template.payments[0].payment_date).getTime()
                                                        : 0;
                                                return latestPaymentB - latestPaymentA;
                                            })
                                            .map((template) => (
                                                <tr key={template.card_id}>
                                                    <td data-label="Tên template">{template.template.name}</td>
                                                    <td data-label="Giá">
                                                        {parseFloat(template.template.price).toLocaleString('vi-VN')}{' '}
                                                        VNĐ
                                                    </td>
                                                    <td data-label="Số tiền thanh toán">
                                                        {template.template.payments[0]?.amount
                                                            ? `${parseFloat(template.template.payments[0].amount).toLocaleString('vi-VN')} VNĐ`
                                                            : 'Chưa có'}
                                                    </td>
                                                    <td data-label="Ngày thanh toán">
                                                        {template.template.payments[0]?.payment_date
                                                            ? new Date(
                                                                  template.template.payments[0].payment_date
                                                              ).toLocaleDateString('vi-VN')
                                                            : 'Chưa có'}
                                                    </td>
                                                    <td data-label="Trạng thái">
                                                        {template.template.payments[0]?.status === 'COMPLETED'
                                                            ? 'Hoàn tất'
                                                            : template.template.payments[0]?.status ||
                                                              'Chưa thanh toán'}
                                                    </td>
                                                    {activeTab === 'success' && (
                                                        <td data-label="Danh sách khách mời">
                                                            <button
                                                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                                                onClick={() =>
                                                                    handleShowGuests(
                                                                        template.template.guests,
                                                                        template.template.name,
                                                                        template.template.template_id,
                                                                        template.card_id, // Pass card_id
                                                                        template.template.price,
                                                                        template.template.payments[0]?.amount,
                                                                        template.template.payments[0]?.payment_date
                                                                    )
                                                                }
                                                                disabled={template.template.guests.length === 0}
                                                                aria-label="Xem danh sách khách mời"
                                                                style={{
                                                                    padding: '0.8rem 1.5rem',
                                                                    background: '#007bff',
                                                                    color: '#fff',
                                                                    borderRadius: '0.5rem',
                                                                    float: 'right',
                                                                }}
                                                            >
                                                                {template.template.guests.length > 0
                                                                    ? 'Danh sách'
                                                                    : 'Chưa có khách mời'}
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {showGuestsModal && selectedGuests && (
                    <div className={styles.modal}>
                        <div className={styles.modal_content}>
                            <div className={styles.header_modal}>
                                <div className={styles.invoice_info}>
                                    <h3>Hóa đơn thanh toán</h3>
                                    <p>
                                        <strong>Số hóa đơn:</strong> T{selectedGuests.template_id}-C
                                        {selectedGuests.card_id}
                                    </p>
                                    <p>
                                        <strong>Ngày thực hiện:</strong>{' '}
                                        {selectedGuests.paymentDate
                                            ? new Date(selectedGuests.paymentDate)
                                                  .toLocaleString('vi-VN', {
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                      hour12: true,
                                                      day: 'numeric',
                                                      month: 'long',
                                                      year: 'numeric',
                                                      timeZone: 'Asia/Ho_Chi_Minh',
                                                  })
                                                  .replace(' lúc ', ' ')
                                            : 'Chưa có'}
                                    </p>
                                    <p>
                                        <strong>Hóa đơn cho:</strong> {selectedGuests.templateName}
                                    </p>
                                    <p>
                                        <strong>Người thực hiện:</strong> {user?.full_name ?? 'Chưa cập nhật'}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {user?.email ?? 'Chưa cập nhật'}
                                    </p>
                                    <p>
                                        <strong>Giá Template:</strong>{' '}
                                        {parseFloat(selectedGuests.price).toLocaleString('vi-VN')} VNĐ
                                    </p>
                                    <p>
                                        <strong>Giá tính thêm:</strong>{' '}
                                        {selectedGuests.guests.length > 20
                                            ? `+${selectedGuests.guests.length - 20} khách mời (${(
                                                  (selectedGuests.guests.length - 20) *
                                                  500
                                              ).toLocaleString('vi-VN')} VNĐ)`
                                            : '0 VNĐ'}
                                    </p>
                                    <p>
                                        <strong>Giá Thanh toán:</strong>{' '}
                                        {selectedGuests.paymentAmount
                                            ? `${parseFloat(selectedGuests.paymentAmount).toLocaleString('vi-VN')} VNĐ`
                                            : 'Chưa có'}
                                    </p>
                                </div>
                                <div className={styles.btn_export_file} onClick={exportGuestLinks}>
                                    Xuất file danh sách khách mời
                                </div>
                            </div>
                            <div className={styles.body_modal}>
                                {selectedGuests.guests.length === 0 ? (
                                    <p>Chưa có khách mời nào.</p>
                                ) : (
                                    <table className={styles.invoice_table} role="grid">
                                        <thead>
                                            <tr>
                                                <th>Mô tả</th>
                                                <th>Link Mời</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedGuests.guests.map((guest: Guest) => {
                                                const link: string = `${
                                                    process.env.NEXT_PUBLIC_BASE_URL ?? ''
                                                }/template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}/${selectedGuests.card_id}`;
                                                return (
                                                    <tr key={guest.guest_id}>
                                                        <td data-label="Mô tả">
                                                            <a href={link}>Khách - {guest.full_name}</a>
                                                        </td>
                                                        <td data-label="Link Mời">
                                                            <FontAwesomeIcon
                                                                icon={faCopy}
                                                                className="ml-3 cursor-pointer"
                                                                onClick={() => copyToClipboard(link)}
                                                                aria-label={`Sao chép liên kết cho ${guest.full_name}`}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className={styles.footer} onClick={handleCloseGuestsModal}>
                                <button className={styles.close_button} aria-label="Đóng modal">
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {isQrLoading ? (
                    <div className={styles.qr_loading}>Đang tải mã QR...</div>
                ) : (
                    <QR_Created
                        isOpen={showQrPopup}
                        onClose={handleCloseQrPopup}
                        qrData={qrData}
                        banks={banks}
                        createdAt={user?.created_at ?? null}
                    />
                )}
                {showFeedback && templateId && user && <UserFeedback templateId={templateId} />}
            </div>
        </div>
    );
};

export default AccountInfo;
