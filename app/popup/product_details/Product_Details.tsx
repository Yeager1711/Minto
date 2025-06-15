'use client';
import React, { useState, useEffect } from 'react';
import styles from './product_details.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

interface Template {
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

interface PopupProps {
    product: Template | null;
    onClose: () => void;
}

const priceCardDefault = Number(process.env.NEXT_PUBLIC_PRICE_CARD) || 500;

const Popup: React.FC<PopupProps> = ({ product, onClose }) => {
    const router = useRouter();
    const [isClosing, setIsClosing] = useState(false);
    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        setIsClosing(false);
        return () => {
            setIsClosing(false);
        };
    }, [product]);

    useEffect(() => {
        if (isClosing) {
            const timer = setTimeout(() => {
                onClose();
                setIsClosing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isClosing, onClose]);

    if (!product) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setIsClosing(true);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
    };

    const handleUseTemplate = () => {
        router.push(`/edit/template/${product.template_id}?quantity=${quantity}`);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const quantityValue = Math.max(1, parseInt(selectedValue.split(' ')[0]) || 1);
        setQuantity(quantityValue);
    };

    const calculateTotalPrice = () => {
        const basePrice = Number(product.price);
        let totalPrice = basePrice;
        if (quantity > Number(process.env.NEXT_PUBLIC_APP_NUMBER_REQUEST)) {
            totalPrice += quantity * priceCardDefault;
        }
        return totalPrice;
    };

    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ';
    };

    const totalPrice = calculateTotalPrice();
    const formattedPrice = formatPrice(totalPrice);

    const isReady = product.status.trim() === 'Sẵn sàng';
    const statusClass = isReady ? styles.statusReady : styles.statusUpdating;

    return (
        <div className={styles.popupOverlay} onClick={handleOverlayClick} role="dialog" aria-labelledby="popupTitle">
            <div className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}>
                <button className={styles.closeButton} onClick={handleClose} aria-label="Đóng popup">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styles.popupBody}>
                    <div className={styles.imageSection}>
                        <div className={styles.popupImageContainer}>
                           
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className={styles.popupImage}
                                onError={(e) => (e.currentTarget.src = '/images/fallback.png')}
                            />
                        </div>
                    </div>
                    <div className={styles.infoSection}>
                        <div className={styles.popupHeader}>
                            <h2 id="popupTitle" className={styles.popupTitle}>
                                {product.name}
                            </h2>
                        </div>
                        <p className={styles.price}>Giá: {formattedPrice}</p>
                        <div className={styles.description}>
                            {product.description?.split('\n').map((line, index) => <p key={index}>{line}</p>) || (
                                <p>Không có mô tả</p>
                            )}
                            <p className={statusClass}>{product.status}</p>
                        </div>
                        <div className={styles.optionsSection}>
                            <div className={styles.paperOptions}>
                                <div className={styles.quantitySelector}>
                                    <label htmlFor="quantity">Số lượng:</label>
                                    <select
                                        name="quantity"
                                        id="quantity"
                                        onChange={handleQuantityChange}
                                        value={`${quantity} lời mời`}
                                    >
                                        <option value="1 lời mời">1 lời mời</option>
                                        <option value="3 lời mời">3 lời mời</option>
                                        <option value="50 lời mời">50 lời mời</option>
                                        <option value="100 lời mời">100 lời mời</option>
                                        <option value="150 lời mời">150 lời mời</option>
                                        <option value="200 lời mời">200 lời mời</option>
                                        <option value="250 lời mời">250 lời mời</option>
                                        <option value="500 lời mời">500 lời mời</option>
                                        <option value="1000 lời mời">1000 lời mời</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.actionButtons}>
                                <button
                                    className={styles.customizeButton}
                                    onClick={handleUseTemplate}
                                    disabled={!isReady}
                                    title={
                                        !isReady
                                            ? 'Sản phẩm đang được cập nhật, vui lòng thử lại sau!'
                                            : 'Sử dụng mẫu này'
                                    }
                                    aria-disabled={!isReady}
                                >
                                    Sử dụng mẫu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;
