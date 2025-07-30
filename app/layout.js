// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          {/* 2. Add the Toaster component here */}
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
      </body>
    </html>
  );
}