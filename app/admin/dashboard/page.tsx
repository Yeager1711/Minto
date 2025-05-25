'use client';
import * as React from 'react';
import {
    Chart as ChartJS,
    BarElement,
    PointElement,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './dashboard.module.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartSimple,
    faUserCog,
    faMoneyBillWave,
    faCommentDots,
    faEdit,
    faPlus,
} from '@fortawesome/free-solid-svg-icons'; // Import icons
import AddProduct from '../popup/add_template/addTemplates';

ChartJS.register(BarElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderRadius?: number | number[];
    }[];
}

const chartData: ChartData = {
    labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    datasets: [
        {
            label: 'Usage (kW)',
            data: [20, 30, 25, 15, 10, 20, 25, 15, 10, 5],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderRadius: 8,
        },
    ],
};

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Usage Status',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 40,
            ticks: {
                stepSize: 10,
            },
        },
    },
};

const getGreeting = (): string => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
        return 'Good Afternoon';
    } else {
        return 'Good Evening';
    }
};

const Dashboard: React.FC = () => {
    React.useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    const [isAddProductOpen, setIsAddProductOpen] = React.useState(false);

    const openAddProductPopup = () => {
        setIsAddProductOpen(true);
    };

    const closeAddProductPopup = () => {
        setIsAddProductOpen(false);
    };

    const [greeting, setGreeting] = React.useState(getGreeting());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboard_wrapper}>
                {/* Move wrapper_footer here as a sidebar */}
                <div className={styles.navigations}>
                    <button title="Quản lý tài khoản">
                        <FontAwesomeIcon icon={faUserCog} />
                    </button>
                    <button title="Quản lý doanh thu">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                    </button>
                    <button title="Quản lý phản hồi">
                        <FontAwesomeIcon icon={faCommentDots} />
                    </button>
                    <button title="Chỉnh sửa thông tin">
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button title="Thêm sản phẩm" onClick={openAddProductPopup}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>

                <div className={styles.main_content}>
                    <div className={styles.header} data-aos="fade-down">
                        <h1>{greeting}, Huỳnh Nam</h1>
                    </div>

                    <div className={styles.wrapper_header}>
                        <div className={styles.wrapper_header__left}>
                            <div className={styles.chart_section} data-aos="fade-up">
                                <div className={styles.chart}>
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            </div>

                            <div className={styles.left_footer} data-aos="fade-up" data-aos-delay="200">
                                <div className={styles.box_left}>
                                    <h3>Phản hồi từ khách hàng</h3>
                                    <div className={styles.list_of_responses}>
                                        <div className={styles.response_item}>
                                            <span>Hệ thống tạo đơn thanh toán lỗi</span>
                                            <span className={styles.Processed}>Đã xử lý</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.box_right}>
                                    <h3>System Production</h3>
                                    <p style={{ color: 'green' }}>1000ms</p>
                                    <h3>Server status</h3>
                                    <p style={{ color: 'orange' }}>sleeping</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.header__right}>
                            <div className={styles.Revenue_box} data-aos="fade-left">
                                <h3>Doanh thu</h3>
                                <div className={styles.Revenue_number}>
                                    <span>1.300.000 vnđ</span>
                                </div>
                            </div>

                            <div className={styles.total_client} data-aos="fade-left" data-aos-delay="200">
                                <div className={styles.client}>
                                    <h4>Số lượng khách hàng</h4>
                                    <p>68</p>
                                </div>
                                <div className={styles.client}>
                                    <h4>Số lượng khách hàng mới</h4>
                                    <p>8</p>
                                </div>
                            </div>

                            <div className={styles.Most_used_model} data-aos="fade-left" data-aos-delay="400">
                                <h3>Mẫu được sử dụng nhiều nhất</h3>
                                <FontAwesomeIcon icon={faChartSimple} />
                            </div>

                            <div className={styles.template} data-aos="fade-left" data-aos-delay="400">
                                <h3>Mẫu Template đang có</h3>
                                <div className={styles.template_wrapper_item}>
                                    <span className={styles.template_item}>Template 1</span>
                                    <span className={styles.template_item}>Template 2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isAddProductOpen && <AddProduct onClose={closeAddProductPopup} />}
        </div>
    );
};

export default Dashboard;
