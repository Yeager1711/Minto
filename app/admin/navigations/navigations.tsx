'use client';

import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCog,
    faMoneyBillWave,
    faCommentDots,
    faEdit,
    faPlus,
    faHome,
} from '@fortawesome/free-solid-svg-icons';
import styles from './navigations.module.css';

interface NavigationProps {
    onNavChange: (section: string) => void;
    onAddProduct: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onNavChange, onAddProduct }) => {
    return (
        <div className={styles.navigations}>
            <button title="Trang chủ" onClick={() => onNavChange('main')}>
                <FontAwesomeIcon icon={faHome} />
            </button>
            <button title="Quản lý tài khoản" onClick={() => onNavChange('account')}>
                <FontAwesomeIcon icon={faUserCog} />
            </button>
            <button title="Quản lý doanh thu" onClick={() => onNavChange('revenue')}>
                <FontAwesomeIcon icon={faMoneyBillWave} />
            </button>
            <button title="Quản lý phản hồi" onClick={() => onNavChange('feedback')}>
                <FontAwesomeIcon icon={faCommentDots} />
            </button>
            <button title="Chỉnh sửa thông tin" onClick={() => onNavChange('edit')}>
                <FontAwesomeIcon icon={faEdit} />
            </button>
            <button title="Thêm sản phẩm" onClick={onAddProduct}>
                <FontAwesomeIcon icon={faPlus} />
            </button>
        </div>
    );
};

export default Navigation;
