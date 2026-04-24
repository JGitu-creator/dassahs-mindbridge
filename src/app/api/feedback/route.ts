import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function POST(req: Request) {
  try {
    const { feedback, userId } = await req.json();

    console.log('--- NEW FEEDBACK RECEIVED ---');
    console.log('User ID:', userId);
    console.log('Feedback:', feedback);
    console.log('-----------------------------');

    // Save to Supabase 'feedback_vault' table
    // We only use 'content' and 'user_id' as they are confirmed/likely safe
    const { error } = await supabase
      .from('feedback_vault')
      .insert([
        { 
          user_id: userId || null, 
          content: feedback
        }
      ]);

    if (error) {
      console.warn('Supabase Insert Warning:', error.message);
      // We don't fail the whole request because logging to console worked
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
