'use client';
import React, { useState } from 'react';
import styles from './FeatureCard.module.scss';
import CreateCardPopup from 'app/popup/createCardFeature/CreateCardPopup';

const FeatureCard: React.FC = () => {
    const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);

    const handleOpenCreateCard = () => {
        setIsCreateCardOpen(true);
    };

    const handleCloseCreateCard = () => {
        setIsCreateCardOpen(false);
    };

    return (
        <div className={styles.card}>
            <div className={styles.card_wrapper}>
                <div className={styles.card_left}>
                    <h3>Khám phá tính năng nhận HỶ qua QR</h3>
                    <span>Dễ dàng tạo thẻ thanh toán với mã QR tích hợp sẵn.</span>
                    <span>Khách mời có thể gửi lời chúc từ xa một cách tiện lợi.</span>
                    <span>Tích hợp nhanh chóng, giao diện thân thiện, phù hợp với mọi dịp lễ.</span>
                    <span>Hỗ trợ đa nền tảng, đảm bảo trải nghiệm mượt mà cho tất cả người dùng.</span>
                    <div className={styles.btn_createCard} onClick={handleOpenCreateCard}>
                        Tạo thẻ
                    </div>
                </div>
                <div className={styles.card_right}>
                    <div className={styles.bank_card}>
                        <h3>Minto Feature</h3>
                        <h2>xxx xxx xxx</h2>
                        <h4>Client Name</h4>
                    </div>
                </div>
            </div>
            <CreateCardPopup
                isOpen={isCreateCardOpen}
                onClose={handleCloseCreateCard}
                onSubmit={(data) => console.log('Card data:', data)}
            />
        </div>
    );
};

export default FeatureCard;
