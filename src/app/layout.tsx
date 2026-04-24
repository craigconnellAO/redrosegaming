import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Red Rose Gaming 🌹',
  description: 'A private family video channel for Rose',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
