'use client';
import * as React from 'react';
import styles from './10.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';
import Image from 'next/image';

function Template10() {
    const imageUrl = '/images/m10/5.jpg'; // Replace with your uploaded image path
    useDisableDevTools();
    // const [showGroomMap, setShowGroomMap] = React.useState<boolean>(false);
    // const [showBrideMap, setShowBrideMap] = React.useState<boolean>(false);

    // const openGroomMapInGoogle = () => {
    //     const groomMapUrl = 'https://www.google.com/maps?q=-37.82425,144.956&hl=vi';
    //     window.open(groomMapUrl, '_blank');
    // };

    // const openBrideMapInGoogle = () => {
    //     const brideMapUrl = 'https://www.google.com/maps?q=-37.83333,144.96667&hl=vi';
    //     window.open(brideMapUrl, '_blank');
    // };

    // const toggleGroomMap = () => {
    //     setShowGroomMap(!showGroomMap);
    //     setShowBrideMap(false);
    // };

    // const toggleBrideMap = () => {
    //     setShowBrideMap(!showBrideMap);
    //     setShowGroomMap(false);
    // };

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

    // Wedding date (dynamic, can be passed as prop or state in a real app)
    const weddingDate = new Date(2025, 7, 17); // August 17, 2025
    const year = weddingDate.getFullYear();
    const month = weddingDate.getMonth(); // 7 (August)
    const weddingDay = weddingDate.getDate(); // 17

    // Calendar logic
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 5 (Friday for August 1, 2025)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 31 days in August
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null); // Empty cells before the 1st
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }
    while (calendarDays.length < 42) {
        calendarDays.push(null); // Pad remaining cells
    }

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
                            <h1 className={styles.groom_name}>Nhật Thành</h1>
                            <h1 className={styles.bride_name}>Khánh An</h1>

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
                    <div className={styles.story_groom__wrapper}>
                        <h1>The Bride&apos;s Story</h1>

                        <h3 className={styles.for_groom}>Nhật Thành</h3>

                        <span className={styles.story_text}>
                            Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                            nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                            đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người
                            con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                        </span>
                    </div>

                    <div className={styles.flex_image_groom}>
                        <div className={styles.box_image}>
                            <img src="/images/m10/1.jpg" alt="" />
                        </div>
                        <div className={styles.box_image}>
                            <img src="/images/m10/2.jpg" alt="" />
                        </div>

                        <div className={styles.box_image}>
                            <img src="/images/m10/3.jpg" alt="" />
                        </div>
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

                    <div className={styles.flex_image_groom}>
                        <div className={styles.box_image}>
                            <img src="/images/m10/4.jpg" alt="" />
                        </div>
                        <div className={styles.box_image}>
                            <img src="/images/m10/7.jpg" alt="" />
                        </div>

                        <div className={styles.box_image}>
                            <img src="/images/m10/6.jpg" alt="" />
                        </div>
                    </div>
                </div>

                <div className={styles.info}>
                    <h3>
                        Trân Trọng kính mời đến dự buổi tiệc
                        <br />
                        <strong> Chung vui cùng gia đình chúng tôi</strong>
                    </h3>

                    <div className={styles.specific_time}>
                        <div className={styles.info_family}>
                            <div className={styles.groom_family}>
                                <span> * Nhà trai</span>
                                <h3>Ông: Nguyễn Văn A</h3>
                                <h3>Bà: Trần Thị B</h3>
                                <p>D/C: Long Tiên, Cai Lậy, Đồng Tháp</p>
                            </div>

                            <div className={styles.bride_family}>
                                <span> * Nhà gái</span>
                                <h3>Ông: Lê Văn C</h3>
                                <h3>Bà: Phạm Thị D</h3>
                                <p>D/C: Long Tiên, Cai Lậy, Đồng Tháp</p>
                            </div>
                        </div>

                        <div className={styles.groom_name}>Nhật Thành</div>
                        <div className={styles.and}>&</div>
                        <div className={styles.bride_name}>Khánh An</div>

                        <h4>
                            Lúc: <strong>10:00</strong> AM || Chủ Nhật, 17 Tháng 08, 2025{' '}
                        </h4>

                        <span className={styles.lunar_day}>(Nhằm ngày 17 tháng 06 năm Ất Tỵ)</span>
                    </div>
                </div>

                <div className={styles.flex_time_details}>
                    <div className={styles.image}>
                        <img src="/images/m10/5.jpg" alt="" />
                    </div>

                    <div className={styles.box}>
                        <h1>Save the date</h1>

                        <span>17.08.2025</span>
                    </div>
                </div>

                <div className={styles.calendar}>
                    <div className={styles.calendarHeader}>
                        <h3>Tháng 8, 2025</h3>
                    </div>
                    <div className={styles.calendarGrid}>
                        <div className={styles.dayName}>CN</div>
                        <div className={styles.dayName}>T2</div>
                        <div className={styles.dayName}>T3</div>
                        <div className={styles.dayName}>T4</div>
                        <div className={styles.dayName}>T5</div>
                        <div className={styles.dayName}>T6</div>
                        <div className={styles.dayName}>T7</div>
                        {calendarDays.map((day, index) => {
                            const isWeddingDay = day === weddingDay;
                            const isValidDay = day !== null;
                            return (
                                <div
                                    key={index}
                                    className={`${styles.calendarDay} ${isWeddingDay ? styles.weddingDay : ''} ${
                                        !isValidDay ? styles.emptyDay : ''
                                    }`}
                                >
                                    {isValidDay && (
                                        <>
                                            {isWeddingDay ? (
                                                <span className={styles.weddingDayContent}>
                                                    {day}
                                                    <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
                                                </span>
                                            ) : (
                                                day
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.wrapper_map}>
                    <div className={styles.flex_btn__map}>
                        <button className={styles.map_groom}>Chỉ đường chú rể</button>
                        <button className={styles.map_bride}>Chỉ đường cô dâu</button>
                    </div>

                    <div className={styles.google_map}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3738.3516181118!2d144.95751228544066!3d-37.824213933796784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5173a284b5%3A0x958eeaf04deea384!2sMelbourne%20Convention%20and%20Exhibition%20Centre%20(MCEC)!5e1!3m2!1svi!2s!4v1753260762040!5m2!1svi!2s"
                            width=""
                            height=""
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>

                <div className={styles.album_wedding}>
                    <div className={styles.title}>Album Wedding</div>

                    <div className={styles.bento_grid}>
                        {/* phần ảnh này được thay đổi */}
                        <div className={styles.boxTall}>
                            <Image src="/images/m10/1.jpg" alt="Wedding photo 1" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src="/images/m10/2.jpg" alt="Wedding photo 2" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src="/images/m10/3.jpg" alt="Wedding photo 3" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide}>
                            <Image src="/images/m10/9.jpg" alt="Wedding photo 4" width={400} height={200} />
                        </div>
                        <div className={styles.box}>
                            <Image src="/images/m10/5.jpg" alt="Wedding photo 5" width={200} height={200} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src="/images/m10/6.jpg" alt="Wedding photo 6" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide}>
                            <Image src="/images/m10/10.jpg" alt="Wedding photo 7" width={400} height={200} />
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
                </div>
            </div>
        </div>
    );
}

export default Template10;
