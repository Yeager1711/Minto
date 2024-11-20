"use client";
import { useState } from 'react';
import styles from './jobs.module.scss';
// import { PiDiamondsFour } from "react-icons/pi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faLocationPin, faEye, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Data from '../Data/data'

function Jobs() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tính toán số trang
  const totalPages = Math.ceil(Data.length / itemsPerPage);

  // Lấy dữ liệu cho trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = Data.slice(startIndex, startIndex + itemsPerPage);

//   Chuyển trang
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

  return (
    <section className={styles.job + " marTop"}>
      <div className={styles['filter-job']}>
        <section className={styles['navigation-search']}>
          <div className={styles['box-input']}>
            <input type="text" placeholder="Tìm kiếm các ngành nghề..." />
          </div>

          <div className={styles['box-select']}>
            <select name="" id="">
              <option value="">TP.Hồ Chí Minh</option>
              <option value="">TP.Đà Nẵng</option>
              <option value="">TP.Cần Thơ</option>
              <option value="">TP.Hải phòng</option>
            </select>
          </div>

          <button className={styles['btn-find']}>Tìm việc</button>
        </section>
      </div>

      <section className={styles['job-container']}>
        <div className={styles['header-searchByCriteria']}>
          <h3><p>99 Việc làm phù hợp</p> Tất cả</h3>
        </div>

        <div className={styles['filter-searchByCriteria']}>
          <div className={styles['filter']}>
            <select name="" id="">
              <option value="">Hình thức làm việc</option>
              <option value="">Làm việc từ xa</option>
              <option value="">Làm việc tại công ty</option>
              <option value="">Làm việc toàn thời gian</option>
              <option value="">Làm việc bán thời gian</option>
              <option value="">Hybrid</option>
            </select>
          </div>

          <div className={styles['filter']}>
            <select name="" id="">
              <option value="">Cấp bậc</option>
              <option value="">Mới tốt nghiệp/Thực tập sinh</option>
              <option value="">Thực tập sinh/Sinh viên</option>
              <option value="">Nhân viên</option>
              <option value="">Trưởng nhóm/Giám sát</option>
              <option value="">Trưởng phòng</option>
              <option value="">Phó giám đốc</option>
              <option value="">Giám đốc</option>
              <option value="">Tổng giám đốc điều hành</option>
              <option value="">Chủ tịch</option>
            </select>
          </div>

          <div className={styles['filter']}>
            <select name="" id="">
              <option value="">TP.Hồ Chí Minh</option>
              <option value="">TP.Đà Nẵng</option>
              <option value="">TP.Cần Thơ</option>
              <option value="">TP.Hải phòng</option>
            </select>
          </div>

          <div className={styles['filter']}>
            <input type="text" placeholder='Từ' />
            <span className={styles['ant-input-number-group-addon']}>VNĐ</span>
          </div>

          <div className={styles['filter']}>
            <input type="text" placeholder='Đến' />
            <span className={styles['ant-input-number-group-addon']}>VNĐ</span>
          </div>
        </div>
      </section>

      <section className={styles['job-wrapperContainer']}>
        <div className={styles['Container']}>
          {currentData.map((item) => (
            <div className={styles['box']} key={item.id}>
              <FontAwesomeIcon className={styles['whislist']} icon={faHeart} />
              <span className={styles['tag-rank']}>
                {/* <PiDiamondsFour /> Pro */}
              </span>
              <div className={styles['company-logo']}>
                <img src={item.imgSrc} alt={item.companyName} />
              </div>
              <div className={styles['info']}>
                <div className={styles['job-info']}>
                  <h3 className={styles['company-name']}>{item.companyName}</h3>
                </div>
                <div className={styles['group']}>{item.group}</div>
                <div className={styles['Salary-Negotiable']}>
                  {item.position} ({item.SalaryNegotiable})
                </div>
                <div className={styles['job-content-bottom']}>
                  <div className={styles['job-content-bottom-tag']}>
                    <div className={styles['location']}>
                      <FontAwesomeIcon icon={faLocationPin} /> {item.location}
                    </div>
                    <div className={styles['views-box']}>
                      <FontAwesomeIcon icon={faEye} /> {item.views}
                    </div>
                  </div>
                  <div className={styles['job-content-bottom-expired']}>{item.expired}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        <div className={styles['pagination']}>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </section>
    </section>
  );
}

export default Jobs;
