import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
  try {
    console.log('🚀 Create checkout session API called');
    
    // Check Stripe key first
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    console.log('🔍 Stripe Key exists:', !!stripeKey);
    
    if (!stripeKey) {
      console.error('❌ Stripe secret key not found');
      return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
      console.log('📝 Request data received:', {
        hasPriceId: !!requestData.priceId,
        hasUserId: !!requestData.userId
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { priceId, userId } = requestData;

    // Validate required fields
    if (!priceId || !userId) {
      console.error('❌ Missing required fields');
      return NextResponse.json({ error: 'Price ID and User ID are required' }, { status: 400 });
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    });

    console.log('✅ Stripe session created successfully');
    console.log('🎉 Returning session ID');

    return NextResponse.json({ sessionId: session.id });
    
  } catch (error) {
    console.error('💥 Stripe error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to create checkout session',
      details: error.message 
    }, { status: 500 });
  }
}