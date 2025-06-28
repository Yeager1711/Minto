import React from 'react';
import styles from './6.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

function Template6() {
    return (
        <div className={styles.template6}>
            <div className={styles.wrapper}>
                <div className={styles.mainImage}>
                    <img src="/images/m6/2.jpg" alt="Wedding couple" />
                    <div className={styles.overlay}>
                        <div className={styles.content}>
                            <div className={styles.saveTheDate}>Save the Date</div>
                            <div className={styles.weddingOf}>THE WEDDING OF</div>
                            <div className={styles.names}>
                                <div className={styles.names_flex}>
                                    <div>Việt anh</div>
                                    <div className={styles.and}>&</div>
                                    <div>Ngọc Khánh</div>
                                </div>
                            </div>
                            <div className={styles.dateTime}>17 Tháng 8, 2025 | Thứ 3, Lúc: 10:00 AM</div>
                        </div>
                    </div>
                </div>

                <div className={styles.info_family}>
                    <div className={styles.flex_representative}>
                        <div className={styles.representative_house}>
                            <span>Nhà trai</span>
                            <h3>Ông: Nguyễn văn A</h3>
                            <h3>Bà: Trần Thị B</h3>
                        </div>
                        <div className={styles.representative_house}>
                            <span>Nhà gái</span>
                            <h3>Ông: Lê văn C</h3>
                            <h3>Bà: Phạm thị D</h3>
                        </div>
                    </div>

                    <div className={styles.name_groom__bride}>
                        <div className={styles.groom_name}>Việt Anh</div>
                        <div className={styles.image_happy}>
                            <img src="/images/m6/happy_img.png" alt="" />
                        </div>
                        <div className={styles.bride_name}>Ngọc Khánh</div>
                    </div>

                    <p className={styles.text}>
                        Trân trọng kính mời Quý Khách
                        <br />
                        Đến dự Lễ Thành Hôn của hai con chúng tôi
                    </p>

                    <div className={styles.flex}>
                        <div className={styles.flex_left}>
                            <p className={styles.at}>Lúc 10:00</p>
                            <div className={styles.dateBox}>
                                <div>Thứ Ba</div>
                                <div className={styles.day}>
                                    <strong>17</strong>
                                </div>
                                <div className={styles.month}>
                                    <strong>08</strong>
                                </div>
                            </div>
                            <p className={styles.year}>
                                <strong>2025</strong>
                            </p>
                        </div>

                        <div className={styles.flex_right}>
                            <div className={styles.address_groom}>
                                <h3>Địa chỉ nhà Trai</h3>
                                <p>Trung Tâm Hội Nghị - Tiệc Cưới Diamond Place</p>

                                <button className={styles.btn_location}>
                                    {' '}
                                    <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                </button>
                            </div>

                            <div className={styles.address_bride}>
                                <h3>Địa chỉ nhà Trai</h3>
                                <p>Trung Tâm Hội Nghị - Tiệc Cưới Diamond Place</p>

                                <button className={styles.btn_location}>
                                    {' '}
                                    <FontAwesomeIcon icon={faLocationDot} /> Chỉ đường địa điểm tổ chức
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className={styles.lunarDay}>(Nhằm Ngày 24 tháng 06 năm ất tỵ)</p>
                    <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                </div>

                <div className={styles.flex_photo}>
                    <div className={styles.box_photo}>
                        <img src="/images/m6/1.jpg" alt="" />
                    </div>

                    <div className={styles.box_photo}>
                        <img src="/images/m6/2.jpg" alt="" />
                    </div>

                    <div className={styles.box_photo}>
                        <img src="/images/m6/3.jpg" alt="" />
                    </div>
                </div>

                <div className={styles.love_story}>
                    <div className={styles.title}>
                        <img src="/images/m6/love_story.png" alt="" />
                    </div>

                    <div className={styles.groom}>
                        <div className={styles.wrapper_groom}>
                            <div className={styles.image_groom}>
                                <img src="/images/m6/4.jpg" alt="" />
                            </div>
                            <div className={styles.groom_name__story}>
                                <p>Chú Rể</p>
                                <h3>Việt Anh</h3>
                            </div>
                        </div>
                        <div className={styles.groom_str}>
                            <p>
                                Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày
                                đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp
                                nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp
                                được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                            </p>
                        </div>
                    </div>
                    <div className={styles.bride}>
                        <div className={styles.wrapper_bride}>
                            <div className={styles.bride_name__story}>
                                <p>Cô dâu</p>
                                <h3>Ngọc Khánh</h3>
                            </div>
                            <div className={styles.image_bride}>
                                <img src="/images/m6/2.jpg" alt="" />
                            </div>
                        </div>
                        <div className={styles.bride_str}>
                            <p>
                                Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm
                                sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta
                                sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh
                                nhé!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template6;
