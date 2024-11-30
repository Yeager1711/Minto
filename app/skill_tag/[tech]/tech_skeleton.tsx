// JobSkeleton.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import styles from './jobTag.module.scss';

const TechStack_Skeleton = () => {
    return (
        <>
            {Array.from({ length: 10 }).map((_, index) => (
                <div className={styles.box_jobs} key={index}>
                    <div className={styles.image_company}>
                        <Skeleton height={80} width={80} className={styles.skeleton__img} />
                    </div>
                    <div className={styles.content}>
                        <h3>
                            <Skeleton width="60%" />
                        </h3>
                        <span className={styles.company__name}>
                            <Skeleton width={500} />
                        </span>
                        <span className={styles.job_level}>
                            <Skeleton width={50} />
                            <Skeleton width={50} />
                        </span>
                        <div className={styles.tag__job}>
                            <Skeleton height={20} width={380} />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default TechStack_Skeleton;
