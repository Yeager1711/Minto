'use client';
import * as React from 'react';
import styles from './QK.module.css';

interface EventQKProps {
    onClose: () => void;
    title?: React.ReactNode;
    items?: string[];
    period?: {
        from: string;
        to?: string;
    };
}

export default function EventQK({ onClose, title, items = [], period }: EventQKProps) {
    return (
        <div className={styles.event} role="dialog" aria-modal="true">
            <div className={styles['event__overlay']} onClick={onClose}></div>

            <div className={styles['event__popup']}>
                <button className={styles['event__close']} onClick={onClose} aria-label="Đóng">
                    ×
                </button>

                <h2 className={styles['event__title']}>Mừng Đại Lễ Quốc khánh 02/09</h2>

                <div className={styles['event__content']}>
                    {title ? (
                        <div className={styles['event__customTitle']}>{title}</div>
                    ) : (
                        <p>
                            Nhân dịp kỷ niệm <strong>80 năm Quốc khánh 2/9/2025</strong>, xin gửi lời chúc mừng nồng
                            nhiệt nhất đến toàn thể đồng bào Việt Nam. Chúc đất nước ta ngày càng{' '}
                            <strong>giàu đẹp, phồn vinh, hùng cường</strong>, nhân dân ấm no, hạnh phúc, vững bước trên
                            con đường hội nhập và phát triển.
                        </p>
                    )}

                    {/* period nếu có */}
                    {period && (
                        <p className={styles['event__period']}>
                            <small>
                                Từ: <strong>{period.from}</strong>
                                {period.to && (
                                    <>
                                        {' '}
                                        - Đến: <strong>{period.to}</strong>
                                    </>
                                )}
                            </small>
                        </p>
                    )}

                    {/* items nếu có */}
                    {items.length > 0 && (
                        <div className={styles['event__promo']}>
                            <p>
                                <strong>Chi tiết:</strong>
                            </p>
                            <ul>
                                {items.map((it, idx) => (
                                    <li key={idx}>{it}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* fallback/khuyến mãi (nếu muốn) */}
                    <p style={{ marginTop: '1rem' }}>
                       <strong> Chúc mọi người có một ngày đại lễ thật vui vẻ bên gia đình và người thân!</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
