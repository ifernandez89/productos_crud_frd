import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.frandroid.com' },
      { protocol: 'https', hostname: 'servicelshop.com.mx' },
      { protocol: 'https', hostname: 'images.fravega.com' },
      { protocol: 'https', hostname: 'http2.mlstatic.com' },
      { protocol: 'https', hostname: 'www.megatone.net' },
      { protocol: 'https', hostname: 'medias.musimundo.com' },
      { protocol: 'https', hostname: 'www.komplett.no' },
      { protocol: 'https', hostname: 'naldoar.vtexassets.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aumenta el límite del tamaño del cuerpo a 10 MB
    },
  },
async redirects() {
    return [
      {
        source: "/login/page",
        destination: "/",
        permanent: false,
      },
    ];
  },
};
export default nextConfig;

module.exports = nextConfig;