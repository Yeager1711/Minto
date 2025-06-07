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
        <div className={styles.Feature_Card}>
            <div className={styles.box} onClick={handleOpenCreateCard}>
                <div className={styles.content}>
                    <h3>Khám phá tính năng nhận HỶ qua QR</h3>
                    <span>Dễ dàng tạo thanh toán với mã QR tích hợp.</span>
                    <span>Khách mời có thể gửi lời chúc từ xa.</span>
                    <span>Tích hợp nhanh chóng, giao diện thân thiện.</span>
                    <span>Hỗ trợ đa nền tảng, đảm bảo trải nghiệm mượt mà.</span>
                   
                </div>
                <video src="/videos/intro_card.mp4" autoPlay muted loop className={styles.fullScreenVideo} />
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
