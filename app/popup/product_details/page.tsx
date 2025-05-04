'use client';

import React, { useState, useEffect } from 'react';
import styles from './product_details.module.scss';
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
}

// Define props for the Popup component
interface PopupProps {
    product: Product | null;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ product, onClose }) => {
    if (!product) return null;
    const router = useRouter();
    const [isClosing, setIsClosing] = useState(false);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setIsClosing(true);
        }
    };

    const handleCloseAnimationEnd = () => {
        if (isClosing) {
            onClose();
        }
    };

    useEffect(() => {
        if (isClosing) {
            const timer = setTimeout(() => {
                onClose();
            }, 300); // Match the animation duration
            return () => clearTimeout(timer);
        }
    }, [isClosing, onClose]);

    const handleUseTemplate = () => {
        router.push(`/template/${product.id}`);
    };

    // Format price to display as "99.000 vnđ"
    const formattedPrice = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ';

    return (
        <div className={styles.popupOverlay} onClick={handleOverlayClick}>
            <button className={styles.closeButton} onClick={() => setIsClosing(true)}>
                <FontAwesomeIcon icon={faXmark} />
            </button>
            <div
                className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}
                onAnimationEnd={handleCloseAnimationEnd}
            >
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
                    {/* <div className={styles.optionsSection}>
                        <div className={styles.paperOptions}>
                            <label className={styles.paperOption}>
                                <input type="radio" name="paperType" value="premium" defaultChecked />
                                <div>
                                    <strong>Bìa thiệp cưới</strong>
                                    <p>Chỉ thiết kế trên bìa thiệp cưới (không thêm thiệp).</p>
                                    <p>Mọi chi tiết đều được thiết kế trên bìa thiệp cưới.</p>
                                </div>
                            </label>
                            <label className={styles.paperOption}>
                                <input type="radio" name="paperType" value="deluxe" />
                                <div>
                                    <strong>Bìa thiệp cưới & thiệp báo tin</strong>
                                    <p>Thiết kế trên cả bìa và thiệp báo tin.</p>
                                    <p>Phần thiệp báo tin được giới thiệu.</p>
                                    <p>Phần thiệp báo tin, được hiển thị những thông tin rõ ràng cụ thể,...</p>
                                </div>
                            </label>
                            <div className={styles.quantitySelector}>
                                <span>Số lượng:</span>
                                <select name="quantity" id="quantity">
                                    <option value="25 lời mời">25 lời mời</option>
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
                            <button className={styles.customizeButton} onClick={handleUseTemplate}>
                                Sử dụng mẫu này
                            </button>
                            <button className={styles.favoriteButton}>
                                <FontAwesomeIcon icon={faStar} />
                            </button>
                        </div>
                    </div> */}

                    <div className={styles.infoSection}>
                        <p className={styles.price}>Giá: {formattedPrice}</p>
                        <div className={styles.description}>
                            {product.description.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                        <div className={styles.actionButtons}>
                            <button className={styles.customizeButton} onClick={handleUseTemplate}>
                              Xem mẫu này
                            </button>
                            <button className={styles.favoriteButton}>
                                <FontAwesomeIcon icon={faStar} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;
