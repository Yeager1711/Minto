'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { IoSend } from 'react-icons/io5';
import { FaRegCopy } from 'react-icons/fa';
import styles from './gemini_reply.module.css';
import { showToastSuccess } from 'app/Ultils/toast';

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
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [isUserScrollingUp, setIsUserScrollingUp] = useState(false);

    // refs
    const answerRef = useRef<HTMLDivElement | null>(null);
    const textSpanRefs = useRef<Record<string, HTMLSpanElement | null>>({});
    const typingTimerRef = useRef<number | null>(null);
    const inputQuestionRef = useRef<HTMLDivElement | null>(null);

    // Handle textarea focus and blur to toggle the focused class
    useEffect(() => {
        const inputQuestion = inputQuestionRef.current;
        const textarea = inputQuestion?.querySelector('textarea');

        if (!inputQuestion || !textarea) return;

        const handleFocus = () => {
            inputQuestion.classList.add(styles.focused);
        };

        const handleBlur = () => {
            inputQuestion.classList.remove(styles.focused);
        };

        textarea.addEventListener('focus', handleFocus);
        textarea.addEventListener('blur', handleBlur);

        return () => {
            textarea.removeEventListener('focus', handleFocus);
            textarea.removeEventListener('blur', handleBlur);
        };
    }, []);

    // utils
    const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const escapeHtml = (unsafe: string) =>
        unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

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

            const botId = genId();
            setMessages((prev) => [
                ...prev,
                {
                    id: botId,
                    text: response.data.response,
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
    }, [lastMessageId]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showToastSuccess('Đã copy tọa độ');
            })
            .catch((err) => {
                console.error('Failed to copy text:', err);
            });
    };

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
                                <div className={styles.messageContent_bot}>
                                    Hi, em là Minto Bot nè! Anh/Chị cần em giúp gì đóa? 😊
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
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: escapeHtml(
                                                                        formatText(message.text || '')
                                                                    ).replace(/\n/g, '<br/>'),
                                                                }}
                                                            />
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
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: escapeHtml(
                                                                        formatText(
                                                                            cleanTextFromUrls(message.text).cleanedText
                                                                        )
                                                                    ).replace(/\n/g, '<br/>'),
                                                                }}
                                                            />
                                                            {cleanTextFromUrls(message.text).links.map((link, idx) => (
                                                                <div key={idx}>
                                                                    <a
                                                                        href={link}
                                                                        className={styles.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Nhấn để xem TikTok của Minto
                                                                    </a>
                                                                </div>
                                                            ))}
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
                                    <img src="/images/logo.png" alt="Minto Bot" />
                                </div>
                                <div style={{ marginTop: '1rem' }}> Đang suy nghĩ....</div>
                            </div>
                        )}
                        {error && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <img src="/images/logo.png" alt="Minto Bot" className={styles.botLogo} />
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
                        </div>
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
