'use client';

import 'normalize.css';
import './GlobalStyles/GlobalStyles.css';
import Header from './pages/DefaultLayouts/Header/page';
import { ApiProvider } from './lib/apiContext/apiContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'aos/dist/aos.css';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Loading from './pages/DefaultLayouts/Loading_default/Loading';

// Định nghĩa interface cho props của RootLayoutContent
interface RootLayoutContentProps {
    children: React.ReactNode;
}

function RootLayoutContent({ children }: RootLayoutContentProps) {
    const searchParams = useSearchParams();
    const templateId = searchParams.get('templateId');
    const checkOut = searchParams.get('checkOut') === 'true';
    const shouldShowDynamicSystem = templateId && checkOut;

    return (
        <ApiProvider>
            {!shouldShowDynamicSystem && <Header />}
            <main className="container">{children}</main>
            <ToastContainer />
        </ApiProvider>
    );
}

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    // Detect Safari
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('safari') && !ua.includes('chrome')) {
            document.body.classList.add('safari');
        }
    }, []);

    return (
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
            </head>
            <body>
                {/* SVG filter global đặt ở đây */}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                        <filter id="gooey">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                            <feColorMatrix
                                in="blur"
                                mode="matrix"
                                values="
                                    1 0 0 0 0
                                    0 1 0 0 0
                                    0 0 1 0 0
                                    0 0 0 20 -10"
                                result="gooey"
                            />
                            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
                        </filter>
                    </defs>
                </svg>

                

                <Suspense fallback={<Loading />}>
                    <RootLayoutContent>{children}</RootLayoutContent>
                </Suspense>
            </body>
        </html>
    );
}
