interface Bucket {
  hits: number;
  expiresAt: number;
}

const store = new Map<string, Bucket>();

export function checkRateLimit(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.expiresAt < now) {
    store.set(key, { hits: 1, expiresAt: now + windowMs });
    return true;
  }

  if (existing.hits >= maxHits) {
    return false;
  }

  existing.hits += 1;
  return true;
}
