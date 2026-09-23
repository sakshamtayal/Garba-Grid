import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { Toaster } from 'react-hot-toast';
import { authOptions } from '@/lib/auth';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';
import WebsiteOrnateFrame from '@/components/layout/WebsiteOrnateFrame';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'GarbaGrid — Festival Matchmaking for Delhi Colleges',
    template: '%s | GarbaGrid',
  },
  description:
    'GarbaGrid is the premier Navratri matchmaking and social platform for Delhi college students. Find your dandiya partner, join college squads, discover events, and make the festival unforgettable.',
  keywords: [
    'Navratri',
    'garba',
    'dandiya',
    'Delhi colleges',
    'DTU',
    'NSUT',
    'matchmaking',
    'festival',
    'college social',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'GarbaGrid — Festival Matchmaking for Delhi Colleges',
    description:
      'Find your dandiya partner and squad for Navratri. Built for Delhi college students.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'GarbaGrid',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GarbaGrid — Festival Matchmaking for Delhi Colleges',
    description: 'Find your dandiya partner for Navratri.',
  },
  themeColor: '#0A0A16',
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.className} bg-bg-primary text-text-primary antialiased`}
        style={{ backgroundColor: '#FDF8ED' }}
      >
        <SessionProviderWrapper session={session}>
          {/* Royal Indian Ornate Frame (Viewport-wide) */}
          <WebsiteOrnateFrame />

          {children}

          {/* react-hot-toast with royal festive parchment theme */}
          <Toaster
            position="top-center"
            gutter={12}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFDF9',
                color: '#2A1810',
                border: '1.5px solid #D4AF37',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow:
                  '0 8px 30px rgba(140,100,40,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
                backdropFilter: 'blur(16px)',
                padding: '12px 18px',
                maxWidth: '380px',
              },
              success: {
                iconTheme: {
                  primary: '#E65100',
                  secondary: '#FFFDF9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FFFDF9',
                },
              },
            }}
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
