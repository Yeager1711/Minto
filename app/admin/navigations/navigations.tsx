'use client';

import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCog, faCommentDots, faEdit, faPlus, faHome } from '@fortawesome/free-solid-svg-icons';

import styles from './navigations.module.scss';

interface NavigationProps {
    onNavChange: (section: string) => void;
    onAddProduct: (position: DOMRect) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onNavChange, onAddProduct }) => {
    const addButtonRef = React.useRef<HTMLButtonElement>(null);
    const [activeSection, setActiveSection] = React.useState<string>('main'); // Mặc định là 'main'

    const handleAddProductClick = () => {
        if (addButtonRef.current) {
            onAddProduct(addButtonRef.current.getBoundingClientRect());
        }
    };

    const handleNavChange = (section: string) => {
        setActiveSection(section);
        onNavChange(section);
    };

    return (
        <div className={styles.navigations}>
            <button
                title="Trang chủ"
                onClick={() => handleNavChange('main')}
                className={activeSection === 'main' ? styles.active : ''}
            >
                <FontAwesomeIcon icon={faHome} />
                <p>Trang chủ</p>
            </button>
            <button
                title="Quản lý tài khoản"
                onClick={() => handleNavChange('account')}
                className={activeSection === 'account' ? styles.active : ''}
            >
                <FontAwesomeIcon icon={faUserCog} />
                <p>Tài khoản</p>
            </button>
            <div className={styles.addWrapper}>
                <button
                    ref={addButtonRef}
                    title="Thêm sản phẩm"
                    onClick={handleAddProductClick}
                    className={styles.addButton}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>
            <button
                title="Phản hồi"
                onClick={() => handleNavChange('feedback')}
                className={activeSection === 'feedback' ? styles.active : ''}
            >
                <FontAwesomeIcon icon={faCommentDots} />
                <p>Phản hồi</p>
            </button>
            <button
                title="Chỉnh sửa"
                onClick={() => handleNavChange('edit')}
                className={activeSection === 'edit' ? styles.active : ''}
            >
                <FontAwesomeIcon icon={faEdit} />
                <p>Chỉnh sửa</p>
            </button>
        </div>
    );
};

export default Navigation;
