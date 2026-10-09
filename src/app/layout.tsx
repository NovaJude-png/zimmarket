import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ZimMarket — Buy & Sell in Zimbabwe',
    template: '%s | ZimMarket',
  },
  description: 'Zimbabwe\'s premier marketplace. Buy and sell cars, phones, electronics, property, furniture, fashion, and more across Harare, Bulawayo, Mutare, and 12+ cities. Built by Nova Tech.',
  keywords: ['Zimbabwe marketplace', 'buy sell Zimbabwe', 'Harare marketplace', 'cars Zimbabwe', 'property Zimbabwe', 'electronics Zimbabwe', 'ZimMarket', 'Nova Tech'],
  authors: [{ name: 'Nova Tech', url: 'https://github.com/NovaJude-png' }],
  creator: 'Nova Tech',
  publisher: 'ZimMarket',
  openGraph: {
    type: 'website',
    locale: 'en_ZW',
    siteName: 'ZimMarket',
    title: 'ZimMarket — Buy & Sell in Zimbabwe',
    description: 'Zimbabwe\'s premier marketplace for buying and selling.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZimMarket — Buy & Sell in Zimbabwe',
    description: 'Zimbabwe\'s premier marketplace for buying and selling.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇿🇼</text></svg>" />
      </head>
      <body className="min-h-screen bg-[#0A0A0F] antialiased">
        {children}
      </body>
    </html>
  );
}