'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faBars } from '@fortawesome/free-solid-svg-icons';
import { HiOutlineXMark } from 'react-icons/hi2';
import styles from './header.module.scss';

const cx = classNames.bind(styles);

function Header() {
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
    const handleRegisterClick = () => setIsRegisterModalOpen(true);
    const handleCloseModal = () => setIsRegisterModalOpen(false);
    const handleLoginClick = () => setIsLoginModalOpen(true);
    const handleCloseLoginModal = () => setIsLoginModalOpen(false);
    // const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <header className={cx('header_wrapper')}>
                <a href="/" className={cx('logo')}>
                    <img src="/logo/logo_website.png" alt="Logo" />
                </a>

                <nav className={cx('navbar', { open: isMenuOpen })}>
                    <Link href="/" className={cx('nav-link', { active: pathname === '/' })}>
                        Trang chủ
                    </Link>
                    <Link href="/jobs" className={cx('nav-link', { active: pathname === '/jobs' })}>
                        Việc làm
                    </Link>
                    <Link href="/companies" className={cx('nav-link', { active: pathname === '/companies' })}>
                        Công ty
                    </Link>
                </nav>

                <div className={cx('button-control')}>
                    <button className={cx('btn-login')} onClick={handleLoginClick}>
                        Đăng nhập
                    </button>
                    <button className={cx('btn-register')} onClick={handleRegisterClick}>
                        Đăng ký
                    </button>

                    <div className={cx('employer')}>
                        <span className={cx('header-question-employer')}>Bạn là nhà tuyển dụng?</span>
                        <Link href="/companies" className={cx('Apply-Now')}>
                            Đăng tuyển ngay
                            <FontAwesomeIcon icon={faChevronRight} />
                            <FontAwesomeIcon icon={faChevronRight} />
                        </Link>
                    </div>
                </div>

                <div className={cx('menu-icon')} onClick={toggleDrawer}>
                    <FontAwesomeIcon icon={faBars} />
                </div>
            </header>

            {/* Side Drawer */}
            <div className={cx('side-drawer', { open: isDrawerOpen })}>
                <div className={cx('side-drawer-header')}>
                    <HiOutlineXMark className={cx('close-icon')} onClick={toggleDrawer} />
                </div>
                <div className={cx('side-drawer-content')}>
                    {/* Auth Buttons */}
                    <div className={cx('auth-buttons')}>
                        <button className={cx('btn-login')}>Đăng nhập</button>
                        <button className={cx('btn-register')}>Đăng ký</button>
                    </div>

                    {/* Navigation Links */}
                    <div className={cx('nav-links')}>
                        <Link href="/" className={cx({ active: pathname === '/' })}>
                            Trang chủ
                        </Link>
                        <Link href="/jobs" className={cx({ active: pathname === '/jobs' })}>
                            Việc làm
                        </Link>
                        <Link href="/companies" className={cx({ active: pathname === '/companies' })}>
                            Công ty
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;
