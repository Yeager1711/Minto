'use client';

import * as React from 'react';
import { useApi } from '../../lib/apiContext/apiContext';
import styles from './error_handling.module.css';

interface Feedback {
    feedback_id: number;
    error_message: string;
    submitted_at: string;
    status: string;
    resolved_at: string | null;
    resolution_notes: string | null;
    user: {
        user_id: number;
        full_name: string;
        email: string;
    };
}

function ErrorHandling() {
    const { getUserErrorFeedback } = useApi();
    const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
    const [expandedId, setExpandedId] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await getUserErrorFeedback();
                setFeedbacks(response.feedbacks);
                setLoading(false);
            } catch {
                setError('Không thể tải phản hồi lỗi. Vui lòng thử lại.');
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, [getUserErrorFeedback]);

    const toggleExpand = (feedbackId: number) => {
        setExpandedId(expandedId === feedbackId ? null : feedbackId);
    };

    // Hàm ánh xạ trạng thái từ tiếng Anh sang tiếng Việt
    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            PENDING: 'ĐANG CHỜ',
            RESOLVED: 'ĐÃ GIẢI QUYẾT',
            IGNORED: 'BỎ QUA',
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.ErrorHandling}>
            <h3></h3>
            <div className={styles.ErrorHandling_wrapper}>
                {feedbacks.length === 0 ? (
                    <p className={styles.noFeedback}>Không có phản hồi lỗi nào.</p>
                ) : (
                    feedbacks.map((feedback) => (
                        <div
                            key={feedback.feedback_id}
                            className={`${styles.feedbackCard} ${
                                expandedId === feedback.feedback_id ? styles.expanded : ''
                            }`}
                            onClick={() => toggleExpand(feedback.feedback_id)}
                        >
                            <div className={styles.feedbackHeader}>
                                <h4>
                                    #{feedback.feedback_id}: {feedback.error_message}
                                </h4>
                                <span className={`${styles.status} ${styles[feedback.status.toLowerCase()]}`}>
                                    {getStatusLabel(feedback.status)}
                                </span>
                            </div>
                            <div className={styles.feedbackDetails}>
                                <p>
                                    <strong>Ngày gửi:</strong> {new Date(feedback.submitted_at).toLocaleString()}
                                </p>
                            </div>
                            <div className={styles.additionalDetails}>
                                <p>
                                    <strong>Ngày giải quyết:</strong>{' '}
                                    {feedback.resolved_at
                                        ? new Date(feedback.resolved_at).toLocaleString()
                                        : 'Chưa giải quyết'}
                                </p>
                                <p>
                                    <strong>Ghi chú giải quyết:</strong>{' '}
                                    {feedback.resolution_notes || 'Không có ghi chú'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ErrorHandling;
