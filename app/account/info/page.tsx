// app/components/account_info.tsx
'use client';
import React, { useState, useEffect } from 'react';
import styles from './account_info.module.css';
import { useApi } from 'app/lib/apiContext/apiContext';

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
    sharedLinks: {
        link_id: number;
        guest_id: number;
        share_url: string;
        created_at: string;
        expires_at: string;
    }[];
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

function AccountInfo() {
    const { getUserProfile, getUserTemplates } = useApi();
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
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [userData, templateData] = await Promise.all([getUserProfile(), getUserTemplates()]);

                // Handle user profile
                setUser(userData);
                setEditedFullName(userData.full_name);
                setError('');

                // Handle templates
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
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (typeof err === 'object' && err !== null && 'message' in err) {
                    errorMessage = (err as { message: string }).message;
                }
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [getUserProfile, getUserTemplates]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        // TODO: Gọi API để cập nhật thông tin người dùng (nếu backend hỗ trợ)
        setIsEditing(false);
        setUser((prev) => (prev ? { ...prev, full_name: editedFullName } : prev));
    };

    const handleShowGuests = (guests: Guest[], templateName: string, template_id: number) => {
        setSelectedGuests({ guests, templateName, template_id });
        setShowGuestsModal(true);
    };

    const handleCloseModal = () => {
        setShowGuestsModal(false);
        setSelectedGuests(null);
    };

    return (
        <div className={styles.account_info}>
            <div className={styles.header_infoAccount}>
                <div className={styles.wrapper_left}>
                    <div className={styles.account_info__wrapper}>
                        <h3>Thông tin của bạn</h3>

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
                                    <div className={styles.right}></div>
                                </div>
                            </div>
                        ) : user ? (
                            <>
                                <div className={styles.box_item}>
                                    <div className={styles.box_flex}>
                                        <h2>Họ và tên</h2>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedFullName}
                                                onChange={(e) => setEditedFullName(e.target.value)}
                                                className={styles.input}
                                            />
                                        ) : (
                                            <span>{user.full_name || 'Chưa cập nhật'}</span>
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
                                        <h2>Địa chỉ Email</h2>
                                        <span>{user.email || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className={styles.right}></div>
                                </div>
                            </>
                        ) : (
                            <p>Đang tải...</p>
                        )}
                    </div>
                </div>

                <div className={styles.wrapper__right_template}>
                    <h4>Mẫu template đã sử dụng</h4>

                    {isLoading ? (
                        <div className={styles.grid_template}>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className={styles.template_item}>
                                    <div className={`${styles.skeleton} ${styles.skeleton_image}`}></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.grid_template}>
                            {templates.map((template) => (
                                <div key={template.card_id} className={styles.template_item}>
                                    <div className={styles.image}>
                                        <img
                                            src={`data:image/png;base64,${template.template.image_url}`}
                                            alt={template.template.name}
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder.png';
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                <th>Danh sách link mời</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 3 }).map((_, rowIndex) => (
                                      <tr key={rowIndex}>
                                          {Array.from({ length: 6 }).map((_, cellIndex) => (
                                              <td key={cellIndex}>
                                                  <div className={`${styles.skeleton} ${styles.skeleton_cell}`}></div>
                                              </td>
                                          ))}
                                      </tr>
                                  ))
                                : templates.map((template) => (
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
                                              {template.template.payments[0]?.status === 'completed'
                                                  ? 'Hoàn tất'
                                                  : template.template.payments[0]?.status || 'Chưa thanh toán'}
                                          </td>
                                          <td data-label="Danh sách link mời">
                                              <button
                                                  style={{
                                                      padding: '1rem',
                                                      background: '#007bff',
                                                      color: '#fff',
                                                      borderRadius: '.5rem',
                                                  }}
                                                  onClick={() =>
                                                      handleShowGuests(
                                                          template.template.guests,
                                                          template.template.name,
                                                          template.template.template_id
                                                      )
                                                  }
                                              >
                                                  Danh sách
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showGuestsModal && selectedGuests && (
                <div className={styles.modal}>
                    <div className={styles.modal_content}>
                        <h3>Danh sách khách mời</h3>
                        <table className={styles.guest_table}>
                            <thead>
                                <tr>
                                    <th>Template</th>
                                    <th>Tên khách mời</th>
                                    <th>Link chia sẻ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedGuests.guests.map((guest) =>
                                    guest.sharedLinks.map((link) => {
                                        const newShareUrl = `/template/${selectedGuests.template_id}/${guest.guest_id}/${guest.invitation_id}`;
                                        return (
                                            <tr key={link.link_id}>
                                                <td>{selectedGuests.templateName}</td>
                                                <td>{guest.full_name}</td>
                                                <td>
                                                    <a
                                                        style={{ color: '#007bff' }}
                                                        href={newShareUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Link chia sẻ
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        <button className={styles.close_button} onClick={handleCloseModal}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountInfo;
