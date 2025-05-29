'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './signup.module.scss';
import { useApi } from '../../lib/apiContext/apiContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface RegisterPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { email: string; password: string; confirmPassword: string }) => void;
}

const SignUpPopup: React.FC<RegisterPopupProps> = ({ isOpen, onClose, onSubmit }) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const wasOpenedRef = useRef(false);
    const { register } = useApi();

    // Hàm kiểm tra định dạng mật khẩu
    const validatePassword = (password: string): string | null => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return `Mật khẩu phải có ít nhất ${minLength} ký tự`;
        }
        if (!hasUpperCase) {
            return 'Mật khẩu phải chứa ít nhất một chữ hoa';
        }
        if (!hasLowerCase) {
            return 'Mật khẩu phải chứa ít nhất một chữ thường';
        }
        if (!hasNumber) {
            return 'Mật khẩu phải chứa ít nhất một số';
        }
        if (!hasSpecialChar) {
            return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (ví dụ: @, #, $)';
        }
        return null;
    };

    useEffect(() => {
        if (isOpen) {
            wasOpenedRef.current = true;
            setIsAnimatingOut(false);
            setEmail('');
            setFullName('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setShowPassword(false);
            setShowConfirmPassword(false);
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
        setError('');

        // Kiểm tra các trường bắt buộc
        if (!fullName || !email || !password || !confirmPassword) {
            setError('Vui lòng điền đầy đủ tất cả các trường');
            return;
        }

        // Kiểm tra định dạng mật khẩu
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        // Kiểm tra xác nhận mật khẩu
        if (password !== confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp');
            return;
        }

        try {
            await register({ full_name: fullName, email, password, confirmPassword });
            onSubmit({ email, password, confirmPassword });
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại';
            setError(errorMessage);
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
                className={`${styles.loginPopupContainer} ${
                    isOpen && !isAnimatingOut ? styles.animateContainerIn : ''
                }`}
            >
                <div className={styles.wrapper_header}>
                    <div className={styles.header}>
                        <div className={styles.brand}>⚡ Minto</div>
                        <button className={styles.signUpButton} onClick={onClose}>
                            Đăng nhập
                        </button>
                    </div>
                    <h2 className={styles.loginTitle}>Đăng ký tài khoản</h2>
                    {error && <p className={styles.loginError}>{error}</p>}
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputField}>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={styles.loginInput}
                                    placeholder="Họ và tên"
                                    required
                                />
                            </div>
                            <div className={styles.inputField}>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.loginInput}
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            <div className={styles.inputField}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.loginInput}
                                    placeholder="Mật khẩu"
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
                            <div className={styles.inputField}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={styles.loginInput}
                                    placeholder="Xác nhận mật khẩu"
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.flex_footer}>
                            <button type="submit" className={styles.loginSubmit}>
                                Đăng ký <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                            <span>
                                Đã có tài khoản?{' '}
                                <button className={styles.signUpButton} onClick={onClose}>
                                    Đăng nhập
                                </button>
                            </span>
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

export default SignUpPopup;
