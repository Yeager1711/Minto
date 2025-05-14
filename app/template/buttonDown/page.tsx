'use client';
import * as React from 'react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './buttonDown.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import InviteePopup from 'app/popup/InviteePopup/InviteePopup';

interface ButtonDownProps {
    templateId: string;
    quantity: number;
    totalPrice: string;
    weddingImages: { file: File; position: string }[];
}

function ButtonDown({ templateId, quantity, totalPrice, weddingImages }: ButtonDownProps) {
    const params = useParams();
    const id = params.id as string;

    // Validate templateId
    if (!templateId || !/^\d+$/.test(templateId) || templateId !== id) {
        return <div>Lỗi: Mã mẫu không hợp lệ.</div>;
    }

    // Validate quantity
    if (quantity <= 0) {
        return <div>Lỗi: Số lượng không hợp lệ.</div>;
    }

    // Calculate totalPrice based on quantity
    const pricePerCard = parseFloat(process.env.NEXT_PUBLIC_PRICE_CARD || '500'); // Default to 100000 if not set
    const calculatedTotalPrice = quantity * pricePerCard;

    // Format totalPrice to string (e.g., 199000.00 -> 199.000.00)
    const formattedTotalPrice = calculatedTotalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Validate formattedTotalPrice
    if (!formattedTotalPrice || !/^\d+(\.\d{3})*\.\d{2}$/.test(formattedTotalPrice)) {
        return <div>Lỗi: Giá trị totalPrice không hợp lệ.</div>;
    }

    const [isExpanded, setIsExpanded] = useState(false); // State for expand/collapse and popup visibility

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded); // Toggle expand state
    };

    return (
        <div className={`${styles.control_navigation} ${isExpanded ? styles.expanded : ''}`}>
            {isExpanded && (
                <div className={styles.popup_container}>
                    <InviteePopup
                        templateId={templateId}
                        quantity={quantity}
                        totalPrice={formattedTotalPrice} // Use calculated and formatted price
                        onClose={handleToggleExpand}
                        id={id}
                        weddingImages={weddingImages}
                    />
                </div>
            )}
            <div className={styles.btn_dropdown} onClick={handleToggleExpand}>
                <FontAwesomeIcon icon={faChevronDown} />
            </div>
        </div>
    );
}

export default ButtonDown;
