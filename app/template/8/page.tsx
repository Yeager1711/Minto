'use client';
import * as React from 'react';
import Image from 'next/image';
import styles from './8.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useDisableDevTools } from 'app/Ultils/useDisableDevTools';

const Template8: React.FC = () => {
    const [showGroomMap, setShowGroomMap] = React.useState<boolean>(false);
    const [showBrideMap, setShowBrideMap] = React.useState<boolean>(false);
    const [timeLeft, setTimeLeft] = React.useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useDisableDevTools();

    const openGroomMapInGoogle = () => {
        const groomMapUrl = 'https://www.google.com/maps?q=-37.82425,144.956&hl=vi';
        window.open(groomMapUrl, '_blank');
    };

    const openBrideMapInGoogle = () => {
        const brideMapUrl = 'https://www.google.com/maps?q=-37.83333,144.96667&hl=vi';
        window.open(brideMapUrl, '_blank');
    };

    const toggleGroomMap = () => {
        setShowGroomMap(!showGroomMap);
        setShowBrideMap(false);
    };

    const toggleBrideMap = () => {
        setShowBrideMap(!showBrideMap);
        setShowGroomMap(false);
    };

    React.useEffect(() => {
        const weddingDate = new Date('2025-08-17T10:00:00+07:00').getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const timeDiff = weddingDate - now;

            if (timeDiff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.template8}>
            <div className={styles.wrapper}>
                <div className={styles.mainImage}>
                    <Image src="/images/m8/6.jpg" alt="Wedding main image" width={500} height={500} />
                </div>

                <div className={styles.hy}>
                    <Image src="/images/m8/hy.png" alt="Decorative image" width={500} height={200} />
                </div>
                <div className={styles.info}>
                    <div className={styles.bg}>
                        <img src="/images/m8/nen_1.png"/>
                    </div>
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
                            Lúc: <strong>10:00</strong> AM || Chủ Nhật, 17 Tháng 08, 2025{' '}
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
                                <p>D/C: Long Tiên, Cai Lậy, Đồng Tháp</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wrapper_story__love}>
                    <div className={styles.card_story__groom}>
                        <h1>The Groom&apos;s Story</h1>
                        <div className={styles.groom_name}>Thiên Phúc</div>
                        <p className={styles.text_story}>
                            Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp
                            nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là
                            đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người
                            con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!
                        </p>

                        <div className={styles.vector_img__groom}>
                            {!showGroomMap && (
                                <Image src="/images/m8/1.jpg" alt="Groom image" width={300} height={300} />
                            )}
                            {showGroomMap && (
                                <div className={styles.map_groom}>
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3738.3485078753038!2d144.95328557660184!3d-37.824275334640106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzfCsDQ5JzI3LjQiUyAxNDTCsDU3JzIxLjEiRQ!5e1!3m2!1svi!2s!4v1751947230997!5m2!1svi!2s"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}

                            <div
                                className={styles.btn_map}
                                onClick={showGroomMap ? openGroomMapInGoogle : toggleGroomMap}
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showGroomMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>

                    <div className={styles.card_story__bride}>
                        <h1>The Bride&apos;s Story</h1>
                        <div className={styles.bride_name}>Mai Thảo</div>
                        <p className={styles.text_story}>
                            Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc
                            em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết
                            nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!
                        </p>

                        <div className={styles.vector_img__bride}>
                            {!showBrideMap && (
                                <Image src="/images/m8/2.jpg" alt="Bride image" width={300} height={300} />
                            )}
                            {showBrideMap && (
                                <div className={styles.map_bride}>
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3738.3485078753038!2d144.96328557660184!3d-37.833333334640106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzfCsDUwJzAwLjAiUyAxNDTCsDU3JzQ4LjEiRQ!5e1!3m2!1svi!2s!4v1751947230997!5m2!1svi!2s"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}

                            <div
                                className={styles.btn_map}
                                onClick={showBrideMap ? openBrideMapInGoogle : toggleBrideMap}
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                {showBrideMap ? 'Mở map lớn' : 'Chỉ đường Google map'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.count}>
                    <div className={styles.countdown}>
                        <div className={styles.countdown_bg}></div>
                        <div className={styles.countdown_content}>
                            <h2>Đếm ngược đến ngày cưới</h2>
                            <div className={styles.countdown_timer}>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.days}</span>
                                    <span className={styles.time_label}>Ngày</span>
                                </div>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.hours}</span>
                                    <span className={styles.time_label}>Giờ</span>
                                </div>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.minutes}</span>
                                    <span className={styles.time_label}>Phút</span>
                                </div>
                                <div className={styles.time_unit}>
                                    <span className={styles.time_value}>{timeLeft.seconds}</span>
                                    <span className={styles.time_label}>Giây</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.album_wedding}>
                    <div className={styles.title}>Album Wedding</div>

                    <div className={styles.bento_grid}>
                        <div className={styles.boxTall}>
                            <Image src="/images/m8/11.jpg" alt="Wedding photo 1" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src="/images/m8/2.jpg" alt="Wedding photo 2" width={200} height={300} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src="/images/m8/12.jpg" alt="Wedding photo 3" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide}>
                            <Image src="/images/m8/6.jpg" alt="Wedding photo 4" width={400} height={200} />
                        </div>
                        <div className={styles.box}>
                            <Image src="/images/m8/11.jpg" alt="Wedding photo 5" width={200} height={200} />
                        </div>
                        <div className={styles.boxTall}>
                            <Image src="/images/m8/13.jpg" alt="Wedding photo 6" width={200} height={300} />
                        </div>
                        <div className={styles.boxWide}>
                            <Image src="/images/m8/14.jpg" alt="Wedding photo 7" width={400} height={200} />
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

                    <Image src="/images/m7/ft_m7.png" alt="Footer image" width={500} height={200} />
                </div>
            </div>
        </div>
    );
};

export default Template8;
