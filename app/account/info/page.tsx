'use client';

import React, { useState, useEffect } from 'react';
import styles from './account_info.module.scss';
import { useApi } from 'app/lib/apiContext/apiContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faCopy } from '@fortawesome/free-solid-svg-icons';
import QRPopupCreated from '../../popup/QR_created/QR_created';
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

function AccountInfo() {
    const { getUserProfile, getUserTemplates, accessToken, updateUserName, getUserQr, checkDiscountEligibility } =
        useApi();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedFullName, setEditedFullName] = useState<string>('');
    const [allTemplates, setAllTemplates] = useState<Template[]>([]); // Store all orders
    const [uniqueTemplates, setUniqueTemplates] = useState<Template[]>([]); // Store merged templates for display
    const [showGuestsModal, setShowGuestsModal] = useState<boolean>(false);
    const [selectedGuests, setSelectedGuests] = useState<{
        guests: Guest[];
        templateName: string;
        template_id: number;
        price: string;
        paymentAmount?: string;
        paymentDate?: string;
    } | null>(null);
    const [showQrPopup, setShowQrPopup] = useState<boolean>(false);
    const [qrData, setQrData] = useState<QrResponse[] | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [templateId, setTemplateId] = useState<number | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [isEligibleForDiscount, setIsEligibleForDiscount] = useState<boolean>(false);
    const [discountEndDate, setDiscountEndDate] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!accessToken) {
            router.push('/');
            return;
        }

        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            try {
                const [userData, templateData, bankData] = await Promise.all([
                    getUserProfile(),
                    getUserTemplates(),
                    fetch('https://api.vietqr.io/v1/banks').then((res) => res.json()),
                ]);
                setUser(userData);
                setEditedFullName(userData.full_name);
                setError('');

                // Store all templates (orders) as received
                const formattedTemplates: Template[] = templateData.map((item: Template) => ({
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
                setAllTemplates(formattedTemplates);

                // Merge templates by template_id for unique display (e.g., in grid)
                const mergedTemplates: Template[] = formattedTemplates.reduce((acc: Template[], current: Template) => {
                    const existing = acc.find((item) => item.template.template_id === current.template.template_id);
                    if (!existing) {
                        acc.push(current);
                    } else {
                        const existingIndex = acc.findIndex(
                            (item) => item.template.template_id === current.template.template_id
                        );
                        if (existingIndex !== -1) {
                            acc[existingIndex].template.guests = [
                                ...acc[existingIndex].template.guests,
                                ...current.template.guests.filter(
                                    (guest) =>
                                        !acc[existingIndex].template.guests.some((g) => g.guest_id === guest.guest_id)
                                ),
                            ];
                            acc[existingIndex].template.payments = [
                                ...acc[existingIndex].template.payments,
                                ...current.template.payments.filter(
                                    (payment) =>
                                        !acc[existingIndex].template.payments.some(
                                            (p) => p.payment_date === payment.payment_date
                                        )
                                ),
                            ];
                        }
                    }
                    return acc;
                }, []);
                setUniqueTemplates(mergedTemplates);

                if (bankData.code === '00' && Array.isArray(bankData.data)) {
                    setBanks(bankData.data);
                } else {
                    console.warn('Bank API returned invalid data:', bankData);
                }
                setError('');

                const discountResponse: DiscountEligibilityResponse = await checkDiscountEligibility();
                console.log('Discount Response:', discountResponse);
                setIsEligibleForDiscount(discountResponse.isEligible);
                if (discountResponse.isEligible && userData.created_at) {
                    const eligibilityEndDate = new Date(userData.created_at);
                    eligibilityEndDate.setDate(eligibilityEndDate.getDate() + 7);
                    const now = new Date('2025-08-30T12:57:00+07:00'); // Current date and time
                    if (eligibilityEndDate > now) {
                        setDiscountEndDate(eligibilityEndDate);
                    } else {
                        setIsEligibleForDiscount(false);
                    }
                }
            } catch (err: unknown) {
                let errorMessage = 'Không thể lấy dữ liệu';
                if (err instanceof Error) errorMessage = err.message;
                else if (typeof err === 'object' && err !== null && 'message' in err)
                    errorMessage = (err as { message: string }).message;
                setError(errorMessage);
                console.error('Fetch error:', errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [accessToken, getUserProfile, getUserTemplates, router, checkDiscountEligibility]);

    useEffect(() => {
        const templateIdFromQuery: string | null = searchParams.get('templateId');
        const feedbackFromQuery: string | null = searchParams.get('feedback');
        if (templateIdFromQuery && feedbackFromQuery === 'true') {
            setTemplateId(Number(templateIdFromQuery));
            setShowFeedback(true);
        }
    }, [searchParams]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (discountEndDate && isEligibleForDiscount) {
            const calculateTimeLeft = (): void => {
                const now = new Date('2025-08-30T12:57:00+07:00'); // Current date and time
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

                setTimeLeft(`${days}D, ${hours}H, ${minutes}M, ${seconds}S`);
            };

            calculateTimeLeft();
            timer = setInterval(calculateTimeLeft, 1000);

            return () => clearInterval(timer);
        }
    }, [discountEndDate, isEligibleForDiscount]);

    const handleEdit = (): void => setIsEditing(true);
    const handleSave = async (): Promise<void> => {
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
    ): void => {
        setSelectedGuests({ guests, templateName, template_id, price, paymentAmount, paymentDate });
        setShowGuestsModal(true);
    };

    const handleCloseGuestsModal = (): void => {
        setShowGuestsModal(false);
        setSelectedGuests(null);
    };

    const handleShowQrPopup = async (): Promise<void> => {
        try {
            const qrList = await getUserQr();
            if (qrList.length > 0) {
                const convertedQrList: QrResponse[] = qrList.map((qr) => ({
                    ...qr,
                    createdAt: qr.createdAt instanceof Date ? qr.createdAt.toISOString() : qr.createdAt,
                }));
                setQrData(convertedQrList);
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

    const handleCloseQrPopup = (): void => {
        setShowQrPopup(false);
        setQrData(null);
    };

    const exportGuestLinks = (): void => {
        if (!selectedGuests || !selectedGuests.guests.length) {
            setError('Không có khách mời để xuất file.');
            return;
        }

        const baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || '';
        const links: string = selectedGuests.guests
            .map(
                (guest) =>
                    `${guest.full_name}: ${baseUrl}template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}/${guest.card_id}`
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
                                    <div className={styles.box_item}>
                                        <div className={styles.box_flex}>
                                            <h2>Ngày tạo</h2>
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
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setEditedFullName(e.target.value)
                                                    }
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
                                            <span>
                                                {' '}
                                                <strong>Email: </strong> {user.email || 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.box_item}>
                                        <div className={styles.box_flex}>
                                            <span>
                                                <strong>Ngày tạo:</strong>{' '}
                                                {user.created_at
                                                    ? new Date(user.created_at).toLocaleDateString('vi-VN', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                      })
                                                    : 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.isEligibleForDiscount}>
                                        <div className={styles.box_flex}>
                                            <h4>Ưu đãi khi lần đầu sử dụng: </h4>
                                            {isEligibleForDiscount && discountEndDate ? (
                                                <div className={styles.wrapper_countDown_discount}>
                                                    <span>{timeLeft}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p>Không có dữ liệu người dùng.</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.wrapper__right_template}>
                            <FontAwesomeIcon className={styles.icon_QR} icon={faQrcode} onClick={handleShowQrPopup} />
                            <h4>Mẫu template đã sử dụng</h4>
                            {isLoading ? (
                                <div className={styles.grid_template}>
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className={styles.template_item}>
                                            <div className={`${styles.skeleton} ${styles.skeleton_image}`}></div>
                                        </div>
                                    ))}
                                </div>
                            ) : uniqueTemplates.length === 0 ? (
                                <p>Chưa có template nào được sử dụng.</p>
                            ) : (
                                <div className={styles.grid_template}>
                                    {uniqueTemplates.map((template) => (
                                        <div key={template.card_id} className={styles.template_item}>
                                            <div className={styles.image}>
                                                <img
                                                    src={template.template.image_url}
                                                    alt={template.template.name}
                                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) =>
                                                        (e.currentTarget.src = '/placeholder.png')
                                                    }
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
                                ) : allTemplates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>Chưa có đơn hàng nào.</td>
                                    </tr>
                                ) : (
                                    [...allTemplates]
                                        .sort((a, b) => {
                                            const latestPaymentA =
                                                a.template.payments.length > 0
                                                    ? new Date(a.template.payments[0].payment_date).getTime()
                                                    : 0;
                                            const latestPaymentB =
                                                b.template.payments.length > 0
                                                    ? new Date(b.template.payments[0].payment_date).getTime()
                                                    : 0;
                                            return latestPaymentB - latestPaymentA; // Newest to oldest
                                        })
                                        .map((template) => (
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
                                        {selectedGuests.guests.map((guest) => {
                                            const link: string = `${
                                                process.env.NEXT_PUBLIC_BASE_URL || ''
                                            }/template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}/${guest.card_id}`;
                                            return (
                                                <tr key={guest.guest_id}>
                                                    <td data-label="Mô tả">
                                                        <a href={link}>Khách - {guest.full_name}</a>
                                                    </td>
                                                    <td data-label="Link Mời">
                                                        {guest.card_id ? (
                                                            <FontAwesomeIcon
                                                                icon={faCopy}
                                                                style={{ marginLeft: '3rem', cursor: 'pointer' }}
                                                                onClick={() => copyToClipboard(link)}
                                                            />
                                                        ) : (
                                                            <span style={{ color: '#ff9999' }}>
                                                                Link không khả dụng (thiếu card_id)
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
            <QRPopupCreated isOpen={showQrPopup} onClose={handleCloseQrPopup} qrData={qrData} banks={banks} />
            {showFeedback && templateId && user && <UserFeedback templateId={templateId} />}
        </div>
    );
}

export default AccountInfo;
