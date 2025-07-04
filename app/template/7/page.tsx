'use client';
import * as React from 'react';
import { useState } from 'react';
import styles from './7.module.css';

function Template7() {
    const [showGroomMap, setShowGroomMap] = useState(false);
    const [showBrideMap, setShowBrideMap] = useState(false);

    const handleGroomMapClick = () => {
        setShowGroomMap(!showGroomMap);
        setShowBrideMap(false); // Đảm bảo chỉ một bản đồ hiển thị
    };

    const handleBrideMapClick = () => {
        setShowBrideMap(!showBrideMap);
        setShowGroomMap(false); // Đảm bảo chỉ một bản đồ hiển thị
    };

    const openGroomMapInGoogle = () => {
        const groomMapUrl = 'https://www.google.com/maps?q=-37.82425,144.956&hl=vi';
        window.open(groomMapUrl, '_blank');
    };

    const openBrideMapInGoogle = () => {
        const brideMapUrl = 'https://www.google.com/maps?q=-37.83333,144.96667&hl=vi';
        window.open(brideMapUrl, '_blank');
    };

    return (
        <div className={styles.template7}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <div className={styles.mainImage}>
                        <img src="/images/m7/4.jpg" alt="" />
                    </div>
                    <div className={styles.overlay_content}>
                        <div className={styles.layout_paper}>
                            <img src="/images/text_png/png_5.png" alt="" />

                            <div className={styles.content}>
                                <div className={styles.saveTheDate}>
                                    <img src="/images/text_png/std_text2.png" alt="" />
                                </div>
                                <div className={styles.weddingOf}>THE WEDDING OF</div>
                                <div className={styles.names}>
                                    <div className={styles.names_flex}>
                                        <div>Nam Khánh</div>
                                        <div className={styles.and}>&</div>
                                        <div>Trúc Lam</div>
                                    </div>
                                </div>
                                <div className={styles.dateTime}>17 Tháng 8, 2025 | Chủ Nhật, Lúc: 10:00 AM</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.info_family}>
                    <div className={styles.wrapper_info}>
                        <div className={styles.flex_representative}>
                            <div className={styles.representative_house}>
                                <span>Nhà trai</span>
                                <h3>Ông: Nguyễn văn An</h3>
                                <h3>Bà: Trần Thị Bảy</h3>
                            </div>
                            <div className={styles.representative_house}>
                                <span>Nhà gái</span>
                                <h3>Ông: Lê văn Chung</h3>
                                <h3>Bà: Phạm thị Dung</h3>
                            </div>
                        </div>

                        <div className={styles.name_groom__bride}>
                            <div className={styles.groom_name}>Nam Khánh</div>
                            <div className={styles.and_happy}>&</div>
                            <div className={styles.bride_name}>Trúc Lam</div>
                        </div>

                        <p className={styles.text}>
                            Trân trọng kính mời Quý Khách
                            <br />
                            Đến dự Lễ Thành Hôn của hai con chúng tôi
                        </p>

                        <p className={styles.lunarDay}>(Nhằm Ngày 24 tháng 06 năm ất tỵ)</p>
                        <p className={styles.note}>Rất hân hạnh được đón tiếp!</p>
                    </div>
                </div>

                <div className={styles.groom_bride}>
                    <div className={styles.groom_bride__wrapper}>
                        <div className={styles.groom}>
                            <div className={styles.img_groom}>
                                <img src="/images/m7/2.jpg" alt="" />
                            </div>
                            <div className={styles.info}>
                                <span>Chú rể</span>
                                <div className={styles.name}>Nam Khánh</div>
                            </div>
                        </div>

                        <div className={styles.love_story__groom}>
                            <p>
                                Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày
                                đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp
                                nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp
                                được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.bride_bride}>
                    <div className={styles.bride_bride__wrapper}>
                        <div className={styles.bride}>
                            <div className={styles.info}>
                                <span>Cô Dâu</span>
                                <div className={styles.name}>Trúc Lam</div>
                            </div>

                            <div className={styles.img_bride}>
                                <img src="/images/m7/1.jpg" alt="" />
                            </div>
                        </div>

                        <div className={styles.love_story__bride}>
                            <p>
                                Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm
                                sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta
                                sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh
                                nhé!
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.location}>
                    <div className={styles.wrapper_img__location}>
                        <div className={styles.img_top}>
                            {!showGroomMap && <img src="/images/m7/3.jpg" alt="" />}
                            {showGroomMap && (
                                <div className={styles.map_groom}>
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3738.3500072527318!2d144.956!3d-37.82425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzfCsDQ5JzI3LjMiUyAxNDTCsDU3JzIxLjYiRQ!5e1!3m2!1svi!2s!4v1751528807328!5m2!1svi!2s"
                                        width="600"
                                        height="450"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>

                        <div className={styles.torn_paper}>
                            <img src="/images/text_png/top_bottom.png" alt="" />
                            <div className={styles.show_theWay}>
                                <h3>Địa điểm tổ chức</h3>

                                <div className={styles.flex_location}>
                                    <button
                                        className={styles.btn_showTheway__groom}
                                        onClick={() => {
                                            handleGroomMapClick();
                                            if (showGroomMap) {
                                                openGroomMapInGoogle();
                                            }
                                        }}
                                    >
                                        {showGroomMap ? 'Xem trên bản đồ lớn' : 'Google map nhà trai'}
                                    </button>
                                    <button
                                        className={styles.btn_showTheway__bride}
                                        onClick={() => {
                                            handleBrideMapClick();
                                            if (showBrideMap) {
                                                openBrideMapInGoogle();
                                            }
                                        }}
                                    >
                                        {showBrideMap ? 'Xem trên bản đồ lớn' : 'Google map nhà gái'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.img_bottom}>
                            {!showBrideMap && <img src="/images/m7/8.jpg" alt="" />}
                            {showBrideMap && (
                                <div className={styles.map_bride}>
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3738.3500072527318!2d144.96667!3d-37.83333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzfCsDUwJzAwLjAiUyAxNDTCsDU4JzAwLjAiRQ!5e1!3m2!1svi!2s!4v1751528807328!5m2!1svi!2s"
                                        width="100%"
                                        height="100%"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template7;
