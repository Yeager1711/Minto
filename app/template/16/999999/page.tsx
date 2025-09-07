'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './16.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faGift } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface TimeLeft {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

interface FamilyMember {
    name: string;
    title: string;
}

interface FamilyData {
    father: FamilyMember;
    mother: FamilyMember;
    groomName?: string;
    brideName?: string;
    weddingTime: string;
    lunarDate: string;
    mapIframeSrc: string;
}

interface Family {
    groom: FamilyData;
    bride: FamilyData;
}

interface QRCode {
    qrId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl: string;
    createdAt: string;
    status: 'SUCCESS' | 'ACTIVE';
    representative?: string | null;
}

interface Bank {
    id: string;
    name: string;
    shortName?: string;
    code?: string;
    bin?: string;
}

const apiUrl: string | undefined = process.env.NEXT_PUBLIC_APP_API_BASE_URL;
const userId: number = 999999; // Biến userId cố định

const Template16C: React.FC = () => {
    const weddingDateGroom: Date = new Date(2026, 0, 13); // 13 Jan 2026
    const weddingDateBride: Date = new Date(2026, 0, 12); // 12 Jan 2026
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({});
    const [guestType, setGuestType] = useState<'groom' | 'bride' | null>(null);
    const [showVideo, setShowVideo] = useState<boolean>(false);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingQRs, setLoadingQRs] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isQrOpen, setIsQrOpen] = useState<boolean>(false);

    console.log('Using fixed userId:', userId);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 100 });
        return () => {
            AOS.refreshHard();
        };
    }, []);

    // Mock data gia đình
    const familyData: Family = {
        groom: {
            father: { name: 'Bùi Hoàng Anh', title: 'Ông' },
            mother: { name: 'Nguyễn Ngọc Bích', title: 'Bà' },
            groomName: 'Bùi Thanh Tùng',
            weddingTime: '9 Giờ 30 - Thứ Ba - Ngày 13 Tháng 01 Năm 2026',
            lunarDate: 'Nhằm ngày 25 Tháng 11 năm Ất Tỵ',
            mapIframeSrc:
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239747.30665226607!2d144.69560213321446!3d-37.6719422444742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad658d3b0b4960b%3A0xa6cc2687555c46a6!2sOvernewton%20Castle!5e1!3m2!1svi!2s!4v1756966738675!5m2!1svi!2s',
        },
        bride: {
            father: { name: 'Phan Thanh Cường', title: 'Ông' },
            mother: { name: 'Trần Thị Ngọc', title: 'Bà' },
            brideName: 'Phan Khánh Quyên',
            weddingTime: '9 Giờ 30 - Thứ Hai - Ngày 12 Tháng 01 Năm 2026',
            lunarDate: 'Nhằm ngày 24 Tháng 11 năm Ất Tỵ',
            mapIframeSrc:
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239747.30665226607!2d144.69560213321446!3d-37.6719422444742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad64ef0d456f689%3A0x9caeec3cabf3f72f!2sThe%20Grande%20Reception%20%26%20Function%20Centre%20-%20Wedding%20Venue%20Melbourne!5e1!3m2!1svi!2s!4v1756967182722!5m2!1svi!2s',
        },
    };

    // Mock data timeline
    const timelineEvents: Record<'groom' | 'bride', { time: string; title: string; description: string }[]> = {
        groom: [
            { time: '07:00 - 07:30', title: 'Đón khách', description: 'Khách mời tập trung tại nhà trai' },
            { time: '07:30 - 08:30', title: 'Lễ Thành Hôn', description: 'Buổi lễ tại tư gia nhà trai' },
            { time: '11:00 - 13:00', title: 'Tiệc cưới', description: 'Tiệc chiêu đãi tại Overnewton Castle' },
        ],
        bride: [
            { time: '07:00 - 07:30', title: 'Đón khách', description: 'Khách mời tập trung tại nhà gái' },
            { time: '07:30 - 08:30', title: 'Lễ Vu Quy', description: 'Buổi lễ tại tư gia nhà gái' },
            { time: '11:00 - 13:00', title: 'Tiệc cưới', description: 'Tiệc chiêu đãi tại The Grande Reception' },
        ],
    };

    const calculateTimeLeft = (weddingDate: Date): TimeLeft => {
        const now: Date = new Date();
        const difference: number = weddingDate.getTime() - now.getTime();
        let time: TimeLeft = {};
        if (difference > 0) {
            time = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return time;
    };

    // Fetch QR codes and banks
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoadingQRs(true);
                setError(null);
                console.log('Fetching QR codes from:', `${apiUrl}/qr/public/qrs/${userId}`);

                if (!apiUrl) {
                    throw new Error('API URL không được định nghĩa trong biến môi trường.');
                }

                // Fetch QR codes
                const qrResponse = await fetch(`${apiUrl}/qr/public/qrs/${userId}`);
                console.log('QR Response status:', qrResponse.status);
                if (!qrResponse.ok) {
                    throw new Error(`Failed to fetch QR codes: ${qrResponse.statusText}`);
                }
                const qrData: unknown = await qrResponse.json();
                console.log('QR Data received:', qrData);
                const qrArray: QRCode[] = Array.isArray(qrData) ? qrData : [qrData as QRCode];
                setQrCodes(qrArray);

                // Fetch banks
                const bankResponse = await fetch('https://api.vietqr.io/v1/banks');
                const bankData: { code: string; data: Bank[] } = await bankResponse.json();
                console.log('Bank Data received:', bankData);
                if (bankData.code === '00' && Array.isArray(bankData.data)) {
                    setBanks(bankData.data);
                } else {
                    throw new Error('Không thể tải danh sách ngân hàng.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(`Không thể tải mã QR. Vui lòng thử lại sau. Chi tiết: ${(error as Error).message}`);
            } finally {
                setLoadingQRs(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (guestType) {
            const weddingDate: Date = guestType === 'groom' ? weddingDateGroom : weddingDateBride;
            setTimeLeft(calculateTimeLeft(weddingDate));

            const timer: number = window.setInterval(() => {
                setTimeLeft(calculateTimeLeft(weddingDate));
            }, 1000);
            return () => window.clearInterval(timer);
        }
        // no timer if no guestType
    }, [guestType]);

    // Calendar
    const year: number = 2026;
    const month: number = 0;
    const firstDay: number = new Date(year, month, 1).getDay();
    const daysInMonth: number = new Date(year, month + 1, 0).getDate();
    const weddingDay: number = guestType === 'groom' ? 13 : 12;

    const cells: JSX.Element[] = [];
    for (let i: number = 0; i < firstDay; i++) cells.push(<span key={`empty-${i}`} />);
    for (let d: number = 1; d <= daysInMonth; d++) {
        const isWeddingDay: boolean = d === weddingDay;
        cells.push(
            <span key={d} className={isWeddingDay ? styles.weddingDay : ''}>
                {isWeddingDay ? '❤️' : d}
            </span>
        );
    }

    // QR display logic
    const groomQr: QRCode | undefined = qrCodes.find((qr) => qr.representative === 'groom');
    const brideQr: QRCode | undefined = qrCodes.find((qr) => qr.representative === 'bride');

    const getBankName = (bankId: string): string => {
        const bank: Bank | undefined = banks.find((b) => String(b.id) === String(bankId));
        return bank?.shortName || bank?.name || 'Không xác định';
    };

    const isGroomTestQr: boolean = groomQr?.accountNumber === '171120018686' || false;
    const isBrideTestQr: boolean = brideQr?.accountNumber === '19002891' || false;

    if (!guestType) {
        return (
            <div className={styles.guestSelectionModal}>
                <div className={styles.modalContent} data-aos="fade-up">
                    <h2>Chào mừng bạn đến với lễ cưới!</h2>
                    <p>Vui lòng chọn bạn là khách mời của:</p>
                    <div className={styles.selectionButtons}>
                        <button
                            className={styles.groomButton}
                            onClick={() => setGuestType('groom')}
                            data-aos="fade-right"
                            data-aos-delay="100"
                        >
                            Chú rể
                        </button>
                        <button
                            className={styles.brideButton}
                            onClick={() => setGuestType('bride')}
                            data-aos="fade-left"
                            data-aos-delay="100"
                        >
                            Cô dâu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedFamily: FamilyData = familyData[guestType];

    return (
        <div className={styles.template16c}>
            <div className={styles.wrapper}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title} data-aos="fade-down">
                        Save the Date
                    </h2>
                </div>

                {/* Photo */}
                <div className={styles.photoWrapper} data-aos="fade-up">
                    <img src="/images/m16/1.jpg" alt="Couple" className={styles.photo} />
                </div>

                {/* Countdown */}
                <div className={styles.countdown}>
                    <p data-aos="fade-up">Day is Coming!</p>
                    <div className={styles.timeBoxes}>
                        <div data-aos="fade-up" data-aos-delay="200">
                            <span>{timeLeft.days || 0}</span>
                            <small>Days</small>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="400">
                            <span>{timeLeft.hours || 0}</span>
                            <small>Hours</small>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="600">
                            <span>{timeLeft.minutes || 0}</span>
                            <small>Minutes</small>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="800">
                            <span>{timeLeft.seconds || 0}</span>
                            <small>Seconds</small>
                        </div>
                    </div>
                </div>

                {/* RSVP and Video */}
                <div className={styles.rsvp} data-aos="fade-up">
                    <button className={styles.rsvpButton} onClick={() => setShowVideo((v) => !v)}>
                        <FontAwesomeIcon icon={faPlay} /> Play Video Cinematic
                    </button>
                    {showVideo && (
                        <video controls autoPlay className={styles.video}>
                            <source src="/video/cinematic_wedding.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>

                {/* Family Details */}
                <div className={styles.form_family}>
                    <div className={styles.family_groom}>
                        <span data-aos="fade-right" data-aos-delay="200">
                            Nhà trai
                        </span>
                        <h3 data-aos="fade-right" data-aos-delay="400">
                            {familyData.groom.father.title}: <strong>{familyData.groom.father.name}</strong>
                        </h3>
                        <h3 data-aos="fade-right" data-aos-delay="600">
                            {familyData.groom.mother.title}: <strong>{familyData.groom.mother.name}</strong>
                        </h3>
                    </div>
                    <div className={styles.family_bride}>
                        <span data-aos="fade-left" data-aos-delay="200">
                            Nhà gái
                        </span>
                        <h3 data-aos="fade-left" data-aos-delay="400">
                            {familyData.bride.father.title}: <strong>{familyData.bride.father.name}</strong>
                        </h3>
                        <h3 data-aos="fade-left" data-aos-delay="600">
                            {familyData.bride.mother.title}: <strong>{familyData.bride.mother.name}</strong>
                        </h3>
                    </div>
                </div>

                <div className={styles.inviteText}>
                    <h3 data-aos="fade-up" data-aos-delay="200">
                        Trân trọng báo tin lễ thành hôn <br />
                        Của Con chúng tôi
                    </h3>
                </div>
                <div className={styles.groom_name} data-aos="fade-right" data-aos-delay="400">
                    {familyData.groom.groomName}
                </div>
                <div className={styles.and}>&</div>
                <div className={styles.bride_name} data-aos="fade-left" data-aos-delay="600">
                    {familyData.bride.brideName}
                </div>

                <div className={styles.organize_Time}>
                    <h3 data-aos="fade-up" data-aos-delay="800">
                        Hôn Lễ được tổ chức
                    </h3>
                    <span data-aos="fade-up" data-aos-delay="1000">
                        {selectedFamily.weddingTime}
                    </span>
                    <p data-aos="fade-up" data-aos-delay="1200">
                        ({selectedFamily.lunarDate})
                    </p>
                </div>

                {/* Google Map */}
                <div className={styles.google_map}>
                    <button onClick={() => setShowMap((m) => !m)} data-aos="fade-up" data-aos-delay="200">
                        {showMap ? 'Ẩn Google Map' : 'Click Google Map'}
                    </button>
                    {showMap && (
                        <div className={styles.map_frame}>
                            <iframe
                                src={selectedFamily.mapIframeSrc}
                                width="100%"
                                height="400px"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                            ></iframe>
                        </div>
                    )}
                </div>

                {/* Calendar */}
                <div className={styles.calendar} data-aos="fade-up" data-aos-delay="300">
                    <h4>Tháng 01 2026</h4>
                    <div className={styles.days}>
                        <span>Cn</span>
                        <span>T2</span>
                        <span>T3</span>
                        <span>T4</span>
                        <span>T5</span>
                        <span>T6</span>
                        <span>T7</span>
                        {cells}
                    </div>
                </div>

                {/* Timeline and QR Codes */}
                <div className={styles.schedule}>
                    <div className={styles.image_schedule}>
                        <img src="/images/m16/2.jpg" alt="" />
                    </div>

                    <div className={styles.wrapper_timeLine}>
                        <h3>Khung Giờ & Nội Dung</h3>
                        <div className={styles.timeline}>
                            {timelineEvents[guestType].map((event, index) => (
                                <div key={index} className={styles.item}>
                                    <div className={styles.time} data-aos="fade-up" data-aos-delay="200">
                                        {event.time}
                                    </div>
                                    <div className={styles.schedule_content}>
                                        <h4 data-aos="fade-right" data-aos-delay="400">
                                            {event.title}
                                        </h4>
                                        <p data-aos="fade-right" data-aos-delay="600">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* QR Codes */}
                <div
                    className={styles.btn_invitionQR__popop}
                    style={{ margin: '2rem 0' }}
                    data-aos="fade-up"
                    data-aos-delay="300"
                >
                    {loadingQRs ? (
                        <p>Đang tải mã QR...</p>
                    ) : error ? (
                        <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
                    ) : qrCodes.length === 0 ? (
                        <p>Không tìm thấy mã QR nào.</p>
                    ) : (
                        <div className={styles.wrapper_gift}>
                            <div className={styles.flex_center}>
                                <div className={styles.btn_gift_code} onClick={() => setIsQrOpen(!isQrOpen)}>
                                    Nhận Hỷ <FontAwesomeIcon icon={faGift} />
                                </div>
                                <div className={`${styles.flex} ${isQrOpen ? styles.open : ''}`}>
                                    {groomQr && (
                                        <div className={styles.groom}>
                                            <h3>
                                                {isGroomTestQr
                                                    ? 'QR đang test của Admin'
                                                    : `QR của Chú Rể ${groomQr.status !== 'ACTIVE' ? '(Không hoạt động)' : ''}`}
                                            </h3>
                                            <p>
                                                <strong>Ngân hàng</strong> {getBankName(groomQr.bank)}
                                            </p>
                                            <Image
                                                src={groomQr.qrCodeUrl}
                                                alt="Mã QR Thanh Toán Chú Rể"
                                                width={320}
                                                height={320}
                                                sizes="100vw"
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                            <p>
                                                <strong>Số tài khoản</strong> {groomQr.accountNumber}
                                            </p>
                                            <p>
                                                <strong>Chủ tài khoản</strong> {groomQr.accountHolder}
                                            </p>
                                        </div>
                                    )}
                                    {brideQr && (
                                        <div className={styles.bride}>
                                            <h3>
                                                {isBrideTestQr
                                                    ? 'QR đang test của Admin'
                                                    : `QR của Cô Dâu ${brideQr.status !== 'ACTIVE' ? '(Không hoạt động)' : ''}`}
                                            </h3>
                                            <p>
                                                <strong>Ngân hàng</strong> {getBankName(brideQr.bank)}
                                            </p>
                                            <Image
                                                src={brideQr.qrCodeUrl}
                                                alt="Mã QR Thanh Toán Cô Dâu"
                                                width={320}
                                                height={320}
                                                sizes="100vw"
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                            <p>
                                                <strong>Số tài khoản</strong> {brideQr.accountNumber}
                                            </p>
                                            <p>
                                                <strong>Chủ tài khoản</strong> {brideQr.accountHolder}
                                            </p>
                                        </div>
                                    )}
                                    {!groomQr && !brideQr && <div>Không có mã QR cho chú rể hoặc cô dâu</div>}
                                    {qrCodes.length > 2 && (
                                        <div>
                                            <h3>Thêm QR (Đang gỡ lỗi)</h3>
                                            {qrCodes.map((qr) => (
                                                <div key={qr.qrId}>
                                                    <p>
                                                        Rep: {qr.representative}, Status: {qr.status}, Bank:{' '}
                                                        {getBankName(qr.bank)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Footer */}
                <div
                    className={`${styles.footer} ${guestType === 'groom' ? styles.heroGroomAlt : styles.heroBrideAlt}`}
                    data-aos="fade-up"
                    data-aos-delay="300"
                >
                    <div className={styles.footerContent}>
                        <h3>Thanks You</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Template16C;
