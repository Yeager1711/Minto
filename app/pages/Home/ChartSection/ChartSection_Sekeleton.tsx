// Jobs_Skeleton.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Đảm bảo CSS của react-loading-skeleton được import
import styles from './ChartSection.module.scss';

const ChartSection_Skeleton = () => {
    return (
        <>
            {Array.from({ length: 1 }).map((_, index) => (
                <div className={styles.HomePage_container} key={index}>
                    <div className={styles.image__pic}>
                        <h2>
                            <Skeleton width={250} borderRadius="8px" />

                            <Skeleton width={120} borderRadius="8px" />
                            <p></p>
                        </h2>

                        <Skeleton width={300} height={450} borderRadius="8px" />

                        <div className={styles.total_salary__VND} data-aos="fade-down" data-aos-delay="200">
                            <Skeleton width={40} borderRadius="8px" />
                            <p>
                                <Skeleton width={70} borderRadius="8px" />
                            </p>
                        </div>

                        <div className={styles.total_salary__USD} data-aos="fade-right" data-aos-delay="400">
                            <Skeleton width={40} borderRadius="8px" />

                            <p>
                                <Skeleton width={70} borderRadius="8px" />
                            </p>
                        </div>

                        <div className={styles.total_salary__upTo} data-aos="fade-up-left" data-aos-delay="600">
                            <Skeleton width={40} borderRadius="8px" />
                            <p>
                                <Skeleton width={70} borderRadius="8px" />
                            </p>
                        </div>
                    </div>

                    <div className={styles.content_HomePage_chart}>
                        <div className={styles.wrapper_totalItems}>
                            <div className={styles.total_items}>
                                <Skeleton width={35} borderRadius="8px" />
                                <p>
                                    <Skeleton width={120} borderRadius="8px" />
                                </p>
                            </div>
                            <div className={styles.total_items}>
                                <Skeleton width={35} borderRadius="8px" />

                                <p>
                                    <Skeleton width={120} borderRadius="8px" />
                                </p>
                            </div>
                            <div className={styles.total_items}>
                                <Skeleton width={35} borderRadius="8px" />

                                <p>
                                    <Skeleton width={120} borderRadius="8px" />
                                </p>
                            </div>
                        </div>

                        <div className={styles.wrapper_chart}>
                            <div className={styles.chart_items}>
                                <h3>
                                    <Skeleton width={120} borderRadius="8px" />
                                </h3>
                                <Skeleton width={350} height={240} borderRadius="8px" />
                            </div>
                            <div className={styles.chart_items}>
                                <h3>
                                    <Skeleton width={120} borderRadius="8px" />
                                </h3>
                                <Skeleton width={350} height={240} borderRadius="8px" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default ChartSection_Skeleton;
