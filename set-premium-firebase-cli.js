// Firebase CLI script to set user to premium tier
// Usage: node set-premium-firebase-cli.js <userEmail>
// Requires: npm install firebase-admin

const admin = require('firebase-admin');

// Initialize with application default credentials
// Make sure you've set up Firebase Admin SDK properly
// Either with service account JSON or application default credentials
try {
  // Try to use service account if available
  const serviceAccount = require('./firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  // Fallback to application default credentials
  admin.initializeApp();
}

const db = admin.firestore();

async function setPremiumTier(userEmail) {
  if (!userEmail) {
    console.error('Please provide a user email as argument');
    console.log('Usage: node set-premium-firebase-cli.js <userEmail>');
    process.exit(1);
  }

  console.log(`\n🔍 Searching for user: ${userEmail}`);

  try {
    // Find user by email in users collection
    const usersSnapshot = await db.collection('users')
      .where('email', '==', userEmail)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.error(`❌ No user found with email: ${userEmail}`);
      console.log('\nTrying to find user in auth records...');
      
      // Try to find user by auth email
      try {
        const userRecord = await admin.auth().getUserByEmail(userEmail);
        console.log(`✅ Found auth user: ${userRecord.uid}`);
        
        // Create user document if doesn't exist
        await db.collection('users').doc(userRecord.uid).set({
          email: userEmail,
          displayName: userRecord.displayName || '',
          subscriptionTier: 'premium',
          subscriptionStatus: 'active',
          subscriptionCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
        
        console.log('✅ Created/Updated user document with premium tier!');
      } catch (authError) {
        console.error(`❌ User not found in auth either: ${authError.message}`);
        process.exit(1);
      }
    } else {
      const userDoc = usersSnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();

      console.log(`\n✅ Found user document`);
      console.log(`   ID: ${userId}`);
      console.log(`   Name: ${userData.displayName || 'Not set'}`);
      console.log(`   Current tier: ${userData.subscriptionTier || 'free'}`);
      console.log(`   Status: ${userData.subscriptionStatus || 'inactive'}`);

      // Update user to premium tier
      await db.collection('users').doc(userId).update({
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });

      console.log('\n✅ Successfully updated user to PREMIUM tier!');
    }
    
    // Also create/update subscription document for backward compatibility
    const userIdForSubscription = usersSnapshot.empty ? 
      (await admin.auth().getUserByEmail(userEmail)).uid : 
      usersSnapshot.docs[0].id;
    
    await db.collection('subscriptions').doc(userIdForSubscription).set({
      plan: 'premium',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Subscription document updated for backward compatibility!');
    console.log('\n🎉 User now has full access to:');
    console.log('   - All quizzes (unlimited)');
    console.log('   - Premium question bank');
    console.log('   - AI tutoring features');
    console.log('   - Custom study plans');
    console.log('   - Cross-institutional messaging');
    console.log('   - Advanced analytics');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting premium tier:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const userEmail = process.argv[2];
setPremiumTier(userEmail);