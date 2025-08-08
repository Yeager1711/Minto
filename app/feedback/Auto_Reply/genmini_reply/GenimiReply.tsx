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
import Popup from 'app/popup/template_details/Template_Details';

// Define interfaces for type safety
interface GeminiTemplate {
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

// Interface compatible with Popup component
interface PopupTemplate {
    template_id: number;
    name: string;
    image_url: string;
    price: number;
    description?: string;
    status: string;
    link?: string;
    category: {
        category_id: number;
        category_name: string;
    };
}

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isTyping?: boolean; // mới: đánh dấu message còn đang typing
    templates?: GeminiTemplate[];
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
    const [isUserScrollingUp, setIsUserScrollingUp] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<PopupTemplate | null>(null);

    // refs
    const answerRef = React.useRef<HTMLDivElement | null>(null);
    const textSpanRefs = React.useRef<Record<string, HTMLSpanElement | null>>({});
    const typingTimerRef = React.useRef<number | null>(null);

    // utils
    const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const escapeHtml = (unsafe: string) =>
        unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    const mapToPopupTemplate = (template: GeminiTemplate): PopupTemplate => ({
        template_id: template.id,
        name: template.name,
        image_url: template.imageSource || template.imageUrl || '/images/fallback.png',
        price: template.price,
        description: template.description,
        status: template.status,
        link: undefined,
        category: {
            category_id: 0, // Default or fallback category ID
            category_name: 'Unknown', // Default or fallback category name
        },
    });

    const handleProductClick = (template: GeminiTemplate) => {
        setSelectedProduct(mapToPopupTemplate(template));
    };

    const handleClosePopup = () => {
        setSelectedProduct(null);
    };

