'use client';
import React from 'react';
import styles from './jobDetail.module.scss';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
      faCommentsDollar,
      faHourglassStart,
      faLocationDot,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function JobDetail() {
      const dataDetails = [
            {
                  id: 1,
                  img: 'https://cdn-new.topcv.vn/unsafe/135x/https://static.topcv.vn/company_logos/5OrmsfKsp4oFFhgE8XaudclcnwyM3hK6_1728896375____faca09858c711e9923d8d5c73c801bb4.jpg',
                  name_company: 'Chailease International Leasing Co., Ltd. (Head Office)',
                  title: 'Nhân Viên Quan Hệ Khách Hàng Doanh Nghiệp (Tư Vấn Tài Chính) - Bình Dương (Phụ Cấp Tiền Nhà)',
                  salary: 'Thỏa thuận',
                  location: 'Bình Dương',
                  experience: 'Dưới 1 năm',
                  description:
                        '- Tìm kiếm khách hàng, liên hệ và gặp gỡ để giới thiệu dịch vụ cho thuê tài chính. - Mở rộng và duy trì quan hệ với khách hàng hiện tại và tiềm năng. - Thẩm định sơ bộ hồ sơ tín dụng. - Đề xuất giải pháp thuê tài chính phù hợp với khách hàng.',
                  requestment:
                        '- Tốt nghiệp Đại học hoặc Cao đẳng (ưu tiên chuyên ngành Tài chính - Ngân hàng, Kinh tế, Quản trị kinh doanh, Ngoại thương). - Có khả năng giao tiếp tiếng Anh hoặc tiếng Trung. - Giao tiếp tốt, thái độ tích cực, có trách nhiệm.',
                  benifet: '- Phụ cấp tiền nhà hàng tháng cho nhân viên ngoại tỉnh làm việc tại Bình Dương. - Làm việc 5 ngày/tuần (thứ 2 - thứ 6), đảm bảo cân bằng giữa công việc và cuộc sống. - Lương cạnh tranh, thưởng cuối năm, lương tháng 13...',
                  work_location:
                        '- Bình Dương: Tầng 12A, Tòa nhà Becamex, 230 Đại Lộ Bình Dương, P. Phú Hòa, Tp. Thủ Dầu Một, Thủ Dầu Một',
                  work_time: 'Thứ 2 - Thứ 6 (từ 08:00 đến 17:00)',
                  rank: 'Nhân viên',
                  numberOfRecruits: '3',
                  workForm: 'Toàn thời gian',
                  gender: 'Không yêu cầu',
                  expire_on: '14/12/2024',
            },
      ];

      return (
            <section className={styles.jobDetail + ' marTop'}>
                  {dataDetails.map((company) => (
                        <div className={styles.company} key={company.id}>
                              <div className={styles.image_company}>
                                    <img src={company.img} alt={company.name_company} />
                              </div>
                              <div className={styles.name_company}>{company.name_company}</div>
                        </div>
                  ))}
                  <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
                        <div className={styles.infomation}>
                              {dataDetails.map((info) => (
                                    <div className={styles.wrapper_infomation} key={info.id}>
                                          <div className={styles.basic_infomation}>
                                                <h4 className={styles.infomation_Content_Title_job}>
                                                      {info.title}
                                                </h4>
                                                <div className={styles.infomation_Content_section}>
                                                      <span
                                                            className={styles.basic_infomation_item}
                                                      >
                                                            <FontAwesomeIcon
                                                                  icon={faCommentsDollar}
                                                            />
                                                            Mức lương:
                                                            <p> {info.salary}</p>
                                                      </span>
                                                      <span
                                                            className={styles.basic_infomation_item}
                                                      >
                                                            <FontAwesomeIcon icon={faLocationDot} />
                                                            Địa điểm
                                                            <p>: {info.location}</p>
                                                      </span>
                                                      <span
                                                            className={styles.basic_infomation_item}
                                                      >
                                                            <FontAwesomeIcon
                                                                  icon={faHourglassStart}
                                                            />
                                                            Kinh nghiệm:
                                                            <p> {info.experience}</p>
                                                      </span>
                                                </div>
                                                <div className={styles.box_apply_current}>
                                                      <a href="#" className={styles.box_apply}>
                                                            Ứng tuyển ngay
                                                      </a>
                                                </div>
                                          </div>

                                          <div className={styles.basic_infomation_description}>
                                                <h3>Mô tả công việc</h3>
                                                <span>
                                                      {info.description
                                                            .split('-')
                                                            .map(
                                                                  (item, index) =>
                                                                        item.trim() && (
                                                                              <p key={index}>
                                                                                    - {item.trim()}
                                                                              </p>
                                                                        )
                                                            )}
                                                </span>
                                          </div>

                                          <div className={styles.basic_infomation_requesment}>
                                                <h3>Yêu cầu ứng viên</h3>
                                                <span>
                                                      {info.requestment
                                                            .split('-')
                                                            .map(
                                                                  (item, index) =>
                                                                        item.trim() && (
                                                                              <p key={index}>
                                                                                    - {item.trim()}
                                                                              </p>
                                                                        )
                                                            )}
                                                </span>
                                          </div>

                                          <div className={styles.basic_infomation_benifet}>
                                                <h3>Phúc lợi</h3>
                                                <span>
                                                      {info.benifet
                                                            .split('-')
                                                            .map(
                                                                  (item, index) =>
                                                                        item.trim() && (
                                                                              <p key={index}>
                                                                                    - {item.trim()}
                                                                              </p>
                                                                        )
                                                            )}
                                                </span>
                                          </div>
                                    </div>
                              ))}
                        </div>

                        <div className={styles.generalInformation}>
                              <h3>Thông tin chung</h3>
                              {dataDetails.map((general) => (
                                    <React.Fragment key={general.id}>
                                          <span className={styles.generalInformation_item}>
                                                Cấp bậc: <p>{general.rank}</p>
                                          </span>
                                          <span className={styles.generalInformation_item}>
                                                Số lượng tuyển: <p>{general.numberOfRecruits}</p>
                                          </span>
                                          <span className={styles.generalInformation_item}>
                                                Hình thức làm việc: <p>{general.workForm}</p>
                                          </span>
                                          <span className={styles.generalInformation_item}>
                                                Giới tính: <p>{general.gender}</p>
                                          </span>
                                          <span className={styles.generalInformation_item}>
                                                Hạn nộp hồ sơ: <p>{general.expire_on}</p>
                                          </span>
                                    </React.Fragment>
                              ))}
                        </div>
                  </div>
            </section>
      );
}

export default JobDetail;