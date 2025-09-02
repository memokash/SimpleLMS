// Test Firebase Connection and Database Structure
// Run with: node test-firebase-connection.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables Check:');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  let allVarsPresent = true;
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value.length > 0) {
      console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allVarsPresent = false;
    }
  }
  
  if (!allVarsPresent) {
    console.log('\n❌ Missing required environment variables. Please check your .env.local file.');
    return;
  }
  
  try {
    // Initialize Firebase
    console.log('\n🔄 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
    
    // Test Firestore connection and examine collections
    console.log('\n📊 Examining Database Structure:\n');
    
    const collections = [
      'users',
      'profiles', 
      'courses',
      'userProgress',
      'quizAttempts',
      'questionBank',
      'invitations',
      'subscriptions'
    ];
    
    for (const collectionName of collections) {
      try {
        console.log(`\n📁 Collection: ${collectionName}`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        if (querySnapshot.empty) {
          console.log(`   └─ Empty (0 documents)`);
        } else {
          console.log(`   └─ ${querySnapshot.size} document(s) found`);
          
          // Show first document structure (without sensitive data)
          const firstDoc = querySnapshot.docs[0];
          const data = firstDoc.data();
          console.log(`   └─ Sample document ID: ${firstDoc.id}`);
          console.log(`   └─ Fields present:`, Object.keys(data).join(', '));
          
          // Check for subcollections in courses
          if (collectionName === 'courses' && !querySnapshot.empty) {
            try {
              const questionsRef = collection(db, `courses/${firstDoc.id}/questions`);
              const questionsSnapshot = await getDocs(questionsRef);
              console.log(`   └─ Subcollection 'questions': ${questionsSnapshot.size} document(s)`);
            } catch (e) {
              console.log(`   └─ No 'questions' subcollection or access denied`);
            }
          }
        }
      } catch (error) {
        console.log(`   └─ ❌ Error accessing collection: ${error.message}`);
      }
    }
    
    // Test authentication setup
    console.log('\n🔐 Authentication Configuration:');
    console.log(`   └─ Auth domain: ${auth.config.authDomain}`);
    console.log(`   └─ API Key present: ${auth.config.apiKey ? 'Yes' : 'No'}`);
    
    console.log('\n✅ Firebase connection test completed successfully!');
    
    // Check for missing collections that might need to be created
    console.log('\n📝 Collections Status Summary:');
    console.log('   Required for core functionality:');
    console.log('   - users, profiles, courses, userProgress, questionBank');
    console.log('   Required for features:');
    console.log('   - subscriptions (Stripe), invitations (referrals)');
    console.log('\n💡 Tip: Empty collections are normal for new setups.');
    
  } catch (error) {
    console.error('\n❌ Firebase connection failed:', error.message);
    console.error('   Please check your Firebase project configuration.');
  }
  
  process.exit(0);
}

// Run the test
testFirebaseConnection();