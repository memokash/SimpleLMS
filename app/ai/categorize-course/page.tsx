// app/ai/categorize-courses/page.tsx
import DashboardNavigation from '../../components/DashboardNavigation';
import OpenAICourseCategorizationRunner from '../../components/OpenAICourseCategorizationRunner';

export default function CategorizeCourses() {
  return (
    <>
      <DashboardNavigation />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <OpenAICourseCategorizationRunner />
        </div>
      </div>
    </>
  );
}

export const metadata = {
  title: 'AI Course Categorization - Medical Quiz Platform',
  description: 'Use AI to automatically categorize medical courses for improved performance and organization.',
};