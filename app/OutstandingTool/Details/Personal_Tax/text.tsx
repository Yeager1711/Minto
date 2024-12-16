'use client';
import React, { useState } from 'react';
import styles from './PersonalTax.module.scss';
import Region_Details from '../../../pages/DefaultLayouts/Popup/Region_Details/page';

function PersonalTax() {
    const [income, setIncome] = useState<string>('');
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    return (
        <section className={styles.PersonalTax}>
            <h3>Thuế thu nhập cá nhân</h3>

            <div className={styles.PersonalTax__container}>
                <div className={styles.PersonalTax_temple__left}>
                    <h3>Công thức tính thuế thu nhập cá nhân</h3>

                    <div className={styles.criteria__Personal_Tax}>
                        Thuế Thu Nhập Cá Nhân phải nộp = Thu nhập tính thuế x Thuế suất
                    </div>

                    <div className={styles.criteria__Details}>
                        <h2>Giải thích công thức: </h2>

                        <p>- Thu nhập tính thuế = Thu nhập chịu thuế - Các khoản giảm trừ</p>
                        <p>- Thu nhập chịu thuế TNCN = Tổng thu nhập - Các khoản thu nhập được miễn thuế TNCN</p>
                        <p>
                            - Tổng thu nhập được xác định theo quy định tại Khoản 2 Điều 2{' '}
                            <a href="https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Thong-tu-111-2013-TT-BTC-Huong-dan-Luat-thue-thu-nhap-ca-nhan-va-Nghi-dinh-65-2013-ND-CP-205356.aspx">
                                Thông tư 111/2013/TT-BTC
                            </a>{' '}
                            và Khoản 1, 2, 3, 4, 5 Điều 11{' '}
                            <a href="https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Thong-tu-92-2015-TT-BTC-huong-dan-thue-gia-tri-gia-tang-thue-thu-nhap-ca-nhan-282089.aspx">
                                Thông tư 92/2015/TT-BTC
                            </a>
                            .
                        </p>
                    </div>

                    <div className={styles.list_salary}>
                        <div>
                            <p>Lương cơ sở:</p>
                            <span className={styles.text_orange}>2,340,000đ</span>
                        </div>

                        <div>
                            <p>Giảm trừ gia cảnh bản thân:</p>
                            <span className={styles.text_orange}>11,000,000đ</span>
                        </div>

                        <div>
                            <p>Người phụ thuộc:</p>
                            <span className={styles.text_orange}>4,400,000đ</span>
                        </div>
                    </div>

                    <div className={styles.calculator}>
                        <div className={styles.flex_wrap}>
                            <div className={styles.box__input}>
                                <span>Thu Nhập (Gross)</span>
                                <input
                                    type="text"
                                    placeholder="VNĐ"
                                    value={income}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                        const formattedValue = new Intl.NumberFormat('vi-VN').format(Number(rawValue));
                                        setIncome(formattedValue);
                                    }}
                                />
                            </div>

                            <div className={styles.box__input}>
                                <span>Số người phụ thuộc:</span>
                                <input type="text" placeholder="Người" />
                            </div>

                            <div className={styles.box__input}>
                                <span>
                                    Vùng: <p onClick={() => setIsDetailsVisible(true)}>(Tìm hiểu thêm)</p>
                                </span>
                                <select name="" id="">
                                    <option value="Region_one">Vùng 1</option>
                                    <option value="Region_two">Vùng 2</option>
                                    <option value="Region_three">Vùng 3</option>
                                    <option value="Region_four">Vùng 4</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.convert}>
                            <button className={styles.btn_PersonalTax}>Tính thuế TNCN</button>
                        </div>
                    </div>
                </div>

                <div className={styles.PersonalTax_temple__right}>
                    <div className={styles.header__content}>
                        <h1>Thuế thu nhập cá nhân là gì ? </h1>
                        <span>
                            Thuế thu nhập cá nhân (Tiếng Anh: Personal income tax) là khoản tiền mà người có thu nhập
                            cần trích từ lương và các nguồn thu khác (nếu có) của mình để nộp vào ngân sách nhà nước sau
                            khi đã được giảm trừ.
                        </span>

                        <span>
                            Thuế thu nhập cá nhân không đánh vào tất cả các đối tượng mà có mức lương quy định cần đóng
                            riêng, góp phần thu hẹp khoảng cách giữa các tầng lớp trong xã hội.
                        </span>
                    </div>

                    <div className={styles.header__content}>
                        <h1>* Thuế suất:</h1>
                        <span>
                            Thuế suất từ tiền lương, tiền công đối với đối tượng ký hợp đồng lao động từ 03 tháng trở
                            lên được áp dụng theo lũy tiến từng phần, cụ thể:
                        </span>
                        <span>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bậc</th>
                                        <th>Phần thu nhập tính thuế/năm (triệu đồng)</th>
                                        <th>Phần thu nhập tính thuế/tháng (triệu đồng)</th>
                                        <th>Thuế suất (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Đến 60</td>
                                        <td>Đến 5</td>
                                        <td>5</td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Trên 60 đến 120</td>
                                        <td>Trên 5 đến 10</td>
                                        <td>10</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>Trên 120 đến 216</td>
                                        <td>Trên 10 đến 18</td>
                                        <td>15</td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td>Trên 216 đến 384</td>
                                        <td>Trên 18 đến 32</td>
                                        <td>20</td>
                                    </tr>
                                    <tr>
                                        <td>5</td>
                                        <td>Trên 384 đến 624</td>
                                        <td>Trên 32 đến 52</td>
                                        <td>25</td>
                                    </tr>
                                    <tr>
                                        <td>6</td>
                                        <td>Trên 624 đến 960</td>
                                        <td>Trên 52 đến 80</td>
                                        <td>30</td>
                                    </tr>
                                    <tr>
                                        <td>7</td>
                                        <td>Trên 960</td>
                                        <td>Trên 80</td>
                                        <td>35</td>
                                    </tr>
                                </tbody>
                            </table>
                        </span>
                    </div>
                </div>
            </div>
            {isDetailsVisible && <Region_Details onClose={() => setIsDetailsVisible(false)} />}
        </section>
    );
}

export default PersonalTax;
