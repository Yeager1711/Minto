'use client';
import React, { useState } from 'react';
import styles from './styles/home.module.scss';
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
}

// Products for "Mẫu thiết kế có sẵn" (Ready-made designs)
const readyMadeProducts: Product[] = [
    {
        id: 'template_1',
        name: 'Template 1',
        image: '/images/m1/1.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 99000,
        description: 'Phong cách tối giản\nThanh lịch\nMàu sắc nhẹ nhàng\nDễ phối hợp\nHoàn hảo cho tiệc cưới hiện đại',
    },
    {
        id: 'template_2',
        name: 'Template 2',
        image: '/images/m2/m2.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 199000,
        description: 'Thiết kế đơn giản\nMàu sắc nhẹ nhàng\nThông tin cơ bản đầy đủ\nKết hợp dynamic music bottom',
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
    },
    {
        id: 'pro_2',
        name: 'Thiệp cưới màu nước tối giản',
        image: '/images/p_2.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 109000,
        description: 'Phong cách màu nước mềm mại.\nTối giản nhưng đầy tinh tế.\nPhù hợp cho tiệc cưới ấm cúng.',
    },
    {
        id: 'pro_3',
        name: 'Thiệp cưới màu xanh, màu trắng mềm mại',
        image: '/images/p_3.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 119000,
        description: 'Sắc xanh và trắng dịu dàng.\nThiết kế mềm mại, thanh thoát.\nHoàn hảo cho lễ cưới ngoài trời.',
    },
    {
        id: 'pro_4',
        name: 'Thiệp cưới hiện đại Blue Gold',
        image: '/images/p_4.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 139000,
        description:
            'Kết hợp xanh dương và vàng ánh kim.\nThiết kế sang trọng, hiện đại.\nLý tưởng cho tiệc cưới cao cấp.',
    },
    {
        id: 'pro_5',
        name: 'Thiệp cưới thanh lịch',
        image: '/images/p_5.png',
        link: 'https://exquisite-tapioca-fae754.netlify.app/',
        price: 99000,
        description:
            'Phong cách thanh lịch, tinh tế.\nMàu sắc trung tính, dễ phối hợp.\nPhù hợp cho mọi phong cách cưới.',
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

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleClosePopup = () => {
        setSelectedProduct(null);
    };

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>What will you design today?</h1>
                <div className={styles.headerButtons}>
                    <button className={styles.headerButtonActive}>Templates thiệp cưới</button>
                    <button className={styles.headerButton}>Templates tốt nghiệp</button>
                    <button className={styles.headerButton}>Template sinh nhật</button>
                </div>

                <div className={styles.wrapper_expend}>
                    <div className={styles.searchBar}>
                        <input type="text" placeholder="Search millions of templates" className={styles.searchInput} />
                        <span className={styles.searchIcon}>
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

            <h1 className={styles.heading}>GM, Huỳnh Nam! 👋</h1>

            <div className={styles.layer_default}>
                <h2>Mẫu thiết kế có sẵn</h2>
                <ProductList products={readyMadeProducts} onProductClick={handleProductClick} />
            </div>

            <div className={styles.layer_default}>
                <h2>Mẫu pro</h2>
                <ProductList products={proProducts} onProductClick={handleProductClick} />
            </div>
            <Popup product={selectedProduct} onClose={handleClosePopup} />
        </main>
    );
};

export default Home;
