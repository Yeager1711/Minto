'use client';
import React, { useState, useEffect } from 'react';
import styles from './template_details.module.css'; // giữ nguyên ext như bạn đang dùng
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faChevronCircleRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
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
    const [inputValue, setInputValue] = useState<string>('1');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isContentExpanded, setIsContentExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setIsClosing(false);
        setInputValue('1');
        setIsDescriptionExpanded(false);
        setIsContentExpanded(true);
        return () => setIsClosing(false);
    }, [product]);

    // Đồng bộ thời gian đóng với CSS animation
    useEffect(() => {
        if (!isClosing) return;
        const ANIM_MS = isMobile ? 500 : 400; // mobile: translateIn/out 0.5s, desktop: slideIn/out 0.4s
        const timer = setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, ANIM_MS);
        return () => clearTimeout(timer);
    }, [isClosing, isMobile, onClose]);

    if (!product) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) setIsClosing(true);
    };

    const handleClose = () => setIsClosing(true);

    const handleUseTemplate = () => {
        router.push(`/edit/template/${product.template_id}?quantity=${quantity}`);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (value === '') {
            setQuantity(1);
            return;
        }
        const n = parseInt(value);
        setQuantity(!isNaN(n) && n >= 1 ? n : 1);
    };

    const handleBlur = () => {
        if (inputValue === '') {
            setInputValue('1');
            setQuantity(1);
        }
    };

    const calculateTotalPrice = () => {
        const basePrice = Number(product.price);
        let total = basePrice;
        if (quantity > 20) total += (quantity - 20) * priceCardDefault;
        return total;
    };

    const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ';

    const totalPrice = calculateTotalPrice();
    const formattedPrice = formatPrice(totalPrice);

    const isReady = product.status.trim() === 'Sẵn sàng';
    const statusClass = isReady ? styles.statusReady : styles.statusUpdating;

    const toggleDescription = () => setIsDescriptionExpanded((v) => !v);
    const toggleContent = () => setIsContentExpanded((v) => !v);

    const renderDescription = () => {
        if (!product.description) return <p>Không có mô tả</p>;
        const lines = product.description.split('\n');
        const maxLines = 3;
        const shouldShowButton = lines.length > maxLines;
        return (
            <>
                <div className={`${styles.descriptionWrapper} ${isDescriptionExpanded ? '' : styles.collapsed}`}>
                    {lines.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
                {shouldShowButton && (
                    <button
                        className={styles.showMoreButton}
                        onClick={toggleDescription}
                        aria-label={isDescriptionExpanded ? 'Thu gọn mô tả' : 'Xem thêm mô tả'}
                    >
                        <span>{isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                        <FontAwesomeIcon
                            icon={isDescriptionExpanded ? faChevronUp : faChevronDown}
                            className={styles.showMoreIcon}
                        />
                    </button>
                )}
            </>
        );
    };

    if (isMobile) {
        return (
            <div
                className={`
          ${styles.popupOverlay__reponsive}
          ${isClosing ? styles.closing_reponsive : styles.open_reponsive}
        `}
            >
                <button className={styles.closeButton} onClick={handleClose} aria-label="Đóng popup">
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div className={styles.img_template}>
                    <img
                        src={product.image_url}
                        alt={product.name}
                        onError={(e) => (e.currentTarget.src = '/images/fallback.png')}
                    />
                </div>

                {/* SỬA Ở ĐÂY: toggle đúng expanded/collapsed */}
                <div className={`${styles.content} ${isContentExpanded ? styles.expanded : styles.collapsed}`}>
                    <button
                        className={styles.expand_toggle}
                        onClick={toggleContent}
                        aria-label={isContentExpanded ? 'Thu gọn nội dung' : 'Mở rộng nội dung'}
                    >
                        <FontAwesomeIcon icon={isContentExpanded ? faChevronDown : faChevronUp} />
                    </button>

                    <div className={styles.wrapper_info}>
                        <h2 id="popupTitle" className={styles.popupTitle_reponsive}>
                            {product.name}
                        </h2>

                        {/* KHÔNG dùng display:none để còn animate */}
                        <div
                            className={`${styles.description} ${isContentExpanded ? '' : styles.hidden}`}
                            aria-hidden={!isContentExpanded}
                        >
                            {renderDescription()}
                            <p className={statusClass}>{product.status}</p>
                        </div>

                        <div
                            className={`${styles.paperOptions} ${isContentExpanded ? '' : styles.hidden}`}
                            aria-hidden={!isContentExpanded}
                        >
                            <div className={styles.quantitySelector}>
                                <label htmlFor="quantity">Số lượng khách mời:</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    id="quantity"
                                    min="1"
                                    value={inputValue}
                                    onChange={handleQuantityChange}
                                    onBlur={handleBlur}
                                    className={styles.quantityInput}
                                />
                                {quantity > 20 && (
                                    <p className={styles.quantityNote}>Sau 20 lời mời, mỗi lời mời sau đó + 500đ</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.flex_control}>
                            <div className={styles.price}>
                                <span>Tổng tiền</span>
                                <h1>{formattedPrice}</h1>
                            </div>
                            <div
                                className={styles.using_template}
                                onClick={handleUseTemplate}
                                title={
                                    !isReady ? 'Sản phẩm đang được cập nhật, vui lòng thử lại sau!' : 'Sử dụng mẫu này'
                                }
                                aria-disabled={!isReady}
                            >
                                <FontAwesomeIcon icon={faChevronCircleRight} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop giữ nguyên logic, chỉ đồng bộ thời gian đóng (đã làm ở useEffect)
    return (
        <div
            className={`${styles.popupOverlay_pc} ${isClosing ? styles.closing : ''}`}
            onClick={handleOverlayClick}
            role="dialog"
            aria-labelledby="popupTitle"
        >
            <button className={styles.closeButton} onClick={handleClose} aria-label="Đóng popup">
                <FontAwesomeIcon icon={faXmark} />
            </button>
            <div className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}>
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
                            {product.description?.split('\n').map((line, i) => <p key={i}>{line}</p>) || (
                                <p>Không có mô tả</p>
                            )}
                            <p className={statusClass}>{product.status}</p>
                        </div>

                        <div className={styles.optionsSection}>
                            <div className={styles.paperOptions}>
                                <div className={styles.quantitySelector}>
                                    <label htmlFor="quantity">Số lượng khách mời:</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        id="quantity"
                                        min="1"
                                        value={inputValue}
                                        onChange={handleQuantityChange}
                                        onBlur={handleBlur}
                                        className={styles.quantityInput}
                                    />
                                    {quantity > 20 && (
                                        <p className={styles.quantityNote}>Sau 20 lời mời, mỗi lời mời sau đó + 500đ</p>
                                    )}
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
