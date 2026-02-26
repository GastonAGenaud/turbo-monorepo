import { db } from "@ggseeds/db";

export async function syncCart(userId: string, items: Array<{ productId: string; quantity: number }>) {
  const cart = await db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  if (items.length > 0) {
    await db.cartItem.createMany({
      data: items.map((item) => ({
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  }

  return db.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
