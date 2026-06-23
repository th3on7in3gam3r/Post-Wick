/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/signup.html", destination: "/sign-up", permanent: false },
      { source: "/login.html", destination: "/sign-in", permanent: false },
      { source: "/content-plan.html", destination: "/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
