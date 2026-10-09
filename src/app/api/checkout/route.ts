import { NextResponse } from 'next/server';

const PLAN_VARIANTS: Record<string, string | undefined> = {
  architect_monthly: process.env.LEMON_SQUEEZY_ARCHITECT_VARIANT_ID,
  sovereign_lifetime: process.env.LEMON_SQUEEZY_SOVEREIGN_VARIANT_ID,
};

export async function POST(req: Request) {
  try {
    const { lookup_key, userId, email } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const base = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL;
    if (!base) return NextResponse.json({ error: 'Lemon Squeezy checkout is not configured.' }, { status: 503 });
    if (!PLAN_VARIANTS[lookup_key]) return NextResponse.json({ error: 'This plan is not configured yet.' }, { status: 404 });

    const url = new URL(base);
    url.searchParams.set('variant', PLAN_VARIANTS[lookup_key]!);
    url.searchParams.set('checkout[custom][user_id]', userId);
    url.searchParams.set('checkout[custom][plan_type]', lookup_key);
    if (email) url.searchParams.set('checkout[email]', email);
    return NextResponse.json({ url: url.toString() });
  } catch (error: any) {
    console.error('Lemon Squeezy Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Checkout could not be prepared.' }, { status: 500 });
  }
}
