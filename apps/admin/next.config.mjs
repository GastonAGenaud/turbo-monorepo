/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ggseeds/db", "@ggseeds/shared", "@ggseeds/ui", "@ggseeds/scrapers"],
  serverExternalPackages: ["@prisma/client", "prisma", "playwright", "playwright-core"],
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**/*",
    ],
  },
};

export default nextConfig;
