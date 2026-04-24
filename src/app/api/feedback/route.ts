import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { feedback, userId, email } = await req.json();

    console.log('--- NEW FEEDBACK RECEIVED ---');
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Feedback:', feedback);
    console.log('-----------------------------');

    // In a real app, you'd save this to Supabase or send an email.
    // For now, we'll return success to keep the UI happy.

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Failed to vault feedback.' },
      { status: 500 }
    );
  }
}
