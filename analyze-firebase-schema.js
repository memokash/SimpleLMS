// Analyze Actual Firebase Database Schema
// Run with: node analyze-firebase-schema.js

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

async function analyzeSchema() {
  console.log('🔍 Analyzing Firebase Database Schema...\n');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Analyze courses collection (we know this works)
    console.log('📁 COURSES COLLECTION SCHEMA:');
    console.log('════════════════════════════════════════\n');
    
    const coursesQuery = query(collection(db, 'courses'), limit(5));
    const coursesSnapshot = await getDocs(coursesQuery);
    
    if (!coursesSnapshot.empty) {
      // Analyze field types across multiple documents
      const fieldAnalysis = {};
      const sampleValues = {};
      
      coursesSnapshot.forEach(doc => {
        const data = doc.data();
        Object.keys(data).forEach(field => {
          if (!fieldAnalysis[field]) {
            fieldAnalysis[field] = new Set();
            sampleValues[field] = [];
          }
          const fieldType = typeof data[field];
          fieldAnalysis[field].add(fieldType);
          
          // Store sample values (truncated for display)
          if (sampleValues[field].length < 2) {
            let value = data[field];
            if (typeof value === 'string' && value.length > 50) {
              value = value.substring(0, 50) + '...';
            }
            sampleValues[field].push(value);
          }
        });
      });
      
      // Display schema analysis
      console.log('Field Name                | Type(s)     | Sample Values');
      console.log('--------------------------|-------------|------------------');
      Object.keys(fieldAnalysis).sort().forEach(field => {
        const types = Array.from(fieldAnalysis[field]).join(', ');
        const samples = sampleValues[field].filter(v => v !== undefined).slice(0, 1).join(' | ');
        console.log(`${field.padEnd(25)} | ${types.padEnd(11)} | ${samples}`);
      });
      
      // Check for questions subcollection
      console.log('\n📁 QUESTIONS SUBCOLLECTION SCHEMA:');
      console.log('════════════════════════════════════════\n');
      
      const firstCourseId = coursesSnapshot.docs[0].id;
      const questionsQuery = query(collection(db, `courses/${firstCourseId}/questions`), limit(3));
      const questionsSnapshot = await getDocs(questionsQuery);
      
      if (!questionsSnapshot.empty) {
        const questionFields = {};
        const questionSamples = {};
        
        questionsSnapshot.forEach(doc => {
          const data = doc.data();
          Object.keys(data).forEach(field => {
            if (!questionFields[field]) {
              questionFields[field] = new Set();
              questionSamples[field] = [];
            }
            questionFields[field].add(typeof data[field]);
            
            if (questionSamples[field].length < 1) {
              let value = data[field];
              if (typeof value === 'string' && value.length > 50) {
                value = value.substring(0, 50) + '...';
              }
              questionSamples[field].push(value);
            }
          });
        });
        
        console.log('Field Name                | Type(s)     | Sample Values');
        console.log('--------------------------|-------------|------------------');
        Object.keys(questionFields).sort().forEach(field => {
          const types = Array.from(questionFields[field]).join(', ');
          const samples = questionSamples[field].filter(v => v !== undefined).slice(0, 1).join(' | ');
          console.log(`${field.padEnd(25)} | ${types.padEnd(11)} | ${samples}`);
        });
      }
    }
    
    // Try to check other collections with limited queries
    console.log('\n📊 OTHER COLLECTIONS STATUS:');
    console.log('════════════════════════════════════════\n');
    
    const collectionsToCheck = [
      'userProgress',
      'quizAttempts', 
      'questionBank'
    ];
    
    for (const collName of collectionsToCheck) {
      try {
        const collQuery = query(collection(db, collName), limit(1));
        const snapshot = await getDocs(collQuery);
        if (snapshot.empty) {
          console.log(`${collName}: Empty collection`);
        } else {
          const data = snapshot.docs[0].data();
          console.log(`${collName}: ${snapshot.size} document(s), Fields: ${Object.keys(data).join(', ')}`);
        }
      } catch (e) {
        console.log(`${collName}: No access or doesn't exist`);
      }
    }
    
    console.log('\n📝 SCHEMA ANALYSIS COMPLETE');
    console.log('\n💡 Recommendations:');
    console.log('1. The courses collection has mixed field naming (some CamelCase, some lowercase)');
    console.log('2. Consider standardizing field names to camelCase for consistency');
    console.log('3. Some collections may need security rules updates for access');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

analyzeSchema();