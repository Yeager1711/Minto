'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useApi } from '../../lib/apiConentext/ApiContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './login.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);

    const { login } = useApi();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        let newErrors = { username: '', password: '' };

        if (!formData.username) {
            newErrors.username = 'Tài khoản không được để trống';
        }
        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        }

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some((error) => error !== '');
        if (!hasErrors) {
            try {
                await login(formData.username, formData.password, keepLoggedIn);
                // Đợi 100ms để đảm bảo context đã cập nhật
                setTimeout(() => {
                    router.push('/');
                }, 100);
            } catch (error: any) {
                console.error('Lỗi khi đăng nhập:', error);
                try {
                    const errorData = JSON.parse(error.message);
                    setErrors({
                        username: errorData.field === 'email_hr' ? errorData.message : '',
                        password: errorData.field === 'password' ? errorData.message : '',
                    });
                } catch (parseError) {
                    setErrors({ username: 'Lỗi không xác định', password: '' });
                }
            }
        }
    };

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-in-out',
        });
        AOS.refresh();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.leftSection} data-aos="fade-right">
                <h2 data-aos="fade-up" data-aos-delay="100">
                    Đăng nhập
                </h2>
                <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-delay="200">
                    <div className={styles.leftSectionFormGroup} data-aos="fade-up" data-aos-delay="300">
                        <label>Tài khoản đăng nhập *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder=""
                        />
                        {errors.username && <p className={styles.leftSectionFormGroupError}>{errors.username}</p>}
                    </div>
                    <div className={styles.leftSectionFormGroup} data-aos="fade-up" data-aos-delay="400">
                        <label>Mật khẩu *</label>
                        <div className={styles.leftSectionFormGroupPasswordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder=""
                            />
                            <button
                                type="button"
                                className={styles.leftSectionFormGroupPasswordWrapperTogglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <FontAwesomeIcon icon={faEye} />
                                ) : (
                                    <FontAwesomeIcon icon={faEyeSlash} />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className={styles.leftSectionFormGroupError}>{errors.password}</p>}
                    </div>
                    <div className={styles.leftSectionFormOptions} data-aos="fade-up" data-aos-delay="500">
                        <label className={styles.leftSectionFormOptionsCheckbox}>
                            <input
                                type="checkbox"
                                checked={keepLoggedIn}
                                onChange={() => setKeepLoggedIn(!keepLoggedIn)}
                            />
                            Duy trì đăng nhập
                        </label>
                        <a href="#" className={styles.leftSectionFormOptionsForgotPassword}>
                            Quên mật khẩu?
                        </a>
                    </div>
                    <button
                        type="submit"
                        className={styles.leftSectionLoginButton}
                        data-aos="fade-up"
                        data-aos-delay="600"
                    >
                        Đăng nhập
                    </button>
                </form>
                <div className={styles.footerBar}>
                    <p>
                        Bạn chưa đăng ký? <a href="/v2/signup">Đăng ký ngay</a>
                    </p>
                    <a href="#" className={styles.footerBarHelpLink}>
                        {/* Trợ giúp */}
                    </a>
                </div>
            </div>
            <div className={styles.rightSection} data-aos="fade-left">
                <div className={styles.rightSectionLogo}>
                    <img src="/images/recruitment/banner_login.jpg" alt="" />
                </div>
            </div>
        </div>
    );
}
