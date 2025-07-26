'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './11.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
} from '@fortawesome/free-solid-svg-icons';

interface BarPosition {
    x: string;
    y: string;
    marginTop?: string;
}

const Template11: React.FC = () => {
    const mainImage = '/images/m10/1.jpg';
    const [expandedBar, setExpandedBar] = useState<number | null>(null);

    const barPositions: BarPosition[] = [
        { x: '11%', y: '40%' },
        { x: '52%', y: '40%', marginTop: '0' },
        { x: '95%', y: '40%' },
    ];

    const handleBarClick = (index: number) => {
        setExpandedBar(expandedBar === index ? null : index);
    };

    // Disable body scroll when a bar is expanded
    useEffect(() => {
        if (expandedBar !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [expandedBar]);

    return (
        <div className={styles.template11}>
            <div className={styles.wrapper}>
                {/* Background mờ */}
                <div className={styles.backgroundImage}>
                    <img src={mainImage} alt="blurred background" />
                </div>

                {/* Các thanh ảnh */}
                <div className={styles.barMaskContainer}>
                    {barPositions.map((pos, index) => (
                        <div
                            key={index}
                            className={`${styles.bar} ${expandedBar === index ? styles.expanded : ''}`}
                            style={{
                                backgroundImage: `url(${mainImage})`,
                                backgroundPosition: `${pos.x} ${pos.y}`,
                                backgroundSize: expandedBar === index ? 'cover' : '350%',
                                marginTop: pos.marginTop || '0',
                                backgroundRepeat: 'no-repeat',
                            }}
                            onClick={() => handleBarClick(index)}
                        >
                            {expandedBar === index && index === 0 && (
                                <div className={styles.weddingInfo}>
                                    <div className={styles.wrapper_bar1}>
                                        <div className={styles.step_1}>
                                            <div className={styles.image_1}>
                                                <img src="/images/m10/6.jpg" alt="Wedding" />
                                            </div>

                                            <div className={styles.dayWedding}>
                                                <h1>24 | 09</h1>
                                                <h1>2025</h1>
                                            </div>

                                            <div className={styles.text}>
                                                join us to celebrate
                                                <h3>the Wedding of</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {expandedBar === index && index === 1 && (
                                <div className={styles.familyInfo}>
                                    <div className={styles.wrapper_bar2}>
                                        <h2>Our Families</h2>
                                        <div className={styles.familyContainer}>
                                            <h1>
                                                Trân Trọng kính mời đến dự buổi tiệc
                                                <br />
                                                Chung vui cùng gia đình chúng tôi
                                            </h1>
                                            <div className={styles.familySide}>
                                                <h3>Groom&apos;s Family</h3>
                                                <span>Ông Nguyễn Văn A</span>
                                                <span>Bà: Trần Thị B</span>
                                                <p>
                                                    <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street,
                                                    Hanoi
                                                </p>
                                            </div>
                                            <div className={styles.familySide}>
                                                <h3>Bride&apos;s Family</h3>
                                                <span>Ông: Lê Văn C</span>
                                                <span>Bà: Phạm Thị D</span>
                                                <p>
                                                    <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street,
                                                    Hanoi
                                                </p>
                                            </div>

                                            <h1>
                                                Vào lúc: <strong>18:00 || Ngày 24 tháng 09, 2025</strong>
                                                <br />
                                                <p>
                                                    (Nhằm ngày <strong>03</strong> tháng <strong>09</strong> năm Ất Tỵ)
                                                </p>
                                                Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {expandedBar === index && index === 2 && (
                                <div className={styles.groomMessage}>
                                    <div className={styles.wrapper_bar3}>
                                        <div className={styles.step_3}>
                                            <div className={styles.image_3}>
                                                <img src="/images/m10/3.jpg" alt="Groom Message" />
                                            </div>

                                            <div className={styles.groomName}>
                                                <h1>Hoàng Phúc</h1>
                                            </div>

                                            <div className={styles.text}>
                                                <p>
                                                    Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất
                                                    ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già
                                                    đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng
                                                    thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em –
                                                    người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em
                                                    nhé!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tên cô dâu chú rể */}
                <div className={styles.groomBride}>
                    <h3>Hoàng Phúc</h3>
                    <h3>Diễm Quỳnh</h3>
                </div>
            </div>
        </div>
    );
};

export default Template11;
