// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary'; // Import the new component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AdFlow Hub",
  description: "Your personal Facebook Ads command center.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:m-2 focus:bg-yellow-400 focus:text-gray-900 focus:rounded-lg">
          Skip to main content
        </a>
        <ErrorBoundary>
          <AppProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }}
            />
            {children}
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}