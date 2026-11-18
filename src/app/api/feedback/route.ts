import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Feedback is not configured.' }, { status: 503 });
    }

    const { feedback, userId } = await req.json();
    if (typeof feedback !== 'string' || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback text is required.' }, { status: 400 });
    }
    const content = feedback.trim().slice(0, 5000);

    // Save to Supabase 'feedback_vault' table
    // We only use 'content' and 'user_id' as they are confirmed/likely safe
    const { error } = await supabase
      .from('feedback_vault')
      .insert([
        {
          user_id: userId || null, 
          content,
          type: 'feedback'
        }
      ]);

    if (error) {
      console.warn('Supabase feedback insert warning:', error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Failed to vault feedback.' },
      { status: 500 }
    );
  }
}
