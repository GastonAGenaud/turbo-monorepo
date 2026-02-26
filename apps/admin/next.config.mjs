/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ggseeds/db", "@ggseeds/shared", "@ggseeds/ui", "@ggseeds/scrapers"],
  serverExternalPackages: ["playwright", "playwright-core"],
};

export default nextConfig;
