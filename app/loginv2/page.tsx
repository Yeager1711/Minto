'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './login.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

const LoginPopup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showFlow2, setShowFlow2] = useState(false); // Shrink flow_1
    const [expandFlow2, setExpandFlow2] = useState(false); // Expand flow_2
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowFlow2(true);
    };

    useEffect(() => {
        if (!showFlow2) return;

        const timer = setTimeout(() => {
            setExpandFlow2(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [showFlow2]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            console.log('Overlay clicked - closing popup');
        }
    };

    return (
        <div className={styles.loginPopupOverlay} onClick={handleOverlayClick}>
            <div
                className={`
          ${styles.loginPopupContainer}
          ${showFlow2 ? styles.animateContainerOut : styles.animateContainerIn}
          ${expandFlow2 ? styles.expandedContainer : ''}
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
                                        console.log('Sign up button clicked');
                                    }}
                                >
                                    Đăng ký
                                </button>
                            </div>
                            <h2 className={styles.loginTitle}>Đăng nhập</h2>
                            <form onSubmit={handleSubmit} className={styles.loginForm}>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={styles.loginInput}
                                        />
                                    </div>
                                    <div className={styles.inputField}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={styles.loginInput}
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
                                                console.log('Go to register');
                                            }}
                                        >
                                            Đăng ký
                                        </strong>
                                    </span>
                                    <button type="submit" className={styles.loginSubmit}>
                                        <>
                                            Đăng nhập <FontAwesomeIcon icon={faChevronRight} />
                                        </>
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
                        className={`
              ${styles.flow_2}
              ${styles.animateContainerIn}
              ${expandFlow2 ? styles.expand : ''}
            `}
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
                            <div className={styles.content}>
                                <h1>Chào mừng bạn đến Minto</h1>
                                <h3>Huỳnh Nam</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPopup;
