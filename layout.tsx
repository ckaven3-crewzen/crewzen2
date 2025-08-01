import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CrewZen',
  description: 'Manage your crew with ease.',
};

export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
});

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
