'use client';
import React, { useState, useEffect } from 'react';
import styles from './styles/home.module.css';
import Popup from './popup/product_details/Product_Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface Template {
    template_id: number;
    name: string;
    image_url: string; // Base64 string (without data:image/png;base64, prefix)
    price: number;
    description?: string;
    status: string;
    link?: string;
    category: {
        category_id: number;
        category_name: string;
    };
}

interface ProductCardProps {
    name: string;
    image: string; // Base64 string
    onClick: () => void;
}

interface ProductListProps {
    templates: Template[];
    onProductClick: (template: Template) => void;
}

// const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

const ProductCard: React.FC<ProductCardProps> = ({ name, image, onClick }) => (
    <div className={styles.card_product} onClick={onClick}>
        <div className={styles.image_products}>
            <Image
                src={`data:image/png;base64,${image}`} // Thêm tiền tố để định dạng thành Base64 data URL
                alt={name}
                width={300}
                height={200}
                priority={false}
                unoptimized
            />
        </div>
    </div>
);

const ProductList: React.FC<ProductListProps> = ({ templates, onProductClick }) => (
    <div className={styles.grid}>
        {templates.map((template) => (
            <ProductCard
                key={template.template_id}
                name={template.name}
                image={template.image_url} // Pass Base64 string
                onClick={() => onProductClick(template)}
            />
        ))}
    </div>
);

const Home: React.FC = () => {
    const { getTemplates } = useApi();
    const [selectedProduct, setSelectedProduct] = useState<Template | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredProProducts, setFilteredProProducts] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                const templates = await getTemplates();
                setFilteredProProducts(templates);
            } catch {
                toast.error('Không thể tải danh sách mẫu thiệp');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, [getTemplates]);

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
                    <h1 className={styles.headerTitle}>Ý tưởng hôm nay của bạn là gì?</h1>
                    <div className={styles.headerButtons}>
                        <button className={styles.headerButtonActive}>Templates thiệp cưới</button>
                        <button className={styles.headerButton}>Templates tốt nghiệp</button>
                        <button className={styles.headerButton}>Template sinh nhật</button>
                    </div>
                    <div className={styles.wrapper_expend}>
                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                placeholder="Search millions of templates"
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <span className={styles.searchIcon} onClick={handleSearch}>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </span>
                        </div>
                        <div className={styles.categories}>
                            <button className={styles.categoryButton}>Thiệp cưới</button>
                            <button className={styles.categoryButton}>Sinh nhật</button>
                            <button className={styles.categoryButton}>Lễ tốt nghiệp</button>
                            <button className={styles.categoryButton}>Sự kiện quan trọng</button>
                        </div>
                    </div>
                </header>

                <h1 className={styles.heading}>Hi, Everyone! 👋</h1>

                <div className={styles.layer_default}>
                    <h2>Mẫu pro</h2>
                    {isLoading ? (
                        <div className={styles.loading}>Đang tải...</div>
                    ) : filteredProProducts.length === 0 ? (
                        <div className={styles.noResults}>Không tìm thấy kết quả</div>
                    ) : (
                        <ProductList templates={filteredProProducts} onProductClick={handleProductClick} />
                    )}
                </div>
            </div>
            {selectedProduct && <Popup product={selectedProduct} onClose={handleClosePopup} />}
        </main>
    );
};

export default Home;
