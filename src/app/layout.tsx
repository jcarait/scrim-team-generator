import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scrim Team Generator',
  description: 'Random generate teams for basketball scrimmages',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,_#fff4e5_0%,_#ffffff_45%,_#f3f0ff_100%)] text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
