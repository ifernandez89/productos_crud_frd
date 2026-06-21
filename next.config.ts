import type { NextConfig } from "next";

// Bundle analyzer wrapper (enabled when ANALYZE=true).
// Try to require, but fall back when the package isn't installed (keeps build working).
let withBundleAnalyzer: any = (cfg: any) => cfg;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const _analyzer = require('@next/bundle-analyzer');
  withBundleAnalyzer = _analyzer({ enabled: process.env.ANALYZE === 'true' });
} catch (e) {
  // package not installed — continue without analyzer
}

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Produce a fully static export suitable for GitHub Pages
  output: 'export',
  // Base path and asset prefix only in production.
  basePath: isProduction ? '/productos_crud_frd' : '',
  assetPrefix: isProduction ? '/productos_crud_frd' : '',
  // Export basePath as env var for runtime consumption.
  env: {
    NEXT_PUBLIC_BASE_PATH: isProduction ? '/productos_crud_frd' : '',
  },
  images: {
    unoptimized: true,
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

};
export default withBundleAnalyzer(nextConfig);