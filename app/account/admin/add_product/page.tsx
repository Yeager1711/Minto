'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import styles from './add_product.module.css';
import { useApi } from 'app/lib/apiContext/apiContext';
import { toast } from 'react-toastify';

interface Category {
    category_id: number;
    category_name: string;
}

const AddProduct: React.FC = () => {
    const { accessToken, createCategory, getCategories, createTemplate } = useApi();
    const [categoryName, setCategoryName] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [templateData, setTemplateData] = useState({
        templateId: '',
        name: '',
        description: '',
        price: '',
        categoryId: '',
        status: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Cleanup URL.createObjectURL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    // Fetch categories on mount and when accessToken changes
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch {}
        };
        if (accessToken) fetchCategories();
    }, [accessToken, getCategories]);

    // Handle image file change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.match(/image\/(jpg|jpeg|png|gif)$/)) {
                toast.error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            setImageFile(file);
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        } else {
            setImageFile(null);
            setPreviewImage(null);
        }
    };

    // Handle category name input change
    const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryName(e.target.value);
    };

    // Handle template form input changes
    const handleTemplateInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { id, value } = e.target;
        setTemplateData((prev) => ({ ...prev, [id]: value }));
    };

    // Handle create category button click
    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return;
        }

        if (!accessToken) {
            toast.error('Vui lòng đăng nhập để tạo danh mục');
            return;
        }

        setIsLoading(true);
        try {
            await createCategory({ category_name: categoryName });
            setCategoryName('');
            const updatedCategories = await getCategories();
            setCategories(updatedCategories);
        } catch {
            // Error handled in createCategory
        } finally {
            setIsLoading(false);
        }
    };

    // Handle add template button click
    // Handle add template button click
    const handleAddTemplate = async () => {
        if (!templateData.name.trim()) {
            toast.error('Vui lòng nhập tên mẫu');
            return;
        }

        if (!templateData.price) {
            toast.error('Vui lòng nhập giá');
            return;
        }

        const price = parseFloat(templateData.price);
        if (isNaN(price) || price <= 0) {
            toast.error('Giá phải là số lớn hơn 0');
            return;
        }

        if (!templateData.categoryId) {
            toast.error('Vui lòng chọn danh mục');
            return;
        }

        if (!templateData.status) {
            toast.error('Vui lòng chọn trạng thái');
            return;
        }

        if (!imageFile) {
            toast.error('Vui lòng chọn ảnh đại diện');
            return;
        }

        if (!accessToken) {
            toast.error('Vui lòng đăng nhập để thêm mẫu thiệp');
            return;
        }

        const templateId = templateData.templateId ? parseInt(templateData.templateId) : undefined;
        if (templateId !== undefined && (isNaN(templateId) || templateId < 0)) {
            toast.error('Mã mẫu thiệp phải là số không âm');
            return;
        }

        console.log('Image File:', imageFile); // Debug image file

        setIsLoading(true);
        try {
            await createTemplate({
                template_id: templateId,
                name: templateData.name,
                description: templateData.description || undefined,
                price,
                category_id: parseInt(templateData.categoryId),
                status: templateData.status,
                image: imageFile,
            });
            toast.success('Mẫu thiệp đã được tạo thành công');
            setTemplateData({ templateId: '', name: '', description: '', price: '', categoryId: '', status: '' });
            setImageFile(null);
            setPreviewImage(null);
        } catch (error: unknown) {
            // Type guard to check if error is an Error instance
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tạo mẫu thiệp';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.addProducts}>
            <div className={styles.addProductHeader}>
                <h4>Tạo loại danh mục</h4>
                <div className={styles.boxInput}>
                    <input
                        type="text"
                        placeholder="Nhập vào loại bạn muốn tạo"
                        value={categoryName}
                        onChange={handleCategoryNameChange}
                    />
                    <button className={styles.btnCreate} onClick={handleCreateCategory} disabled={isLoading}>
                        {isLoading ? 'Đang tạo...' : 'Tạo'}
                    </button>
                </div>

                <div className={styles.addProductWrapper}>
                    <h4>Thêm sản phẩm</h4>
                    <div className={styles.flex}>
                        <div className={styles.image}>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {previewImage && (
                                <div className={styles.preview}>
                                    <Image
                                        src={previewImage}
                                        alt="Preview"
                                        width={200} // Set appropriate width
                                        height={200} // Set appropriate height
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.right}>
                            <div className={styles.formGroup}>
                                <label htmlFor="templateId">Mã mẫu thiệp</label>
                                <input
                                    type="number"
                                    id="templateId"
                                    placeholder="Nhập mã mẫu thiệp (tùy chọn)"
                                    value={templateData.templateId}
                                    onChange={handleTemplateInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Tên mẫu</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Nhập tên mẫu"
                                    value={templateData.name}
                                    onChange={handleTemplateInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Mô tả</label>
                                <textarea
                                    id="description"
                                    placeholder="Nhập mô tả"
                                    value={templateData.description}
                                    onChange={handleTemplateInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="price">Giá</label>
                                <input
                                    type="number"
                                    id="price"
                                    placeholder="Nhập giá"
                                    step="0.01"
                                    value={templateData.price}
                                    onChange={handleTemplateInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="categoryId">Danh mục</label>
                                <select
                                    id="categoryId"
                                    value={templateData.categoryId}
                                    onChange={handleTemplateInputChange}
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat.category_id} value={cat.category_id}>
                                            {cat.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="status">Trạng thái</label>
                                <select id="status" value={templateData.status} onChange={handleTemplateInputChange}>
                                    <option value="">Chọn trạng thái</option>
                                    <option value="Sẵn sàng">Sẵn sàng</option>
                                    <option value="Đang được cập nhật">Đang được cập nhật</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <button className={styles.btnSubmit} onClick={handleAddTemplate} disabled={isLoading}>
                                    {isLoading ? 'Đang thêm...' : 'Thêm sản phẩm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
