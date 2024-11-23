"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Thay thế useRouter bằng usePathname
import classNames from 'classnames/bind';
import styles from './header.module.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronRight  } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Header() {
  const pathname = usePathname(); 
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <header className={cx('header_wrapper')}>
      <a href="/" className={cx('logo')}>
        <img src="/logo/logo_website.png" alt="Logo" />
      </a>

      <nav className={cx('navbar')}>
        <Link href="/" className={cx('nav-link', { active: pathname === '/' })}>
          Trang chủ
        </Link>
        <Link href="/jobs" className={cx('nav-link', { active: pathname === '/jobs' })}>
          Việc làm
        </Link>
        <Link href="/companies" className={cx('nav-link', { active: pathname === '/companies' })}>
          Công ty
        </Link>
      </nav>

      <div className={cx('button-control')}>
        <button className={cx('btn-login')} onClick={handleLoginClick}>
          Đăng nhập
        </button>
        <button className={cx('btn-register')} onClick={handleRegisterClick}>
          Đăng ký
        </button>

        <div className={cx('employer')}>
          <span className={cx('header-question-employer')}>Bạn là nhà tuyển dụng?</span>
          <Link href="/companies" className={cx('Apply-Now')}>
            Đăng tuyển ngay
            <FontAwesomeIcon icon={faChevronRight} /><FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
      </div>

      {/* 
      {isLoginModalOpen && <Login isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />}
      {isRegisterModalOpen && <Register isOpen={isRegisterModalOpen} onClose={handleCloseModal} />} 
      */}
    </header>
  );
}

export default Header;
