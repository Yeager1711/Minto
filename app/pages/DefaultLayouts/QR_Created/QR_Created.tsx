// 'use client';

// import * as React from 'react';
// import { useEffect, useState } from 'react';
// import Image from 'next/image';
// import { useApi } from '../../../lib/apiContext/apiContext';
// import styles from './QR_Created.module.css';

// interface QrResponse {
//     qrId: number;
//     bank: string;
//     accountNumber: string;
//     accountHolder: string;
//     qrCodeUrl: string;
//     createdAt: Date;
//     status: string;
//     representative: string | null; // groom | bride
// }

// interface Bank {
//     id: string;
//     name: string;
//     shortName?: string;
//     code?: string;
//     bin?: string;
//     logo?: string;
// }

// interface QR_CreatedProps {
//     userId: number;
// }

// const QR_Created: React.FC<QR_CreatedProps> = ({ userId }) => {
//     const { getUserQrPublic } = useApi();
//     const [qrData, setQrData] = useState<QrResponse[]>([]);
//     const [banks, setBanks] = useState<Bank[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const response = await getUserQrPublic(userId);
//                 const qrArray: QrResponse[] = Array.isArray(response) ? response : [response];
//                 setQrData(qrArray);

//                 const bankResponse = await fetch('https://api.vietqr.io/v1/banks');
//                 const bankData = await bankResponse.json();
//                 if (bankData.code === '00' && Array.isArray(bankData.data)) {
//                     setBanks(bankData.data);
//                 }
//             } catch (err) {
//                 console.error('Error fetching data:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [getUserQrPublic, userId]);

//     const getBank = (bankId: string) => {
//         return banks.find((b) => String(b.id) === String(bankId));
//     };

//     if (loading) {
//         return <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu QR...</div>;
//     }

//     const groomQr = qrData.find((qr) => qr.representative === 'groom');
//     const brideQr = qrData.find((qr) => qr.representative === 'bride');

//     return (
//         <div className={styles.QR_CheckAsset}>
//             <div className={styles.btn_close}>X</div>
//             <div className={styles.wrapper}>
//                 <div className={styles.current_day}>
//                     {new Date().toLocaleDateString('en-US', {
//                         month: 'long',
//                         day: '2-digit',
//                         year: 'numeric',
//                     })}
//                     <br />
//                     <h3>Today</h3>
//                 </div>

//                 <div className={styles.progress_checkTask}>
//                     <div className={styles.progress_wrapper}>
//                         <div className={styles.timeline}>
//                             {/* Groom */}
//                             <div className={styles.item}>
//                                 <div className={styles.time}>Groom</div>
//                                 <div className={styles.schedule_content}>
//                                     {groomQr ? (
//                                         <div className={styles.card}>
//                                             <h3>QR của Chú Rể</h3>
//                                             <div className={styles.image_bank}>
//                                                 {getBank(groomQr.bank)?.logo ? (
//                                                     <img src={getBank(groomQr.bank)?.logo} alt="bank logo" />
//                                                 ) : (
//                                                     <Image
//                                                         src={groomQr.qrCodeUrl}
//                                                         alt="QR Groom"
//                                                         width={200}
//                                                         height={200}
//                                                     />
//                                                 )}
//                                             </div>
//                                             <div className={styles.number_banks}>{groomQr.accountNumber}</div>
//                                             <div className={styles.create_at}>
//                                                 Created: {new Date(groomQr.createdAt).toLocaleDateString('en-GB')}
//                                             </div>
//                                             <div className={styles.name_banks}>
//                                                 {getBank(groomQr.bank)?.shortName ||
//                                                     getBank(groomQr.bank)?.name ||
//                                                     'Ngân hàng'}
//                                             </div>
//                                             <div className={styles.status}>{groomQr.status}</div>
//                                         </div>
//                                     ) : (
//                                         <p className={styles.unfinished}>Chưa Tạo</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Bride */}
//                             <div className={styles.item}>
//                                 <div className={styles.time}>Bride</div>
//                                 <div className={styles.schedule_content}>
//                                     {brideQr ? (
//                                         <div className={styles.card}>
//                                             <h3>QR của Cô Dâu</h3>
//                                             <div className={styles.image_bank}>
//                                                 {getBank(brideQr.bank)?.logo ? (
//                                                     <img src={getBank(brideQr.bank)?.logo} alt="bank logo" />
//                                                 ) : (
//                                                     <Image
//                                                         src={brideQr.qrCodeUrl}
//                                                         alt="QR Bride"
//                                                         width={200}
//                                                         height={200}
//                                                     />
//                                                 )}
//                                             </div>
//                                             <div className={styles.number_banks}>{brideQr.accountNumber}</div>
//                                             <div className={styles.create_at}>
//                                                 Created: {new Date(brideQr.createdAt).toLocaleDateString('en-GB')}
//                                             </div>
//                                             <div className={styles.name_banks}>
//                                                 {getBank(brideQr.bank)?.shortName ||
//                                                     getBank(brideQr.bank)?.name ||
//                                                     'Ngân hàng'}
//                                             </div>
//                                             <div className={styles.status}>{brideQr.status}</div>
//                                         </div>
//                                     ) : (
//                                         <p className={styles.unfinished}>Chưa Tạo</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Nếu có slot chưa tạo */}
//                             <div className={styles.item}>
//                                 <div className={styles.time}>Unfinished</div>
//                                 <div className={styles.schedule_content}>
//                                     <h4>Tạo QR thẻ Ngân hàng</h4>
//                                     {!groomQr || !brideQr ? (
//                                         <p className={styles.unfinished}>Chưa Tạo</p>
//                                     ) : (
//                                         <p className={styles.status}>Đã đủ QR</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Example fixed timeline item */}
//                             <div className={styles.item}>
//                                 <div className={styles.time}>July 31, 2025</div>
//                                 <div className={styles.schedule_content}>
//                                     <h4>Tạo tài khoản</h4>
//                                     <p className={styles.status}>Đang hoạt động</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default QR_Created;
