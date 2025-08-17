'use client';
import * as React from 'react';
import styles from './14.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

function Template14() {
    const groomImages = ['/images/m13/5.jpg', '/images/m13/6.jpg', '/images/m13/7.jpg'];

    const brideImages = ['/images/m13/8.jpg', '/images/m13/9.jpg', '/images/m13/10.jpg'];

    const [selectedGroomImg, setSelectedGroomImg] = React.useState(groomImages[0]);
    const [selectedBrideImg, setSelectedBrideImg] = React.useState(brideImages[0]);

    return (
        <div className={styles.template14}>
            <div className={styles.wrapper}>
                <div className={styles.header_content}>
                    <div className={styles.image_flower_blue}>
                        <img src="/images/m14/14.1.jpg" alt="" />
                    </div>

                    <div className={styles.wrapper_main}>
                        <div className={styles.img_main_1}>
                            <img src="/images/m13/4.jpg" alt="" />
                        </div>

                        <div className={styles.img_main_2}>
                            <img src="/images/m13/2.jpg" alt="" />
                        </div>

                        <div className={styles.img_main_3}>
                            <img src="/images/m13/3.jpg" alt="" />
                        </div>
                    </div>

                    <div className={styles.content_header}>
                        <span>Please join us for</span>

                        <h3>The Wedding of</h3>

                        <div className={styles.groom}>Huỳnh Khánh</div>
                        <div className={styles.and}>and</div>
                        <div className={styles.bride}>Nhu Quỳnh</div>
                    </div>
                </div>

                <div className={styles.familyInfo}>
                    <div className={styles.wrapper_bar2}>
                        <div className={styles.teethTop}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={styles.tooth}></div>
                            ))}
                        </div>

                        <div className={styles.familyContainer}>
                            <h1>
                                Trân Trọng kính mời đến dự buổi tiệc
                                <br />
                                Chung vui cùng gia đình chúng tôi
                            </h1>

                            <div className={styles.flex}>
                                <div className={styles.familySide}>
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông Nguyễn Văn A</span>
                                    <span>Bà: Trần Thị B</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                                <div className={styles.familySide}>
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: Lê Văn C</span>
                                    <span>Bà: Phạm Thị D</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                            </div>

                            <div className={styles.groom_and_bride}>
                                <div>Huỳnh Khánh</div>
                                <div>Nhu Quỳnh</div>
                            </div>

                            <div className={styles.dat}>
                                Lúc: <strong>18:00 || Thứ Bảy, 17 tháng 06, 2025</strong>
                                <br />
                                <p>
                                    (Nhằm ngày <strong>23</strong> tháng <strong>06</strong> năm Ất Tỵ)
                                </p>
                                Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                            </div>
                        </div>

                        <div className={styles.teethBottom}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={styles.tooth}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.story_groom}>
                    <div className={styles.preview_select}>
                        <img src={selectedGroomImg} alt="preview" />

                        <div className={styles.flex_content}>
                            <div className={styles.list_img}>
                                {groomImages.map((src, i) => (
                                    <div
                                        key={i}
                                        className={styles[`img_story__${i + 1}`]}
                                        onClick={() => setSelectedGroomImg(src)}
                                    >
                                        <img src={src} alt={`thumb-${i}`} />
                                    </div>
                                ))}
                            </div>

                            <div className={styles.text_story}>
                                <h1>The Groom&apos;s Story</h1>
                                <p>
                                    Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng
                                    ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm
                                    tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh
                                    phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về
                                    nhà em nhé!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.story_bride}>
                    <div className={styles.preview_select}>
                        <img src={selectedBrideImg} alt="preview" />

                        <div className={styles.flex_content}>
                            <div className={styles.list_img}>
                                {brideImages.map((src, i) => (
                                    <div
                                        key={i}
                                        className={styles[`img_story__${i + 1}`]}
                                        onClick={() => setSelectedBrideImg(src)}
                                    >
                                        <img src={src} alt={`thumb-${i}`} />
                                    </div>
                                ))}
                            </div>

                            <div className={styles.text_story}>
                                <h1>The Bride&apos;s Story</h1>
                                <p>
                                    Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm,
                                    chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay
                                    chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc
                                    đong đầy anh nhé!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template14;
