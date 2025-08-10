import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

interface CheckoutSessionRequest {
  priceId: string;
  userId: string;
  firebaseUserId?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Create checkout session API called');
    
    // Security: Check Stripe key (without logging sensitive info)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error('❌ Stripe secret key not configured');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    // Security: Parse and validate request body
    let requestData: CheckoutSessionRequest;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { priceId, userId, firebaseUserId } = requestData;

    // Security: Validate required fields with type checking
    if (!priceId || typeof priceId !== 'string' || priceId.length < 5) {
      return NextResponse.json({ error: 'Valid Price ID is required' }, { status: 400 });
    }

    if (!userId || typeof userId !== 'string' || userId.length < 3) {
      return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
    }

    // Security: Validate price ID format (Stripe price IDs start with 'price_')
    if (!priceId.startsWith('price_')) {
      return NextResponse.json({ error: 'Invalid price ID format' }, { status: 400 });
    }

    // Initialize Stripe client inside function
    let stripe;
    try {
      stripe = new Stripe(stripeKey);
      console.log('✅ Stripe client initialized');
    } catch (clientError) {
      console.error('❌ Stripe client initialization error:', clientError);
      return NextResponse.json({ error: 'Failed to initialize Stripe client' }, { status: 500 });
    }

    console.log('💳 Creating Stripe checkout session...');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      client_reference_id: userId,
      metadata: {
        firebaseUserId: firebaseUserId || userId,
        userId: userId,
      },
    });

    console.log('✅ Stripe session created successfully');
    console.log('🎉 Returning session ID');

    return NextResponse.json({ sessionId: session.id });
    
  } catch (error) {
    console.error('💥 Stripe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    
    return NextResponse.json({ 
      error: errorMessage || 'Failed to create checkout session',
      details: errorMessage 
    }, { status: 500 });
  }
}