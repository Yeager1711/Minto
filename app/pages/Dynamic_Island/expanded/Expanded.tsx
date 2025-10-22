import * as React from 'react';
import styles from './Expanded.module.css';

interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: Date | string;
    status: string;
    representative: string | null;
}

interface DynamicPayload {
    state: 'minimal' | 'compact' | 'expanded';
    action: 'success' | 'failure';
    actionTitle?: string;
    describe?: string;
    time?: string;
    type?: string;
    duration?: number;
    oldData?: Partial<QrResponse>;
    newData?: Partial<QrResponse>;
    [key: string]: unknown;
}

interface ExpandedProps {
    payload: DynamicPayload;
    isOpen: boolean;
    onClose: () => void;
}

function Expanded({ payload, isOpen, onClose }: ExpandedProps) {
    const [isClosing, setIsClosing] = React.useState(false);
    const { action, actionTitle, oldData, newData, duration } = payload;

    // Handle auto-close after duration or manual close
    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && !isClosing) {
            timer = setTimeout(() => {
                setIsClosing(true);
                setTimeout(() => {
                    setIsClosing(false);
                    onClose();
                }, 500);
            }, duration ?? 5000);
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

    // Helper to display representative in Vietnamese
    const formatRepresentative = (rep: string | null | undefined) => {
        if (!rep) return '';
        return rep === 'groom' ? 'Chú Rể' : 'Cô Dâu';
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`${styles.Expanded} ${isClosing ? styles.closing : ''}`}>
            <div
                className={`${styles.Expanded_wrapper} ${isOpen ? styles.open : ''} ${isClosing ? styles.closing : ''}`}
                onClick={handleClose}
            >
                <div className={styles.actionContent}>
                    <div className={styles.actionContent__wrapper}>
                        <div className={styles.TypeDynamic_Edit}>
                            <div className={styles.nameAction}>
                                <div className={styles.action}>{actionTitle}</div>
                                <div className={`${styles.status} ${action === 'success' ? styles.g : styles.r}`}>
                                    {action === 'success' ? 'Success' : 'Fail'}
                                </div>
                            </div>

                            <div className={styles.details}>
                                <h4>Details</h4>
                                <div className={styles.flex}>
                                    <div className={styles.dataOld}>
                                        {action === 'success' && (oldData || newData) ? (
                                            <div className={styles.qrInfo}>
                                                <h4>Thông tin cũ:</h4>
                                                {oldData?.bank && <p>Ngân hàng: {oldData.bank}</p>}
                                                {oldData?.accountNumber && <p>Số tài khoản: {oldData.accountNumber}</p>}
                                                {oldData?.accountHolder && (
                                                    <p>Chủ tài khoản: {oldData.accountHolder}</p>
                                                )}
                                                {oldData?.representative && (
                                                    <p>
                                                        Người đại diện: {formatRepresentative(oldData.representative)}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p>Không có dữ liệu cũ.</p>
                                        )}
                                    </div>

                                    <div className={styles.dataNew}>
                                        {action === 'success' && (oldData || newData) ? (
                                            <div className={styles.qrInfo}>
                                                <h4>Thông tin mới:</h4>
                                                {newData?.bank && <p>Ngân hàng: {newData.bank}</p>}
                                                {newData?.accountNumber && <p>Số tài khoản: {newData.accountNumber}</p>}
                                                {newData?.accountHolder && (
                                                    <p>Chủ tài khoản: {newData.accountHolder}</p>
                                                )}
                                                {newData?.representative && (
                                                    <p>
                                                        Người đại diện: {formatRepresentative(newData.representative)}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p>Không có dữ liệu mới.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Expanded;
