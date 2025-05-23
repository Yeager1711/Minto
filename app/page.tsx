'use client';
import React, { useState, useEffect } from 'react';
import styles from './styles/home.module.css';
import Popup from './popup/product_details/Product_Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faHeadset } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Notifications from './Notifications/Notifications';
import Countdown from './func/countDown/page';

interface Template {
    template_id: number;
    name: string;
    image_url: string;
    price: number;
    description?: string;
    status: string;
    link?: string;
    category: {
        category_id: number;
        category_name: string;
    };
}

interface Category {
    category_id: number;
    category_name: string;
}

interface UserProfile {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: {
        role_id: number;
        name: string;
    };
}

interface ProductCardProps {
    name: string;
    image: string;
    onClick: () => void;
}

interface ProductListProps {
    templates: Template[];
    onProductClick: (template: Template) => void;
    isLoading: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, image, onClick }) => (
    <div className={styles.card_product} onClick={onClick}>
        <div className={styles.image_products}>
            <Image
                src={`data:image/png;base64,${image}`}
                alt={name}
                width={300}
                height={200}
                priority={false}
                unoptimized
            />
            <div className={styles.card_overlay}>
                <span className={styles.card_title}>{name}</span>
            </div>
        </div>
    </div>
);

const ProductCardSkeleton: React.FC = () => (
    <div className={styles.card_product_skeleton}>
        <div className={styles.image_products_skeleton}></div>
    </div>
);

const HeadingSkeleton: React.FC = () => (
    <div className={styles.heading_skeleton}>
        <div className={styles.heading_skeleton_text}></div>
    </div>
);

const CategorySkeleton: React.FC = () => (
    <div className={styles.categories}>
        {Array(3)
            .fill(0)
            .map((_, index) => (
                <div key={index} className={styles.category_button_skeleton}></div>
            ))}
    </div>
);

const ProductList: React.FC<ProductListProps> = ({ templates, onProductClick, isLoading }) => (
    <div className={styles.grid}>
        {isLoading ? (
            Array(4)
                .fill(0)
                .map((_, index) => <ProductCardSkeleton key={index} />)
        ) : templates.length === 0 ? (
            <div className={styles.no_results}>Không tìm thấy kết quả</div>
        ) : (
            templates.map((template) => (
                <ProductCard
                    key={template.template_id}
                    name={template.name}
                    image={template.image_url}
                    onClick={() => onProductClick(template)}
                />
            ))
        )}
    </div>
);

