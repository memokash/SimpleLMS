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
        title: data.NewTitle || data.CourseName || "Untitled Quiz",
        courseName: data.CourseName || "",
        description: data.BriefDescription || "",
        specialty: "General Medicine",
        difficulty: "Intermediate",
        questionCount: 20,
        completed: false,
        lastScore: null,
        progress: 0
      });
    });
    
    return courses.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}
