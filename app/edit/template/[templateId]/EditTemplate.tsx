'use client';

import React, { useState, useEffect } from 'react';
import styles from './EditTemplate.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApi } from '../../../lib/apiContext/apiContext';
import { showToastError } from 'app/Ultils/toast';
import { toast } from 'react-toastify';
import CreateCardPopup from 'app/popup/createCardFeature/CreateCardPopup';

export interface TemplateWeddingData {
    bride: string;
    groom: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    lunarDay: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    brideStory: string;
    groomStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string; // Now a coordinate string, e.g., "(10.3503377,106.1526945)"
    brideMapUrl: string; // Now a coordinate string
    weddingDate: Date | null;
}

interface EditTemplateProps {
    weddingData: TemplateWeddingData;
    templateId: string;
}

interface FieldConfig {
    label: string;
    path: string[];
    placeholder: string;
    type?: 'text' | 'time' | 'textarea' | 'date';
    transform?: (value: string) => string;
    validate?: (value: string) => string | null;
}

const EditTemplate: React.FC<EditTemplateProps> = ({ weddingData, templateId }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getUserQr, updateQrStatus } = useApi();

    const parseWeddingDate = (dateStr: string | Date | null): Date | null => {
        if (typeof dateStr === 'string' && dateStr.trim()) {
            const [day, month, year] = dateStr.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    };

    const formatDateToDDMMYYYY = (date: Date | null): string => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateToInput = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState<TemplateWeddingData>({
        ...weddingData,
        weddingDate: parseWeddingDate(weddingData.weddingDate),
    });
    const [receiveDonation, setReceiveDonation] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [templateIdError, setTemplateIdError] = useState<string>('');
    const [apiError, setApiError] = useState<string>('');
    const [hasQrCode, setHasQrCode] = useState<boolean>(false);
    const [isCreateCardPopupOpen, setIsCreateCardPopupOpen] = useState<boolean>(false);
    const quantity = searchParams.get('quantity') || '1';

    const handleCreateCardSubmit = (data: {
        bank: string;
        accountNumber: string;
        accountHolder: string;
        qrCodeUrl?: string;
    }) => {
        setHasQrCode(true);
        setReceiveDonation(true);
        setApiError('');
        setIsCreateCardPopupOpen(false);
        console.log('Received card data:', data);
    };

    useEffect(() => {
        const fetchQrStatus = async () => {
            try {
                const qr = await getUserQr();
                setHasQrCode(true);
                setReceiveDonation(qr.status === 'ACTIVE');
                setApiError('');
            } catch (error) {
                console.error('Lỗi khi lấy trạng thái QR:', error);
                setHasQrCode(false);
                setApiError('Bạn chưa có mã QR cho phép nhận tiền Hỷ qua QR');
            }
        };

        if (templateId && templateId !== 'undefined') {
            fetchQrStatus();
        }
    }, [templateId, getUserQr]);

    useEffect(() => {
        setFormData({
            ...weddingData,
            weddingDate: parseWeddingDate(weddingData.weddingDate),
        });
        setErrors({});
    }, [weddingData]);

    useEffect(() => {
        if (!templateId || templateId === 'undefined') {
            setTemplateIdError('Mã mẫu không hợp lệ. Vui lòng thử lại.');
        } else {
            setTemplateIdError('');
        }
    }, [templateId]);

    const capitalize = (value: string): string => {
        if (!value.trim()) return value;
        return value
            .toLowerCase()
            .split(' ')
            .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
            .join(' ');
    };

    const validateField = (path: string[], value: string, validateFn?: (value: string) => string | null) => {
        const fieldKey = path.join('.');
        if (validateFn) {
            const error = validateFn(value);
            setErrors((prev) => ({
                ...prev,
                [fieldKey]: error || '',
            }));
        }
    };

    const handleChange = (path: string[], value: string | Date, validateFn?: (value: string) => string | null) => {
        if (path[0] === 'weddingDate' && typeof value === 'string') {
            const [year, month, day] = value.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            if (isNaN(date.getTime())) {
                setFormData((prev) => ({
                    ...prev,
                    weddingDate: null,
                }));
                validateField(path, '', validateFn);
                return;
            }
            setFormData((prev) => ({
                ...prev,
                weddingDate: date,
            }));
            const formattedDate = formatDateToDDMMYYYY(date);
            validateField(path, formattedDate, validateFn);
            return;
        }

        const shouldCapitalize =
            !path.includes('groomMapUrl') &&
            !path.includes('brideMapUrl') &&
            !path.includes('weddingTime') &&
            !path.includes('weddingDate');
        const transformedValue = shouldCapitalize && typeof value === 'string' ? capitalize(value) : value;

        setFormData((prev) => {
            const updated: TemplateWeddingData = { ...prev };
            let current = updated as unknown as Record<string, unknown>;
            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                current[key] = current[key] ? { ...current[key] } : {};
                current = current[key] as Record<string, unknown>;
            }
            current[path[path.length - 1]] = transformedValue;
            return updated;
        });

        if (validateFn && typeof transformedValue === 'string') {
            validateField(path, transformedValue, validateFn);
        }
    };

    const handleToggle = async () => {
        const newReceiveDonation = !receiveDonation;
        setReceiveDonation(newReceiveDonation);

        try {
            const qr = await getUserQr();
            if (!qr.qrId) {
                throw new Error('Không tìm thấy mã QR');
            }

            const updatedQr = await updateQrStatus(qr.qrId, newReceiveDonation ? 'ACTIVE' : 'SUCCESS');
            if (updatedQr.status !== (newReceiveDonation ? 'ACTIVE' : 'SUCCESS')) {
                throw new Error('Cập nhật trạng thái QR không thành công');
            }
            toast.success(
                newReceiveDonation
                    ? 'Đã cho phép nhận tiền Hỷ qua QR code'
                    : 'Đã dừng cho phép nhận tiền Hỷ qua QR code'
            );
            setApiError('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái QR code';
            showToastError(errorMessage);
            setApiError(errorMessage);
            setReceiveDonation(!newReceiveDonation);
        }
    };

    const getNestedValue = (obj: TemplateWeddingData, path: string[]): string | Date | null => {
        const value = path.reduce(
            (current: Record<string, unknown>, key) => {
                if (current && typeof current === 'object' && key in current) {
                    return current[key] as Record<string, unknown>;
                }
                return {} as Record<string, unknown>;
            },
            obj as unknown as Record<string, unknown>
        );
        return typeof value === 'string' || value instanceof Date || value === null ? value : '';
    };

    const handleSave = () => {
        if (!templateId || templateId === 'undefined' || !/^\d+$/.test(templateId)) {
            setTemplateIdError('Mã mẫu không hợp lệ. Vui lòng thử lại.');
            showToastError('Mã mẫu không hợp lệ. Vui lòng thử lại.');
            return;
        }

        const validationErrors: { [key: string]: string } = {};
        fields.forEach(({ path, validate }) => {
            if (validate) {
                const value = getNestedValue(formData, path);
                let formattedValue = '';
                if (path[0] === 'weddingDate' && value instanceof Date) {
                    formattedValue = formatDateToDDMMYYYY(value);
                } else if (typeof value === 'string') {
                    formattedValue = value;
                }
                const error = validate(formattedValue);
                if (error) {
                    validationErrors[path.join('.')] = error;
                }
            }
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const saveData = {
            ...formData,
            weddingDate: formData.weddingDate ? formatDateToDDMMYYYY(formData.weddingDate) : '',
        };

        localStorage.setItem(`WeddingData${templateId}`, JSON.stringify(saveData));
        router.push(`/template/${templateId}/edit_image/${templateId}?quantity=${quantity}`);
    };

    const handleCancel = () => {
        router.back();
    };

    const fields: FieldConfig[] = [
        {
            label: 'Tên chú rể',
            path: ['groom'],
            placeholder: 'Ví dụ: Kim Thành',
            validate: (value: string) => (value.trim() ? null : 'Tên chú rể không được để trống'),
        },
        {
            label: 'Tên cô dâu',
            path: ['bride'],
            placeholder: 'Ví dụ: Hải Yến',
            validate: (value: string) => (value.trim() ? null : 'Tên cô dâu không được để trống'),
        },
        {
            label: 'Ngày cưới',
            path: ['weddingDate'],
            placeholder: 'dd/mm/yyyy',
            type: 'date',
            validate: (value: string) => {
                if (!value) return 'Ngày cưới không được để trống';
                const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
                if (!regex.test(value)) return 'Định dạng ngày phải là DD/MM/YYYY';
                const [day, month, year] = value.split('/').map(Number);
                return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100
                    ? null
                    : 'Ngày cưới không hợp lệ';
            },
        },
        {
            label: 'Ngày trong tuần',
            path: ['weddingDayOfWeek'],
            placeholder: 'Ví dụ: Thứ Hai',
            validate: (value: string) => (value.trim() ? null : 'Ngày trong tuần không được để trống'),
        },
        {
            label: 'Giờ tham dự',
            path: ['weddingTime'],
            type: 'time',
            placeholder: 'Ví dụ: 18:00',
            validate: (value: string) => (value ? null : 'Giờ cưới không được để trống'),
        },
        {
            label: 'Ngày âm lịch',
            path: ['lunarDay'],
            placeholder: 'Ví dụ: 18/09/Ất Tỵ',
            validate: (value: string) => (value.trim() ? null : 'Ngày âm lịch không được để trống'),
        },
        {
            label: 'Ông nhà trai',
            path: ['familyGroom', 'father'],
            placeholder: 'Ví dụ: Nguyễn Văn A',
            validate: (value: string) => (value.trim() ? null : 'Tên ông nhà trai không được để trống'),
        },
        {
            label: 'Bà nhà trai',
            path: ['familyGroom', 'mother'],
            placeholder: 'Ví dụ: Trần Thị B',
            validate: (value: string) => (value.trim() ? null : 'Tên bà nhà trai không được để trống'),
        },
        {
            label: 'Ông nhà gái',
            path: ['familyBride', 'father'],
            placeholder: 'Ví dụ: Lê Văn C',
            validate: (value: string) => (value.trim() ? null : 'Tên ông nhà gái không được để trống'),
        },
        {
            label: 'Bà nhà gái',
            path: ['familyBride', 'mother'],
            placeholder: 'Ví dụ: Phạm Thị D',
            validate: (value: string) => (value.trim() ? null : 'Tên bà nhà gái không được để trống'),
        },
        {
            label: 'Địa chỉ nhà trai',
            path: ['groomAddress'],
            placeholder: 'Ví dụ: KDC 13E, Bình Chánh, TP. Hồ Chí Minh',
            validate: (value: string) => (value.trim() ? null : 'Địa chỉ nhà trai không được để trống'),
        },
        {
            label: 'Tọa độ Google Maps nhà trai',
            path: ['groomMapUrl'],
            placeholder: 'Ví dụ: (10.3503377,106.1526945)',
            validate: (value: string) => {
                if (!value.trim()) return 'Tọa độ nhà trai không được để trống';
                const regex = /^\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/;
                if (!regex.test(value))
                    return 'Tọa độ phải có định dạng: (vĩ độ,kinh độ), ví dụ: (10.3503377,106.1526945)';
                const coords = value.match(/-?\d+(\.\d+)?/g);
                if (!coords || coords.length !== 2) return 'Tọa độ không hợp lệ';
                const [lat, lng] = coords.map(Number);
                if (lat < -90 || lat > 90) return 'Vĩ độ phải nằm trong khoảng -90 đến 90';
                if (lng < -180 || lng > 180) return 'Kinh độ phải nằm trong khoảng -180 đến 180';
                return null;
            },
        },
        {
            label: 'Địa chỉ nhà gái',
            path: ['brideAddress'],
            placeholder: 'Ví dụ: KDC 13E, Bình Chánh, TP. Hồ Chí Minh',
            validate: (value: string) => (value.trim() ? null : 'Địa chỉ nhà gái không được để trống'),
        },
        {
            label: 'Tọa độ Google Maps nhà gái',
            path: ['brideMapUrl'],
            placeholder: 'Ví dụ: (10.3503377,106.1526945)',
            validate: (value: string) => {
                if (!value.trim()) return 'Tọa độ nhà gái không được để trống';
                const regex = /^\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)$/;
                if (!regex.test(value))
                    return 'Tọa độ phải có định dạng: (vĩ độ,kinh độ), ví dụ: (10.3503377,106.1526945)';
                const coords = value.match(/-?\d+(\.\d+)?/g);
                if (!coords || coords.length !== 2) return 'Tọa độ không hợp lệ';
                const [lat, lng] = coords.map(Number);
                if (lat < -90 || lat > 90) return 'Vĩ độ phải nằm trong khoảng -90 đến 90';
                if (lng < -180 || lng > 180) return 'Kinh độ phải nằm trong khoảng -180 đến 180';
                return null;
            },
        },
        {
            label: 'Câu chuyện cô dâu',
            path: ['brideStory'],
            placeholder: 'Ví dụ: Hải Yến lớn lên ở một thị trấn nhỏ ven biển...',
            type: 'textarea',
        },
        {
            label: 'Câu chuyện chú rể',
            path: ['groomStory'],
            placeholder: 'Ví dụ: Kim Thành là một họa sĩ trẻ, đam mê vẽ tranh...',
            type: 'textarea',
        },
    ];

    const hasErrors = Object.values(errors).some((error) => error) || !!templateIdError;

    return (
        <div className={styles.editTemplateContainer}>
            {templateIdError && <div className={styles.error}>{templateIdError}</div>}

            <div className={styles.formContainer}>
                <h1>Thêm thông tin mẫu {templateId || 'Không xác định'}</h1>
                {hasQrCode && (
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
                )}

                {apiError && (
                    <div
                        className={styles.error}
                        style={{ paddingBottom: '2rem', cursor: 'pointer' }}
                        onClick={() => setIsCreateCardPopupOpen(true)}
                    >
                        <button>Tạo mã QR nhận Hỷ</button>
                    </div>
                )}

                {fields.map(({ label, path, placeholder, type = 'text', validate }) => (
                    <label key={label} className={styles.formField}>
                        <span className={styles.label}>{label}:</span>
                        {type === 'textarea' ? (
                            <textarea
                                value={getNestedValue(formData, path) as string}
                                onChange={(e) => handleChange(path, e.target.value, validate)}
                                placeholder={placeholder}
                                className={styles.textarea}
                            />
                        ) : type === 'date' ? (
                            <div className={styles.dateFieldContainer}>
                                <input
                                    type="date"
                                    value={formatDateToInput(getNestedValue(formData, path) as Date | null)}
                                    onChange={(e) => handleChange(path, e.target.value, validate)}
                                    placeholder={placeholder}
                                    className={`${styles.input} ${styles.dateInput}`}
                                />
                            </div>
                        ) : (
                            <input
                                type={type}
                                value={getNestedValue(formData, path) as string}
                                onChange={(e) => handleChange(path, e.target.value, validate)}
                                placeholder={placeholder}
                                className={styles.input}
                            />
                        )}
                        {errors[path.join('.')] && <span className={styles.error_feil}>{errors[path.join('.')]}</span>}
                    </label>
                ))}
                <div className={styles.buttonContainer}>
                    <button onClick={handleCancel} className={styles.cancelButton}>
                        Hủy
                    </button>
                    <button onClick={handleSave} disabled={hasErrors} className={styles.saveButton}>
                        Lưu
                    </button>
                </div>
            </div>

            <CreateCardPopup
                isOpen={isCreateCardPopupOpen}
                onClose={() => setIsCreateCardPopupOpen(false)}
                onSubmit={handleCreateCardSubmit}
            />
        </div>
    );
};

export default EditTemplate;
