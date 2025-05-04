'use client';
import React, { useState } from 'react';
import styles from './my_products.module.scss';
import Popup from '../popup/product_details/page'; // Import the Popup component

// Define the type for product data
interface Product {
    name: string;
    image: string;
}

const products: Product[] = [
    { name: 'Thiệp cưới hoa đào đỏ hiện đại', image: '/images/p_1.png' },
    { name: 'Thiệp cưới màu nước tối giản', image: '/images/p_2.png' },
    { name: 'Thiệp cưới màu xanh, màu trắng mềm mại', image: '/images/p_3.png' },
    { name: 'Thiệp cưới hiện đại Blue Gold', image: '/images/p_4.png' },
    { name: 'Thiệp cưới thanh lịch', image: '/images/p_5.png' },
    { name: 'Thiệp cưới thanh lịch', image: '/images/p_5.png' },
    { name: 'Thiệp cưới hiện đại Blue Gold', image: '/images/p_4.png' },
    { name: 'Thiệp cưới màu xanh, màu trắng mềm mại', image: '/images/p_3.png' },
    { name: 'Thiệp cưới màu nước tối giản', image: '/images/p_2.png' },
    { name: 'Mẫu 1', image: '/images/p_1.png' },
    { name: 'Mẫu 1', image: '/images/p_1.png' },
    { name: 'Thiệp cưới màu nước tối giản', image: '/images/p_2.png' },
    { name: 'Thiệp cưới màu xanh, màu trắng mềm mại', image: '/images/p_3.png' },
    { name: 'Thiệp cưới hiện đại Blue Gold', image: '/images/p_4.png' },
    { name: 'Thiệp cưới thanh lịch', image: '/images/p_5.png' },
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
            <img src={image} alt="" />
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
            <h1 className={styles.heading}>GM, Huỳnh Nam! 👋</h1>
            <ProductList products={products} onProductClick={handleProductClick} />
            <Popup product={selectedProduct} onClose={handleClosePopup} />
        </main>
    );
};

export default Home;
