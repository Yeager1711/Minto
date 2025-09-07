import * as React from 'react';
import styles from './Loading.module.scss';

function Loading() {
    return (
        <div className={styles.fixed_pss}>
            <div className={styles.loader}>
                <div className={`${styles.loader__inner} ${styles['loader__inner--one']}`}></div>
                <div className={`${styles.loader__inner} ${styles['loader__inner--two']}`}></div>
                <div className={`${styles.loader__inner} ${styles['loader__inner--three']}`}></div>
            </div>
        </div>
    );
}

export default Loading;
