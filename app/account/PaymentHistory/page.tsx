'use client';
import React, { useState, useEffect } from 'react';
import styles from './PaymentHistory.module.scss';
import { useApi } from 'app/lib/apiContext/apiContext';

interface Guest {
    guest_id: number;
    invitation_id: number;
    full_name: string;
    card_id: number;
}

interface Template {
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

function PaymentHistory() {
    const { getUserTemplates } = useApi();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedGuests, setSelectedGuests] = useState<{
        guests: Guest[];
        templateName: string;
        template_id: number;
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const templateData = await getUserTemplates();
                const formattedTemplates = templateData.map((item: Template) => ({
                    card_id: item.card_id,
                    template: {
                        template_id: item.template.template_id,
                        name: item.template.name,
                        image_url: item.template.image_url,
                        price: item.template.price,
                        payments: item.template.payments,
                        guests: item.template.guests,
                    },
                }));
                setTemplates(formattedTemplates);
                setError('');
            } catch (err: unknown) {
                let errorMessage = 'Không thể lấy dữ liệu';
                if (err instanceof Error) errorMessage = err.message;
                else if (typeof err === 'object' && err !== null && 'message' in err)
                    errorMessage = (err as { message: string }).message;
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getUserTemplates]);

    const handleShowGuests = (guests: Guest[], templateName: string, template_id: number) => {
        setSelectedGuests({ guests, templateName, template_id });
    };

    const handleCloseGuests = () => {
        setSelectedGuests(null);
    };

    return (
        <div className={styles.paymentHistory}>
            <div className={styles.container}>
                <div className={styles.orderSection}>
                    <h2 className={styles.sectionTitle}>Đơn hàng và hóa đơn</h2>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.orderList}>
                        <table className={styles.orderTable}>
                            <thead>
                                <tr>
                                    <th>Tên template</th>
                                    <th>Giá template</th>
                                    <th>Giá thanh toán</th>
                                    <th>Ngày thanh toán</th>
                                    <th>Trạng thái</th>
                                    <th>Danh sách khách mời</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Array.from({ length: 6 }).map((_, cellIndex) => (
                                                <td key={cellIndex}>
                                                    <div className={`${styles.skeleton} ${styles.skeletonCell}`}></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : templates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>Chưa có đơn hàng nào.</td>
                                    </tr>
                                ) : (
                                    templates.map((template) => (
                                        <tr key={template.card_id}>
                                            <td className={styles.ellipsis}>{template.template.name}</td>
                                            <td className={styles.ellipsis}>
                                                {parseFloat(template.template.price).toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className={styles.ellipsis}>
                                                {template.template.payments[0]?.amount
                                                    ? `${parseFloat(template.template.payments[0].amount).toLocaleString('vi-VN')} VNĐ`
                                                    : 'Chưa có'}
                                            </td>
                                            <td className={styles.ellipsis}>
                                                {template.template.payments[0]?.payment_date
                                                    ? new Date(
                                                          template.template.payments[0].payment_date
                                                      ).toLocaleDateString('vi-VN')
                                                    : 'Chưa có'}
                                            </td>
                                            <td className={styles.ellipsis}>
                                                {template.template.payments[0]?.status === 'COMPLETED'
                                                    ? 'Hoàn tất'
                                                    : template.template.payments[0]?.status || 'Chưa thanh toán'}
                                            </td>
                                            <td>
                                                <button
                                                    className={styles.guestButton}
                                                    onClick={() =>
                                                        handleShowGuests(
                                                            template.template.guests,
                                                            template.template.name,
                                                            template.template.template_id
                                                        )
                                                    }
                                                    disabled={template.template.guests.length === 0}
                                                >
                                                    {template.template.guests.length > 0
                                                        ? 'Danh sách'
                                                        : 'Chưa có khách mời'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedGuests && (
                    <div className={styles.guestPanel}>
                        <div className={styles.guestPanelHeader}>
                            <h3 className={styles.guestPanelTitle}>Danh sách khách mời</h3>
                            <button className={styles.closeButton} onClick={handleCloseGuests}>
                                Đóng
                            </button>
                        </div>
                        {selectedGuests.guests.length === 0 ? (
                            <p className={styles.noGuests}>Chưa có khách mời nào.</p>
                        ) : (
                            <table className={styles.guestTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.ellipsis}>Template</th>
                                        <th className={styles.ellipsis}>Tên khách mời</th>
                                        <th className={styles.ellipsis}>Links mời</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedGuests.guests.map((guest) => (
                                        <tr key={guest.guest_id}>
                                            <td className={styles.ellipsis}>{selectedGuests.templateName}</td>
                                            <td className={styles.ellipsis}>{guest.full_name}</td>
                                            <td className={styles.ellipsis}>
                                                {guest.card_id ? (
                                                    <a
                                                        href={`/template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}/${guest.card_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.guestLink}
                                                    >
                                                        Link mời 
                                                    </a>
                                                ) : (
                                                    <span className={styles.linkUnavailable}>
                                                        Link không khả dụng (thiếu card_id)
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentHistory;
