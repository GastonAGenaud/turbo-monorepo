export interface ClientCartItem {
  productId: string;
  quantity: number;
}

function toCartItem(input: unknown): ClientCartItem | null {
  if (!input || typeof input !== "object") return null;

  const candidate = input as {
    productId?: unknown;
    id?: unknown;
    quantity?: unknown;
    product?: { id?: unknown } | null;
  };

  const productId =
    typeof candidate.productId === "string"
      ? candidate.productId
      : typeof candidate.id === "string"
        ? candidate.id
        : typeof candidate.product?.id === "string"
          ? candidate.product.id
          : null;

  const rawQuantity =
    typeof candidate.quantity === "number"
      ? candidate.quantity
      : Number(candidate.quantity ?? 1);

  if (!productId || !Number.isFinite(rawQuantity)) return null;

  const quantity = Math.min(Math.max(Math.trunc(rawQuantity), 1), 50);
  return { productId, quantity };
}

export function normalizeCartItems(input: unknown): ClientCartItem[] {
  if (!Array.isArray(input)) return [];

  const merged = new Map<string, number>();

  for (const candidate of input) {
    const item = toCartItem(candidate);
    if (!item) continue;

    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }

  return Array.from(merged.entries()).map(([productId, quantity]) => ({
    productId,
    quantity: Math.min(quantity, 50),
  }));
}

export function mergeCartItems(
  localItems: ClientCartItem[],
  remoteItems: ClientCartItem[],
): ClientCartItem[] {
  const local = normalizeCartItems(localItems);
  const remote = normalizeCartItems(remoteItems);
  const merged = new Map<string, ClientCartItem>();

  for (const item of local) {
    merged.set(item.productId, item);
  }

  for (const item of remote) {
    if (!merged.has(item.productId)) {
      merged.set(item.productId, item);
    }
  }

  return Array.from(merged.values());
}

export function extractProductsArray<T>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];

  if (
    input &&
    typeof input === "object" &&
    "items" in input &&
    Array.isArray((input as { items?: unknown }).items)
  ) {
    return (input as { items: T[] }).items;
  }

  return [];
}
