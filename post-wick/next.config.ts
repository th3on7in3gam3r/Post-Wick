import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/signup.html", destination: "/sign-up", permanent: false },
      { source: "/login.html", destination: "/sign-in", permanent: false },
      { source: "/content-plan.html", destination: "/dashboard", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
