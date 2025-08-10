import * as React from 'react';
import styles from './13.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

function Template13() {
    return (
        <div className={styles.template13}>
            <div className={styles.wrapper}>
                <div className={styles.wrapper_imageMain}>
                    <div className={styles.image_top}>
                        <img src="/images/m13/10.jpg" alt="" />
                    </div>

                    <div className={styles.image_bottom}>
                        <img src="/images/m13/13.jpg" alt="" />
                    </div>
                </div>

                <div className={styles.familyInfo}>
                    <div className={styles.wrapper_bar2}>
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
                                <div>Anh Tuấn</div>
                                <div>Thu Hà</div>
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

                <div className={styles.groom_story}>
                    <div className={styles.story_text}>
                        <p>
                            Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                            nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                            đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người
                            con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                        </p>
                    </div>

                    <div className={styles.story_image_groom}>
                        <img src="/images/m13/3.jpg" alt="" />
                    </div>
                </div>

                <div className={styles.bride_story}>
                    <div className={styles.story_image_bride}>
                        <img src="/images/m13/5.jpg" alt="" />
                    </div>
                    <div className={styles.story_text}>
                        <p>
                            Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc
                            em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết
                            nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template13;
