'use client';

import * as React from 'react';
import styles from './18.module.css';

function Template18C() {
    return (
        <div className={styles.Template18C}>
            <div className={styles.wrapper}>
                <div className={styles.main}>
                    <div className={styles.first}>
                        <div className={styles.text1}>
                            Collection <br /> New
                        </div>
                        <div className={styles.text2}>Save the Date </div>
                        <div className={styles.text3}>
                            September <br /> 2025
                        </div>
                    </div>

                    <div className={styles.image_heade}>
                        <img src="/images/m18/7.jpg" alt="" />
                    </div>

                    <div className={styles.footer_head}>
                        LOVE IS FINDING <em>perfection</em>
                        <br /> <em> in each</em> OTHERS IMPERFECTIONS
                    </div>
                </div>

                <div className={styles.groom_story}>
                    <div className={styles.getGroom}>
                        <div className={styles.flex}>
                            <div className={styles.left}>
                                <h2>
                                    Groom <strong>Story</strong>
                                </h2>
                                <div className={styles.GroomStory}>
                                    <strong>✧</strong> Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt
                                    nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không
                                    cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng
                                    đi.
                                </div>
                                <button className={styles.location}>Show the way</button>
                            </div>
                            <div className={styles.right}>
                                <img src="/images/m18/1.jpg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bride_story}>
                    <div className={styles.getBride}>
                        <div className={styles.flex}>
                            <div className={styles.left}>
                                <img src="/images/m18/6.jpg" alt="" />
                            </div>
                            <div className={styles.right}>
                                <h2>
                                    Bride <strong>Story</strong>
                                </h2>
                                <div className={styles.BrideStory}>
                                    <strong>✧</strong> Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt
                                    nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không
                                    cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng
                                    đi.
                                </div>
                                <button className={styles.location}>Show the way</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template18C;
