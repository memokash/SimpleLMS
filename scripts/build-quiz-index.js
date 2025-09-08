/**
 * Script to build/rebuild the quiz index in Firestore
 * Run this initially and periodically to keep index updated
 * 
 * Usage: node scripts/build-quiz-index.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  const serviceAccount = require('../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Using service account authentication');
} catch (error) {
  admin.initializeApp();
  console.log('✅ Using application default credentials');
}

const db = admin.firestore();

// Calculate popularity score
function calculatePopularity(rating = 0, attempts = 0, completions = 0) {
  const ratingScore = rating * 2;
  const attemptScore = Math.log10(attempts + 1) * 10;
  const completionScore = completions * 0.5;
  return Math.round(ratingScore + attemptScore + completionScore);
}

// Main function to build index
async function buildQuizIndex() {
  console.log('\n🚀 Starting quiz index build...\n');
  
  try {
    // Get all courses
    const coursesSnapshot = await db.collection('courses').get();
    console.log(`📚 Found ${coursesSnapshot.size} courses to process\n`);
    
    const batch = db.batch();
    let indexedCount = 0;
    let skippedCount = 0;
    let batchCount = 0;
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      const courseId = courseDoc.id;
      
      // Get question count
      const questionsSnapshot = await db
        .collection('courses')
        .doc(courseId)
        .collection('questions')
        .get();
      
      const questionCount = questionsSnapshot.size;
      
      if (questionCount === 0) {
        console.log(`⏭️  Skipping "${courseData.title || courseId}" - no questions`);
        skippedCount++;
        continue;
      }
      
      // Determine tier based on various fields
      let requiredTier = 'free';
      if (courseData.isPremium || courseData.premium) {
        requiredTier = 'premium';
      } else if (courseData.requiredTier) {
        requiredTier = courseData.requiredTier;
      }
      
      // Extract tags from various possible fields
      const tags = [];
      if (courseData.tags) tags.push(...courseData.tags);
      if (courseData.specialty) tags.push(courseData.specialty);
      if (courseData.category) tags.push(courseData.category);
      
      // Calculate estimated duration (1.5 minutes per question)
      const duration = Math.ceil(questionCount * 1.5);
      
      // Calculate popularity
      const popularity = calculatePopularity(
        courseData.rating,
        courseData.attempts || courseData.enrolledStudents,
        courseData.completions
      );
      
      // Create index entry
      const indexEntry = {
        title: courseData.title || courseData.courseName || courseId,
        category: courseData.category || 'Uncategorized',
        specialty: courseData.specialty || null,
        difficulty: courseData.difficulty || 'Intermediate',
        questionCount: questionCount,
        duration: duration,
        requiredTier: requiredTier,
        isPremium: requiredTier !== 'free',
        rating: courseData.rating || 0,
        attempts: courseData.attempts || courseData.enrolledStudents || 0,
        tags: [...new Set(tags)], // Remove duplicates
        imageUrl: courseData.imageUrl || courseData.imageURL || null,
        description: courseData.description || '',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        popularity: popularity
      };
      
      // Add to batch
      const indexRef = db.collection('quizIndex').doc(courseId);
      batch.set(indexRef, indexEntry, { merge: true });
      batchCount++;
      
      console.log(`✅ Indexed "${indexEntry.title}" (${questionCount} questions, ${requiredTier} tier)`);
      indexedCount++;
      
      // Commit batch every 100 documents (Firestore limit is 500)
      if (batchCount >= 100) {
        await batch.commit();
        console.log(`\n📤 Committed batch of ${batchCount} documents\n`);
        batchCount = 0;
      }
    }
    
    // Commit remaining documents
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\n📤 Committed final batch of ${batchCount} documents\n`);
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 INDEX BUILD COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully indexed: ${indexedCount} quizzes`);
    console.log(`⏭️  Skipped (no questions): ${skippedCount} courses`);
    console.log(`📁 Total processed: ${coursesSnapshot.size} courses`);
    console.log('='.repeat(60) + '\n');
    
    // Get index statistics
    const indexSnapshot = await db.collection('quizIndex').get();
    const categories = new Set();
    const tiers = { free: 0, pro: 0, premium: 0 };
    let totalQuestions = 0;
    
    indexSnapshot.forEach(doc => {
      const data = doc.data();
      categories.add(data.category);
      tiers[data.requiredTier]++;
      totalQuestions += data.questionCount;
    });
    
    console.log('📈 INDEX STATISTICS:');
    console.log(`   Categories: ${categories.size}`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Free Tier: ${tiers.free} quizzes`);
    console.log(`   Pro Tier: ${tiers.pro} quizzes`);
    console.log(`   Premium Tier: ${tiers.premium} quizzes`);
    console.log('\n✨ Quiz index is ready for optimized loading!\n');
    
  } catch (error) {
    console.error('\n❌ Error building quiz index:', error);
    process.exit(1);
  }
}

// Run the build
buildQuizIndex()
  .then(() => {
    console.log('🎉 Process completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });