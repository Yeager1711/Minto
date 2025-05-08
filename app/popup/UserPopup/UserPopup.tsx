'use client';
import React, { useEffect, useRef } from 'react'; // Removed useState
import classNames from 'classnames/bind';
import styles from './UserPopup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

interface UserPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const UserPopup: React.FC<UserPopupProps> = ({ isOpen, onClose, onLogout }) => {
    const popupRef = useRef<HTMLDivElement>(null);

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

    return (
        <div ref={popupRef} className={cx('user-popup', { 'popup-open': isOpen })}>
            <div className={cx('user-info')}>
                <h3>4567_Huỳnh Nam</h3>
                <p>namhp1711@gmail.com</p>
            </div>
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
