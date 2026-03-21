import { PrismaClient, ProductSource } from "@prisma/client";

const USER_AGENT = "GGseedsBot/1.0 (+https://ggseeds-storefront.vercel.app)";

function extractOgImage(html) {
  const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  return match?.[1]?.trim() || null;
}

const db = new PrismaClient();

try {
  const products = await db.product.findMany({
    where: { source: ProductSource.MERLINGROW },
    select: {
      id: true,
      slug: true,
      sourceMeta: {
        select: { sourceUrl: true },
      },
    },
  });

  const repaired = [];

  for (const product of products) {
    const sourceUrl = product.sourceMeta?.sourceUrl;
    if (!sourceUrl) {
      continue;
    }

    const html = await fetch(sourceUrl, {
      headers: {
        "user-agent": USER_AGENT,
      },
    }).then((response) => response.text());

    const image = extractOgImage(html);
    if (!image) {
      continue;
    }

    await db.product.update({
      where: { id: product.id },
      data: { images: [image] },
    });

    repaired.push({ slug: product.slug, image });
  }

  console.log(JSON.stringify(repaired, null, 2));
} finally {
  await db.$disconnect();
}
