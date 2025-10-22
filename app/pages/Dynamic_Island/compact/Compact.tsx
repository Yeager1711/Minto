'use client';
import * as React from 'react';
import styles from './Compact.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

interface DynamicPayload {
    state: 'minimal' | 'compact' | 'expanded';
    TypeContextCollapsed?: boolean;
    action: 'success' | 'failure';
    actionTitle?: string;
    describle?: string;
    time?: string;
    type?: string;
    duration?: number;
    [key: string]: unknown;
}

interface CompactProps {
    payload: DynamicPayload;
    isOpen: boolean;
    onClose: () => void;
}

function Compact({ payload, isOpen, onClose }: CompactProps) {
    const [isClosing, setIsClosing] = React.useState(false);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        let openTimer: NodeJS.Timeout;

        if (isOpen && !isClosing) {
            // ⏳ Delay 1.3s (0.3s + 1s) trước khi cho phép chạy animation mở
            openTimer = setTimeout(() => {
                const element = document.querySelector(`.${styles.Compact_wrapper}`);
                if (element) element.classList.add(styles.open);
            }, 1300);

            // Sau khi hiển thị xong -> bắt đầu đóng
            timer = setTimeout(
                () => {
                    setIsClosing(true);
                    setTimeout(() => {
                        setIsClosing(false);
                        onClose();
                    }, 2000);
                },
                (payload.duration ?? 3500) + 1300
            ); // delay thời gian tổng để khớp
        }

        return () => {
            clearTimeout(timer);
            clearTimeout(openTimer);
        };
    }, [isOpen, isClosing, onClose, payload.duration]);

    React.useEffect(() => {
        return () => {
            setIsClosing(false);
        };
    }, []);

    const handleClose = () => {
        if (!isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setIsClosing(false);
                onClose();
            }, 2000);
        }
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`${styles.Compact} ${isClosing ? styles.closing : ''}`}>
            <div
                className={`${styles.Compact_wrapper} ${isOpen ? styles.open : ''} ${isClosing ? styles.closing : ''}`}
                onClick={handleClose}
            >
                <div className={styles.actionContent}>
                    <div className={styles.actionContent__wrapper}>
                        <div className={styles.left}>
                            <h3>{payload.actionTitle || 'Hành động'}</h3>
                            <p>
                                {payload.describle ||
                                    (payload.action === 'success' ? 'Thành công!' : 'Thất bại, vui lòng thử lại.')}
                            </p>
                        </div>
                        <div className={styles.right}>
                            <div
                                className={`${styles.iconWrapper} ${
                                    payload.action === 'success' ? styles.success : styles.fail
                                }`}
                            >
                                <FontAwesomeIcon icon={payload.action === 'success' ? faCheck : faXmark} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Compact;
