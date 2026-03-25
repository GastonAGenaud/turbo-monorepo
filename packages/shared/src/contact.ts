export const ADMIN_WHATSAPP_NUMBER = "5493513261149";
export const ADMIN_WHATSAPP_DISPLAY = "+54 9 351 326-1149";
export const ADMIN_WHATSAPP_BASE_URL = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}`;
export const SHIPPING_COPY = "Hacemos envíos coordinados a CABA y al resto del país.";
export const MANUAL_PAYMENT_COPY =
  "El pago se coordina directamente por WhatsApp una vez generado el pedido.";

export function buildWhatsAppUrl(message?: string) {
  if (!message) {
    return ADMIN_WHATSAPP_BASE_URL;
  }

  return `${ADMIN_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}

export function buildCheckoutWhatsAppMessage(orderId?: string) {
  const orderLabel = orderId ? `pedido ${orderId.slice(0, 8)}` : "mi pedido";
  return `Hola GGseeds, acabo de generar el ${orderLabel} y quiero coordinar pago, envío o retiro.`;
}
