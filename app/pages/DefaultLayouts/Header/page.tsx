'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { HiOutlineXMark } from 'react-icons/hi2';
import styles from './header.module.scss';
import { useApi } from '../../../lib/apiConentext/ApiContext';

const cx = classNames.bind(styles);

function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { accessToken, emailHr, logout } = useApi();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
    const handleRegisterClick = () => {
        setIsRegisterModalOpen(true);
        setIsDrawerOpen(false);
    };
    const handleCloseRegisterModal = () => setIsRegisterModalOpen(false);

    const handleLoginClick = () => {
        router.push('/v2/login');
    };

    return (
        <>
            <header className={cx('header_wrapper')} data-aos="slide-down" data-aos-duration="800" data-aos-delay="0">
                <section className={styles.wrapper}>
                    <Link href="/" className={cx('logo')}>
                        <img src="/logo/logo_website.png" alt="VietnamWorks Logo" />
                    </Link>

                    <nav className={cx('navbar')}>
                        <Link href="/" className={cx('nav-link', { active: pathname === '/' })}>
                            Giới thiệu
                        </Link>
                        <Link href="/jobs" className={cx('nav-link', { active: pathname === '/jobs' })}>
                            Dịch vụ
                        </Link>
                        <Link
                            href="/service_price_list"
                            className={cx('nav-link', { active: pathname === '/service_price_list' })}
                        >
                            Báo giá
                        </Link>
                        <Link href="/support" className={cx('nav-link', { active: pathname === '/support' })}>
                            Hỗ trợ
                        </Link>
                    </nav>

                    <div className={cx('button-control')}>
                        {accessToken && emailHr ? (
                            <div className={cx('user-info')}>
                                <span onClick={() => router.push('/auth/dashboard')}>
                                    HR: <p>{emailHr}</p>
                                </span>
                                <button className={cx('btn-logout')} onClick={logout}>
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <button className={cx('btn-login')} onClick={handleLoginClick}>
                                Đăng nhập
                            </button>
                        )}
                        <button className={cx('btn-post')} onClick={handleRegisterClick}>
                            Đăng tin
                        </button>
                    </div>

                    <button className={cx('menu-icon')} onClick={toggleDrawer} aria-label="Toggle navigation menu">
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </section>
            </header>

            {/* Side Drawer */}
            <div
                className={cx('side-drawer', { open: isDrawerOpen })}
                data-aos="slide-down"
                data-aos-duration="800"
                data-aos-delay="0"
            >
                <div className={cx('side-drawer-header')}>
                    <button className={cx('close-icon')} onClick={toggleDrawer} aria-label="Close navigation drawer">
                        <HiOutlineXMark />
                    </button>
                </div>
                <div className={cx('side-drawer-content')}>
                    <div className={cx('auth-buttons')}>
                        {accessToken && emailHr ? (
                            <div className={cx('user-info')}>
                                <span>{emailHr}</span>
                                <button className={cx('btn-logout')} onClick={logout}>
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <button
                                className={cx('btn-login')}
                                onClick={() => {
                                    router.push('/v2/login');
                                    setIsDrawerOpen(false);
                                }}
                            >
                                Đăng nhập
                            </button>
                        )}
                        <button className={cx('btn-register')} onClick={handleRegisterClick}>
                            Đăng tin
                        </button>
                    </div>

                    <div className={cx('nav-links')}>
                        <Link href="/" className={cx({ active: pathname === '/' })} onClick={toggleDrawer}>
                            Giới thiệu
                        </Link>
                        <Link href="/jobs" className={cx({ active: pathname === '/jobs' })} onClick={toggleDrawer}>
                            Dịch vụ
                        </Link>
                        <Link
                            href="/companies"
                            className={cx({ active: pathname === '/companies' })}
                            onClick={toggleDrawer}
                        >
                            Báo giá
                        </Link>
                        <Link
                            href="/support"
                            className={cx({ active: pathname === '/support' })}
                            onClick={toggleDrawer}
                        >
                            Hỗ trợ
                        </Link>
                    </div>
                </div>
            </div>

            {isDrawerOpen && <div className={cx('drawer-overlay')} onClick={toggleDrawer}></div>}

            
        </>
    );
}

export default Header;
