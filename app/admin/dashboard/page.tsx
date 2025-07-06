'use client';

import * as React from 'react';
import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    ArcElement,
    RadialLinearScale,
    TooltipItem,
} from 'chart.js';
import { Bar, PolarArea, Line } from 'react-chartjs-2';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './dashboard.module.css';
import AddProduct from '../popup/add_template/addTemplates';
import Skeleton from './Skeleton';
import Navigation from '../navigations/navigations';
import ErrorList from '../error_list/page';
import EditTemplate from '../editTemplate/page';

// Register ChartJS components
ChartJS.register(
    BarElement,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    ArcElement,
    RadialLinearScale
);

// Interfaces
interface DailyRevenue {
    date: string;
    totalAmount: number;
}

interface Revenue {
    dailyRevenue: DailyRevenue[];
    totalRevenue: number;
}

interface Payment {
    paymentId: number;
    paymentDate: string;
    amount: number;
}

interface Template {
    templateId: number;
    templateName: string;
}

interface TemplateUsage extends Template {
    usageCount: number;
}

interface ApiData {
    revenue: Revenue;
    totalCanceledOrders: number;
    completedPayments: Payment[];
    canceledPayments?: Payment[];
    totalTemplates: number;
    templateUsage: TemplateUsage[];
    allTemplates: Template[];
}

interface Dataset {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    borderRadius?: number;
    fill?: boolean;
    tension?: number;
}

interface ChartData {
    labels: string[];
    datasets: Dataset[];
}

interface WeekDay {
    day: string;
    date: number;
    isCurrent: boolean;
    fullDate: string;
}

const apiUrl: string | undefined = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_APP_API_BASE_URL is not defined');
}

