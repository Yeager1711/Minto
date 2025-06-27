import * as React from 'react';
import styles from './userFeedback.module.scss';

function UserFeedback({ templateId }: { templateId: number }) {
    const [rating, setRating] = React.useState(3);
    const [comment, setComment] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false); // Bắt đầu với false để trigger animation
    const [isMounted, setIsMounted] = React.useState(false); // Trạng thái mount
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    // Kích hoạt animation khi component mount
    React.useEffect(() => {
        setIsMounted(true);
        setIsOpen(true); // Mở popup sau khi mount để trigger animation
    }, []);

    React.useEffect(() => {
        console.log('isOpen changed to:', isOpen, 'Class applied to wrapper:', isOpen ? styles.open : styles.close);
    }, [isOpen]);

    const handleStarClick = (value: number) => {
        setRating(value);
    };

    const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrorMessage(null);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setErrorMessage('No access token found. Please log in.');
            setIsSubmitting(false);
            return;
        }

        const feedbackData = {
            template_id: templateId,
            rating,
            comment: comment || null,
        };

        try {
            const response = await fetch(`${apiUrl}/user-feedback/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(feedbackData),
            });

            if (response.ok) {
                console.log('Feedback submitted successfully:', feedbackData);
                setTimeout(() => setIsOpen(false), 300); // Delay để animation hoàn thành
            } else {
                const errorText = await response.text();
                setErrorMessage(`Failed to submit feedback: ${errorText || 'Server error'}`);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 50) {
            setComment(e.target.value);
        }
    };

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
            setTimeout(() => setIsOpen(false), 300); // Delay để animation hoàn thành
        }
    };

    // Chỉ render khi đã mount để tránh flash content
    if (!isMounted) return null;

    return (
        <div
            className={`${styles.userFeedbackContainer} ${isOpen ? styles.open : styles.close}`}
            onClick={handleClickOutside}
        >
            <div className={`${styles.userFeedbackWrapper} ${isOpen ? styles.open : styles.close}`} ref={wrapperRef}>
                <div className={styles.checkmark}>✔</div>
                <h2 className={styles.title}>Thanks You!</h2>
                <p className={styles.message}>
                    Bạn đã sử dụng mẫu thiệp cưới của <strong>Minto</strong>
                </p>
                <div className={styles.dashedLine}></div>
                <p className={styles.ratingText}>
                    Đánh giá trả nghiệm của mình tại <strong>Minto</strong>
                </p>
                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                            onClick={() => handleStarClick(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <div className={styles.comment}>
                    <textarea
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Nhập bình luận (tối đa 50 ký tự)"
                    />
                    <span className={styles.charCount}>{50 - comment.length} ký tự còn lại</span>
                </div>
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                <button className={styles.submitButton} onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Đánh giá'}
                </button>
            </div>
        </div>
    );
}

export default UserFeedback;
