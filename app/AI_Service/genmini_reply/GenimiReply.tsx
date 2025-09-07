'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { FaRegCopy } from 'react-icons/fa';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import styles from './gemini_reply.module.css';
import { showToastSuccess } from 'app/Ultils/toast';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';

// Khai báo interface mở rộng cho Window để xử lý MSStream
declare global {
    interface Window {
        MSStream?: unknown;
    }
}

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isTyping?: boolean;
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
    useDisableDevTools();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [isUserScrollingUp, setIsUserScrollingUp] = useState<boolean>(false);

    // refs
    const answerRef = useRef<HTMLDivElement | null>(null);
    const textSpanRefs = useRef<Record<string, HTMLSpanElement | null>>({});
    const typingTimerRef = useRef<number | null>(null);
    const inputQuestionRef = useRef<HTMLDivElement | null>(null);

    // --- utilities ---
    const genId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const escapeHtml = (unsafe: string): string =>
        unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    const normalizeHtmlAnchorsInText = (text: string): string => {
        if (!text) return text;
        let t = text;

        t = t.replace(/\[([^\]]+)\]\(\s*<a[^>]*href=(?:'|")([^'"]+)(?:'|")[^>]*>.*?<\/a>\s*\)/gi, '[$1]($2)');
        t = t.replace(/\[([^\]]+)\]\(\s*<a[^>]*href=(?:'|")([^'"]+)(?:'|")[^>]*>\s*<\/a>\s*\)/gi, '[$1]($2)');
        t = t.replace(/<a[^>]*href=(?:'|")([^'"]+)(?:'|")[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

        return t;
    };

    const cleanTextFromUrls = (text: string): { cleanedText: string; links: string[] } => {
        const urlRegex = /https?:\/\/[^\s<]+/g;
        const links = text.match(urlRegex) || [];
        const cleanedText = text.replace(urlRegex, '').trim();
        return { cleanedText, links };
    };

    const formatText = (text: string): string => {
        return text
            .replace(/(?<!^)\*\s*/g, '\n• ')
            .replace(/(?<!\n)(\d+\.\s)/g, '\n$1')
            .replace(/(?<!\n)(-\s)/g, '\n$1')
            .replace(/:\s*$/gm, '')
            .replace(/^\s*[-•◦●○■□▲▼*+.→←–—]\s*$/gm, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    };

    const extractCoordinates = (text: string): string | null => {
        const coordRegex = /\(\s*([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)\s*\)/;
        const match = text.match(coordRegex);
        return match ? `(${match[1]}, ${match[2]})` : null;
    };

    // --- lifecycle & DOM interactions ---
    useEffect(() => {
        const inputQuestion = inputQuestionRef.current;
        const textarea = inputQuestion?.querySelector('textarea');

        if (!inputQuestion || !textarea) return;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        const handleFocus = () => {
            inputQuestion.classList.add(styles.focused);
            if (isIOS && window.visualViewport) {
                const viewportHeight = window.visualViewport.height;
                const textareaRect = textarea.getBoundingClientRect();
                if (textareaRect.bottom > viewportHeight) {
                    window.scrollTo({
                        top: window.scrollY + textareaRect.bottom - viewportHeight + 20,
                        behavior: 'smooth',
                    });
                }
            } else {
                window.scrollTo({
                    top: inputQuestion.offsetTop - 120,
                    behavior: 'smooth',
                });
            }
        };

        const handleBlur = () => {
            inputQuestion.classList.remove(styles.focused);
        };

        const handleViewportChange = () => {
            if (isIOS && window.visualViewport && document.activeElement === textarea) {
                const viewportHeight = window.visualViewport.height;
                const textareaRect = textarea.getBoundingClientRect();
                if (textareaRect.bottom > viewportHeight) {
                    window.scrollTo({
                        top: window.scrollY + textareaRect.bottom - viewportHeight + 20,
                        behavior: 'smooth',
                    });
                }
            }
        };

        textarea.addEventListener('focus', handleFocus);
        textarea.addEventListener('blur', handleBlur);
        if (isIOS && window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        }

        return () => {
            textarea.removeEventListener('focus', handleFocus);
            textarea.removeEventListener('blur', handleBlur);
            if (isIOS && window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
            }
        };
    }, []);

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
        requestAnimationFrame(() => {
            answerRef.current?.scrollTo({
                top: answerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        });
    }, [messages.length, isLoading, error, isUserScrollingUp]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Typing animation for last bot message
    const lastMessage = messages.length ? messages[messages.length - 1] : null;
    const lastMessageId = lastMessage?.id ?? null;

    useEffect(() => {
        if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        if (!lastMessage || lastMessage.isUser || !lastMessage.isTyping) return;

        const plain = lastMessage.text || '';
        let idx = 0;

        requestAnimationFrame(() => {
            typingTimerRef.current = window.setInterval(() => {
                idx++;
                const span = textSpanRefs.current[lastMessage.id];
                if (span) {
                    const partial = plain.slice(0, idx);
                    span.innerHTML = escapeHtml(formatText(partial)).replace(/\n/g, '<br/>');
                }
                if (idx >= plain.length) {
                    if (typingTimerRef.current) {
                        clearInterval(typingTimerRef.current);
                        typingTimerRef.current = null;
                    }
                    setMessages((prev) => prev.map((m) => (m.id === lastMessage.id ? { ...m, isTyping: false } : m)));
                }
            }, 10);
        });

        return () => {
            if (typingTimerRef.current) {
                clearInterval(typingTimerRef.current);
                typingTimerRef.current = null;
            }
        };
    }, [lastMessage, lastMessageId]);

    // --- handlers ---
    const handleCloseGeminiReply = (): void => {
        setIsClosing(true);

        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            axios
                .post(
                    `${apiUrl}/ai/end-session`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                )
                .catch((err) => console.error('Failed to end session:', err));
        }

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

            const response = await axios.post<{ response: string }>(
                `${apiUrl}/ai/ask-minto`,
                { question: input },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const normalized = normalizeHtmlAnchorsInText(response.data.response || '');
            const botId = genId();
            setMessages((prev) => [
                ...prev,
                {
                    id: botId,
                    text: normalized,
                    isUser: false,
                    isTyping: true,
                },
            ]);
        } catch (err: unknown) {
            let errorMessage: string = 'Có lỗi xảy ra khi gọi Minto Bot. Vui lòng thử lại!';

            if (err instanceof AxiosError) {
                if (err.response) {
                    if (err.response.status === 401) {
                        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
                    } else if (err.response.status === 400) {
                        const serverMessage = (err.response.data as { message?: string }).message || '';
                        if (serverMessage.includes('vulgar[555]')) {
                            errorMessage =
                                'Tài khoản của bạn đã bị tạm khóa 24 giờ do sử dụng từ ngữ không phù hợp. Vui lòng liên hệ Admin qua Zalo: 0333 xxxx 892 để được hỗ trợ.';
                        } else {
                            errorMessage = serverMessage || 'Câu hỏi không hợp lệ!';
                        }
                    } else if (err.response.status === 503) {
                        errorMessage =
                            'Xin lỗi, hiện tại máy chủ Minto Bot đang quá tải hoặc bận xử lý nhiều yêu cầu. Anh/Chị vui lòng thử lại sau ít phút nhé! 🙏😊';
                    }
                } else if (err.message) {
                    if (err.message.includes('overloaded') || err.message.includes('Service Unavailable')) {
                        errorMessage =
                            'Hiện tại Minto Bot đang gặp sự cố kết nối với máy chủ. Anh/Chị vui lòng thử lại sau ít phút nhé! 🚧';
                    } else {
                        errorMessage = err.message;
                    }
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
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!e.shiftKey) {
                handleSend();
            } else {
                setInput((prev) => prev + '\n');
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setInput(e.target.value);
    };

    const handleCopy = (text: string): void => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showToastSuccess('Đã copy tọa độ');
            })
            .catch((err) => {
                console.error('Failed to copy text:', err);
            });
    };

    // --- render ---
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
                                <div className={styles.messageContent_bot_intro}>
                                    Wellcome to AI
                                    <div className={styles.loader}>
                                        <div
                                            className={`${styles.loader__inner} ${styles['loader__inner--one']}`}
                                        ></div>
                                        <div
                                            className={`${styles.loader__inner} ${styles['loader__inner--two']}`}
                                        ></div>
                                        <div
                                            className={`${styles.loader__inner} ${styles['loader__inner--three']}`}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`${styles.message} ${message.isUser ? styles.userMessage : styles.botMessage}`}
                            >
                                {!message.isUser && (
                                    <Image
                                        src="/images/logo.png"
                                        alt="Minto Bot"
                                        width={40}
                                        height={40}
                                        className={styles.botLogo}
                                    />
                                )}

                                <div
                                    className={message.isUser ? styles.messageContent_user : styles.messageContent_bot}
                                >
                                    {message.isUser ? (
                                        <span>{message.text}</span>
                                    ) : (
                                        <>
                                            {message.isTyping ? (
                                                <span
                                                    ref={(el) => {
                                                        textSpanRefs.current[message.id] = el;
                                                    }}
                                                />
                                            ) : (
                                                <>
                                                    {message.text?.includes('Tọa độ từ link Anh/Chị cung cấp là') ? (
                                                        <>
                                                            <ReactMarkdown
                                                                components={{
                                                                    a: ({ ...props }) => (
                                                                        <a
                                                                            {...props}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.link}
                                                                        />
                                                                    ),
                                                                }}
                                                            >
                                                                {formatText(message.text)}
                                                            </ReactMarkdown>

                                                            {extractCoordinates(message.text) && (
                                                                <div
                                                                    className={styles.cp_coordinates}
                                                                    onClick={() =>
                                                                        handleCopy(
                                                                            extractCoordinates(message.text) || ''
                                                                        )
                                                                    }
                                                                >
                                                                    <FaRegCopy
                                                                        style={{ cursor: 'pointer' }}
                                                                        title="Copy tọa độ"
                                                                    />
                                                                    {extractCoordinates(message.text)}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ReactMarkdown
                                                                components={{
                                                                    a: ({ ...props }) => (
                                                                        <a
                                                                            {...props}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.link}
                                                                        />
                                                                    ),
                                                                }}
                                                            >
                                                                {formatText(message.text || '')}
                                                            </ReactMarkdown>

                                                            {cleanTextFromUrls(message.text || '').links.length > 0 && (
                                                                <a
                                                                    href={
                                                                        cleanTextFromUrls(message.text || '').links[0]
                                                                    }
                                                                    className={styles.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Nhấn để xem
                                                                </a>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <div className={styles.botLogo_thinking}>
                                    <div className={styles.loader}>
                                        <div
                                            className={`${styles.loader__inner} ${styles['loader__inner--one']}`}
                                        ></div>
                                        <div
                                            className={`${styles.loader__inner} ${styles['loader__inner--two']}`}
                                        ></div>
                                        <div
                                            className={`${styles.loader__inner} ${styles['loader__inner--three']}`}
                                        ></div>
                                    </div>
                                    <Image src="/images/logo.png" alt="Minto Bot" width={40} height={40} />
                                </div>
                                <div style={{ marginTop: '1rem' }}> Đang suy nghĩ....</div>
                            </div>
                        )}

                        {error && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <Image
                                    src="/images/logo.png"
                                    alt="Minto Bot"
                                    width={40}
                                    height={40}
                                    className={styles.botLogo}
                                />
                                <div className={styles.messageContent_bot}>{error}</div>
                            </div>
                        )}
                    </div>

                    <div className={styles.input_question} ref={inputQuestionRef}>
                        <div className={styles.textareaWrapper}>
                            <textarea
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                rows={3}
                                maxLength={1000}
                                aria-label="Chat input"
                            />
                            <FontAwesomeIcon
                                onClick={handleSend}
                                className={`${styles.sendIcon} ${isLoading ? styles.disabled : ''}`}
                                aria-label="Send message"
                                icon={faChevronCircleUp}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiReply;
