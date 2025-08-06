'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import styles from './gemini_reply.module.css';
import { IoSend } from 'react-icons/io5';

interface Message {
    text: string;
    isUser: boolean;
    displayedText?: string;
}

interface GeminiReplyProps {
    onClose: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const GeminiReply: React.FC<GeminiReplyProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    // Hàm gửi câu hỏi đến API
    const handleSend = async () => {
        if (!input.trim()) return;

        setMessages([...messages, { text: input, isUser: true }]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Bạn cần đăng nhập để sử dụng Minto Bot!');
            }

            const response = await axios.post(
                `${apiUrl}/ai/ask-minto`,
                { question: input },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setMessages((prev) => [...prev, { text: response.data.response, isUser: false, displayedText: '' }]);
        } catch (err: unknown) {
            // Use `unknown` instead of `AxiosError`
            let errorMessage = 'Có lỗi xảy ra khi gọi Minto Bot. Vui lòng thử lại!';
            if (err instanceof AxiosError) {
                // Type narrowing
                if (err.response) {
                    if (err.response.status === 401) {
                        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
                    } else if (err.response.status === 400) {
                        errorMessage = (err.response.data as { message?: string }).message || 'Câu hỏi không hợp lệ!';
                    } else if (err.response.status === 503) {
                        errorMessage = 'Máy chủ của Minto Bot đang bận. Vui lòng thử lại sau vài phút nhé! 😊';
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }
            } else if (err instanceof Error) {
                // Handle non-Axios errors
                errorMessage = err.message;
            }

            setError(errorMessage);
            setMessages((prev) => [...prev, { text: errorMessage, isUser: false, displayedText: '' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setInput((prev) => prev + '\n');
        }
    };

    // Hiệu ứng gõ chữ
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.isUser && lastMessage.displayedText !== lastMessage.text) {
            const timer = setInterval(() => {
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const currentMessage = newMessages[newMessages.length - 1];
                    if (currentMessage.displayedText!.length < currentMessage.text.length) {
                        currentMessage.displayedText = currentMessage.text.slice(
                            0,
                            currentMessage.displayedText!.length + 1
                        );
                        return newMessages;
                    } else {
                        clearInterval(timer);
                        return prev;
                    }
                });
            }, 10);
            return () => clearInterval(timer);
        }
    }, [messages]);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        const answerDiv = document.querySelector(`.${styles.answer}`);
        if (answerDiv) {
            answerDiv.scrollTop = answerDiv.scrollHeight;
        }
    }, [messages, isLoading, error]);

    // Handle close with animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false); // Reset for next open
        }, 300); // Match animation duration
    };

    return (
        <div className={`${styles.gemini_reply} ${isClosing ? styles.closing : styles.opening}`}>
            <button className={styles.close_button} onClick={handleClose}>
                ✕
            </button>
            <div className={styles.model}>
                <div className={styles.wrapper}>
                    <div className={styles.answer}>
                        {messages.length === 0 && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <img src="/images/logo.png" alt="Minto Bot" className={styles.botLogo} />
                                <div className={styles.messageContent}>
                                    Hi, Tôi là Minto Bot! Bạn cần mình giúp gì về thiệp cưới hay nhận hỷ nào? 😊
                                </div>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${message.isUser ? styles.userMessage : styles.botMessage}`}
                            >
                                {!message.isUser && (
                                    <img src="/images/logo.png" alt="Minto Bot" className={styles.botLogo} />
                                )}
                                <div className={styles.messageContent}>
                                    {message.isUser ? (
                                        message.text
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: message.displayedText || '' }} />
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <img src="/images/logo.png" alt="Minto Bot" className={styles.botLogo} />
                                <div className={styles.messageContent}>Đang trả lời...</div>
                            </div>
                        )}
                        {error && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <img src="/images/logo.png" alt="Minto Bot" className={styles.botLogo} />
                                <div className={styles.messageContent}>{error}</div>
                            </div>
                        )}
                    </div>
                    <div className={styles.input_question}>
                        <textarea
                            placeholder="Hỏi Minto Bot ..."
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            rows={3}
                            style={{
                                resize: 'vertical',
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                            }}
                            maxLength={1000}
                        />
                        <IoSend
                            onClick={handleSend}
                            className={`${styles.sendIcon} ${isLoading ? styles.disabled : ''}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiReply;
