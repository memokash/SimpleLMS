// lib/questionBankService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Save individual questions to the question bank
 * @param {Array} questions - Array of question objects from AI generation
 * @param {Object} metadata - Content metadata (specialty, difficulty, etc.)
 * @param {string} userId - User who generated the questions
 */
export async function saveQuestionsToBank(questions, metadata, userId) {
  try {
    const batch = writeBatch(db);
    const savedQuestions = [];

    for (const question of questions) {
      const questionDoc = {
        // Question content
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        topic: question.topic,
        
        // Metadata
        specialty: metadata.specialty || 'General Medicine',
        difficulty: metadata.difficulty || 'Intermediate',
        sourceContent: metadata.filename || 'AI Generated',
        
        // Tracking
        createdBy: userId,
        createdAt: serverTimestamp(),
        timesUsed: 0,
        avgScore: 0,
        totalAttempts: 0,
        
        // Tags for better searching
        tags: [
          metadata.specialty?.toLowerCase(),
          metadata.difficulty?.toLowerCase(),
          question.topic?.toLowerCase(),
          ...extractKeywords(question.question)
        ].filter(Boolean),
        
        // Quality metrics
        isVerified: false,
        qualityScore: 0,
        reports: 0,
        
        // AI generation info
        aiGenerated: true,
        generationModel: 'gpt-4',
        generationDate: serverTimestamp()
      };

      const docRef = doc(collection(db, "questionBank"));
      batch.set(docRef, questionDoc);
      savedQuestions.push({ id: docRef.id, ...questionDoc });
    }

    await batch.commit();
    
    // Update question bank stats
    await updateQuestionBankStats(metadata.specialty, questions.length);
    
    console.log(`Successfully saved ${questions.length} questions to question bank`);
    return savedQuestions;
    
  } catch (error) {
    console.error("Error saving questions to bank:", error);
    throw error;
  }
}

/**
 * Generate a quiz from the question bank based on user preferences
 * @param {Object} preferences - Quiz preferences
 */
export async function generateQuizFromBank(preferences) {
  try {
    const {
      specialty = 'all',
      difficulty = 'all',
      topics = [],
      questionCount = 20,
      userId,
      excludeUsedRecently = true
    } = preferences;

    // Build query constraints
    let constraints = [orderBy('timesUsed', 'asc')]; // Prioritize less-used questions
    
    if (specialty !== 'all') {
      constraints.push(where('specialty', '==', specialty));
    }
    
    if (difficulty !== 'all') {
      constraints.push(where('difficulty', '==', difficulty));
    }
    
    if (topics.length > 0) {
      constraints.push(where('topic', 'in', topics));
    }

    // Get questions from question bank
    const q = query(
      collection(db, "questionBank"),
      ...constraints,
      limit(questionCount * 2) // Get more than needed for better selection
    );
    
    const querySnapshot = await getDocs(q);
    const availableQuestions = [];
    
    querySnapshot.forEach((doc) => {
      availableQuestions.push({ id: doc.id, ...doc.data() });
    });

    if (availableQuestions.length < questionCount) {
      throw new Error(`Not enough questions available. Found ${availableQuestions.length}, need ${questionCount}`);
    }

    // Select final questions with variety
    const selectedQuestions = selectDiverseQuestions(availableQuestions, questionCount);
    
    // Generate quiz metadata
    const quizData = {
      title: generateQuizTitle(selectedQuestions, specialty, difficulty),
      description: generateQuizDescription(selectedQuestions),
      questions: selectedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic
      })),
      metadata: {
        specialty,
        difficulty,
        questionCount: selectedQuestions.length,
        avgDifficulty: calculateAvgDifficulty(selectedQuestions),
        topics: [...new Set(selectedQuestions.map(q => q.topic))],
        createdAt: new Date(),
        createdBy: 'AI Quiz Generator',
        aiGenerated: true
      }
    };

    // Update usage stats for selected questions
    await updateQuestionUsageStats(selectedQuestions.map(q => q.id));
    
    // Save the generated quiz
    return await saveGeneratedQuiz(quizData, userId);
    
  } catch (error) {
    console.error("Error generating quiz from bank:", error);
    throw error;
  }
}

/**
 * Get question bank statistics
 */
