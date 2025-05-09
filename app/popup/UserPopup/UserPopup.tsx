'use client';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './UserPopup.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

interface UserPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

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

const UserPopup: React.FC<UserPopupProps> = ({ isOpen, onClose, onLogout }) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const { getUserProfile } = useApi();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (isOpen) {
                try {
                    const userData = await getUserProfile();
                    console.log('data: ', userData);
                    setUser(userData);
                    setError('');
                } catch (err: unknown) {
                    // Kiểm tra kiểu an toàn trước khi truy cập err.message
                    let errorMessage = 'Không thể lấy thông tin người dùng';
                    if (err instanceof Error) {
                        errorMessage = err.message;
                    } else if (typeof err === 'object' && err !== null && 'message' in err) {
                        errorMessage = (err as { message: string }).message;
                    }
                    setError(errorMessage);
                }
            }
        };

        fetchUserProfile();
    }, [isOpen, getUserProfile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAccountInfo = () => {
        router.push('/account/info');
    };

    return (
        <div ref={popupRef} className={cx('user-popup', { 'popup-open': isOpen })}>
            {error ? (
                <p className={cx('error')}>{error}</p>
            ) : user ? (
                <div className={cx('user-info')} onClick={handleAccountInfo}>
                    <h3>
                        {user.user_id}_{user.full_name}
                    </h3>
                    <p>{user.email}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <div className={styles.control}>
                <a href="">Template đã chọn</a>
                <a href="">Lịch sử thanh toán</a>
                <a href="">Danh sách mời</a>
            </div>
            <button className={cx('logout-btn')} onClick={onLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
        </div>
    );
};

export default UserPopup;
