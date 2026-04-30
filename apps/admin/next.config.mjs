/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ggseeds/db", "@ggseeds/shared", "@ggseeds/ui", "@ggseeds/scrapers"],
  serverExternalPackages: ["@prisma/client", "prisma", "playwright", "playwright-core"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "merlingrow.com" },
      { protocol: "https", hostname: "www.merlingrow.com" },
      { protocol: "https", hostname: "dutch-passion.ar" },
      { protocol: "https", hostname: "www.dutch-passion.ar" },
      { protocol: "https", hostname: "dutchpassion.com" },
      { protocol: "https", hostname: "www.dutchpassion.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**/*",
    ],
  },
};

export default nextConfig;
