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
                            <div className={styles.names}>Việt anh & Hoài Phương</div>
                            <div className={styles.dateTime}>28 Tháng 8, 2025 | Thứ 3, Lúc: 10 AM</div>
                        </div>
                    </div>
                </div>

                <div className={styles.info_family}>
                    <div className={styles.flex_representative}>
                        <div className={styles.representative_house}>
                            <span>Nhà trai</span>
                            <h3>Ông: Nguyễn văn A</h3>
                            <h3>Bà: Trần Thị B</h3>
                            <p className={styles.address}>Trung Tâm Hội Nghị - Tiệc Cưới Diamond Place</p>
                        </div>
                        <div className={styles.representative_house}>
                            <span>Nhà gái</span>
                            <h3>Ông: Lê văn C</h3>
                            <h3>Bà: Phạm thị D</h3>
                            <p className={styles.address}>Trung Tâm Hội Nghị - Tiệc Cưới Diamond Place</p>
                        </div>
                    </div>

                    <p className={styles.text}>
                        Trân Trọng kính mời Quý Khách
                        <br />
                        Đến dự Lễ Thành Hôn của hai con chúng tôi
                    </p>

                    <div className={styles.flex}>
                        <div className={styles.flex_left}>
                            <p className={styles.at}>Lúc 10:00</p>
                            <div className={styles.dateBox}>
                                <div>Thứ Ba</div>
                                <div className={styles.day}>
                                    <strong>28</strong>
                                </div>
                                <div className={styles.month}>
                                    <strong>28</strong>
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
                    <p className={styles.lunarDay}>(Tức 17 tháng 11 năm ất tỵ )</p>
                    <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                </div>
            </div>
        </div>
    );
}

export default Template6;
