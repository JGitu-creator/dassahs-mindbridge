import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CREDIT_PACK_MAP: Record<string, number> = {
  '500': 500,
  '2000': 2000,
};

function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
  // timingSafeEqual throws on length mismatch — guard first.
  if (hmac.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') ?? '';
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? '';

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName = event?.meta?.event_name;

  if (eventName !== 'order_created') {
    return NextResponse.json({ received: true });
  }

  const orderId = String(event?.data?.id ?? '');
  const userEmail = event?.data?.attributes?.user_email ?? '';
  const variantName = event?.data?.attributes?.first_order_item?.variant_name ?? '';
  // Check longer keys first so bigger packs win if a name contains both numbers
  const creditsKey = Object.keys(CREDIT_PACK_MAP)
    .sort((a, b) => b.length - a.length)
    .find((k) => variantName.includes(k));
  const credits = creditsKey ? CREDIT_PACK_MAP[creditsKey] : 500;
  const amountCents = event?.data?.attributes?.total ?? 0;

  const supabase = createServiceClient();
  const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const user = userList?.users?.find(
    (u: { email?: string }) => u.email?.toLowerCase() === String(userEmail).toLowerCase()
  );

  if (!user) {
    console.error('Webhook: user not found for email', userEmail);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { error } = await supabase.rpc('topup_credits', {
    p_user_id: user.id,
    p_lemon_squeezy_order_id: orderId,
    p_credits_amount: credits,
    p_amount_cents: amountCents,
  });

  if (error) {
    console.error('Webhook: topup failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, credits_added: credits });
}
