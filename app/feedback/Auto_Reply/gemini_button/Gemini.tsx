'use client';

import * as React from 'react';
import styles from './Gemini.module.css'; // Renamed for clarity

interface GeminiButtonProps {
    onClick: () => void;
}

const GeminiButton: React.FC<GeminiButtonProps> = ({ onClick }) => {
    return (
        <div className={styles.border_layer}>
            <button className={styles.gemini_button} onClick={onClick}>
                Open Minto Bot
            </button>
        </div>
    );
};

export default GeminiButton;
