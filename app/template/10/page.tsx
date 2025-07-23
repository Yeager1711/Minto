import * as React from 'react';
import styles from './10.module.css';

function Template10() {
    const imageUrl = '/images/m8/19.jpg'; // Replace with your uploaded image path

    // From your SCSS
    const hexPositions = [
        { top: -215, right: 300 }, // hex0
        { top: -220, right: -155 }, // hex1
        { top: 95, right: 70 }, // hex2
        { top: 96, right: 518 }, // hex3
        { top: 406, right: 288 }, // hex4
        { top: 405, right: -165 }, // hex5
        { top: 717, right: 60 }, // hex6
    ];

    const wrapperWidth = 300;
    const wrapperHeight = 450;

    return (
        <div className={styles.template10}>
            <div className={styles.wrapper}>
                <div className={styles.pss}>
                    <div className={styles.main}>
                        <div className={styles.text}>
                            <span className={styles.line_shortest}></span>
                        </div>

                        <div className={styles.hexWrapper}>
                            {hexPositions.map((pos, i) => {
                                const bgX = ((wrapperWidth - pos.right) / wrapperWidth) * 100;
                                const bgY = (pos.top / wrapperHeight) * 100;

                                return (
                                    <div key={i} className={`${styles.hex} ${styles[`hex${i}`]}`}>
                                        <div
                                            className={styles.hexIn}
                                            style={{
                                                backgroundImage: `url(${imageUrl})`,
                                                backgroundPosition: `${bgX}% ${bgY}%`,
                                                backgroundSize: `${wrapperWidth}px ${wrapperHeight}px`,
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.text_info}>
                            <div className={styles.date}>01 tháng 10 năm 2025</div>
                            <div className={styles.decorLeft} />
                            <h1 className={styles.groom_name}>Nhật thành</h1>
                            <h1 className={styles.bride_name}>Khánh an</h1>

                            <p className={styles.description}>
                                Với tất cả tình yêu và lòng biết ơn,
                                <br />
                                chúng tôi hân hoan mời bạn đến chứng kiến khoảnh khắc
                                <br />
                                hai tâm hồn hoà làm một trong lời hứa trọn đời,
                                <br />
                                giữa vòng tay ấm áp của gia đình và những người thân yêu.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.story_groom}>
                    <div className={styles.torn_paper__top}>
                        <img src="/images/m10/tornpaper.png" alt="" />
                    </div>
                    <div className={styles.story_groom__wrapper}>
                        <h1>The Bride&apos;s Story</h1>

                        <h3 className={styles.for_groom}>NHật thành</h3>

                        <span className={styles.story_text}>
                            Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                            nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                            đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người
                            con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                        </span>
                    </div>
                </div>

                <div className={styles.story_bride}>
                    <div className={styles.story_bride__wrapper}>
                        <h1>The Bride&apos;s Story</h1>

                        <h3 className={styles.for_bride}>Khánh An</h3>

                        <span className={styles.story_text}>
                            Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                            nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                            đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người
                            con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template10;
