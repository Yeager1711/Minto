'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './signup.module.scss';

interface RegisterPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { email: string; password: string; confirmPassword: string }) => void;
}

interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;
const SignUpPopup: React.FC<RegisterPopupProps> = ({ isOpen, onClose, onSubmit }) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const wasOpenedRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            wasOpenedRef.current = true;
            setIsAnimatingOut(false);
            setEmail('');
            setFullName('');
            setPassword('');
            setConfirmPassword('');
            setError('');
        } else if (wasOpenedRef.current && !isAnimatingOut) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setIsAnimatingOut(false);
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName || !email || !password || !confirmPassword) {
            setError('Vui lòng điền đầy đủ tất cả các trường');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/auth/register`, {
                full_name: fullName,
                email,
                password,
                confirmPassword,
            });

            onSubmit({ email, password, confirmPassword });

            console.log('Đăng ký thành công:', response.data);
            onClose();
        } catch (err: unknown) {
            const axiosError = err as AxiosErrorResponse;
            const errorMessage =
                axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string'
                    ? axiosError.response.data.message
                    : 'Đã có lỗi xảy ra, vui lòng thử lại';
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
            className={`${styles.signUpPopupOverlay} ${isOpen && !isAnimatingOut ? styles.animateIn : ''}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`${styles.signUpPopupContainer} ${isOpen && !isAnimatingOut ? styles.animateContainerIn : ''}`}
            >
                <h2 className={styles.signUpPopupTitle}>Đăng ký tài khoản</h2>
                {error && <p className={styles.signUpPopupError}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.signUpPopupField}>
                        <label className={styles.signUpPopupLabel} htmlFor="fullName">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={styles.signUpPopupInput}
                            required
                        />
                    </div>
                    <div className={styles.signUpPopupField}>
                        <label className={styles.signUpPopupLabel} htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.signUpPopupInput}
                            required
                        />
                    </div>
                    <div className={styles.signUpPopupField}>
                        <label className={styles.signUpPopupLabel} htmlFor="password">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.signUpPopupInput}
                            required
                        />
                    </div>
                    <div className={styles.signUpPopupField}>
                        <label className={styles.signUpPopupLabel} htmlFor="confirmPassword">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.signUpPopupInput}
                            required
                        />
                    </div>
                    <div className={styles.signUpPopupActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${styles.signUpPopupButton} ${styles.signUpPopupButtonCancel}`}
                        >
                            Thoát
                        </button>
                        <button
                            type="submit"
                            className={`${styles.signUpPopupButton} ${styles.signUpPopupButtonSubmit}`}
                        >
                            Đăng ký
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpPopup;
