'use client';

import React, { useState, useEffect } from 'react';
import styles from './account_info.module.scss';
import { useApi } from 'app/lib/apiContext/apiContext';
import Countdown from 'app/func/countDown/page';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import QRPopup from '../../popup/QR_created/QR_created';

interface UserProfile {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: {
        role_id: number;
        name: string;
    };
}

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

interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: Date;
    status: string;
}

function AccountInfo() {
    const { getUserProfile, getUserTemplates, accessToken, updateUserName, getUserQr } = useApi();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFullName, setEditedFullName] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showGuestsModal, setShowGuestsModal] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState<{
        guests: Guest[];
        templateName: string;
        template_id: number;
        price: string;
        paymentAmount?: string;
        paymentDate?: string;
    } | null>(null);
    const [showQrPopup, setShowQrPopup] = useState(false);
    const [qrData, setQrData] = useState<QrResponse | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (!accessToken) {
            router.push('/');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [userData, templateData] = await Promise.all([getUserProfile(), getUserTemplates()]);
                setUser(userData);
                setEditedFullName(userData.full_name);
                setError('');
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
                // Merge templates with the same template_id
                const uniqueTemplates = formattedTemplates.reduce((acc, current) => {
                    const existing = acc.find((item) => item.template.template_id === current.template.template_id);
                    if (!existing) {
                        acc.push(current);
                    }
                    return acc;
                }, [] as Template[]);
                setTemplates(uniqueTemplates);
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
    }, [accessToken, getUserProfile, getUserTemplates, router]);

    const handleEdit = () => setIsEditing(true);

    const handleSave = async () => {
        try {
            const updatedUser = await updateUserName(editedFullName);
            setUser(updatedUser);
            setIsEditing(false);
        } catch (err: unknown) {
            let errorMessage = 'Không thể cập nhật tên';
            if (err instanceof Error) errorMessage = err.message;
            else if (typeof err === 'object' && err !== null && 'message' in err)
                errorMessage = (err as { message: string }).message;
            setError(errorMessage);
        }
    };

    const handleShowGuests = (
        guests: Guest[],
        templateName: string,
        template_id: number,
        price: string,
        paymentAmount?: string,
        paymentDate?: string
    ) => {
        setSelectedGuests({ guests, templateName, template_id, price, paymentAmount, paymentDate });
        setShowGuestsModal(true);
    };

    const handleCloseGuestsModal = () => {
        setShowGuestsModal(false);
        setSelectedGuests(null);
    };

    const handleShowQrPopup = async () => {
        try {
            const qrList = await getUserQr();
            if (qrList.length > 0) {
                setQrData(qrList[0]); // Select the first QR code
                setShowQrPopup(true);
            } else {
                throw new Error('Bạn chưa tạo mã QR');
            }
        } catch (err: unknown) {
            let errorMessage = 'Bạn chưa tạo thẻ, hoặc lỗi không thể lấy mã QR';
            if (err instanceof Error) errorMessage = err.message;
            else if (typeof err === 'object' && err !== null && 'message' in err)
                errorMessage = (err as { message: string }).message;
            setError(errorMessage);
        }
    };

    const handleCloseQrPopup = () => {
        setShowQrPopup(false);
        setQrData(null);
    };

    return (
        <div className={styles.account_info}>
            <div className={styles.wrapper}>
                <div className={styles.header_infoAccount}>
                    <div className={styles.wrapper_left}>
                        <div className={styles.account_info__wrapper}>
                            <h3>
                                Chào mừng bạn đến với <strong>Minto</strong>
                            </h3>
                            {error ? (
                                <p className={styles.error}>Lỗi: {error}</p>
                            ) : isLoading ? (
                                <div className={styles.skeleton_wrapper}>
                                    <div className={styles.box_item}>
                                        <div className={styles.box_flex}>
                                            <h2>Họ và tên</h2>
                                            <div className={`${styles.skeleton} ${styles.skeleton_text}`}></div>
                                        </div>
                                        <div className={styles.box_right}>
                                            <div className={`${styles.skeleton} ${styles.skeleton_button}`}></div>
                                        </div>
                                    </div>
                                    <div className={styles.box_item}>
                                        <div className={styles.box_flex}>
                                            <h2>Địa chỉ Email</h2>
                                            <div className={`${styles.skeleton} ${styles.skeleton_text}`}></div>
                                        </div>
                                        <div className={styles.box_right}></div>
                                    </div>
                                </div>
                            ) : user ? (
                                <>
                                    <div className={styles.box_item}>
                                        <div className={styles.box_flex}>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editedFullName}
                                                    onChange={(e) => setEditedFullName(e.target.value)}
                                                    className={styles.input}
                                                />
                                            ) : (
                                                <h2>{user.full_name || 'Chưa cập nhật'}</h2>
                                            )}
                                        </div>
                                        <div className={styles.box_right}>
                                            {isEditing ? (
                                                <button onClick={handleSave}>Lưu</button>
                                            ) : (
                                                <button onClick={handleEdit}>Chỉnh sửa</button>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.box_item}>
                                        <div className={styles.box_flex}>
                                            <span>{user.email || 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p>Không có dữ liệu người dùng.</p>
                            )}

                            <Countdown />
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.wrapper__right_template}>
                            <FontAwesomeIcon
                                className={styles.icon_QR}
                                icon={faQrcode}
                                onClick={handleShowQrPopup}
                                style={{ display: 'none' }}
                            />
                            <h4>Mẫu template đã sử dụng</h4>
                            {isLoading ? (
                                <div className={styles.grid_template}>
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className={styles.template_item}>
                                            <div className={`${styles.skeleton} ${styles.skeleton_image}`}></div>
                                        </div>
                                    ))}
                                </div>
                            ) : templates.length === 0 ? (
                                <p>Chưa có template nào được sử dụng.</p>
                            ) : (
                                <div className={styles.grid_template}>
                                    {templates.map((template) => (
                                        <div key={template.card_id} className={styles.template_item}>
                                            <div className={styles.image}>
                                                <img
                                                    src={template.template.image_url}
                                                    alt={template.template.name}
                                                    onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.list_orders}>
                    <h4>Đơn hàng và hóa đơn</h4>
                    <div className={styles.list_item}>
                        <table className={styles.table}>
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
                                                    <div className={`${styles.skeleton} ${styles.skeleton_cell}`}></div>
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
                                            <td data-label="Tên template">{template.template.name}</td>
                                            <td data-label="Giá">
                                                {parseFloat(template.template.price).toLocaleString('vi-VN')} VNĐ
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
                                                    : template.template.payments[0]?.status || 'Chưa thanh toán'}
                                            </td>
                                            <td data-label="Danh sách khách mời">
                                                <button
                                                    style={{
                                                        padding: '0.8rem 1.5rem',
                                                        background: '#007bff',
                                                        color: '#fff',
                                                        borderRadius: '0.5rem',
                                                    }}
                                                    onClick={() =>
                                                        handleShowGuests(
                                                            template.template.guests,
                                                            template.template.name,
                                                            template.template.template_id,
                                                            template.template.price,
                                                            template.template.payments[0]?.amount,
                                                            template.template.payments[0]?.payment_date
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
            </div>

            {showGuestsModal && selectedGuests && (
                <div className={styles.modal}>
                    <div className={styles.modal_content}>
                        <div className={styles.header}>
                            <div className={styles.company_info}>
                                <h2>⚡Minto</h2>
                                <p>mintoinvitions@gmail.com</p>
                            </div>
                            <div className={styles.invoice_info}>
                                <h3>Hóa đơn thanh toán</h3>
                                <p>
                                    <strong>Số hóa đơn:</strong> T{selectedGuests.template_id}-C
                                    {selectedGuests.guests[0]?.card_id || 'N/A'}
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
                                    <strong>Người thực hiện:</strong> {user?.full_name || 'Chưa cập nhật'}
                                </p>
                                <p>
                                    <strong>Email:</strong> {user?.email || 'Chưa cập nhật'}
                                </p>
                                <p>
                                    <strong>Giá Template:</strong>{' '}
                                    {parseFloat(selectedGuests.price).toLocaleString('vi-VN')} VNĐ
                                </p>
                                <p>
                                    <strong>Giá Thanh toán:</strong>{' '}
                                    {selectedGuests.paymentAmount
                                        ? `${parseFloat(selectedGuests.paymentAmount).toLocaleString('vi-VN')} VNĐ`
                                        : 'Chưa thanh toán'}
                                </p>
                            </div>
                        </div>
                        <div className={styles.body}>
                            {selectedGuests.guests.length === 0 ? (
                                <p>Chưa có khách mời nào.</p>
                            ) : (
                                <table className={styles.invoice_table}>
                                    <thead>
                                        <tr>
                                            <th>Mô tả</th>
                                            <th>Link Mời</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedGuests.guests.map((guest) => (
                                            <tr key={guest.guest_id}>
                                                <td data-label="Mô tả">Khách - {guest.full_name}</td>
                                                <td data-label="Link Mời">
                                                    {guest.card_id ? (
                                                        <a
                                                            href={`/template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}/${guest.card_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: '#007bff', textDecoration: 'underline' }}
                                                        >
                                                            {guest.full_name}
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: '#ff9999' }}>
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
                        <div className={styles.footer}>
                            <button className={styles.close_button} onClick={handleCloseGuestsModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <QRPopup isOpen={showQrPopup} onClose={handleCloseQrPopup} qrData={qrData} />
        </div>
    );
}

export default AccountInfo;
