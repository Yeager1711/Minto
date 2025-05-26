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
    ArcElement,
    RadialLinearScale,
    TooltipItem, // Add this import
} from 'chart.js';
import { Bar, PolarArea } from 'react-chartjs-2';
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
} from '@fortawesome/free-solid-svg-icons';
import styles from './dashboard.module.css';
import AddProduct from '../popup/add_template/addTemplates';
import Skeleton from './Skeleton';

// Register ChartJS components
ChartJS.register(
    BarElement,
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
interface ApiData {
    revenue: {
        dailyRevenue: { date: string; totalAmount: number }[];
        totalRevenue: number;
    };
    totalCanceledOrders: number;
    completedPayments: { paymentId: number; paymentDate: string; amount: number }[];
    canceledPayments?: { paymentId: number; paymentDate: string; amount: number }[];
    totalTemplates: number;
    templateUsage: { templateId: number; templateName: string; usageCount: number }[];
    allTemplates: { templateId: number; templateName: string }[];
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string | string[];
        borderRadius?: number | number[];
    }[];
}

const apiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

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

const Dashboard: React.FC = () => {
    const [apiData, setApiData] = React.useState<ApiData | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [chartType, setChartType] = React.useState<'bar' | 'polar'>('bar');
    const [greeting, setGreeting] = React.useState<string>(getGreeting());
    const [isAddProductOpen, setIsAddProductOpen] = React.useState<boolean>(false);
    const [serverStatus, setServerStatus] = React.useState<string>('sleeping');
    const [lastRequestTime, setLastRequestTime] = React.useState<number>(Date.now());
    const [onlineSince, setOnlineSince] = React.useState<number | null>(null); // Thêm state để lưu thời gian chuyển sang online

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

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setServerStatus('rebuilding...');
                setLastRequestTime(Date.now());

                const data = await fetchStatistics(
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                );
                setApiData(data);
                setServerStatus('online');
                setOnlineSince(Date.now()); // Lưu thời gian chuyển sang online
                console.log('API Data:', data);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu';
                console.error('Lỗi khi lấy dữ liệu:', error);
                setError(errorMessage);
                setServerStatus('sleeping');
                setOnlineSince(null); // Reset onlineSince nếu có lỗi
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const checkServerStatus = () => {
            const now = Date.now();

            // Kiểm tra trạng thái không hoạt động chỉ khi serverStatus là "online"
            if (serverStatus === 'online' && onlineSince) {
                const timeSinceOnline = (now - onlineSince) / 1000; // Thời gian kể từ khi online (giây)

                // Kiểm tra thời gian không hoạt động kể từ lastRequestTime
                const inactivityTime = (now - lastRequestTime) / 1000; // Thời gian không có request (giây)

                // Chuyển sang "sleeping" nếu đã online ít nhất 1 phút VÀ không có request trong 1 phút
                if (timeSinceOnline >= 60 && inactivityTime >= 60) {
                    setServerStatus('sleeping');
                    setOnlineSince(null); // Reset onlineSince khi chuyển sang sleeping
                }
            }
        };

        const interval = setInterval(checkServerStatus, 10000); // Kiểm tra mỗi 10 giây
        return () => clearInterval(interval);
    }, [lastRequestTime, serverStatus, onlineSince]);

    const toggleChartType = () => {
        setChartType((prev) => (prev === 'bar' ? 'polar' : 'bar'));
        setLastRequestTime(Date.now());
    };

    const mostUsedTemplate = React.useMemo(() => {
        if (!apiData || apiData.templateUsage.length === 0) {
            return { name: 'Không có dữ liệu', percentage: 0 };
        }

        const totalUsage = apiData.templateUsage.reduce((sum, template) => sum + template.usageCount, 0);
        const mostUsed = apiData.templateUsage.reduce((max, template) =>
            template.usageCount > max.usageCount ? template : max
        );
        const percentage = totalUsage > 0 ? (mostUsed.usageCount / totalUsage) * 100 : 0;

        return { name: mostUsed.templateName, percentage: percentage.toFixed(2) };
    }, [apiData]);

    const orderChartData: ChartData = React.useMemo(() => {
        if (!apiData) {
            return { labels: [], datasets: [] };
        }

        const last7Days = getLast7Days(new Date());
        const completedOrdersByDate: { [key: string]: number } = {};
        const canceledOrdersByDate: { [key: string]: number } = {};

        last7Days.forEach((date) => {
            completedOrdersByDate[date] = 0;
            canceledOrdersByDate[date] = 0;
        });

        apiData.completedPayments.forEach((payment) => {
            const date = payment.paymentDate.split('T')[0];
            if (completedOrdersByDate[date] !== undefined) {
                completedOrdersByDate[date]++;
            }
        });

        if (apiData.canceledPayments && apiData.canceledPayments.length > 0) {
            apiData.canceledPayments.forEach((payment) => {
                const date = payment.paymentDate.split('T')[0];
                if (canceledOrdersByDate[date] !== undefined) {
                    canceledOrdersByDate[date]++;
                }
            });
        } else if (apiData.totalCanceledOrders > 0) {
            canceledOrdersByDate['2025-05-24'] = apiData.totalCanceledOrders;
        }

        const chartData: ChartData = {
            labels: last7Days,
            datasets: [
                {
                    label: 'Đơn hàng hoàn tất',
                    data: last7Days.map((date) => completedOrdersByDate[date]),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderRadius: 6,
                },
                {
                    label: 'Đơn hàng bị hủy',
                    data: last7Days.map((date) => canceledOrdersByDate[date]),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderRadius: 6,
                },
            ],
        };

        console.log('Order Chart Data:', chartData);
        return chartData;
    }, [apiData]);

    const templateChartData: ChartData = React.useMemo(() => {
        if (!apiData || apiData.templateUsage.length === 0) {
            return { labels: [], datasets: [] };
        }

        const totalUsage = apiData.templateUsage.reduce((sum, template) => sum + template.usageCount, 0);
        const labels = apiData.templateUsage.map((template) => template.templateName);
        const data = apiData.templateUsage.map((template) =>
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

        console.log('Template Chart Data:', chartData);
        return chartData;
    }, [apiData]);

    const revenueChartData: ChartData = React.useMemo(() => {
        if (!apiData) {
            return { labels: [], datasets: [] };
        }

        const last7Days = getLast7Days(new Date());
        const revenueByDate: { [key: string]: number } = {};

        last7Days.forEach((date) => {
            revenueByDate[date] = 0;
        });

        apiData.revenue.dailyRevenue.forEach((revenue) => {
            const date = revenue.date.split('T')[0];
            if (revenueByDate[date] !== undefined) {
                revenueByDate[date] = revenue.totalAmount;
            }
        });

        const chartData: ChartData = {
            labels: last7Days,
            datasets: [
                {
                    label: 'Doanh thu (VNĐ)',
                    data: last7Days.map((date) => revenueByDate[date]),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderRadius: 5,
                },
            ],
        };

        return chartData;
    }, [apiData]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: chartType === 'bar' ? 'Trạng thái đơn hàng' : 'Tỷ lệ sử dụng Template (%)',
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'bar' | 'polarArea'>) => {
                        if (context.dataset.label) {
                            if (chartType === 'polar') {
                                // Safely convert parsed to number via unknown
                                const value = context.parsed as unknown as number;
                                return `${context.dataset.label}: ${value.toFixed(2)}%`;
                            }
                            // For bar, access the y value
                            const value = (context.parsed as unknown as { y: number }).y;
                            return `${context.dataset.label}: ${value}`;
                        }
                        return 'No label available';
                    },
                },
            },
        },
        scales:
            chartType === 'bar'
                ? {
                      y: {
                          beginAtZero: true,
                          ticks: {
                              stepSize: 1,
                          },
                      },
                  }
                : undefined,
    };

    const revenueChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Doanh thu 7 ngày qua',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (tickValue: string | number) =>
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

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboard_wrapper}>
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
                                                {Array.from({ length: 3 }).map((_, index) => (
                                                    <div key={index} className={styles.response_item}>
                                                        <Skeleton type="box" />
                                                    </div>
                                                ))}
                                            </>
                                        ) : apiData && apiData.completedPayments.length > 0 ? (
                                            apiData.completedPayments.slice(0, 5).map((payment) => (
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
                                                    : serverStatus === 'rebuilding... '
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
                            <div className={styles.Revenue_box} data-aos="fade-left">
                                <h3>Doanh thu</h3>
                                <div className={styles.chart}>
                                    {isLoading ? (
                                        <Skeleton type="chart" />
                                    ) : apiData ? (
                                        <Bar data={revenueChartData} options={revenueChartOptions} />
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
                                    <h4>Template được sử dụng</h4>
                                    {isLoading ? (
                                        <Skeleton type="small" />
                                    ) : (
                                        <p>{apiData?.templateUsage.reduce((sum, t) => sum + t.usageCount, 0) ?? 0}</p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.Most_used_model} data-aos="fade-left" data-aos-delay="400">
                                <h3>Mẫu được sử dụng nhiều nhất</h3>
                                {isLoading ? (
                                    <Skeleton type="text" />
                                ) : (
                                    <p>{`${mostUsedTemplate.name} (${mostUsedTemplate.percentage}%)`}</p>
                                )}
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
                                            {Array.from({ length: 3 }).map((_, index) => (
                                                <span key={index} className={styles.template_item}>
                                                    <Skeleton type="small" />
                                                </span>
                                            ))}
                                        </>
                                    ) : apiData && apiData.allTemplates.length > 0 ? (
                                        apiData.allTemplates.map((template) => (
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
            </div>

            {isAddProductOpen && <AddProduct onClose={closeAddProductPopup} />}
        </div>
    );
};

export default Dashboard;
