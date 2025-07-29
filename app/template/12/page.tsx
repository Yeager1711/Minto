'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './12.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faChevronCircleDown,
    faChevronDown,
    faChevronUp,
    faCheckCircle,
    faImage,
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Định nghĩa interface cho dữ liệu tiến trình
interface ProgressItem {
    maxImages: number;
    currentImages: number;
}

// Định nghĩa interface cho danh sách ảnh
interface ImageState {
    bar0: string[];
    bar1: string[];
    groomImages: string[]; // Ảnh của chú rể
    brideImages: string[]; // Ảnh của cô dâu
    bar4: string[];
}

// Định nghĩa type cho keys của ImageState
type ImageSection = 'bar0' | 'bar1' | 'groomImages' | 'brideImages' | 'bar4';

// Component chính
const Template12Edit: React.FC = () => {
    const [expandedBar, setExpandedBar] = useState<number>(0);
    const [showBrideStory, setShowBrideStory] = useState<boolean>(false);
    const [showContent, setShowContent] = useState<boolean>(true);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [isCollapsing, setIsCollapsing] = useState<boolean>(false);
    const [images, setImages] = useState<ImageState>({
        bar0: ['/images/m12/choose_img.png', '/images/m12/choose_img.png'], // 2 ảnh
        bar1: ['/images/m12/choose_img.png'], // 1 ảnh
        groomImages: ['/images/m12/choose_img.png'], // 1 ảnh cho chú rể
        brideImages: ['/images/m12/choose_img.png'], // 1 ảnh cho cô dâu
        bar4: [
            '/images/m12/choose_img.png',
            '/images/m12/choose_img.png',
            '/images/m12/choose_img.png',
            '/images/m12/choose_img.png',
            '/images/m12/choose_img.png',
            '/images/m12/choose_img.png',
            '/images/m12/choose_img.png',
        ], // 7 ảnh
    });
    const [progressData, setProgressData] = useState<ProgressItem[]>([
        { maxImages: 2, currentImages: 0 }, // expandedBar === 0
        { maxImages: 1, currentImages: 0 }, // expandedBar === 1
        { maxImages: 0, currentImages: 0 }, // expandedBar === 2
        { maxImages: 2, currentImages: 0 }, // expandedBar === 3 (1 ảnh chú rể + 1 ảnh cô dâu)
        { maxImages: 7, currentImages: 0 }, // expandedBar === 4
        { maxImages: 0, currentImages: 0 }, // expandedBar === 5
    ]);
    const [previewImage, setPreviewImage] = useState<string | null>(null); // State cho ảnh preview

    // Ref cho input file
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentSection, setCurrentSection] = useState<ImageSection>('bar0');
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    // URL bản đồ
    const groomMapUrl: string =
        'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.351619823762!2d144.9575123!3d-37.8242139!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5173a284b5%3A0x958eeaf04deea384!2sMelbourne%20Convention%20and%20Exhibition%20Centre%20(MCEC)!5e1!3m2!1svi!2s!4v1753622568092!5m2!1svi!2s';
    const brideMapUrl: string =
        'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3738.351619823762!2d144.9575123!3d-37.8242139!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d53038e461d%3A0xfb83b485c5048192!2sThe%20Palms%20at%20Crown!5e1!3m2!1svi!2s!4v1753622592843!5m2!1svi!2s';

    // Kiểm tra xem section có hoàn thành đầy đủ ảnh không
    const isSectionComplete = (section: ImageSection): boolean => {
        if (section === 'groomImages' || section === 'brideImages') {
            const groomComplete = images.groomImages[0] !== '/images/m12/choose_img.png';
            const brideComplete = images.brideImages[0] !== '/images/m12/choose_img.png';
            return groomComplete && brideComplete; // Cả hai ảnh phải được chọn
        }
        const sectionIndex = parseInt(section.replace('bar', ''));
        return progressData[sectionIndex].currentImages === progressData[sectionIndex].maxImages;
    };

    // Tính phần trăm hoàn thành cho mỗi expandedBar
    const calculateProgress = (): number[] => {
        return progressData.map((data, index) => {
            if (data.maxImages === 0) return 100;
            if (index === 3) {
                let completedImages = 0;
                if (images.groomImages[0] !== '/images/m12/choose_img.png') completedImages++;
                if (images.brideImages[0] !== '/images/m12/choose_img.png') completedImages++;
                return Math.min((completedImages / data.maxImages) * 100, 100);
            }
            return Math.min((data.currentImages / data.maxImages) * 100, 100);
        });
    };

    // Tính tổng phần trăm hoàn thành
    const totalProgress = (): number => {
        const progress = calculateProgress();
        const validSections = progress.filter((_, index) => progressData[index].maxImages > 0);
        return validSections.length > 0
            ? Math.round(validSections.reduce((sum, curr) => sum + curr, 0) / validSections.length)
            : 100;
    };

    // Xử lý chọn ảnh
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, section: ImageSection, index: number): void => {
        e.stopPropagation();
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl); // Hiển thị preview ảnh
            setTimeout(() => {
                setImages((prev: ImageState) => ({
                    ...prev,
                    [section]: prev[section].map((currentImg, i) => (i === index ? imageUrl : currentImg)),
                }));
                setProgressData((prev: ProgressItem[]) =>
                    prev.map((data, i) =>
                        i ===
                            (section === 'groomImages' || section === 'brideImages'
                                ? 3
                                : parseInt(section.replace('bar', ''))) && data.currentImages < data.maxImages
                            ? {
                                  ...data,
                                  currentImages:
                                      data.currentImages +
                                      (images[section][index] === '/images/m12/choose_img.png' ? 1 : 0),
                              }
                            : data
                    )
                );
                toast.success('Ảnh đã được chọn thành công!');
                setPreviewImage(null); // Ẩn preview sau khi cập nhật
            }, 2000); // Preview trong 2 giây
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input file
        }
    };

    // Mở input file
    const openFileInput = (section: ImageSection, index: number): void => {
        setCurrentSection(section);
        setCurrentImageIndex(index);
        fileInputRef.current?.click();
    };

    // Xử lý click màn hình
    const handleScreenClick = (): void => {
        if (isCollapsing) return;

        // Kiểm tra xem section hiện tại có hoàn thành không
        const currentSectionKey =
            expandedBar === 3
                ? showBrideStory
                    ? 'brideImages'
                    : 'groomImages'
                : (`bar${expandedBar}` as ImageSection);
        if (progressData[expandedBar].maxImages > 0 && !isSectionComplete(currentSectionKey)) {
            toast.warn('Vui lòng chọn đủ ảnh cho cả chú rể và cô dâu trước khi chuyển sang phần tiếp theo!');
            return;
        }

        setIsCollapsing(true);
        setShowContent(false);

        setTimeout(() => {
            setIsCollapsing(false);
            setShowContent(true);
            setExpandedBar((prev) => {
                switch (prev) {
                    case 0:
                        return 1;
                    case 1:
                        return 2;
                    case 2:
                        return 3;
                    case 3:
                        return 4;
                    case 4:
                        return 5;
                    default:
                        return 0;
                }
            });
            setShowMap(false);
        }, 500);
    };

    // Xử lý toggle câu chuyện
    const handleStoryToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setShowContent(false);
        setShowBrideStory((prev) => !prev);
        setTimeout(() => setShowContent(true), 50);
        setShowMap(false);
    };

    // Xử lý toggle bản đồ
    const handleMapToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setShowMap((prev) => !prev);
    };

    // Xử lý touch start
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
        e.stopPropagation();
    };

    // Khởi tạo AOS và quản lý body style
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100,
        });

        if (expandedBar !== null) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
            AOS.refresh();
        }

        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
            Object.values(images)
                .flat()
                .forEach((url) => {
                    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
                });
        };
    }, [expandedBar, images]);

    // Style cho hiệu ứng slide
    const slideStyle: React.CSSProperties = {
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateX(0)' : showBrideStory ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
    };

    return (
        <div className={styles.template11} onClick={handleScreenClick}>
            <ToastContainer position="top-right" autoClose={3000} />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => handleImageSelect(e, currentSection, currentImageIndex)}
            />
            <div className={styles.wrapper}>
                {/* Preview ảnh */}
                {previewImage && (
                    <div className={styles.preview_container}>
                        <img src={previewImage} alt="Preview" className={styles.preview_image} />
                        <p>Đang xem trước ảnh...</p>
                    </div>
                )}

                {expandedBar === 0 && showContent && (
                    <div className={`${styles.wrapper_imageMain} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.image_top}>
                            <img
                                src={images.bar0[0]}
                                alt="Top Image"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFileInput('bar0', 0);
                                }}
                                className={styles.image_selectable}
                            />
                            <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                        </div>
                        <div className={styles.image_bottom}>
                            <img
                                src={images.bar0[1]}
                                alt="Bottom Image"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openFileInput('bar0', 1);
                                }}
                                className={styles.image_selectable}
                            />
                            <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                        </div>
                        <div className={styles.infomation}>
                            <h3>Hoàng Phúc</h3>
                            <h3>Diễm Quỳnh</h3>
                            <span>24.09.2025</span>
                        </div>
                    </div>
                )}

                {expandedBar === 1 && showContent && (
                    <div
                        className={`${styles.weddingInfo} ${isCollapsing ? styles.collapse : styles.expand}`}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.wrapper_bar1}>
                            <div className={styles.step_1}>
                                <div className={styles.image_1} data-aos="fade-down">
                                    <img
                                        src={images.bar1[0]}
                                        alt="Wedding"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openFileInput('bar1', 0);
                                        }}
                                        className={styles.image_selectable}
                                    />
                                    <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                                </div>
                                <div className={styles.al}>
                                    <div className={styles.dayWedding} data-aos="fade-up" data-aos-delay="200">
                                        <h1>24 | 09</h1>
                                        <h1>2025</h1>
                                    </div>
                                    <div className={styles.text}>
                                        join us to celebrate
                                        <h3>the Wedding of</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 2 && showContent && (
                    <div
                        className={`${styles.familyInfo} ${isCollapsing ? styles.collapse : styles.expand}`}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.wrapper_bar2}>
                            <h2 data-aos="fade-down">Our Families</h2>
                            <div className={styles.familyContainer}>
                                <h1>
                                    Trân Trọng kính mời đến dự buổi tiệc
                                    <br />
                                    Chung vui cùng gia đình chúng tôi
                                </h1>
                                <div className={styles.familySide}>
                                    <h3>Groom&apos;s Family</h3>
                                    <span>Ông Nguyễn Văn A</span>
                                    <span>Bà: Trần Thị B</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                                <div className={styles.familySide}>
                                    <h3>Bride&apos;s Family</h3>
                                    <span>Ông: Lê Văn C</span>
                                    <span>Bà: Phạm Thị D</span>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} /> Address: 123 Hanoi Street, Hanoi
                                    </p>
                                </div>
                                <h1>
                                    Vào lúc: <strong>18:00 || Ngày 24 tháng 09, 2025</strong>
                                    <br />
                                    <p>
                                        (Nhằm ngày <strong>03</strong> tháng <strong>09</strong> năm Ất Tỵ)
                                    </p>
                                    Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi.
                                </h1>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 3 && showContent && (
                    <div
                        key={`story-${showBrideStory ? 'bride' : 'groom'}`}
                        className={`${styles.wrapper_bar3} ${isCollapsing ? styles.collapse : styles.expand}`}
                        style={slideStyle}
                        onTouchStart={handleTouchStart}
                    >
                        <div className={styles.btn_map} onClick={handleMapToggle}>
                            <FontAwesomeIcon icon={showMap ? faChevronUp : faChevronDown} />
                        </div>
                        <div className={`${styles.mapContainer} ${showMap ? styles.show : styles.hide}`}>
                            <iframe
                                src={showBrideStory ? brideMapUrl : groomMapUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        <div className={styles.step_3}>
                            <div className={styles.image_container} data-aos="fade-down">
                                <div className={styles.image_3}>
                                    <img
                                        src={showBrideStory ? images.brideImages[0] : images.groomImages[0]}
                                        alt={showBrideStory ? 'Bride Image 1' : 'Groom Image 1'}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openFileInput(showBrideStory ? 'brideImages' : 'groomImages', 0);
                                        }}
                                        className={styles.image_selectable}
                                    />
                                    <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                                </div>
                            </div>
                            <div className={showBrideStory ? styles.brideName : styles.groomName}>
                                <h1 data-aos="fade-up" data-aos-delay="200">
                                    {showBrideStory ? 'Diễm Quỳnh' : 'Hoàng Phúc'}
                                </h1>
                                <div
                                    className={`${styles.change_story__button} ${showBrideStory ? styles.bride : styles.groom}`}
                                    onClick={handleStoryToggle}
                                >
                                    <FontAwesomeIcon icon={faChevronCircleDown} />
                                </div>
                            </div>
                            <div className={styles.text_story}>
                                <p>
                                    {showBrideStory
                                        ? 'Em – một cô gái cảm thấy thật may mắn khi gặp được anh. Cảm ơn anh luôn quan tâm, chăm sóc em thật nhiều, nuông chiều những khi em giận hờn vô cớ. Bắt đầu từ hôm nay chúng ta sẽ viết nên một chương mới của cuộc đời, bằng tình thương yêu và hạnh phúc đong đầy anh nhé!'
                                        : 'Hạnh phúc nhất trên đời không phải là việc gặp được người tuyệt nhất ở những tháng ngày đẹp nhất. Mà là một người sẽ từ từ nhìn mình già đi, không cần ở những năm tháng đẹp nhất, mà là đúng người, đúng thời điểm, nắm tay nhau cùng đi. Anh rất hạnh phúc vì gặp được em – người con gái cho anh biết thế nào là tình yêu, cùng anh về nhà em nhé!'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {expandedBar === 4 && showContent && (
                    <div className={`${styles.album_wedding} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.title}>Album Wedding</div>
                        <div className={styles.bento_grid}>
                            {images.bar4.map((img, index) => (
                                <div
                                    key={index}
                                    className={
                                        index < 3 || index === 5
                                            ? styles.boxTall
                                            : index === 4
                                              ? styles.box
                                              : styles.boxWide
                                    }
                                >
                                    <img
                                        src={img}
                                        alt={`Album Image ${index + 1}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openFileInput('bar4', index);
                                        }}
                                        className={styles.image_selectable}
                                    />
                                    <FontAwesomeIcon icon={faImage} className={styles.image_icon} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {expandedBar === 5 && showContent && (
                    <div className={`${styles.footer} ${isCollapsing ? styles.collapse : styles.expand}`}>
                        <div className={styles.column_text}>
                            <h3>Thank You</h3>
                            <span className={styles.subtext}>
                                Cảm ơn Quý Khách vì đã trở thành một phần quan trọng
                                <br />
                                trong ngày đặc biệt của chúng tôi.
                            </span>
                        </div>
                    </div>
                )}

                {/* Thanh tiến trình */}
                <div className={styles.progress_bar}>
                    <div className={styles.progress_container}>
                        <div className={styles.progress_fill} style={{ width: `${totalProgress()}%` }} />
                    </div>
                    <div className={styles.progress_steps}>
                        {progressData.map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.step} ${
                                    calculateProgress()[index] === 100 ? styles.completed : ''
                                } ${expandedBar === index ? styles.active : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsCollapsing(true);
                                    setShowContent(false);
                                    setTimeout(() => {
                                        setExpandedBar(index);
                                        setIsCollapsing(false);
                                        setShowContent(true);
                                        setShowMap(false);
                                    }, 500);
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className={calculateProgress()[index] === 100 ? styles.checked : styles.unchecked}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Template12Edit;
