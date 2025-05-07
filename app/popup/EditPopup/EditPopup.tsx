'use client';

import React from 'react';
import styles from './EditPopup.module.css';

interface Template2WeddingData {
    bride: string;
    groom: string;
    weddingDate: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    brideStory: string;
    groomStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string;
    brideMapUrl: string;
}

interface Template1WeddingData {
    banner: { image: string };
    couple: {
        names: string;
        groom: { name: string; image: string };
        bride: { name: string; image: string };
    };
    invitation: {
        title: string;
        subtitle: string;
        day: string;
        month: string;
        year: string;
        dayOfWeek: string;
        time: string;
        lunarDate: string;
        monthYear: string;
    };
    loveQuote_1: string;
    loveQuote_2: string;
    familyInfo: {
        groomFamily: { title: string; father: string; mother: string };
        brideFamily: { title: string; father: string; mother: string };
    };
    eventDetails: string;
    calendar: { month: string; days: (string | number)[]; highlightDay: number };
    location: {
        groomLocation: { name: string; address: string; mapEmbedUrl: string };
        brideLocation: { name: string; address: string; mapEmbedUrl: string };
    };
    coupleImages: { src: string; alt: string; isCenter?: boolean }[];
    thumnailImages: { src: string; alt: string; isCenter?: boolean }[];
}

interface EditPopupProps<T extends Template1WeddingData | Template2WeddingData> {
    weddingData: T;
    onSave: (updatedData: T) => void;
    onClose: () => void;
    templateType: 'template1' | 'template2';
}

