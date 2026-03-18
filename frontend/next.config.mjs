/** @type {import('next').NextConfig} */
const backendTarget = (process.env.BACKEND_URL || "http://localhost:5000").replace(
  /\/+$/,
  ""
);

const withBundleAnalyzer = (await import("@next/bundle-analyzer")).default({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = withBundleAnalyzer({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
});

export default nextConfig;
