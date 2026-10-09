import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount = parseInt(process.env.PRISM_CREDITS_PER_REQUEST ?? '10') } = await req.json().catch(() => ({}));

  // Guard: a negative/non-integer amount would otherwise mint credits.
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userData.user.id,
    p_amount: amount,
  });

  if (error) {
    if (error.message.includes('insufficient_credits')) {
      return NextResponse.json({ error: 'Insufficient credits', balance: 0 }, { status: 402 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ balance: data });
}
