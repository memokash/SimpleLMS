#!/bin/bash

# Firebase CLI script to set user to premium tier
# Usage: ./firebase-set-premium.sh <userEmail>

if [ -z "$1" ]; then
    echo "Usage: ./firebase-set-premium.sh <userEmail>"
    exit 1
fi

USER_EMAIL=$1

echo "Setting premium tier for user: $USER_EMAIL"

# Create a temporary JavaScript file for Firebase Admin SDK
cat > temp-set-premium.js << 'EOF'
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setPremiumTier(userEmail) {
  try {
    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', userEmail)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.error(`No user found with email: ${userEmail}`);
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log(`Found user: ${userData.displayName || userData.email}`);
    console.log(`Current tier: ${userData.subscriptionTier || 'free'}`);

    // Update user to premium tier
    await db.collection('users').doc(userId).update({
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      updatedAt: new Date()
    });

    console.log('✅ Successfully updated user to premium tier!');
    
    // Also create/update subscription document for backward compatibility
    await db.collection('subscriptions').doc(userId).set({
      plan: 'premium',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Subscription document updated!');
    console.log('User can now access all premium features including quizzes.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting premium tier:', error);
    process.exit(1);
  }
}

const userEmail = process.argv[2];
setPremiumTier(userEmail);
EOF

# Replace email in the script
sed -i "s/process.argv\[2\]/'$USER_EMAIL'/g" temp-set-premium.js

# Run the script with Node.js
node temp-set-premium.js "$USER_EMAIL"

# Clean up
rm temp-set-premium.js

echo "Done!"