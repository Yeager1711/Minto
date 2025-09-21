'use client';

import 'normalize.css';
import './GlobalStyles/GlobalStyles.css';
import Header from './pages/DefaultLayouts/Header/page';
import { ApiProvider } from './lib/apiContext/apiContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'aos/dist/aos.css';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Định nghĩa interface cho props của RootLayoutContent
interface RootLayoutContentProps {
    children: React.ReactNode;
}

// Component RootLayoutContent nhận children làm prop
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

// Định nghĩa interface cho props của RootLayout
interface RootLayoutProps {
    children: React.ReactNode;
}

// Component RootLayout
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
            </head>
            <body>
                <Suspense fallback={<div>Loading...</div>}>
                    <RootLayoutContent>{children}</RootLayoutContent> {/* Sửa ở đây */}
                </Suspense>
            </body>
        </html>
    );
}
