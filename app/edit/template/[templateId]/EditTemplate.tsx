'use client';

import React, { useState, useEffect } from 'react';
import styles from './EditTemplate.module.css';
import { useRouter, useSearchParams } from 'next/navigation'; // Add useSearchParams

// Export the interface so it can be imported elsewhere
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
    groomMapUrl: string;
    brideMapUrl: string;
    weddingDate: string;
}

interface EditTemplateProps {
    weddingData: TemplateWeddingData;
    templateId: string;
}

interface FieldConfig {
    label: string;
    path: string[];
    placeholder: string;
    type?: string;
    transform?: (value: string) => string;
    validate?: (value: string) => string | null;
}

const EditTemplate: React.FC<EditTemplateProps> = ({ weddingData, templateId }) => {
    const router = useRouter();
    const searchParams = useSearchParams(); // Get query parameters
    const [formData, setFormData] = useState<TemplateWeddingData>(weddingData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [templateIdError, setTemplateIdError] = useState<string>('');

    // Extract quantity and totalPrice from query parameters
    const quantity = searchParams.get('quantity') || '1';
    const totalPrice = searchParams.get('totalPrice') || '';

    useEffect(() => {
        setFormData(weddingData);
        setErrors({});
    }, [weddingData]);

    useEffect(() => {
        if (!templateId || templateId === 'undefined') {
            setTemplateIdError('Mã mẫu không hợp lệ. Vui lòng thử lại.');
        } else {
            setTemplateIdError('');
        }
    }, [templateId]);

    const extractMapUrl = (input: string) => {
        const urlMatch = input.match(/src="([^"]+)"/);
        return urlMatch ? urlMatch[1] : input;
    };

    const capitalize = (value: string): string => {
        return value
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

    const handleChange = (path: string[], value: string, validateFn?: (value: string) => string | null) => {
        const shouldCapitalize =
            !path.includes('groomMapUrl') &&
            !path.includes('brideMapUrl') &&
            !path.includes('weddingTime') &&
            !path.includes('weddingDate');
        const transformedValue = shouldCapitalize ? capitalize(value) : value;

        setFormData((prev) => {
            let updated = { ...prev };
            let current: any = updated;
            for (let i = 0; i < path.length - 1; i++) {
                current[path[i]] = { ...current[path[i]] };
                current = current[path[i]];
            }
            current[path[path.length - 1]] = transformedValue;
            return updated;
        });

        validateField(path, transformedValue, validateFn);
    };

    const handleSave = () => {
        if (!templateId || templateId === 'undefined' || !/^\d+$/.test(templateId)) {
            setTemplateIdError('Mã mẫu không hợp lệ. Vui lòng thử lại.');
            return;
        }

        const validationErrors: { [key: string]: string } = {};
        fields.forEach(({ path, validate }) => {
            if (validate) {
                const value = getNestedValue(formData, path);
                const error = validate(value);
                if (error) {
                    validationErrors[path.join('.')] = error;
                }
            }
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        localStorage.setItem(`WeddingData${templateId}`, JSON.stringify(formData));
        // Include quantity and totalPrice in the router.push
        router.push(
            `/template/${templateId}/edit_image/${templateId}?quantity=${quantity}`
        );
    };

    const handleCancel = () => {
        router.back();
    };

    const fields: FieldConfig[] = [
        {
            label: 'Tên chú rể',
            path: ['groom'],
            placeholder: 'Ví dụ: Kim Thành',
            validate: (value) => (value.trim() ? null : 'Tên chú rể không được để trống'),
        },
        {
            label: 'Tên cô dâu',
            path: ['bride'],
            placeholder: 'Ví dụ: Hải Vân',
            validate: (value) => (value.trim() ? null : 'Tên cô dâu không được để trống'),
        },
        {
            label: 'Ngày cưới',
            path: ['weddingDate'],
            placeholder: 'Ví dụ: 17/11/2025',
            validate: (value) => {
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
            validate: (value) => (value.trim() ? null : 'Ngày trong tuần không được để trống'),
        },
        {
            label: 'Giờ cưới',
            path: ['weddingTime'],
            type: 'time',
            placeholder: 'Ví dụ: 18:00',
            validate: (value) => (value ? null : 'Giờ cưới không được để trống'),
        },
        {
            label: 'Ngày âm lịch',
            path: ['lunarDay'],
            placeholder: 'Ví dụ: 18 Tháng 09 Năm Ất Tỵ',
            validate: (value) => (value.trim() ? null : 'Ngày âm lịch không được để trống'),
        },
        {
            label: 'Ông nhà trai',
            path: ['familyGroom', 'father'],
            placeholder: 'Ví dụ: Nguyễn Văn A',
            validate: (value) => (value.trim() ? null : 'Tên ông nhà trai không được để trống'),
        },
        {
            label: 'Bà nhà trai',
            path: ['familyGroom', 'mother'],
            placeholder: 'Ví dụ: Trần Thị B',
            validate: (value) => (value.trim() ? null : 'Tên bà nhà trai không được để trống'),
        },
        {
            label: 'Ông nhà gái',
            path: ['familyBride', 'father'],
            placeholder: 'Ví dụ: Lê Văn C',
            validate: (value) => (value.trim() ? null : 'Tên ông nhà gái không được để trống'),
        },
        {
            label: 'Bà nhà gái',
            path: ['familyBride', 'mother'],
            placeholder: 'Ví dụ: Phạm Thị D',
            validate: (value) => (value.trim() ? null : 'Tên bà nhà gái không được để trống'),
        },
        {
            label: 'Địa chỉ nhà trai',
            path: ['groomAddress'],
            placeholder: 'Ví dụ: Pj3x+Gh8, Kdc 13e, Bình Chánh, Hồ Chí Minh',
            validate: (value) => (value.trim() ? null : 'Địa chỉ nhà trai không được để trống'),
        },
        {
            label: 'Đường dẫn Google Maps nhà trai',
            path: ['groomMapUrl'],
            placeholder: 'Ví dụ: https://www.google.com/maps/embed?pb=!1m18...',
            transform: extractMapUrl,
            validate: (value) => (value.trim() ? null : 'Đường dẫn Google Maps nhà trai không được để trống'),
        },
        {
            label: 'Địa chỉ nhà gái',
            path: ['brideAddress'],
            placeholder: 'Ví dụ: Pj3x+Gh8, Kdc 13e, Bình Chánh, Hồ Chí Minh',
            validate: (value) => (value.trim() ? null : 'Địa chỉ nhà gái không được để trống'),
        },
        {
            label: 'Đường dẫn Google Maps nhà gái',
            path: ['brideMapUrl'],
            placeholder: 'Ví dụ: https://www.google.com/maps/embed?pb=!1m18...',
            transform: extractMapUrl,
            validate: (value) => (value.trim() ? null : 'Đường dẫn Google Maps nhà gái không được để trống'),
        },
        {
            label: 'Câu chuyện cô dâu',
            path: ['brideStory'],
            placeholder: 'Ví dụ: Hải Vân lớn lên ở một thị trấn nhỏ ven biển...',
            type: 'textarea',
        },
        {
            label: 'Câu chuyện chú rể',
            path: ['groomStory'],
            placeholder: 'Ví dụ: Kim Thành là một họa sĩ trẻ, đam mê vẽ tranh...',
            type: 'textarea',
        },
    ];

    const getNestedValue = (obj: any, path: string[]): string => {
        const value = path.reduce((current, key) => (current && current[key] !== undefined ? current[key] : ''), obj);
        return typeof value === 'string' ? value : '';
    };

    const hasErrors = Object.values(errors).some((error) => error) || !!templateIdError;

    return (
        <div className={styles.editTemplateContainer}>
            <h1>Chỉnh sửa thông tin mẫu {templateId || 'Không xác định'}</h1>
            {templateIdError && <div className={styles.error}>{templateIdError}</div>}
            <div className={styles.formContainer}>
                {fields.map(({ label, path, placeholder, type = 'text', transform, validate }) => (
                    <label key={label} className={styles.formField}>
                        <span className={styles.label}>{label}:</span>
                        {type === 'textarea' ? (
                            <textarea
                                value={getNestedValue(formData, path)}
                                onChange={(e) =>
                                    handleChange(path, transform ? transform(e.target.value) : e.target.value, validate)
                                }
                                placeholder={placeholder}
                                className={styles.textarea}
                            />
                        ) : (
                            <input
                                type={type}
                                value={getNestedValue(formData, path)}
                                onChange={(e) =>
                                    handleChange(path, transform ? transform(e.target.value) : e.target.value, validate)
                                }
                                placeholder={placeholder}
                                className={styles.input}
                            />
                        )}
                        {errors[path.join('.')] && <span className={styles.error}>{errors[path.join('.')]}</span>}
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
        </div>
    );
};

export default EditTemplate;
