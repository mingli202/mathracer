import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  experimental: {
    nodeMiddleware: true,
  },
};

export default nextConfig;
