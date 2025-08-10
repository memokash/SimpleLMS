// app/ai/page.tsx
import Link from 'next/link';
import { Brain, Zap, Database, Settings, ArrowRight, Sparkles } from 'lucide-react';

export default function AIToolsIndex() {
  const aiTools = [
    {
      title: 'Course Categorization',
      description: 'Use AI to automatically categorize all your medical courses for lightning-fast loading.',
      href: '/ai/categorize-courses',
      icon: Brain,
      color: 'purple',
      status: 'Available',
      benefits: ['10x faster loading', 'Smart categorization', 'One-time setup']
    },
    {
      title: 'Question Generation',
      description: 'Generate medical questions from content using AI (integrated in Question Bank).',
      href: '/question-bank',
      icon: Sparkles,
      color: 'blue',
      status: 'Active',
      benefits: ['AI-powered questions', 'Community building', 'Auto-categorization']
    },
    {
      title: 'Quiz Enhancement',
      description: 'Coming soon: AI-powered quiz difficulty adjustment and smart recommendations.',
      href: '#',
      icon: Zap,
      color: 'yellow',
      status: 'Coming Soon',
      benefits: ['Adaptive difficulty', 'Smart recommendations', 'Performance insights']
    },
    {
      title: 'Content Analysis',
      description: 'Coming soon: Analyze and optimize your medical course content with AI insights.',
      href: '#',
      icon: Database,
      color: 'green',
      status: 'Coming Soon',
      benefits: ['Content optimization', 'Learning insights', 'Performance metrics']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl inline-block mb-6">
                  <Brain className="w-12 h-12 text-white mx-auto" />
                </div>
                <h1 className="text-4xl font-bold mb-4">AI-Powered Tools</h1>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Enhance your medical education platform with intelligent automation and AI-driven insights
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiTools.map((tool, index) => {
              const IconComponent = tool.icon;
              const colorClasses: Record<string, string> = {
                purple: 'from-purple-500 to-purple-600 shadow-purple-200/50',
                blue: 'from-blue-500 to-blue-600 shadow-blue-200/50',
                yellow: 'from-yellow-500 to-yellow-600 shadow-yellow-200/50',
                green: 'from-green-500 to-green-600 shadow-green-200/50'
              };
              
              const statusClasses: Record<string, string> = {
                'Available': 'bg-green-100 text-green-700 border-green-200',
                'Active': 'bg-blue-100 text-blue-700 border-blue-200',
                'Coming Soon': 'bg-gray-100 text-gray-600 border-gray-200'
              };

              return (
                <div
                  key={index}
                  className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Tool Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[tool.color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses[tool.status]}`}>
                      {tool.status}
                    </span>
                  </div>

                  {/* Tool Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    {/* Benefits */}
                    <div className="space-y-2">
                      {tool.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-3"></div>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    {tool.status === 'Coming Soon' ? (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-xl font-medium cursor-not-allowed flex items-center justify-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Coming Soon
                      </button>
                    ) : (
                      <Link
                        href={tool.href}
                        className={`w-full bg-gradient-to-r ${colorClasses[tool.color]} text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center group`}
                      >
                        {tool.status === 'Available' ? 'Open Tool' : 'Go to Feature'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits Section */}
          <div className="mt-16 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use AI Tools?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Leverage the power of artificial intelligence to enhance your medical education platform and provide better learning experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl inline-block mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
                <p className="text-sm text-gray-600">
                  Dramatically improve loading speeds and user experience with intelligent optimization.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl inline-block mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Intelligence</h3>
                <p className="text-sm text-gray-600">
                  Smart categorization and content analysis powered by advanced AI models.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl inline-block mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Automation</h3>
                <p className="text-sm text-gray-600">
                  Automate repetitive tasks and focus on creating great educational content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export const metadata = {
  title: 'AI Tools - Medical Quiz Platform',
  description: 'AI-powered tools to enhance your medical education platform with intelligent automation and insights.',
};