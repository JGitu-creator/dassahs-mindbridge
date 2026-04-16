import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType === 'architect_monthly' ? 'architect' : 'sovereign';

    if (userId) {
      // 1. Update the user's profile in Supabase to mark them as Paid
      const { error } = await supabase
        .from('profiles')
        .update({ is_paid: true, plan_type: planType })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile in Supabase:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      
      console.log(`Neural Sovereignty Unlocked for user ${userId}`);
    }
  }

  return NextResponse.json({ received: true });
}
