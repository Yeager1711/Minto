import * as React from 'react';
import styles from './products.module.css';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

interface Template {
    template_id: number;
    name: string;
    image_url: string;
    price: number;
    status: string;
    category: {
        category_id: number;
        category_name: string;
    };
}

interface ProductCardProps {
    name: string;
    image: string;
    price: number;
    status: string;
    onClick: () => void;
}

interface ProductListProps {
    templates: Template[];
    onProductClick: (template: Template) => void;
    isLoading: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, image, price, status, onClick }) => (
    <div className={styles.card_product} onClick={onClick}>
        <div className={styles.image_products}>
            <Image
                src={image || '/default-image.jpg'}
                alt={name}
                width={300}
                height={200}
                priority={false}
                unoptimized
                style={{ aspectRatio: '3/2' }}
            />
            <div className={styles.card_overlay}>
                <h3 className={styles.card_title}>{name}</h3>
                <h3 className={styles.card_price}>{Number(price).toLocaleString('vi-VN') + ' VNĐ'}</h3>
                <h3 className={styles.card_status}>{status.toUpperCase()}</h3>
            </div>
        </div>
    </div>
);

const ProductCardSkeleton: React.FC = () => (
    <div className={styles.card_product_skeleton}>
        <div className={styles.image_products_skeleton}></div>
    </div>
);

const ProductList: React.FC<ProductListProps> = ({ templates, onProductClick, isLoading }) => {
    const sortedTemplates = [...templates].sort((a, b) => b.template_id - a.template_id);

    return (
        <div className={styles.product_list}>
            {isLoading ? (
                <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    breakpoints={{
                        375: { slidesPerView: 1.5, spaceBetween: 10 },
                        600: { slidesPerView: 2.5, spaceBetween: 15 },
                        1024: { slidesPerView: 3, spaceBetween: 15 },
                    }}
                    modules={[Autoplay, Navigation]}
                    className={styles.swiper_container}
                    autoplay={{ delay: 100000000000000, disableOnInteraction: false }}
                    navigation={{
                        prevEl: '.swiper-button-prev',
                        nextEl: '.swiper-button-next',
                    }}
                >
                    {Array(4)
                        .fill(0)
                        .map((_, index) => (
                            <SwiperSlide key={index}>
                                <ProductCardSkeleton />
                            </SwiperSlide>
                        ))}
                    <button className="swiper-button-prev"></button>
                    <button className="swiper-button-next"></button>
                </Swiper>
            ) : sortedTemplates.length === 0 ? (
                <div className={styles.no_results}>Không tìm thấy kết quả</div>
            ) : (
                <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    breakpoints={{
                        375: { slidesPerView: 1.5, spaceBetween: 10 },
                        600: { slidesPerView: 2.2, spaceBetween: 15 },
                        1024: { slidesPerView: 3, spaceBetween: 15 },
                    }}
                    modules={[Autoplay, Navigation]}
                    className={styles.swiper_container}
                    autoplay={{ delay: 10000, disableOnInteraction: false }}
                    navigation={{
                        prevEl: '.swiper-button-prev',
                        nextEl: '.swiper-button-next',
                    }}
                >
                    {sortedTemplates.map((template) => (
                        <SwiperSlide key={template.template_id}>
                            <ProductCard
                                name={template.name}
                                image={template.image_url}
                                price={template.price}
                                status={template.status}
                                onClick={() => onProductClick(template)}
                            />
                        </SwiperSlide>
                    ))}
                    <button className="swiper-button-prev"></button>
                    <button className="swiper-button-next"></button>
                </Swiper>
            )}
        </div>
    );
};

const Products: React.FC<ProductListProps> = ({ templates, onProductClick, isLoading }) => {
    return (
        <div className={styles.products}>
            <ProductList templates={templates} onProductClick={onProductClick} isLoading={isLoading} />
        </div>
    );
};

export default Products;
