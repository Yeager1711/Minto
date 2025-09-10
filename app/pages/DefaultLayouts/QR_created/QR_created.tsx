'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faQrcode, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './QR_created.module.css';
import { useApi } from '../../../lib/apiContext/apiContext';
import { showToastError } from 'app/Ultils/toast';
import { toast } from 'react-toastify';

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

interface Bank {
    id: string;
    name: string;
    shortName?: string;
    code?: string;
    bin?: string;
    logo?: string;
}

interface QR_CreatedProps {
    isOpen: boolean;
    onClose: () => void;
    qrData: QrResponse[] | null;
    banks: Bank[];
    createdAt?: string | Date | null;
}

const QR_Created: React.FC<QR_CreatedProps> = ({ isOpen, onClose, qrData, banks, createdAt }) => {
    const [showQR, setShowQR] = useState<{ [key: number]: boolean }>({});
    const [receiveDonation, setReceiveDonation] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>('');
    const [localQrData, setLocalQrData] = useState<QrResponse[] | null>(qrData);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [selectedQr, setSelectedQr] = useState<QrResponse | null>(null);
    const [animationKey, setAnimationKey] = useState<number>(0);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [formData, setFormData] = useState<{
        bank: string;
        accountNumber: string;
        accountHolder: string;
        representative: string | null;
    }>({
        bank: '',
        accountNumber: '',
        accountHolder: '',
        representative: null,
    });
    const { getUserQr, updateQrStatus } = useApi();
    const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL || '';

    const getBank = (bankId: string) => {
        return banks.find((b) => String(b.id) === String(bankId));
    };

    const handleQRClick = (qrId: number) => {
        setShowQR((prev) => ({
            ...prev,
            [qrId]: !prev[qrId] || false,
        }));
    };

    const handleCardClick = (qr: QrResponse) => {
        setSelectedQr(qr);
        setFormData({
            bank: qr.bank,
            accountNumber: qr.accountNumber,
            accountHolder: qr.accountHolder,
            representative: qr.representative,
        });
        setIsEditOpen(true);
        setAnimationKey((prev) => prev + 1);
        setIsClosing(false);
    };

    const handleCloseEdit = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsEditOpen(false);
            setSelectedQr(null);
            setFormData({
                bank: '',
                accountNumber: '',
                accountHolder: '',
                representative: null,
            });
            setIsClosing(false);
        }, 300);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!selectedQr) return;

        // Kiểm tra hợp lệ phía client
        if (
            formData.accountNumber &&
            (formData.accountNumber.length < 6 ||
                formData.accountNumber.length > 20 ||
                !/^\d+$/.test(formData.accountNumber))
        ) {
            showToastError('Số tài khoản phải có từ 6 đến 20 chữ số');
            return;
        }

        if (
            formData.accountHolder &&
            (formData.accountHolder.length < 3 || !/^[A-Za-z\s]+$/.test(formData.accountHolder))
        ) {
            showToastError('Tên chủ tài khoản chỉ được chứa chữ cái và khoảng trắng, tối thiểu 3 ký tự');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken')
            const response = await fetch(`${apiUrl}/qr/edit/${selectedQr.qrId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    bank: formData.bank,
                    accountNumber: formData.accountNumber,
                    accountHolder: formData.accountHolder,
                    representative: formData.representative,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi cập nhật thông tin QR');
            }

            const updatedQr: QrResponse = await response.json();
            setLocalQrData((prev) =>
                prev ? prev.map((qr) => (qr.qrId === updatedQr.qrId ? updatedQr : qr)) : [updatedQr]
            );
            setSelectedQr(updatedQr);
            setFormData({
                bank: updatedQr.bank,
                accountNumber: updatedQr.accountNumber,
                accountHolder: updatedQr.accountHolder,
                representative: updatedQr.representative,
            });
            toast.success('Cập nhật thông tin QR thành công');
            handleCloseEdit();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật thông tin QR';
            showToastError(errorMessage);
            setApiError(errorMessage);
        }
    };

    useEffect(() => {
        const fetchQrStatus = async () => {
            try {
                const qrList = await getUserQr();
                console.log('Dữ liệu QR nhận được từ getUserQr:', qrList);
                if (qrList.length > 0) {
                    const allActive = qrList.every((qr: QrResponse) => qr.status === 'ACTIVE');
                    setReceiveDonation(allActive);
                    setLocalQrData(qrList);
                    setApiError('');
                } else {
                    setReceiveDonation(false);
                    setLocalQrData([]);
                    setApiError('Bạn chưa có mã QR cho phép nhận tiền Hỷ qua QR');
                }
            } catch (error) {
                console.error('Lỗi khi lấy trạng thái QR:', error);
                setReceiveDonation(false);
                setLocalQrData([]);
                setApiError('Bạn chưa có mã QR cho phép nhận tiền Hỷ qua QR');
            }
        };

        if (isOpen && qrData) {
            fetchQrStatus();
        }
    }, [isOpen, qrData, getUserQr]);

    const handleToggle = async () => {
        const newReceiveDonation = !receiveDonation;
        setReceiveDonation(newReceiveDonation);

        try {
            const qrList = await getUserQr();
            console.log('Dữ liệu QR nhận được từ getUserQr:', qrList);

            if (qrList.length === 0) {
                throw new Error('Không tìm thấy mã QR');
            }

            const newStatus = newReceiveDonation ? 'ACTIVE' : 'SUCCESS';
            const updatePromises = qrList.map((qr: QrResponse) => updateQrStatus(qr.qrId, newStatus));

            await Promise.all(updatePromises);
            console.log('Đã cập nhật trạng thái cho tất cả QR codes:', newStatus);

            const updatedQrList = await getUserQr();
            console.log('Dữ liệu QR sau khi cập nhật:', updatedQrList);

            const allUpdated = updatedQrList.every((qr: QrResponse) => qr.status === newStatus);
            if (!allUpdated) {
                throw new Error('Cập nhật trạng thái QR không thành công');
            }

            setLocalQrData(updatedQrList);
            toast.success(
                newReceiveDonation
                    ? 'Đã cho phép nhận tiền Hỷ qua QR code'
                    : 'Đã dừng cho phép nhận tiền Hỷ qua QR code'
            );
            setApiError('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái QR code';
            console.error('Lỗi trong handleToggle:', errorMessage, error);
            showToastError(errorMessage);
            setApiError(errorMessage);
            setReceiveDonation(!newReceiveDonation);
        }
    };

    useEffect(() => {
        setLocalQrData(qrData);
    }, [qrData]);

    if (!isOpen) return null;

    if (!localQrData || localQrData.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu QR.</div>;
    }

    const groomQr = localQrData.find((qr) => qr.representative === 'groom');
    const brideQr = localQrData.find((qr) => qr.representative === 'bride');

    const sortedQrs = [groomQr, brideQr]
        .filter((qr): qr is QrResponse => !!qr)
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
        });

    const isTimelineCompleted =
        groomQr && brideQr && groomQr.status === 'ACTIVE' && brideQr.status === 'ACTIVE' && createdAt;

    return (
        <div className={styles.QR_CheckAsset}>
            <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header} onClick={onClose}>
                    <FontAwesomeIcon className={styles.btn_close} icon={faArrowLeft} />
                    Trở lại
                </div>

                {apiError && (
                    <div className={styles.error} style={{ paddingBottom: '2rem' }}>
                        {apiError}
                    </div>
                )}

                <div className={styles.current_day}>
                    {new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric',
                    })}
                    <br />
                    <h3>Today</h3>
                    <div className={styles.toggleContainer}>
                        <span className={styles.toggleLabel}>
                            {receiveDonation ? 'Dừng cho phép nhận Hỷ' : 'Cho phép nhận Hỷ qua QR code'}
                        </span>
                        <button
                            className={`${styles.toggleButton} ${receiveDonation ? styles.active : ''}`}
                            onClick={handleToggle}
                            aria-pressed={receiveDonation}
                        >
                            <span className={styles.toggleSlider}></span>
                        </button>
                    </div>
                </div>

                <div className={styles.progress_checkTask}>
                    <div className={styles.progress_wrapper}>
                        <div className={`${styles.timeline} ${isTimelineCompleted ? styles.completed : ''}`}>
                            {sortedQrs.reverse().map((qr) => (
                                <div
                                    key={qr.qrId}
                                    className={`${styles.item} ${qr.status === 'ACTIVE' ? styles.completed : ''}`}
                                    onClick={() => handleCardClick(qr)}
                                >
                                    <div className={styles.time}>
                                        {qr.representative === 'groom' ? 'Groom' : 'Bride'}
                                    </div>
                                    <div className={styles.schedule_content}>
                                        <h3>✧ QR của {qr.representative === 'groom' ? 'Chú Rể' : 'Cô Dâu'}</h3>
                                        <div className={styles.card}>
                                            <h3>{qr.accountHolder}</h3>
                                            <div className={styles.image_bank}>
                                                {showQR[qr.qrId] ? (
                                                    <Image
                                                        src={qr.qrCodeUrl}
                                                        alt={`QR ${qr.representative}`}
                                                        width={200}
                                                        height={200}
                                                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                ) : getBank(qr.bank)?.logo ? (
                                                    <Image
                                                        src={getBank(qr.bank)?.logo || '/placeholder.png'}
                                                        alt="Bank Logo"
                                                        width={50}
                                                        height={50}
                                                        style={{ objectFit: 'cover' }}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                ) : (
                                                    <Image
                                                        src={qr.qrCodeUrl}
                                                        alt={`QR ${qr.representative}`}
                                                        width={200}
                                                        height={200}
                                                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                )}
                                            </div>

                                            <div className={styles.QR_code}>
                                                {!showQR[qr.qrId] && (
                                                    <FontAwesomeIcon
                                                        className={styles.qr_icon}
                                                        icon={faQrcode}
                                                        onClick={() => handleQRClick(qr.qrId)}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.number_banks}>
                                                {qr.accountNumber
                                                    ? qr.accountNumber.replace(/(\d{4})/g, '$1 ').trim()
                                                    : 'XXX XXX XXX'}
                                            </div>
                                            <div className={styles.create_at}>
                                                Created: {new Date(qr.createdAt).toLocaleDateString('en-GB')}
                                            </div>
                                            <div className={styles.name_banks}>
                                                {getBank(qr.bank)?.shortName || getBank(qr.bank)?.name || 'Ngân hàng'}
                                            </div>
                                        </div>
                                        <div className={styles.status}>
                                            Trạng thái: <strong>{qr.status}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className={`${styles.item} ${!groomQr || !brideQr ? '' : styles.completed}`}>
                                <div className={styles.schedule_content}>
                                    <h4>Tạo QR thẻ Ngân hàng</h4>
                                    {!groomQr || !brideQr ? (
                                        <p className={styles.unfinished}>Chưa Tạo</p>
                                    ) : (
                                        <p className={styles.status}>Hoàn thành</p>
                                    )}
                                </div>
                            </div>

                            <div className={`${styles.item} ${createdAt ? styles.completed : ''}`}>
                                <div className={styles.time}>
                                    {createdAt
                                        ? new Date(createdAt).toLocaleDateString('en-US', {
                                              month: 'long',
                                              day: '2-digit',
                                              year: 'numeric',
                                          })
                                        : 'Chưa có ngày tạo'}
                                </div>
                                <div className={styles.schedule_content}>
                                    <h4>Tạo tài khoản</h4>
                                    <p className={styles.status}>Đang hoạt động</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles.nav_slide__Edit} ${isEditOpen ? styles.active : ''}`}>
                <div className={styles.slideEdit__wrapper}>
                    <div className={styles.header} onClick={handleCloseEdit}>
                        <FontAwesomeIcon className={styles.btn_close} icon={faTimes} />
                        Đóng
                    </div>
                    <h3>Chỉnh sửa thông tin thẻ</h3>
                    <div className={styles.wrapper_preview}>
                        <div
                            key={animationKey}
                            className={`${styles.card_previrew} ${isEditOpen && !isClosing ? styles.animate : isClosing ? styles.slideDown : ''}`}
                        >
                            <div className={styles.number_banks}>
                                {formData.accountNumber ? formData.accountNumber.replace(/(\d{4})/g, '$1 ').trim() : ''}
                            </div>
                            <h3>{formData.accountHolder}</h3>
                            <div className={styles.image_bank}>
                                {selectedQr && showQR[selectedQr.qrId] ? (
                                    <Image
                                        src={selectedQr.qrCodeUrl}
                                        alt={`QR ${formData.representative}`}
                                        width={200}
                                        height={200}
                                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                        onClick={() => handleQRClick(selectedQr.qrId)}
                                    />
                                ) : selectedQr && getBank(formData.bank)?.logo ? (
                                    <Image
                                        src={getBank(formData.bank)?.logo || '/placeholder.png'}
                                        alt="Bank Logo"
                                        width={50}
                                        height={50}
                                        style={{ objectFit: 'cover' }}
                                        onClick={() => handleQRClick(selectedQr.qrId)}
                                    />
                                ) : selectedQr ? (
                                    <Image
                                        src={selectedQr.qrCodeUrl}
                                        alt={`QR ${formData.representative}`}
                                        width={200}
                                        height={200}
                                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                        onClick={() => handleQRClick(selectedQr.qrId)}
                                    />
                                ) : null}
                            </div>
                            <div className={styles.create_at}>
                                Created: {selectedQr ? new Date(selectedQr.createdAt).toLocaleDateString('en-GB') : ''}
                            </div>
                            <div className={styles.name_banks}>
                                {getBank(formData.bank)?.shortName || getBank(formData.bank)?.name || ''}
                            </div>
                        </div>
                    </div>

                    <div className={styles.qr_for}>
                        ✧ QR của {formData.representative === 'groom' ? 'Chú Rể' : 'Cô Dâu'}
                    </div>

                    <div className={styles.wrapper_boxInput}>
                        <div className={styles.box_input}>
                            <span>Người đại diện</span>
                            <select
                                name="representative"
                                value={formData.representative || ''}
                                onChange={handleInputChange}
                            >
                                <option value="bride">Cô dâu</option>
                                <option value="groom">Chú rể</option>
                            </select>
                        </div>

                        <div className={styles.box_input}>
                            <span>Chọn loại ngân hàng</span>
                            <select name="bank" value={formData.bank || ''} onChange={handleInputChange}>
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.shortName || bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.box_input}>
                            <span>Số tài khoản</span>
                            <input
                                type="text"
                                name="accountNumber"
                                placeholder="Số tài khoản"
                                value={formData.accountNumber || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.box_input}>
                            <span>Tên Tài khoản</span>
                            <input
                                type="text"
                                name="accountHolder"
                                placeholder="Tên tài khoản"
                                value={formData.accountHolder || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={styles.btn_save} onClick={handleSave}>
                        Lưu thông tin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QR_Created;
