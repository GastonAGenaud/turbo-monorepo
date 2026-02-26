/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ggseeds/db", "@ggseeds/shared", "@ggseeds/ui", "@ggseeds/scrapers"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
