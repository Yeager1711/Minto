'use client';
import React, { useRef, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    Legend,
    CategoryScale,
    ArcElement,
    RadialLinearScale,
    Tooltip as ChartJSTooltip,
    TooltipItem,
} from 'chart.js';
import { Bar, PolarArea, Line } from 'react-chartjs-2';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from 'recharts';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faEye, faEyeSlash, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './dashboard.module.css';
import AddProduct from '../popup/add_template/addTemplates';
import Skeleton from './Skeleton';
import Navigation from '../navigations/navigations';
import ErrorList from '../error_list/page';
import EditTemplate from '../editTemplate/page';
import { useApi } from 'app/lib/apiContext/apiContext';
import * as echarts from 'echarts';

// Register ChartJS components
ChartJS.register(
    BarElement,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    ChartJSTooltip,
    Legend,
    CategoryScale,
    ArcElement,
    RadialLinearScale
);

interface UserProfile {
    user_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    created_at: string;
    role: {
        role_id: number;
        name: string;
    };
}

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
    payments: Payment[];
}

interface AreaChartData {
    name: string;
    completed: number;
    canceled: number;
}

interface ServerChartData {
    timestamp: number;
    responseTime: number;
    returnTime: number;
    status: string;
}

const apiUrl: string | undefined = process.env.NEXT_PUBLIC_APP_API_BASE_URL;

if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_APP_API_BASE_URL is not defined');
}

