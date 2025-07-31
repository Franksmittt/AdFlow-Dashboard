// C:\Users\shop\global-batteries-dashboard\next.config.mjs
/** @type {import('next').NextConfig} */ // Typo fixed here
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // For placeholder images like the user avatar
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // For Firebase Storage images
      },
      // Add any other external image domains here if needed
    ],
  },
};

export default nextConfig;