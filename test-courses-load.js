// Test if courses are loading from Firebase
// Run with: node test-courses-load.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testCoursesLoad() {
  console.log('🔍 Testing Courses Load from Firebase...\n');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all courses
    console.log('📚 Fetching courses from Firebase...');
    const coursesRef = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    console.log(`\n✅ Found ${coursesSnapshot.size} courses in Firebase!\n`);
    
    if (coursesSnapshot.size > 0) {
      // Show first 5 courses
      console.log('📋 Sample Courses:\n');
      console.log('═'.repeat(80));
      
      let count = 0;
      coursesSnapshot.forEach(doc => {
        if (count < 5) {
          const data = doc.data();
          console.log(`\nID: ${doc.id}`);
          console.log(`Title: ${data.NewTitle || data.OriginalQuizTitle || 'No title'}`);
          console.log(`Course Name: ${data.CourseName || 'N/A'}`);
          console.log(`Description: ${(data.BriefDescription || 'No description').substring(0, 100)}...`);
          
          // Check for questions
          console.log('Checking questions...');
          count++;
        }
      });
      
      console.log('\n' + '═'.repeat(80));
      
      // Category breakdown
      const categories = {};
      coursesSnapshot.forEach(doc => {
        const data = doc.data();
        const cat = data.Category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      
      console.log('\n📊 Category Distribution:');
      Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([cat, count]) => {
          console.log(`   ${cat}: ${count} courses`);
        });
      
      console.log('\n✅ Courses are loading successfully!');
      console.log('💡 The CoursesDashboardOptimized component should display these courses.');
      console.log('\nIf courses are not showing in the UI:');
      console.log('1. Check browser console for errors');
      console.log('2. Ensure user is logged in (some features require auth)');
      console.log('3. Check network tab for failed requests');
      console.log('4. Verify Firestore security rules allow read access');
    }
    
  } catch (error) {
    console.error('❌ Error loading courses:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your .env.local file has correct Firebase config');
    console.log('2. Ensure Firestore is enabled in Firebase Console');
    console.log('3. Check security rules allow read access to courses collection');
  }
  
  process.exit(0);
}

testCoursesLoad();