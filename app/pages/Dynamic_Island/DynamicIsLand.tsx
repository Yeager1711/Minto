'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import styles from './DynamicIsland.module.css';
import Compact from './compact/Compact';
import Minimal from './minimal/Minimal';
import Expanded from './expanded/Expanded';

interface QrResponse {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: Date | string;
    status: string;
    representative: string | null;
}

interface DynamicPayload {
    state: 'minimal' | 'compact' | 'expanded';
    action: 'success' | 'failure';
    actionTitle?: string;
    describe?: string;
    time?: string;
    type?: string;
    duration?: number;
    oldData?: Partial<QrResponse>;
    newData?: Partial<QrResponse>;
    [key: string]: unknown;
}

interface DynamicIslandProps {
    isOpenDynamic: boolean;
    onCloseDynamic: () => void;
    payload: DynamicPayload;
}

function DynamicIsland({ isOpenDynamic, onCloseDynamic, payload }: DynamicIslandProps) {
    React.useEffect(() => {
        if (!isOpenDynamic) {
            onCloseDynamic();
        }
    }, [isOpenDynamic, onCloseDynamic]);

    if (!payload || !payload.state || typeof document === 'undefined') {
        return null;
    }

    return (
        <div className={styles.DynamicIsland}>
            {payload.state === 'minimal' &&
                createPortal(<Minimal payload={payload} onClose={onCloseDynamic} />, document.body)}

            {payload.state === 'compact' &&
                createPortal(
                    <Compact payload={payload} isOpen={isOpenDynamic} onClose={onCloseDynamic} />,
                    document.body
                )}

            {payload.state === 'expanded' &&
                createPortal(
                    <Expanded payload={payload} isOpen={isOpenDynamic} onClose={onCloseDynamic} />,
                    document.body
                )}
        </div>
    );
}

export default DynamicIsland;
