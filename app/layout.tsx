import type { Metadata } from 'next';
import '../src/index.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Arot Express',
  description: 'তাজা পাইকারি ও খুচরা মুদি বাজার',
  openGraph: {
    title: 'Arot Express',
    description: 'তাজা পাইকারি ও খুচরা মুদি বাজার',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arot Express',
    description: 'তাজা পাইকারি ও খুচরা মুদি বাজার',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23006C4C'/%3E%3Ctext x='32' y='35' text-anchor='middle' dominant-baseline='central' fill='%23FFFFFF' font-family='sans-serif' font-weight='900' font-size='34'%3EAE%3C/text%3E%3C/svg%3E" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23006C4C'/%3E%3Ctext x='32' y='35' text-anchor='middle' dominant-baseline='central' fill='%23FFFFFF' font-family='sans-serif' font-weight='900' font-size='34'%3EAE%3C/text%3E%3C/svg%3E" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="root">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
