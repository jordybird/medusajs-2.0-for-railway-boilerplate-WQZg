// next.config.js

/**
 * Make sure essential env vars exist before Next boots
 * (throws in dev if anything is missing)
 */
const checkEnvVariables = require("./check-env-variables")
checkEnvVariables()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Skip lint/TS errors during CI builds (optional)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  /**
   * Remote image hosts whitelist for <Image>
   * Add every domain your storefront loads media from.
   */
  images: {
    remotePatterns: [
      // ——— local dev ———
      { protocol: "http", hostname: "localhost" },

      // ——— site’s own base URL (handles both http & https) ———
      {
        protocol: process.env.NEXT_PUBLIC_BASE_URL?.startsWith("https")
          ? "https"
          : "http",
        hostname: process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, ""),
      },

      // ——— Medusa backend when running on a different host ———
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.replace(
          /^https?:\/\//,
          ""
        ),
      },

      // ——— Railway “bucket” service that serves product media ———
      {
        protocol: "https",
        hostname: "bucket-production-1694.up.railway.app",
        pathname: "/medusa-media/**", // optional guard
      },

      // ——— demo images shipped with the boilerplate (can delete later) ———
      { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
      { protocol: "https", hostname: "medusa-server-testing.s3.amazonaws.com" },
      { protocol: "https", hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com" },

      // ——— MinIO bucket (only if you enabled MINIO) ———
      ...(process.env.NEXT_PUBLIC_MINIO_ENDPOINT
        ? [
            {
              protocol: "https",
              hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT.replace(
                /^https?:\/\//,
                ""
              ),
            },
          ]
        : []),
    ],
  },

  // Expose the port to the server runtime (used by Medusa dev script)
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
}

module.exports = nextConfig
