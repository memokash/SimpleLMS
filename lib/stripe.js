import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Your actual subscription plans
export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['5 quiz attempts per day', 'Basic progress tracking', 'Limited topics'],
    stripePriceId: null
  },
  PRO: {
    name: 'Pro',
    price: 99,
    features: ['Unlimited quiz attempts', 'All 15,000+ questions', 'Advanced analytics', 'All specialties'],
    stripePriceId: 'price_1RqE1PEbNlb7nCbs0las6NY5' // Your actual Pro price ID
  },
  PREMIUM: {
    name: 'Premium', 
    price: 199,
    features: ['Everything in Pro', '1-on-1 tutoring', 'Custom study plans', 'Priority support'],
    stripePriceId: 'price_1RqE4NEbNlb7nCbsKLwEcd3a' // Your actual Premium price ID
  }
};

// Create checkout session
export async function createCheckoutSession(priceId, userId) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      userId,
    }),
  });

  const session = await response.json();
  return session;
}
