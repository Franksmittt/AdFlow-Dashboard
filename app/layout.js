import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from './context/AppContext'; // 1. Add this import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AdFlow Hub", // You can keep your title or use this one
  description: "Your personal Facebook Ads command center.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2. Wrap the children with AppProvider */}
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}