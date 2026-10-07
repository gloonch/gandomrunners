import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a package-lock.json higher up in the home folder would otherwise be taken as the workspace root
  turbopack: { root: __dirname },
};

export default nextConfig;
