import { db } from "@ggseeds/db";
import { ADMIN_WHATSAPP_DISPLAY, MANUAL_PAYMENT_COPY, SHIPPING_COPY, checkoutSchema } from "@ggseeds/shared";

export async function createOrderFromCheckout(input: unknown, userId?: string) {
  const payload = checkoutSchema.parse(input);

  const products = await db.product.findMany({
    where: {
      id: {
        in: payload.items.map((item: any) => item.productId),
      },
      isActive: true,
    },
  });

  const productById = new Map<string, any>(products.map((product: any) => [String(product.id), product] as [string, any]));

  const orderItems = payload.items.map((item: any) => {
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
      notes: [payload.notes, `${MANUAL_PAYMENT_COPY} ${SHIPPING_COPY} Contacto admin: ${ADMIN_WHATSAPP_DISPLAY}.`]
        .filter(Boolean)
        .join("\n\n"),
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
