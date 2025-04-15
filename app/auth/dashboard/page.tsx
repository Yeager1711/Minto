'use client';

import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faImage, faCamera } from '@fortawesome/free-solid-svg-icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useRouter } from 'next/navigation';
import { useApi } from 'app/lib/apiConentext/ApiContext';
import styles from './dashboard.module.scss';

import { Industry } from 'app/interface/Industry';
import { RecruitmentInfo } from 'app/interface/Recruitment';
import { showToastError, showToastSuccess } from 'app/Ultils/toast';

// import layout
import Notifications from './notifications/page';

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL || 'http://localhost:5000';
console.log('log', apiUrl);

function Dashboard() {
    const router = useRouter();
    const { fetchRecruitmentID, updateBannerBackground, updateCompanyLogo } = useApi();
    const [recruitmentInfo, setRecruitmentInfo] = useState<RecruitmentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewBannerImage, setPreviewBannerImage] = useState<string | null>(null);
    const [previewLogoImage, setPreviewLogoImage] = useState<string | null>(null);
    const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
    const logoFileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-in-out',
        });

        setTimeout(() => {
            AOS.refresh();
        }, 100);

        const loadRecruitmentInfo = async () => {
            try {
                setLoading(true);
                const data = await fetchRecruitmentID();
                setRecruitmentInfo(data);
                // Set initial banner preview from saved banner if available
                const savedBanner = data.company?.images?.[0]?.banner_BackgroundImage_company;
                if (savedBanner) {
                    setPreviewBannerImage(`${apiUrl}${savedBanner}`);
                }
            } catch (err) {
                console.error('Error loading recruitment info:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRecruitmentInfo();
    }, [fetchRecruitmentID]);

    // Handle banner image selection and upload
    const handleBannerImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Store previous banner for reversion on failure
            const previousBanner = previewBannerImage;

            // Update banner preview
            if (previewBannerImage && previewBannerImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewBannerImage);
            }
            const imageUrl = URL.createObjectURL(file);
            setPreviewBannerImage(imageUrl);

            // Upload to backend
            try {
                const savedBannerUrl = await updateBannerBackground(file);
                // Update recruitmentInfo with new banner URL
                setRecruitmentInfo((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        company: {
                            ...prev.company!,
                            images: [
                                {
                                    ...prev.company!.images?.[0],
                                    banner_BackgroundImage_company: savedBannerUrl,
                                },
                            ],
                        },
                    };
                });
                setPreviewBannerImage(`${apiUrl}${savedBannerUrl}`); // Update preview with saved URL
                showToastSuccess(`Ảnh nền Công ty ${recruitmentInfo?.company?.name || ''} đã được cập nhật thành công`);
            } catch (error) {
                console.error('Failed to upload banner:', error);
                setPreviewBannerImage(previousBanner); // Revert to previous banner on failure
                showToastError('Lỗi cập nhật ảnh nền');
            }
        }
    };

    // Handle logo image selection and automatic upload
    const handleLogoImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Update logo preview
            if (previewLogoImage && previewLogoImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewLogoImage);
            }
            const imageUrl = URL.createObjectURL(file);
            setPreviewLogoImage(imageUrl);

            // Automatically upload to backend
            try {
                const savedLogoUrl = await updateCompanyLogo(file);
                // Update recruitmentInfo with new logo URL
                setRecruitmentInfo((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        company: {
                            ...prev.company!,
                            images: [
                                {
                                    ...prev.company!.images?.[0],
                                    image_company: savedLogoUrl,
                                },
                            ],
                        },
                    };
                });
                setPreviewLogoImage(`${apiUrl}${savedLogoUrl}`); // Update preview with saved URL
                if (logoFileInputRef.current) {
                    logoFileInputRef.current.value = ''; // Reset file input
                }
                showToastSuccess(`Logo Công ty "${recruitmentInfo?.company?.name || ''}" cập nhật thành công`);
            } catch (error) {
                console.error('Failed to upload logo:', error);
                setPreviewLogoImage(
                    recruitmentInfo?.company?.images?.[0]?.image_company
                        ? `${apiUrl}${recruitmentInfo.company.images[0].image_company}`
                        : null
                ); // Revert to previous logo
                showToastError('Lỗi cập nhật logo');
            }
        }
    };

    // Clean up preview URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewBannerImage && previewBannerImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewBannerImage);
            }
            if (previewLogoImage && previewLogoImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewLogoImage);
            }
        };
    }, [previewBannerImage, previewLogoImage]);

    const handleBannerPreviewClick = () => {
        if (bannerFileInputRef.current) {
            bannerFileInputRef.current.click();
        }
    };

    const handleLogoPreviewClick = () => {
        if (logoFileInputRef.current) {
            logoFileInputRef.current.click();
        }
    };

    const slides = [
        {
            images: [
                'https://static.topcv.vn/banners/A0wqgn6jG2lCnOIyn9BQ.jpg',
                'https://static.topcv.vn/banners/lDslopwpt1g52KMlHU7O.jpg',
            ],
        },
        {
            images: [
                'https://static.topcv.vn/banners/A0wqgn6jG2lCnOIyn9BQ.jpg',
                'https://static.topcv.vn/banners/lDslopwpt1g52KMlHU7O.jpg',
            ],
        },
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.dashboard}>
            <section className={styles.banner_image__company}>
                <div className={styles.choose_image__bannerCompany}>
                    <input
                        type="file"
                        id="companyImage"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleBannerImageChange}
                        ref={bannerFileInputRef}
                    />

                    {previewBannerImage || recruitmentInfo?.company?.images?.[0]?.banner_BackgroundImage_company ? (
                        (() => {
                            const imageUrl =
                                previewBannerImage ||
                                `${apiUrl}${recruitmentInfo?.company.images[0].banner_BackgroundImage_company}`;
                            return (
                                <img
                                    src={imageUrl}
                                    alt="Selected company background"
                                    className={styles.preview_image}
                                    onClick={handleBannerPreviewClick}
                                    style={{ cursor: 'pointer' }}
                                />
                            );
                        })()
                    ) : (
                        <label htmlFor="companyImage" className={styles.select_image_label}>
                            <FontAwesomeIcon icon={faImage} /> Select Company Background Image
                        </label>
                    )}

                    <div className={styles.img_updated}>
                        {recruitmentInfo?.company?.images?.[0]?.banner_BackgroundImage_company ? (
                            (() => {
                                const updatedImageUrl = `${apiUrl}${recruitmentInfo.company.images[0].banner_BackgroundImage_company}`;
                                return (
                                    <img
                                        src={updatedImageUrl}
                                        alt="Company banner"
                                        onClick={handleBannerPreviewClick}
                                    />
                                );
                            })()
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                <div className={styles.company_Name__title}>
                    <h3 className={styles.company_name}>{recruitmentInfo?.company?.name || ''}</h3>
                    <span className={styles.industry}>
                        Lĩnh vực: {recruitmentInfo?.company?.companyIndustries?.[0].name}
                    </span>
                </div>

                <div className={styles.choose_image__logoCompany}>
                    <div className={styles.logoCompany_preview}>
                        {previewLogoImage ? (
                            // Show preview image
                            <img
                                src={previewLogoImage}
                                alt="Logo Preview"
                                className={styles.logo_image}
                                style={{ cursor: 'pointer' }}
                                onClick={handleLogoPreviewClick}
                            />
                        ) : recruitmentInfo?.company?.images?.[0]?.image_company ? (
                            // Show logo from DB
                            <img
                                src={`${apiUrl}${recruitmentInfo.company.images[0].image_company}`}
                                alt="Company Logo"
                                className={styles.logo_image}
                                style={{ cursor: 'pointer' }}
                                onClick={handleLogoPreviewClick}
                            />
                        ) : (
                            // Show placeholder
                            <div className={styles.logo_placeholder}></div>
                        )}
                    </div>

                    <div className={styles.input_fileLogo}>
                        <input
                            type="file"
                            id="companyImageLogo"
                            accept="image/jpeg,image/png,image/gif"
                            style={{ display: 'none' }}
                            onChange={handleLogoImageChange}
                            ref={logoFileInputRef}
                        />
                        <FontAwesomeIcon
                            icon={faCamera}
                            onClick={handleLogoPreviewClick}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                </div>
            </section>

            {/* Thông báo */}
            <Notifications />

            {/* Thông tin tài khoản */}
            <section className={styles.infomation_company} data-aos="fade-up" data-aos-delay="100">
                <h2>Thông tin HR MEMBER</h2>
                <div className={styles.profile_container}>
                    <div className={styles.user_info} data-aos="fade-right" data-aos-delay="200">
                        <div className={styles.user_header}>
                            <span className={styles.company_name}>{recruitmentInfo?.company?.name || ''}</span>
                            <span className={styles.user_id}>Mã NTD: {recruitmentInfo?.recruitment_Id || ''}</span>
                            <span className={styles.user_rank}>Hạng khách hàng: MEMBER</span>
                            <span className={styles.icon_bar} onClick={() => router.push('/account/setting/HR_info')}>
                                <FontAwesomeIcon icon={faBars} />
                            </span>
                        </div>

                        <div className={styles.user_contact}>
                            <p>
                                <span>📧</span> {recruitmentInfo?.email_hr || ''}
                            </p>
                            <p>
                                <span>📞</span>0{recruitmentInfo?.company?.phoneNumber_company || ''}
                            </p>
                        </div>

                        <div className={styles.membership}>
                            <div className={styles.membership_levels}>
                                {['Member', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((level, i) => (
                                    <span key={level}>
                                        {level}
                                        <br />
                                        <p>{[0, 300, 800, 1500, 2500][i]}</p>
                                    </span>
                                ))}
                            </div>
                            <div className={styles.progress_bar}>
                                <div className={styles.progress} style={{ width: '83%' }}></div>
                            </div>
                        </div>

                        <div className={styles.points_section}>
                            <div className={styles.points_info}>
                                <span className={styles.points_label}>Điểm xét hạng</span>
                                <span className={styles.points_value}>0 TP</span>
                            </div>
                            <button className={styles.points_button}>Ưu đãi của tui</button>
                        </div>
                    </div>

                    <div className={styles.points_credits} data-aos="fade-left" data-aos-delay="200">
                        <div className={styles.top_points}>
                            <h4>Point</h4>
                            <p className={styles.top_points_message}>
                                Tổng tiền sử dụng dịch vụ:
                                <br />
                                <a href="#">20.000.000 vnđ</a>
                            </p>
                            <div className={styles.points_display}>
                                <span className={styles.points_icon}>🎁</span>
                                <span className={styles.points_value}>0 TP</span>
                                <button className={styles.points_action}>Đổi điểm</button>
                            </div>
                        </div>

                        <div className={styles.credits}>
                            <h4>Credit (CP)</h4>
                            <div className={styles.credit_types}>
                                <div className={styles.credit_type}>
                                    <span className={styles.credit_label}>Chính: </span>
                                    <span className={styles.credit_value}>20.000.000 Vnđ</span>
                                </div>
                                <div className={styles.credit_type}>
                                    <span className={styles.credit_label}>Sau chuyển đổi: </span>
                                    <span className={styles.credit_value}>20.000 Pts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Slider quảng cáo */}
            <section className={styles.slider_section} data-aos="fade-up" data-aos-delay="300">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    loop={true}
                    className={styles.swiper_container}
                >
                    {slides.map((slide, slideIndex) => (
                        <SwiperSlide key={`slide-${slideIndex}`}>
                            <div className={styles.slide_content} data-aos="zoom-in" data-aos-delay="400">
                                {slide.images.map((image, imgIndex) => (
                                    <div key={`image-${slideIndex}-${imgIndex}`} className={styles.swiper_image}>
                                        <img src={image} alt={`Banner ${imgIndex + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* Công cụ nhà tuyển dụng */}
            <section className={styles.Recruitment_examination} data-aos="fade-up" data-aos-delay="500">
                <h2>Khám phá công cụ dành cho nhà tuyển dụng</h2>
                <div className={styles.Recruitment_examination__container}>
                    {[
                        {
                            img: '/images/recruitment/svg/feeds.5fd6538.svg',
                            text: 'Đăng tin tuyển dụng',
                        },
                        {
                            img: '/images/recruitment/svg/search.804d5d1.svg',
                            text: 'Tìm CV',
                        },
                        {
                            img: '/images/recruitment/svg/services.8840538.svg',
                            text: 'Mua dịch vụ',
                        },
                    ].map((tool, index) => (
                        <div
                            key={index}
                            className={styles.Recruitment_examination__box}
                            data-aos="flip-left"
                            data-aos-delay={600 + index * 100}
                        >
                            <div className={styles.tool_image}>
                                <img src={tool.img} alt={tool.text} />
                            </div>
                            <div className={styles.content}>
                                <span>{tool.text}</span>
                                <button className={styles.btn_tryNow}>Thử ngay</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CV đề xuất */}
            <section className={styles.CV_recommendation} data-aos="fade-up" data-aos-delay="900">
                <h2>Đề xuất CV phù hợp công việc đang tuyển dụng</h2>
                <div className={styles.CV_recommendation__container}>
                    <div className={styles.CV_recommendation__banner} data-aos="fade-right" data-aos-delay="1000">
                        <img src="/images/recruitment/GPT.png" alt="AI CV Banner" />
                    </div>

                    <div className={styles.CV_recommendation__content} data-aos="fade-left" data-aos-delay="1000">
                        <h3>Kích hoạt CV đề xuất bởi AI để được:</h3>
                        <div className={styles.list_content}>
                            <span className={styles.content_item}>Gợi ý ứng viên tiềm năng</span>
                            <span className={styles.content_item}>Lọc sẵn các thông tin nổi bật</span>
                            <span className={styles.content_item}>Tự động sắp xếp theo điểm phù hợp</span>
                        </div>
                        <button className={styles.btn_buy_service}>Chức năng đang được phát triển ...</button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
