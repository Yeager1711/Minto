// Jobs_Skeleton.tsx
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Đảm bảo CSS của react-loading-skeleton được import
import styles from './SearchTypes.module.scss';

const SearchTypes_Skeleton = () => {
    return (
        <>
            {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className={styles.job}>
                    <div className={styles.image__logo}>
                        <Skeleton height={80} width={80} borderRadius={8} />
                    </div>

                    <div className={styles.content}>
                        <h3>
                            <Skeleton width={300} />
                        </h3>
                        <span className={styles.name__company}>
                            <Skeleton width={220} />
                        </span>
                        <span className={styles.positon}>
                            <Skeleton width={120} />
                        </span>
                        <span className={styles.salary}>
                            <Skeleton width={80} />
                        </span>

                        <span className={styles.district}>
                            <Skeleton width={200} />
                        </span>
                    </div>
                </div>
            ))}
        </>
    );
};

export default SearchTypes_Skeleton;
