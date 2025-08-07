'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { IoSend } from 'react-icons/io5';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './gemini_reply.module.css';

// Define interfaces for type safety
interface Template {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
    features: string[];
    imageSource?: string;
    music?: string;
    imageUrl?: string;
}

interface Message {
    text: string;
    isUser: boolean;
    displayedText?: string;
    templates?: Template[];
    displayedTemplates?: number; // Số template đã hiển thị
}

interface GeminiReplyProps {
    onClose: () => void;
}

interface Env {
    NEXT_PUBLIC_APP_API_BASE_URL?: string;
}

declare const process: {
    env: Env;
};

const apiUrl: string | undefined = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const GeminiReply: React.FC<GeminiReplyProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    const handleSend = async (): Promise<void> => {
        if (!input.trim() || !apiUrl) return;

        setMessages((prev) => [...prev, { text: input, isUser: true }]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const accessToken: string | null = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Bạn cần đăng nhập để sử dụng Minto Bot!');
            }

            const response = await axios.post<{ response: string | Template[] }>(
                `${apiUrl}/ai/ask-minto`,
                { question: input },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const responseData = response.data.response;
            let templates: Template[] | undefined = undefined;

            if (Array.isArray(responseData)) {
                templates = responseData;
                console.log('Received templates:', JSON.stringify(templates, null, 2)); // Debug log
            }

            setMessages((prev) => [
                ...prev,
                {
                    text: templates ? '' : (responseData as string),
                    isUser: false,
                    displayedText: '',
                    templates,
                    displayedTemplates: templates ? 0 : undefined,
                },
            ]);
        } catch (err: unknown) {
            let errorMessage: string = 'Có lỗi xảy ra khi gọi Minto Bot. Vui lòng thử lại!';
            if (err instanceof AxiosError) {
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
                errorMessage = err.message;
            }

            setError(errorMessage);
            setMessages((prev) => [...prev, { text: errorMessage, isUser: false, displayedText: '' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setInput((prev) => prev + '\n');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setInput(e.target.value);
    };

    useEffect(() => {
        const lastMessage: Message | undefined = messages[messages.length - 1];
        if (lastMessage && !lastMessage.isUser) {
            let timer: NodeJS.Timeout;
            const startTypingEffect = () => {
                timer = setInterval(() => {
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const currentMessage = newMessages[newMessages.length - 1];

                        // Hiệu ứng chạm chậm cho text
                        if (!currentMessage.templates && currentMessage.displayedText !== currentMessage.text) {
                            if (currentMessage.displayedText!.length < currentMessage.text.length) {
                                currentMessage.displayedText = currentMessage.text.slice(
                                    0,
                                    currentMessage.displayedText!.length + 1
                                );
                                return newMessages;
                            }
                        }

                        // Hiệu ứng chạm chậm cho templates
                        if (currentMessage.templates && currentMessage.displayedTemplates !== undefined) {
                            if (currentMessage.displayedTemplates! < currentMessage.templates.length) {
                                currentMessage.displayedTemplates = Math.min(
                                    currentMessage.displayedTemplates! + 1,
                                    currentMessage.templates.length
                                );
                                return newMessages;
                            }
                        }

                        // Dừng timer khi hoàn thành
                        if (
                            (!currentMessage.templates || currentMessage.displayedText === currentMessage.text) &&
                            (!currentMessage.templates ||
                                currentMessage.displayedTemplates === currentMessage.templates.length)
                        ) {
                            clearInterval(timer);
                        }
                        return newMessages;
                    });
                }, 10); // Tốc độ gõ chữ (50ms cho mỗi ký tự hoặc template)
            };

            startTypingEffect();
            return () => clearInterval(timer);
        }
    }, [messages]);

    useEffect(() => {
        const answerDiv = document.querySelector(`.${styles.answer}`);
        if (answerDiv) {
            // Only scroll to bottom if the user is near the bottom
            const isNearBottom = answerDiv.scrollHeight - answerDiv.scrollTop <= answerDiv.clientHeight + 100;
            if (isNearBottom) {
                answerDiv.scrollTo({
                    top: answerDiv.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }
    }, [messages, isLoading, error]);

    const handleClose = (): void => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const formatText = (text: string): string => {
        return (
            text
                // Thêm xuống dòng sau dấu :
                .replace(/:\s*/g, ':\n')
                // Thêm xuống dòng sau dấu *
                .replace(/\*\s*/g, '\n• ')
                // Thêm xuống dòng trước các số thứ tự (1. 2. 3.)
                .replace(/(?<!\n)(\d+\.\s)/g, '\n$1')
                // Thêm xuống dòng trước dấu gạch đầu dòng
                .replace(/(?<!\n)(-\s)/g, '\n$1')
        );
    };

    return (
        <div className={`${styles.gemini_reply} ${isClosing ? styles.closing : styles.opening}`}>
            <button className={styles.close_button} onClick={handleClose} aria-label="Close chat">
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
                                    ) : message.templates ? (
                                        <>
                                            <span>
                                                Mình đã tìm thấy một vài template thiệp cưới phù hợp với sở thích của
                                                bạn:
                                            </span>
                                            <Swiper
                                                modules={[Navigation, Pagination]}
                                                spaceBetween={10}
                                                pagination={{ clickable: true }}
                                                slidesPerView={2.5}
                                                className={styles.swiper}
                                            >
                                                {message.templates
                                                    .slice(0, message.displayedTemplates || 0)
                                                    .map((template, idx) => (
                                                        <SwiperSlide key={idx} className={styles.swiperSlide}>
                                                            <div className={styles.templateCard}>
                                                                <div className={styles.image}>
                                                                    {template.imageSource || template.imageUrl ? (
                                                                        <img
                                                                            src={
                                                                                template.imageSource ||
                                                                                template.imageUrl
                                                                            }
                                                                            alt={template.name}
                                                                            className={styles.templateImage}
                                                                        />
                                                                    ) : (
                                                                        <div className={styles.imagePlaceholder}>
                                                                            Không có ảnh
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <h3>{template.name}</h3>
                                                                <p>
                                                                    <strong>Giá:</strong>{' '}
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND',
                                                                    }).format(template.price)}
                                                                </p>

                                                                {template.music && (
                                                                    <p>
                                                                        <strong>Music:</strong> {template.music}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </SwiperSlide>
                                                    ))}
                                            </Swiper>
                                            {message.displayedTemplates === message.templates?.length && (
                                                <span>Bạn muốn biết thêm chi tiết về mẫu nào không? 😊</span>
                                            )}
                                        </>
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: formatText(message.displayedText || '').replace(/\n/g, '<br/>'),
                                            }}
                                        />
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
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={handleInputChange}
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
                            aria-label="Chat input"
                        />
                        <IoSend
                            onClick={handleSend}
                            className={`${styles.sendIcon} ${isLoading ? styles.disabled : ''}`}
                            aria-label="Send message"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiReply;
