import React from 'react';
import styles from './EditPopup.module.scss';

interface WeddingData {
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

interface EditPopupProps {
    weddingData: WeddingData;
    onSave: (updatedData: WeddingData) => void;
    onClose: () => void;
}

const EditPopup: React.FC<EditPopupProps> = ({ weddingData, onSave, onClose }) => {
    const [formData, setFormData] = React.useState<WeddingData>({
        bride: '',
        groom: '',
        weddingDate: '',
        weddingTime: '',
        weddingDayOfWeek: '',
        familyGroom: { father: '', mother: '' },
        familyBride: { father: '', mother: '' },
        brideStory: '',
        groomStory: '',
        groomAddress: '',
        brideAddress: '',
        groomMapUrl: '',
        brideMapUrl: '',
    });

    const handleSave = () => {
        // Merge with weddingData to avoid overwriting unchanged fields with empty strings
        const updatedData = {
            ...weddingData,
            ...Object.fromEntries(
                Object.entries(formData).filter(([, value]) => {
                    if (typeof value === 'string') return value !== '';
                    if (typeof value === 'object') {
                        return Object.values(value).some((v) => v !== '');
                    }
                    return true;
                })
            ),
        };
        onSave(updatedData);
    };

    // Extract URL from iframe src attribute
    const extractMapUrl = (input: string) => {
        // Check if the input contains an iframe tag with a src attribute
        const urlMatch = input.match(/src="([^"]+)"/);
        return urlMatch ? urlMatch[1] : input; // If no match, return the input as-is (in case it's already a URL)
    };

    return (
        <div className={styles.editPopupOverlay}>
            <div className={styles.editPopupContent}>
                <h3>Chỉnh sửa thông tin</h3>
                <label>
                    Tên chú rể:
                    <input
                        type="text"
                        value={formData.groom}
                        onChange={(e) => setFormData({ ...formData, groom: e.target.value })}
                        placeholder="Ví dụ: Kim Thành"
                    />
                </label>

                <label>
                    Tên cô dâu:
                    <input
                        type="text"
                        value={formData.bride}
                        onChange={(e) => setFormData({ ...formData, bride: e.target.value })}
                        placeholder="Ví dụ: Hải Vân"
                    />
                </label>

                <label>
                    Ngày cưới:
                    <input
                        type="datetime"
                        value={formData.weddingDate}
                        onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                        placeholder="Ví dụ: 17/11/2025"
                    />
                </label>

                <label>
                    Giờ cưới:
                    <input
                        type="time"
                        value={formData.weddingTime}
                        onChange={(e) => setFormData({ ...formData, weddingTime: e.target.value })}
                        placeholder="Ví dụ: 18:00"
                    />
                </label>

                <label>
                    Ngày trong tuần:
                    <input
                        type="text"
                        value={formData.weddingDayOfWeek}
                        onChange={(e) => setFormData({ ...formData, weddingDayOfWeek: e.target.value })}
                        placeholder="Ví dụ: Thứ 2"
                    />
                </label>

                <label>
                    Ông nhà trai:
                    <input
                        type="text"
                        value={formData.familyGroom.father}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                familyGroom: { ...formData.familyGroom, father: e.target.value },
                            })
                        }
                        placeholder="Ví dụ: Nguyễn Văn A"
                    />
                </label>

                <label>
                    Bà nhà trai:
                    <input
                        type="text"
                        value={formData.familyGroom.mother}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                familyGroom: { ...formData.familyGroom, mother: e.target.value },
                            })
                        }
                        placeholder="Ví dụ: Trần Thị B"
                    />
                </label>

                <label>
                    Ông nhà gái:
                    <input
                        type="text"
                        value={formData.familyBride.father}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                familyBride: { ...formData.familyBride, father: e.target.value },
                            })
                        }
                        placeholder="Ví dụ: Lê Văn C"
                    />
                </label>

                <label>
                    Bà nhà gái:
                    <input
                        type="text"
                        value={formData.familyBride.mother}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                familyBride: { ...formData.familyBride, mother: e.target.value },
                            })
                        }
                        placeholder="Ví dụ: Phạm Thị D"
                    />
                </label>

                <label>
                    Câu chuyện cô dâu:
                    <textarea
                        value={formData.brideStory}
                        onChange={(e) => setFormData({ ...formData, brideStory: e.target.value })}
                        placeholder="Ví dụ: Hải Vân lớn lên ở một thị trấn nhỏ ven biển, yêu sách và những buổi chiều yên tĩnh..."
                    />
                </label>

                <label>
                    Câu chuyện chú rể:
                    <textarea
                        value={formData.groomStory}
                        onChange={(e) => setFormData({ ...formData, groomStory: e.target.value })}
                        placeholder="Ví dụ: Kim Thành là một họa sĩ trẻ, đam mê vẽ tranh và tìm cảm hứng từ những cơn gió biển..."
                    />
                </label>

                <label>
                    Địa chỉ nhà trai:
                    <input
                        type="text"
                        value={formData.groomAddress}
                        onChange={(e) => setFormData({ ...formData, groomAddress: e.target.value })}
                        placeholder="Ví dụ: PJ3X+GH8, KDC 13E, Đô thị mới Nam Thành Phố, Ấp 5, Bình Chánh, Hồ Chí Minh, Việt Nam"
                    />
                </label>

                <label>
                    Đường dẫn Google Maps nhà trai:
                    <input
                        type="text"
                        value={formData.groomMapUrl}
                        onChange={(e) => setFormData({ ...formData, groomMapUrl: extractMapUrl(e.target.value) })}
                        placeholder="Ví dụ: https://www.google.com/maps/embed?pb=!1m18..."
                    />
                </label>

                <label>
                    Địa chỉ nhà gái:
                    <input
                        type="text"
                        value={formData.brideAddress}
                        onChange={(e) => setFormData({ ...formData, brideAddress: e.target.value })}
                        placeholder="Ví dụ: PJ3X+GH8, KDC 13E, Đô thị mới Nam Thành Phố, Ấp 5, Bình Chánh, Hồ Chí Minh, Việt Nam"
                    />
                </label>

                <label>
                    Đường dẫn Google Maps nhà gái:
                    <input
                        type="text"
                        value={formData.brideMapUrl}
                        onChange={(e) => setFormData({ ...formData, brideMapUrl: extractMapUrl(e.target.value) })}
                        placeholder="Ví dụ: https://www.google.com/maps/embed?pb=!1m18..."
                    />
                </label>

                <button onClick={onClose}>Hủy</button>
                <button onClick={handleSave}>Lưu</button>
            </div>
        </div>
    );
};

export default EditPopup;
