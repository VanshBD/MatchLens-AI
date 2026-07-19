import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { SkipLink } from '@/components/layout/SkipLink';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'MatchLens AI – Volunteer Copilot | FIFA World Cup 2026',
    template: '%s | MatchLens AI',
  },
  description:
    'AI-powered smart stadium operations platform for FIFA World Cup 2026. Real-time incident management, multilingual assistance, and operational intelligence for stadium volunteers and staff.',
  keywords: [
    'FIFA World Cup 2026',
    'stadium operations',
    'volunteer management',
    'AI assistant',
    'incident management',
  ],
  authors: [{ name: 'MatchLens AI Team' }],
  robots: 'noindex, nofollow', // internal tool
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#003366' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip navigation — WCAG 2.4.1 Bypass Blocks (Level A) */}
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