// Fetch statistics function (modified to fetch entire year)
const fetchStatistics = async (): Promise<ApiData> => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('Không tìm thấy accessToken trong localStorage');
    }

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1
    const endDate = new Date(currentYear, 11, 31); // December 31

    const response = await fetch(
        `${apiUrl}/payos/statistics?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

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

// Get all months in the current year for order chart
const getMonthsInYearForChart = (baseDate: Date): string[] => {
    const year = baseDate.getFullYear();
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
        months.push(`${year}-${String(i + 1).padStart(2, '0')}`);
    }
    return months;
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
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ];
    return months[month];
};

const Dashboard: React.FC = () => {
    const [apiData, setApiData] = React.useState<ApiData | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);
    const [chartType, setChartType] = React.useState<'bar' | 'area' | 'polar'>('bar');
    const [greeting, setGreeting] = React.useState<string>(getGreeting());
    const [isAddProductOpen, setIsAddProductOpen] = React.useState<boolean>(false);
    const [serverStatus, setServerStatus] = React.useState<string>('sleeping');
    const [lastRequestTime, setLastRequestTime] = React.useState<number>(Date.now());
    const [onlineSince, setOnlineSince] = React.useState<number | null>(null);
    const [activeSection, setActiveSection] = React.useState<string>('main');
    const [showTotalRevenue, setShowTotalRevenue] = React.useState<boolean>(false);
    const [showRealRevenue, setShowRealRevenue] = React.useState<boolean>(false);
    const [showVirtualRevenue, setShowVirtualRevenue] = React.useState<boolean>(false);
    const { getUserProfile } = useApi();
    const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

    // State and refs for server chart
    const [showServerChart, setShowServerChart] = useState<boolean>(true); // Default to true for initial render
    const [serverChartData, setServerChartData] = useState<ServerChartData[]>([]);
    const serverStatusRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null); // Use useRef for chart instance

    React.useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setServerStatus('rebuilding...');
                const startTime = Date.now();

                const [data, profile] = await Promise.all([fetchStatistics(), getUserProfile()]);
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                const returnTime = endTime - lastRequestTime;

                setApiData(data);
                setUserProfile(profile as unknown as UserProfile);
                setServerStatus('online');
                setOnlineSince(Date.now());
                setServerChartData((prev) => [
                    ...prev.slice(-10),
                    { timestamp: endTime, responseTime, returnTime, status: 'online' },
                ]);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu';
                setError(errorMessage);
                setServerStatus('sleeping');
                setOnlineSince(null);
                setServerChartData((prev) => [
                    ...prev.slice(-10),
                    { timestamp: Date.now(), responseTime: 0, returnTime: 0, status: 'sleeping' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [getUserProfile, lastRequestTime]);

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
        setChartType((prev: 'bar' | 'area' | 'polar') => (prev === 'bar' ? 'area' : 'bar'));
        setLastRequestTime(Date.now());
    };

    const showPolarChart = (): void => {
        setChartType('polar');
        setLastRequestTime(Date.now());
    };

    const toggleTotalRevenueVisibility = (): void => {
        setShowTotalRevenue((prev) => !prev);
        setLastRequestTime(Date.now());
    };

    const toggleRealRevenueVisibility = (): void => {
        setShowRealRevenue((prev) => !prev);
        setLastRequestTime(Date.now());
    };

    const toggleVirtualRevenueVisibility = (): void => {
        setShowVirtualRevenue((prev) => !prev);
        setLastRequestTime(Date.now());
    };

    const orderChartData = React.useMemo(() => {
        if (!apiData) {
            return { labels: [], datasets: [] };
        }

        const currentDate = new Date();
        const monthsInYear: string[] = getMonthsInYearForChart(currentDate);
        const completedOrdersByMonth: { [key: string]: number } = {};
        const canceledOrdersByMonth: { [key: string]: number } = {};

        monthsInYear.forEach((month: string) => {
            completedOrdersByMonth[month] = 0;
            canceledOrdersByMonth[month] = 0;
        });

        apiData.completedPayments.forEach((payment: Payment) => {
            const date = new Date(payment.paymentDate);
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            if (year === currentDate.getFullYear()) {
                completedOrdersByMonth[monthKey] = (completedOrdersByMonth[monthKey] || 0) + 1;
            }
        });

        if (apiData.canceledPayments && apiData.canceledPayments.length > 0) {
            apiData.canceledPayments.forEach((payment: Payment) => {
                const date = new Date(payment.paymentDate);
                const year = date.getFullYear();
                const month = date.getMonth();
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                if (year === currentDate.getFullYear()) {
                    canceledOrdersByMonth[monthKey] = (canceledOrdersByMonth[monthKey] || 0) + 1;
                }
            });
        } else if (apiData.totalCanceledOrders > 0) {
            const canceledPerMonth: number = Math.floor(apiData.totalCanceledOrders / 12);
            monthsInYear.forEach((month: string) => {
                canceledOrdersByMonth[month] = canceledPerMonth;
            });
            canceledOrdersByMonth[monthsInYear[0]] += apiData.totalCanceledOrders % 12;
        }

        const labels = monthsInYear.map((month) => getMonthName(parseInt(month.split('-')[1]) - 1));

        return {
            labels,
            datasets: [
                {
                    label: 'Đơn hàng hoàn tất',
                    data: monthsInYear.map((month: string) => completedOrdersByMonth[month] || 0),
                    backgroundColor: 'rgba(99, 161, 249, 0.8)',
                    borderRadius: 3,
                    borderWidth: 0,
                },
                {
                    label: 'Đơn hàng bị hủy',
                    data: monthsInYear.map((month: string) => canceledOrdersByMonth[month] || 0),
                    backgroundColor: 'rgba(215, 40, 40, 0.6)',
                    borderRadius: 3,
                    borderWidth: 0,
                },
            ],
        };
    }, [apiData]);

    const areaChartData = React.useMemo<AreaChartData[]>(() => {
        if (!apiData) {
            return [];
        }

        const currentDate = new Date();
        const monthsInYear: string[] = getMonthsInYearForChart(currentDate);
        const completedOrdersByMonth: { [key: string]: number } = {};
        const canceledOrdersByMonth: { [key: string]: number } = {};

        monthsInYear.forEach((month: string) => {
            completedOrdersByMonth[month] = 0;
            canceledOrdersByMonth[month] = 0;
        });

        apiData.completedPayments.forEach((payment: Payment) => {
            const date = new Date(payment.paymentDate);
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            if (year === currentDate.getFullYear()) {
                completedOrdersByMonth[monthKey] = (completedOrdersByMonth[monthKey] || 0) + 1;
            }
        });

        if (apiData.canceledPayments && apiData.canceledPayments.length > 0) {
            apiData.canceledPayments.forEach((payment: Payment) => {
                const date = new Date(payment.paymentDate);
                const year = date.getFullYear();
                const month = date.getMonth();
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                if (year === currentDate.getFullYear()) {
                    canceledOrdersByMonth[monthKey] = (canceledOrdersByMonth[monthKey] || 0) + 1;
                }
            });
        } else if (apiData.totalCanceledOrders > 0) {
            const canceledPerMonth: number = Math.floor(apiData.totalCanceledOrders / 12);
            monthsInYear.forEach((month: string) => {
                canceledOrdersByMonth[month] = canceledPerMonth;
            });
            canceledOrdersByMonth[monthsInYear[0]] += apiData.totalCanceledOrders % 12;
        }

        return monthsInYear.map((month: string, index: number) => ({
            name: getMonthName(index),
            completed: completedOrdersByMonth[month] || 0,
            canceled: canceledOrdersByMonth[month] || 0,
        }));
    }, [apiData]);

    const templateChartData = React.useMemo(() => {
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

        return {
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
    }, [apiData]);

    const revenueChartData = React.useMemo(() => {
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

        return {
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
                    borderColor: 'rgb(255, 124, 152)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    }, [apiData]);

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#fff',
                },
            },
            title: {
                display: true,
                text: `Trạng thái đơn hàng năm ${new Date().getFullYear()}`,
                color: '#6988f0',
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'bar'>): string => {
                        if (context.dataset.label) {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${value}`;
                        }
                        return 'No label available';
                    },
                },
                titleColor: '#fff',
                bodyColor: '#fff',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#fff',
                },
                grid: { display: false },
            },
            x: {
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45,
                    color: '#fff',
                },
                grid: { display: false },
            },
        },
    };

    const polarChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true },
            title: {
                display: true,
                text: 'Tỷ lệ sử dụng Template (%)',
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<'polarArea'>): string => {
                        if (context.dataset.label) {
                            const value = context.parsed.r;
                            return `${context.dataset.label}: ${value.toFixed(2)}%`;
                        }
                        return 'No label available';
                    },
                },
            },
        },
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

    useEffect(() => {
        if (showServerChart && chartRef.current) {
            // Initialize or reinitialize chart using useRef
            if (!chartInstanceRef.current) {
                chartInstanceRef.current = echarts.init(chartRef.current);
            }

            const chartInstance = chartInstanceRef.current;

            // Generate data similar to the demo if serverChartData is empty, otherwise use it
            const base = Date.now() - 19999 * 24 * 3600 * 1000; // Start 20,000 days ago
            const oneDay = 24 * 3600 * 1000;
            const date: string[] = []; // Explicitly typed as string[]
            const data = [Math.random() * 300];

            for (let i = 1; i < 20000; i++) {
                const now = new Date(base + oneDay * i); // Fixed var to const
                date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
                data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
            }

            // Use serverChartData if available, mapped to match the demo format
            const chartData =
                serverChartData.length > 0
                    ? serverChartData.map((d) => [new Date(d.timestamp).toLocaleDateString(), d.responseTime])
                    : data.map((value, index) => [date[index], value]);

            const option: echarts.EChartsOption = {
                title: {
                    text: '',
                    textStyle: { color: '#fff' },
                },
                tooltip: {
                    trigger: 'axis',
                    position: function (pt) {
                        return [pt[0], '10%'];
                    },
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: chartData.map((item) => item[0]),
                    axisLabel: { show: false }, // Hide x-axis labels
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%'],
                    axisLabel: { show: false }, // Hide y-axis labels
                },
                dataZoom: [
                    {
                        type: 'inside',
                        start: 0, // Start at 0% (full range)
                        end: 100, // Full range
                        show: false, // Hide the dataZoom control
                    },
                ],
                series: [
                    {
                        name: 'Server Response',
                        type: 'line',
                        symbol: 'none',
                        sampling: 'lttb',
                        itemStyle: {
                            color: 'rgb(255, 70, 131)',
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgb(255, 158, 68)' },
                                { offset: 1, color: 'rgb(255, 70, 131)' },
                            ]),
                        },
                        data: chartData.map((item) => item[1]),
                    },
                ],
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                animation: true,
            };

            chartInstance.setOption(option);

            const resizeHandler = () => chartInstance?.resize();
            window.addEventListener('resize', resizeHandler);

            // Cleanup on unmount or when showServerChart changes
            return () => {
                window.removeEventListener('resize', resizeHandler);
                chartInstance?.dispose();
                chartInstanceRef.current = null; // Clear the ref on cleanup
            };
        }
    }, [showServerChart, serverChartData]);

    const calcStrokeOffset = (current: number, total: number): string => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const progress = current / total;
        const offset = circumference * (1 - progress);
        return `${offset}px`;
    };

    const openAddProductPopup = (): void => {
        setIsAddProductOpen(true);
        setLastRequestTime(Date.now());
    };

    const closeAddProductPopup = (): void => {
        setIsAddProductOpen(false);
    };

    const handleNavChange = (section: string): void => {
        setActiveSection(section);
        setLastRequestTime(Date.now());
    };

    const totalRevenue = React.useMemo(() => {
        if (!apiData) return 0;
        const realRevenue = apiData.completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const virtualRevenue =
            apiData.canceledPayments && apiData.canceledPayments.length > 0
                ? apiData.canceledPayments.reduce((sum, payment) => sum + payment.amount, 0)
                : apiData.totalCanceledOrders * 99000;
        return realRevenue + virtualRevenue;
    }, [apiData]);

    const realRevenue = React.useMemo(() => {
        if (!apiData) return 0;
        return apiData.completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    }, [apiData]);

    const virtualRevenue = React.useMemo(() => {
        if (!apiData) return 0;
        return apiData.canceledPayments && apiData.canceledPayments.length > 0
            ? apiData.canceledPayments.reduce((sum, payment) => sum + payment.amount, 0)
            : apiData.totalCanceledOrders * 99000;
    }, [apiData]);

    const renderContent = () => {
        switch (activeSection) {
            case 'account':
                return <div className={styles.section_content}></div>;
            case 'revenue':
                return <div className={styles.section_content}>Quản lý</div>;
            case 'feedback':
                return (
                    <div className={styles.section_content}>
                        <ErrorList />
                    </div>
                );
            case 'edit':
                return (
                    <div className={styles.section_content}>
                        <EditTemplate />
                    </div>
                );
            default:
                return (
                    <div className={styles.main_content}>
                        <div className={styles.header} data-aos="fade-in" data-aos-delay="300">
                            {isLoading ? (
                                <Skeleton type="text" />
                            ) : (
                                <div className={styles.flex}>
                                    <div className={styles.greeting}>
                                        <h1>
                                            {greeting}, {userProfile?.full_name || '(Err Type User)'}👋
                                        </h1>
                                    </div>

                                    <div
                                        ref={serverStatusRef}
                                        className={`${styles.server_status} ${showServerChart ? styles.expanded : ''}`}
                                        onClick={() => setShowServerChart(!showServerChart)}
                                    >
                                        <div className={styles.status_text}>Server: {serverStatus}</div>
                                        {showServerChart && <div ref={chartRef} className={styles.chart_container} />}
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className={styles.error} style={{ color: 'red', marginBottom: '20px' }}>
                                {error}
                            </div>
                        )}

                        <div className={styles.wrapper_header}>
                            <div className={styles.wrapper_header__left}>
                                <div className={styles.wrapper_amount}>
                                    <div className={styles.Real_revenue} data-aos="zoom-out" data-aos-delay="500">
                                        <FontAwesomeIcon
                                            icon={showRealRevenue ? faEyeSlash : faEye}
                                            onClick={toggleRealRevenueVisibility}
                                            style={{ cursor: 'pointer' }}
                                            title={showRealRevenue ? 'Ẩn số dư' : 'Hiện số dư'}
                                        />
                                        <h3>
                                            {showRealRevenue ? `${realRevenue.toLocaleString()} VNĐ` : '****** VNĐ'}
                                        </h3>
                                        {isLoading ? <Skeleton type="small" /> : <span>Tổng doanh thu thật</span>}
                                    </div>

                                    <div className={styles.Virtual_revenue} data-aos="zoom-out" data-aos-delay="700">
                                        <FontAwesomeIcon
                                            icon={showVirtualRevenue ? faEyeSlash : faEye}
                                            onClick={toggleVirtualRevenueVisibility}
                                            style={{ cursor: 'pointer' }}
                                            title={showVirtualRevenue ? 'Ẩn số dư' : 'Hiện số dư'}
                                        />
                                        <h3>
                                            {showVirtualRevenue
                                                ? `${virtualRevenue.toLocaleString()} VNĐ`
                                                : '****** VNĐ'}
                                        </h3>
                                        {isLoading ? <Skeleton type="small" /> : <span>Tổng doanh thu ảo</span>}
                                    </div>

                                    <div className={styles.total_amount} data-aos="zoom-out" data-aos-delay="900">
                                        <FontAwesomeIcon
                                            icon={showTotalRevenue ? faEyeSlash : faEye}
                                            onClick={toggleTotalRevenueVisibility}
                                            style={{ cursor: 'pointer' }}
                                            title={showTotalRevenue ? 'Ẩn số dư' : 'Hiện số dư'}
                                        />
                                        <h3>
                                            {showTotalRevenue ? `${totalRevenue.toLocaleString()} VNĐ` : '****** VNĐ'}
                                        </h3>
                                        {isLoading ? <Skeleton type="small" /> : <span>Tổng doanh thu</span>}
                                    </div>
                                </div>

                                <div className={styles.Most_used_model} data-aos="zoom-out" data-aos-delay="500">
                                    <h3>Mẫu được sử dụng nhiều nhất</h3>
                                    <FontAwesomeIcon
                                        className={styles.change_chart}
                                        icon={faChartSimple}
                                        style={{ cursor: 'pointer' }}
                                        onClick={showPolarChart}
                                        title="Hiển thị Tỷ lệ sử dụng Template (%)"
                                    />
                                </div>

                                <div className={styles.chart_section}>
                                    <FontAwesomeIcon
                                        className={styles.change_chart}
                                        icon={faRotateLeft}
                                        style={{ cursor: 'pointer' }}
                                        onClick={toggleChartType}
                                        title={`Chuyển sang ${chartType === 'bar' ? 'Area' : 'Bar'} Chart`}
                                    />
                                    <div className={styles.chart}>
                                        {isLoading ? (
                                            <Skeleton type="chart" />
                                        ) : apiData ? (
                                            chartType === 'bar' ? (
                                                <Bar
                                                    data={orderChartData}
                                                    options={{
                                                        ...barChartOptions,
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                    }}
                                                />
                                            ) : chartType === 'area' ? (
                                                <div style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <AreaChart
                                                            data={areaChartData}
                                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis />
                                                            <RechartsTooltip />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="completed"
                                                                name="Đơn hàng hoàn tất"
                                                                stroke="#63A1F9"
                                                                fill="rgba(99, 161, 249, 0.8)"
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="canceled"
                                                                name="Đơn hàng bị hủy"
                                                                stroke="#D72828"
                                                                fill="rgba(215, 40, 40, 0.6)"
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : chartType === 'polar' ? (
                                                templateChartData.labels.length > 0 ? (
                                                    <PolarArea
                                                        style={{ margin: 'auto' }}
                                                        data={templateChartData}
                                                        options={{
                                                            ...polarChartOptions,
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                        }}
                                                    />
                                                ) : (
                                                    <p>Không có dữ liệu template để hiển thị</p>
                                                )
                                            ) : (
                                                <Bar
                                                    data={orderChartData}
                                                    options={{
                                                        ...barChartOptions,
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                    }}
                                                />
                                            )
                                        ) : (
                                            <p>Không có dữ liệu để hiển thị</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.left_footer}>
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
                                                            {showRealRevenue
                                                                ? `${payment.amount.toLocaleString()} VNĐ`
                                                                : 'xxx.xxx VNĐ'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>Không có thanh toán hoàn tất</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.box_right}>
                                        <h3 className={styles.title_cancel}>Tổng đơn hàng bị hủy</h3>
                                        {isLoading ? (
                                            <Skeleton type="small" />
                                        ) : (
                                            <p style={{ color: 'red' }}>{apiData?.totalCanceledOrders ?? 0}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.header__right}>
                                <div className={styles.Revenue_box}>
                                    <h3>Doanh thu theo tuần</h3>
                                    <div className={styles.chart}>
                                        {isLoading ? (
                                            <Skeleton type="chart" />
                                        ) : apiData ? (
                                            <Line
                                                data={revenueChartData}
                                                options={{
                                                    ...revenueChartOptions,
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                }}
                                            />
                                        ) : (
                                            <p>Không có dữ liệu để hiển thị</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.total_client}>
                                    <div className={styles.client}>
                                        <h3>Tổng số Template</h3>
                                        {isLoading ? (
                                            <Skeleton type="chart" />
                                        ) : apiData ? (
                                            <div className={styles.progressBar}>
                                                <svg width="100" height="100">
                                                    <circle className={styles.bg} cx="50%" cy="50%" r="40" />
                                                    <circle
                                                        className={styles.fg}
                                                        cx="50%"
                                                        cy="50%"
                                                        r="40"
                                                        style={{
                                                            strokeDasharray: `${2 * Math.PI * 40}px`,
                                                            strokeDashoffset: calcStrokeOffset(
                                                                apiData.totalTemplates,
                                                                apiData.totalTemplates || 1
                                                            ),
                                                        }}
                                                    />
                                                    <text
                                                        x="50%"
                                                        y="50%"
                                                        textAnchor="middle"
                                                        dy=".3em"
                                                        className={styles.progressText}
                                                        style={{ color: '#fff' }}
                                                        fill="#fff"
                                                    >
                                                        {`${apiData.totalTemplates || 0}/${apiData.totalTemplates || 0}`}
                                                    </text>
                                                </svg>
                                            </div>
                                        ) : (
                                            <p>Không có dữ liệu</p>
                                        )}
                                    </div>
                                    <div className={styles.client}>
                                        <h3>Template sử dụng</h3>
                                        {isLoading ? (
                                            <Skeleton type="chart" />
                                        ) : apiData ? (
                                            <div className={styles.progressBar}>
                                                <svg width="100" height="100">
                                                    <circle className={styles.bg} cx="50%" cy="50%" r="40" />
                                                    <circle
                                                        className={styles.fg}
                                                        cx="50%"
                                                        cy="50%"
                                                        r="40"
                                                        style={{
                                                            strokeDasharray: `${2 * Math.PI * 40}px`,
                                                            strokeDashoffset: calcStrokeOffset(
                                                                apiData.templateUsage.reduce(
                                                                    (sum, t) => sum + t.usageCount,
                                                                    0
                                                                ),
                                                                apiData.totalTemplates || 1
                                                            ),
                                                        }}
                                                    />
                                                    <text
                                                        x="50%"
                                                        y="50%"
                                                        textAnchor="middle"
                                                        dy=".3em"
                                                        className={styles.progressText}
                                                        fill="#fff"
                                                    >
                                                        {`${apiData.templateUsage.reduce((sum, t) => sum + t.usageCount, 0)}/${
                                                            apiData.totalTemplates || 0
                                                        }`}
                                                    </text>
                                                </svg>
                                            </div>
                                        ) : (
                                            <p>Không có dữ liệu</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.template}>
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
