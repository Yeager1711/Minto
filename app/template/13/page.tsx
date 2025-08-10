import * as React from 'react';
import styles from './13.module.css';

function Template13() {
    return (
        <div className={styles.template13}>
            <div className={styles.wrapper}>
                <div className={styles.wrapper_imageMain}>
                    <div className={styles.image_top}>
                        <img src="/images/m13/10.jpg" alt="" />
                    </div>

                    <div className={styles.image_bottom}>
                        <img src="/images/m13/13.jpg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Template13;
