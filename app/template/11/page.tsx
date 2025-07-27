'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './11.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faChevronCircleDown, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface BarPosition {
    x: string;
    y: string;
    marginTop?: string;
}

const Template11: React.FC = () => {
    const mainImage = '/images/m10/4.jpg';
    const [expandedBar, setExpandedBar] = useState<number | null>(null);
    const [showBrideStory, setShowBrideStory] = useState<boolean>(false);
    const [showContent, setShowContent] = useState<boolean>(false);
    const [showMap, setShowMap] = useState<boolean>(false);

    const barPositions: BarPosition[] = [
        { x: '11%', y: '40%' },
        { x: '52%', y: '40%', marginTop: '0' },
        { x: '95%', y: '40%' },
    ];

    const groomMapUrl =
        'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.351619823762!2d144.9575123!3d-37.8242139!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5173a284b5%3A0x958eeaf04deea384!2sMelbourne%20Convention%20and%20Exhibition%20Centre%20(MCEC)!5e1!3m2!1svi!2s!4v1753622568092!5m2!1svi!2s';
    const brideMapUrl =
        'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.351619823762!2d144.9575123!3d-37.8242139!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d53038e461d%3A0xfb83b485c5048192!2sThe%20Palms%20at%20Crown!5e1!3m2!1svi!2s!4v1753622592843!5m2!1svi!2s';

    const handleBarClick = (index: number) => {
        console.log('handleBarClick', { index, expandedBar, showContent, showBrideStory });
        if (expandedBar === index) {
            setExpandedBar(null);
            setShowContent(false);
            setShowMap(false);
        } else {
            setExpandedBar(index);
            setShowBrideStory(index === 2 ? false : showBrideStory);
            setShowContent(true);
            setShowMap(false);
        }
    };

    const handleStoryToggle = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        console.log('handleStoryToggle', { showBrideStory });
        setShowContent(false);
        setShowBrideStory((prev) => !prev);
        setShowContent(true);
        setShowMap(false);
    };

    const handleMapToggle = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        console.log('handleMapToggle', { showMap });
        setShowMap((prev) => !prev);
    };

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100,
        });

        if (expandedBar !== null) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
            AOS.refresh();
        }

        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
        };
    }, [expandedBar]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const slideStyle = {
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateX(0)' : showBrideStory ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
    };

    return (
        <div className={styles.template11}>
            <div className={styles.wrapper}>
                <div className={`${styles.backgroundImage} ${expandedBar !== null ? styles.hidden : ''}`}>
                    <img src={mainImage} alt="blurred background" />
                </div>

                <div className={`${styles.barMaskContainer} ${expandedBar !== null ? styles.hidden : ''}`}>
                    {barPositions.map((pos, index) => (
                        <div
                            key={index}
                            className={`${styles.bar} ${expandedBar === index ? styles.expanded : ''}`}
                            style={{
                                backgroundImage: expandedBar === index ? 'none' : `url(${mainImage})`,
                                backgroundPosition: `${pos.x} ${pos.y}`,
                                backgroundSize: expandedBar === index ? 'cover' : '350% !important',
                                marginTop: pos.marginTop || '0',
                                backgroundRepeat: 'no-repeat',
                            }}
                            onClick={() => handleBarClick(index)}
                        >
                            {expandedBar === index && showContent && index === 0 && (
                                <div className={styles.weddingInfo} onTouchStart={handleTouchStart}>
                                    <div className={styles.wrapper_bar1}>
                                        <div className={styles.step_1}>
                                            <div className={styles.image_1} data-aos="fade-down">
                                                <img src="/images/m10/6.jpg" alt="Wedding" />
                                            </div>
                                            <div className={styles.al}>
                                                <div
                                                    className={styles.dayWedding}
                                                    data-aos="fade-up"
                                                    data-aos-delay="200"
                                                >
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
                                </div>
                            )}
                            {expandedBar === index && showContent && index === 1 && (
                                <div className={styles.familyInfo} onTouchStart={handleTouchStart}>
                                    <div className={styles.wrapper_bar2}>
                                        <h2 data-aos="fade-down">Our Families</h2>
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
                            {expandedBar === index && showContent && index === 2 && (
                                <div
                                    key={`story-${showBrideStory ? 'bride' : 'groom'}`}
                                    style={slideStyle}
                                    onTouchStart={handleTouchStart}
                                >
                                    <div className={styles.wrapper_bar3}>
                                        <div className={styles.btn_map} onClick={handleMapToggle}>
                                            <FontAwesomeIcon icon={showMap ? faChevronUp : faChevronDown} />
                                        </div>
                                        <div
                                            className={`${styles.mapContainer} ${showMap ? styles.show : styles.hide}`}
                                        >
                                            <iframe
                                                src={showBrideStory ? brideMapUrl : groomMapUrl}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        </div>
                                        <div className={styles.step_3}>
                                            <div className={styles.image_3} data-aos="fade-down">
                                                <img
                                                    src={showBrideStory ? '/images/m10/3.jpg' : '/images/m10/2.jpg'}
                                                    alt={showBrideStory ? 'Bride Message' : 'Groom Message'}
                                                />
                                            </div>
                                            <div className={showBrideStory ? styles.brideName : styles.groomName}>
                                                <h1 data-aos="fade-up" data-aos-delay="200">
                                                    {showBrideStory ? 'Diễm Quỳnh' : 'Hoàng Phúc'}
                                                </h1>
                                                <div
                                                    className={`${styles.change_story__button} ${showBrideStory ? styles.bride : styles.groom}`}
                                                    onClick={handleStoryToggle}
                                                >
                                                    <FontAwesomeIcon icon={faChevronCircleDown} />
                                                </div>
                                            </div>
                                            <div className={styles.text_story}>
                                                <p>
                                                    {showBrideStory
                                                        ? 'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!'
                                                        : 'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.groomBride}>
                    <h3>Hoàng Phúc</h3>
                    <h3>Diễm Quỳnh</h3>
                </div>
            </div>
        </div>
    );
};

export default Template11;
