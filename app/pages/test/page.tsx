'use client';
import * as React from 'react';
import styles from './test.module.css';
import DynamicIsland from '../Dynamic_Island/DynamicIsLand';
import { useApi } from 'app/lib/apiContext/apiContext';
// import { useLiquidGlass } from '../DefaultLayouts/useLiquidGlass/useLiquidGlass';

interface DynamicPayload {
    state: 'minimal' | 'compact' | 'expanded';
    type: 'success' | 'error';
    title: string;
    content: {
        message: string;
        note?: string;
    };
    time: string;
    action: string;
    duration: number;
    TypeContextCollapsed: boolean; // Thêm trường mới
}

function TestAPIDynamic() {
    const { updateDynamic } = useApi();
    const [isOpenDynamic, setIsOpenDynamic] = React.useState(false);
    const [dynamicState, setDynamicState] = React.useState<'minimal' | 'compact' | 'expanded'>('compact');
    const [status, setStatus] = React.useState<'success' | 'error' | undefined>(undefined);
    const [action, setAction] = React.useState<string | undefined>(undefined);
    const [duration, setDuration] = React.useState<number | undefined>(undefined);

    const toggleSidebar = (collapsed: boolean) => {
        const event = new CustomEvent('toggleSidebar', { detail: { collapsed } });
        window.dispatchEvent(event);
    };

    const handleButtonClick = async (
        type: 'success' | 'error',
        state: 'minimal' | 'compact' | 'expanded' = 'compact'
    ) => {
        try {
            // Prepare data for API
            const mockData = {
                state,
                type,
                title: type === 'success' ? 'Cho phép nhận Hỷ' : 'Lỗi nhận Hỷ',
                content: {
                    message:
                        type === 'success'
                            ? 'Đã cho phép nhận tiền Hỷ qua QRRRR code'
                            : 'Không thể cho phép nhận tiền HỷRRRR qua QR code',
                },
                time: new Date().toISOString(),
                action: 'Trạng thái ',
                duration: state === 'expanded' ? 4000 : state === 'minimal' ? 3000 : 3000,
                TypeContextCollapsed: true, // Gửi trường này trong payload
            };

            // Call API
            const data = (await updateDynamic(mockData)) as DynamicPayload;

            if (data.type === 'success' || data.type === 'error') {
                // Trigger sidebar collapse based on API response
                toggleSidebar(data.TypeContextCollapsed);

                // Delay showing DynamicIsland by 1 second
                setTimeout(() => {
                    setDynamicState(data.state);
                    setStatus(data.type);
                    setAction(data.action);
                    setDuration(data.duration ?? mockData.duration);
                    setIsOpenDynamic(true);
                }, 1000);
            } else {
                console.error('Invalid type received:', data.type);
            }
        } catch (error) {
            console.error('Error calling dynamic/update:', error);
        }
    };

    const handleCloseDynamic = () => {
        setIsOpenDynamic(false);
        setStatus(undefined);
        setAction(undefined);
        setDuration(undefined);
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
                    <button className={styles.btnError} onClick={() => handleButtonClick('error')}>
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
                state={dynamicState}
                status={status}
                action={action}
                duration={duration}
            />
        </div>
    );
}

export default TestAPIDynamic;

// // export default TestAPIDynamic;
// import * as React from 'react';
// import styles from './test.module.css'
// function TestAPIDynamic() {
//     return (
//         <div className={styles.test}>test</div>
//      );
// }

// export default TestAPIDynamic;
