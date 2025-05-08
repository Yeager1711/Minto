'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames/bind';
import styles from './header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import LoginPopup from '../../../v2/login/Login';
import SignUpPopup from '../../../v2/signup/SignUp';

const cx = classNames.bind(styles);

const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Hướng dẫn', path: '/instruct' },
];

function Header() {
    const pathname = usePathname();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isNavBoxOpen, setIsNavBoxOpen] = useState(false);

    const handleOpenRegister = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };

    const toggleNavBox = () => {
        setIsNavBoxOpen(!isNavBoxOpen);
    };

    const handleOpenLogin = () => {
        setIsLoginOpen(true); // Đảm bảo luôn mở popup
    };

    const displayedNavItem = pathname === '/' ? navItems[1] : navItems[0];

    return (
        <aside className={cx('sidebar', { 'display-none': pathname.includes('/template') })}>
            <div className={styles.margin}>
                <div className={cx('logo', { 'logo-hidden': isNavBoxOpen })}>
                    <p>⚡</p> Minto
                </div>
                <div className={cx('nav-container')}>
                    <div className={cx('user-container')}>
                        <div className={cx('chevron_expend', { 'chevron_expend-open': isNavBoxOpen })}>
                            <div className={cx('chevron', { 'chevron-open': isNavBoxOpen })} onClick={toggleNavBox}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </div>
                            <ul className={cx('nav', { 'nav-open': isNavBoxOpen })}>
                                {navItems.map((item) => (
                                    <li
                                        key={item.name}
                                        className={cx({
                                            active: pathname === item.path,
                                            'nav-hidden': item.path !== displayedNavItem.path,
                                        })}
                                    >
                                        <Link href={item.path}>{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={cx('user')} onClick={handleOpenLogin}>
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                    </div>
                </div>
            </div>
            <LoginPopup
                key={`login-popup-${isLoginOpen}`} // Thêm key để buộc re-mount
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onOpenRegister={handleOpenRegister}
            />
            <SignUpPopup
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSubmit={(data) => console.log('Register data:', data)}
            />
        </aside>
    );
}

export default Header;
