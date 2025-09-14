import * as React from 'react';
import styles from './17.module.css';

function Template17C() {
    return (
        <div className={styles.template17c}>
            <div className={styles.wrapper}>
                <div className={styles.first}>
                    {/* <div className={styles.vignette_img}>
                        <img src="/images/m17/vignette.png" alt="" />
                    </div> */}
                    <div className={styles.text_1}>
                        TOGETHER WITH OUR FAMILIES INVITE YOU TO <br /> JOIN US IN CELEBRATING OUR WEDDING
                    </div>

                    <div className={styles.center_pss}>
                        <div className={styles.center_abs}>
                            <div className={styles.text_2}>
                                WITH GREAT <br /> PLEASURE THAT WE
                            </div>

                            <div className={styles.groom_name}>
                                Quốc Hưng
                                <div className={styles.plus}>And</div>
                            </div>
                            <div className={styles.bride_name}>Bảo Yến</div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.text_3}>Sincerely Invite You</div>
                        <div className={styles.text_4}>Join us to celebrate our wedding and happiness</div>
                        <div className={styles.DateTime}>28.09.2025</div>
                        {/* <div className={styles.lunar}>(Nhằm ngày 28/08 năm Át Tỵ)</div>
                        <div className={styles.signIn}>
                            <strong> ✧ Sign-in:</strong> 11:00 | Ceremony: 12:00
                        </div>
                        <div className={styles.address}>
                            <strong> ✧ Address: </strong> Xinyue Grand Banquet, Laishan District, Yantai City
                        </div> */}
                    </div>

                    <div className={styles.image_flow1}>
                        <img src="/images/m17/flow_1.png" alt="" />
                    </div>
                </div>

                <div className={styles.family_info__wrapper}>
                    <div className={styles.family_info}>
                        <div className={styles.groom_family}>
                            <span>groom&apos;s family</span>
                            <div style={{ marginTop: '1.5rem' }}>
                                Ông: <strong>Nguyễn Văn A</strong>
                            </div>
                            <div>
                                Bà: <strong>Trần thị B</strong>
                            </div>
                            <div className={styles.location}>
                                1 Convention Centre Pl, South Wharf VIC 3006, Australia
                            </div>
                        </div>
                        <div className={styles.bride_family}>
                            <span>bride&apos;s family</span>
                            <div style={{ marginTop: '1.5rem' }}>
                                Ông: <strong>lê văn c</strong>
                            </div>
                            <div>
                                Bà: <strong>phạm thị d</strong>
                            </div>
                            <div className={styles.location}>
                                420 Ringwood-Warrandyte Rd, Warrandyte VIC 3113, Australia
                            </div>
                        </div>
                    </div>

                    <div className={styles.invitation_sub}>
                        <p className={styles.subtilte}>Trân trọng báo tin Lễ Thành Hôn</p>
                        <div className={styles.invitation__names}>
                            <div className={styles.groom__names}>Quốc Hưng</div>

                            <div className={styles.and}>&</div>

                            <div className={styles.bride__names}>Bảo Yến</div>
                        </div>

                        <p className={styles.invitation__location}>Hôn lễ được cử hành tại TƯ GIA</p>

                        <div className={styles.invitation__datetime}>
                            <div className={styles.dateTime_flex}>
                                <div className={styles.flex_left}>
                                    <span>
                                        Vào Lúc: <strong>11:30</strong>
                                    </span>
                                    <span>Chủ Nhật</span>
                                </div>
                                <div className={styles.flex_right}>
                                    <span>28.09</span>
                                    <span>2025</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.lunarDay}>(Nhằm Ngày 07/08 Âm Lịch Năm Ất Tỵ)</div>

                        <button className={styles.btn_googleMap}>Chỉ đường Google Map</button>
                    </div>

                    <div className={styles.card}>
                        {/* Ảnh trên cùng */}
                        <div className={styles.card__imageTop}>
                            <img src="/images/m17/1.jpg" alt="Couple" />
                        </div>

                        {/* SAVE THE DATE */}
                        <div className={styles.card__saveDate}>
                            <h2 className={styles.card__saveDateTitle}>SAVE THE DATE</h2>
                            <p className={styles.card__saveDateInfo}>September 28.2025 | 11:30 P.M.</p>
                        </div>

                        {/* Ảnh giữa */}
                        <div className={styles.card__imageMiddle}>
                            <img src="/images/m17/2.jpg" alt="Couple middle" />
                        </div>

                        {/* Tên cặp đôi */}
                        <div className={styles.card__coupleNames}>Quốc Hưng &amp; Bảo Yến</div>

                        {/* Ảnh dưới */}
                        <div className={styles.card__imageBottom}>
                            <img src="/images/m17/3.jpg" alt="Couple bottom" />
                        </div>

                        {/* Footer */}
                        <div className={styles.card__footer}>And you are invited</div>
                    </div>

                    <section className={styles.Schedule}>
                        <h2 className={styles.Schedule__title}>Wedding Program</h2>

                        <ul className={styles.Schedule__list}>
                            <li>
                                <span className={styles.time}>09:00</span>
                                <span className={styles.event}>
                                    Guest Gathering <em>(Đón khách)</em>
                                </span>
                            </li>
                            <li>
                                <span className={styles.time}>10:00</span>
                                <span className={styles.event}>
                                    Registration Ceremony <em>(Làm lễ đăng ký / Nghi thức)</em>
                                </span>
                            </li>
                            <li>
                                <span className={styles.time}>10:30</span>
                                <span className={styles.event}>
                                    Photoshoot <em>(Chụp ảnh)</em>
                                </span>
                            </li>
                            <li>
                                <span className={styles.time}>11:30</span>
                                <span className={styles.event}>
                                    Banquet <em>(Nhập tiệc / Tiệc cưới)</em>
                                </span>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Template17C;
