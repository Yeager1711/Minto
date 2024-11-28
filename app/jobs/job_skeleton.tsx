// Jobs_Skeleton.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Đảm bảo CSS của react-loading-skeleton được import
import styles from './jobs.module.scss';

const Jobs_Skeleton = () => {
    return (
        <>
            {Array.from({ length: 9 }).map((_, index) => (
                <div className={styles.box} key={index}>
                    {/* Logo công ty */}
                    <div className={styles['company-logo']}>
                        <Skeleton height={80} width={80} borderRadius="8px" />
                    </div>

                    {/* Thông tin công việc */}
                    <div className={styles.info}>
                        <div className={styles['job-info']}>
                            <h3 className={styles['company-name']}>
                                <Skeleton width={300} />
                            </h3>
                        </div>

                        <div className={styles.group}>
                            <Skeleton width={120} />
                        </div>

                        <div className={styles['Salary-Negotiable']}>
                            <Skeleton width={80}  />
                        </div>

                        <div className={styles['job-content-bottom']}>
                            <div className={styles['job-content-bottom-tag']}>
                                <Skeleton width={100} height={20} />

                                <Skeleton width={100} height={20} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default Jobs_Skeleton;
