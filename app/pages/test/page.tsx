'use client';
import * as React from 'react';
import styles from './test.module.css';
import DynamicIsland from '../Dynamic_Island/DynamicIsLand';
import { useApi } from 'app/lib/apiContext/apiContext';

interface DynamicPayload {
    state: 'minimal' | 'compact' | 'expanded';
    TypeContextCollapsed?: boolean;
    action: 'success' | 'failure';
    actionTitle?: string;
    describle?: string;
    time?: string;
    type?: string;
    duration?: number;
    [key: string]: unknown;
}

function TestAPIDynamic() {
    const { updateDynamic } = useApi();
    const [isOpenDynamic, setIsOpenDynamic] = React.useState(false);
    const [payload, setPayload] = React.useState<DynamicPayload | null>(null);

    const toggleSidebar = (collapsed: boolean) => {
        const event = new CustomEvent('toggleSidebar', { detail: { collapsed } });
        window.dispatchEvent(event);
    };

    const handleButtonClick = async (
        action: 'success' | 'failure',
        state: 'minimal' | 'compact' | 'expanded' = 'compact'
    ) => {
        try {
            // Prepare data for API
            const mockData: DynamicPayload = {
                state,
                TypeContextCollapsed: true,
                action,
                actionTitle: action === 'success' ? 'Cho phép nhận Hỷ' : 'Lỗi nhận Hỷ',
                describle:
                    action === 'success'
                        ? 'Đã cho phép nhận tiền Hỷ qua QR code'
                        : 'Không thể cho phép nhận tiền Hỷ qua QR code',
                time: new Date().toISOString(),
                type: action === 'success' ? 'success' : 'error',
                duration: state === 'expanded' ? 4000 : state === 'minimal' ? 3000 : 3500,
            };

            // Call API
            const data = await updateDynamic(mockData);

            // Trigger sidebar collapse based on API response
            toggleSidebar(data.TypeContextCollapsed ?? true);

            // Delay showing DynamicIsland by 1 second
            setTimeout(() => {
                setPayload(data);
                setIsOpenDynamic(true);
            }, 1000);
        } catch (error) {
            console.error('Error calling dynamic/update:', error);
        }
    };

    const handleCloseDynamic = () => {
        setIsOpenDynamic(false);
        setPayload(null);
        // Reset sidebar to normal state
        toggleSidebar(false);
    };

    return (
        <div className={styles.test}>
            <div className={styles.test__wrapper}>
                <div className={styles.block} style={{ display: 'block' }}>
                    <h3>Test state Compact</h3>
                    <button className={styles.btnSuccess} onClick={() => handleButtonClick('success')}>
                        Thành công
                    </button>
                    <button className={styles.btnError} onClick={() => handleButtonClick('failure')}>
                        Thất bại
                    </button>
                </div>
                <div className={styles.block}>
                    <h3>Test state Expanded</h3>
                    <button className={styles.btnSuccess} onClick={() => handleButtonClick('success', 'expanded')}>
                        Expanded
                    </button>
                </div>
                <div className={styles.block}>
                    <h3>Test state Minimal</h3>
                    <button className={styles.btnSuccess} onClick={() => handleButtonClick('success', 'minimal')}>
                        Minimal
                    </button>
                </div>
            </div>

            <DynamicIsland
                isOpenDynamic={isOpenDynamic}
                onCloseDynamic={handleCloseDynamic}
                payload={payload || { state: 'compact', action: 'success', actionTitle: '', describle: '' }}
            />
        </div>
    );
}

export default TestAPIDynamic;
