# SimpleLMS Premium Setup Guide

## Quick Setup - Activate Premium Status

### Method 1: Web Interface (Easiest)
1. Open `check-premium-status.html` in your browser
2. Click "Sign In with Google" 
3. Sign in with your SimpleLMS account
4. Click "Check Premium Status"
5. Click "Activate Premium (1 Year)"
6. ✅ You now have premium access!

### Method 2: Manual Premium Tool
1. Open `manual-set-premium.html` in your browser
2. Enter your email address
3. Click "Check User Status"
4. Click "Set to Premium Tier"
5. ✅ Premium activated!

## Firebase Configuration

### Current Schema
The premium status is stored in two places for compatibility:
1. **Primary**: `users/{userId}` collection
   - Field: `subscriptionTier` (values: 'free', 'pro', 'premium')
   - Field: `subscriptionStatus` (values: 'active', 'inactive')
2. **Backup**: `subscriptions/{userId}` collection
   - Field: `plan` (values: 'free', 'pro', 'premium')
   - Field: `status` (values: 'active', 'inactive')

### Security Rules Update
The Firestore security rules have been updated to check BOTH locations:
- First checks `users` collection for `subscriptionTier`
- Falls back to `subscriptions` collection for backward compatibility
- Pro and Premium users have access to all quiz features

## Deploy Rules to Firebase

### Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Deploy Updated Rules
```bash
firebase deploy --only firestore:rules
```

## Verify Premium Access

### In the App
1. Sign in to SimpleLMS
2. Navigate to any quiz
3. You should have full access without restrictions

### In Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/simplelms-4b6a9/firestore)
2. Navigate to `users` collection
3. Find your user document
4. Verify `subscriptionTier: "premium"`

## Premium Features Unlocked

With Premium status, you have access to:
- ✅ **Unlimited Quizzes** - No daily limits
- ✅ **Premium Question Bank** - Access to all questions
- ✅ **AI Tutoring** - Personalized learning assistance
- ✅ **Custom Study Plans** - Tailored to your needs
- ✅ **Cross-institutional Messaging** - Connect with peers
- ✅ **Advanced Analytics** - Detailed progress tracking
- ✅ **Priority Support** - Fast response times

## Troubleshooting

### Issue: Still can't access quizzes
1. Clear browser cache and cookies
2. Sign out and sign back in
3. Check browser console for errors
4. Verify premium status using `check-premium-status.html`

### Issue: Premium status not showing
1. Check if user document exists in Firestore
2. Run the premium activation tool again
3. Ensure `subscriptionStatus` is set to "active"

### Issue: Firebase CLI not working
For Windows users, use Node.js directly:
```bash
node set-premium-firebase-cli.js your-email@example.com
```

## Command Line Tools

### JavaScript (Cross-platform)
```bash
node set-premium-tier.js your-email@example.com
```

### Firebase Admin SDK
```bash
node set-premium-firebase-cli.js your-email@example.com
```

### Windows Batch
```cmd
firebase-set-premium.bat your-email@example.com
```

### Linux/Mac Shell
```bash
./firebase-set-premium.sh your-email@example.com
```

## Important Notes

1. **Premium Duration**: Set to 1 year from activation date
2. **Auto-renewal**: Not implemented (manual renewal required)
3. **Stripe Integration**: Bypassed for manual activation
4. **Production**: In production, use Stripe webhooks for automatic tier updates

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Firebase configuration in `firebase.js`
3. Ensure Firestore security rules are deployed
4. Check that your user document exists in Firestore

---

Last Updated: 2025-09-08