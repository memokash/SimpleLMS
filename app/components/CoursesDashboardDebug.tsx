'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const CoursesDashboardDebug = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      const logs: string[] = [];
      
      try {
        logs.push(`Starting load at ${new Date().toISOString()}`);
        logs.push(`User: ${user ? user.email : 'Not logged in'}`);
        
        // Direct Firebase query
        logs.push('Querying Firebase courses collection...');
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);
        
        logs.push(`Firebase returned ${snapshot.size} documents`);
        
        const coursesData: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          coursesData.push({
            id: doc.id,
            title: data.NewTitle || data.OriginalQuizTitle || data.CourseName || 'No title',
            description: data.BriefDescription || data.Description || 'No description',
            ...data
          });
        });
        
        logs.push(`Processed ${coursesData.length} courses`);
        
        // Show first 3 course titles
        coursesData.slice(0, 3).forEach((course, i) => {
          logs.push(`Course ${i + 1}: ${course.title}`);
        });
        
        setCourses(coursesData);
        setDebugInfo(logs);
        
      } catch (err: any) {
        logs.push(`ERROR: ${err.message}`);
        setError(err.message);
        setDebugInfo(logs);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, [user]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Courses Debug Dashboard</h1>
      
      {/* Debug Info */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Debug Information:</h2>
        <ul className="text-sm space-y-1 font-mono">
          {debugInfo.map((log, i) => (
            <li key={i}>{log}</li>
          ))}
        </ul>
      </div>
      
      {/* Status */}
      <div className="mb-6">
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Courses Found: {courses.length}</p>
      </div>
      
      {/* Courses Display */}
      {!loading && courses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Courses ({courses.length} total)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 12).map(course => (
              <div key={course.id} className="border p-4 rounded-lg">
                <h3 className="font-bold text-sm mb-2">{course.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </p>
                <p className="text-xs mt-2">ID: {course.id}</p>
              </div>
            ))}
          </div>
          {courses.length > 12 && (
            <p className="mt-4 text-center text-gray-600">
              ... and {courses.length - 12} more courses
            </p>
          )}
        </div>
      )}
      
      {/* No Courses */}
      {!loading && courses.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-xl">No courses found</p>
          <p className="text-gray-600 mt-2">Check the debug info above for details</p>
        </div>
      )}
    </div>
  );
};

export default CoursesDashboardDebug;