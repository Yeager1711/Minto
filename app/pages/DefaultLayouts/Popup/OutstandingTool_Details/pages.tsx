import React, { useState } from 'react';
import styles from './OutstandingTool_Details.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface OutstandingToolDetailsProps {
    onClose: () => void;
}

function OutstandingTool_Details({ onClose }: OutstandingToolDetailsProps) {
    const [isClosing, setIsClosing] = useState(false);

    // Hàm xử lý khi nhấn vào overlay
    const handleOverlayClick = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    // Sample data
    const sampleData = {
        header: {
            title: 'Công cụ hỗ trợ: Giải pháp tối ưu hóa cho quản lý tài chính cá nhân',
            description: `Công cụ hỗ trợ được thiết kế nhằm giúp bạn thực hiện các tính toán tài chính phức tạp một cách dễ dàng và nhanh chóng. Với giao diện trực quan và tính năng mạnh mẽ, đây là người bạn đồng hành đáng tin cậy trong việc lập kế hoạch tài chính cá nhân và đưa ra các quyết định kinh tế thông minh.`,
        },
        features: [
            {
                id: 1,
                title: 'Tính lương GROSS - NET',
                description: `Giúp bạn tính toán chính xác thu nhập thực nhận (NET) từ lương GROSS, hoặc ngược lại, dựa trên các khoản khấu trừ thuế, bảo hiểm xã hội, bảo hiểm y tế, và bảo hiểm thất nghiệp.`,
            },
            {
                id: 2,
                title: 'Tính lãi suất kép',
                description: `Hỗ trợ bạn tính toán giá trị tương lai của các khoản đầu tư hoặc tiết kiệm, dựa trên nguyên tắc lãi suất kép. Công cụ này giúp bạn hiểu rõ hơn sức mạnh của việc tái đầu tư lợi nhuận.`,
            },
            {
                id: 3,
                title: 'Tính thuế thu nhập cá nhân',
                description: `Dễ dàng xác định số thuế cần nộp dựa trên mức thu nhập chịu thuế, các khoản giảm trừ gia cảnh, và chính sách thuế hiện hành.`,
            },
            {
                id: 4,
                title: 'Tính Bảo Hiểm thất nghiệp',
                description: `Hỗ trợ bạn tính toán chính xác mức đóng bảo hiểm thất nghiệp, đảm bảo sự chuẩn bị cho những rủi ro bất ngờ trong công việc.`,
            },
            {
                id: 5,
                title: 'Lập kế hoạch tiết kiệm',
                description: `Giúp bạn xây dựng kế hoạch tài chính cá nhân dài hạn bằng cách tính toán số tiền cần tiết kiệm hàng tháng để đạt được mục tiêu tài chính như mua nhà, du lịch, hoặc nghỉ hưu.`,
            },
            {
                id: 6,
                title: 'Tính Bảo Hiểm xã hội 1 lần',
                description: `Cung cấp thông tin chi tiết về số tiền bảo hiểm xã hội mà bạn sẽ nhận được khi rút bảo hiểm một lần, giúp bạn đưa ra quyết định sáng suốt dựa trên hoàn cảnh cá nhân.`,
            },
        ],
    };

    return (
        <div className={styles.OutstandingTool_Details}>
            <div className={`${styles.overlay}`} onClick={handleOverlayClick}></div>
            <div className={`${styles.content} ${isClosing ? styles.closeAnimation : ''}`}>
                <h3>Chi tiết công cụ</h3>
                <div className={styles.content}>
                    <div className={styles.header__content__text}>
                        <h2>{sampleData.header.title}</h2>
                        <p>{sampleData.header.description}</p>
                    </div>

                    <div className={styles.wrapper_content__text}>
                        <h1>Các tính năng hỗ trợ:</h1>

                        {sampleData.features.map((feature) => (
                            <div key={feature.id} className={styles.content__text}>
                                <h4>
                                    {feature.id}. {feature.title}
                                </h4>
                                <span>{feature.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OutstandingTool_Details;
