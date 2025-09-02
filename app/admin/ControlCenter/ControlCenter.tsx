'use client';
import React, { useState } from 'react';
import styles from './ControlCenter.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface ControlCenterProps {
    onClose?: () => void;
}

const ControlCenter: React.FC<ControlCenterProps> = ({ onClose }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    return (
        <div className={styles.controlCenter} role="dialog" aria-labelledby="control-center-title">
            {isOpen && (
                <div className={styles.popup} id="control-center-popup">
                    <button className={styles.closeButton} onClick={handleClose} aria-label="Close popup">
                        ×
                    </button>

                    <div className={styles.top}>
                        <div className={styles.box_1}>
                            <div className={styles.box_template}>
                                <div className={styles.box_search}>
                                    <input type="text" placeholder="Search template ...." />
                                </div>

                                <div className={styles.template_item}>
                                    <span>Item 1</span>
                                    <span>Item 2</span>
                                    <span>Item 3</span>
                                    <span>Item 4</span>
                                    <span>Item 5</span>
                                </div>
                            </div>

                            <div className={styles.wraper_total}>
                                <div className={styles.total_products}>
                                    Tổng Template<span>14</span>
                                </div>
                                <div className={styles.total_using}>
                                    Template đã sử dụng<span>9</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.box_2}></div>
                    </div>
                    <div className={styles.bottom}>
                        <div className={styles.bottom_left}></div>
                        <div className={styles.bottom_right}>
                            <div className={styles.btn_uploadTemplate}>
                                <FontAwesomeIcon icon={faUpload} />

                                <h3>Upload Template </h3>

                                <button className={styles.btn_upload}>
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlCenter;
