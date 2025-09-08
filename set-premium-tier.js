// Script to set a user's tier to premium
// Run with: node set-premium-tier.js <userEmail>

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyByhZbl3e4R_cmT64i-rhkYp9eEclCeDUw",
  authDomain: "simplelms-4b6a9.firebaseapp.com",
  projectId: "simplelms-4b6a9",
  storageBucket: "simplelms-4b6a9.firebasestorage.app",
  messagingSenderId: "889926395152",
  appId: "1:889926395152:web:c80d8a67c2e90e2e017c37",
  measurementId: "G-R8BQ1YCK9R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setPremiumTier(userEmail) {
  try {
    if (!userEmail) {
      console.error('Please provide a user email as argument');
      console.log('Usage: node set-premium-tier.js <userEmail>');
      process.exit(1);
    }

    console.log(`Setting premium tier for user: ${userEmail}`);

    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', userEmail)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
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
    await updateDoc(doc(db, 'users', userId), {
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      updatedAt: new Date()
    });

    console.log('✅ Successfully updated user to premium tier!');
    console.log('User can now access all premium features including quizzes.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting premium tier:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const userEmail = process.argv[2];
setPremiumTier(userEmail);