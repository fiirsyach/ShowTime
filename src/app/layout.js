import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../../context/AuthContext';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'ShowTime - Book Your Concert Tickets',
  description: 'Experience the best concerts with ShowTime',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="bg-dark text-white antialiased">
        <AuthProvider>
          <SiteSettingsProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0F172A',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                },
              }}
            />
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}