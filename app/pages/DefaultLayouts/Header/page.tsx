'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames/bind';
import styles from './header.module.scss';

const cx = classNames.bind(styles);

const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Instruct', path: '/instruct' },
    
];

function Header() {
    const pathname = usePathname();

    return (
        <aside className={cx('sidebar')}>
            <div className={styles.margin}>
                <div className={cx('logo')}>⚡ Minto</div>
                <ul className={cx('nav')}>
                    {navItems.map((item) => (
                        <li key={item.name} className={cx({ active: pathname === item.path })}>
                            <Link href={item.path}>{item.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export default Header;
