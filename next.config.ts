const nextConfig = {
  images: {
    domains: ["yrepouvyqitglfhsqofx.supabase.co"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true, // true para SEO si siempre será así
      },
    ];
  },
};

export default nextConfig;
