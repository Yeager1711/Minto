'use client';

import React, { useState, useEffect } from 'react';
import styles from './styles/home.module.css';
import Popup from './popup/template_details/Template_Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faBoltLightning,
    faMugHot,
    faDollarSign,
    faChevronDown,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useApi } from 'app/lib/apiContext/apiContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Notifications from './Notifications/Notifications';
import FeatureCard from './func/FeatureCard/page';
import SupportError from 'app/feedback/SupportError/SupportError';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import GeminiButton from './feedback/Auto_Reply/gemini_button/Gemini';
import GeminiReply from './feedback/Auto_Reply/genmini_reply/GenimiReply';

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

interface Feedback {
    feedback_id: number;
    rating: number;
    comment: string;
    submitted_at: string;
    user: {
        user_id: number;
        full_name: string;
        email: string;
        phone: string | null;
        address: string | null;
        password: string;
        created_at: string | null;
    };
    template: Template; // Align with Template interface
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

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;
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
                <h3 className={styles.card_price}>{price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' vnđ'}</h3>
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
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const [isReplyVisible, setIsReplyVisible] = useState<boolean>(false);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);

    const openReply = () => {
        setIsReplyVisible(true);
    };

    const closeReply = () => {
        setIsReplyVisible(false);
    };

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    const toggleSupportPopup = () => {
        setIsSupportOpen((prev) => !prev);
    };

    // Fetch templates and categories
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

    // Fetch user profile
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

    // Fetch feedback data
    useEffect(() => {
        const fetchFeedbacks = async () => {
            setIsFeedbackLoading(true);
            try {
                const response = await fetch(`${apiUrl}/user-feedback/all-user-feedback`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch feedbacks');
                }
                const data: Feedback[] = await response.json();
                setFeedbacks(data);
            } catch {
                toast.error('Không thể tải phản hồi của khách hàng');
            } finally {
                setIsFeedbackLoading(false);
            }
        };
        fetchFeedbacks();
    }, [accessToken]);

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

    const handleClearSearch = () => {
        setSearchQuery('');
        setFilteredTemplates(allTemplates);
        setSelectedCategoryId(null);
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
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

    const handleFeedbackClick = (template: Template) => {
        setSelectedProduct(template);
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

    const handleCreateClick = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
        }, 3000);
    };

    return (
        <main className={styles.main}>
            <div className={styles.wrapper_main}>
                <header className={styles.header}>
                    <h1 className={styles.header_title}>Bạn thích mẫu thiệp như nào ?</h1>
                    <div className={styles.wrapper_expend}>
                        <div className={`${styles.search_bar} ${isSearchFocused ? styles.search_bar_expanded : ''}`}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo Tên, loại, template...."
                                className={styles.search_input}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                            />
                            {searchQuery && (
                                <span className={styles.clear_icon} onClick={handleClearSearch}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </span>
                            )}
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

                <div className={styles.statsSection} data-aos="fade-up">
                    <h2 className={styles.statsTitle}>Những con số biết nói</h2>
                    <p className={styles.statsDescription}>
                        Tạo ngay thiệp cưới điện tử để tiết kiệm thời gian, tiện lợi và tạo nên một thiệp độc đáo theo
                        phong cách riêng của bạn.
                    </p>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem} data-aos="fade-up" data-aos-delay="200">
                            <span className={styles.statNumber}>
                                <CountUp end={217} duration={2.5} />
                            </span>
                            <span className={styles.statLabel}>Thiệp được tạo</span>
                        </div>
                        <div className={styles.statItem} data-aos="fade-up" data-aos-delay="400">
                            <span className={styles.statNumber}>
                                <CountUp end={2101} duration={2.5} />
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
                        Tạo thiệp <FontAwesomeIcon icon={faChevronDown} />
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

                <div className={styles.feedbacks_user}>
                    <h1 className={styles.feedbacksUser_h1} data-aos="fade-up" data-aos-delay="400">
                        Cảm nhận của khách hàng về các mẫu thiệp
                    </h1>
                    {isFeedbackLoading ? (
                        <Swiper
                            slidesPerView={1}
                            spaceBetween={20}
                            breakpoints={{
                                375: { slidesPerView: 1.5, spaceBetween: 10 },
                                600: { slidesPerView: 2.5, spaceBetween: 15 },
                                1024: { slidesPerView: 3, spaceBetween: 15 },
                            }}
                            modules={[Autoplay]}
                            className={styles.swiper_container}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                        >
                            {Array(3)
                                .fill(0)
                                .map((_, index) => (
                                    <SwiperSlide key={index}>
                                        <div className={styles.box_feedback}>
                                            <div className={styles.customer_name}>Đang tải...</div>
                                            <div className={styles.template_name}>Mẫu: Đang tải...</div>
                                            <p className={styles.comment}>Đang tải phản hồi...</p>
                                        </div>
                                    </SwiperSlide>
                                ))}
                        </Swiper>
                    ) : feedbacks.length === 0 ? (
                        <div className={styles.no_results}>Không có phản hồi nào</div>
                    ) : (
                        <Swiper
                            slidesPerView={1}
                            spaceBetween={20}
                            loop={true}
                            breakpoints={{
                                375: { slidesPerView: 1.5, spaceBetween: 10 },
                                600: { slidesPerView: 2.5, spaceBetween: 15 },
                                1024: { slidesPerView: 3, spaceBetween: 15 },
                            }}
                            modules={[Autoplay]}
                            className={styles.swiper_container}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                        >
                            {feedbacks.map((fb) => (
                                <SwiperSlide key={fb.feedback_id}>
                                    <div
                                        className={styles.box_feedback}
                                        onClick={() => handleFeedbackClick(fb.template)}
                                    >
                                        <div className={styles.customer_name}>{fb.user.full_name}</div>
                                        <div className={styles.template_name}>Mẫu: {fb.template.name}</div>
                                        <p className={styles.comment}>{fb.comment}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>

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

                            <div className={styles.faqSection_box__item} data-aos="fade-left" data-aos-delay="1100">
                                <h4>Tiền mừng sẽ được rút từ hệ thống hay được đưa thẳng vào Ngân Hàng cá nhân</h4>
                                <p>
                                    Khi tạo tạo QR nhận mừng Hỷ, tiền sẽ thông qua QR đến trực tiếp tài khoản của{' '}
                                    <strong>Chú Rể</strong> hoặc <strong>Cô Dâu</strong> khi khách mời quét QR.
                                </p>
                                <p>Hệ thống không nhận hay giữ bất cứ tiền liên quan từ phía khách hàng.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.control_right}>
                    <div className={styles.wrapper_center}>
                        <GeminiButton onClick={openReply} />
                        <SupportError isSupportOpen={isSupportOpen} toggleSupportPopup={toggleSupportPopup} />
                    </div>
                </div>

                {isReplyVisible && <GeminiReply onClose={closeReply} />}
            </div>
            {selectedProduct && <Popup product={selectedProduct} onClose={handleClosePopup} />}
        </main>
    );
};

export default Home;
