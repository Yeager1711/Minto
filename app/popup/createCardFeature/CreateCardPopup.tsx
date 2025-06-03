'use client';
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import styles from './CreateCardPopup.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faXmark, faQrcode, faDownload } from '@fortawesome/free-solid-svg-icons';
import { showToastSuccess } from 'app/Ultils/toast';
import { useApi } from '../../lib/apiContext/apiContext';
import { useSwipeable } from 'react-swipeable';

interface CreateCardPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { bank: string; accountNumber: string; accountHolder: string; qrCodeUrl?: string }) => void;
}

interface Bank {
    id: string;
    name: string;
    logo?: string;
    bin?: string;
    short_name?: string;
    code?: string;
}

interface BankApiResponse {
    data: Bank[];
}

interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: Date;
    status: string;
}

const CreateCardPopup: React.FC<CreateCardPopupProps> = ({ isOpen, onClose, onSubmit }) => {
    const api = useApi();
    const [bank, setBank] = useState<string>('');
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [accountHolder, setAccountHolder] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [showQr, setShowQr] = useState<boolean>(false);
    const [isQrCreated, setIsQrCreated] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [showWrapperMobile, setShowWrapperMobile] = useState<boolean>(true);
    const wasOpenedRef = useRef<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoadingBanks(true);
            const fetchBanks = async () => {
                try {
                    const response = await fetch('https://api.vietqr.io/v1/banks', {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`Lỗi tải danh sách ngân hàng: ${response.status}`);
                    }
                    const data: BankApiResponse = await response.json();
                    const enhancedBanks = data.data.map((bank) => ({
                        ...bank,
                        short_name: bank.short_name || bank.code || bank.bin || 'UNKNOWN',
                    }));
                    setBanks([{ id: '', name: 'Chọn ngân hàng', logo: '', bin: '', short_name: '' }, ...enhancedBanks]);
                } catch (err: unknown) {
                    const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách ngân hàng';
                    setError(errorMessage);
                } finally {
                    setIsLoadingBanks(false);
                }
            };
            fetchBanks();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            wasOpenedRef.current = true;
            setIsAnimatingOut(false);
            setBank('');
            setAccountNumber('');
            setAccountHolder('');
            setError('');
            setQrCodeUrl(null);
            setShowQr(false);
            setIsQrCreated(false);
            setIsExpanded(false);
            setShowWrapperMobile(true);
        } else if (wasOpenedRef.current) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setIsAnimatingOut(false);
                wasOpenedRef.current = false;
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const generateQRCode = async (bankBin: string | undefined, accountNumber: string, accountHolder: string) => {
        const selectedBank = banks.find((b) => b.id === bank);
        const bankShortName = selectedBank?.short_name || 'UNKNOWN';

        if (bankShortName === 'UNKNOWN' && bank) {
            throw new Error(`Ngân hàng ${selectedBank?.name} hiện không được hỗ trợ để tạo mã QR`);
        }

        const qrString = `https://qr.sepay.vn/img?acc=${encodeURIComponent(accountNumber)}&bank=${encodeURIComponent(bankShortName)}&amount=0&des=${encodeURIComponent(`Thanh toán cho ${accountHolder}`)}&template=TEM&download=DOWNLOAD`;
        setQrCodeUrl(qrString);
        return qrString;
    };

    const handleCreateCardClick = async () => {
        setError('');
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsVerifying(true);
        try {
            const selectedBank = banks.find((b) => b.id === bank);
            const qrUrl = await generateQRCode(selectedBank?.bin, accountNumber, accountHolder);

            const savedQr: QrResponse = await api.createQr({
                bank: bank || 'Không chọn ngân hàng',
                accountNumber,
                accountHolder,
                qrCodeUrl: qrUrl,
            });

            setQrCodeUrl(savedQr.qrCodeUrl);
            onSubmit({
                bank: savedQr.bank,
                accountNumber: savedQr.accountNumber,
                accountHolder: savedQr.accountHolder,
                qrCodeUrl: savedQr.qrCodeUrl,
            });
            setIsQrCreated(true);
            showToastSuccess('Tạo thẻ thành công');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tạo thẻ. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    const validateInputs = () => {
        if (!accountNumber || accountNumber.length < 6 || accountNumber.length > 20) {
            return 'Số tài khoản phải có từ 6 đến 20 chữ số';
        }
        if (!accountHolder || accountHolder.length < 3) return 'Tên chủ tài khoản không hợp lệ';
        if (/[^A-Za-z\s]/.test(accountHolder)) return 'Tên chủ tài khoản chỉ được chứa chữ cái và khoảng trắng';
        return '';
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatAccountNumber = (number: string): string => {
        const cleaned = number.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const formatOptionLabel = ({ name, logo }: Bank): JSX.Element => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {logo ? (
                <img
                    src={logo}
                    alt={name}
                    style={{
                        width: '4rem',
                        height: '4rem',
                        objectFit: 'contain',
                    }}
                />
            ) : (
                <div
                    style={{
                        width: '4rem',
                        height: '4rem',
                    }}
                />
            )}
            <span style={{ fontSize: '16px' }}>{name}</span>
        </div>
    );

    const selectedBank = banks.find((b) => b.id === bank);

    const toggleQrDisplay = () => {
        if (qrCodeUrl) {
            setShowQr(!showQr);
            setIsExpanded(!showQr);
            setShowWrapperMobile(showQr);
        }
    };

    const handleDownloadQr = () => {
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = 'qr-code.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (isQrCreated && qrCodeUrl) {
                setIsExpanded(true);
                setShowQr(true);
                setShowWrapperMobile(false);
            }
        },
        onSwipedRight: () => {
            if (isExpanded) {
                setIsExpanded(false);
                setShowQr(false);
                setShowWrapperMobile(true);
            }
        },
        trackMouse: true,
        delta: 10, // Sensitivity for swipe detection
    });

    if (!isOpen && !isAnimatingOut) return null;

    return (
        <div className={`${styles.popupOverlay} ${isOpen ? styles.animateIn : ''}`} onClick={handleOverlayClick}>
            {/* PC Interface */}
            <div
                className={`${styles.popupContainer} ${isOpen && !isAnimatingOut ? styles.animateContainer : ''} ${styles.pcOnly}`}
            >
                <div className={styles.wrapper_pc}>
                    <div className={styles.header}>
                        <span className={styles.brand}>⚡ Minto</span>
                        <button className={styles.closeButton} onClick={onClose}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                    <h3 className={styles.title}>Tạo QR tích hợp thẻ ngân hàng</h3>
                    <div className={styles.content}>
                        <div className={styles.left}>
                            <div className={styles.description}>
                                <h3>Thẻ tích hợp QR</h3>
                                <p>
                                    Tạo thẻ thanh toán với mã QR tích hợp sẵn, để khách mời quét và gửi tiền kèm lời
                                    chúc từ xa. Mã QR sẽ được tạo tự động ngay sau khi bạn nhập thông tin thẻ, đảm bảo
                                    giao dịch nhanh chóng và an toàn. Phù hợp cho mọi dịp lễ, sự kiện, hoặc giao dịch cá
                                    nhân.
                                </p>
                            </div>
                            <div className={styles.form}>
                                {error && <p className={styles.error}>{error}</p>}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        {isLoadingBanks ? (
                                            <div className={styles.input}>Đang tải danh sách ngân hàng...</div>
                                        ) : (
                                            <Select
                                                options={banks}
                                                getOptionLabel={(option: Bank) => option.name}
                                                getOptionValue={(option: Bank) => option.id}
                                                value={banks.find((option) => option.id === bank) || null}
                                                onChange={(option: Bank | null) => setBank(option?.id || '')}
                                                formatOptionLabel={formatOptionLabel}
                                                className={styles.reactSelect}
                                                classNamePrefix="react-select"
                                                placeholder="Chọn ngân hàng (không bắt buộc)"
                                                isDisabled={isLoadingBanks || isVerifying}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '4px',
                                                        minHeight: '80px',
                                                        fontSize: '16px',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        fontSize: '16px',
                                                    }),
                                                    option: (base) => ({
                                                        ...base,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '8px',
                                                        fontSize: '16px',
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        fontSize: '16px',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 9999,
                                                    }),
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.inputField}>
                                        <input
                                            type="text"
                                            placeholder="Số tài khoản"
                                            value={accountNumber}
                                            onChange={(e) =>
                                                setAccountNumber(e.target.value.replace(/\D/g, '').toUpperCase())
                                            }
                                            className={styles.input}
                                            required
                                            disabled={isVerifying}
                                        />
                                    </div>
                                    <div className={styles.inputField}>
                                        <input
                                            type="text"
                                            placeholder="Chủ tài khoản"
                                            value={accountHolder}
                                            onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                                            className={styles.input}
                                            required
                                            disabled={isVerifying}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.bankCardWrapper}>
                                {!showQr ? (
                                    <div className={styles.bank_card}>
                                        {selectedBank?.logo && bank ? (
                                            <img
                                                src={selectedBank.logo}
                                                alt={`${selectedBank.name} logo`}
                                                className={styles.bankLogo}
                                                style={{ maxWidth: '13rem', maxHeight: '50px' }}
                                            />
                                        ) : (
                                            <h3>{bank ? selectedBank?.name : 'Minto Feature'}</h3>
                                        )}
                                        <FontAwesomeIcon
                                            className={`${styles.qr_icon} ${qrCodeUrl ? styles.visible : ''}`}
                                            icon={faQrcode}
                                            onClick={toggleQrDisplay}
                                        />
                                        <h2>{accountNumber ? formatAccountNumber(accountNumber) : 'XXX XXX XXX'}</h2>
                                        <h4>{accountHolder || 'CLIENT NAME'}</h4>
                                    </div>
                                ) : (
                                    qrCodeUrl && (
                                        <div className={styles.qrDisplay}>
                                            <img src={qrCodeUrl} alt="Mã QR thanh toán" className={styles.qrImage} />
                                            <div className={styles.qrActions}>
                                                <button className={styles.downloadQrButton} onClick={handleDownloadQr}>
                                                    <FontAwesomeIcon icon={faDownload} /> Lưu QR
                                                </button>
                                                <button className={styles.closeQrButton} onClick={toggleQrDisplay}>
                                                    Đóng
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.footer}>
                        {!isQrCreated && (
                            <button
                                type="submit"
                                className={styles.submitButton}
                                onClick={handleCreateCardClick}
                                disabled={isVerifying || isLoadingBanks}
                            >
                                {isVerifying ? 'Đang xử lý...' : 'Tạo thẻ'} <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile and Tablet Interface */}
            <div className={styles.mobile_tablet}>
                <div className={`${styles.card_qr} ${isExpanded ? styles.expanded : ''}`} {...swipeHandlers}>
                    {!showQr ? (
                        <div className={styles.bank_card}>
                            {selectedBank?.logo && bank ? (
                                <img
                                    src={selectedBank.logo}
                                    alt={`${selectedBank.name} logo`}
                                    className={styles.bankLogo}
                                    style={{ maxWidth: '13rem', maxHeight: '50px' }}
                                />
                            ) : (
                                <h3>{bank ? selectedBank?.name : 'Minto Feature'}</h3>
                            )}
                            <FontAwesomeIcon
                                className={`${styles.qr_icon} ${qrCodeUrl ? styles.visible : ''}`}
                                icon={faQrcode}
                                onClick={toggleQrDisplay}
                            />
                            <h2>{accountNumber ? formatAccountNumber(accountNumber) : 'XXX XXX XXX'}</h2>
                            <h4>{accountHolder || 'CLIENT NAME'}</h4>
                        </div>
                    ) : (
                        qrCodeUrl && (
                            <div className={styles.qrDisplay}>
                                <img src={qrCodeUrl} alt="Mã QR thanh toán" className={styles.qrImage} />
                                <div className={styles.qrActions}>
                                    <button className={styles.downloadQrButton} onClick={handleDownloadQr}>
                                        <FontAwesomeIcon icon={faDownload} /> Lưu QR
                                    </button>
                                    <button className={styles.closeQrButton} onClick={toggleQrDisplay}>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
                {showWrapperMobile && (
                    <div className={styles.wrapper_mobile}>
                        <div className={styles.header}>
                            <span className={styles.brand}>⚡ Minto</span>
                            <button className={styles.closeButton} onClick={onClose}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <h3 className={styles.title}>Tạo QR tích hợp thẻ ngân hàng</h3>
                        <div className={styles.form}>
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    {isLoadingBanks ? (
                                        <div className={styles.input}>Đang tải danh sách ngân hàng...</div>
                                    ) : (
                                        <Select
                                            options={banks}
                                            getOptionLabel={(option: Bank) => option.name}
                                            getOptionValue={(option: Bank) => option.id}
                                            value={banks.find((option) => option.id === bank) || null}
                                            onChange={(option: Bank | null) => setBank(option?.id || '')}
                                            formatOptionLabel={formatOptionLabel}
                                            className={styles.reactSelect}
                                            classNamePrefix="react-select"
                                            placeholder="Chọn ngân hàng (không bắt buộc)"
                                            isDisabled={isLoadingBanks || isVerifying}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    padding: '4px',
                                                    minHeight: '4rem',
                                                    fontSize: '16px',
                                                }),
                                                singleValue: (base) => ({
                                                    ...base,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    fontSize: '16px',
                                                }),
                                                input: (base) => ({
                                                    ...base,
                                                    fontSize: '16px !important',
                                                }),
                                                placeholder: (base) => ({
                                                    ...base,
                                                    fontSize: '16px !important',
                                                }),
                                                option: (base) => ({
                                                    ...base,
                                                    fontSize: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '8px',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    )}
                                </div>
                                <div className={styles.inputField}>
                                    <input
                                        type="text"
                                        placeholder="Số tài khoản"
                                        value={accountNumber}
                                        onChange={(e) =>
                                            setAccountNumber(e.target.value.replace(/\D/g, '').toUpperCase())
                                        }
                                        className={styles.input}
                                        required
                                        disabled={isVerifying}
                                    />
                                </div>
                                <div className={styles.inputField}>
                                    <input
                                        type="text"
                                        placeholder="Chủ tài khoản"
                                        value={accountHolder}
                                        onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                                        className={styles.input}
                                        required
                                        disabled={isVerifying}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.footer}>
                            {!isQrCreated && (
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    onClick={handleCreateCardClick}
                                    disabled={isVerifying || isLoadingBanks}
                                >
                                    {isVerifying ? 'Đang xử lý...' : 'Tạo thẻ'} <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateCardPopup;
