'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import classNames from 'classnames/bind';
import styles from './header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronLeft, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import LoginPopup from '../../../v2/login/Login';
import SignUpPopup from '../../../v2/signup/SignUp';
import { useApi } from 'app/lib/apiContext/apiContext';
import Loading from '../Loading_default/Loading';

const cx = classNames.bind(styles);

interface UserProfile {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: {
        role_id: number;
        name: string;
    };
}

interface UserPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const UserPopup: React.FC<UserPopupProps> = ({ isOpen, onClose, onLogout }) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const { getUserProfile } = useApi();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (isOpen) {
                setIsLoading(true);
                try {
                    const userData = await getUserProfile();
                    setUser(userData);
                    setError('');
                } catch (err: unknown) {
                    let errorMessage = 'Không thể lấy thông tin người dùng';
                    if (err instanceof Error) {
                        errorMessage = err.message;
                    } else if (typeof err === 'object' && err !== null && 'message' in err) {
                        errorMessage = (err as { message: string }).message;
                    }
                    setError(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchUserProfile();
    }, [isOpen, getUserProfile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAccountInfo = () => {
        if (user?.role.name === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/account/info');
        }
        onClose();
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        onClose();
    };

    return (
        <div ref={popupRef} className={cx('user-popup', { 'popup-open': isOpen })}>
            {error ? (
                <p className={cx('error')}>{error}</p>
            ) : isLoading ? (
                <div className={cx('user-info')}>
                    <div className={`${styles.skeleton} ${styles.skeleton_text}`}></div>
                    <div className={`${styles.skeleton} ${styles.skeleton_email}`}></div>
                </div>
            ) : user ? (
                <div className={cx('user-info')} onClick={handleAccountInfo}>
                    <h3>
                        {user.user_id}_{user.full_name}
                    </h3>
                    <p>{user.email}</p>
                </div>
            ) : (
                <p>
                    <Loading />
                </p>
            )}
            <div className={styles.control}>
                <button onClick={() => handleNavigation('/account/templates')}>Template đã chọn</button>
                <button onClick={() => handleNavigation('/account/PaymentHistory')}>Lịch sử thanh toán</button>
                {user?.role.name === 'customer' && (
                    <button onClick={() => handleNavigation('/account/error_handling')}>Phản hồi</button>
                )}
            </div>
            <button className={cx('logout-btn')} onClick={onLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
        </div>
    );
};

const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Hướng dẫn', path: '/instruct' },
];

function Header() {
    const pathname = usePathname();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isNavBoxOpen, setIsNavBoxOpen] = useState(false);
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isInitialLogin = useRef(true);

    // Listen for custom event to toggle sidebar state
    useEffect(() => {
        const handleSidebarToggle = (event: Event) => {
            const customEvent = event as CustomEvent<{ collapsed: boolean }>;
            setIsSidebarCollapsed(customEvent.detail.collapsed);
        };

        window.addEventListener('toggleSidebar', handleSidebarToggle);

        return () => {
            window.removeEventListener('toggleSidebar', handleSidebarToggle);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || '';
        setAccessToken(token);
    }, []);

    useEffect(() => {
        if (accessToken && isInitialLogin.current && !isUserPopupOpen && !isLoginOpen) {
            isInitialLogin.current = false;
        }
    }, [accessToken, isUserPopupOpen, isLoginOpen]);

    const handleOpenRegister = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };

    const handleOpenLoginFromRegister = () => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
    };

    const toggleNavBox = () => {
        setIsNavBoxOpen(!isNavBoxOpen);
    };

    const handleOpenLogin = () => {
        setIsLoginOpen(true);
    };

    const handleOpenUserPopup = () => {
        if (accessToken) {
            setIsUserPopupOpen(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setAccessToken('');
        setIsUserPopupOpen(false);
    };

    const handleCloseLogin = useCallback(() => {
        setIsLoginOpen(false);
    }, []);

    const handleLoginSuccess = (token: string) => {
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
        setIsLoginOpen(false);
        isInitialLogin.current = true;
    };

    const displayedNavItem = pathname === '/' ? navItems[1] : navItems[0];

    return (
        <aside
            className={cx('sidebar', {
                'display-none': pathname.includes('/template') || pathname.startsWith('/admin'),
                'sidebar-collapsed': isSidebarCollapsed,
            })}
        >
            <div className={styles.margin}>
                <div className={cx('logo', { 'logo-hidden': isNavBoxOpen })}>
                    <img src="/images/logo.png" alt="" />
                </div>
                <div className={cx('nav-container')}>
                    <div className={cx('user-container')}>
                        <div className={cx('chevron_expend', { 'chevron_expend-open': isNavBoxOpen })}>
                            <div className={cx('chevron', { 'chevron-open': isNavBoxOpen })} onClick={toggleNavBox}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </div>
                            <ul className={cx('nav', { 'nav-open': isNavBoxOpen })}>
                                {navItems.map((item) => (
                                    <li
                                        key={item.name}
                                        className={cx({
                                            active: pathname === item.path,
                                            'nav-hidden': item.path !== displayedNavItem.path,
                                        })}
                                    >
                                        <Link href={item.path}>{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {!accessToken && (
                            <div className={cx('user_1')} onClick={handleOpenLogin}>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                        )}
                        {accessToken && (
                            <div className={cx('user_2')} onClick={handleOpenUserPopup}>
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                        )}
                        {accessToken && isUserPopupOpen && (
                            <UserPopup
                                isOpen={isUserPopupOpen}
                                onClose={() => setIsUserPopupOpen(false)}
                                onLogout={handleLogout}
                            />
                        )}
                    </div>
                </div>
            </div>
            <LoginPopup
                isOpen={isLoginOpen}
                onClose={handleCloseLogin}
                onOpenRegister={handleOpenRegister}
                onLoginSuccess={handleLoginSuccess}
            />
            <SignUpPopup
                isOpen={isRegisterOpen}
                onClose={handleOpenLoginFromRegister}
                onSubmit={(data) => console.log('Register data:', data)}
            />
        </aside>
    );
}

export default Header;
