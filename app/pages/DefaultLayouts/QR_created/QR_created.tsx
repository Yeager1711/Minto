'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faQrcode, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './QR_created.module.css';
import { useApi } from '../../../lib/apiContext/apiContext';
import { showToastError } from 'app/Ultils/toast';
import DynamicIsland from 'app/pages/Dynamic_Island/DynamicIsLand';

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

    // DynamicIsland states (local UI)
    const [isOpenDynamic, setIsOpenDynamic] = useState<boolean>(false);
    const [dynamicState, setDynamicState] = useState<'minimal' | 'compact' | 'expanded'>('compact');
    const [dynamicStatus, setDynamicStatus] = useState<'success' | 'failure' | undefined>(undefined);
    const [dynamicAction, setDynamicAction] = useState<string | undefined>(undefined);
    const [dynamicDuration, setDynamicDuration] = useState<number | undefined>(undefined);

    const { getUserQr, updateQrStatus, updateDynamic } = useApi();
    const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL ?? '';

    const getBank = (bankId: string): Bank | undefined => {
        return banks.find((b) => String(b.id) === String(bankId));
    };

    const showDynamicMessage = async (
        type: 'success' | 'error',
        title: string,
        message: string,
        duration?: number,
        oldData?: Partial<QrResponse>,
        newData?: Partial<QrResponse>,
        state: 'compact' | 'expanded' = 'expanded' // Default to 'expanded' unless specified
    ): Promise<void> => {
        const payload: DynamicPayload = {
            state: state,
            action: type === 'success' ? 'success' : 'failure',
            actionTitle: title,
            describe: message,
            time: new Date().toISOString(),
            duration: duration ?? 3000,
            oldData,
            newData,
        };

        console.log('Payload sent to updateDynamic:', payload); // Thêm log để kiểm tra

        try {
            const data = await updateDynamic(payload);
            console.log('Response from updateDynamic:', data); // Thêm log để kiểm tra
            setDynamicState(data?.state ?? state);
            setDynamicStatus(data?.action ?? (type === 'success' ? 'success' : 'failure'));
            setDynamicAction(data?.actionTitle ?? title);
            setDynamicDuration(data?.duration ?? payload.duration);
            setIsOpenDynamic(true);
        } catch (err: unknown) {
            console.error('updateDynamic failed, falling back to local display:', err);
            setDynamicState(state);
            setDynamicStatus(type === 'success' ? 'success' : 'failure');
            setDynamicAction(title);
            setDynamicDuration(duration ?? 3000);
            setIsOpenDynamic(true);
        }
    };

    const validateAccountNumber = (accountNumber: string): boolean => {
        return accountNumber.length >= 6 && accountNumber.length <= 20 && /^\d+$/.test(accountNumber);
    };

    const validateAccountHolder = (accountHolder: string): boolean => {
        return accountHolder.length >= 3 && /^[A-Za-z\s]+$/.test(accountHolder);
    };

    const handleQRClick = (qrId: number): void => {
        setShowQR((prev) => ({
            ...prev,
            [qrId]: !prev[qrId],
        }));
    };

    const handleCardClick = (qr: QrResponse): void => {
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

    const handleCloseEdit = (): void => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async (): Promise<void> => {
        if (!selectedQr) return;

        if (!validateAccountNumber(formData.accountNumber)) {
            const msg = 'Số tài khoản phải có từ 6 đến 20 chữ số';
            showToastError(msg);
            await showDynamicMessage('error', 'Cập nhật QR thất bại', msg);
            return;
        }

        if (!validateAccountHolder(formData.accountHolder)) {
            const msg = 'Tên chủ tài khoản chỉ được chứa chữ cái và khoảng trắng, tối thiểu 3 ký tự';
            showToastError(msg);
            await showDynamicMessage('error', 'Cập nhật QR thất bại', msg);
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            const oldQrData: QrResponse = { ...selectedQr };
            const response = await fetch(`${apiUrl}/qr/edit/${selectedQr.qrId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken ?? ''}`,
                    'ngrok-skip-browser-warning': 'true',
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

            // Identify changed fields
            const changedFields: Partial<QrResponse> = {};
            const oldChangedFields: Partial<QrResponse> = {};

            if (oldQrData.bank !== updatedQr.bank) {
                changedFields.bank = updatedQr.bank;
                oldChangedFields.bank = oldQrData.bank;
            }
            if (oldQrData.accountNumber !== updatedQr.accountNumber) {
                changedFields.accountNumber = updatedQr.accountNumber;
                oldChangedFields.accountNumber = oldQrData.accountNumber;
            }
            if (oldQrData.accountHolder !== updatedQr.accountHolder) {
                changedFields.accountHolder = updatedQr.accountHolder;
                oldChangedFields.accountHolder = oldQrData.accountHolder;
            }
            if (oldQrData.representative !== updatedQr.representative) {
                changedFields.representative = updatedQr.representative;
                oldChangedFields.representative = oldQrData.representative;
            }

            // Nếu không có thay đổi nào, sử dụng dữ liệu đầy đủ để hiển thị
            if (Object.keys(changedFields).length === 0) {
                changedFields.bank = updatedQr.bank;
                changedFields.accountNumber = updatedQr.accountNumber;
                changedFields.accountHolder = updatedQr.accountHolder;
                changedFields.representative = updatedQr.representative;
                oldChangedFields.bank = oldQrData.bank;
                oldChangedFields.accountNumber = oldQrData.accountNumber;
                oldChangedFields.accountHolder = oldQrData.accountHolder;
                oldChangedFields.representative = oldQrData.representative;
            }

            // Update local QR data
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

            // Pass only changed fields to DynamicIsland with 'expanded' state
            await showDynamicMessage(
                'success',
                'Cập nhật QR',
                'Thông tin QR đã được cập nhật thành công',
                5000,
                oldChangedFields,
                changedFields
            );

            handleCloseEdit();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật thông tin QR';
            showToastError(errorMessage);
            await showDynamicMessage('error', 'Cập nhật QR thất bại', errorMessage);
            setApiError(errorMessage);
        }
    };

    const handleToggle = async (): Promise<void> => {
        const newReceiveDonation = !receiveDonation;
        setReceiveDonation(newReceiveDonation);

        try {
            const qrList = await getUserQr();
            if (qrList.length === 0) {
                throw new Error('Không tìm thấy mã QR');
            }

            const newStatus = newReceiveDonation ? 'ACTIVE' : 'SUCCESS';
            const updatePromises = qrList.map((qr: QrResponse) => updateQrStatus(qr.qrId, newStatus));
            await Promise.all(updatePromises);

            const updatedQrList = await getUserQr();
            const allUpdated = updatedQrList.every((qr: QrResponse) => qr.status === newStatus);
            if (!allUpdated) {
                throw new Error('Cập nhật trạng thái QR không thành công');
            }

            setLocalQrData(updatedQrList);
            await showDynamicMessage(
                'success',
                newReceiveDonation ? 'Cho phép nhận Hỷ' : 'Dừng nhận Hỷ',
                newReceiveDonation
                    ? 'Đã cho phép nhận tiền Hỷ qua QR code'
                    : 'Đã dừng cho phép nhận tiền Hỷ qua QR code',
                3500, // Duration phù hợp với Compact (3.5s + 1.3s delay)
                undefined,
                undefined,
                'compact' // Use 'compact' state for toggle actions
            );
            setApiError('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái QR code';
            await showDynamicMessage(
                'error',
                'Cập nhật trạng thái QR thất bại',
                errorMessage,
                3500,
                undefined,
                undefined,
                'compact' // Use 'compact' state for error
            );
            setApiError(errorMessage);
            setReceiveDonation(!newReceiveDonation);
        }
    };

    useEffect(() => {
        const fetchQrStatus = async (): Promise<void> => {
            try {
                const qrList = await getUserQr();
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
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Lỗi khi lấy trạng thái QR';
                setReceiveDonation(false);
                setLocalQrData([]);
                setApiError(errorMessage);
            }
        };

        if (isOpen && qrData) {
            fetchQrStatus();
        }
    }, [isOpen, qrData, getUserQr]);

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

    const isTimelineCompleted = groomQr && brideQr && groomQr.status === 'ACTIVE' && brideQr.status === 'ACTIVE';

    return (
        <div className={styles.QR_CheckAsset}>
            <DynamicIsland
                isOpenDynamic={isOpenDynamic}
                onCloseDynamic={() => setIsOpenDynamic(false)}
                payload={{
                    state: dynamicState,
                    action: dynamicStatus ?? 'success',
                    actionTitle: dynamicAction,
                    describe: dynamicAction,
                    duration: dynamicDuration,
                }}
            />

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
                            <div className={`${styles.item} ${styles.completed}`}>
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
                    <div className={styles.btn_close} onClick={handleCloseEdit}>
                        <FontAwesomeIcon icon={faTimes} />
                        Đóng
                    </div>
                    <h3>Chỉnh sửa thông tin thẻ</h3>
                    <div className={styles.wrapper_preview}>
                        <div
                            key={animationKey}
                            className={`${styles.card_previrew} ${
                                isEditOpen && !isClosing ? styles.animate : isClosing ? styles.slideDown : ''
                            }`}
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
