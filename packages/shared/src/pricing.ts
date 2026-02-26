export function applyMarkup(basePrice: number, markupPercent: number): number {
  const computed = basePrice * (1 + markupPercent / 100);
  return Math.round(computed * 100) / 100;
}

export function clampMarkup(markupPercent: number): number {
  if (markupPercent < 0) {
    return 0;
  }
  if (markupPercent > 200) {
    return 200;
  }
  return markupPercent;
}
