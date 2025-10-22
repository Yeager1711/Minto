'use client';
import React, { useState, useEffect } from 'react';
import styles from './SupportError.module.css';
import { useApi } from 'app/lib/apiContext/apiContext';
import DynamicIsland from 'app/pages/Dynamic_Island/DynamicIsLand';

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

interface DynamicPayload {
    state: 'minimal' | 'compact' | 'expanded';
    TypeContextCollapsed?: boolean;
    action: 'success' | 'failure';
    actionTitle?: string;
    describe?: string; // Fixed typo from describle
    time?: string;
    type?: string;
    duration?: number;
    [key: string]: unknown;
}

const SupportError: React.FC<SupportErrorProps> = ({ isSupportOpen, toggleSupportPopup }) => {
    const { getUserProfile, submitPostError, updateDynamic } = useApi();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<string>('');
    const [otherIssue, setOtherIssue] = useState<string>('');
    const [isOpenDynamic, setIsOpenDynamic] = useState(false);
    const [payload, setPayload] = useState<DynamicPayload | null>(null);
    const [closeTimeoutId, setCloseTimeoutId] = useState<number | null>(null);

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
                const errorPayload: DynamicPayload = {
                    state: 'compact',
                    TypeContextCollapsed: true,
                    action: 'failure',
                    actionTitle: 'Tải hồ sơ thất bại',
                    describe: 'Không thể tải thông tin hồ sơ người dùng. Vui lòng đăng nhập lại.', // Fixed typo
                    time: new Date().toISOString(),
                    type: 'error',
                    duration: 3500,
                };
                try {
                    const response = await updateDynamic(errorPayload);
                    toggleSidebar(response.TypeContextCollapsed ?? true);
                    setPayload(response);
                    setIsOpenDynamic(true);
                    scheduleAutoClose(response);
                } catch (updateError) {
                    console.error('Lỗi khi cập nhật dynamic:', updateError, { payload: errorPayload });
                }
            }
        };
        fetchUserProfile();

        return () => {
            if (closeTimeoutId) {
                clearTimeout(closeTimeoutId);
            }
        };
    }, [getUserProfile, updateDynamic]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleSidebar = (collapsed: boolean) => {
        const event = new CustomEvent('toggleSidebar', { detail: { collapsed } });
        window.dispatchEvent(event);
    };

    const scheduleAutoClose = (data: DynamicPayload) => {
        if (closeTimeoutId) {
            clearTimeout(closeTimeoutId);
            setCloseTimeoutId(null);
        }
        const duration = data.duration ?? 3500;
        const id = window.setTimeout(() => {
            setIsOpenDynamic(false);
            setPayload(null);
            toggleSidebar(false);
            toggleSupportPopup();
            setCloseTimeoutId(null);
        }, duration);
        setCloseTimeoutId(id);
    };

    const handleIssueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedIssue(e.target.value);
    };

    const handleOtherIssueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOtherIssue(e.target.value);
    };

    const handleSubmit = async () => {
        const errorMessage = selectedIssue === 'other' ? otherIssue : selectedIssue;
        if (!errorMessage) {
            const errorPayload: DynamicPayload = {
                state: 'compact',
                TypeContextCollapsed: true,
                action: 'failure',
                actionTitle: 'Gửi phản hồi thất bại',
                describe: 'Chưa chọn vấn đề cần mô tả.', // Fixed typo
                time: new Date().toISOString(),
                type: 'error',
                duration: 3500,
            };
            try {
                const response = await updateDynamic(errorPayload);
                toggleSidebar(response.TypeContextCollapsed ?? true);
                setPayload(response);
                setIsOpenDynamic(true);
                scheduleAutoClose(response);
            } catch (updateError) {
                console.error('Lỗi khi cập nhật dynamic:', updateError, { payload: errorPayload });
            }
            return;
        }

        try {
            await submitPostError(errorMessage);

            const successPayload: DynamicPayload = {
                state: 'compact',
                TypeContextCollapsed: true,
                action: 'success',
                actionTitle: 'Gửi phản hồi thành công',
                describe: 'Phản hồi của bạn đã được gửi thành công! Chúng tôi sẽ xem xét sớm.', // Fixed typo
                time: new Date().toISOString(),
                type: 'success',
                duration: 3500,
            };

            const response = await updateDynamic(successPayload);
            console.log('Dynamic response:', response);

            toggleSidebar(response.TypeContextCollapsed ?? true);
            setPayload(response);
            setIsOpenDynamic(true);

            setSelectedIssue('');
            setOtherIssue('');

            scheduleAutoClose(response);
        } catch {
            const errorPayload: DynamicPayload = {
                state: 'compact',
                TypeContextCollapsed: true,
                action: 'failure',
                actionTitle: 'Gửi phản hồi thất bại',
                describe: 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.', // Fixed typo
                time: new Date().toISOString(),
                type: 'error',
                duration: 3500,
            };
            try {
                const response = await updateDynamic(errorPayload);
                console.log('Dynamic response:', response);
                toggleSidebar(response.TypeContextCollapsed ?? true);
                setPayload(response);
                setIsOpenDynamic(true);
                scheduleAutoClose(response);
            } catch (updateError) {
                console.error('Lỗi khi cập nhật dynamic:', updateError, { payload: errorPayload });
            }
        }
    };

    const handleCloseDynamic = () => {
        setIsOpenDynamic(false);
        setPayload(null);
        toggleSidebar(false);
        if (closeTimeoutId) {
            clearTimeout(closeTimeoutId);
            setCloseTimeoutId(null);
        }
    };

    return (
        <>
            <DynamicIsland
                isOpenDynamic={isOpenDynamic}
                onCloseDynamic={handleCloseDynamic}
                payload={
                    payload || {
                        state: 'compact',
                        action: 'success',
                        actionTitle: 'Thông báo mặc định',
                        describe: 'Không có thông báo.', // Fixed typo
                    }
                }
            />

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
                        <option value="Lỗi link mời không hiển thị với khách mời">
                            Lỗi link mời không hiển thị với khách mời
                        </option>
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
