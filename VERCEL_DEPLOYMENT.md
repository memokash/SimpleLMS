# Vercel Deployment Guide

## Method 1: Using Vercel Token (Non-Interactive)

### Step 1: Get your Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it (e.g., "SimpleLMS Deploy")
4. Copy the token

### Step 2: Set the token as environment variable
```bash
# Windows (PowerShell)
$env:VERCEL_TOKEN="your-token-here"

# Windows (Command Prompt)
set VERCEL_TOKEN=your-token-here

# Mac/Linux
export VERCEL_TOKEN="your-token-here"
```

### Step 3: Deploy with token
```bash
# Deploy to production
vercel --prod --token $VERCEL_TOKEN --yes

# Or preview deployment
vercel --token $VERCEL_TOKEN --yes
```

## Method 2: Interactive Login

### Step 1: Login to Vercel
```bash
vercel login
```
Choose your preferred method:
- Continue with GitHub (recommended if your repo is on GitHub)
- Continue with Email
- Other options available

### Step 2: Deploy
```bash
# First deployment (will ask for project setup)
vercel

# Deploy to production
vercel --prod
```

## Method 3: GitHub Integration (Easiest)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin master
```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-deploy on every push

## Environment Variables Setup

After deployment, add these in Vercel Dashboard:
(Project Settings → Environment Variables)

```env
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=medicalschoolquizzessitedev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe (Required)
STRIPE_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_PRICE_ID=price_1RsTPUISGmrVXRzqWizONXS7
STRIPE_PREMIUM_PRICE_ID=price_your_premium_id

# AI Services (Required)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# Email (Optional)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# App URL (Auto-set by Vercel)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Quick Deploy Script

Save this as `deploy.sh` or `deploy.bat`:

```bash
#!/bin/bash
# deploy.sh

# Check if token is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "Please set VERCEL_TOKEN environment variable"
    echo "Get token from: https://vercel.com/account/tokens"
    exit 1
fi

echo "Deploying to Vercel..."
vercel --prod --token $VERCEL_TOKEN --yes

echo "Deployment complete!"
echo "Don't forget to set environment variables in Vercel Dashboard"
```

## Post-Deployment Checklist

1. ✅ Set all environment variables in Vercel Dashboard
2. ✅ Update Stripe webhook URL to: `https://your-app.vercel.app/api/stripe/webhook`
3. ✅ Add Vercel domain to Firebase authorized domains
4. ✅ Test authentication (email & Google)
5. ✅ Test payment flow
6. ✅ Check Sentry is receiving errors (if configured)

## Deployment Commands Summary

```bash
# Login (one-time)
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod

# With token (no login needed)
vercel --prod --token YOUR_TOKEN --yes

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Troubleshooting

- **Build fails**: Check `npm run build` works locally first
- **Environment variables**: Make sure all required vars are set in Vercel
- **Domain issues**: Use custom domain in Project Settings → Domains
- **Function timeout**: Already configured in vercel.json (60s for AI routes)