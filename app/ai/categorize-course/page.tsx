// app/ai/categorize-courses/page.tsx
import OpenAICourseCategorizationRunner from '../../components/OpenAICourseCategorizationRunner';
import OpenAIOperationsRunner from '../../components/OpenAIOperationsRunner';

export const metadata = {
  title: 'AI Course Enhancement - Medical Quiz Platform',
  description: 'Use AI to automatically categorize medical courses and generate comprehensive explanations that serve as advanced teaching material.',
};

export default function AIOperationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🤖 AI Course Enhancement Suite
            </h1>
            <p className="text-gray-600">
              Automatically categorize courses and generate comprehensive explanations with AI
            </p>
          </div>

          {/* Course Categorization Section */}
          <div className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                🏷️ Course Categorization
              </h2>
              <p className="text-gray-600 mb-4">
                Automatically categorize medical courses for improved organization and performance tracking.
              </p>
            </div>
            <OpenAICourseCategorizationRunner />
          </div>

          {/* AI Operations Section */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                ✨ AI Enhancement Operations
              </h2>
              <p className="text-gray-600 mb-4">
                Generate comprehensive explanations with analogies, mnemonics, and clinical examples.
              </p>
            </div>
            <OpenAIOperationsRunner />
          </div>
        </div>
      </div>
  );
}