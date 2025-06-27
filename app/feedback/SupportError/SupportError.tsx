'use client';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset } from '@fortawesome/free-solid-svg-icons';
import styles from './SupportError.module.css';
import { useApi } from 'app/lib/apiContext/apiContext';
import { toast } from 'react-toastify';

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

interface SupportErrorProps {
    isSupportOpen: boolean;
    toggleSupportPopup: () => void;
}

const SupportError: React.FC<SupportErrorProps> = ({ isSupportOpen, toggleSupportPopup }) => {
    const { getUserProfile, submitPostError } = useApi();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<string>('');
    const [otherIssue, setOtherIssue] = useState<string>('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setUserProfile(null);
                return;
            }
            try {
                const userProfileData = await getUserProfile();
                setUserProfile(userProfileData);
            } catch {
                toast.error('Không thể tải hồ sơ người dùng');
            }
        };
        fetchUserProfile();
    }, [getUserProfile]);

    const handleIssueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedIssue(e.target.value);
    };

    const handleOtherIssueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOtherIssue(e.target.value);
    };

    const handleSubmit = async () => {
        const errorMessage = selectedIssue === 'other' ? otherIssue : selectedIssue;
        if (!errorMessage) {
            toast.error('Vui lòng chọn hoặc nhập vấn đề');
            return;
        }

        try {
            const response = await submitPostError(errorMessage);
            toast.success(response.message || 'Phản hồi đã được gửi thành công');
            setSelectedIssue('');
            setOtherIssue('');
            toggleSupportPopup();
        } catch {
            toast.error('Không thể gửi phản hồi. Vui lòng thử lại.');
        }
    };

    return (
        <>
            <div className={styles.support} onClick={toggleSupportPopup}>
                <FontAwesomeIcon icon={faHeadset} />
            </div>

            <div className={`${styles.wrapper_support} ${isSupportOpen ? styles.active : ''}`}>
                <div className={styles.box}>
                    <label htmlFor="user_id">Mã khách hàng</label>
                    <input type="text" id="user_id" value={userProfile?.user_id || ''} disabled />
                </div>

                <div className={styles.box}>
                    <label htmlFor="full_name">Tên khách hàng</label>
                    <input type="text" id="full_name" value={userProfile?.full_name || ''} disabled />
                </div>

                <div className={styles.box}>
                    <label htmlFor="phone">Số điện thoại</label>
                    <input type="text" id="phone" value={userProfile?.phone ?? 'Chưa cập nhật'} disabled />
                </div>

                <div className={styles.box}>
                    <select name="issue" id="issue" value={selectedIssue} onChange={handleIssueChange}>
                        <option value="">Chọn vấn đề</option>
                        <option value="Lỗi đơn hàng thanh toán trạng thái chưa hoàn thành">
                            Lỗi đơn hàng thanh toán trạng thái chưa hoàn thành
                        </option>
                        <option value="Lỗi khi thêm thông tin">Lỗi khi thêm thông tin</option>
                        <option value="Lỗi hệ thống khi thêm ảnh">Lỗi hệ thống khi thêm ảnh</option>
                        <option value="Lỗi link mời không hiển thị với khách mời">Lỗi link mời không hiển thị với khách mời</option>
                        <option value="other">Khác</option>
                    </select>
                </div>

                {selectedIssue === 'other' && (
                    <div className={styles.box}>
                        <label htmlFor="other_issue">Mô tả vấn đề</label>
                        <textarea
                            id="other_issue"
                            value={otherIssue}
                            onChange={handleOtherIssueChange}
                            placeholder="Vui lòng mô tả chi tiết vấn đề của bạn"
                            className={styles.textarea}
                        />
                    </div>
                )}

                <div className={styles.submit_button} onClick={handleSubmit}>
                    Gửi yêu cầu
                </div>
            </div>
        </>
    );
};

export default SupportError;
