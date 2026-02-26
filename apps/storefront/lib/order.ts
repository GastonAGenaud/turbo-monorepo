import { db } from "@ggseeds/db";
import { checkoutSchema } from "@ggseeds/shared";

export async function createOrderFromCheckout(input: unknown, userId?: string) {
  const payload = checkoutSchema.parse(input);

  const products = await db.product.findMany({
    where: {
      id: {
        in: payload.items.map((item) => item.productId),
      },
      isActive: true,
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));

  const orderItems = payload.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new Error(`Producto inválido: ${item.productId}`);
    }

    const unitPrice = Number(product.finalPrice);

    return {
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: item.quantity,
      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const order = await db.order.create({
    data: {
      userId,
      subtotal,
      total: subtotal,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2,
      city: payload.city,
      postalCode: payload.postalCode,
      notes: payload.notes,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: true,
    },
  });

  return order;
}
