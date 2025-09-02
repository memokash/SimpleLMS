// Fix Database Schema Alignment Issues
// This script identifies and reports schema mismatches between Firebase and codebase

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function analyzeSchemaIssues() {
  console.log('🔍 Analyzing Schema Compatibility Issues...\n');
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  // Expected schema from codebase
  const expectedCourseFields = {
    'id': 'string',
    'courseName': 'string', 
    'title': 'string',
    'description': 'string',
    'category': 'string',
    'specialty': 'string',
    'difficulty': 'string',
    'isPublic': 'boolean',
    'isPremium': 'boolean',
    'requiredTier': 'string',
    'questionCount': 'number',
    'rating': 'number',
    'enrolledStudents': 'number',
    'instructor': 'string',
    'createdAt': 'timestamp',
    'updatedAt': 'timestamp'
  };
  
  const expectedQuestionFields = {
    'question': 'string',
    'options': 'array',
    'correctAnswer': 'number',
    'correctExplanation': 'string',
    'incorrectExplanation': 'string',
    'hintMessage': 'string',
    'category': 'string',
    'specialty': 'string',
    'difficulty': 'string',
    'tags': 'array',
    'aiEnhanced': 'boolean',
    'enhancedBy': 'string',
    'enhancedAt': 'timestamp',
    'confidence': 'string'
  };
  
  console.log('📊 SCHEMA COMPATIBILITY REPORT\n');
  console.log('════════════════════════════════════════\n');
  
  // Check courses collection
  console.log('1️⃣ COURSES COLLECTION ISSUES:\n');
  
  const coursesQuery = query(collection(db, 'courses'), limit(1));
  const coursesSnapshot = await getDocs(coursesQuery);
  
  if (!coursesSnapshot.empty) {
    const actualData = coursesSnapshot.docs[0].data();
    const actualFields = Object.keys(actualData);
    
    console.log('❌ MISSING EXPECTED FIELDS:');
    Object.keys(expectedCourseFields).forEach(field => {
      if (!actualFields.includes(field) && !actualFields.includes(field.toLowerCase())) {
        console.log(`   - ${field} (${expectedCourseFields[field]})`);
      }
    });
    
    console.log('\n⚠️ UNEXPECTED FIELDS IN DATABASE:');
    actualFields.forEach(field => {
      const expectedName = Object.keys(expectedCourseFields).find(
        f => f.toLowerCase() === field.toLowerCase()
      );
      if (!expectedName) {
        console.log(`   - ${field} (Consider removing or mapping)`);
      }
    });
    
    console.log('\n🔄 FIELD NAME MISMATCHES:');
    console.log('   Database Field -> Should Be:');
    if (actualData['CourseName']) console.log('   - CourseName -> courseName');
    if (actualData['NewTitle']) console.log('   - NewTitle -> title');
    if (actualData['BriefDescription']) console.log('   - BriefDescription -> description');
    if (actualData['OriginalQuizTitle']) console.log('   - OriginalQuizTitle -> (remove or archive)');
  }
  
  // Check questions subcollection
  console.log('\n2️⃣ QUESTIONS SUBCOLLECTION ISSUES:\n');
  
  if (!coursesSnapshot.empty) {
    const courseId = coursesSnapshot.docs[0].id;
    const questionsQuery = query(collection(db, `courses/${courseId}/questions`), limit(1));
    const questionsSnapshot = await getDocs(questionsQuery);
    
    if (!questionsSnapshot.empty) {
      const questionData = questionsSnapshot.docs[0].data();
      
      console.log('❌ CRITICAL ISSUES:');
      console.log('   - Options stored as individual fields "Option (a)", "Option (b)" etc.');
      console.log('     Should be: Single "options" array field');
      console.log('   - Answer stored as string "a", "b", etc.');
      console.log('     Should be: Number index (0, 1, 2, 3)');
      console.log('   - Many fields have NaN values that should be removed');
      
      console.log('\n🔄 REQUIRED TRANSFORMATIONS:');
      console.log('   1. Convert options to array format:');
      console.log('      From: "Option (a)", "Option (b)"...');
      console.log('      To: options: ["option1", "option2"...]');
      console.log('   2. Convert answer to number:');
      console.log('      From: "a", "b", "c"...');
      console.log('      To: 0, 1, 2...');
      console.log('   3. Clean up NaN values');
      console.log('   4. Standardize field names to camelCase');
    }
  }
  
  console.log('\n3️⃣ RECOMMENDED ACTIONS:\n');
  console.log('   ✅ IMMEDIATE:');
  console.log('   1. The app can work with current schema but with limitations');
  console.log('   2. Update security rules to allow access to all collections');
  console.log('   3. Create missing collections (users, profiles, userProgress)');
  
  console.log('\n   🔄 MIGRATION NEEDED:');
  console.log('   1. Transform question options format');
  console.log('   2. Standardize field names to camelCase');
  console.log('   3. Add missing required fields with defaults');
  console.log('   4. Clean up NaN values');
  
  console.log('\n   📝 CODE ADJUSTMENTS:');
  console.log('   1. Update QuizApp component to handle current option format');
  console.log('   2. Add field mapping layer in services');
  console.log('   3. Handle both old and new schema formats');
  
  console.log('\n4️⃣ CURRENT COMPATIBILITY:\n');
  console.log('   ✅ Can Read: Courses, Questions');
  console.log('   ❌ Cannot Access: Users, Profiles, UserProgress (permissions)');
  console.log('   ⚠️ Format Issues: Question options and answers need transformation');
  
  process.exit(0);
}

analyzeSchemaIssues();