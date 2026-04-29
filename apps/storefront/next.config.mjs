/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ggseeds/db", "@ggseeds/shared", "@ggseeds/ui", "@ggseeds/scrapers"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**/*",
    ],
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
};

export default nextConfig;
