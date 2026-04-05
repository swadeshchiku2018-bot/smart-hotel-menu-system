/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow any remote hostname so uploaded images display via next/image if used
    remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }],
  },
};

export default nextConfig;
