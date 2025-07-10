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

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onOpenRegister, onLoginSuccess }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showFlow2, setShowFlow2] = useState<boolean>(false);
    const [expandFlow2, setExpandFlow2] = useState<boolean>(false);
    const [hidePopup, setHidePopup] = useState<boolean>(false);
    const [showContent, setShowContent] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const isMounted = useRef<boolean>(true);
    const wasOpenedRef = useRef<boolean>(false);
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
            setUserName('');
            setPendingToken(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!showFlow2 || !pendingToken) return;

        const expandTimer = setTimeout(() => {
            if (!isMounted.current) return;
            setExpandFlow2(true);

            const showContentTimer = setTimeout(() => {
                if (!isMounted.current) return;
                setShowContent(true);
            }, 300);

            const collapseTimer = setTimeout(() => {
                if (!isMounted.current) return;
                setShowContent(false);
                setExpandFlow2(false);

                const hideTimer = setTimeout(() => {
                    if (!isMounted.current) return;
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
    }, [showFlow2, pendingToken, onLoginSuccess]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Vui lòng điền đầy đủ email và mật khẩu');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await login({ email, password });
            setPendingToken(response.accessToken);
            setShowFlow2(true);

            try {
                const userProfile = await getUserProfile();
                setUserName(userProfile.full_name || 'Người dùng');
            } catch (profileError: unknown) {
                const error = profileError as ApiError;
                setError(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
                setShowFlow2(false);
            }
        } catch (loginError: unknown) {
            const error = loginError as ApiError;
            let errorMessage = error.response?.data?.message || '';
            if (errorMessage === 'Email hoặc mật khẩu không đúng') {
                errorMessage = 'Email hoặc mật khẩu không đúng';
            } else if (error.message?.includes('Network Error')) {
                errorMessage = 'Lỗi mạng, vui lòng kiểm tra kết nối';
            }
            setError(errorMessage);
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
        <div className={`${styles.loginPopupOverlay} ${hidePopup ? styles.fadeOut : ''}`} onClick={handleOverlayClick}>
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
                                {error && <p className={`${styles.loginError} ${styles.errorHighlight}`}>{error}</p>}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={styles.loginInput}
                                            required
                                            disabled={isLoading}
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
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeButton}
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
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
                                            'Đang đăng nhập...'
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