export async function getQuestionBankStats() {
  try {
    const q = query(collection(db, "questionBank"));
    const querySnapshot = await getDocs(q);
    
    const stats = {
      totalQuestions: 0,
      bySpecialty: {},
      byDifficulty: {},
      byTopic: {},
      recentlyAdded: 0
    };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.totalQuestions++;
      
      // Count by specialty
      stats.bySpecialty[data.specialty] = (stats.bySpecialty[data.specialty] || 0) + 1;
      
      // Count by difficulty
      stats.byDifficulty[data.difficulty] = (stats.byDifficulty[data.difficulty] || 0) + 1;
      
      // Count by topic
      stats.byTopic[data.topic] = (stats.byTopic[data.topic] || 0) + 1;
      
      // Count recently added
      if (data.createdAt && data.createdAt.toDate() > oneWeekAgo) {
        stats.recentlyAdded++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error("Error getting question bank stats:", error);
    return null;
  }
}

/**
 * Search questions by keywords
 */
export async function searchQuestions(searchTerm, filters = {}) {
  try {
    let constraints = [];
    
    if (filters.specialty) {
      constraints.push(where('specialty', '==', filters.specialty));
    }
    
    if (filters.difficulty) {
      constraints.push(where('difficulty', '==', filters.difficulty));
    }
    
    const q = query(
      collection(db, "questionBank"),
      ...constraints,
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const questions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Simple text search (you could enhance this with Algolia or similar)
      if (searchTerm === '' || 
          data.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.tags.some(tag => tag.includes(searchTerm.toLowerCase()))) {
        questions.push({ id: doc.id, ...data });
      }
    });
    
    return questions;
  } catch (error) {
    console.error("Error searching questions:", error);
    return [];
  }
}

// Helper Functions

function extractKeywords(text) {
  // Simple keyword extraction - you could enhance this with NLP
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5); // Take first 5 meaningful words
}

function selectDiverseQuestions(questions, count) {
  // Ensure diversity in topics and difficulty
  const topicGroups = {};
  
  questions.forEach(q => {
    if (!topicGroups[q.topic]) {
      topicGroups[q.topic] = [];
    }
    topicGroups[q.topic].push(q);
  });
  
  const selected = [];
  const topics = Object.keys(topicGroups);
  let topicIndex = 0;
  
  while (selected.length < count && selected.length < questions.length) {
    const currentTopic = topics[topicIndex % topics.length];
    const topicQuestions = topicGroups[currentTopic];
    
    if (topicQuestions && topicQuestions.length > 0) {
      // Get the least used question from this topic
      const question = topicQuestions.shift();
      selected.push(question);
    }
    
    topicIndex++;
    
    // Safety break if we've cycled through all topics
    if (topicIndex > topics.length * 10) {
      break;
    }
  }
  
  return selected;
}

function generateQuizTitle(questions, specialty, difficulty) {
  const topics = [...new Set(questions.map(q => q.topic))];
  const mainTopic = topics[0];
  
  if (specialty !== 'all') {
    if (topics.length === 1) {
      return `${specialty}: ${mainTopic} ${difficulty !== 'all' ? difficulty : ''} Quiz`;
    } else {
      return `${specialty}: Mixed Topics ${difficulty !== 'all' ? difficulty : ''} Quiz`;
    }
  } else {
    return `Medical Knowledge: ${topics.length > 1 ? 'Mixed Topics' : mainTopic} Quiz`;
  }
}

function generateQuizDescription(questions) {
  const topics = [...new Set(questions.map(q => q.topic))];
  const specialties = [...new Set(questions.map(q => q.specialty))];
  
  let description = `This quiz contains ${questions.length} questions covering `;
  
  if (topics.length === 1) {
    description += `${topics[0]}`;
  } else if (topics.length <= 3) {
    description += topics.join(', ');
  } else {
    description += `${topics.length} different topics including ${topics.slice(0, 2).join(', ')} and more`;
  }
  
  if (specialties.length === 1) {
    description += ` in ${specialties[0]}`;
  }
  
  description += '. Generated from our comprehensive question bank to provide you with a diverse learning experience.';
  
  return description;
}

function calculateAvgDifficulty(questions) {
  const difficultyScores = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3
  };
  
  const total = questions.reduce((sum, q) => sum + (difficultyScores[q.difficulty] || 2), 0);
  const avg = total / questions.length;
  
  if (avg <= 1.3) {
    return 'Beginner';
  }
  if (avg <= 2.3) {
    return 'Intermediate';
  }
  return 'Advanced';
}

async function updateQuestionUsageStats(questionIds) {
  try {
    const batch = writeBatch(db);
    
    questionIds.forEach(id => {
      const questionRef = doc(db, "questionBank", id);
      batch.update(questionRef, {
        timesUsed: increment(1),
        lastUsed: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error updating question usage stats:", error);
  }
}

async function updateQuestionBankStats(specialty, questionCount) {
  try {
    const statsRef = doc(db, "systemStats", "questionBank");
    await updateDoc(statsRef, {
      totalQuestions: increment(questionCount),
      [`specialtyStats.${specialty}`]: increment(questionCount),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    // Document might not exist, create it
    await addDoc(collection(db, "systemStats"), {
      id: "questionBank",
      totalQuestions: questionCount,
      specialtyStats: { [specialty]: questionCount },
      lastUpdated: serverTimestamp()
    });
  }
}

async function saveGeneratedQuiz(quizData, userId) {
  try {
    const quizDoc = {
      ...quizData,
      createdFor: userId,
      createdAt: serverTimestamp(),
      isPublic: true,
      timesUsed: 0,
      avgScore: 0,
      completions: 0
    };
    
    const docRef = await addDoc(collection(db, "generatedQuizzes"), quizDoc);
    return { id: docRef.id, ...quizDoc };
  } catch (error) {
    console.error("Error saving generated quiz:", error);
    throw error;
  }
}