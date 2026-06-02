import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
<<<<<<< HEAD
    domains: ["yrepouvyqitglfhsqofx.supabase.co", "picsum.photos"],
=======
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: "/api/uploads/:path*" },
    ];
>>>>>>> main.ia
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
