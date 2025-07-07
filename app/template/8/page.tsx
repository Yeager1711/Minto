import * as React from 'react';
import styles from './8.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

function Template8() {
    return (
        <div className={styles.template8}>
            <div className={styles.wrapper}>
                <div className={styles.mainImage}>
                    <img src="/images/m8/6.jpg" alt="" />
                </div>

                <div className={styles.info}>
                    <h3>
                        join us to celebrate
                        <br />
                        <strong> the Wedding Of</strong>
                    </h3>

                    <div className={styles.groom_name}>Thiên Phúc</div>
                    <div className={styles.and}>&</div>
                    <div className={styles.bride_name}>Mai Thảo</div>

                    <div className={styles.specific_time}>
                        <h4>
                            Lúc: <strong>10:00</strong> AM || Chủ Nhật, 17 Tháng 05, 2025{' '}
                        </h4>
                        <span>Đến dự buổi tiệc cùng gia đình chúng tôi.</span>

                        <div className={styles.info_family}>
                            <div className={styles.groom_family}>
                                <span> * Nhà trai</span>
                                <h3>Ông: Nguyễn văn A</h3>
                                <h3>Bà: Trần Thị B</h3>
                                <p>D/C: Long Tiên, Cai Lậy, Đồng Tháp</p>
                            </div>

                            <div className={styles.bride_family}>
                                <span> * Nhà gái</span>
                                <h3>Ông: Lê văn C</h3>
                                <h3>Bà: Phạm thị D</h3>
                                <p>D/C: Long Tiên, Cai Lậy, Đồng Tháp</p>{' '}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_story__love}>
                    <div className={styles.card_story__groom}>
                        <h1>The Groom Story</h1>
                        <div className={styles.groom_name}>Thiên Phúc</div>
                        <p className={styles.text_story}>
                            Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                            nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                            đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người
                            con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                        </p>

                        <div className={styles.vector_img__groom}>
                            <img src="/images/m8/1.jpg" alt="" />

                            <div className={styles.btn_map}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                Chỉ đường Google map 
                            </div>
                        </div>
                    </div>

                    <div className={styles.card_story__bride}>
                        <h1>The Bride Story</h1>
                        <div className={styles.bride_name}>Mai Thảo</div>
                        <p className={styles.text_story}>
                            Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc
                            em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết
                            nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!
                        </p>

                        <div className={styles.vector_img__bride}>
                            <img src="/images/m8/2.jpg" alt="" />

                            <div className={styles.btn_map}>
                                <FontAwesomeIcon icon={faLocationDot} />
                                Chỉ đường Google map
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.album_wedding}>
                    <div className={styles.title}>Album Wedding</div>

                    <div className={styles.bento_grid}>
                        {/*phần ảnh được cho phép chỉnh sửa */}

                        <div className={styles.boxTall}>
                            <img src="/images/m8/11.jpg" alt="" />
                        </div>
                        <div className={styles.boxTall}>
                            <img src="/images/m8/2.jpg" alt="" />
                        </div>
                        <div className={styles.boxTall}>
                            <img src="/images/m8/12.jpg" alt="" />
                        </div>
                        <div className={styles.boxWide}>
                            <img src="/images/m8/6.jpg" alt="" />
                        </div>
                        <div className={styles.box}>
                            <img src="/images/m8/11.jpg" alt="" />
                        </div>
                        <div className={styles.boxTall}>
                            <img src="/images/m8/13.jpg" alt="" />
                        </div>
                        <div className={styles.boxWide}>
                            <img src="/images/m8/14.jpg" alt="" />
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.column_text}>
                        <h3>Thank You</h3>
                        <span className={styles.subtext}>
                            Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                            <br />
                            trong ngày đặc biệt của chúng tôi.
                        </span>
                    </div>

                    <img src="/images/m7/ft_m7.png" alt="" />
                </div>
            </div>
        </div>
    );
}

export default Template8;
