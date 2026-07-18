import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly tell Turbopack that the project root is the `frontend/` folder,
  // silencing the "multiple lockfiles" workspace-root warning.
  turbopack: {
    root: path.resolve(__dirname),
  },

  transpilePackages: ["next-auth"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
