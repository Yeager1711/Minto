'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames/bind';
import styles from './header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import LoginPopup from '../../../v2/login/Login';
import SignUpPopup from '../../../v2/signup/SignUp';
import UserPopup from '../../../popup/UserPopup/UserPopup';

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
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    const isInitialLogin = useRef(true); // Ref để theo dõi lần đăng nhập đầu tiên

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || '';
        setAccessToken(token);
    }, []);

    // Đồng bộ isUserPopupOpen khi accessToken thay đổi sau đăng nhập
    useEffect(() => {
        if (accessToken && isInitialLogin.current && !isUserPopupOpen && !isLoginOpen) {
            console.log('Access token updated after login, preparing user_2:', accessToken);
            isInitialLogin.current = false; // Đặt lại ref sau lần đầu
            // Không tự động mở UserPopup, để user_2 xử lý
        }
    }, [accessToken, isUserPopupOpen, isLoginOpen]);

    const handleOpenRegister = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };

    const handleOpenLoginFromRegister = () => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
    };

    const toggleNavBox = () => {
        setIsNavBoxOpen(!isNavBoxOpen);
    };

    const handleOpenLogin = () => {
        setIsLoginOpen(true);
    };

    const handleOpenUserPopup = () => {
        console.log('Opening UserPopup, isUserPopupOpen:', isUserPopupOpen, 'accessToken:', accessToken); // Debug
        if (accessToken) {
            setIsUserPopupOpen(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setAccessToken('');
        setIsUserPopupOpen(false);
    };

    const handleCloseLogin = useCallback(() => {
        setIsLoginOpen(false);
    }, []);

    const displayedNavItem = pathname === '/' ? navItems[1] : navItems[0];

    // Xử lý đăng nhập thành công ngay lập tức
    const handleLoginSuccess = (token: string) => {
        console.log('Login success, token:', token); // Debug
        localStorage.setItem('accessToken', token);
        setAccessToken(token); // Cập nhật accessToken
        setIsLoginOpen(false); // Đóng LoginPopup
        isInitialLogin.current = true; // Đặt lại ref để theo dõi lần đăng nhập
        // Không mở UserPopup tự động, để user_2 xử lý
    };

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
                        {/* Chỉ hiển thị user_1 khi chưa đăng nhập */}
                        {!accessToken && (
                            <div className={cx('user_1')} onClick={handleOpenLogin}>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                        )}
                        {/* Chỉ hiển thị user_2 khi đã đăng nhập */}
                        {accessToken && (
                            <div className={cx('user_2')} onClick={handleOpenUserPopup}>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                        )}
                        {/* Chỉ hiển thị UserPopup khi isUserPopupOpen là true */}
                        {accessToken && isUserPopupOpen && (
                            <UserPopup
                                isOpen={isUserPopupOpen}
                                onClose={() => setIsUserPopupOpen(false)}
                                onLogout={handleLogout}
                            />
                        )}
                    </div>
                </div>
            </div>
            <LoginPopup
                isOpen={isLoginOpen}
                onClose={handleCloseLogin}
                onOpenRegister={handleOpenRegister}
                onLoginSuccess={handleLoginSuccess}
            />
            <SignUpPopup
                isOpen={isRegisterOpen}
                onClose={handleOpenLoginFromRegister}
                onSubmit={(data) => console.log('Register data:', data)}
            />
        </aside>
    );
}

export default Header;
