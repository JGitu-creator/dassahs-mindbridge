import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function POST(req: Request) {
  try {
    const { feedback, userId, email } = await req.json();

    console.log('--- NEW FEEDBACK RECEIVED ---');
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Feedback:', feedback);
    console.log('-----------------------------');

    // Save to Supabase 'feedback_vault' table
    const { error } = await supabase
      .from('feedback_vault')
      .insert([
        { 
          user_id: userId || null, 
          email: email || 'anonymous', 
          content: feedback,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Failed to vault feedback.' },
      { status: 500 }
    );
  }
}
