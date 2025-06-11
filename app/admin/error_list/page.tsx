'use client';
import React, { useState, useEffect } from 'react';
import styles from './error_list.module.scss';
import { useApi } from 'app/lib/apiContext/apiContext';

// Define interface for Feedback
interface Feedback {
    feedback_id: number;
    error_message: string;
    submitted_at: string;
    status: 'PENDING' | 'RESOLVED' | 'IGNORED';
    resolved_at: string | null;
    resolution_notes: string | null;
    user: {
        user_id: number;
        full_name: string;
        email: string;
    };
}

// Define interface for API response
interface ErrorFeedbackResponse {
    feedbacks: Feedback[];
}

function ErrorList() {
    const { accessToken, getAllErrorFeedback, updateErrorFeedbackStatus } = useApi();
    const [errors, setErrors] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('all');
    const [dateOptions, setDateOptions] = useState<string[]>([]);
    const [selectedError, setSelectedError] = useState<Feedback | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    // Map English statuses to Vietnamese display text
    const statusDisplayMap: Record<Feedback['status'], string> = {
        PENDING: 'ĐANG CHỜ',
        RESOLVED: 'ĐÃ GIẢI QUYẾT',
        IGNORED: 'BỎ QUA',
    };

    useEffect(() => {
        const fetchErrorFeedback = async () => {
            if (!accessToken) {
                setError('Vui lòng đăng nhập để xem danh sách phản hồi lỗi');
                return;
            }
            setLoading(true);
            try {
                const response = (await getAllErrorFeedback()) as ErrorFeedbackResponse;
                // Validate response structure
                if (!Array.isArray(response?.feedbacks)) {
                    throw new Error('Invalid response format: feedbacks is not an array');
                }
                setErrors(response.feedbacks);

                // Extract unique dates for PENDING errors
                const pendingDates = Array.from(
                    new Set(
                        response.feedbacks
                            .filter((feedback) => feedback.status === 'PENDING')
                            .map((feedback) =>
                                new Date(feedback.submitted_at).toLocaleDateString('vi-VN', {
                                    dateStyle: 'short',
                                })
                            )
                    )
                );
                setDateOptions(['all', ...pendingDates]);
                setError(null);
            } catch {
                // Optional: Log error for debugging
                // console.error('Error fetching feedback:', error);
                setError('Không thể tải danh sách phản hồi lỗi');
            } finally {
                setLoading(false);
            }
        };

        fetchErrorFeedback();
    }, [accessToken, getAllErrorFeedback]);

    const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDate(event.target.value);
    };

    const handleStatusChange = async (feedbackId: number, newStatus: Feedback['status']) => {
        try {
            let resolutionNotes: string | undefined;
            if (newStatus === 'RESOLVED' || newStatus === 'IGNORED') {
                resolutionNotes = prompt('Vui lòng nhập ghi chú giải quyết (tùy chọn):') || undefined;
            }

            // Update status on the server
            await updateErrorFeedbackStatus(feedbackId, newStatus, resolutionNotes);

            // Update local state
            setErrors((prevErrors) =>
                prevErrors.map((feedback) =>
                    feedback.feedback_id === feedbackId
                        ? {
                              ...feedback,
                              status: newStatus,
                              resolved_at:
                                  newStatus === 'RESOLVED' || newStatus === 'IGNORED' ? new Date().toISOString() : null,
                              resolution_notes:
                                  newStatus === 'RESOLVED' || newStatus === 'IGNORED'
                                      ? resolutionNotes || 'Đã xử lý'
                                      : null,
                          }
                        : feedback
                )
            );

            // Update selectedError if it's the one being updated
            if (selectedError?.feedback_id === feedbackId) {
                setSelectedError({
                    ...selectedError,
                    status: newStatus,
                    resolved_at: newStatus === 'RESOLVED' || newStatus === 'IGNORED' ? new Date().toISOString() : null,
                    resolution_notes:
                        newStatus === 'RESOLVED' || newStatus === 'IGNORED' ? resolutionNotes || 'Đã xử lý' : null,
                });
            }
        } catch {
            // Optional: Log error for debugging
            // console.error('Error updating status:', error);
            setError('Không thể cập nhật trạng thái phản hồi');
        }
    };

    const filteredErrors =
        selectedDate === 'all'
            ? errors
            : errors.filter(
                  (feedback) =>
                      new Date(feedback.submitted_at).toLocaleDateString('vi-VN', { dateStyle: 'short' }) ===
                          selectedDate && feedback.status === 'PENDING'
              );

    const columns = [
        { key: 'feedback_id', label: 'Feedback ID' },
        { key: 'error_message', label: 'Error Message' },
        { key: 'submitted_at', label: 'Submitted At' },
        { key: 'status', label: 'Status' },
    ] as const;

    const statusOptions: Feedback['status'][] = ['PENDING', 'RESOLVED', 'IGNORED'];

    const openDetails = (error: Feedback) => {
        setIsClosing(false);
        setSelectedError(error);
    };

    const closeDetails = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedError(null);
            setIsClosing(false);
        }, 300);
    };

    return (
        <div className={styles.Error_list}>
            <div className={styles.Error_list__wrapper}>
                <div className={styles.date_filter}>
                    <label htmlFor="date-select">Lọc theo ngày:</label>
                    <select id="date-select" value={selectedDate} onChange={handleDateChange}>
                        {dateOptions.map((date) => (
                            <option key={date} value={date}>
                                {date === 'all' ? 'Tất cả' : date}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.table_container}>
                    {loading && <p className={styles.loading}>Đang tải...</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    {!loading && !error && filteredErrors.length === 0 && (
                        <p className={styles.empty}>Không có dữ liệu phản hồi lỗi</p>
                    )}
                    {!loading && !error && filteredErrors.length > 0 && (
                        <div className={styles.table_wrapper}>
                            <table>
                                <thead>
                                    <tr>
                                        {columns.map((col) => (
                                            <th key={col.key} data-label={col.label}>
                                                {col.label}
                                            </th>
                                        ))}
                                        <th data-label="Actions">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredErrors.map((error) => (
                                        <tr key={error.feedback_id}>
                                            <td data-label="Feedback ID">{error.feedback_id}</td>
                                            <td data-label="Error Message">{error.error_message}</td>
                                            <td data-label="Submitted At">
                                                {error.submitted_at
                                                    ? new Date(error.submitted_at).toLocaleString('vi-VN', {
                                                          dateStyle: 'short',
                                                          timeStyle: 'short',
                                                      })
                                                    : 'N/A'}
                                            </td>
                                            <td data-label="Status">
                                                <select
                                                    className={`${styles.status_select} ${
                                                        error.status === 'PENDING'
                                                            ? styles.status__pending
                                                            : error.status === 'RESOLVED'
                                                              ? styles.status__resolved
                                                              : styles.status__ignored
                                                    }`}
                                                    value={error.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            error.feedback_id,
                                                            e.target.value as Feedback['status']
                                                        )
                                                    }
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {statusDisplayMap[status]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td data-label="Actions">
                                                <button
                                                    className={styles.view_details}
                                                    onClick={() => openDetails(error)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {selectedError && (
                    <div className={`${styles.popup} ${isClosing ? styles.popup__exit : styles.popup__enter}`}>
                        <div
                            className={`${styles.popup__content} ${isClosing ? styles.popup__content_exit : styles.popup__content_enter}`}
                        >
                            <h2>Chi tiết phản hồi lỗi</h2>
                            <div className={styles.popup__field}>
                                <strong>Feedback ID:</strong> {selectedError.feedback_id}
                            </div>
                            <div className={styles.popup__field}>
                                <strong>Error Message:</strong> {selectedError.error_message}
                            </div>
                            <div className={styles.popup__field}>
                                <strong>Submitted At:</strong>{' '}
                                {selectedError.submitted_at
                                    ? new Date(selectedError.submitted_at).toLocaleString('vi-VN', {
                                          dateStyle: 'short',
                                          timeStyle: 'short',
                                      })
                                    : 'N/A'}
                            </div>
                            <div className={styles.popup__field}>
                                <strong>Status:</strong>{' '}
                                <span
                                    className={`${styles.status} ${
                                        selectedError.status === 'PENDING'
                                            ? styles.status__pending
                                            : selectedError.status === 'RESOLVED'
                                              ? styles.status__resolved
                                              : styles.status__ignored
                                    }`}
                                >
                                    {statusDisplayMap[selectedError.status] || selectedError.status}
                                </span>
                            </div>
                            <div className={styles.popup__field}>
                                <strong>Resolved At:</strong> {selectedError.resolved_at || 'NULL'}
                            </div>
                            <div className={styles.popup__field}>
                                <strong>User ID:</strong> {selectedError.user.user_id}
                            </div>
                            <div className={styles.popup__field}>
                                <strong>Full Name:</strong> {selectedError.user.full_name}
                            </div>
                            <div className={styles.popup__field}>
                                <strong>Email:</strong> {selectedError.user.email}
                            </div>
                            <div className={styles.popup__field_Resolution}>
                                <strong>Resolution Notes:</strong> {selectedError.resolution_notes || 'NULL'}
                            </div>
                            <button className={styles.popup__close} onClick={closeDetails}>
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ErrorList;