const Home: React.FC = () => {
    const { getTemplates, getCategories, getUserProfile } = useApi();
    const [selectedProduct, setSelectedProduct] = useState<Template | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [allTemplates, setAllTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

    const toggleSupportPopup = () => {
        setIsSupportOpen((prev) => !prev);
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const fetchedCategories = await getCategories();
                const sortedCategories = fetchedCategories.sort((a: Category, b: Category) => {
                    if (a.category_name === 'Thiệp cưới') return -1;
                    if (b.category_name === 'Thiệp cưới') return 1;
                    return a.category_name.localeCompare(b.category_name);
                });
                setCategories(sortedCategories);

                const userProfileData = await getUserProfile();
                setUserProfile(userProfileData);

                const templates = await getTemplates();
                setAllTemplates(templates);
                setFilteredTemplates(templates);
            } catch {
                toast.error('Không thể tải dữ liệu ban đầu');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [getTemplates, getCategories, getUserProfile]);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const templates = await getTemplates();
            const query = searchQuery.trim().toLowerCase();

            const filtered = query
                ? templates.filter((template) => {
                      const matchesName = template.name.toLowerCase().includes(query);
                      const matchesCategory = template.category.category_name.toLowerCase().includes(query);
                      return matchesName || matchesCategory;
                  })
                : templates;

            setAllTemplates(templates);
            setFilteredTemplates(filtered);
            setSelectedCategoryId(null);
        } catch {
            toast.error('Không thể tìm kiếm mẫu thiệp');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
        const filtered = allTemplates.filter((template) => template.category.category_id === categoryId);
        setFilteredTemplates(filtered);
        setSearchQuery('');
    };

    const handleShowAll = () => {
        setSelectedCategoryId(null);
        setFilteredTemplates(allTemplates);
        setSearchQuery('');
    };

    const handleProductClick = (template: Template) => {
        setSelectedProduct(template);
    };

    const handleClosePopup = () => {
        setSelectedProduct(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const groupedTemplates = categories.reduce(
        (acc, category) => {
            const templatesInCategory = filteredTemplates.filter(
                (template) => template.category.category_id === category.category_id
            );
            if (templatesInCategory.length > 0) {
                acc[category.category_name] = templatesInCategory;
            }
            return acc;
        },
        {} as Record<string, Template[]>
    );

    const sortedGroupedTemplates = Object.entries(groupedTemplates).sort(([a], [b]) => {
        if (a === 'Thiệp cưới') return -1;
        if (b === 'Thiệp cưới') return 1;
        return a.localeCompare(b);
    });

    return (
        <main className={styles.main}>
            <div className={styles.wrapper_main}>
                <header className={styles.header}>
                    <h1 className={styles.header_title}>Ý tưởng hôm nay của bạn là gì?</h1>
                    <div className={styles.wrapper_expend}>
                        <div className={styles.search_bar}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo Tên, loại, template...."
                                className={styles.search_input}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <span className={styles.search_icon} onClick={handleSearch}>
                                <FontAwesomeIcon icon={faSearch} />
                            </span>
                        </div>
                        {isLoading ? (
                            <CategorySkeleton />
                        ) : (
                            <div className={styles.categories}>
                                {categories.length > 0 ? (
                                    <>
                                        <button
                                            className={`${styles.category_button} ${
                                                selectedCategoryId === null ? styles.active : ''
                                            }`}
                                            onClick={handleShowAll}
                                        >
                                            Tất cả
                                        </button>
                                        {categories.map((category) => (
                                            <button
                                                key={category.category_id}
                                                className={`${styles.category_button} ${
                                                    selectedCategoryId === category.category_id ? styles.active : ''
                                                }`}
                                                onClick={() => handleCategoryClick(category.category_id)}
                                            >
                                                {category.category_name}
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className={styles.no_categories}>Không có danh mục</div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {isLoading ? (
                    <HeadingSkeleton />
                ) : (
                    <h1 className={styles.heading}>Hi, {userProfile?.full_name || 'Everyone'}! 👋</h1>
                )}

                <Notifications />

                <div className={styles.layer_default}>
                    {isLoading ? (
                        <div className={styles.section_skeleton}>
                            <div className={styles.section_title_skeleton}></div>
                            <ProductList templates={[]} onProductClick={handleProductClick} isLoading={true} />
                        </div>
                    ) : sortedGroupedTemplates.length === 0 ? (
                        <div className={styles.no_results}>Không tìm thấy kết quả</div>
                    ) : (
                        sortedGroupedTemplates.map(([categoryName, templates]) => (
                            <div key={categoryName} className={styles.category_section}>
                                <h2 className={styles.section_title}>{categoryName}</h2>
                                <ProductList
                                    templates={templates}
                                    onProductClick={handleProductClick}
                                    isLoading={false}
                                />
                            </div>
                        ))
                    )}
                </div>

                <Countdown />

                <div className={styles.support} onClick={toggleSupportPopup}>
                    <FontAwesomeIcon icon={faHeadset} />
                </div>

                <div className={`${styles.wrapper_support} ${isSupportOpen ? styles.active : ''}`}>
                    <div className={styles.box}>
                        <label htmlFor="user_id">Mã khách hàng</label>
                        <input type="text" id="user_id" value={userProfile?.user_id || ''} disabled />
                    </div>

                    <div className={styles.box}>
                        <label htmlFor="full_name">Tên khách hàng</label>
                        <input type="text" id="full_name" value={userProfile?.full_name || ''} disabled />
                    </div>

                    <div className={styles.box}>
                        <label htmlFor="phone">Số điện thoại</label>
                        <input type="text" id="phone" value={userProfile?.phone ?? 'Chưa cập nhật'} disabled />
                    </div>

                    <div className={styles.box}>
                        <select name="issue" id="issue">
                            <option value="">Lỗi đơn hàng thanh toán trạng thái chưa hoàn thành</option>
                            <option value="">Lỗi hệ thống khi thêm thông tin</option>
                            <option value="">Lỗi hệ thống khi thêm ảnh</option>
                        </select>
                    </div>

                    <div className={styles.submit_button}>Gửi yêu cầu</div>
                </div>
            </div>
            {selectedProduct && <Popup product={selectedProduct} onClose={handleClosePopup} />}
        </main>
    );
};

export default Home;
