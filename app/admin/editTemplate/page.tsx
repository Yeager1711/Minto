'use client';

import * as React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './editTemplate.module.css';
import { useApi } from 'app/lib/apiContext/apiContext';

// Định nghĩa interface cho Template
interface Template {
    template_id: number;
    name: string;
    description?: string;
    price: number;
    status: string;
    category: {
        category_id: number;
        category_name: string;
    };
}

// Định nghĩa interface cho Category
interface Category {
    category_id: number;
    category_name: string;
}

const EditTemplate: React.FC = () => {
    const { getTemplates, getCategories } = useApi();
    const [templates, setTemplates] = React.useState<Template[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        status: '',
    });

    const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

    // Gọi API để lấy danh sách templates và categories khi component mount
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [templateData, categoryData] = await Promise.all([getTemplates(), getCategories()]);
                setTemplates(templateData);
                setCategories(categoryData);
            } catch {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [getTemplates, getCategories]);

    // Khi chọn template để chỉnh sửa, điền dữ liệu vào form
    const handleEditClick = (template: Template) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            description: template.description || '',
            price: template.price.toString(),
            category_id: template.category.category_id.toString(),
            status: template.status,
        });
        setIsEditing(true);
    };

    // Xử lý khi quay lại danh sách
    const handleBackClick = () => {
        setSelectedTemplate(null);
        setIsEditing(false);
        setFormData({ name: '', description: '', price: '', category_id: '', status: '' });
    };

    // Xử lý thay đổi input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý cập nhật template
    const handleUpdate = async () => {
        if (!selectedTemplate) return;

        // Kiểm tra xem có ít nhất một trường thay đổi không
        const hasChanges =
            formData.name !== selectedTemplate.name ||
            formData.description !== (selectedTemplate.description || '') ||
            formData.price !== selectedTemplate.price.toString() ||
            formData.category_id !== selectedTemplate.category.category_id.toString() ||
            formData.status !== selectedTemplate.status;

        if (!hasChanges) {
            toast.error('Không có thay đổi nào để cập nhật');
            return;
        }

        // Chuẩn bị dữ liệu để gửi, chỉ bao gồm các trường có giá trị
        const updateData: { [key: string]: string | number } = {};
        if (formData.name) updateData.name = formData.name;
        if (formData.description) updateData.description = formData.description;
        if (formData.price) updateData.price = formData.price;
        if (formData.category_id) updateData.category_id = formData.category_id;
        if (formData.status) updateData.status = formData.status;

        try {
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!accessToken) {
                throw new Error('Vui lòng đăng nhập');
            }

            await axios.patch(`${apiUrl}/templates/update-template/${selectedTemplate.template_id}`, updateData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'application/json',
                },
            });

            toast.success('Cập nhật mẫu thiệp thành công');
            setIsEditing(false);
            setSelectedTemplate(null);

            // Cập nhật lại danh sách templates
            const updatedTemplates = await getTemplates();
            setTemplates(updatedTemplates);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Cập nhật mẫu thiệp thất bại';
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={styles.edtiTemplate}>
            <div className={styles.wrapper}>
                {!isEditing ? (
                    <div className={styles.list_template}>
                        <h3>Danh sách Template</h3>
                        {templates.map((template) => (
                            <div
                                key={template.template_id}
                                className={styles.template}
                                onClick={() => handleEditClick(template)}
                            >
                                <div className={styles.name_template}>{template.name}</div>
                                <button className={styles.btn_edit}>Chỉnh sửa</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.mapping_info}>
                        <div className={styles.flex_btn}>
                            <button className={styles.btn_BackEdit} onClick={handleBackClick}>
                                Quay lại
                            </button>
                        </div>
                        <div className={styles.input}>
                            <span>Mã mẫu thiệp</span>
                            <input
                                type="text"
                                name="template_id"
                                value={selectedTemplate?.template_id || ''}
                                readOnly
                                disabled
                            />
                        </div>
                        <div className={styles.input}>
                            <span>Tên mẫu</span>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className={styles.input}>
                            <span>Mô tả</span>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} />
                        </div>
                        <div className={styles.input}>
                            <span>Giá</span>
                            <input type="text" name="price" value={formData.price} onChange={handleInputChange} />
                        </div>
                        <div className={styles.input}>
                            <span>Danh mục</span>
                            <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
                                <option value="">Chọn danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.input}>
                            <span>Trạng thái</span>
                            <select name="status" value={formData.status} onChange={handleInputChange}>
                                <option value="Sẵn sàng">Sẵn sàng</option>
                                <option value="Đang cập nhật">Đang cập nhật</option>
                                <option value="Đang bảo trì">Đang bảo trì</option>
                            </select>
                        </div>
                        <button className={styles.btn_update} onClick={handleUpdate}>
                            Cập nhật
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditTemplate;
