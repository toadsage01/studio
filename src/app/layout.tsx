import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import AppSessionProvider from '@/components/session-provider';
import DevBanner from '@/components/dev-banner';

export const metadata: Metadata = {
  title: 'FieldFlow',
  description: 'Sales Force Automation and Management',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppSessionProvider>
          <SidebarProvider>
            {children}
            {/* Dev-only banner showing data source and NEXTAUTH_URL mismatch */}
            <DevBanner />
          </SidebarProvider>
        </AppSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
