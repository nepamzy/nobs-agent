import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7's driver-adapter architecture (@prisma/client + pg) needs to
  // stay as real Node packages rather than get bundled by Turbopack —
  // without this, production builds fail to resolve the native pg driver.
  serverExternalPackages: ["@prisma/client", "pg"],
};

export default nextConfig;
