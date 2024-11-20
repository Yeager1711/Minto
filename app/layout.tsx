import 'normalize.css'; // Import CSS reset
import './GlobalStyles/GlobalStyles.scss'; // Import global SCSS styles
import Header from './pages/DefaultLayouts/Header/page';

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
      </body>
    </html>
  );
}

