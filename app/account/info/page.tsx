'use client';
import React, { useEffect, useState } from 'react';
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

interface Template {
    name: string;
    price: string;
    createdDate: string;
    status: string;
}

function AccountInfo() {
    const { getUserProfile } = useApi();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedFullName, setEditedFullName] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        const sampleData: Template[] = [
            { name: 'Template 2A', price: '100.000 VNĐ', createdDate: '2025-05-09', status: 'Hoạt động' },
            { name: 'Template 2B', price: '150.000 VNĐ', createdDate: '2025-05-08', status: 'Tạm dừng' },
        ];
        setTemplates(sampleData);
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userData = await getUserProfile();
                console.log('data: ', userData);
                setUser(userData);
                setEditedFullName(userData.full_name);
                setError('');
            } catch (err: unknown) {
                let errorMessage = 'Không thể lấy thông tin người dùng';
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (typeof err === 'object' && err !== null && 'message' in err) {
                    errorMessage = (err as { message: string }).message;
                }
                setError(errorMessage);
            }
        };

        fetchUserProfile();
    }, [getUserProfile]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        // TODO: Gọi API để cập nhật thông tin người dùng (nếu backend hỗ trợ)
        setIsEditing(false);
        setUser((prev) => (prev ? { ...prev, full_name: editedFullName } : prev));
    };

    return (
        <div className={styles.account_info}>
            <div className={styles.header_infoAccount}>
                <div className={styles.wrapper_left}>
                    <div className={styles.account_info__wrapper}>
                        <h3>Thông tin của bạn</h3>

                        {error ? (
                            <p className={styles.error}>Lỗi: {error}</p>
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

                    <div className={styles.list_invitions}>
                        <h4>Danh sách khách mời</h4>

                        <div className={styles.list_item}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Tên template</th>
                                        <th>Giá</th>
                                        <th>Ngày tạo</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map((template, index) => (
                                        <tr key={index}>
                                            <td>{template.name}</td>
                                            <td>{template.price}</td>
                                            <td>{template.createdDate}</td>
                                            <td>{template.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper__right_template}>
                    <h4>Mẫu template</h4>

                    <div className={styles.grid_template}>
                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>

                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>

                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>

                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>

                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>

                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>

                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>

                        <div className={styles.template_item}>
                            <div className={styles.image}>
                                <img src="/images/m2/m2.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountInfo;
