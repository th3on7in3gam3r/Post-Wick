/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@atproto/oauth-client-node",
      "@atproto/oauth-client",
      "@atproto/api",
      "@atproto/jwk-jose",
    ],
  },
  async redirects() {
    return [
      { source: "/signup.html", destination: "/sign-up", permanent: false },
      { source: "/login.html", destination: "/sign-in", permanent: false },
      { source: "/content-plan.html", destination: "/dashboard", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/preparing-your-workspace", destination: "/" },
      { source: "/youre-in", destination: "/" },
    ];
  },
};

export default nextConfig;
