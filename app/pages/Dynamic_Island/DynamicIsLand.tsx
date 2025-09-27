'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
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
        <>
            <div className={styles.DynamicIsland}>
                {state === 'minimal' &&
                    status &&
                    action &&
                    createPortal(
                        <Minimal
                            status={status}
                            action={action}
                            isOpen={isOpenDynamic}
                            onClose={onCloseDynamic}
                            duration={duration}
                        />,
                        document.body
                    )}

                {state === 'compact' &&
                    status &&
                    action &&
                    createPortal(
                        <Compact
                            status={status}
                            action={action}
                            isOpen={isOpenDynamic}
                            onClose={onCloseDynamic}
                            duration={duration}
                        />,
                        document.body
                    )}
            </div>

            {state === 'expanded' &&
                status &&
                action &&
                createPortal(
                    <Expanded
                        status={status}
                        action={action}
                        isOpen={isOpenDynamic}
                        onClose={onCloseDynamic}
                        duration={duration}
                    />,
                    document.body // 👈 expanded luôn nằm top-level
                )}
        </>
    );
}

export default DynamicIsland;
