export const CREDIT_PACKS = [
  { credits: 500, price: 5, label: 'Starter Pack' },
  { credits: 2000, price: 15, label: 'Power Pack' },
] as const;

export function getCheckoutUrl(variantId?: string): string {
  const base = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL ?? '';
  if (!base) return '#';
  if (variantId) {
    return `${base}?variant=${variantId}`;
  }
  return base;
}
