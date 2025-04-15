'use client'
import { useState, useEffect } from 'react';
import styles from './HR_Info.module.scss';
import SettingsLayout from '../control/page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiConentext/ApiContext';

import { RecruitmentInfo } from 'app/interface/Recruitment';


export default function AccountPage() {
    const { fetchRecruitmentID } = useApi();
    const [recruitmentInfo, setRecruitmentInfo] = useState<RecruitmentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRecruitmentInfo = async () => {
            try {
                setLoading(true);
                const data = await fetchRecruitmentID();
                setRecruitmentInfo(data);
            } catch (err) {
                console.error('Error loading recruitment info:', err);
                setError('Không thể tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        loadRecruitmentInfo();
    }, [fetchRecruitmentID]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <section className={styles.AccountPage}>
            <SettingsLayout />
            <div className={styles.AccountPage_container}>
                <div className={styles.update_infomation}>
                    <h2>Thông tin HR Recruitment</h2>

                    <div className={styles.update_infomation__container}>
                        <div className={styles.box__update_infomation__container}>
                            <span>Họ và Tên</span>
                            <input
                                type="text"
                                value={`${recruitmentInfo?.firstName || ''} ${recruitmentInfo?.lastName || ''}`.trim()}
                                onChange={(e) => {
                                    // Add logic to update firstName and lastName if needed
                                }}
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        <div className={styles.box__update_infomation__container}>
                            <span>Giới tính</span>
                            <select
                                value={recruitmentInfo?.gender || ''}
                                onChange={(e) => {
                                    // Add logic to update gender if needed
                                }}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>

                        <div className={styles.box__update_infomation__container}>
                            <span>Email</span>
                            <input
                                type="text"
                                value={recruitmentInfo?.email_hr || ''}
                                disabled
                                placeholder="Chưa có email"
                            />
                        </div>

                        <div className={styles.box__update_infomation__container}>
                            <span>SĐT</span>
                            <input
                                type="number"
                                value={recruitmentInfo?.company.phoneNumber_company || ''}
                                disabled
                                placeholder="Chưa có số điện thoại"
                            />
                        </div>
                    </div>

                    <div className={styles.account_Auth__level}>
                        <h2>Xác thực thông tin</h2>
                        <div className={styles.progress_container}>
                            <span className={styles.progress_label}>Mức độ xác thực: 33%</span>
                            <div className={styles.progress_bar}>
                                <div className={styles.progress_fill} style={{ width: '33%' }}></div>
                            </div>
                        </div>

                        <div className={styles.condition}>
                            <span className={styles.condition_item}>
                                <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> Xác thực số điện
                                thoại
                                <p className={styles.status} style={{ color: 'red' }}>
                                    Chưa hoàn thành
                                </p>
                            </span>
                            <span className={styles.condition_item}>
                                <FontAwesomeIcon icon={faCircleCheck} style={{ color: 'green' }} /> Cập nhật thông tin
                                công ty
                                <p className={styles.status} style={{ color: 'green' }}>
                                    Đã hoàn thành
                                </p>
                            </span>
                            <span className={styles.condition_item}>
                                <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> Xác thực Giấy
                                đăng ký doanh nghiệp
                                <p className={styles.status} style={{ color: 'red' }}>
                                    Chưa hoàn thành
                                </p>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
