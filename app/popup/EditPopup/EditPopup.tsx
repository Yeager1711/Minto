'use client';

import React from 'react';
import styles from './EditPopup.module.css';

interface Template2WeddingData {
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
    weddingDate: string; // Only weddingDate is stored
}

interface Template1WeddingData {
    couple: {
        names: string;
        groom: { name: string; image: string };
        bride: { name: string; image: string };
    };
    invitation: {
        day: string;
        month: string;
        year: string;
        dayOfWeek: string;
        time: string;
        lunarDate: string;
    };
    familyInfo: {
        groomFamily: { father: string; mother: string };
        brideFamily: { father: string; mother: string };
    };
    location: {
        groomLocation: { address: string; mapEmbedUrl: string };
        brideLocation: { address: string; mapEmbedUrl: string };
    };
}

interface EditPopupProps<T extends Template1WeddingData | Template2WeddingData> {
    weddingData: T;
    onSave: (updatedData: T) => void;
    onClose: () => void;
    templateType: 'template1' | 'template2';
}

interface FieldConfig {
    label: string;
    path: string[];
    placeholder: string;
    type?: string;
    transform?: (value: string) => string;
    validate?: (value: string) => string | null; // Validation function returning error message or null
}

const EditPopup = <T extends Template1WeddingData | Template2WeddingData>({
    weddingData,
    onSave,
    onClose,
    templateType,
}: EditPopupProps<T>) => {
    // Initialize formData with weddingData, splitting weddingDate for template2
    const initializeFormData = (data: T): T => {
        if (templateType === 'template2') {
            const weddingDate = (data as Template2WeddingData).weddingDate || '17/11/2025';
            const [day = '17', month = '11', year = '2025'] = weddingDate.split('/');
            return {
                ...data,
                invitation: {
                    day,
                    month,
                    year,
                },
            } as T;
        }
        return data;
    };

    const [formData, setFormData] = React.useState<T>(initializeFormData(weddingData));
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    React.useEffect(() => {
        setFormData(initializeFormData(weddingData));
        setErrors({});
    }, [weddingData]);

    const extractMapUrl = (input: string) => {
        const urlMatch = input.match(/src="([^"]+)"/);
        return urlMatch ? urlMatch[1] : input;
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
        setFormData((prev) => {
            let updated = { ...prev };
            let current: any = updated;
            for (let i = 0; i < path.length - 1; i++) {
                current[path[i]] = { ...current[path[i]] };
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return updated as T;
        });

        // Validate the field after updating the value
        validateField(path, value, validateFn);
    };

    const handleSave = () => {
        // Validate all fields before saving
        const validationErrors: { [key: string]: string } = {};
        commonFields.forEach(({ path, validate }) => {
            if (validate) {
                const value = getNestedValue(formData, path);
                const error = validate(value);
                if (error) {
                    validationErrors[path.join('.')] = error;
                }
            }
        });

        if (templateType === 'template2') {
            template2Fields.forEach(({ path, validate }) => {
                if (validate) {
                    const value = getNestedValue(formData, path);
                    const error = validate(value);
                    if (error) {
                        validationErrors[path.join('.')] = error;
                    }
                }
            });
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return; // Don't save if there are validation errors
        }

        let updatedData: T;
        if (templateType === 'template2') {
            const { day, month, year } = (formData as any).invitation;
            const weddingDate = `${day}/${month}/${year}`;
            updatedData = {
                ...formData,
                weddingDate,
                invitation: undefined as any, // Remove temporary invitation field
            } as T;
        } else {
            updatedData = formData;
        }

        onSave(updatedData);
    };

    const commonFields: FieldConfig[] = [
        {
            label: 'Tên chú rể',
            path: templateType === 'template1' ? ['couple', 'groom', 'name'] : ['groom'],
            placeholder: 'Ví dụ: Kim Thành',
            validate: (value) => (value.trim() ? null : 'Tên chú rể không được để trống'),
        },
        {
            label: 'Tên cô dâu',
            path: templateType === 'template1' ? ['couple', 'bride', 'name'] : ['bride'],
            placeholder: 'Ví dụ: Hải Vân',
            validate: (value) => (value.trim() ? null : 'Tên cô dâu không được để trống'),
        },
        {
            label: 'Ngày cưới',
            path: ['invitation', 'day'],
            placeholder: 'Ví dụ: 17',
            type: 'number',
            validate: (value) => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 1 && num <= 31 ? null : 'Ngày phải từ 1 đến 31';
            },
        },
        {
            label: 'Tháng cưới',
            path: ['invitation', 'month'],
            placeholder: 'Ví dụ: 11',
            type: 'number',
            validate: (value) => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 1 && num <= 12 ? null : 'Tháng phải từ 1 đến 12';
            },
        },
        {
            label: 'Năm cưới',
            path: ['invitation', 'year'],
            placeholder: 'Ví dụ: 2025',
            type: 'number',
            validate: (value) => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 1900 && num <= 2100 ? null : 'Năm phải từ 1900 đến 2100';
            },
        },
        {
            label: 'Ngày trong tuần',
            path: templateType === 'template1' ? ['invitation', 'dayOfWeek'] : ['weddingDayOfWeek'],
            placeholder: 'Ví dụ: Thứ 2',
            validate: (value) => (value.trim() ? null : 'Ngày trong tuần không được để trống'),
        },
        {
            label: 'Giờ cưới',
            path: templateType === 'template1' ? ['invitation', 'time'] : ['weddingTime'],
            type: 'time',
            placeholder: 'Ví dụ: 18:00',
            validate: (value) => (value ? null : 'Giờ cưới không được để trống'),
        },
        {
            label: 'Ngày âm lịch',
            path: templateType === 'template1' ? ['invitation', 'lunarDate'] : ['lunarDay'],
            placeholder: 'Ví dụ: 18 Tháng 09 Năm Ất Tỵ',
            validate: (value) => (value.trim() ? null : 'Ngày âm lịch không được để trống'),
        },
        {
            label: 'Ông nhà trai',
            path: templateType === 'template1' ? ['familyInfo', 'groomFamily', 'father'] : ['familyGroom', 'father'],
            placeholder: 'Ví dụ: Nguyễn Văn A',
            validate: (value) => (value.trim() ? null : 'Tên ông nhà trai không được để trống'),
        },
        {
            label: 'Bà nhà trai',
            path: templateType === 'template1' ? ['familyInfo', 'groomFamily', 'mother'] : ['familyGroom', 'mother'],
            placeholder: 'Ví dụ: Trần Thị B',
            validate: (value) => (value.trim() ? null : 'Tên bà nhà trai không được để trống'),
        },
        {
            label: 'Ông nhà gái',
            path: templateType === 'template1' ? ['familyInfo', 'brideFamily', 'father'] : ['familyBride', 'father'],
            placeholder: 'Ví dụ: Lê Văn C',
            validate: (value) => (value.trim() ? null : 'Tên ông nhà gái không được để trống'),
        },
        {
            label: 'Bà nhà gái',
            path: templateType === 'template1' ? ['familyInfo', 'brideFamily', 'mother'] : ['familyBride', 'mother'],
            placeholder: 'Ví dụ: Phạm Thị D',
            validate: (value) => (value.trim() ? null : 'Tên bà nhà gái không được để trống'),
        },
        {
            label: 'Địa chỉ nhà trai',
            path: templateType === 'template1' ? ['location', 'groomLocation', 'address'] : ['groomAddress'],
            placeholder: 'Ví dụ: PJ3X+GH8, KDC 13E, Bình Chánh, Hồ Chí Minh',
            validate: (value) => (value.trim() ? null : 'Địa chỉ nhà trai không được để trống'),
        },
        {
            label: 'Đường dẫn Google Maps nhà trai',
            path: templateType === 'template1' ? ['location', 'groomLocation', 'mapEmbedUrl'] : ['groomMapUrl'],
            placeholder: 'Ví dụ: https://www.google.com/maps/embed?pb=!1m18...',
            transform: extractMapUrl,
            validate: (value) => (value.trim() ? null : 'Đường dẫn Google Maps nhà trai không được để trống'),
        },
        {
            label: 'Địa chỉ nhà gái',
            path: templateType === 'template1' ? ['location', 'brideLocation', 'address'] : ['brideAddress'],
            placeholder: 'Ví dụ: PJ3X+GH8, KDC 13E, Bình Chánh, Hồ Chí Minh',
            validate: (value) => (value.trim() ? null : 'Địa chỉ nhà gái không được để trống'),
        },
        {
            label: 'Đường dẫn Google Maps nhà gái',
            path: templateType === 'template1' ? ['location', 'brideLocation', 'mapEmbedUrl'] : ['brideMapUrl'],
            placeholder: 'Ví dụ: https://www.google.com/maps/embed?pb=!1m18...',
            transform: extractMapUrl,
            validate: (value) => (value.trim() ? null : 'Đường dẫn Google Maps nhà gái không được để trống'),
        },
    ];

    const template2Fields: FieldConfig[] = [
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

    const hasErrors = Object.values(errors).some((error) => error);

    return (
        <div className={styles.editPopupOverlay}>
            <div className={styles.editPopupContent}>
                <h3>Chỉnh sửa thông tin</h3>
                {commonFields.map(({ label, path, placeholder, type = 'text', transform, validate }) => (
                    <label key={label}>
                        {label}:
                        {type === 'textarea' ? (
                            <textarea
                                value={getNestedValue(formData, path)}
                                onChange={(e) =>
                                    handleChange(path, transform ? transform(e.target.value) : e.target.value, validate)
                                }
                                placeholder={placeholder}
                            />
                        ) : (
                            <input
                                type={type}
                                value={getNestedValue(formData, path)}
                                onChange={(e) =>
                                    handleChange(path, transform ? transform(e.target.value) : e.target.value, validate)
                                }
                                placeholder={placeholder}
                            />
                        )}
                        {errors[path.join('.')] && <span className={styles.error}>{errors[path.join('.')]}</span>}
                    </label>
                ))}
                {templateType === 'template2' &&
                    template2Fields.map(({ label, path, placeholder, type = 'text', transform, validate }) => (
                        <label key={label}>
                            {label}:
                            {type === 'textarea' ? (
                                <textarea
                                    value={getNestedValue(formData, path)}
                                    onChange={(e) =>
                                        handleChange(
                                            path,
                                            transform ? transform(e.target.value) : e.target.value,
                                            validate
                                        )
                                    }
                                    placeholder={placeholder}
                                />
                            ) : (
                                <input
                                    type={type}
                                    value={getNestedValue(formData, path)}
                                    onChange={(e) =>
                                        handleChange(
                                            path,
                                            transform ? transform(e.target.value) : e.target.value,
                                            validate
                                        )
                                    }
                                    placeholder={placeholder}
                                />
                            )}
                            {errors[path.join('.')] && <span className={styles.error}>{errors[path.join('.')]}</span>}
                        </label>
                    ))}
                <div className={styles.buttonContainer}>
                    <button onClick={onClose}>Hủy</button>
                    <button onClick={handleSave} disabled={hasErrors}>
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPopup;
