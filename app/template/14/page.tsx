'use client';
import * as React from 'react';
import styles from './14.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

function Template14() {
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
                        {/* răng cưa trên */}
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

                        {/* răng cưa dưới */}
                        <div className={styles.teethBottom}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className={styles.tooth}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template14;
