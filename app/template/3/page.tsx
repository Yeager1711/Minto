'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './3.module.css';

// Dữ liệu ảnh cho gallery
const galleryImages = [
    '/images/couple-1.jpg',
    '/images/couple-2.jpg',
    '/images/couple-3.jpg',
    '/images/couple-4.jpg',
    '/images/couple-5.jpg',
    '/images/couple-6.jpg',
    '/images/couple-7.jpg',
    '/images/couple-8.jpg',
    '/images/couple-9.jpg',
    '/images/couple-10.jpg',
];

export default function WeddingInvite() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const introRef = useRef(null);
    const galleryRef = useRef(null);
    const weddingInfoRef = useRef(null);
    const familyInfoRef = useRef(null); // Ref cho phần thông tin gia đình
    const finalSectionRef = useRef(null);

    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => new Set(prev).add(entry.target.id));
                    } else {
                        setVisibleSections((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(entry.target.id);
                            return newSet;
                        });
                    }
                });
            },
            { threshold: 0.2 }
        );

        const sections = [introRef, galleryRef, weddingInfoRef, familyInfoRef, finalSectionRef];
        sections.forEach((ref) => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            sections.forEach((ref) => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, []);

    useEffect(() => {
        const startSlideShow = () => {
            slideIntervalRef.current = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % galleryImages.length);
            }, 4000);
        };

        startSlideShow();

        return () => {
            if (slideIntervalRef.current) {
                clearInterval(slideIntervalRef.current);
            }
        };
    }, [galleryImages.length]);

    const handleDotClick = (index: number) => {
        setCurrentSlide(index);
        if (slideIntervalRef.current) {
            clearInterval(slideIntervalRef.current);
            slideIntervalRef.current = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % galleryImages.length);
            }, 4000);
        }
    };

    const isSectionVisible = (id: string) => visibleSections.has(id);

    return (
        <div className={styles.weddingContainer}>
            {/* Phần 1: Giới thiệu - Welcome */}
            <section
                id="intro"
                ref={introRef}
                className={`${styles.section} ${styles.introSection} ${isSectionVisible('intro') ? styles.visible : ''}`}
            >
                <div className={styles.introContent}>
                    <p className={styles.introText}>Trân trọng kính mời</p>
                    <h1 className={styles.coupleNames}>
                        <span className={styles.groomName}>Quang Minh</span>
                        <span className={styles.andSymbol}>&</span>
                        <span className={styles.brideName}>Thanh Mai</span>
                    </h1>
                    <p className={styles.invitePhrase}>Sẽ cùng nhau xây đắp hạnh phúc</p>
                    <p className={styles.date}>Thứ Bảy, Ngày 25 tháng 12 năm 2025</p>
                </div>
                <div className={styles.decorativeBg}></div>
            </section>

            {/* Phần 2: Thư viện ảnh - Our Story */}
            <section
                id="gallery"
                ref={galleryRef}
                className={`${styles.section} ${styles.gallerySection} ${isSectionVisible('gallery') ? styles.visible : ''}`}
            >
                <h2 className={styles.sectionTitle}>Khoảnh Khắc Của Chúng Ta</h2>
                <div className={styles.gallerySlider}>
                    <div className={styles.sliderInner} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {galleryImages.map((src, index) => (
                            <div key={index} className={styles.slideItem}>
                                <Image
                                    src={src}
                                    alt={`Ảnh cưới ${index + 1}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className={styles.slideImage}
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.sliderDots}>
                        {galleryImages.map((_, index) => (
                            <span
                                key={index}
                                className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
                                onClick={() => handleDotClick(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Phần 3: Thông tin Đám cưới Chính */}
            <section
                id="wedding-info"
                ref={weddingInfoRef}
                className={`${styles.section} ${styles.weddingInfoSection} ${isSectionVisible('wedding-info') ? styles.visible : ''}`}
            >
                <h2 className={styles.sectionTitle}>Thông Tin Chi Tiết</h2>
                <div className={styles.weddingDetails}>
                    <div className={styles.detailBlock}>
                        <h3 className={styles.detailTitle}>Lễ Thành Hôn & Tiệc Cưới Nhà Trai</h3>
                        <p>Thời gian: 10:00 AM - 01:00 PM, Ngày 25/12/2025</p>
                        <p>Địa điểm: Trung tâm Hội nghị ABC, 123 Đường XYZ, Quận 1, TP.HCM</p>
                        <a
                            href="https://maps.app.goo.gl/YourGroomMapLink"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mapButton}
                        >
                            Xem Bản Đồ
                        </a>
                    </div>
                    <div className={styles.detailBlock}>
                        <h3 className={styles.detailTitle}>Tiệc Cưới Nhà Gái</h3>
                        <p>Thời gian: 06:00 PM - 09:00 PM, Ngày 25/12/2025</p>
                        <p>Địa điểm: Nhà hàng Royal Palace, 456 Đường ABC, Quận 3, TP.HCM</p>
                        <a
                            href="https://maps.app.goo.gl/YourBrideMapLink"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mapButton}
                        >
                            Xem Bản Đồ
                        </a>
                    </div>
                </div>
            </section>

            {/* Phần 4: Thông tin Gia đình */}
            <section
                id="family-info"
                ref={familyInfoRef}
                className={`${styles.section} ${styles.familySection} ${isSectionVisible('family-info') ? styles.visible : ''}`}
            >
                <h2 className={styles.sectionTitle}>Gia Đình</h2>
                <div className={styles.familyInfoGrid}>
                    <div className={styles.familyBlock}>
                        <h3>Gia Đình Nhà Trai</h3>
                        <p>Ông: **Nguyễn Văn A**</p>
                        <p>Bà: **Trần Thị B**</p>
                        <p className={styles.address}>Tại tư gia: 789 Đường CDE, Quận 5, TP.HCM</p>
                    </div>
                    <div className={styles.familyBlock}>
                        <h3>Gia Đình Nhà Gái</h3>
                        <p>Ông: **Lê Văn C**</p>
                        <p>Bà: **Phạm Thị D**</p>
                        <p className={styles.address}>Tại tư gia: 101 Đường FGH, Quận 7, TP.HCM</p>
                    </div>
                </div>
            </section>

            {/* Phần 5: Lời cảm ơn */}
            <section
                id="final-section"
                ref={finalSectionRef}
                className={`${styles.section} ${styles.finalSection} ${isSectionVisible('final-section') ? styles.visible : ''}`}
            >
                <h2 className={styles.sectionTitle}>Sự Hiện Diện Của Bạn Là Niềm Hạnh Phúc Lớn Lao Của Chúng Tôi</h2>
                <p className={styles.thankYouText}>Xin chân thành cảm ơn!</p>
                <p className={styles.signature}>Quang Minh & Thanh Mai</p>
            </section>
        </div>
    );
}
