# Firebase Setup Guide for SimpleLMS

## Prerequisites
- Google account
- Node.js installed
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Enter project name: `simplelms-production` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Select analytics account or create new one
6. Click "Create Project"

## Step 2: Enable Required Services

### A. Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable these providers:
   - **Email/Password**: Toggle ON
   - **Google**: Toggle ON and configure:
     - Add project support email
     - Add authorized domains (localhost:3000 for dev, your production domain)

### B. Firestore Database
1. Go to "Firestore Database"
2. Click "Create Database"
3. Choose mode:
   - Start in **Production mode** (we'll deploy rules separately)
4. Select location closest to your users:
   - Recommended: `us-central1` (or your region)
5. Click "Enable"

### C. Storage (for file uploads)
1. Go to "Storage"
2. Click "Get Started"
3. Start in production mode
4. Select same location as Firestore
5. Click "Done"

## Step 3: Get Configuration Keys

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon (</>) to add web app
4. Register app:
   - App nickname: `SimpleLMS Web`
   - Check "Also set up Firebase Hosting" (optional)
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 4: Create Environment File

1. Create `.env.local` file in project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Add your other API keys here
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 5: Deploy Firestore Security Rules

1. Login to Firebase CLI:
```bash
firebase login
```

2. Initialize Firebase in your project:
```bash
firebase init
```
   - Select: Firestore
   - Use existing project: select your project
   - Accept default rules file: firestore.rules
   - Accept default indexes file: firestore.indexes.json

3. Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Step 6: Create Required Database Indexes

Add these to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "questionBank",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "specialty", "order": "ASCENDING" },
        { "fieldPath": "difficulty", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "userProgress",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "courseId", "order": "ASCENDING" },
        { "fieldPath": "lastAccessed", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "courses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Step 7: Initialize Collections

The app will automatically create collections as needed, but you can pre-create them in Firebase Console:

### Required Collections:
- `users` - User profiles and settings
- `courses` - Course content
- `questionBank` - Quiz questions
- `userProgress` - User progress tracking
- `subscriptions` - Stripe subscription data
- `profiles` - Extended user profiles
- `studyGroups` - Study group data
- `messages` - User messages
- `resources` - Reading resources
- `settings` - App settings

## Step 8: Test Connection

1. Start the development server:
```bash
npm run dev
```

2. Open browser console and check for Firebase initialization success
3. Try signing up with Google OAuth
4. Check Firestore Database in Firebase Console to see if user document was created

## Step 9: Production Deployment Checklist

- [ ] All environment variables set in production environment
- [ ] Firebase project in production mode
- [ ] Security rules deployed and tested
- [ ] Database indexes created
- [ ] Authorized domains added in Authentication settings
- [ ] Storage CORS configured if needed
- [ ] Backup strategy configured
- [ ] Monitoring enabled

## Troubleshooting

### Common Issues:

1. **"Missing or insufficient permissions"**
   - Check if security rules are deployed
   - Verify user is authenticated
   - Check rules match your data structure

2. **"Firebase app not initialized"**
   - Verify all environment variables are set
   - Check for typos in variable names
   - Restart dev server after adding .env.local

3. **"Google OAuth redirect error"**
   - Add your domain to authorized domains in Firebase Console
   - Check redirect URI configuration

4. **"Quota exceeded"**
   - Enable billing in Firebase Console
   - Check Firestore usage limits
   - Implement rate limiting

## Security Best Practices

1. **Never commit `.env.local` to git**
2. **Use different Firebase projects for dev/staging/production**
3. **Regularly review security rules**
4. **Enable Firebase App Check for production**
5. **Monitor Firebase usage and set budget alerts**

## Next Steps

After Firebase is configured:
1. Set up Stripe integration
2. Configure OpenAI and Anthropic APIs
3. Test all critical user flows
4. Deploy to Vercel or your chosen platform

---

For more information, see [Firebase Documentation](https://firebase.google.com/docs)