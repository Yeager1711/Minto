'use client';

import * as React from 'react';
import styles from './db.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

function DB() {
    return (
        <div className={styles.db}>
            <div className={styles.wrapper}>
                <div className={styles.img_header}>
                    <img src="/images/db/1.png" alt="" />

                    <div className={styles.overlay}>
                        <div className={styles.card}>
                            <h2>THIỆP MỜI</h2>
                            <p>
                                Trân trọng mời các em đến tham dự buổi tiệc chia tay nhân dịp về hưu. đây là dịp để
                                chúng ta cùng nhau ôn lại những kỉ niệm, những khoảnh khắc đáng nhớ, khép lại hành trình
                                35 năm con đường sự ngiệp để bước ra một chặng đường mới đầy ý nghĩa phía trước!
                            </p>
                            <p className={styles.ready}>Rất mong được đón tiếp sự hiện diện của bạn!</p>
                            <button className={styles.btn}>
                                THAM DỰ NGAY <FontAwesomeIcon icon={faHeart} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.img_top}>
                        <img src="/images/db/2.png" alt="" />
                    </div>
                    <div className={styles.text}>
                        <div className={styles.h1}>Trân trọng kính mời</div>
                        <p>
                            Anh/Chị đến tham dự buổi tiệc chia tay nhân dịp nghỉ hưu
                            <br />
                            Đây là dịp để cùng nhau ôn lại kỷ niệm và tri ân <br /> chặng đường đã qua.
                        </p>
                        <h3>Tại Tư Gia | 161 Lê Khả Phiêu, Khu phố 55, P.55, TP.HCM</h3>
                        <h4>17:00 | 29.08.2025</h4>

                        <div className={styles.schedule}>
                            <div className={styles.column}>
                                <h5>Khung thời gian</h5>
                                <ul className={styles.left}>
                                    <li>17:00 - 17:30</li>
                                    <li>17:30 - 18:30</li>
                                    <li>18:30 - 20:00</li>
                                </ul>
                            </div>
                            <div className={styles.column}>
                                <h5>Nội dung</h5>
                                <ul className={styles.right}>
                                    <li>Đón khách</li>
                                    <li>Ôn lại kỷ niệm & Tri ân</li>
                                    <li>Giao lưu & Tiệc chia tay</li>
                                </ul>
                            </div>
                        </div>

                        <p className={styles.note}>
                            <strong>*Sự kiện chỉ dành cho những khách mời đặc.*</strong>
                        </p>
                    </div>

                    <div className={styles.img_bottom}>
                        <img src="/images/db/4.png" alt="" />
                    </div>
                </div>

                <div className={styles.events}>
                    <h2>Những Dấu Ấn Đáng Nhớ</h2>
                    <div className={styles.timeline}>
                        <div className={`${styles.event} ${styles.left}`}>
                            <img src="/images/db/11.jpg" alt="Ngày đầu tiên" />
                            <div className={styles.caption}>
                                <h3>Ngày đầu tiên vào công ty</h3>
                                <p>Bỡ ngỡ xen lẫn háo hức khi bắt đầu hành trình mới cùng đồng nghiệp.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`}>
                            <img src="/images/db/12.jpg" alt="Những ngày tháng gắn bó" />
                            <div className={styles.caption}>
                                <h3>Những ngày tháng gắn bó</h3>
                                <p>Những bữa cơm trưa, dự án và nụ cười đã trở thành kỷ niệm quý giá.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.left}`}>
                            <img src="/images/db/16.jpg" alt="Dự án đầu tiên" />
                            <div className={styles.caption}>
                                <h3>Dự án đầu tiên – thử thách</h3>
                                <p>
                                    Bằng nỗ lực và đam mê, thành công đầu tiên đã tạo nền móng vững chắc cho sự nghiệp.
                                </p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`}>
                            <img src="/images/db/18.jpg" alt="Đồng nghiệp như gia đình" />
                            <div className={styles.caption}>
                                <h3>Đồng nghiệp như gia đình</h3>
                                <p>Tình cảm gắn bó như anh em một nhà, sẻ chia công việc và cả trong cuộc sống.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.left}`}>
                            <img src="/images/db/27.jpg" alt="Khoảnh khắc tập thể" />
                            <div className={styles.caption}>
                                <h3>Khoảnh khắc tập thể</h3>
                                <p>Những chuyến đi chơi, hội thao và hoạt động tập thể trở thành ký ức quý giá.</p>
                            </div>
                        </div>

                        <div className={`${styles.event} ${styles.right}`}>
                            <img src="/images/db/31.jpg" alt="Ngày nghỉ hưu" />
                            <div className={styles.caption}>
                                <h3>Khép lại – Mở ra</h3>
                                <p>35 năm một hành trình, hôm nay khép lại để mở ra chặng đường mới đầy ý nghĩa.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DB;
