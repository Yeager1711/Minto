'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './login.module.scss';

interface LoginPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenRegister: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onOpenRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const wasOpenedRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            wasOpenedRef.current = true;
            setIsAnimatingOut(false);
        } else if (wasOpenedRef.current && !isAnimatingOut) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setIsAnimatingOut(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isAnimatingOut]); // Added isAnimatingOut to dependency array

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            console.log(`Login failed with email: ${email}`);
            return;
        }
        setError('');
        try {
            const response = await axios.post(`${apiUrl}/auth/login`, {
                email,
                password,
            });
            if (response.status === 200) {
                localStorage.setItem('accessToken', response.data.accessToken);
                setError('');
                console.log(`Login successful with email: ${email}`);
                onClose();
            }
        } catch (err: unknown) {
            // Changed 'any' to 'unknown'
            const errorMessage =
                err instanceof Error && 'response' in err
                    ? (err as any).response?.data?.message // Type assertion for response
                    : 'Đăng nhập thất bại';
            setError(errorMessage);
            console.log(`Login failed with email: ${email}`);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen && !isAnimatingOut) return null;

    return (
        <div
            className={`${styles.loginPopupOverlay} ${isOpen && !isAnimatingOut ? styles.animateIn : ''}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`${styles.loginPopupContainer} ${isOpen && !isAnimatingOut ? styles.animateContainerIn : ''}`}
            >
                <h2 className={styles.loginPopupTitle}>Đăng nhập tài khoản</h2>
                {error && <p className={styles.loginPopupError}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.loginPopupField}>
                        <label className={styles.loginPopupLabel} htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.loginPopupInput}
                            required
                        />
                    </div>
                    <div className={styles.loginPopupField}>
                        <label className={styles.loginPopupLabel} htmlFor="password">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.loginPopupInput}
                            required
                        />
                    </div>

                    <p className={styles.registerLink}>
                        Nếu chưa có tài khoản,{' '}
                        <span onClick={onOpenRegister} className={styles.registerLinkText}>
                            Đăng ký
                        </span>
                    </p>

                    <div className={styles.loginPopupActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${styles.loginPopupButton} ${styles.loginPopupButtonCancel}`}
                        >
                            Thoát
                        </button>
                        <button type="submit" className={`${styles.loginPopupButton} ${styles.loginPopupButtonSubmit}`}>
                            Đăng nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPopup;
