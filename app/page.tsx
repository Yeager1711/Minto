'use client';

import React, { useState, useEffect } from 'react';
import styles from './styles/home.module.css';
import Popup from './popup/template_details/Template_Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBoltLightning, faMugHot, faDollarSign, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Notifications from './Notifications/Notifications';
import FeatureCard from './func/FeatureCard/page';
import SupportError from 'app/SupportError/SupportError';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';

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
            <Image src={`${image}`} alt={name} width={300} height={200} priority={false} unoptimized />
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
    const { getTemplates, getCategories, getUserProfile, accessToken } = useApi();
    const [selectedProduct, setSelectedProduct] = useState<Template | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [allTemplates, setAllTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false); // State để điều khiển hiệu ứng

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    const toggleSupportPopup = () => {
        setIsSupportOpen((prev) => !prev);
    };

    useEffect(() => {
        const fetchTemplatesAndCategories = async () => {
            setIsLoading(true);
            try {
                const fetchedCategories = await getCategories();
                const sortedCategories = fetchedCategories.sort((a: Category, b: Category) => {
                    if (a.category_name === 'Thiệp cưới') return -1;
                    if (b.category_name === 'Thiệp cưới') return 1;
                    return a.category_name.localeCompare(b.category_name);
                });
                setCategories(sortedCategories);

                const templates = await getTemplates();
                setAllTemplates(templates);
                setFilteredTemplates(templates);
            } catch {
                toast.error('Không thể tải danh mục hoặc mẫu thiệp');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplatesAndCategories();
    }, [getTemplates, getCategories]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!accessToken) {
                setUserProfile(null);
                return;
            }
            try {
                const userProfileData = await getUserProfile();
                setUserProfile(userProfileData);
            } catch {
                toast.error('Không thể tải hồ sơ người dùng');
            }
        };
        fetchUserProfile();
    }, [getUserProfile]);

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

    // Hàm xử lý khi nhấn nút "Tạo thiệp"
    const handleCreateClick = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
        }, 3000); // Quay lại trạng thái ban đầu sau 3 giây
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

                {/* Những con số biết nói với CountUp */}
                <div className={styles.statsSection} data-aos="fade-up">
                    <h2 className={styles.statsTitle}>Những con số biết nói</h2>
                    <p className={styles.statsDescription}>
                        Tạo ngay thiệp cưới điện tử để tiết kiệm thời gian, tiện lợi và tạo nên một thiệp độc đáo theo
                        phong cách riêng của bạn.
                    </p>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem} data-aos="fade-up" data-aos-delay="200">
                            <span className={styles.statNumber}>
                                <CountUp end={200} suffix="+" duration={2.5} />
                            </span>
                            <span className={styles.statLabel}>Thiệp được tạo</span>
                        </div>
                        <div className={styles.statItem} data-aos="fade-up" data-aos-delay="400">
                            <span className={styles.statNumber}>
                                <CountUp end={1711} duration={2.5} />
                            </span>
                            <span className={styles.statLabel}>Khách mời</span>
                        </div>
                        <div className={styles.statItem} data-aos="fade-up" data-aos-delay="600">
                            <span className={styles.statNumber}>
                                <CountUp end={1000} suffix="+" duration={2.5} />
                            </span>
                            <span className={styles.statLabel}>Lượt xem thiệp</span>
                        </div>
                    </div>
                    <button className={styles.createButton} onClick={handleCreateClick}>
                        Tạo thiệp {' '}
                        <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                </div>

                <div className={`${styles.layer_default} ${isAnimating ? styles.animateLayer : ''}`}>
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

                {/* Ưu điểm */}
                <div className={styles.advantage}>
                    <span data-aos="fade-in" data-aos-delay="200">
                        Ưu điểm
                    </span>
                    <h1 className={styles.advantage_h1} data-aos="fade-up" data-aos-delay="400">
                        Thiệp cưới của Minto có gì đặc biệt ? <strong>Tại sao bạn nên sử dụng ?</strong>
                    </h1>
                    <p className={styles.advantage_text} data-aos="fade-up" data-aos-delay="600">
                        Tạo thiệp nhanh chóng, lưu giữ kỉ niệm cưới của bạn và chia sẻ với bạn bè người thân của bạn một
                        cách tiện lợi.
                    </p>

                    <div className={styles.advantage_wrapper}>
                        <div className={styles.advantage_box} data-aos="fade-up" data-aos-delay="300">
                            <div className={styles.advantage_box__flex}>
                                <FontAwesomeIcon icon={faBoltLightning} />
                            </div>
                            <div className={styles.advantage_box__right}>
                                <h4>Nhanh chóng</h4>
                                <p>
                                    Tạo thiệp cưới chỉ trong vài phút, không cần phải đến cửa hàng in ấn. Tùy chỉnh nội
                                    dung và hình ảnh theo ý muốn.
                                </p>
                            </div>
                        </div>

                        <div className={styles.advantage_box} data-aos="fade-up" data-aos-delay="600">
                            <div className={styles.advantage_box__flex}>
                                <FontAwesomeIcon icon={faMugHot} />
                            </div>
                            <div className={styles.advantage_box__right}>
                                <h4>Tiện lợi</h4>
                                <p>
                                    Bạn có thể tạo thiệp từ bất kỳ đâu, chỉ cần kết nối internet và sử dụng các công cụ
                                    tạo thiệp online của <strong>Minto</strong>.
                                </p>
                            </div>
                        </div>

                        <div className={styles.advantage_box} data-aos="fade-up" data-aos-delay="900">
                            <div className={styles.advantage_box__flex}>
                                <FontAwesomeIcon icon={faDollarSign} />
                            </div>
                            <div className={styles.advantage_box__right}>
                                <h4>Nhận tiền mừng qua QR của bạn</h4>
                                <p>Nhận hồng bao sớm từ bạn bè bằng cách gắn QR ngân hàng vào thiệp.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <FeatureCard />

                {/* Câu hỏi thường gặp */}
                <div className={styles.faqSection}>
                    <div className={styles.faqSection_flex}>
                        <div className={styles.faqSection_box}>
                            <h3 className={styles.title} data-aos="fade-in" data-aos-delay="100">
                                Câu hỏi thường gặp
                            </h3>
                            <span className={styles.text} data-aos="fade-in" data-aos-delay="300">
                                Không giải đáp được thắc mắc của bạn? <strong>Liên hệ</strong> với chúng tôi để được hỗ
                                trợ.
                            </span>
                        </div>
                    </div>
                    <div className={styles.faqSection_right}>
                        <div className={styles.faqSection_wrapper}>
                            <div className={styles.faqSection_box__item} data-aos="fade-left" data-aos-delay="300">
                                <h4>Làm thế nào để tạo thiệp cưới online ?</h4>
                                <p>
                                    Bạn có thể tạo thiệp cưới online bằng cách chọn mẫu thiệp và tùy chỉnh nội dung và
                                    hình ảnh theo ý muốn.
                                </p>
                            </div>

                            <div className={styles.faqSection_box__item} data-aos="fade-left" data-aos-delay="500">
                                <h4>Làm thế nào để gửi thiệp cưới online ?</h4>
                                <p>
                                    Sau khi tạo thiệp, bạn có thể vào phần <strong>Hồ sơ</strong> xem danh sách khách
                                    mời của mẫu đã tạo trước đó.
                                </p>
                            </div>

                            <div className={styles.faqSection_box__item} data-aos="fade-left" data-aos-delay="700">
                                <h4>Có những mẫu thiệp cưới nào để lựa chọn?</h4>
                                <p>
                                    Có nhiều mẫu thiệp cưới đẹp và đa dạng để bạn lựa chọn, từ thiệp truyền thống đến
                                    thiệp hiện đại.
                                </p>
                            </div>

                            <div className={styles.faqSection_box__item} data-aos="fade-left" data-aos-delay="900">
                                <h4>Tôi có thể tùy chỉnh nội dung và hình ảnh trên thiệp không ?</h4>
                                <p>
                                    Đúng vậy, bạn có thể tùy chỉnh nội dung và hình ảnh, thậm chí là địa điểm tổ chức
                                    trên thiệp theo ý muốn để tạo nên một thiệp cưới độc đáo.
                                </p>
                            </div>

                            <div className={styles.faqSection_box__item} data-aos="fade-left" data-aos-delay="1100">
                                <h4>Tôi có thể in thiệp cưới điện tử không?</h4>
                                <p>
                                    Thiệp cưới điện tử thường được gửi qua email hoặc chia sẻ trực tuyến, nên không cần
                                    in thiệp.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <SupportError isSupportOpen={isSupportOpen} toggleSupportPopup={toggleSupportPopup} />
            </div>
            {selectedProduct && <Popup product={selectedProduct} onClose={handleClosePopup} />}
        </main>
    );
};

export default Home;