    const handleCloseGeminiReply = (): void => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSend = async (): Promise<void> => {
        if (!input.trim() || !apiUrl) return;

        const userId = genId();
        setMessages((prev) => [...prev, { id: userId, text: input, isUser: true }]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const accessToken: string | null = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Bạn cần đăng nhập để sử dụng Minto Bot!');
            }

            const response = await axios.post<{ response: string | GeminiTemplate[] }>(
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
            let templates: GeminiTemplate[] | undefined = undefined;

            if (Array.isArray(responseData)) {
                templates = responseData;
                console.log('Received templates:', JSON.stringify(templates, null, 2)); // Debug log
            }

            // Bot message: set isTyping true so effect will type it (either DOM-typing or template revealing)
            const botId = genId();
            setMessages((prev) => [
                ...prev,
                {
                    id: botId,
                    text: templates ? '' : (responseData as string),
                    isUser: false,
                    isTyping: true,
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
            const errId = genId();
            setMessages((prev) => [...prev, { id: errId, text: errorMessage, isUser: false, isTyping: false }]);
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

    // Auto-scroll handling (kept improved)
    useEffect(() => {
        const answerDiv = answerRef.current;
        if (!answerDiv) return;

        const handleScroll = () => {
            const isAtBottom = answerDiv.scrollHeight - answerDiv.scrollTop - answerDiv.clientHeight < 50;
            setIsUserScrollingUp(!isAtBottom);
        };

        answerDiv.addEventListener('scroll', handleScroll);
        return () => answerDiv.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!answerRef.current || isUserScrollingUp) return;

        // Đợi browser render xong layout — requestAnimationFrame giúp mượt hơn
        requestAnimationFrame(() => {
            answerRef.current?.scrollTo({
                top: answerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        });
    }, [messages.length, isLoading, error, isUserScrollingUp]);

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

    // Typing effect for the "last" bot message:
    // - If templates: reveal templates by incrementing displayedTemplates in state
    // - Else: perform DOM-based typing into the span ref to avoid re-rendering span
    const lastMessage = messages.length ? messages[messages.length - 1] : null;
    const lastMessageId = lastMessage?.id ?? null;

    useEffect(() => {
        // cleanup previous timer if any
        if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        if (!lastMessage || lastMessage.isUser || !lastMessage.isTyping) return;

        // If this message has templates -> reveal them one by one in state
        if (lastMessage.templates && lastMessage.templates.length > 0) {
            typingTimerRef.current = window.setInterval(() => {
                setMessages((prev) => {
                    const newMsgs = [...prev];
                    const idx = newMsgs.findIndex((m) => m.id === lastMessage.id);
                    if (idx === -1) {
                        if (typingTimerRef.current) {
                            clearInterval(typingTimerRef.current);
                            typingTimerRef.current = null;
                        }
                        return prev;
                    }
                    const msg = newMsgs[idx];
                    const current = msg.displayedTemplates ?? 0;
                    if (current < (msg.templates?.length ?? 0)) {
                        msg.displayedTemplates = current + 1;
                        return newMsgs;
                    } else {
                        // done, mark isTyping false and clear timer
                        msg.isTyping = false;
                        if (typingTimerRef.current) {
                            clearInterval(typingTimerRef.current);
                            typingTimerRef.current = null;
                        }
                        return newMsgs;
                    }
                });
            }, 250); // tốc độ hiện template (ms)
            return () => {
                if (typingTimerRef.current) {
                    clearInterval(typingTimerRef.current);
                    typingTimerRef.current = null;
                }
            };
        }

        // Else: plain text -> DOM typing
        const plain = lastMessage.text || '';
        let idx = 0;
        // start after a frame to ensure ref exists
        requestAnimationFrame(() => {
            typingTimerRef.current = window.setInterval(() => {
                idx++;
                const span = textSpanRefs.current[lastMessage.id];
                if (span) {
                    const partial = plain.slice(0, idx);
                    span.innerHTML = escapeHtml(formatText(partial)).replace(/\n/g, '<br/>');
                }
                if (idx >= plain.length) {
                    // finish
                    if (typingTimerRef.current) {
                        clearInterval(typingTimerRef.current);
                        typingTimerRef.current = null;
                    }
                    // mark message as not typing (so future renders will show full HTML)
                    setMessages((prev) => prev.map((m) => (m.id === lastMessage.id ? { ...m, isTyping: false } : m)));
                }
            }, 10); // tốc độ gõ chữ (ms)
        });

        return () => {
            if (typingTimerRef.current) {
                clearInterval(typingTimerRef.current);
                typingTimerRef.current = null;
            }
        };
        // chỉ chạy khi lastMessageId thay đổi
    }, [lastMessageId]);

    useEffect(() => {
        // Vô hiệu hóa scroll của body khi popup mở
        document.body.style.overflow = 'hidden';

        // Khôi phục scroll khi popup đóng
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className={`${styles.gemini_reply} ${isClosing ? styles.closing : styles.opening}`}>
            <button className={styles.close_button} onClick={handleCloseGeminiReply} aria-label="Close chat">
                ✕
            </button>
            <div className={styles.model}>
                <div className={styles.wrapper}>
                    <div className={styles.answer} ref={answerRef}>
                        {messages.length === 0 && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <img src="/images/logo.png" alt="Minto Bot" className={styles.botLogo} />
                                <div className={styles.messageContent}>
                                    Hi, mình là Minto Bot nè! Bạn cần mình giúp gì về thiệp cưới hay nhận hỷ nào? 😊
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`${styles.message} ${message.isUser ? styles.userMessage : styles.botMessage}`}
                            >
                                {!message.isUser && (
                                    <img src="/images/logo.png" alt="Minto Bot" className={styles.botLogo} />
                                )}
                                <div className={styles.messageContent}>
                                    {message.isUser ? (
                                        // user message (plain)
                                        <span>{message.text}</span>
                                    ) : message.templates ? (
                                        // templates + swiper (renders only displayedTemplates)
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
                                                            <div
                                                                className={styles.templateCard}
                                                                onClick={() => handleProductClick(template)}
                                                            >
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
                                        // plain bot text
                                        <>
                                            {message.isTyping ? (
                                                // typing: single span, updated via ref (no rerender of span text)
                                                <span
                                                    ref={(el) => {
                                                        textSpanRefs.current[message.id] = el;
                                                    }}
                                                />
                                            ) : (
                                                // finished typing: render final HTML once
                                                <span
                                                    ref={(el) => {
                                                        textSpanRefs.current[message.id] = el;
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: escapeHtml(formatText(message.text || '')).replace(
                                                            /\n/g,
                                                            '<br/>'
                                                        ),
                                                    }}
                                                />
                                            )}
                                        </>
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
            {selectedProduct && <Popup product={selectedProduct} onClose={handleClosePopup} />}
        </div>
    );
};

export default GeminiReply;
