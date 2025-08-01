// C:\Users\shop\global-batteries-dashboard\next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // For placeholder images in the Sidebar
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // For placeholder images in local storage mode
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // For Firebase Storage images in live mode
      },
      // Add any other external image domains here if needed
    ],
  },
};

export default nextConfig;