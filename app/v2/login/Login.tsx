'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './login.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useApi } from '../../lib/apiContext/apiContext';
import Cookies from 'js-cookie';
import LoginCenter from '../../Animation/animationLogin/LoginCenter';

interface LoginPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenRegister: () => void;
    onLoginSuccess: (token: string, fullName: string) => void;
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
    const [userName, setUserName] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [showLoginCenter, setShowLoginCenter] = useState<boolean>(false);
    const [pendingToken, setPendingToken] = useState<string | null>(null);
    const isMounted = useRef<boolean>(true);

    const { login } = useApi();

    useEffect(() => {
        const savedEmail = Cookies.get('loginEmail');
        const savedPassword = Cookies.get('loginPassword');
        setEmail(savedEmail || '');
        setPassword(savedPassword || '');
        setRememberMe(!!savedEmail && !!savedPassword);

        return () => {
            isMounted.current = false;
        };
    }, []);

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

            const fullName = response.user.full_name || 'Người dùng';
            setUserName(fullName);
            setPendingToken(response.accessToken);

            if (rememberMe) {
                Cookies.set('loginEmail', email, { expires: 30 });
                Cookies.set('loginPassword', password, { expires: 30 });
            } else {
                Cookies.remove('loginEmail');
                Cookies.remove('loginPassword');
            }

            setShowLoginCenter(true); // Trigger animation
        } catch (loginError: unknown) {
            const error = loginError as ApiError;
            let errorMessage = error.response?.data?.message || '';
            if (errorMessage === 'Email hoặc mật khẩu không đúng') {
                errorMessage = 'Email hoặc mật khẩu không đúng';
            } else if (error.message?.includes('Network Error')) {
                errorMessage = 'Lỗi mạng, vui lòng kiểm tra kết nối';
            }
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

    if (!isOpen) return null;

    return (
        <div className={styles.loginPopupOverlay} onClick={handleOverlayClick}>
            {showLoginCenter ? (
                <LoginCenter
                    startAnimation={true}
                    fullName={userName}
                    onFinish={() => {
                        if (pendingToken && userName) {
                            onLoginSuccess(pendingToken, userName);
                            onClose();
                            setShowLoginCenter(false);
                            setPendingToken(null);
                        }
                    }}
                />
            ) : (
                <div className={styles.loginPopupContainer}>
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
                                    <div className={styles.rememberMe}>
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="rememberMe">Nhớ tài khoản và mật khẩu</label>
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
                </div>
            )}
        </div>
    );
};

export default LoginPopup;
