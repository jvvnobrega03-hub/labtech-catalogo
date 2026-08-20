/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forçar uso do Webpack em vez de Turbopack (compatibilidade com Hostinger)
  turbopack: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
