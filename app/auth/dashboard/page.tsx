'use client';

import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faImage, faCamera, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useRouter } from 'next/navigation';
import { useApi } from 'app/lib/apiConentext/ApiContext';
import styles from './dashboard.module.scss';

import { RecruitmentInfo } from 'app/interface/Recruitment';
import { showToastError, showToastSuccess } from 'app/Ultils/toast';

// import layout
import Notifications from './notifications/page';
import Job_Product from './job_product/page';

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL || 'http://localhost:5000';

function Dashboard() {
    const router = useRouter();
    const { fetchCompanyJobs, updateBannerBackground, updateCompanyLogo, fetchRecruitmentID } = useApi();
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

        const loadCompanyJobs = async () => {
            try {
                setLoading(true);
                // Lấy companyId từ fetchRecruitmentID
                const companyIdByfetchRecruitmentID = await fetchRecruitmentID();
                const companyId = companyIdByfetchRecruitmentID.company.companyId;
                const data = await fetchCompanyJobs(Number(companyId));
                setRecruitmentInfo(data);
                // Set initial banner preview
                const savedBanner = data.company?.images?.[0]?.banner_BackgroundImage_company;
                if (savedBanner) {
                    setPreviewBannerImage(`${apiUrl}${savedBanner}`);
                }
                // Set initial logo preview
                const savedLogo = data.company?.images?.[0]?.image_company;
                if (savedLogo) {
                    setPreviewLogoImage(`${apiUrl}${savedLogo}`);
                }
            } catch (err) {
                console.error('Error loading company jobs:', err);
                setError('Không thể tải thông tin công ty và công việc');
            } finally {
                setLoading(false);
            }
        };

        loadCompanyJobs();
    }, [fetchCompanyJobs]);

    // Handle banner image selection and upload
    const handleBannerImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const previousBanner = previewBannerImage;
            if (previewBannerImage && previewBannerImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewBannerImage);
            }
            const imageUrl = URL.createObjectURL(file);
            setPreviewBannerImage(imageUrl);

            try {
                const savedBannerUrl = await updateBannerBackground(file);
                setRecruitmentInfo((prev) => {
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
                setPreviewBannerImage(`${apiUrl}${savedBannerUrl}`);
                showToastSuccess(`Ảnh nền Công ty ${recruitmentInfo?.company?.name || ''} đã được cập nhật thành công`);
            } catch (error) {
                console.error('Failed to upload banner:', error);
                setPreviewBannerImage(previousBanner);
                showToastError('Lỗi cập nhật ảnh nền');
            }
        }
    };

    // Handle logo image selection and upload
    const handleLogoImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (previewLogoImage && previewLogoImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewLogoImage);
            }
            const imageUrl = URL.createObjectURL(file);
            setPreviewLogoImage(imageUrl);

            try {
                const savedLogoUrl = await updateCompanyLogo(file);
                setRecruitmentInfo((prev) => {
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
                setPreviewLogoImage(`${apiUrl}${savedLogoUrl}`);
                if (logoFileInputRef.current) {
                    logoFileInputRef.current.value = '';
                }
                showToastSuccess(`Logo Công ty "${recruitmentInfo?.company?.name || ''}" cập nhật thành công`);
            } catch (error) {
                console.error('Failed to upload logo:', error);
                setPreviewLogoImage(
                    recruitmentInfo?.company?.images?.[0]?.image_company
                        ? `${apiUrl}${recruitmentInfo.company.images[0].image_company}`
                        : null
                );
                showToastError('Lỗi cập nhật logo');
            }
        }
    };

    // Clean up preview URLs
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
                    {previewBannerImage ? (
                        <img
                            src={previewBannerImage}
                            alt="Selected company background"
                            className={styles.preview_image}
                            onClick={handleBannerPreviewClick}
                            style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <label htmlFor="companyImage" className={styles.select_image_label}>
                            <FontAwesomeIcon icon={faImage} /> Chọn ảnh nền công ty
                        </label>
                    )}
                </div>

                <div className={styles.company_Name__title}>
                    <h3 className={styles.company_name}>{recruitmentInfo?.company?.name || ''}</h3>
                    <span className={styles.industry}>
                        Lĩnh vực: {recruitmentInfo?.company?.companyIndustries?.[0]?.name || 'Chưa xác định'}
                    </span>
                </div>

                <div className={styles.choose_image__logoCompany}>
                    <div className={styles.logoCompany_preview}>
                        {previewLogoImage ? (
                            <img
                                src={previewLogoImage}
                                alt="Logo Preview"
                                className={styles.logo_image}
                                style={{ cursor: 'pointer' }}
                                onClick={handleLogoPreviewClick}
                            />
                        ) : (
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

            <section className={styles.verified_statuses}>
                <span className={styles.text_title}>
                    Hãy thực hiện các bước sau để gia tăng tính bảo mật cho tài khoản của bạn
                </span>
                <div className={styles.verified_statuses__containers}>
                    <div className={styles.verified_box}>
                        <span>Xác thực Email</span>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>

                    <div className={styles.verified_box}>
                        <span>Cập nhật thông tin công ty</span>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </div>

                    <div className={styles.verified_box}>
                        <span>Cập nhật Giấy đăng ký doanh nghiệp</span>
                        <FontAwesomeIcon icon={faChevronRight} />
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
                            href: '/auth/PostJob',
                        },
                        { img: '/images/recruitment/svg/search.804d5d1.svg', text: 'Tìm CV' },
                        { img: '/images/recruitment/svg/services.8840538.svg', text: 'Mua dịch vụ' },
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
                                <button className={styles.btn_tryNow} onClick={() => router.push(`${tool.href}`)}>
                                    Thử ngay
                                </button>
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

            {/* Danh sách công việc */}
            <section className={styles.all_jobPosted}>
                <h2>Danh sách các công việc đã đăng tuyển dụng</h2>

                <Job_Product jobs={recruitmentInfo?.jobs || []} company={recruitmentInfo?.company || null} />
            </section>
        </div>
    );
}

export default Dashboard;
