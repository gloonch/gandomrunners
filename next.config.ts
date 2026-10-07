import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the server can't reach npm, so it runs a self-contained build made here (see deploy/deploy.sh)
  output: "standalone",
  // a package-lock.json higher up in the home folder would otherwise be taken as the workspace root
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
