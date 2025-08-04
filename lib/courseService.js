// lib/courseService.js - CLEAN VERSION (no debug bloat)
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  limit
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Get all courses using REAL category data from questions (clean & efficient)
 */
export async function getAllCourses() {
  try {
    const coursesRef = collection(db, "courses");
    const querySnapshot = await getDocs(coursesRef);
    
    // Process courses with minimal data
    const coursePromises = querySnapshot.docs.map(async (courseDoc) => {
      const data = courseDoc.data();
      const courseId = courseDoc.id;
      
      // Get category from first question (minimal query)
      let realCategory = 'Medical Knowledge';
      try {
        const questionsRef = collection(db, 'courses', courseId, 'questions');
        const q = query(questionsRef, limit(1));
        const questionsSnapshot = await getDocs(q);
        
        if (!questionsSnapshot.empty) {
          const firstQuestion = questionsSnapshot.docs[0].data();
          // Try different possible field names
          realCategory = firstQuestion.Category || 
                        firstQuestion.category || 
                        firstQuestion.CATEGORY ||
                        'Medical Knowledge';
        }
      } catch (error) {
        // Silently fall back to default
      }
      
      return {
        id: courseId,
        title: data.NewTitle || data.OriginalQuizTitle || data.CourseName || "Untitled Course",
        courseName: data.CourseName || "",
        description: data.BriefDescription || data.Description || "Professional medical course",
        
        // Use real category data
        category: realCategory,
        specialty: realCategory,
        difficulty: inferDifficulty(data.NewTitle || data.OriginalQuizTitle || ""),
        
        // Minimal metadata to reduce payload size
        questionCount: estimateQuestionCount(data),
        estimatedTime: calculateEstimatedTime(25),
        completed: false,
        lastScore: null,
        progress: 0,
        instructor: data.instructor || "Medical Expert",
        rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10, // Round to 1 decimal
        studentsEnrolled: Math.floor(Math.random() * 1000) + 500,
        isPublic: data.isPublic !== false
      };
    });
    
    const courses = await Promise.all(coursePromises);
    return courses.sort((a, b) => a.title.localeCompare(b.title));
    
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

/**
 * Get courses by category
 */
export async function getCoursesByCategory(targetCategory) {
  try {
    const allCourses = await getAllCourses();
    return allCourses.filter(course => course.category === targetCategory);
  } catch (error) {
    console.error("Error fetching courses by category:", error);
    return [];
  }
}

/**
 * Get all categories
 */
export async function getAllCategories() { 
  try {
    const courses = await getAllCourses();
    const categories = [...new Set(courses.map(course => course.category))];
    return categories.sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Group courses by category
 */
export async function getCoursesGroupedByCategory() {
  try {
    const courses = await getAllCourses();
    const grouped = {};
    
    courses.forEach(course => {
      const category = course.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
    });
    
    return grouped;
  } catch (error) {
    console.error("Error grouping courses by category:", error);
    return {};
  }
}

/**
 * Get courses with user progress
 */
export async function getCoursesWithProgress(userId) {
  try {
    const courses = await getAllCourses();
    
    if (!userId) {
      return courses;
    }
    
    // Get user progress efficiently
    const progressQuery = query(
      collection(db, "userProgress"),
      where("userId", "==", userId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    const progressMap = {};
    
    progressSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.courseId) {
        progressMap[data.courseId] = {
          progress: data.progress || 0,
          completed: data.completed || false,
          lastScore: data.lastScore || null
        };
      }
    });
    
    // Merge progress with courses
    return courses.map(course => ({
      ...course,
      ...progressMap[course.id]
    }));
    
  } catch (error) {
    console.error("Error fetching courses with progress:", error);
    return await getAllCourses();
  }
}

/**
 * Get user course progress
 */
export async function getUserCourseProgress(userId, courseId) {
  try {
    const progressRef = doc(db, "userProgress", `${userId}_${courseId}`);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      return progressDoc.data();
    }
    
    return {
      progress: 0,
      completed: false,
      lastScore: null,
      attempts: 0,
      startedAt: null,
      completedAt: null
    };
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return { progress: 0, completed: false, lastScore: null };
  }
}

/**
 * Update user progress
 */
export async function updateUserProgress(userId, courseId, progressData) {
  try {
    const progressRef = doc(db, "userProgress", `${userId}_${courseId}`);
    
    const updateData = {
      userId,
      courseId,
      ...progressData,
      lastAccessed: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const existingProgress = await getUserCourseProgress(userId, courseId);
    if (existingProgress.progress === 0 && !existingProgress.startedAt) {
      updateData.startedAt = serverTimestamp();
    }
    
    if (progressData.completed && !existingProgress.completed) {
      updateData.completedAt = serverTimestamp();
    }
    
    await updateDoc(progressRef, updateData);
    return updateData;
  } catch (error) {
    console.error("Error updating user progress:", error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId) {
  try {
    const progressQuery = query(
      collection(db, "userProgress"),
      where("userId", "==", userId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    
    const stats = {
      coursesStarted: 0,
      coursesCompleted: 0,
      totalAttempts: 0,
      averageScore: 0,
      totalScore: 0,
      streak: 0,
      lastActivity: null,
      rank: "Beginner"
    };
    
    let totalScoreSum = 0;
    let scoredAttempts = 0;
    
    progressSnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.progress > 0) {
        stats.coursesStarted++;
      }
      if (data.completed) {
        stats.coursesCompleted++;
      }
      if (data.attempts) {
        stats.totalAttempts += data.attempts;
      }
      
      if (data.lastScore !== null && data.lastScore !== undefined) {
        totalScoreSum += data.lastScore;
        scoredAttempts++;
      }
      
      if (data.lastAccessed && (!stats.lastActivity || data.lastAccessed.toDate() > stats.lastActivity)) {
        stats.lastActivity = data.lastAccessed.toDate();
      }
    });
    
    if (scoredAttempts > 0) {
      stats.averageScore = Math.round(totalScoreSum / scoredAttempts);
      stats.totalScore = totalScoreSum;
    }
    
    stats.rank = calculateUserRank(stats.averageScore, stats.coursesCompleted);
    
    return stats;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      coursesStarted: 0,
      coursesCompleted: 0,
      totalAttempts: 0,
      averageScore: 0,
      totalScore: 0,
      streak: 0,
      lastActivity: null,
      rank: "Beginner"
    };
  }
}

// Helper Functions (minimal and efficient)

function inferDifficulty(title) {
  if (!title) {
    return 'Intermediate';
  }
  
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('basic') || lowerTitle.includes('intro') || lowerTitle.includes('fundamental')) {
    return 'Beginner';
  }
  
  if (lowerTitle.includes('advanced') || lowerTitle.includes('expert') || lowerTitle.includes('board')) {
    return 'Advanced';
  }
  
  return 'Intermediate';
}

function calculateEstimatedTime(questionCount) {
  const minutes = Math.round(questionCount * 1.5);
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
}

function estimateQuestionCount(data) {
  if (!data) {
    return 25;
  }
  
  const text = (data.CourseName + ' ' + (data.BriefDescription || '')).toLowerCase();
  
  if (text.includes('comprehensive') || text.includes('complete')) {
    return Math.floor(Math.random() * 20) + 40; // 40-60
  }
  
  if (text.includes('quick') || text.includes('brief')) {
    return Math.floor(Math.random() * 10) + 15; // 15-25
  }
  
  return Math.floor(Math.random() * 15) + 25; // 25-40
}

function calculateUserRank(averageScore, coursesCompleted) {
  if (coursesCompleted >= 10 && averageScore >= 95) {
    return 'Master';
  }
  if (coursesCompleted >= 5 && averageScore >= 90) {
    return 'Expert';
  }
  if (coursesCompleted >= 3 && averageScore >= 80) {
    return 'Advanced';
  }
  if (coursesCompleted >= 1 && averageScore >= 70) {
    return 'Intermediate';
  }
  return 'Beginner';
}