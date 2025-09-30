'use client';
import * as React from 'react';
import styles from './minimal.module.css';

interface MinimalProps {
    status: 'success' | 'error';
    action: string;
    isOpen: boolean;
    onClose: () => void;
    duration?: number;
}

function Minimal({ status, action, isOpen, onClose, duration = 5000 }: MinimalProps) {
    const [expanded, setExpanded] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(isOpen);
    const [showExpandPayment, setShowExpandPayment] = React.useState(false);

    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        let mounted = true;
        if (isOpen) {
            setIsVisible(true);
            setExpanded(true);
            setShowExpandPayment(false);

            const timer = setTimeout(() => {
                if (mounted) {
                    setExpanded(false);
                }
            }, duration + 1000);

            return () => {
                mounted = false;
                clearTimeout(timer);
            };
        }
    }, [isOpen, duration]);

    React.useEffect(() => {
        const node = wrapperRef.current;
        if (!node) return;

        const handleWrapperTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName === 'width' && !expanded && !isOpen) {
                setIsVisible(false);
                onClose();
            } else if (e.propertyName === 'width' && !expanded) {
                setShowExpandPayment(true);
            }
        };

        node.addEventListener('transitionend', handleWrapperTransitionEnd);
        return () => {
            node.removeEventListener('transitionend', handleWrapperTransitionEnd);
        };
    }, [expanded, isOpen, onClose]);

    if (!isVisible) return null;

    return (
        <div className={styles.Minimal}>
            <div ref={wrapperRef} className={`${styles.Minimal_wrapper} ${expanded ? styles.expanded : styles.shrunk}`}>
                <div className={styles.stage_wrapper}>
                    <div className={styles.object_content}>
                        <div className={styles.action}>{action}</div>
                        <div className={styles.object_status}>{status === 'success' ? '✔' : '✘'}</div>
                    </div>

                    <div className={`${styles.expand_payment} ${showExpandPayment ? styles.show : ''}`}>
                        <div className={styles.expand_payment__wrapper}>
                            <h3>Thiết Lập trạng thái</h3>
                            <button className={styles.btn_success}>Thiết lập</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Minimal;
