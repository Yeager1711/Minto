'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames/bind';
import styles from './header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import LoginPopup from '../../../v2/login/page';
import SignUpPopup from '../../../v2/signup/page';

const cx = classNames.bind(styles);

const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Hướng dẫn', path: '/instruct' },
];

function Header() {
    const pathname = usePathname();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const handleOpenRegister = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };

    return (
        <aside className={cx('sidebar', { 'display-none': pathname.includes('/template') })}>
            <div className={styles.margin}>
                <div className={cx('logo')}>⚡ Minto</div>
                <ul className={cx('nav')}>
                    {navItems.map((item) => (
                        <li key={item.name} className={cx({ active: pathname === item.path })}>
                            <Link href={item.path}>{item.name}</Link>
                        </li>
                    ))}
                    <div className={styles.user} onClick={() => setIsLoginOpen(true)}>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                </ul>
            </div>
            <LoginPopup
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
