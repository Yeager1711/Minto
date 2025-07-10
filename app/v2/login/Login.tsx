'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './login.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
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
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showFlow2, setShowFlow2] = useState(false);
    const [expandFlow2, setExpandFlow2] = useState(false);
    const [hidePopup, setHidePopup] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [userName, setUserName] = useState('');
    const isMounted = useRef(true);
    const wasOpenedRef = useRef(false);
    const [pendingToken, setPendingToken] = useState<string | null>(null);

    const { login, getUserProfile } = useApi();

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            wasOpenedRef.current = true;
            setEmail('');
            setPassword('');
            setError('');
            setShowPassword(false);
            setShowFlow2(false);
            setExpandFlow2(false);
            setHidePopup(false);
            setShowContent(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!showFlow2 || !pendingToken) return;

        const expandTimer = setTimeout(() => {
            setExpandFlow2(true);

            const showContentTimer = setTimeout(() => {
                setShowContent(true);
            }, 300); // delay nhỏ để tránh khựng

            // ⏱ 2s sau khi expand → remove expand
            const collapseTimer = setTimeout(() => {
                setShowContent(false);
                setExpandFlow2(false);

                // ⏱ 0.5s sau khi xóa expand → ẩn popup
                const hideTimer = setTimeout(() => {
                    setHidePopup(true);
                    onLoginSuccess(pendingToken);
                    window.location.reload();
                }, 400);

                return () => clearTimeout(hideTimer);
            }, 2000);

            return () => {
                clearTimeout(showContentTimer);
                clearTimeout(collapseTimer);
            };
        }, 1000);

        return () => clearTimeout(expandTimer);
    }, [showFlow2, pendingToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Vui lòng điền đầy đủ tất cả các trường');
            return;
        }

        setError('');
        setIsLoading(true);
        setShowFlow2(true);

        try {
            const response = await login({ email, password });
            const userProfile = await getUserProfile();
            setUserName(userProfile.full_name || 'Người dùng');
            setPendingToken(response.accessToken);
        } catch {
            setError('Đăng nhập thất bại');
            setShowFlow2(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen && !hidePopup) return null;

    return (
        <div
            className={`
                ${styles.loginPopupOverlay}
                ${hidePopup ? styles.fadeOut : ''}
            `}
            onClick={handleOverlayClick}
        >
            <div
                className={`
                    ${styles.loginPopupContainer}
                    ${showFlow2 ? styles.animateContainerOut : styles.animateContainerIn}
                    ${expandFlow2 ? styles.expandedContainer : ''}
                    ${hidePopup ? styles.scaleOut : ''}
                `}
            >
                {!showFlow2 && (
                    <div className={styles.flow_1}>
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
                                        Nếu bạn chưa có tài khoản, hãy{' '}
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
                            <button className={styles.discoverButton}>Bắt đầu ngay</button>
                        </div>
                    </div>
                )}

                {showFlow2 && (
                    <div
                        className={`${styles.flow_2} ${styles.animateContainerIn} ${expandFlow2 ? styles.flowExpand : ''}`}
                    >
                        <div className={styles.image_logo}>
                            <Image
                                src="/images/logo.png"
                                alt="Minto Logo"
                                width={100}
                                height={100}
                                style={{ borderRadius: '1rem', objectFit: 'cover' }}
                            />
                        </div>
                        {expandFlow2 && (
                            <div className={`${styles.content} ${showContent ? styles.show : ''}`}>
                                <p>Chào mừng bạn đến Minto</p>
                                <h3>{userName}</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPopup;
