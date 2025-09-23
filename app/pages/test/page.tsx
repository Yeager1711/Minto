// 'use client';
// import * as React from 'react';
// import styles from './test.module.css';
// import DynamicIsland from '../Dynamic_Island/DynamicIsLand';
// import { useApi } from 'app/lib/apiContext/apiContext'; // sửa path nếu bạn đặt chỗ khác

// function TestAPIDynamic() {
//     const { updateDynamic } = useApi();

//     const [isOpenDynamic, setIsOpenDynamic] = React.useState(false);
//     const [dynamicState, setDynamicState] = React.useState<'minimal' | 'compact' | 'expanded'>('compact');
//     const [status, setStatus] = React.useState<'success' | 'error' | undefined>(undefined);
//     const [action, setAction] = React.useState<string | undefined>(undefined);
//     const [duration, setDuration] = React.useState<number | undefined>(undefined);

//     const handleButtonClick = async (
//         type: 'success' | 'error',
//         state: 'minimal' | 'compact' | 'expanded' = 'compact'
//     ) => {
//         try {
//             const mockData = {
//                 state,
//                 type,
//                 title: type === 'success' ? 'Cho phép nhận Hỷ' : 'Lỗi nhận Hỷ',
//                 content: {
//                     message:
//                         type === 'success'
//                             ? 'Đã cho phép nhận tiền Hỷ qua QRRRR code'
//                             : 'Không thể cho phép nhận tiền HỷRRRR qua QR code',
//                 },
//                 time: new Date().toISOString(),
//                 action: 'Cập nhật trạng thái',
//                 duration: state === 'expanded' ? 4000 : 3000, // 👈 expanded = 4s, compact = 3s
//             };

//             const data = await updateDynamic(mockData);
//             setDynamicState(data.state);
//             setStatus(data.type);
//             setAction(data.action);
//             setDuration(data.duration ?? mockData.duration);
//             setIsOpenDynamic(true);
//         } catch (error) {
//             console.error('Error calling dynamic/update:', error);
//         }
//     };

//     const handleCloseDynamic = () => {
//         setIsOpenDynamic(false);
//         setStatus(undefined);
//         setAction(undefined);
//         setDuration(undefined);
//     };

//     return (
//         <div className={styles.test}>
//             <div className={styles.test__wrapper}>
//                 <>
//                     <h3>Test state Compact</h3>
//                     <button className={styles.btnSuccess} onClick={() => handleButtonClick('success')}>
//                         Thành công
//                     </button>
//                     <button className={styles.btnError} onClick={() => handleButtonClick('error')}>
//                         Thất bại
//                     </button>
//                 </>
//                 <>
//                     <h3>Test state Expanded</h3>
//                     <button className={styles.btnSuccess} onClick={() => handleButtonClick('success', 'expanded')}>
//                         expanded
//                     </button>
//                 </>
//             </div>

//             <DynamicIsland
//                 isOpenDynamic={isOpenDynamic}
//                 onCloseDynamic={handleCloseDynamic}
//                 state={dynamicState}
//                 status={status}
//                 action={action}
//                 duration={duration}
//             />
//         </div>
//     );
// }

// export default TestAPIDynamic;
import * as React from 'react';
import styles from './test.module.css'
function TestAPIDynamic() {
    return ( 
        <div className={styles.test}>test</div>
     );
}

export default TestAPIDynamic;