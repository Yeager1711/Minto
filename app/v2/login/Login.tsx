'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './login.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useApi } from '../../lib/apiContext/apiContext';

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
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const wasOpenedRef = useRef(false);
    const { login } = useApi();

    useEffect(() => {
        if (isOpen) {
            wasOpenedRef.current = true;
            setIsAnimatingOut(false);
            setEmail('');
            setPassword('');
            setError('');
            setShowPassword(false);
        } else if (wasOpenedRef.current) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setIsAnimatingOut(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Vui lòng điền đầy đủ tất cả các trường');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const response = await login({ email, password });
            onLoginSuccess(response.accessToken);
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
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
                <div className={styles.wrapper_header}>
                    <div className={styles.header}>
                        <span className={styles.brand}>⚡ Minto</span>
                        <button
                            className={styles.signUpButton}
                            onClick={() => {
                                onClose();
                                onOpenRegister();
                            }}
                        >
                            Đăng ký
                        </button>
                    </div>
                    <h2 className={styles.loginTitle}>Đăng nhập</h2>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        {error && <p className={styles.loginError}>{error}</p>}
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputField}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.loginInput}
                                    required
                                />
                            </div>
                            <div className={styles.inputField}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.loginInput}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.flex_footer}>
                            <span>
                                Nếu bạn chưa có tài khoản, hãy thực hiện{' '}
                                <strong
                                    onClick={() => {
                                        onClose();
                                        onOpenRegister();
                                    }}
                                >
                                    Đăng ký
                                </strong>
                            </span>
                            <button type="submit" className={styles.loginSubmit} disabled={isLoading}>
                                {isLoading ? (
                                    'Đang đăng nhập'
                                ) : (
                                    <>
                                        Đăng nhập <FontAwesomeIcon icon={faChevronRight} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                <div className={styles.newSection}>
                    <h3>Khám phá Minto</h3>
                    <h2></h2>
                    <button className={styles.discoverButton}>Bắt đầu ngay</button>
                </div>
            </div>
        </div>
    );
};

export default LoginPopup;
