import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://placehold.co https://firebasestorage.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "object-src 'self' blob: https://firebasestorage.googleapis.com",
              "connect-src 'self' https://*.firebaseio.com https://firebasestorage.googleapis.com https://*.googleapis.com",
            ].join('; '),
          },
        ],
      },
    ];
  },

  allowedDevOrigins: [
    'https://3000-firebase-studio-1750783629417.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev',
  ],
};

export default nextConfig;
