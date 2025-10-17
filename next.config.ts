import type { NextConfig } from "next";

const repoBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const normalizedBasePath = repoBasePath ? `/${repoBasePath.replace(/^\/|\/$/g, "")}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: normalizedBasePath || undefined,
  assetPrefix: normalizedBasePath || undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
