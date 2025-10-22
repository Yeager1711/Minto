'use client';

import React, { useState, useEffect } from 'react';
import styles from './PaymentHistory.module.scss';
import { useApi } from 'app/lib/apiContext/apiContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

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

interface SelectedGuests {
    guests: Guest[];
    templateName: string;
    template_id: number;
    card_id: number;
}

function PaymentHistory() {
    const { getUserTemplates } = useApi();
    const [templates, setTemplates] = useState<UserTemplatesResponse>({
        paidTemplates: { orders_success: [], orders_cancel: [] },
    });
    const [activeTab, setActiveTab] = useState<'success' | 'cancel'>('success');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [selectedGuests, setSelectedGuests] = useState<SelectedGuests | null>(null);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const templateData: UserTemplatesResponse = await getUserTemplates();
                setTemplates(templateData);
                setError('');
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : typeof err === 'object' && err !== null && 'message' in err
                          ? (err as { message: string }).message
                          : 'Không thể lấy dữ liệu';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [getUserTemplates]);

    const handleShowGuests = (guests: Guest[], templateName: string, template_id: number, card_id: number): void => {
        setSelectedGuests({ guests, templateName, template_id, card_id });
    };

    const handleCloseGuests = (): void => {
        setSelectedGuests(null);
    };

    const copyToClipboard = (text: string): void => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                alert('Sao chép link mời thành công !');
            })
            .catch((err) => {
                console.error('Lỗi khi sao chép: ', err);
                alert('Không thể sao chép link.');
            });
    };

    return (
        <div className={styles.paymentHistory}>
            <div className={styles.container}>
                <div className={styles.orderSection}>
                    <h2 className={styles.sectionTitle}>Lịch sử thanh toán</h2>
                    {error && <p className={styles.error}>{error}</p>}
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
                    <div className={styles.orderList}>
                        <table className={styles.orderTable}>
                            <thead>
                                <tr>
                                    <th>Tên Template</th>
                                    <th>Giá Template</th>
                                    <th>Giá Thanh Toán</th>
                                    <th>Ngày Thanh Toán</th>
                                    <th>Trạng Thái</th>
                                    {activeTab === 'success' && <th>Khách Mời</th>}
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
                                                            className={`${styles.skeleton} ${styles.skeletonCell}`}
                                                        ></div>
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                    ))
                                ) : !templates.paidTemplates ||
                                  templates.paidTemplates[activeTab === 'success' ? 'orders_success' : 'orders_cancel']
                                      .length === 0 ? (
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
                                    ].map((template) => (
                                        <tr key={template.card_id}>
                                            <td data-label="Tên Template">{template.template.name}</td>
                                            <td data-label="Giá Template">
                                                {parseFloat(template.template.price).toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td data-label="Giá Thanh Toán">
                                                {template.template.payments[0]?.amount
                                                    ? `${parseFloat(template.template.payments[0].amount).toLocaleString('vi-VN')} VNĐ`
                                                    : 'Chưa có'}
                                            </td>
                                            <td data-label="Ngày Thanh Toán">
                                                {template.template.payments[0]?.payment_date
                                                    ? new Date(
                                                          template.template.payments[0].payment_date
                                                      ).toLocaleDateString('vi-VN')
                                                    : 'Chưa có'}
                                            </td>
                                            <td
                                                data-label="Trạng Thái"
                                                className={
                                                    template.template.payments[0]?.status === 'COMPLETED'
                                                        ? styles.statusSuccess
                                                        : template.template.payments[0]?.status === 'CANCELLED'
                                                          ? styles.statusCancel
                                                          : ''
                                                }
                                            >
                                                {template.template.payments[0]?.status === 'COMPLETED'
                                                    ? 'Success'
                                                    : template.template.payments[0]?.status || 'Chưa thanh toán'}
                                            </td>
                                            {activeTab === 'success' && (
                                                <td data-label="Khách Mời">
                                                    <button
                                                        className={styles.guestButton}
                                                        onClick={() =>
                                                            handleShowGuests(
                                                                template.template.guests,
                                                                template.template.name,
                                                                template.template.template_id,
                                                                template.card_id
                                                            )
                                                        }
                                                        disabled={template.template.guests.length === 0}
                                                    >
                                                        {template.template.guests.length > 0
                                                            ? 'Xem danh sách'
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

                {selectedGuests && (
                    <div className={styles.guestPanel}>
                        <div className={styles.guestPanelHeader}>
                            <h3 className={styles.guestPanelTitle}>
                                Danh sách khách mời - {selectedGuests.templateName}
                            </h3>
                            <button className={styles.closeButton} onClick={handleCloseGuests}>
                                Đóng
                            </button>
                        </div>
                        <div className={styles.guestPanelBody}>
                            {selectedGuests.guests.length === 0 ? (
                                <p className={styles.noGuests}>Chưa có khách mời nào.</p>
                            ) : (
                                <table className={styles.guestTable}>
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Template</th>
                                            <th>Tên Khách Mời</th>
                                            <th>Link Mời</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedGuests.guests.map((guest, index) => {
                                            const link = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}/${selectedGuests.card_id}`;
                                            return (
                                                <tr key={guest.guest_id}>
                                                    <td data-label="STT">{index + 1}</td>
                                                    <td data-label="Template">{selectedGuests.templateName}</td>
                                                    <td data-label="Tên Khách Mời">
                                                        <a
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.guestLink}
                                                        >
                                                            {guest.full_name}
                                                        </a>
                                                    </td>
                                                    <td data-label="Link Mời">
                                                        <button
                                                            className={styles.copyButton}
                                                            onClick={() => copyToClipboard(link)}
                                                            title="Sao chép link"
                                                        >
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentHistory;
