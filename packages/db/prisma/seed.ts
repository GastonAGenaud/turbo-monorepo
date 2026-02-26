import bcrypt from "bcryptjs";
import { PrismaClient, ProductSource, Role, StockStatus } from "@prisma/client";

import { applyMarkup } from "@ggseeds/shared";

const prisma = new PrismaClient();

async function main() {
  const markupPercent = Number(process.env.MARKUP_PERCENT_DEFAULT ?? 15);
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ggseeds.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin1234!";

  await prisma.setting.upsert({
    where: { key: "defaultMarkupPercent" },
    update: { value: String(markupPercent) },
    create: { key: "defaultMarkupPercent", value: String(markupPercent) },
  });

  const hash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, passwordHash: hash },
    create: {
      email: adminEmail,
      passwordHash: hash,
      role: Role.ADMIN,
      profile: {
        create: {
          name: "Administrador GGseeds",
        },
      },
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "feminizadas" },
      update: {},
      create: { name: "Feminizadas", slug: "feminizadas" },
    }),
    prisma.category.upsert({
      where: { slug: "autoflorecientes" },
      update: {},
      create: { name: "Autoflorecientes", slug: "autoflorecientes" },
    }),
    prisma.category.upsert({
      where: { slug: "cbd" },
      update: {},
      create: { name: "CBD", slug: "cbd" },
    }),
  ]);

  const manualProducts = [
    {
      sku: "GGS-MAN-001",
      slug: "canal-haze-fem",
      name: "Canal Haze Fem",
      brand: "GGseeds",
      description: "Sativa dominante con perfil cítrico y floral.",
      basePrice: 22000,
      stock: 12,
      categoryId: categories[0].id,
      tags: ["sativa", "interior"],
      images: ["https://images.unsplash.com/photo-1462331940025-496dfbfc7564"],
    },
    {
      sku: "GGS-MAN-002",
      slug: "jordaan-kush-auto",
      name: "Jordaan Kush Auto",
      brand: "GGseeds",
      description: "Autofloreciente de ciclo corto y alta resistencia.",
      basePrice: 18500,
      stock: 20,
      categoryId: categories[1].id,
      tags: ["auto", "resistente"],
      images: ["https://images.unsplash.com/photo-1458966480358-a0ac42de0a7a"],
    },
    {
      sku: "GGS-MAN-003",
      slug: "amstel-cbd-balance",
      name: "Amstel CBD Balance",
      brand: "GGseeds",
      description: "Genética equilibrada THC/CBD para uso terapéutico.",
      basePrice: 21000,
      stock: 7,
      categoryId: categories[2].id,
      tags: ["cbd", "balance"],
      images: ["https://images.unsplash.com/photo-1465101046530-73398c7f28ca"],
    },
    {
      sku: "GGS-MAN-004",
      slug: "neon-skunk-fem",
      name: "Neon Skunk Fem",
      brand: "GGseeds",
      description: "Aroma intenso y floración media.",
      basePrice: 24000,
      stock: 9,
      categoryId: categories[0].id,
      tags: ["feminizada", "aromatica"],
      images: ["https://images.unsplash.com/photo-1516528387618-afa90b13e000"],
    },
    {
      sku: "GGS-MAN-005",
      slug: "dam-diesel-auto",
      name: "Dam Diesel Auto",
      brand: "GGseeds",
      description: "Auto compacta ideal para balcón.",
      basePrice: 19900,
      stock: 15,
      categoryId: categories[1].id,
      tags: ["auto", "compacta"],
      images: ["https://images.unsplash.com/photo-1448375240586-882707db888b"],
    },
  ];

  for (const item of manualProducts) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        ...item,
        source: ProductSource.MANUAL,
        stockStatus: item.stock > 0 ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK,
        markupPercent,
        finalPrice: applyMarkup(item.basePrice, markupPercent),
      },
      create: {
        ...item,
        source: ProductSource.MANUAL,
        stockStatus: item.stock > 0 ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK,
        markupPercent,
        finalPrice: applyMarkup(item.basePrice, markupPercent),
      },
    });
  }

  console.log(`Seed listo. Admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