// Fetch statistics function
const fetchStatistics = async (startDate: string, endDate: string): Promise<ApiData> => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('Không tìm thấy accessToken trong localStorage');
    }

    const response = await fetch(`${apiUrl}/payos/statistics?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or expired token');
    }

    const result = await response.json();
    if (result.success) {
        return result.data as ApiData;
    }
    throw new Error('Không thể lấy dữ liệu thống kê');
};

// Get last 7 days
const getLast7Days = (endDate: Date): string[] => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
};

// Get greeting
const getGreeting = (): string => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
        return 'Good Afternoon';
    }
    return 'Good Evening';
};

// Get month name from month number (0-based)
const getMonthName = (month: number): string => {
    const months: string[] = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return months[month];
};

// Get day name from day number (0-based, Sunday = 0)
const getDayName = (day: number): string => {
    const days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
};

// Get days of the current week
const getWeekDays = (baseDate: Date): WeekDay[] => {
    const days: WeekDay[] = [];
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Set to Sunday of the current week

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push({
            day: getDayName(date.getDay()),
            date: date.getDate(),
            isCurrent: date.toDateString() === new Date().toDateString(),
            fullDate: date.toISOString().split('T')[0],
        });
    }
    return days;
};

const Dashboard: React.FC = () => {
    const [apiData, setApiData] = React.useState<ApiData | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [chartType, setChartType] = React.useState<'bar' | 'polar'>('bar');
    const [greeting, setGreeting] = React.useState<string>(getGreeting());
    const [isAddProductOpen, setIsAddProductOpen] = React.useState<boolean>(false);
    const [serverStatus, setServerStatus] = React.useState<string>('sleeping');
    const [lastRequestTime, setLastRequestTime] = React.useState<number>(Date.now());
    const [onlineSince, setOnlineSince] = React.useState<number | null>(null);
    const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
    const [activeSection, setActiveSection] = React.useState<string>('main');

    React.useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    React.useEffect(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const fetchData = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setServerStatus('rebuilding...');
                setLastRequestTime(Date.now());

                const data: ApiData = await fetchStatistics(
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                );
                setApiData(data);
                setServerStatus('online');
                setOnlineSince(Date.now());
                console.log('API Data:', data);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu';
                console.error('Lỗi khi lấy dữ liệu:', error);
                setError(errorMessage);
                setServerStatus('sleeping');
                setOnlineSince(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Cập nhật dữ liệu mỗi phút
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const checkServerStatus = (): void => {
            const now = Date.now();

            if (serverStatus === 'online' && onlineSince !== null) {
                const timeSinceOnline = (now - onlineSince) / 1000;
                const inactivityTime = (now - lastRequestTime) / 1000;

                if (timeSinceOnline >= 60 && inactivityTime >= 60) {
                    setServerStatus('sleeping');
                    setOnlineSince(null);
                }
            }
        };

        const interval = setInterval(checkServerStatus, 10000);
        return () => clearInterval(interval);
    }, [lastRequestTime, serverStatus, onlineSince]);

    const toggleChartType = (): void => {
        setChartType((prev: 'bar' | 'polar') => (prev === 'bar' ? 'polar' : 'bar'));
        setLastRequestTime(Date.now());
    };

    const orderChartData: ChartData = React.useMemo(() => {
        if (!apiData) {
            return { labels: [], datasets: [] };
        }

        const last7Days: string[] = getLast7Days(new Date());
        const completedOrdersByDate: { [key: string]: number } = {};
        const canceledOrdersByDate: { [key: string]: number } = {};

        last7Days.forEach((date: string) => {
            completedOrdersByDate[date] = 0;
            canceledOrdersByDate[date] = 0;
        });

        apiData.completedPayments.forEach((payment: Payment) => {
            const date: string = payment.paymentDate.split('T')[0];
            if (completedOrdersByDate[date] !== undefined) {
                completedOrdersByDate[date]++;
            }
        });

        if (apiData.canceledPayments && apiData.canceledPayments.length > 0) {
            apiData.canceledPayments.forEach((payment: Payment) => {
                const date: string = payment.paymentDate.split('T')[0];
                if (canceledOrdersByDate[date] !== undefined) {
                    canceledOrdersByDate[date]++;
                }
            });
        } else if (apiData.totalCanceledOrders > 0) {
            const canceledPerDay: number = Math.floor(apiData.totalCanceledOrders / 7);
            last7Days.forEach((date: string) => {
                canceledOrdersByDate[date] = canceledPerDay;
            });
            canceledOrdersByDate[last7Days[0]] += apiData.totalCanceledOrders % 7;
        }

        const chartData: ChartData = {
            labels: last7Days,
            datasets: [
                {
                    label: 'Đơn hàng hoàn tất',
                    data: last7Days.map((date: string) => completedOrdersByDate[date]),
                    backgroundColor: last7Days.map((date: string) =>
                        date === selectedDate ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.2)'
                    ),
                    borderRadius: 6,
                },
                {
                    label: 'Đơn hàng bị hủy',
                    data: last7Days.map((date: string) => canceledOrdersByDate[date]),
                    backgroundColor: last7Days.map((date: string) =>
                        date === selectedDate ? 'rgba(255, 99, 132, 0.6)' : 'rgba(255, 99, 132, 0.1)'
                    ),
                    borderRadius: 6,
                },
            ],
        };

        return chartData;
    }, [apiData, selectedDate]);

    const templateChartData: ChartData = React.useMemo(() => {
        if (!apiData || apiData.templateUsage.length === 0) {
            return { labels: [], datasets: [] };
        }

        const totalUsage: number = apiData.templateUsage.reduce(
            (sum: number, template: TemplateUsage) => sum + template.usageCount,
            0
        );
        const labels: string[] = apiData.templateUsage.map((template: TemplateUsage) => template.templateName);
        const data: number[] = apiData.templateUsage.map((template: TemplateUsage) =>
            totalUsage > 0 ? (template.usageCount / totalUsage) * 100 : 0
        );

        const chartData: ChartData = {
            labels,
            datasets: [
                {
                    label: 'Tỷ lệ sử dụng (%)',
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                    ],
                },
            ],
        };

        return chartData;
    }, [apiData]);

    const revenueChartData: ChartData = React.useMemo(() => {
        if (!apiData) {
            return { labels: [], datasets: [] };
        }

        const last7Days: string[] = getLast7Days(new Date());
        const totalRevenueByDate: { [key: string]: number } = {};
        const realRevenueByDate: { [key: string]: number } = {};
        const virtualRevenueByDate: { [key: string]: number } = {};

        last7Days.forEach((date: string) => {
            totalRevenueByDate[date] = 0;
            realRevenueByDate[date] = 0;
            virtualRevenueByDate[date] = 0;
        });

        apiData.completedPayments.forEach((payment: Payment) => {
            const date: string = payment.paymentDate.split('T')[0];
            if (realRevenueByDate[date] !== undefined) {
                realRevenueByDate[date] += payment.amount;
                totalRevenueByDate[date] += payment.amount;
            }
        });

        if (apiData.canceledPayments && apiData.canceledPayments.length > 0) {
            apiData.canceledPayments.forEach((payment: Payment) => {
                const date: string = payment.paymentDate.split('T')[0];
                if (virtualRevenueByDate[date] !== undefined) {
                    virtualRevenueByDate[date] += payment.amount;
                    totalRevenueByDate[date] += payment.amount;
                }
            });
        } else if (apiData.totalCanceledOrders > 0) {
            const virtualPerDay: number = Math.floor(apiData.totalCanceledOrders / 7) * 99000;
            last7Days.forEach((date: string) => {
                virtualRevenueByDate[date] = virtualPerDay;
                totalRevenueByDate[date] += virtualPerDay;
            });
            virtualRevenueByDate[last7Days[0]] += (apiData.totalCanceledOrders % 7) * 99000;
            totalRevenueByDate[last7Days[0]] += (apiData.totalCanceledOrders % 7) * 99000;
        }

        const chartData: ChartData = {
            labels: last7Days,
            datasets: [
                {
                    label: 'Tổng doanh thu',
                    data: last7Days.map((date: string) => totalRevenueByDate[date]),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Doanh thu thật',
                    data: last7Days.map((date: string) => realRevenueByDate[date]),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Doanh thu ảo',
                    data: last7Days.map((date: string) => virtualRevenueByDate[date]),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };

        return chartData;
    }, [apiData, selectedDate]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true },
            title: {
                display: true,
                text: chartType === 'bar' ? 'Trạng thái đơn hàng 7 ngày' : 'Tỷ lệ sử dụng Template (%)',
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'bar' | 'polarArea'>): string => {
                        if (context.dataset.label) {
                            if (chartType === 'polar') {
                                const value = context.parsed as unknown as number;
                                return `${context.dataset.label}: ${value.toFixed(2)}%`;
                            }
                            const value = (context.parsed as { y: number }).y;
                            return `${context.dataset.label}: ${value}`;
                        }
                        return 'No label available';
                    },
                },
            },
        },
        scales: chartType === 'bar' ? { y: { beginAtZero: true, ticks: { stepSize: 1 } } } : undefined,
    };

    const revenueChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true },
            title: { display: true, text: 'Doanh thu 7 ngày qua' },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (tickValue: string | number): string =>
                        typeof tickValue === 'number' ? `${tickValue.toLocaleString()} VNĐ` : tickValue,
                },
            },
        },
    };

    const openAddProductPopup = (): void => {
        setIsAddProductOpen(true);
        setLastRequestTime(Date.now());
    };

    const closeAddProductPopup = (): void => {
        setIsAddProductOpen(false);
    };

    const handlePrevMonth = (): void => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
        setLastRequestTime(Date.now());
    };

    const handleNextMonth = (): void => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
        setLastRequestTime(Date.now());
    };

    const handleDateSelect = (fullDate: string): void => {
        setSelectedDate(fullDate);
        setLastRequestTime(Date.now());
    };

    const handleNavChange = (section: string): void => {
        setActiveSection(section);
        setLastRequestTime(Date.now());
    };

    const formatHeaderDate = (date: Date): string => {
        return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
    };

    const weekDays: WeekDay[] = getWeekDays(currentDate);

    const renderContent = () => {
        switch (activeSection) {
            case 'account':
                return <div className={styles.section_content}></div>;
            case 'revenue':
                return <div className={styles.section_content}>Quản lý doanh thu</div>;
            case 'feedback':
                return (
                    <div className={styles.section_content}>
                        <ErrorList />
                    </div>
                );
            case 'edit':
                return <div className={styles.section_content}>
                    <EditTemplate />
                </div>;
            default:
                return (
                    <div className={styles.main_content}>
                        <div className={styles.header} data-aos="fade-down">
                            {isLoading ? <Skeleton type="text" /> : <h1>{greeting}, Huỳnh Nam</h1>}
                        </div>

                        {error && (
                            <div className={styles.error} style={{ color: 'red', marginBottom: '20px' }}>
                                {error}
                            </div>
                        )}

                        <div className={styles.wrapper_header}>
                            <div className={styles.wrapper_header__left}>
                                <div className={styles.chart_section} data-aos="fade-up">
                                    <div className={styles.chart}>
                                        {isLoading ? (
                                            <Skeleton type="chart" />
                                        ) : apiData ? (
                                            chartType === 'bar' ? (
                                                <Bar data={orderChartData} options={chartOptions} />
                                            ) : templateChartData.labels.length > 0 ? (
                                                <PolarArea
                                                    style={{ margin: 'auto' }}
                                                    data={templateChartData}
                                                    options={chartOptions}
                                                />
                                            ) : (
                                                <p>Không có dữ liệu template để hiển thị</p>
                                            )
                                        ) : (
                                            <p>Không có dữ liệu để hiển thị</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.left_footer} data-aos="fade-up" data-aos-delay="200">
                                    <div className={styles.box_left}>
                                        <h3>Chi tiết thanh toán</h3>
                                        <div className={styles.list_of_responses}>
                                            {isLoading ? (
                                                <>
                                                    {Array.from({ length: 3 }).map((_, index: number) => (
                                                        <div key={index} className={styles.response_item}>
                                                            <Skeleton type="box" />
                                                        </div>
                                                    ))}
                                                </>
                                            ) : apiData && apiData.completedPayments.length > 0 ? (
                                                apiData.completedPayments.slice(0, 5).map((payment: Payment) => (
                                                    <div key={payment.paymentId} className={styles.response_item}>
                                                        <span>
                                                            Success {payment.paymentId} -{' '}
                                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                                        </span>
                                                        <span className={styles.Processed}>
                                                            {payment.amount.toLocaleString()} VNĐ
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>Không có thanh toán hoàn tất</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.box_right}>
                                        <h3>Tổng đơn hàng bị hủy</h3>
                                        {isLoading ? (
                                            <Skeleton type="small" />
                                        ) : (
                                            <p style={{ color: 'red' }}>{apiData?.totalCanceledOrders ?? 0}</p>
                                        )}
                                        <h3>Server status</h3>
                                        <p
                                            style={{
                                                color:
                                                    serverStatus === 'online'
                                                        ? 'green'
                                                        : serverStatus === 'rebuilding...'
                                                          ? 'orange'
                                                          : 'gray',
                                            }}
                                        >
                                            {serverStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.header__right}>
                                <div className={styles.date_section}>
                                    <div className={styles.date_section__header}>
                                        <FontAwesomeIcon icon={faChevronLeft} onClick={handlePrevMonth} />
                                        <span>{formatHeaderDate(currentDate)}</span>
                                        <FontAwesomeIcon icon={faChevronRight} onClick={handleNextMonth} />
                                    </div>

                                    <div className={styles.flex_date_section}>
                                        {weekDays.map((day: WeekDay, index: number) => (
                                            <div
                                                key={index}
                                                className={`${styles.date} ${day.isCurrent ? styles.currentDate : ''} ${
                                                    day.fullDate === selectedDate ? styles.selectedDate : ''
                                                }`}
                                                onClick={() => handleDateSelect(day.fullDate)}
                                            >
                                                <span>{day.day}</span>
                                                <span>{day.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.Revenue_box} data-aos="fade-left">
                                    <h3>Doanh thu</h3>
                                    <div className={styles.chart}>
                                        {isLoading ? (
                                            <Skeleton type="chart" />
                                        ) : apiData ? (
                                            <Line data={revenueChartData} options={revenueChartOptions} />
                                        ) : (
                                            <p>Không có dữ liệu để hiển thị</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.total_client} data-aos="fade-left" data-aos-delay="200">
                                    <div className={styles.client}>
                                        <h4>Tổng số Template</h4>
                                        {isLoading ? <Skeleton type="small" /> : <p>{apiData?.totalTemplates ?? 0}</p>}
                                    </div>
                                    <div className={styles.client}>
                                        <h4>Template sử dụng</h4>
                                        {isLoading ? (
                                            <Skeleton type="small" />
                                        ) : (
                                            <p>
                                                {apiData?.templateUsage.reduce(
                                                    (sum: number, t: TemplateUsage) => sum + t.usageCount,
                                                    0
                                                ) ?? 0}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.Most_used_model} data-aos="fade-left" data-aos-delay="400">
                                    <h3>Mẫu được sử dụng nhiều nhất</h3>
                                    <FontAwesomeIcon
                                        icon={faChartSimple}
                                        style={{ cursor: 'pointer' }}
                                        onClick={toggleChartType}
                                        title={`Chuyển sang ${chartType === 'bar' ? 'Polar Area' : 'Bar'} Chart`}
                                    />
                                </div>

                                <div className={styles.template} data-aos="fade-left" data-aos-delay="400">
                                    <h3>Mẫu Template đang có</h3>
                                    <div className={styles.template_wrapper_item}>
                                        {isLoading ? (
                                            <>
                                                {Array.from({ length: 3 }).map((_, index: number) => (
                                                    <span key={index} className={styles.template_item}>
                                                        <Skeleton type="small" />
                                                    </span>
                                                ))}
                                            </>
                                        ) : apiData && apiData.allTemplates.length > 0 ? (
                                            apiData.allTemplates.map((template: Template) => (
                                                <span key={template.templateId} className={styles.template_item}>
                                                    {template.templateName}
                                                </span>
                                            ))
                                        ) : (
                                            <p>Không có template</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboard_wrapper}>
                <Navigation onNavChange={handleNavChange} onAddProduct={openAddProductPopup} />
                {renderContent()}
            </div>
            {isAddProductOpen && <AddProduct onClose={closeAddProductPopup} />}
        </div>
    );
};

export default Dashboard;
