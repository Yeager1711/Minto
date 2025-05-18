'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link from next/link
import styles from './styles/home.module.css';
import Popup from './popup/product_details/Product_Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { toast } from 'react-toastify';
import Image from 'next/image';

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
        {Array(4)
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
            <div className={styles.no_categories}>Không tìm thấy kết quả</div>
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
    const [filteredProProducts, setFilteredProProducts] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [userName, setUserName] = useState<string>('Everyone');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);

                const userProfile = await getUserProfile();
                setUserName(userProfile.full_name || 'Everyone');

                const templates = await getTemplates();
                setFilteredProProducts(templates);
            } catch {
                toast.error('Không thể tải dữ liệu ban đầu');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [getTemplates, getCategories, getUserProfile]);

    const handleProductClick = (template: Template) => {
        setSelectedProduct(template);
    };

    const handleClosePopup = () => {
        setSelectedProduct(null);
    };

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const templates = await getTemplates();
            const query = searchQuery.trim().toLowerCase();
            const filtered = query
                ? templates.filter((product) => product.name.toLowerCase().includes(query))
                : templates;
            setFilteredProProducts(filtered);
        } catch {
            toast.error('Không thể tìm kiếm mẫu thiệp');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.wrapper_main}>
                <header className={styles.header}>
                    <h1 className={styles.header_title}>Ý tưởng hôm nay của bạn là gì?</h1>
                    <div className={styles.wrapper_expend}>
                        <div className={styles.search_bar}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm hàng triệu mẫu thiệp..."
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
                                    categories.map((category) => (
                                        <button key={category.category_id} className={styles.category_button}>
                                            {category.category_name}
                                        </button>
                                    ))
                                ) : (
                                    <div className={styles.no_categories}>Không có danh mục</div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {isLoading ? <HeadingSkeleton /> : <h1 className={styles.heading}>Hi, {userName}! 👋</h1>}

                <div className={styles.notifications}>
                    <div className={styles.wrapper_notifications}>
                        <div className={styles.box}>
                            <h3>
                                Giảm giá 20% cho tài khoản mới tại{' '}
                                <Link href="/" className={styles.link}>
                                    Minto
                                </Link>
                            </h3>
                            <div className={styles.box_item}>
                                <span className={styles.item}>+ Áp dụng cho toàn bộ template</span>
                                <span className={styles.item}>
                                    + Không áp dụng đồng thời với các mã khuyến mãi khác
                                </span>
                                <span className={styles.item}>
                                    + Ưu đãi chỉ áp dụng trong 7 ngày kể từ ngày đăng ký
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.layer_default}>
                    <h2 className={styles.section_title}>Mẫu thiệp cưới</h2>
                    <ProductList
                        templates={filteredProProducts}
                        onProductClick={handleProductClick}
                        isLoading={isLoading}
                    />
                </div>
            </div>
            {selectedProduct && <Popup product={selectedProduct} onClose={handleClosePopup} />}
        </main>
    );
};

export default Home;
