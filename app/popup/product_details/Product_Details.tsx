'use client';

import React, { useState, useEffect } from 'react';
import styles from './product_details.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faStar } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

// Define the type for product data
interface Product {
    id: string;
    name: string;
    image: string;
    link: string;
    price: number;
    description: string;
    status: string;
}

// Define props for the Popup component
interface PopupProps {
    product: Product | null;
    onClose: () => void;
}

const priceCardDefault = Number(process.env.NEXT_PUBLIC_PRICE_CARD) || 500;

const Popup: React.FC<PopupProps> = ({ product, onClose }) => {
    const router = useRouter();
    const [isClosing, setIsClosing] = useState(false);
    const [quantity, setQuantity] = useState<number>(1);

    // Reset isClosing when product changes or popup opens
    useEffect(() => {
        setIsClosing(false);
        return () => {
            setIsClosing(false);
        };
    }, [product]);

    // Handle closing animation
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
        const totalPrice = calculateTotalPrice();
        router.push(`/template/${product.id}/edit/${product.id}?quantity=${quantity}&totalPrice=${totalPrice}`);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const quantityValue = parseInt(selectedValue.split(' ')[0]) || 1;
        setQuantity(quantityValue);
    };

    const calculateTotalPrice = () => {
        let totalPrice = product.price;
        if (quantity > 5) {
            totalPrice += quantity * priceCardDefault;
        }
        return totalPrice;
    };

    const formattedPrice = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ';
    const formattedTotalPrice =
        calculateTotalPrice()
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ';

    const isReady = product.status === 'Sẵn sàng';
    const statusClass = isReady ? styles.statusReady : styles.statusUpdating;

    return (
        <div className={styles.popupOverlay} onClick={handleOverlayClick}>
            <button className={styles.closeButton} onClick={handleClose}>
                <FontAwesomeIcon icon={faXmark} />
            </button>
            <div className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}>
                <div className={styles.popupHeader}>
                    <h2 className={styles.popupTitle}>{product.name}</h2>
                    <p className={styles.popupSubtitle}>Invitation • Portrait • 105 x 148 mm</p>
                    <a href={product.link}>Xem trực tiếp</a>
                </div>
                <div className={styles.popupBody}>
                    <div className={styles.imageSection}>
                        <div className={styles.popupImageContainer}>
                            <img src={product.image} alt={product.name} className={styles.popupImage} />
                        </div>
                    </div>
                    <div className={styles.infoSection}>
                        <p className={styles.price}>Giá cơ bản: {formattedPrice}</p>
                        <div className={styles.description}>
                            {product.description.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                            <p className={statusClass}>{product.status}</p> {/* Sửa lỗi class */}
                        </div>
                        <div className={styles.optionsSection}>
                            <div className={styles.paperOptions}>
                                <div className={styles.quantitySelector}>
                                    <span>Số lượng:</span>
                                    <select name="quantity" id="quantity" onChange={handleQuantityChange}>
                                        <option value="1 lời mời">1 lời mời</option>
                                        <option value="5 lời mời">5 lời mời</option>
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
                                >
                                    Sử dụng mẫu này với giá {formattedTotalPrice}
                                </button>
                                <button className={styles.favoriteButton}>
                                    <FontAwesomeIcon icon={faStar} />
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
