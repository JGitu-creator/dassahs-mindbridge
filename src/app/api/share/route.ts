import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { title, data, userId } = await req.json();

    // Insert into history/shares table. Assuming we use 'history' for now
    // If there's a specific 'shares' table, we'd use that.
    // For anonymity, we might need a dedicated public 'shares' table.
    const { data: insertedData, error } = await supabase
      .from('history')
      .insert({
        user_id: userId || null,
        title: title || 'Shared Prism',
        data: data
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: insertedData.id });
  } catch (error: any) {
    console.error('Share API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
