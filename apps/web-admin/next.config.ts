import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/ui-bricks", "@repo/database", "@repo/config"],
  reactCompiler: true,
};

export default nextConfig;
