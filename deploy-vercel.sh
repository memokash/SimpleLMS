#!/bin/bash

# Vercel Deployment Script for SimpleLMS

echo "🚀 Starting Vercel Deployment Process..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Pre-deployment checklist:"
echo "✅ Vercel CLI installed"
echo ""

# Create environment file template if needed
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production template..."
    cat > .env.production.example << EOF
# Copy this to .env.production and fill in your values
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
NEXT_PUBLIC_SENTRY_DSN=
EOF
    echo "✅ Created .env.production.example"
fi

echo ""
echo "🔐 Setting up Vercel authentication..."
echo "You'll need to authenticate with Vercel first."
echo ""
echo "Run the following commands:"
echo ""
echo "1. Login to Vercel:"
echo "   vercel login"
echo ""
echo "2. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "Or for a preview deployment:"
echo "   vercel"
echo ""
echo "📌 After deployment, add environment variables in Vercel Dashboard:"
echo "   https://vercel.com/[your-username]/[your-project]/settings/environment-variables"
echo ""
echo "Ready to deploy! Run 'vercel login' to start."