import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { isValidInternalToken } from '@/lib/server/internal-auth';

export const dynamic = 'force-dynamic';

/**
 * Best-effort refund after a failed generation.
 * Internal only: requires the x-prism-internal header issued by /api/chat,
 * plus the user's own sb-access-token cookie.
 */
export async function POST(req: NextRequest) {
  if (!isValidInternalToken(req.headers.get('x-prism-internal'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await req.json().catch(() => ({ amount: undefined }));
  if (!Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('refund_credits', {
    p_user_id: userData.user.id,
    p_amount: amount,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ balance: data });
}
