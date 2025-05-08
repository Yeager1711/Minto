'use client';
import React, { useState } from 'react';
import styles from './styles/home.module.css';
import Popup from './popup/product_details/Product_Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Define the type for product data
interface Product {
    id: string;
    name: string;
    image: string;
    link: string;
    price: number;
    description: string;
    status: string;
}

// Products for "Mẫu thiết kế có sẵn" (Ready-made designs)
const readyMadeProducts: Product[] = [
    {
        id: '1',
        name: 'Template 1',
        image: '/images/m1/1.1.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 99000,
        description: 'Phong cách tối giản\nThanh lịch\nMàu sắc nhẹ nhàng\nDễ phối hợp\nHoàn hảo cho tiệc cưới hiện đại',
        status: 'Sẵn sàng',
    },
    {
        id: '2',
        name: 'Template 2',
        image: '/images/m2/m2.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 199000,
        description: 'Thiết kế đơn giản\nMàu sắc nhẹ nhàng\nThông tin cơ bản đầy đủ\nKết hợp dynamic music bottom',
        status: 'Sẵn sàng',
    },
];

// Products for "Mẫu pro" (Pro designs - full list)
const proProducts: Product[] = [
    {
        id: 'pro_1',
        name: 'Thiệp cưới hoa đào đỏ hiện đại',
        image: '/images/p_1.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 129000,
        description:
            'Màu đỏ rực rỡ với hoa đào nổi bật.\nThiết kế hiện đại, sang trọng.\nLý tưởng cho cặp đôi yêu sự nổi bật.',
        status: 'Đang được cập nhật',
    },
    {
        id: 'pro_2',
        name: 'Thiệp cưới màu nước tối giản',
        image: '/images/p_2.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 109000,
        description: 'Phong cách màu nước mềm mại.\nTối giản nhưng đầy tinh tế.\nPhù hợp cho tiệc cưới ấm cúng.',
        status: 'Đang được cập nhật',
    },
    {
        id: 'pro_3',
        name: 'Thiệp cưới màu xanh, màu trắng mềm mại',
        image: '/images/p_3.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 119000,
        description: 'Sắc xanh và trắng dịu dàng.\nThiết kế mềm mại, thanh thoát.\nHoàn hảo cho lễ cưới ngoài trời.',
        status: 'Đang được cập nhật',
    },
    {
        id: 'pro_4',
        name: 'Thiệp cưới hiện đại Blue Gold',
        image: '/images/p_4.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 139000,
        description:
            'Kết hợp xanh dương và vàng ánh kim.\nThiết kế sang trọng, hiện đại.\nLý tưởng cho tiệc cưới cao cấp.',
        status: 'Đang được cập nhật',
    },
    {
        id: 'pro_5',
        name: 'Thiệp cưới thanh lịch',
        image: '/images/p_5.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 99000,
        description:
            'Phong cách thanh lịch, tinh tế.\nMàu sắc trung tính, dễ phối hợp.\nPhù hợp cho mọi phong cách cưới.',
        status: 'Đang được cập nhật',
    },
];

// Define props type for the ProductCard component
interface ProductCardProps {
    name: string;
    image: string;
    onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, image, onClick }) => (
    <div className={styles.card_product} onClick={onClick}>
        <div className={styles.image_products}>
            <img src={image} alt={name} />
        </div>
    </div>
);

// Define props type for the ProductList component
interface ProductListProps {
    products: Product[];
    onProductClick: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductClick }) => (
    <div className={styles.grid}>
        {products.map((product, index) => (
            <ProductCard
                key={index}
                name={product.name}
                image={product.image}
                onClick={() => onProductClick(product)}
            />
        ))}
    </div>
);

const Home: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(''); // State lưu từ khóa tìm kiếm
    const [filteredProProducts, setFilteredProProducts] = useState<Product[]>(proProducts); // State lưu danh sách sản phẩm đã lọc
    const [isLoading, setIsLoading] = useState<boolean>(false); // State kiểm soát trạng thái "Đang cập nhật"

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleClosePopup = () => {
        setSelectedProduct(null);
    };

    const handleSearch = () => {
        setIsLoading(true); // Bật trạng thái "Đang cập nhật"
        setTimeout(() => {
            const query = searchQuery.trim().toLowerCase();
            if (query === '') {
                setFilteredProProducts(proProducts); // Nếu không có từ khóa, hiển thị toàn bộ danh sách
            } else {
                const filtered = proProducts.filter((product) => product.name.toLowerCase().includes(query));
                setFilteredProProducts(filtered); // Cập nhật danh sách đã lọc
            }
            setIsLoading(false); // Tắt trạng thái "Đang cập nhật"
        }, 1000); // Giả lập độ trễ 1 giây
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(); // Gọi hàm tìm kiếm khi nhấn Enter
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
                                onKeyPress={handleKeyPress} // Xử lý khi nhấn Enter
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
                    <h2>Mẫu thiết kế có sẵn</h2>
                    <ProductList products={readyMadeProducts} onProductClick={handleProductClick} />
                </div>

                <div className={styles.layer_default}>
                    <h2>Mẫu pro</h2>
                    {isLoading ? (
                        <div className={styles.loading}>Đang cập nhật</div>
                    ) : filteredProProducts.length === 0 ? (
                        <div className={styles.noResults}>Không tìm thấy kết quả</div>
                    ) : (
                        <ProductList products={filteredProProducts} onProductClick={handleProductClick} />
                    )}
                </div>
            </div>
            <Popup product={selectedProduct} onClose={handleClosePopup} />
        </main>
    );
};

export default Home;
