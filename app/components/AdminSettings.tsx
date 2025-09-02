// components/AdminSettings.tsx - Example integration in existing admin panel
import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Database,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Play
} from 'lucide-react';

const AdminSettings = () => {
  const [stats, setStats] = useState({
    courses: { total: 0, categorized: 0, uncategorized: 0 },
    questions: { total: 0, enhanced: 0, needingEnhancement: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load statistics on component mount
  useEffect(() => {
    loadAIStats();
  }, []);

  const loadAIStats = async () => {
    try {
      setIsLoading(true);
      
      // Import the statistics functions
      const [categoryModule, enhancementModule] = await Promise.all([
        import('../../lib/openaiCourseCategorizer'),
        import('../../lib/openaiQuizEnhancer')
      ]);
      
      const [categoryStats, enhancementStats] = await Promise.all([
        categoryModule.getCategoryStatistics(),
        enhancementModule.getEnhancementStatistics()
      ]);
      
      setStats({
        courses: {
          total: categoryStats.totalCourses,
          categorized: categoryStats.categorized,
          uncategorized: categoryStats.uncategorized
        },
        questions: {
          total: enhancementStats.totalQuestions,
          enhanced: Math.max(
            enhancementStats.questionsWithCorrectExplanations,
            enhancementStats.questionsWithIncorrectExplanations
          ),
          needingEnhancement: enhancementStats.questionsNeedingEnhancement
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load AI statistics:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const aiFeatures = [
    {
      title: 'Course Categorization',
      description: 'Automatically categorize medical courses using AI analysis for better organization and performance.',
      icon: BookOpen,
      status: stats.courses.uncategorized > 0 ? 'needs-attention' : 'complete',
      stats: `${stats.courses.categorized}/${stats.courses.total} categorized`,
      action: 'Categorize Courses',
      href: '/ai/categorize-courses',
      color: 'purple'
    },
    {
      title: 'Explanation Enhancement',
      description: 'Generate comprehensive explanations that serve as advanced teaching material for medical education.',
      icon: GraduationCap,
      status: stats.questions.needingEnhancement > 0 ? 'needs-attention' : 'complete',
      stats: `${stats.questions.enhanced}/${stats.questions.total} enhanced`,
      action: 'Enhance Explanations',
      href: '/ai/categorize-courses',
      color: 'blue'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'needs-attention':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'All Complete';
      case 'needs-attention':
        return 'Needs Attention';
      default:
        return 'Unknown';
    }
  };

  const getProgressPercentage = (current: number, total: number) => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      {/* AI Operations Section Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl">
            <Brain className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">AI-Powered Operations</h2>
            <p className="text-purple-100 text-lg">
              Enhance your medical quiz platform with artificial intelligence
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Courses</p>
                <p className="text-2xl font-bold">{stats.courses.total}</p>
              </div>
              <Database className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Questions</p>
                <p className="text-2xl font-bold">{stats.questions.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">AI Enhancement Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(((stats.courses.categorized + stats.questions.enhanced) / 
                    (stats.courses.total + stats.questions.total)) * 100) || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          const progressPercentage = feature.title === 'Course Categorization' 
            ? getProgressPercentage(stats.courses.categorized, stats.courses.total)
            : getProgressPercentage(stats.questions.enhanced, stats.questions.total);
          
          return (
            <div key={feature.title} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div className={`p-6 bg-gradient-to-r ${
                feature.color === 'purple' 
                  ? 'from-purple-500 to-purple-600' 
                  : 'from-blue-500 to-blue-600'
              } text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6" />
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  {getStatusIcon(feature.status)}
                </div>
                
                <p className="text-sm opacity-90 mb-4">
                  {feature.description}
                </p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Status Info */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(feature.status)}
                      <span className="font-medium text-gray-900">
                        {getStatusText(feature.status)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{feature.stats}</span>
                  </div>
                  
                  {/* Feature Benefits */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Key Benefits:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {feature.title === 'Course Categorization' ? (
                        <>
                          <li>• Improved course organization and searchability</li>
                          <li>• Better performance analytics by specialty</li>
                          <li>• Automated classification saves manual effort</li>
                        </>
                      ) : (
                        <>
                          <li>• Comprehensive teaching explanations with analogies</li>
                          <li>• Medical mnemonics and clinical examples</li>
                          <li>• Advanced pathophysiology explanations</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  {/* Action Button */}
                  <a
                    href={feature.href}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
                      feature.color === 'purple'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {feature.action}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">System Requirements</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>✅ OpenAI API key configured</li>
              <li>✅ Firebase database connected</li>
              <li>✅ Course and question collections accessible</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Processing Information</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Rate limited to prevent API overuse</li>
              <li>• Batch processing for efficiency</li>
              <li>• Progress tracking and error handling</li>
            </ul>
          </div>
        </div>
        
        {isLoading && (
          <div className="mt-4 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading AI statistics...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;