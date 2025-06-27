import React from 'react';
import styles from './6.module.css';

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
                        </div>
                        <div className={styles.representative_house}>
                            <span>Nhà gái</span>
                            <h3>Ông: Lê văn C</h3>
                            <h3>Bà: Phạm thị D</h3>
                        </div>
                    </div>

                    <p className={styles.text}>
                        Trân Trọng kính mời Quý Khách tới tham dự
                        <br />
                        Lễ Thành Hôn của hai con chúng tôi
                    </p>

                    <p className={styles.at}>Vào lúc 10:00</p>
                    <div className={styles.dateBox}>
                        <div>
                            Thứ <br />
                            Ba
                        </div>
                        <div className={styles.day}>
                            NGÀY
                            <br />
                            <strong>28</strong>
                        </div>
                        <div>
                            THÁNG
                            <br />
                            08
                        </div>
                    </div>
                    <p className={styles.year}>Năm 2025</p>
                    <p className={styles.lunarDay}>Tức 17 tháng 11 năm ất tỵ </p>
                    <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                </div>
            </div>
        </div>
    );
}

export default Template6;
