import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const { lookup_key, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // 1. Find the price based on the lookup_key you created in Stripe
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    if (prices.data.length === 0) {
      return NextResponse.json({ error: 'Price not found.' }, { status: 404 });
    }

    const price = prices.data[0];

    // 2. Create the secure Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: price.type === 'recurring' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?canceled=true`,
      metadata: {
        userId: userId, // Very important: We attach the user ID so we know WHO paid
        planType: lookup_key,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
