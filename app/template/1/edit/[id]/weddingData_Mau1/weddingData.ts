// data/weddingData.ts
interface CoupleImage {
    src: string;
    alt: string;
    isCenter: boolean;
}

interface FamilyMember {
    title: string;
    father: string;
    mother: string;
}

interface LocationDetails {
    name: string;
    address: string;
    mapEmbedUrl: string;
}

interface WeddingData {
    banner: {
        image: string;
    };
    couple: {
        names: string;
        groom: {
            name: string;
            image: string;
        };
        bride: {
            name: string;
            image: string;
        };
    };
    invitation: {
        title: string;
        subtitle: string;
        dayOfWeek: string;
        time: string;
        day: string;
        month: string;
        year: string;
        lunarDate: string;
        monthYear: string;
    };
    familyInfo: {
        groomFamily: FamilyMember;
        brideFamily: FamilyMember;
    };
    coupleImages: CoupleImage[];
    eventDetails: string;
    calendar: {
        month: string;
        year: string;
        days: string[];
        highlightDay: string;
    };
    location: {
        groomLocation: LocationDetails;
        brideLocation: LocationDetails;
    };
    thumnailImages: CoupleImage[];
}

const weddingData: WeddingData = {
    banner: {
        image: '/images/m1/2.png',
    },
    couple: {
        names: 'Anh Tú & Diệu Nhi',
        groom: {
            name: 'Anh Tú',
            image: '/images/m1/1.1.png',
        },
        bride: {
            name: 'Diệu Nhi',
            image: '/images/m1/3.png',
        },
    },
    invitation: {
        title: 'Thư Mời Tiệc Cưới',
        subtitle: 'Tham Dự Lễ Cưới',
        dayOfWeek: 'Thứ 7',
        time: '11:00',
        day: '17',
        month: 'Tháng 11',
        year: '2025',
        lunarDate: 'Tức Ngày 18 Tháng 09 Năm Ất Tỵ',
        monthYear: 'Tháng 11 2025',
    },
    familyInfo: {
        groomFamily: {
            title: 'Nhà Trai',
            father: 'Nguyễn Văn A',
            mother: 'Trần Thị B',
        },
        brideFamily: {
            title: 'Nhà Gái',
            father: 'Lê Văn C',
            mother: 'Phạm Thị D',
        },
    },
    coupleImages: [
        { src: '/images/m1/4.png', alt: 'Couple 1', isCenter: false },
        { src: '/images/m1/5.png', alt: 'Couple 2', isCenter: true },
        { src: '/images/m1/6.png', alt: 'Couple 3', isCenter: false },
    ],
    eventDetails: 'TIỆC MỪNG VU QUY',
    calendar: {
        month: 'Tháng 11',
        year: '2025',
        days: [
            '',
            '',
            '',
            '',
            '',
            '',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22',
            '23',
            '24',
            '25',
            '26',
            '27',
            '28',
            '29',
            '30',
        ],
        highlightDay: '17',
    },
    location: {
        groomLocation: {
            name: 'Nhà Trai - Tòa nhà Saigon Intela',
            address: 'KDC 13E, Đô thị mới Nam Thành Phố, Ấp 5, Bình Chánh, Hồ Chí Minh',
            mapEmbedUrl:
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4609.540003734593!2d106.64545227566936!3d10.7031259605402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175311ad90bd4bb%3A0xf92c25e13e35ed88!2sChung%20c%C6%B0%20Saigon%20Intela!5e1!3m2!1svi!2s!4v1746162553791!5m2!1svi!2s',
        },
        brideLocation: {
            name: 'Nhà Gái - Tiền Giang',
            address: 'Tiền Giang, Việt Nam',
            mapEmbedUrl:
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4609.540003734593!2d106.64545227566936!3d10.7031259605402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175311ad90bd4bb%3A0xf92c25e13e35ed88!2sChung%20c%C6%B0%20Saigon%20Intela!5e1!3m2!1svi!2s!4v1746162553791!5m2!1svi!2s',
        },
    },
    thumnailImages: [
        { src: '/images/m1/8.png', alt: 'Couple 2', isCenter: true },
        { src: '/images/m1/9.png', alt: 'Couple 3', isCenter: false },
        { src: '/images/m1/10.png', alt: 'Couple 4', isCenter: false },
        { src: '/images/m1/11.png', alt: 'Couple 5', isCenter: false },
    ],
};

export default weddingData;
