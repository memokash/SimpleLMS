// lib/questionBankService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  doc,
  getDoc,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Save a batch of questions to the question bank
export const saveQuestionsToBank = async (questions, metadata) => {
  try {
    const batch = [];
    const questionBankRef = collection(db, 'questionBank');
    
    for (const question of questions) {
      const questionData = {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        topic: question.topic || metadata.topic || 'General',
        specialty: metadata.specialty || 'Medical',
        difficulty: metadata.difficulty || 'Intermediate',
        category: metadata.category || 'Medical Knowledge', // 🔥 NEW: Category field
        createdBy: metadata.userId,
        createdAt: Timestamp.now(),
        sourceType: metadata.sourceType || 'content-upload',
        sourceId: metadata.sourceId || null,
        aiGenerated: true,
        timesUsed: 0,
        qualityScore: 8.0, // Default quality score
        lastUsed: null,
        tags: [
          ...(metadata.tags || []),
          metadata.specialty?.toLowerCase(),
          metadata.category?.toLowerCase(),
          question.topic?.toLowerCase()
        ].filter(Boolean),
        verified: false,
        upvotes: 0,
        downvotes: 0
      };
      
      batch.push(addDoc(questionBankRef, questionData));
    }
    
    // Execute all saves
    const results = await Promise.all(batch);
    
    // Update user stats
    await updateUserQuestionStats(metadata.userId, questions.length);
    
    console.log(`✅ Saved ${questions.length} questions to question bank`);
    return results;
    
  } catch (error) {
    console.error('❌ Error saving questions to bank:', error);
    throw error;
  }
};

// Get question bank statistics
export const getQuestionBankStats = async () => {
  try {
    const questionsRef = collection(db, 'questionBank');
    const snapshot = await getDocs(questionsRef);
    
    const stats = {
      totalQuestions: 0,
      bySpecialty: {},
      byDifficulty: {},
      byTopic: {},
      byCategory: {}, // 🔥 NEW: Category statistics
      recentlyAdded: 0
    };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      stats.totalQuestions++;
      
      // Count by specialty
      stats.bySpecialty[data.specialty] = (stats.bySpecialty[data.specialty] || 0) + 1;
      
      // Count by difficulty
      stats.byDifficulty[data.difficulty] = (stats.byDifficulty[data.difficulty] || 0) + 1;
      
      // Count by topic
      stats.byTopic[data.topic] = (stats.byTopic[data.topic] || 0) + 1;
      
      // 🔥 NEW: Count by category
      stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
      
      // Count recently added
      if (data.createdAt?.toDate() > oneWeekAgo) {
        stats.recentlyAdded++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting question bank stats:', error);
    throw error;
  }
};

// Search questions with filters
export const searchQuestions = async (searchTerm = '', filters = {}) => {
  try {
    let questionsQuery = collection(db, 'questionBank');
    
    // Apply filters
    const constraints = [];
    
    if (filters.specialty) {
      constraints.push(where('specialty', '==', filters.specialty));
    }
    
    if (filters.difficulty) {
      constraints.push(where('difficulty', '==', filters.difficulty));
    }
    
    if (filters.topic) {
      constraints.push(where('topic', '==', filters.topic));
    }
    
    // 🔥 NEW: Category filter
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(50));
    
    if (constraints.length > 0) {
      questionsQuery = query(questionsQuery, ...constraints);
    }
    
    const snapshot = await getDocs(questionsQuery);
    const questions = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Apply text search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const questionText = data.question.toLowerCase();
        const topicText = data.topic.toLowerCase();
        const specialtyText = data.specialty.toLowerCase();
        const categoryText = data.category?.toLowerCase() || '';
        
        if (!questionText.includes(searchLower) && 
            !topicText.includes(searchLower) && 
            !specialtyText.includes(searchLower) &&
            !categoryText.includes(searchLower)) {
          return;
        }
      }
      
      questions.push({
        id: doc.id,
        ...data
      });
    });
    
    return questions;
  } catch (error) {
    console.error('Error searching questions:', error);
    throw error;
  }
};

// Generate a quiz from the question bank
export const generateQuizFromBank = async (preferences) => {
  try {
    const {
      specialty,
      difficulty,
      category, // 🔥 NEW: Category filter
      topics,
      questionCount,
      userId,
      excludeUsedRecently = true
    } = preferences;
    
    // Build query constraints
    const constraints = [];
    
    if (specialty && specialty !== 'all') {
      constraints.push(where('specialty', '==', specialty));
    }
    
    if (difficulty && difficulty !== 'all') {
      constraints.push(where('difficulty', '==', difficulty));
    }
    
    // 🔥 NEW: Category constraint
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }
    
    // Add ordering and limit
    constraints.push(orderBy('timesUsed', 'asc')); // Prefer less-used questions
    constraints.push(limit(questionCount * 2)); // Get more than needed for selection
    
    const questionsQuery = query(collection(db, 'questionBank'), ...constraints);
    const snapshot = await getDocs(questionsQuery);
    
    let availableQuestions = [];
    snapshot.forEach(doc => {
      availableQuestions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filter by topics if specified
    if (topics && topics.length > 0) {
      availableQuestions = availableQuestions.filter(q => 
        topics.includes(q.topic)
      );
    }
    
    // Exclude recently used questions if requested
    if (excludeUsedRecently && userId) {
      const recentCutoff = new Date();
      recentCutoff.setHours(recentCutoff.getHours() - 24); // 24 hours ago
      
      availableQuestions = availableQuestions.filter(q => 
        !q.lastUsed || q.lastUsed.toDate() < recentCutoff
      );
    }
    
    // Shuffle and select questions
    const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, questionCount);
    
    if (selectedQuestions.length < questionCount) {
      throw new Error(`Only ${selectedQuestions.length} questions available with current filters. Try adjusting your preferences.`);
    }
    
    // Update usage stats for selected questions
    const updatePromises = selectedQuestions.map(q => 
      updateDoc(doc(db, 'questionBank', q.id), {
        timesUsed: increment(1),
        lastUsed: Timestamp.now()
      })
    );
    
    await Promise.all(updatePromises);
    
    // Create and return quiz object
    return {
      id: `quiz_${Date.now()}`,
      questions: selectedQuestions,
      metadata: {
        specialty: specialty || 'Mixed',
        difficulty: difficulty || 'Mixed',
        category: category || 'Mixed', // 🔥 NEW: Include category in metadata
        topics: topics || [],
        questionCount: selectedQuestions.length,
        generatedAt: new Date(),
        generatedBy: userId
      }
    };
    
  } catch (error) {
    console.error('Error generating quiz from bank:', error);
    throw error;
  }
};

// Update user question contribution stats
const updateUserQuestionStats = async (userId, questionCount) => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    if (userStatsDoc.exists()) {
      await updateDoc(userStatsRef, {
        questionsContributed: increment(questionCount),
        lastContribution: Timestamp.now()
      });
    } else {
      await addDoc(collection(db, 'userStats'), {
        userId,
        questionsContributed: questionCount,
        quizzesCompleted: 0,
        totalScore: 0,
        averageScore: 0,
        lastContribution: Timestamp.now(),
        joinedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// Get user statistics
export const getUserStats = async (userId) => {
  try {
    const userStatsQuery = query(
      collection(db, 'userStats'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(userStatsQuery);
    
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
    
    // Return default stats if user doesn't exist
    return {
      userId,
      questionsContributed: 0,
      quizzesCompleted: 0,
      totalScore: 0,
      averageScore: 0,
      joinedAt: new Date()
    };
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};