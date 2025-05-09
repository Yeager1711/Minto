'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './login.module.scss';
import { useApi } from '../../lib/apiContext/apiContext'; // Import useApi

interface LoginPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenRegister: () => void;
    onLoginSuccess: (token: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onOpenRegister, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const wasOpenedRef = useRef(false);
    const { login } = useApi(); // Use the login method from context

    useEffect(() => {
        if (isOpen) {
            wasOpenedRef.current = true;
            setIsAnimatingOut(false);
            setEmail('');
            setPassword('');
            setError('');
        } else if (wasOpenedRef.current && !isAnimatingOut) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setIsAnimatingOut(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isAnimatingOut]); // Thêm isAnimatingOut vào mảng phụ thuộc

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Vui lòng điền đầy đủ tất cả các trường');
            console.log(`Đăng nhập thất bại với email: ${email}`);
            return;
        }
        setError('');
        try {
            const response = await login({ email, password });
            console.log(`Đăng nhập thành công với email: ${email}`);
            onLoginSuccess(response.accessToken);
            onClose();
        } catch (err: unknown) {
            // Kiểm tra kiểu an toàn
            const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
            setError(errorMessage);
            console.log(`Đăng nhập thất bại với email: ${email}`);
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
