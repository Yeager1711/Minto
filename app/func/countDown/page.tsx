'use client';
import React, { useState, useEffect } from 'react';
import styles from './countDown.module.scss';

// Mock countdown data
const mockCountdown = {
    targetDate: '01/07/2025', // Chỉnh sửa ngày tại đây, định dạng DD/MM/YYYY
    discountMessage: 'Giảm 20% ưu đãi áp dụng cho những tài khoản lần đầu sử dụng dịch vụ', // Chỉnh sửa thông điệp tại đây
};

const Countdown: React.FC = () => {
    // Chuyển đổi chuỗi DD/MM/YYYY thành timestamp
    const parseTargetDate = (dateStr: string): number => {
        // Validate format DD/MM/YYYY
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(dateRegex);
        if (!match) {
            console.error(`Invalid date format: ${dateStr}. Expected DD/MM/YYYY.`);
            return NaN;
        }

        const [, day, month, year] = match.map(Number);
        // Ensure valid date components
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1970) {
            console.error(`Invalid date values: ${day}/${month}/${year}`);
            return NaN;
        }

        // Create date with zero-padded components and +07:00 timezone
        const date = new Date(
            `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00+07:00`
        );
        const timestamp = date.getTime();

        if (isNaN(timestamp)) {
            console.error(`Failed to parse date: ${dateStr}`);
            return NaN;
        }

        return timestamp;
    };

    const targetDate = parseTargetDate(mockCountdown.targetDate);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isInvalidDate, setIsInvalidDate] = useState(false);

    useEffect(() => {
        if (isNaN(targetDate)) {
            setIsInvalidDate(true);
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    if (isInvalidDate) {
        return (
            <div className={styles.countdown_container}>
                <h2 className={styles.countdown_title}>Ưu đãi đặc biệt sắp đến!</h2>
                <p className={styles.countdown_message}>{mockCountdown.discountMessage}</p>
                <p className={styles.countdown_error}>Ngày không hợp lệ, vui lòng kiểm tra định dạng (DD/MM/YYYY).</p>
            </div>
        );
    }

    return (
        <div className={styles.countdown_container}>
            <h2 className={styles.countdown_title}>Ưu đãi đặc biệt sắp đến!</h2>
            <p className={styles.countdown_message}>{mockCountdown.discountMessage}</p>
            <div className={styles.countdown_boxes}>
                <div className={styles.countdown_box}>
                    <span className={styles.countdown_value}>{timeLeft.days}</span>
                    <span className={styles.countdown_label}>Ngày</span>
                </div>
                <div className={styles.countdown_box}>
                    <span className={styles.countdown_value}>{timeLeft.hours}</span>
                    <span className={styles.countdown_label}>Giờ</span>
                </div>
                <div className={styles.countdown_box}>
                    <span className={styles.countdown_value}>{timeLeft.minutes}</span>
                    <span className={styles.countdown_label}>Phút</span>
                </div>
                <div className={styles.countdown_box}>
                    <span className={styles.countdown_value}>{timeLeft.seconds}</span>
                    <span className={styles.countdown_label}>Giây</span>
                </div>
            </div>
        </div>
    );
};

export default Countdown;
