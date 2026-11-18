import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'Sign in to save an Ask DJ question.' }, { status: 401 });

    const supabase = createServiceClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: 'Your session has expired.' }, { status: 401 });

    const body = await req.json();
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 2000) : '';
    const answer = typeof body.answer === 'string' ? body.answer.trim().slice(0, 12000) : '';
    if (!question || !answer) return NextResponse.json({ error: 'A question and answer are required.' }, { status: 400 });

    const { error } = await supabase.from('ask_dj_questions').insert({
      user_id: user.id,
      question,
      answer,
    });
    if (error) {
      console.error('Ask DJ save failed:', error.message);
      return NextResponse.json({ error: 'Ask DJ history is not available yet.' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ask DJ save error:', error);
    return NextResponse.json({ error: 'Ask DJ history is unavailable.' }, { status: 500 });
  }
}
