import * as React from 'react';
import styles from './Compact.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

interface CompactProps {
    status: 'success' | 'error';
    action: string;
    isOpen: boolean;
    onClose: () => void;
    duration?: number;
}

function Compact({ status, action, isOpen, onClose, duration }: CompactProps) {
    const [isClosing, setIsClosing] = React.useState(false);

    // Handle auto-close after 6s or manual close
    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && !isClosing) {
            // Nếu không có duration thì default = 3500ms
            timer = setTimeout(() => {
                setIsClosing(true);
                setTimeout(() => {
                    setIsClosing(false);
                    onClose();
                }, 800);
            }, duration ?? 0);
        }
        return () => clearTimeout(timer);
    }, [isOpen, isClosing, onClose, duration]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            setIsClosing(false);
        };
    }, []);

    // Optional: click to close
    const handleClose = () => {
        if (!isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setIsClosing(false);
                onClose();
            }, 800);
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
                            <h3>{status === 'success' ? `${action} thành công` : `${action} thất bại`}</h3>
                            <p>
                                {status === 'success'
                                    ? `${action} của bạn đã được thực hiện thành công!`
                                    : `Có lỗi xảy ra khi ${action.toLowerCase()}, vui lòng thử lại.`}
                            </p>
                        </div>
                        <div className={styles.right}>
                            <div
                                className={`${styles.iconWrapper} ${
                                    status === 'success' ? styles.success : styles.fail
                                }`}
                            >
                                <FontAwesomeIcon icon={status === 'success' ? faCheck : faXmark} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Compact;
