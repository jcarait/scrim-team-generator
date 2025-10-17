import type { NextConfig } from "next";

function resolveBasePath() {
  const explicitBase = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (explicitBase) {
    return `/${explicitBase.replace(/^\/|\/$/g, "")}`;
  }

  if (process.env.GITHUB_ACTIONS === "true") {
    const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
    if (repoName && !/\.github\.io$/i.test(repoName)) {
      return `/${repoName.replace(/^\/|\/$/g, "")}`;
    }
  }

  return "";
}

const normalizedBasePath = resolveBasePath();

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
