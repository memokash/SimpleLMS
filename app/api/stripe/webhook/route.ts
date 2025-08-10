import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { db } from '../../../../lib/firebase';
import { doc, updateDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Map Stripe price IDs to subscription tiers
const PRICE_TO_TIER_MAP: Record<string, 'pro' | 'premium'> = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY!]: 'pro',
  [process.env.STRIPE_PRICE_PRO_YEARLY!]: 'pro',
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY!]: 'premium',
  [process.env.STRIPE_PRICE_PREMIUM_YEARLY!]: 'premium',
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.firebaseUserId;
        
        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const priceId = subscription.items.data[0]?.price.id;
          const tier = PRICE_TO_TIER_MAP[priceId] || 'pro';
          
          await updateDoc(doc(db, 'users', userId), {
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionTier: tier,
            subscriptionCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            updatedAt: new Date()
          });
          
          console.log(`✅ User ${userId} subscribed to ${tier} tier`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const usersQuery = query(
          collection(db, 'users'),
          where('stripeCustomerId', '==', customerId),
          limit(1)
        );
        const usersSnapshot = await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const priceId = subscription.items.data[0]?.price.id;
          const tier = PRICE_TO_TIER_MAP[priceId] || 'pro';
          
          await updateDoc(userDoc.ref, {
            subscriptionStatus: subscription.status,
            subscriptionTier: tier,
            subscriptionCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            updatedAt: new Date()
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const usersSnapshot = await getDocs(
          query(
            collection(db, 'users'), 
            where('stripeCustomerId', '==', customerId),
            limit(1)
          )
        );

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await updateDoc(userDoc.ref, {
            subscriptionStatus: 'canceled',
            subscriptionTier: 'free',
            subscriptionId: null,
            updatedAt: new Date()
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const usersSnapshot = await getDocs(
          query(
            collection(db, 'users'), 
            where('stripeCustomerId', '==', customerId),
            limit(1)
          )
        );

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await updateDoc(userDoc.ref, {
            subscriptionStatus: 'past_due',
            updatedAt: new Date()
          });
          
          // TODO: Send email notification about payment failure
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}