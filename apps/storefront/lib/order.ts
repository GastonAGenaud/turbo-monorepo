import { db } from "@ggseeds/db";
import { ADMIN_WHATSAPP_DISPLAY, MANUAL_PAYMENT_COPY, SHIPPING_COPY, checkoutSchema } from "@ggseeds/shared";

export async function createOrderFromCheckout(input: unknown, userId?: string) {
  const payload = checkoutSchema.parse(input);
  const email = payload.email ?? "sin-email@ggseeds.local";
  const addressLine1 = payload.addressLine1 ?? "A coordinar por WhatsApp";
  const city = payload.city ?? "A coordinar";
  const postalCode = payload.postalCode ?? "0000";

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
      email,
      phone: payload.phone,
      addressLine1,
      addressLine2: payload.addressLine2,
      city,
      postalCode,
      notes: [
        `Contacto principal del cliente: ${payload.phone}.`,
        payload.email ? `Email de seguimiento: ${payload.email}.` : "Sin email informado: seguimiento por WhatsApp.",
        payload.contactDetails ? `Referencia útil para coordinar: ${payload.contactDetails}` : null,
        payload.notes ? `Observaciones del cliente: ${payload.notes}` : null,
        !payload.addressLine1 ? "Dirección exacta pendiente de coordinación por WhatsApp." : null,
        `${MANUAL_PAYMENT_COPY} ${SHIPPING_COPY} Contacto admin: ${ADMIN_WHATSAPP_DISPLAY}.`,
      ]
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
