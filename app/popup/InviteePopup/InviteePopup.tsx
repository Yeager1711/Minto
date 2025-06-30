'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './InviteePopup.module.css';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';

interface InviteePopupProps {
    templateId: string;
    quantity: number;
    onClose: () => void;
    id: string;
    weddingImages: { file: File; position: string }[];
}

const priceCardDefault = Number(process.env.NEXT_PUBLIC_PRICE_CARD) || 500;
const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;
const DiscountEligibility = Number(process.env.NEXT_PUBLIC_PRICE_CHECK_DISCOUNT_ELIGIBILITY) || 0.2; 

const InviteePopup: React.FC<InviteePopupProps> = ({
    templateId,
    quantity: initialQuantity,
    onClose,
    weddingImages,
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [inviteeNames, setInviteeNames] = useState<string[]>(Array(initialQuantity).fill(''));
    const [quantity, setQuantity] = useState(initialQuantity);
    const [isLoading, setIsLoading] = useState(false);
    const [templatePrice, setTemplatePrice] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);
    const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(false);
    const isMounted = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { checkDiscountEligibility } = useApi();

    // Function to format name to title case
    const formatName = (name: string): string => {
        return name
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Function to update URL query parameter
    const updateUrlQuantity = (newQuantity: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('quantity', newQuantity.toString());
        window.history.pushState({}, '', url.toString());
    };

    // Handle file input change
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.txt')) {
            alert('Vui lòng chọn file định dạng .txt');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                alert('File trống hoặc không đọc được.');
                return;
            }

            const names = text
                .split('\n')
                .map((name) => formatName(name.trim()))
                .filter((name) => name !== '');

            if (names.length === 0) {
                alert('File không chứa tên hợp lệ.');
                return;
            }

            setQuantity(names.length);
            setInviteeNames(names);
            updateUrlQuantity(names.length);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.onerror = () => {
            alert('Lỗi khi đọc file. Vui lòng thử lại.');
        };
        reader.readAsText(file);
    };

    // Trigger file input click
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Initialize inviteeNames from localStorage and check discount eligibility
    useEffect(() => {
        if (isMounted.current) return;
        const storageKey = `inviteeNames_${templateId}`;
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            try {
                const parsedNames = JSON.parse(storedData);
                if (Array.isArray(parsedNames)) {
                    const adjustedNames = Array(initialQuantity).fill('');
                    parsedNames.forEach((name: string, index: number) => {
                        if (index < initialQuantity) {
                            adjustedNames[index] = formatName(name);
                        }
                    });
                    setInviteeNames(adjustedNames);
                }
            } catch (err) {
                console.error('Error parsing localStorage inviteeNames:', err);
            }
        }

        async function fetchDiscountEligibility() {
            try {
                const response = await checkDiscountEligibility();
                setIsEligibleForDiscount(response.isEligible);
                console.log('Discount Eligibility:', response); // Debug
            } catch (err) {
                console.error('Error checking discount eligibility:', err);
                setIsEligibleForDiscount(false);
            }
        }
        fetchDiscountEligibility();

        isMounted.current = true;
    }, [templateId, initialQuantity, checkDiscountEligibility]);

    // Save inviteeNames to localStorage
    useEffect(() => {
        const storageKey = `inviteeNames_${templateId}`;
        localStorage.setItem(storageKey, JSON.stringify(inviteeNames));
    }, [inviteeNames, templateId]);

    // Check apiUrl
    useEffect(() => {
        if (!apiUrl) {
            console.error('API URL không được định nghĩa trong biến môi trường NEXT_PUBLIC_APP_API_BASE_URL');
            setError('API URL không được định nghĩa. Vui lòng liên hệ quản trị viên.');
            setTemplatePrice(0);
            setIsLoadingPrice(false);
        }
    }, []);

    // Fetch template price from API
    useEffect(() => {
        async function fetchTemplatePrice() {
            if (!apiUrl) return;
            setIsLoadingPrice(true);
            try {
                const response = await fetch(`${apiUrl}/templates/getTemplate/${templateId}`);
                const result = await response.json();
                if (result.statusCode === 200 && result.data?.price) {
                    const price = Number(result.data.price); // Chuyển đổi sang số để đảm bảo tính toán đúng
                    console.log('Fetched Template Price:', price); // Debug
                    setTemplatePrice(price);
                } else {
                    throw new Error(result.message || 'Không lấy được giá template');
                }
            } catch (err) {
                console.error('Lỗi khi lấy giá template:', err);
                setError('Không thể tải giá template. Vui lòng thử lại.');
                setTemplatePrice(0);
            } finally {
                setIsLoadingPrice(false);
            }
        }
        fetchTemplatePrice();
    }, [templateId]);

    // Adjust inviteeNames when quantity changes
    useEffect(() => {
        if (!isMounted.current) return;
        setInviteeNames((prev) => {
            const newNames = Array(quantity).fill('');
            prev.forEach((name, index) => {
                if (index < quantity) {
                    newNames[index] = name;
                }
            });
            return newNames;
        });
    }, [quantity]);

    // Calculate totalPrice
    const calculatedTotalPrice =
        templatePrice !== null
            ? (() => {
                  const basePrice = Number(templatePrice); // Đảm bảo là số
                  let totalPrice = basePrice;
                  if (quantity > Number(process.env.NEXT_PUBLIC_APP_NUMBER_REQUEST ||  20)) {
                      const extraPeople = quantity - Number(process.env.NEXT_PUBLIC_APP_NUMBER_REQUEST || 20);
                      totalPrice += extraPeople * priceCardDefault; // +500đ cho mỗi người thêm
                  }
                  console.log(
                      'Base Price:',
                      basePrice,
                      'Extra Cost:',
                      quantity > 20 ? (quantity - 20) * 500 : 0,
                      'Total Before Discount:',
                      totalPrice
                  ); // Debug
                  // Apply 20% discount if eligible
                  if (isEligibleForDiscount) {
                      const discountAmount = totalPrice * DiscountEligibility / 100;
                      totalPrice -= discountAmount;
                      console.log('Discount Amount:', discountAmount, 'Total After Discount:', totalPrice); // Debug
                  }
                  return totalPrice;
              })()
            : 0;

    // Format totalPrice
    const formattedTotalPrice = calculatedTotalPrice
        ? calculatedTotalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        : '0 VND';

    const handleCloseAnimationEnd = () => {
        if (isClosing) {
            onClose();
        }
    };

    const handleClose = () => {
        setIsClosing(true);
    };

    const handleNameChange = (index: number, value: string) => {
        const updatedNames = [...inviteeNames];
        updatedNames[index] = formatName(value);
        setInviteeNames(updatedNames);
    };

    const handleAddInvitee = () => {
        setQuantity((prev) => {
            const newQuantity = prev + 1;
            updateUrlQuantity(newQuantity);
            return newQuantity;
        });
        setInviteeNames((prev) => [...prev, '']);
    };

    const handleRemoveInvitee = (index: number) => {
        if (quantity > 1) {
            setQuantity((prev) => {
                const newQuantity = prev - 1;
                updateUrlQuantity(newQuantity);
                return newQuantity;
            });
            setInviteeNames((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        if (inviteeNames.some((name) => name.trim() === '')) {
            alert('Vui lòng nhập đầy đủ tên của tất cả người được mời.');
            return;
        }

        if (templatePrice === null) {
            alert('Không thể tạo thanh toán do lỗi tải giá template.');
            return;
        }

        if (!apiUrl) {
            alert('API URL không được định nghĩa. Vui lòng liên hệ quản trị viên.');
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            }

            const uploadedImageUrls: { url: string; position: string }[] = [];
            if (weddingImages && weddingImages.length > 0) {
                uploadedImageUrls.push(
                    ...weddingImages.map((image) => ({
                        url: URL.createObjectURL(image.file),
                        position: image.position,
                    }))
                );
                console.warn('Ảnh không được tải lên server. Sử dụng URL tạm thời cục bộ.');
            } else {
                console.warn('Không có ảnh được chọn để tải lên.');
            }

            // Create payment
            const paymentResponse = await fetch(`${apiUrl}/payos/create-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    totalAmount: calculatedTotalPrice,
                    description: 'Thanh toán thiệp cưới',
                    templateId,
                    inviteeNames,
                    weddingImages: uploadedImageUrls,
                }),
            });

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                throw new Error(
                    `Payment creation failed with status ${paymentResponse.status}: ${errorData.message || 'Không có thông tin lỗi'}`
                );
            }

            const paymentResult = await paymentResponse.json();
            if (paymentResult.success && paymentResult.paymentLink) {
                localStorage.removeItem(`inviteeNames_${templateId}`);
                window.location.href = paymentResult.paymentLink;
            } else {
                throw new Error(paymentResult.message || 'Không thể tạo liên kết thanh toán');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            console.error('Lỗi khi xử lý thanh toán:', {
                message: errorMessage,
                templateId,
                quantity,
                totalAmount: calculatedTotalPrice,
                weddingImages,
            });
            alert(`Lỗi khi xử lý thanh toán: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingPrice) {
        return (
            <div
                className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}
                onAnimationEnd={handleCloseAnimationEnd}
            >
                <div className={styles.popupHeader}>
                    <div
                        className={styles.skeletonTitle}
                        style={{
                            height: '2rem',
                            width: '60%',
                            margin: '0 auto',
                            background: '#f0f0f0',
                            borderRadius: '4px',
                        }}
                    ></div>
                    <div
                        className={styles.skeletonSubtitle}
                        style={{
                            height: '1.4rem',
                            width: '40%',
                            margin: '8px auto',
                            background: '#f0f0f0',
                            borderRadius: '4px',
                        }}
                    ></div>
                </div>
                <div className={styles.popupBody}>
                    <div className={styles.inviteeSection}>
                        {Array.from({ length: quantity }, (_, index) => (
                            <div key={index} className={styles.inviteeInput}>
                                <div
                                    className={styles.skeletonLabel}
                                    style={{
                                        height: '2rem',
                                        width: '30%',
                                        background: '#f0f0f0',
                                        borderRadius: '4px',
                                    }}
                                ></div>
                                <div
                                    className={styles.skeletonInput}
                                    style={{
                                        height: '4rem',
                                        width: '100%',
                                        background: '#f0f0f0',
                                        borderRadius: '6px',
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.actionButtons}>
                        <div
                            className={styles.skeletonButton}
                            style={{ height: '3rem', width: '100%', background: '#f0f0f0', borderRadius: '6px' }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div
            className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}
            onAnimationEnd={handleCloseAnimationEnd}
        >
            <div className={styles.popupHeader}>
                <h2 className={styles.popupTitle}>Nhập Tên Khách Mời</h2>
                <p className={styles.popupSubtitle}>
                    Số lượng: {quantity} lời mời • Tổng giá: {formattedTotalPrice}
                    {isEligibleForDiscount && (
                        <span className={styles.discountNote}> (Đã giảm {DiscountEligibility}%)</span>
                    )}
                </p>
            </div>
            <div className={styles.btn_import_text}>
                <button onClick={handleImportClick} className={styles.importButton}>
                    <FontAwesomeIcon icon={faFileImport} /> Thêm bằng File (.txt)
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileImport}
                    accept=".txt"
                    style={{ display: 'none' }}
                />
            </div>
            <div className={styles.popupBody}>
                <div className={styles.inviteeSection}>
                    {Array.from({ length: quantity }, (_, index) => (
                        <div key={index} className={styles.inviteeInput}>
                            <div className={styles.inputWrapper}>
                                <label htmlFor={`invitee-${index}`}>
                                    Tên người mời {index + 1}
                                    {index >= 20 && <span className={styles.extraCost}> (+500đ)</span>}
                                </label>
                                <div className={styles.inputContainer}>
                                    <input
                                        type="text"
                                        id={`invitee-${index}`}
                                        value={inviteeNames[index]}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        placeholder={`Nhập tên người mời ${index + 1}`}
                                    />
                                    {quantity > 1 && (
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveInvitee(index)}
                                            aria-label={`Xóa người mời ${index + 1}`}
                                        >
                                            <FaMinus />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className={styles.addButton} onClick={handleAddInvitee} aria-label="Thêm người mời">
                        <FaPlus /> Thêm lời mời
                    </button>
                </div>
                <div className={styles.actionButtons}>
                    <button
                        className={styles.customizeButton}
                        onClick={handleSubmit}
                        disabled={isLoading || templatePrice === null}
                    >
                        {isLoading ? 'Đang xử lý...' : `Thanh toán với giá ${formattedTotalPrice}`}
                    </button>
                    <button className={styles.closeButton} onClick={handleClose} aria-label="Đóng popup">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteePopup;