const EditPopup = <T extends Template1WeddingData | Template2WeddingData>({
    weddingData,
    onSave,
    onClose,
    templateType,
}: EditPopupProps<T>) => {
    const [formData, setFormData] = React.useState<T>(weddingData);

    // Initialize formData with weddingData values
    React.useEffect(() => {
        setFormData(weddingData);
    }, [weddingData]);

    const handleSave = () => {
        const updatedData = {
            ...weddingData,
            ...Object.fromEntries(
                Object.entries(formData).filter(([, value]) => {
                    if (typeof value === 'string') return value !== '';
                    if (typeof value === 'object' && value !== null) {
                        return Object.values(value).some((v) => (typeof v === 'string' ? v !== '' : true));
                    }
                    return true;
                })
            ),
        };
        onSave(updatedData as T);
    };

    // Extract URL from iframe src attribute
    const extractMapUrl = (input: string) => {
        const urlMatch = input.match(/src="([^"]+)"/);
        return urlMatch ? urlMatch[1] : input;
    };

    return (
        <div className={styles.editPopupOverlay}>
            <div className={styles.editPopupContent}>
                <h3>Chỉnh sửa thông tin</h3>
                {templateType === 'template1' && (
                    <>
                        <label>
                            Tên chú rể:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).couple.groom.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        couple: {
                                            ...(formData as Template1WeddingData).couple,
                                            groom: {
                                                ...(formData as Template1WeddingData).couple.groom,
                                                name: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Kim Thành"
                            />
                        </label>
                        <label>
                            Tên cô dâu:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).couple.bride.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        couple: {
                                            ...(formData as Template1WeddingData).couple,
                                            bride: {
                                                ...(formData as Template1WeddingData).couple.bride,
                                                name: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Hải Vân"
                            />
                        </label>
                        <label>
                            Ngày cưới:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).invitation.day}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        invitation: {
                                            ...(formData as Template1WeddingData).invitation,
                                            day: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: 17"
                            />
                        </label>
                        <label>
                            Tháng cưới:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).invitation.month}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        invitation: {
                                            ...(formData as Template1WeddingData).invitation,
                                            month: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Tháng 11"
                            />
                        </label>
                        <label>
                            Năm cưới:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).invitation.year}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        invitation: {
                                            ...(formData as Template1WeddingData).invitation,
                                            year: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: 2025"
                            />
                        </label>
                        <label>
                            Ngày trong tuần:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).invitation.dayOfWeek}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        invitation: {
                                            ...(formData as Template1WeddingData).invitation,
                                            dayOfWeek: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Thứ 2"
                            />
                        </label>
                        <label>
                            Giờ cưới:
                            <input
                                type="time"
                                value={(formData as Template1WeddingData).invitation.time}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        invitation: {
                                            ...(formData as Template1WeddingData).invitation,
                                            time: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: 18:00"
                            />
                        </label>
                        <label>
                            Ông nhà trai:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).familyInfo.groomFamily.father}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyInfo: {
                                            ...(formData as Template1WeddingData).familyInfo,
                                            groomFamily: {
                                                ...(formData as Template1WeddingData).familyInfo.groomFamily,
                                                father: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Nguyễn Văn A"
                            />
                        </label>
                        <label>
                            Bà nhà trai:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).familyInfo.groomFamily.mother}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyInfo: {
                                            ...(formData as Template1WeddingData).familyInfo,
                                            groomFamily: {
                                                ...(formData as Template1WeddingData).familyInfo.groomFamily,
                                                mother: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Trần Thị B"
                            />
                        </label>
                        <label>
                            Ông nhà gái:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).familyInfo.brideFamily.father}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyInfo: {
                                            ...(formData as Template1WeddingData).familyInfo,
                                            brideFamily: {
                                                ...(formData as Template1WeddingData).familyInfo.brideFamily,
                                                father: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Lê Văn C"
                            />
                        </label>
                        <label>
                            Bà nhà gái:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).familyInfo.brideFamily.mother}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyInfo: {
                                            ...(formData as Template1WeddingData).familyInfo,
                                            brideFamily: {
                                                ...(formData as Template1WeddingData).familyInfo.brideFamily,
                                                mother: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Phạm Thị D"
                            />
                        </label>
                        <label>
                            Địa chỉ nhà trai:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).location.groomLocation.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        location: {
                                            ...(formData as Template1WeddingData).location,
                                            groomLocation: {
                                                ...(formData as Template1WeddingData).location.groomLocation,
                                                address: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: PJ3X+GH8, KDC 13E, Bình Chánh, Hồ Chí Minh"
                            />
                        </label>
                        <label>
                            Đường dẫn Google Maps nhà trai:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).location.groomLocation.mapEmbedUrl}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        location: {
                                            ...(formData as Template1WeddingData).location,
                                            groomLocation: {
                                                ...(formData as Template1WeddingData).location.groomLocation,
                                                mapEmbedUrl: extractMapUrl(e.target.value),
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: https://www.google.com/maps/embed?pb=!1m18..."
                            />
                        </label>
                        <label>
                            Địa chỉ nhà gái:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).location.brideLocation.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        location: {
                                            ...(formData as Template1WeddingData).location,
                                            brideLocation: {
                                                ...(formData as Template1WeddingData).location.brideLocation,
                                                address: e.target.value,
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: PJ3X+GH8, KDC 13E, Bình Chánh, Hồ Chí Minh"
                            />
                        </label>
                        <label>
                            Đường dẫn Google Maps nhà gái:
                            <input
                                type="text"
                                value={(formData as Template1WeddingData).location.brideLocation.mapEmbedUrl}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        location: {
                                            ...(formData as Template1WeddingData).location,
                                            brideLocation: {
                                                ...(formData as Template1WeddingData).location.brideLocation,
                                                mapEmbedUrl: extractMapUrl(e.target.value),
                                            },
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: https://www.google.com/maps/embed?pb=!1m18..."
                            />
                        </label>
                        {/* Disabled fields for Template1 */}
                        <label>
                            Câu chuyện cô dâu:
                            <textarea
                                value=""
                                onChange={() => {}}
                                placeholder="Không khả dụng cho Template 1"
                                disabled
                            />
                        </label>
                        <label>
                            Câu chuyện chú rể:
                            <textarea
                                value=""
                                onChange={() => {}}
                                placeholder="Không khả dụng cho Template 1"
                                disabled
                            />
                        </label>
                    </>
                )}
                {templateType === 'template2' && (
                    <>
                        <label>
                            Tên chú rể:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).groom}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        groom: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: Kim Thành"
                            />
                        </label>
                        <label>
                            Tên cô dâu:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).bride}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        bride: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: Hải Vân"
                            />
                        </label>
                        <label>
                            Ngày cưới:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).weddingDate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        weddingDate: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: 17/11/2025"
                            />
                        </label>
                        <label>
                            Giờ cưới:
                            <input
                                type="time"
                                value={(formData as Template2WeddingData).weddingTime}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        weddingTime: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: 18:00"
                            />
                        </label>
                        <label>
                            Ngày trong tuần:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).weddingDayOfWeek}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        weddingDayOfWeek: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: Thứ 2"
                            />
                        </label>
                        <label>
                            Ông nhà trai:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).familyGroom.father}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyGroom: {
                                            ...(formData as Template2WeddingData).familyGroom,
                                            father: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Nguyễn Văn A"
                            />
                        </label>
                        <label>
                            Bà nhà trai:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).familyGroom.mother}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyGroom: {
                                            ...(formData as Template2WeddingData).familyGroom,
                                            mother: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Trần Thị B"
                            />
                        </label>
                        <label>
                            Ông nhà gái:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).familyBride.father}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyBride: {
                                            ...(formData as Template2WeddingData).familyBride,
                                            father: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Lê Văn C"
                            />
                        </label>
                        <label>
                            Bà nhà gái:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).familyBride.mother}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        familyBride: {
                                            ...(formData as Template2WeddingData).familyBride,
                                            mother: e.target.value,
                                        },
                                    } as T)
                                }
                                placeholder="Ví dụ: Phạm Thị D"
                            />
                        </label>
                        <label>
                            Câu chuyện cô dâu:
                            <textarea
                                value={(formData as Template2WeddingData).brideStory}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        brideStory: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: Hải Vân lớn lên ở một thị trấn nhỏ ven biển..."
                            />
                        </label>
                        <label>
                            Câu chuyện chú rể:
                            <textarea
                                value={(formData as Template2WeddingData).groomStory}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        groomStory: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: Kim Thành là một họa sĩ trẻ, đam mê vẽ tranh..."
                            />
                        </label>
                        <label>
                            Địa chỉ nhà trai:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).groomAddress}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        groomAddress: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: PJ3X+GH8, KDC 13E, Bình Chánh, Hồ Chí Minh"
                            />
                        </label>
                        <label>
                            Đường dẫn Google Maps nhà trai:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).groomMapUrl}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        groomMapUrl: extractMapUrl(e.target.value),
                                    } as T)
                                }
                                placeholder="Ví dụ: https://www.google.com/maps/embed?pb=!1m18..."
                            />
                        </label>
                        <label>
                            Địa chỉ nhà gái:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).brideAddress}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        brideAddress: e.target.value,
                                    } as T)
                                }
                                placeholder="Ví dụ: PJ3X+GH8, KDC 13E, Bình Chánh, Hồ Chí Minh"
                            />
                        </label>
                        <label>
                            Đường dẫn Google Maps nhà gái:
                            <input
                                type="text"
                                value={(formData as Template2WeddingData).brideMapUrl}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        brideMapUrl: extractMapUrl(e.target.value),
                                    } as T)
                                }
                                placeholder="Ví dụ: https://www.google.com/maps/embed?pb=!1m18..."
                            />
                        </label>
                    </>
                )}
                <div className={styles.buttonContainer}>
                    <button onClick={onClose}>Hủy</button>
                    <button onClick={handleSave}>Lưu</button>
                </div>
            </div>
        </div>
    );
};

export default EditPopup;
