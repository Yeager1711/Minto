import 'normalize.css';
import './GlobalStyles/GlobalStyles.css';
import Header from './pages/DefaultLayouts/Header/page';
import { ApiProvider } from './lib/apiContext/apiContext'; // Đảm bảo đường dẫn đúng
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'aos/dist/aos.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
               <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </head>
            <body>
                <ApiProvider>
                    <Header />
                    <main className="container">{children}</main>
                    <ToastContainer />
                </ApiProvider>
            </body>
        </html>
    );
}
