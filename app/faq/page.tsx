'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top navigation bar. You can register using your email address or sign up with Google. After registration, you\'ll have immediate access to free content and can explore premium features.'
        },
        {
          question: 'What\'s included in the free account?',
          answer: 'Free accounts include access to sample quizzes, basic progress tracking, and limited question bank access. You can try 10-question sample quizzes for each subject to experience our platform before upgrading.'
        },
        {
          question: 'How do I take my first quiz?',
          answer: 'After logging in, navigate to the "Medical School Quizzes" section, select your subject area and difficulty level, then click "Start Quiz". You can choose between full-length quizzes or quick 10-question samples.'
        }
      ]
    },
    {
      category: 'Subscriptions & Billing',
      questions: [
        {
          question: 'What subscription plans are available?',
          answer: 'We offer three plans: Basic ($19/month) with core features, Premium ($39/month) with AI tutor and analytics, and Pro ($59/month) with unlimited access to all features including custom quiz generation and priority support.'
        },
        {
          question: 'Can I change or cancel my subscription?',
          answer: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time from your account settings. Changes take effect at the next billing cycle, and you\'ll retain access to paid features until the end of your current period.'
        },
        {
          question: 'Do you offer student discounts?',
          answer: 'Yes! We offer a 20% student discount with valid .edu email verification. We also provide special pricing for medical schools and bulk licenses for study groups.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and PayPal. All payments are processed securely through our payment partners.'
        }
      ]
    },
    {
      category: 'Features & Tools',
      questions: [
        {
          question: 'What is the AI Tutor feature?',
          answer: 'Our AI Tutor provides personalized explanations for quiz questions, helps identify knowledge gaps, and creates custom study plans based on your performance. It\'s available with Premium and Pro subscriptions.'
        },
        {
          question: 'How does the Community Question Bank work?',
          answer: 'Students and educators can contribute questions to our community bank. All submissions are reviewed by medical professionals before being added. Contributors earn points that can be redeemed for subscription discounts.'
        },
        {
          question: 'Can I track my progress over time?',
          answer: 'Yes! Our analytics dashboard shows your performance trends, strengths and weaknesses by topic, time spent studying, and predicted exam readiness. Premium users get detailed insights and comparative analytics.'
        },
        {
          question: 'Are explanations provided for all questions?',
          answer: 'Every question includes detailed explanations covering why each answer is correct or incorrect, relevant concepts, and links to additional resources. Premium users also get video explanations for complex topics.'
        }
      ]
    },
    {
      category: 'Technical & Account',
      questions: [
        {
          question: 'How many devices can I use simultaneously?',
          answer: 'You can be signed in on up to 2 devices at the same time. This allows you to study on both your laptop and mobile device. Additional device sign-ins will log out the oldest session.'
        },
        {
          question: 'Is there a mobile app available?',
          answer: 'Yes, we have mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store. Your account syncs across all devices.'
        },
        {
          question: 'What should I do if I forget my password?',
          answer: 'Click the "Forgot Password" link on the sign-in page. Enter your email address and we\'ll send you a password reset link. For security, the link expires after 1 hour.'
        },
        {
          question: 'How is my data protected?',
          answer: 'We use industry-standard encryption for all data transmission and storage. Your personal information is never shared with third parties without your consent. See our Privacy Policy for full details.'
        }
      ]
    },
    {
      category: 'Content & Exams',
      questions: [
        {
          question: 'Which medical exams do you cover?',
          answer: 'We provide comprehensive preparation for USMLE Steps 1, 2 CK, and 3, COMLEX Levels 1, 2, and 3, medical school course exams, and specialty board reviews. Content is updated regularly to match current exam formats.'
        },
        {
          question: 'How often is content updated?',
          answer: 'Our content team updates questions weekly based on the latest exam changes, medical guidelines, and student feedback. Major content reviews happen quarterly to ensure accuracy and relevance.'
        },
        {
          question: 'Can I create custom quizzes?',
          answer: 'Pro subscribers can create custom quizzes by selecting specific topics, question difficulty, and quiz length. You can also save custom quiz configurations for repeated practice.'
        },
        {
          question: 'Are the questions similar to real exams?',
          answer: 'Our questions are written by medical professionals who have taken these exams recently. We follow official exam blueprints and use similar question formats, ensuring authentic practice experience.'
        }
      ]
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Find answers to common questions about MedicalSchoolQuizzes
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No questions found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredFAQs.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {category.questions.map((item, itemIndex) => {
                    const currentIndex = questionIndex++;
                    const isOpen = openItems.includes(currentIndex);
                    
                    return (
                      <div
                        key={itemIndex}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(currentIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-white pr-4">
                            {item.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 pt-0">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still Need Help Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/support"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Visit Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}