// lib/initUserProgress.js
// Helper script to initialize user progress structure
// Run this once if you want to set up the user progress collection

import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Initialize user progress for existing courses
 * This creates the userProgress collection structure
 */
export async function initializeUserProgressCollection() {
  try {
    // Create a sample user progress document to establish the collection structure
    const sampleProgressDoc = {
      userId: "sample_user_id",
      courseId: "sample_course_id",
      progress: 0,
      completed: false,
      lastScore: null,
      attempts: 0,
      startedAt: null,
      completedAt: null,
      lastAccessed: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Create the document in the userProgress collection
    await setDoc(doc(db, "userProgress", "sample_user_sample_course"), sampleProgressDoc);
    
    console.log("✅ User progress collection structure initialized");
    console.log("📝 You can now delete the sample document from Firebase Console if desired");
    
    return true;
  } catch (error) {
    console.error("❌ Error initializing user progress collection:", error);
    return false;
  }
}

/**
 * Initialize user progress for a specific user and course
 */
export async function initializeUserCourseProgress(userId, courseId) {
  try {
    const progressDoc = {
      userId,
      courseId,
      progress: 0,
      completed: false,
      lastScore: null,
      attempts: 0,
      startedAt: null,
      completedAt: null,
      lastAccessed: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "userProgress", `${userId}_${courseId}`), progressDoc);
    
    console.log(`✅ Initialized progress for user ${userId} in course ${courseId}`);
    return progressDoc;
  } catch (error) {
    console.error("❌ Error initializing user course progress:", error);
    throw error;
  }
}

/**
 * Batch initialize progress for a user across all courses
 */
export async function initializeUserProgressForAllCourses(userId, courseIds) {
  try {
    const promises = courseIds.map(courseId => 
      initializeUserCourseProgress(userId, courseId)
    );
    
    await Promise.all(promises);
    
    console.log(`✅ Initialized progress for user ${userId} across ${courseIds.length} courses`);
    return true;
  } catch (error) {
    console.error("❌ Error batch initializing user progress:", error);
    return false;
  }
}