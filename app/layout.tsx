import 'normalize.css'; 
import './GlobalStyles/GlobalStyles.scss'; 
import Header from './pages/DefaultLayouts/Header/page';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container">{children}</main>
        <ToastContainer />
      </body>
    </html>
  );
}

