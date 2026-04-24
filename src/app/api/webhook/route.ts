import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any,
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }
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
    const lookupKey = session.metadata?.planType;
    const planType = lookupKey === 'architect_monthly' ? 'architect' : 'sovereign';

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

  // Also handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    // We need to find the user by their Stripe Customer ID since metadata isn't always on the sub object
    // Or if you passed userId as metadata to the subscription, you can use it here
    const userId = subscription.metadata?.userId;

    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_paid: false, plan_type: null })
        .eq('id', userId);

      if (error) console.error('Error marking user as unpaid:', error);
    }
  }

  return NextResponse.json({ received: true });
}
