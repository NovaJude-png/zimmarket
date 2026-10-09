import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZimMarket - Zimbabwe\'s Premier Marketplace',
  description: 'Buy, sell, and discover everything in Zimbabwe. From cars and phones to property and services - ZimMarket connects buyers and sellers across Harare, Bulawayo, Mutare, and beyond.',
  keywords: 'Zimbabwe marketplace, buy sell Zimbabwe, Harare marketplace, cars Zimbabwe, property Zimbabwe, electronics Zimbabwe',
  openGraph: {
    title: 'ZimMarket - Zimbabwe\'s Premier Marketplace',
    description: 'Buy, sell, and discover everything in Zimbabwe.',
    type: 'website',
    locale: 'en_ZW',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1B4D3E" />
      </head>
      <body className="min-h-screen bg-[#FAFAF8] antialiased">
        {children}
      </body>
    </html>
  );
}