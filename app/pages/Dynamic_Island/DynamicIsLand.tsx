'use client';
import * as React from 'react';
import styles from './DynamicIsland.module.css';
import Compact from './compact/Compact';
import Minimal from './minimal/Minimal';
import Expanded from './expanded/Expanded';

interface DynamicIslandProps {
    isOpenDynamic: boolean;
    onCloseDynamic: () => void;
    state: 'minimal' | 'compact' | 'expanded';
    status?: 'success' | 'error';
    action?: string;
    duration?: number;
}

function DynamicIsland({ isOpenDynamic, onCloseDynamic, state, status, action, duration }: DynamicIslandProps) {
    React.useEffect(() => {
        if (!isOpenDynamic) {
            onCloseDynamic();
        }
    }, [isOpenDynamic, onCloseDynamic]);

    return (
        <div className={styles.DynamicIsland}>
            {state === 'minimal' && <Minimal />}
            {state === 'expanded' && status && action && (
                <Expanded
                    status={status}
                    action={action}
                    isOpen={isOpenDynamic}
                    onClose={onCloseDynamic}
                    duration={duration} // 👈 truyền xuống Expanded
                />
            )}
            {state === 'compact' && status && action && (
                <Compact
                    status={status}
                    action={action}
                    isOpen={isOpenDynamic}
                    onClose={onCloseDynamic}
                    duration={duration} // 👈 truyền xuống Compact
                />
            )}
        </div>
    );
}

export default DynamicIsland;
