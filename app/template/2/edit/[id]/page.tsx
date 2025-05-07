'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import styles from './mau_2.module.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCirclePlay, faCirclePause } from '@fortawesome/free-solid-svg-icons';
import EditControls from '../../../control/EditControl'; // Updated import path
import { formatTime } from 'app/Ultils/formatTime';
import Image from 'next/image';
import { Suspense } from 'react';

interface Template2WeddingData {
    bride: string;
    groom: string;
    weddingDate: string;
    weddingTime: string;
    weddingDayOfWeek: string;
    familyGroom: { father: string; mother: string };
    familyBride: { father: string; mother: string };
    brideStory: string;
    groomStory: string;
    groomAddress: string;
    brideAddress: string;
    groomMapUrl: string;
    brideMapUrl: string;
}

interface Images {
    mainImage: string;
    thumbnail1: string;
    thumbnail2: string;
    thumbnail3: string;
    thumbnail4: string;
    storyImage1: string;
    storyImage2: string;
    brideImage: string;
    groomImage: string;
    galleryImage1: string;
    galleryImage2: string;
    galleryImage3: string;
    galleryImage4: string;
}

function Template2Edit() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showInviteePopup, setShowInviteePopup] = useState(false);
    const quantity = parseInt(searchParams.get('quantity') || '1');
    const totalPrice = parseInt(searchParams.get('totalPrice') || '0');

    console.log('Prop ID:', id);

    // Load initial data from localStorage or set default
    const [weddingData, setWeddingData] = useState<Template2WeddingData>(() => {
        const savedData = localStorage.getItem('weddingData');
        return savedData
            ? JSON.parse(savedData)
            : {
                  bride: 'Hải Vân',
                  groom: 'Kim Thành',
                  weddingDate: '17/11/2025',
                  weddingTime: '00:00',
                  weddingDayOfWeek: 'Thứ 2',
                  familyGroom: { father: 'Nguyễn Văn A', mother: 'Trần Thị B' },
                  familyBride: { father: 'Lê Văn C', mother: 'Phạm Thị D' },
                  brideStory: '',
                  groomStory: '',
                  groomAddress: 'PJ3X+GH8, KDC 13E, Đô thị mới Nam Thành Phố, Ấp 5, Bình Chánh, Hồ Chí Minh, Việt Nam',
                  brideAddress: 'PJ3X+GH8, KDC 13E, Đô thị mới Nam Thành Phố, Ấp 5, Bình Chánh, Hồ Chí Minh, Việt Nam',
                  groomMapUrl:
                      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4650.377567444314!2d106.64545227570262!3d10.703125960540111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175311ad90bd4bb%3A0xf92c25e13e35ed88!2sChung%20c%C6%B0%20Saigon%20Intela!5e1!3m2!1svi!2s!4v1746350188243!5m2!1svi!2s',
                  brideMapUrl:
                      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4650.377567444314!2d106.64545227570262!3d10.703125960540111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175311ad90bd4bb%3A0xf92c25e13e35ed88!2sChung%20c%C6%B0%20Saigon%20Intela!5e1!3m2!1svi!2s!4v1746350188243!5m2!1svi!2s',
              };
    });

    const [images, setImages] = useState<Images>(() => {
        const savedImages = localStorage.getItem('weddingImages');
        return savedImages
            ? JSON.parse(savedImages)
            : {
                  mainImage: '/images/m2/8.jpg',
                  thumbnail1: '/images/m2/2.jpg',
                  thumbnail2: '/images/m2/3.jpg',
                  thumbnail3: '/images/m2/5.jpg',
                  thumbnail4: '/images/m2/6.jpg',
                  storyImage1: '/images/m2/1.jpg',
                  storyImage2: '/images/m2/2.jpg',
                  brideImage: '/images/m2/3.jpg',
                  groomImage: '/images/m2/4.jpg',
                  galleryImage1: '/images/m2/6.jpg',
                  galleryImage2: '/images/m2/7.jpg',
                  galleryImage3: '/images/m2/9.jpg',
                  galleryImage4: '/images/m2/10.jpg',
              };
    });

    const fileInputRefs = {
        mainImage: useRef<HTMLInputElement>(null),
        thumbnail1: useRef<HTMLInputElement>(null),
        thumbnail2: useRef<HTMLInputElement>(null),
        thumbnail3: useRef<HTMLInputElement>(null),
        thumbnail4: useRef<HTMLInputElement>(null),
        storyImage1: useRef<HTMLInputElement>(null),
        storyImage2: useRef<HTMLInputElement>(null),
        brideImage: useRef<HTMLInputElement>(null),
        groomImage: useRef<HTMLInputElement>(null),
        galleryImage1: useRef<HTMLInputElement>(null),
        galleryImage2: useRef<HTMLInputElement>(null),
        galleryImage3: useRef<HTMLInputElement>(null),
        galleryImage4: useRef<HTMLInputElement>(null),
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleImageChange = (key: keyof Images) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages((prev: Images) => {
                    const newImages = { ...prev, [key]: reader.result as string };
                    localStorage.setItem('weddingImages', JSON.stringify(newImages));
                    return newImages;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = (key: keyof typeof fileInputRefs) => fileInputRefs[key].current?.click();

    useEffect(() => {
        const handleScroll = () => isExpanded && setIsExpanded(false);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isExpanded]);

    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    const handleSaveEdit = (updatedData: Template2WeddingData) => {
        const newData = { ...weddingData, ...updatedData };
        setWeddingData(newData);
        localStorage.setItem('weddingData', JSON.stringify(newData));
        setShowEditPopup(false);
    };

    const handleInviteePopupClose = () => setShowInviteePopup(false);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={styles.mau_2_container}>
                <div className={`${styles.dynamic} ${isExpanded ? styles.expanded : ''}`} onClick={toggleExpand}>
                    <div className={styles.dynamic_content}>
                        <div
                            className={styles.controls}
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlayPause();
                            }}
                        >
                            <FontAwesomeIcon
                                icon={isPlaying ? faCirclePause : faCirclePlay}
                                className={styles.playPauseIcon}
                            />
                        </div>
                        <h3>{isPlaying ? 'Đang phát: Bài này không để đi diễn' : 'Bài này không để đi diễn'}</h3>
                    </div>
                    {isExpanded && (
                        <div className={styles.expanded_content}>
                            <div className={styles.album_art}>
                                <Image src={images.mainImage} alt="Album Art" width={300} height={300} />
                            </div>
                            <div className={styles.song_info}>
                                <h4>Bài này không để đi diễn</h4>
                                <p>Anh Tu Atus x DieuNhiOfficial Wedding</p>
                            </div>
                            <div className={styles.progress_bar}>
                                <div className={styles.progress}></div>
                            </div>
                        </div>
                    )}
                    <audio ref={audioRef} src="/audio/song.mp3" />
                </div>

                <div className={styles.mau_2}>
                    <div className={styles.mau_2__wrapper}>
                        <div className={styles.page_2}>
                            <Image src="/images/m2/page2.png" alt="" width={600} height={800} />
                        </div>
                        <div className={styles.image_mau2}>
                            <Image src={images.mainImage} alt="" width={600} height={400} />
                            <div
                                className={styles.Save_the_date}
                                data-aos="fade-right"
                                data-aos-delay="400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    triggerFileInput('mainImage');
                                }}
                            >
                                <span className={styles.save}>Save</span>
                                <span className={styles.the}>The</span>
                                <span className={styles.date}>Date</span>
                                <span className={styles.time}>{weddingData.weddingDate}</span>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRefs.mainImage}
                                onChange={handleImageChange('mainImage')}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div className={styles.bride_groom} data-aos="fade-up" data-aos-delay="600">
                                <h3>{weddingData.groom}</h3>
                                <span>&</span>
                                <h3>{weddingData.bride}</h3>
                            </div>
                            <div className={styles.thumnails}>
                                <Image
                                    src={images.thumbnail1}
                                    alt=""
                                    width={150}
                                    height={150}
                                    className={styles.thumnailImages_1}
                                    data-aos="fade-up"
                                    data-aos-delay="200"
                                    onClick={() => triggerFileInput('thumbnail1')}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.thumbnail1}
                                    onChange={handleImageChange('thumbnail1')}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <Image
                                    src={images.thumbnail2}
                                    alt=""
                                    width={150}
                                    height={150}
                                    className={styles.thumnailImages_2}
                                    data-aos="fade-right"
                                    data-aos-delay="600"
                                    onClick={() => triggerFileInput('thumbnail2')}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.thumbnail2}
                                    onChange={handleImageChange('thumbnail2')}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <Image
                                    src={images.thumbnail3}
                                    alt=""
                                    width={150}
                                    height={150}
                                    className={styles.thumnailImages_3}
                                    data-aos="fade-left"
                                    data-aos-delay="600"
                                    onClick={() => triggerFileInput('thumbnail3')}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.thumbnail3}
                                    onChange={handleImageChange('thumbnail3')}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <Image
                                    src={images.thumbnail4}
                                    alt=""
                                    width={150}
                                    height={150}
                                    className={styles.thumnailImages_4}
                                    data-aos="fade-up"
                                    data-aos-delay="800"
                                    onClick={() => triggerFileInput('thumbnail4')}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRefs.thumbnail4}
                                    onChange={handleImageChange('thumbnail4')}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.torn_page}>
                        <Image src="/images/m2/page.png" alt="" width={600} height={800} />
                    </div>
                    <div className={styles.story} data-aos="fade-up" data-aos-delay="200">
                        <div className={styles.Timing_Hook}>
                            <Image src="/images/m2/tape.png" alt="" className={styles.tape} width={100} height={100} />
                            <div className={styles.Timing_Hook__content} data-aos="fade-right" data-aos-delay="400">
                                <h3>Chuyện</h3>
                                <h4>
                                    <span>Của</span> Chúng mình
                                </h4>
                                <p>2020 - 2025</p>
                            </div>
                        </div>
                        <div className={styles.content_story}>
                            <div className={styles.header_content}>
                                <div className={styles.left} data-aos="fade-right" data-aos-delay="600">
                                    <Image
                                        src={images.storyImage1}
                                        alt=""
                                        width={200}
                                        height={200}
                                        onClick={() => triggerFileInput('storyImage1')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.storyImage1}
                                        onChange={handleImageChange('storyImage1')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className={styles.right} data-aos="fade-left" data-aos-delay="800">
                                    <span>
                                        Trong một thị trấn nhỏ dọc bờ biển, {weddingData.groom} – chàng họa sĩ trẻ, tình
                                        cờ gặp {weddingData.bride} – cô gái bán sách cũ, khi cô đánh rơi một quyển sách
                                        trên con dốc gió lộng. Anh nhặt lên, trao lại, và họ nhìn nhau
                                    </span>
                                </div>
                            </div>
                            <div className={styles.footer_content}>
                                <div className={styles.left} data-aos="fade-right" data-aos-delay="1000">
                                    <span>
                                        Tình yêu giữa {weddingData.groom} và {weddingData.bride} bắt đầu bằng một bản
                                        nhạc cũ vang lên trong quán cà phê ven biển. Cô ngồi ở góc quán, lặng lẽ đọc
                                        sách, còn anh vừa bước vào đã sững người khi nghe giai điệu quen thuộc – bài hát
                                        mẹ anh thường bật những ngày mưa.
                                    </span>
                                </div>
                                <div className={styles.right} data-aos="fade-left" data-aos-delay="1200">
                                    <Image
                                        src={images.storyImage2}
                                        alt=""
                                        width={200}
                                        height={200}
                                        onClick={() => triggerFileInput('storyImage2')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.storyImage2}
                                        onChange={handleImageChange('storyImage2')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.story_bride}>
                        <div className={styles.story_bride_wrapper}>
                            <div className={styles.story_bride__content} data-aos="zoom-in" data-aos-delay="400">
                                <div className={styles.left}>
                                    <h3>Chuyện</h3>
                                    <h4>
                                        <span>Của</span> Cô Dâu
                                    </h4>
                                </div>
                                <div className={styles.right}>
                                    <h2>{weddingData.bride}</h2>
                                </div>
                            </div>

                            <div className={styles.content} data-aos="fade-up" data-aos-delay="800">
                                <span>{weddingData.brideStory}</span>

                                <div className={styles.img_story__bride} data-aos="fade-left" data-aos-delay="600">
                                    <Image
                                        src={images.brideImage}
                                        alt=""
                                        width={200}
                                        height={200}
                                        onClick={() => triggerFileInput('brideImage')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.brideImage}
                                        onChange={handleImageChange('brideImage')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.story_groom} data-aos="fade-up" data-aos-delay="200">
                        <div className={styles.story_groom_wrapper}>
                            <div className={styles.story_groom__content} data-aos="zoom-in" data-aos-delay="400">
                                <div className={styles.left}>
                                    <h3>Chuyện</h3>
                                    <h4>
                                        <span>Của</span> Chú Rể
                                    </h4>
                                </div>
                                <div className={styles.right}>
                                    <h2>{weddingData.groom}</h2>
                                </div>
                            </div>
                            <div className={styles.content} data-aos="fade-up" data-aos-delay="600">
                                <span>{weddingData.groomStory}</span>

                                <div className={styles.img_story__groom} data-aos="fade-left" data-aos-delay="800">
                                    <Image
                                        src={images.groomImage}
                                        alt=""
                                        width={200}
                                        height={200}
                                        onClick={() => triggerFileInput('groomImage')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.groomImage}
                                        onChange={handleImageChange('groomImage')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.time_location}>
                        <div className={styles.wrapper}>
                            <h3>Tới dự buổi tiệc mừng Lễ thành hôn</h3>
                            <h3>Của Chúng Tôi</h3>
                            <div className={styles.img_t1}>
                                <Image src="/images/m2/t1.png" alt="" width={100} height={100} />
                            </div>
                            <div className={styles.img_t2}>
                                <Image src="/images/m2/t1.png" alt="" width={100} height={100} />
                            </div>
                            <div className={styles.family_section}>
                                <div className={styles.family_wrapper}>
                                    <div className={styles.family_box}>
                                        <h4>Nhà Trai</h4>
                                        <p>Ông: {weddingData.familyGroom.father}</p>
                                        <p>Bà: {weddingData.familyGroom.mother}</p>
                                    </div>
                                    <div className={styles.family_box}>
                                        <h4>Nhà Gái</h4>
                                        <p>Ông: {weddingData.familyBride.father}</p>
                                        <p>Bà: {weddingData.familyBride.mother}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.flex}>
                                <div className={styles.flex_gap}>
                                    <div>{weddingData.groom}</div>
                                    <span>囍</span>
                                    <div>{weddingData.bride}</div>
                                </div>
                            </div>
                            <div className={styles.infomation} data-aos="fade-up" data-aos-duration="1200">
                                <p className={styles.eventDetails}>TIỆC MỪNG VU QUY</p>
                                <p className={styles.eventTime}>Vào Lúc</p>
                                <div className={styles.dateContainer}>
                                    <span className={styles.time}>{weddingData.weddingDayOfWeek}</span>
                                    <div className={styles.column}>
                                        <span className={styles.dayOfWeek}>{formatTime(weddingData.weddingTime)}</span>
                                        <span className={styles.day}>{weddingData.weddingDate.split('/')[0]}</span>
                                        <span className={styles.month}>
                                            Tháng {weddingData.weddingDate.split('/')[1]}
                                        </span>
                                    </div>
                                    <span className={styles.year}>{weddingData.weddingDate.split('/')[2]}</span>
                                </div>
                            </div>
                            <div className={styles.calendar} data-aos="zoom-in" data-aos-duration="1000">
                                <h3>
                                    Tháng {weddingData.weddingDate.split('/')[1]}{' '}
                                    {weddingData.weddingDate.split('/')[2]}
                                </h3>
                                <div className={styles.calendarHeader}>
                                    <span>CN</span>
                                    <span>T2</span>
                                    <span>T3</span>
                                    <span>T4</span>
                                    <span>T5</span>
                                    <span>T6</span>
                                    <span>T7</span>
                                </div>
                                <div className={styles.calendarBody}>
                                    {Array(42)
                                        .fill('')
                                        .map((_, index) => {
                                            const day = index < 6 ? '' : (index - 5).toString();
                                            return (
                                                <span
                                                    key={index}
                                                    className={
                                                        parseInt(day) ===
                                                        parseInt(weddingData.weddingDate.split('/')[0])
                                                            ? styles.highlight
                                                            : ''
                                                    }
                                                >
                                                    {parseInt(day) ===
                                                    parseInt(weddingData.weddingDate.split('/')[0]) ? (
                                                        <span className={styles.highlightContent}>
                                                            <FontAwesomeIcon
                                                                icon={faHeart}
                                                                className={styles.heartIcon}
                                                            />
                                                            <span>{day}</span>
                                                        </span>
                                                    ) : (
                                                        day
                                                    )}
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.address} data-aos="fade-up" data-aos-duration="1000">
                        <div className={styles.dotLeft}></div>
                        <div className={styles.dotRight}></div>
                        <h4>Địa điểm tổ chức</h4>
                        <div className={styles.addressContent}>
                            <h5>Nhà Trai</h5>
                            {weddingData.groomAddress && weddingData.groomMapUrl ? (
                                <>
                                    <p>{weddingData.groomAddress}</p>
                                    <iframe
                                        src={weddingData.groomMapUrl}
                                        width="600"
                                        height="450"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </>
                            ) : (
                                <p>Địa điểm của chú rể chưa cập nhật</p>
                            )}
                        </div>
                        <div className={styles.addressContent}>
                            <h5>Nhà Gái</h5>
                            {weddingData.brideAddress && weddingData.brideMapUrl ? (
                                <>
                                    <p>{weddingData.brideAddress}</p>
                                    <iframe
                                        src={weddingData.brideMapUrl}
                                        width="600"
                                        height="450"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </>
                            ) : (
                                <p>Địa điểm của cô dâu chưa cập nhật</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.photo_gallery}>
                        <div className={styles.gallery_container}>
                            <div
                                className={`${styles.gallery_item} ${styles.item_1}`}
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >
                                <div className={styles.card_content}>
                                    <Image
                                        src={images.galleryImage1}
                                        alt="Wedding Photo 1"
                                        width={300}
                                        height={300}
                                        className={styles.card_image}
                                        onClick={() => triggerFileInput('galleryImage1')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.galleryImage1}
                                        onChange={handleImageChange('galleryImage1')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div
                                className={`${styles.gallery_item} ${styles.item_2}`}
                                data-aos="fade-up"
                                data-aos-delay="400"
                            >
                                <div className={styles.card_content}>
                                    <Image
                                        src={images.galleryImage2}
                                        alt="Wedding Photo 2"
                                        width={300}
                                        height={300}
                                        className={styles.card_image}
                                        onClick={() => triggerFileInput('galleryImage2')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.galleryImage2}
                                        onChange={handleImageChange('galleryImage2')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div
                                className={`${styles.gallery_item} ${styles.item_3}`}
                                data-aos="fade-up"
                                data-aos-delay="600"
                            >
                                <div className={styles.card_content}>
                                    <Image
                                        src={images.galleryImage3}
                                        alt="Wedding Photo 3"
                                        width={300}
                                        height={300}
                                        className={styles.card_image}
                                        onClick={() => triggerFileInput('galleryImage3')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.galleryImage3}
                                        onChange={handleImageChange('galleryImage3')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div
                                className={`${styles.gallery_item} ${styles.item_4}`}
                                data-aos="fade-up"
                                data-aos-delay="800"
                            >
                                <div className={styles.card_content}>
                                    <Image
                                        src={images.galleryImage4}
                                        alt="Wedding Photo 4"
                                        width={300}
                                        height={300}
                                        className={styles.card_image}
                                        onClick={() => triggerFileInput('galleryImage4')}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRefs.galleryImage4}
                                        onChange={handleImageChange('galleryImage4')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer>
                        <div className={styles.Save_the_date} data-aos="fade-right" data-aos-delay="400">
                            <span className={styles.save}>Save</span>
                            <span className={styles.the}>The</span>
                            <span className={styles.date}>Date</span>
                            <span className={styles.time}>{weddingData.weddingDate}</span>
                        </div>
                        <div className={styles.bride_groom} data-aos="fade-up" data-aos-delay="600">
                            <h3>{weddingData.bride}</h3>
                            <span>&</span>
                            <h3>{weddingData.groom}</h3>
                        </div>
                        <div className={styles.content_foooter}>
                            <span data-aos="fade-up" data-aos-duration="1000">
                                Chúng tôi háo hức mong chờ đến chung vui trong ngày trọng đại của đời mình – một dấu mốc
                                thiêng liêng và đáng nhớ. Sẽ thật trọn vẹn và ý nghĩa biết bao nếu có sự hiện diện cùng
                                lời chúc phúc chân thành từ bạn trong khoảnh khắc đặc biệt ấy.
                            </span>
                        </div>
                    </footer>
                </div>
                <EditControls
                    weddingData={weddingData}
                    quantity={quantity}
                    totalPrice={totalPrice}
                    id={id}
                    showEditPopup={showEditPopup}
                    showInviteePopup={showInviteePopup}
                    setShowEditPopup={setShowEditPopup}
                    setShowInviteePopup={setShowInviteePopup}
                    onSaveEdit={handleSaveEdit}
                    onInviteePopupClose={handleInviteePopupClose}
                    templateType="template2"
                />
            </div>
        </Suspense>
    );
}

export default Template2Edit;
