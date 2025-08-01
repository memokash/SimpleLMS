import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getAllCourses() {
  try {
    const coursesRef = collection(db, "courses");
    const querySnapshot = await getDocs(coursesRef);
    
    const courses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      courses.push({
        id: doc.id,
        title: data.NewTitle || data.OriginalQuizTitle || data.CourseName || "Untitled Quiz",
        courseName: data.CourseName || "",
        description: data.BriefDescription || "",
        specialty: "General Medicine", // Temporarily hardcoded
        difficulty: "Intermediate",
        questionCount: 20,
        completed: false,
        lastScore: null,
        progress: 0
      });
    });
    
    return courses.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

// Placeholder functions for the dashboard
export async function getAllCategories() { return []; }
export async function getCoursesGroupedByCategory() { return {}; }