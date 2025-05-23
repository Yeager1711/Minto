'use client';
import React, { useState, useEffect } from 'react';
import styles from './InviteePopup.module.css';

interface InviteePopupProps {
    templateId: string;
    quantity: number;
    onClose: () => void;
    id: string;
    weddingImages: { file: File; position: string }[]; // Thêm prop weddingImages
}

const priceCardDefault = Number(process.env.NEXT_PUBLIC_PRICE_CARD) || 500;
const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const InviteePopup: React.FC<InviteePopupProps> = ({ templateId, quantity, onClose, weddingImages }) => {
    const [isClosing] = useState(false);
    const [inviteeNames, setInviteeNames] = useState<string[]>(Array(quantity).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [templatePrice, setTemplatePrice] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    // Check apiUrl
    useEffect(() => {
        if (!apiUrl) {
            setError('API URL không được định nghĩa.');
            setTemplatePrice(0);
            setIsLoadingPrice(false);
        }
    }, []);

    // Fetch template price from API
    useEffect(() => {
        async function fetchTemplatePrice() {
            if (!apiUrl) return;
            setIsLoadingPrice(true);
            try {
                const response = await fetch(`${apiUrl}/templates/getTemplate/${templateId}`);
                const result = await response.json();
                if (result.statusCode === 200 && result.data?.price) {
                    setTemplatePrice(result.data.price);
                } else {
                    throw new Error(result.message || 'Không lấy được giá template');
                }
            } catch (err) {
                console.error('Lỗi khi lấy giá template:', err);
                setError('Không thể tải giá template. Vui lòng thử lại.');
                setTemplatePrice(0);
            } finally {
                setIsLoadingPrice(false);
            }
        }
        fetchTemplatePrice();
    }, [templateId]);

    // Adjust inviteeNames when quantity changes
    useEffect(() => {
        setInviteeNames((prev) => {
            const newNames = Array(quantity).fill('');
            prev.forEach((name, index) => {
                if (index < quantity) {
                    newNames[index] = name;
                }
            });
            return newNames;
        });
    }, [quantity]);

    // Calculate totalPrice
    const calculatedTotalPrice =
        templatePrice !== null
            ? (() => {
                  const basePrice = Number(templatePrice);
                  let totalPrice = basePrice;
                  if (quantity > Number(process.env.NEXT_PUBLIC_APP_NUMBER_REQUEST)) {
                      totalPrice += quantity * priceCardDefault;
                  }
                  return totalPrice;
              })()
            : 0;

    // Format totalPrice
    const formattedTotalPrice = calculatedTotalPrice
        ? calculatedTotalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ'
        : '0 vnđ';

    const handleCloseAnimationEnd = () => {
        if (isClosing) {
            onClose();
        }
    };

    const handleNameChange = (index: number, value: string) => {
        const updatedNames = [...inviteeNames];
        updatedNames[index] = value;
        setInviteeNames(updatedNames);
    };

    const handleSubmit = async () => {
        if (inviteeNames.some((name) => name.trim() === '')) {
            alert('Vui lòng nhập đầy đủ tên của tất cả người được mời.');
            return;
        }

        if (templatePrice === null) {
            alert('Không thể tạo thanh toán do lỗi tải giá template.');
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            }

            // Upload weddingImages trước và lấy danh sách URL hoặc ID
            const uploadedImageUrls: { url: string; position: string }[] = [];
            if (weddingImages && weddingImages.length > 0) {
                const formData = new FormData();
                weddingImages.forEach((image, index) => {
                    formData.append(`images[${index}]`, image.file);
                    formData.append(`positions[${index}]`, image.position);
                });

                const uploadResponse = await fetch(`${apiUrl}/upload/images`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();
                if (uploadResult.success && uploadResult.data) {
                    // Giả sử API trả về danh sách URL và position
                    uploadedImageUrls.push(...uploadResult.data); // Ví dụ: [{ url: "https://...", position: "main" }, ...]
                } else {
                    throw new Error(uploadResult.message || 'Không thể upload hình ảnh');
                }
            }

            // Gửi inviteeNames và danh sách URL hình ảnh cùng với request create-payment
            const paymentResponse = await fetch(`${apiUrl}/payos/create-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    totalAmount: calculatedTotalPrice,
                    description: 'Thanh toán thiệp cưới',
                    templateId,
                    inviteeNames,
                    weddingImages: uploadedImageUrls, // Gửi danh sách URL hình ảnh
                }),
            });

            const paymentResult = await paymentResponse.json();
            if (paymentResult.success && paymentResult.paymentLink) {
                window.location.href = paymentResult.paymentLink;
            } else {
                throw new Error(paymentResult.message || 'Không thể tạo liên kết thanh toán');
            }
        } catch (error) {
            console.error('Lỗi khi xử lý thanh toán:', error);
            alert('Lỗi khi xử lý thanh toán. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingPrice) {
        return <div className={styles.loading}>Đang tải giá...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div
            className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}
            onAnimationEnd={handleCloseAnimationEnd}
        >
            <div className={styles.popupHeader}>
                <h2 className={styles.popupTitle}>Nhập Tên Khách Mời</h2>
                <p className={styles.popupSubtitle}>
                    Số lượng: {quantity} lời mời • Tổng giá: {formattedTotalPrice}
                </p>
            </div>
            <div className={styles.popupBody}>
                <div className={styles.inviteeSection}>
                    {Array.from({ length: quantity }, (_, index) => (
                        <div key={index} className={styles.inviteeInput}>
                            <label htmlFor={`invitee-${index}`}>Tên người mời {index + 1}:</label>
                            <input
                                type="text"
                                id={`invitee-${index}`}
                                value={inviteeNames[index]}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                placeholder={`Nhập tên người mời ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
                <div className={styles.actionButtons}>
                    <button
                        className={styles.customizeButton}
                        onClick={handleSubmit}
                        disabled={isLoading || templatePrice === null}
                    >
                        {isLoading ? 'Đang xử lý...' : `Thanh toán với giá ${formattedTotalPrice}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteePopup;

// 'use client';
// import React, { useState, useEffect } from 'react';
// import styles from './InviteePopup.module.css';

// interface InviteePopupProps {
//     templateId: string;
//     quantity: number;
//     onClose: () => void;
//     id: string;
// }

// const priceCardDefault = Number(process.env.NEXT_PUBLIC_PRICE_CARD) || 500;
// const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

// const InviteePopup: React.FC<InviteePopupProps> = ({ templateId, quantity, onClose, id }) => {
//     const [isClosing] = useState(false);
//     const [inviteeNames, setInviteeNames] = useState<string[]>(Array(quantity).fill(''));
//     const [isLoading, setIsLoading] = useState(false);
//     const [templatePrice, setTemplatePrice] = useState<number | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [isLoadingPrice, setIsLoadingPrice] = useState(true);

//     // Check apiUrl
//     useEffect(() => {
//         if (!apiUrl) {
//             setError('API URL không được định nghĩa.');
//             setTemplatePrice(0);
//             setIsLoadingPrice(false);
//         }
//     }, []);

//     // Fetch template price from API
//     useEffect(() => {
//         async function fetchTemplatePrice() {
//             if (!apiUrl) return;
//             setIsLoadingPrice(true);
//             try {
//                 const response = await fetch(`${apiUrl}/templates/getTemplate/${templateId}`);
//                 const result = await response.json();
//                 if (result.statusCode === 200 && result.data?.price) {
//                     setTemplatePrice(result.data.price);
//                 } else {
//                     throw new Error(result.message || 'Không lấy được giá template');
//                 }
//             } catch (err) {
//                 console.error('Lỗi khi lấy giá template:', err);
//                 setError('Không thể tải giá template. Vui lòng thử lại.');
//                 setTemplatePrice(0);
//             } finally {
//                 setIsLoadingPrice(false);
//             }
//         }
//         fetchTemplatePrice();
//     }, [templateId]);

//     // Adjust inviteeNames when quantity changes
//     useEffect(() => {
//         setInviteeNames((prev) => {
//             const newNames = Array(quantity).fill('');
//             prev.forEach((name, index) => {
//                 if (index < quantity) {
//                     newNames[index] = name;
//                 }
//             });
//             return newNames;
//         });
//     }, [quantity]);

//     // Calculate totalPrice
//     const calculatedTotalPrice =
//         templatePrice !== null
//             ? (() => {
//                   const basePrice = Number(templatePrice);
//                   let totalPrice = basePrice;
//                   if (quantity > Number(process.env.NEXT_PUBLIC_APP_NUMBER_REQUEST)) {
//                       totalPrice += quantity * priceCardDefault;
//                   }
//                   return totalPrice;
//               })()
//             : 0;

//     // Format totalPrice
//     const formattedTotalPrice = calculatedTotalPrice
//         ? calculatedTotalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ'
//         : '0 vnđ';

//     const handleCloseAnimationEnd = () => {
//         if (isClosing) {
//             onClose();
//         }
//     };

//     const handleNameChange = (index: number, value: string) => {
//         const updatedNames = [...inviteeNames];
//         updatedNames[index] = value;
//         setInviteeNames(updatedNames);
//     };

//     const handleSubmit = async () => {
//         if (inviteeNames.some((name) => name.trim() === '')) {
//             alert('Vui lòng nhập đầy đủ tên của tất cả người được mời.');
//             return;
//         }

//         if (templatePrice === null) {
//             alert('Không thể tạo thanh toán do lỗi tải giá template.');
//             return;
//         }

//         setIsLoading(true);
//         try {
//             const token = localStorage.getItem('accessToken');
//             if (!token) {
//                 throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
//             }

//             // Gửi inviteeNames cùng với request create-payment
//             const paymentResponse = await fetch(`${apiUrl}/payos/create-payment`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({
//                     totalAmount: calculatedTotalPrice,
//                     description: 'Thanh toán thiệp cưới',
//                     templateId,
//                     inviteeNames, // Gửi danh sách tên khách mời
//                 }),
//             });

//             const paymentResult = await paymentResponse.json();
//             if (paymentResult.success && paymentResult.paymentLink) {
//                 // localStorage.setItem(`Template${paymentResult.orderCode}`, templateId);
//                 window.location.href = paymentResult.paymentLink;
//             } else {
//                 throw new Error(paymentResult.message || 'Không thể tạo liên kết thanh toán');
//             }
//         } catch (error) {
//             console.error('Lỗi khi xử lý thanh toán:', error);
//             alert('Lỗi khi xử lý thanh toán. Vui lòng thử lại.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (isLoadingPrice) {
//         return <div className={styles.loading}>Đang tải giá...</div>;
//     }

//     if (error) {
//         return <div className={styles.error}>{error}</div>;
//     }

//     return (
//         <div
//             className={`${styles.popupContent} ${isClosing ? styles.closing : ''}`}
//             onAnimationEnd={handleCloseAnimationEnd}
//         >
//             <div className={styles.popupHeader}>
//                 <h2 className={styles.popupTitle}>Nhập Tên Khách Mời</h2>
//                 <p className={styles.popupSubtitle}>
//                     Số lượng: {quantity} lời mời • Tổng giá: {formattedTotalPrice}
//                 </p>
//             </div>
//             <div className={styles.popupBody}>
//                 <div className={styles.inviteeSection}>
//                     {Array.from({ length: quantity }, (_, index) => (
//                         <div key={index} className={styles.inviteeInput}>
//                             <label htmlFor={`invitee-${index}`}>Tên người mời {index + 1}:</label>
//                             <input
//                                 type="text"
//                                 id={`invitee-${index}`}
//                                 value={inviteeNames[index]}
//                                 onChange={(e) => handleNameChange(index, e.target.value)}
//                                 placeholder={`Nhập tên người mời ${index + 1}`}
//                             />
//                         </div>
//                     ))}
//                 </div>
//                 <div className={styles.actionButtons}>
//                     <button
//                         className={styles.customizeButton}
//                         onClick={handleSubmit}
//                         disabled={isLoading || templatePrice === null}
//                     >
//                         {isLoading ? 'Đang xử lý...' : `Thanh toán với giá ${formattedTotalPrice}`}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default InviteePopup;
