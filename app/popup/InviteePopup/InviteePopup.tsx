// app/components/InviteePopup.tsx
'use client';
import React, { useState, useEffect } from 'react';
import styles from './InviteePopup.module.css';
import { useApi } from 'app/lib/apiContext/apiContext';
// Định nghĩa interface cho dữ liệu ảnh
interface ImageData {
    url: string;
    position: string;
    fileName?: string;
}

interface WeddingImages {
    [key: string]: ImageData;
}

interface InviteePopupProps {
    templateId: string;
    quantity: number;
    onClose: () => void;
    id: string;
    weddingImages: { file: File; position: string }[];
}

const priceCardDefault = Number(process.env.NEXT_PUBLIC_PRICE_CARD) || 500;
const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const InviteePopup: React.FC<InviteePopupProps> = ({ templateId, quantity, onClose, id, weddingImages }) => {
    const { saveCard } = useApi();
    const [isClosing] = useState(false);
    const [inviteeNames, setInviteeNames] = useState<string[]>(Array(quantity).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [templatePrice, setTemplatePrice] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    // Kiểm tra apiUrl
    useEffect(() => {
        if (!apiUrl) {
            setError('API URL không được định nghĩa.');
            setTemplatePrice(0);
            setIsLoadingPrice(false);
        }
    }, []);

    // Lấy giá template từ API
    useEffect(() => {
        async function fetchTemplatePrice() {
            if (!apiUrl) return;
            setIsLoadingPrice(true);
            try {
                const response = await fetch(`${apiUrl}/templates/getTemplate/${templateId}`);
                const result = await response.json();
                if (result.statusCode === 200 && result.data?.price) {
                    setTemplatePrice(result.data.price);
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

    // Điều chỉnh inviteeNames khi quantity thay đổi
    useEffect(() => {
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

    // Tính toán totalPrice
    const calculatedTotalPrice =
        templatePrice !== null
            ? (() => {
                  const basePrice = Number(templatePrice);
                  let totalPrice = basePrice;

                  if (quantity > Number(process.env.NEXT_PUBLIC_APP_NUMBER_REQUEST)) {
                      totalPrice += quantity * priceCardDefault;
                  }

                  return totalPrice;
              })()
            : 0;

    // Định dạng totalPrice
    const formattedTotalPrice = calculatedTotalPrice
        ? calculatedTotalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ'
        : '0 vnđ';

    const handleCloseAnimationEnd = () => {
        if (isClosing) {
            onClose();
        }
    };

    const handleNameChange = (index: number, value: string) => {
        const updatedNames = [...inviteeNames];
        updatedNames[index] = value;
        setInviteeNames(updatedNames);
    };

    const handleSubmit = async () => {
        if (inviteeNames.some((name) => name.trim() === '')) {
            alert('Vui lòng nhập đầy đủ tên của tất cả người được mời.');
            return;
        }

        if (templatePrice === null) {
            alert('Không thể lưu thiệp do lỗi tải giá template.');
            return;
        }

        setIsLoading(true);
        try {
            const weddingData = JSON.parse(localStorage.getItem(`WeddingData${id}`) || '{}');
            const imagesRaw = localStorage.getItem(`weddingImages${id}`);
            const images: WeddingImages = imagesRaw ? JSON.parse(imagesRaw) : {};

            // Lấy tất cả weddingImages từ images trong localStorage
            const weddingImagesData = Object.values(images).map((imageData) => ({
                position: imageData.position,
                url: imageData.url || '',
            }));

            console.log('Dữ liệu images từ localStorage:', images);
            console.log('weddingImages (from props):', weddingImages);
            console.log('weddingImagesData:', weddingImagesData);

            const response = await saveCard({
                templateId: parseInt(templateId),
                weddingData,
                weddingImages: weddingImagesData,
                inviteeNames,
                totalPrice: calculatedTotalPrice,
            });

            if (response && response.card_id) {
                // localStorage.removeItem(`WeddingData${id}`);
                // localStorage.removeItem(`weddingImages${id}`);
                alert('Thiệp đã được lưu thành công!');
            } else {
                throw new Error('Lưu thiệp không thành công');
            }
        } catch (error) {
            console.error('Lỗi khi lưu thiệp:', error);
            alert('Lỗi khi lưu thiệp. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Hiển thị trạng thái tải hoặc lỗi
    if (isLoadingPrice) {
        return <div className={styles.loading}>Đang tải giá...</div>;
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
                </p>
            </div>
            <div className={styles.popupBody}>
                <div className={styles.inviteeSection}>
                    {Array.from({ length: quantity }, (_, index) => (
                        <div key={index} className={styles.inviteeInput}>
                            <label htmlFor={`invitee-${index}`}>Tên người mời {index + 1}:</label>
                            <input
                                type="text"
                                id={`invitee-${index}`}
                                value={inviteeNames[index]}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                placeholder={`Nhập tên người mời ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
                <div className={styles.actionButtons}>
                    <button
                        className={styles.customizeButton}
                        onClick={handleSubmit}
                        disabled={isLoading || templatePrice === null}
                    >
                        {isLoading ? 'Đang xử lý...' : `Thanh toán với giá ${formattedTotalPrice}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteePopup;
