'use client';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './settings_layout.module.scss';

export default function SettingsLayout() {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-in-out',
        });

        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }, []);

    return (
        <div className={styles.settingsLayout}>
            <div className={styles.settingsLayout__sidebar}>
                <a href="/account/setting/company">
                    <span className={styles.settingsLayout__sidebar__icon}>🏢</span>
                    Công ty
                </a>

                <a href="/account/setting/HR_info">
                    <span className={styles.settingsLayout__sidebar__icon}>📋</span>
                    Thông tin cá nhân
                </a>

                <a href="/account/setting/change_password">
                    <span className={styles.settingsLayout__sidebar__icon}>🔒</span>
                    Đổi mật khẩu
                </a>

                <a href="/account/setting/company_info">
                    <span className={styles.settingsLayout__sidebar__icon}>🏢</span>
                    Thông tin công ty
                </a>

                <a href="/account/setting/gpdn">
                    <span className={styles.settingsLayout__sidebar__icon}>✅</span>
                    Xác thực thông tin
                </a>
            </div>
        </div>
    );
}
