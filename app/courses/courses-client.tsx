"use client";

import QuizLibraryOptimized from '../components/QuizLibraryOptimized';

export default function CoursesClient() {
  return <QuizLibraryOptimized />;
}
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // Show 24 quizzes per page

  // Fetch all quizzes from Firebase
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        const querySnapshot = await getDocs(coursesRef);
        
        const fetchedQuizzes: Quiz[] = [];
        
        // Process each quiz document
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          
          // Get question count and check for explanations
          const questionsRef = collection(db, 'courses', docSnapshot.id, 'questions');
          const questionsSnapshot = await getDocs(questionsRef);
          
          let hasExplanations = false;
          questionsSnapshot.forEach((questionDoc) => {
            const questionData = questionDoc.data();
            if (questionData.CorrectExplanation || questionData.IncorrectExplanation || 
                questionData['Correct Answer Message'] || questionData['Hint Message']) {
              hasExplanations = true;
            }
          });
          
          // Determine category from title or data
          let category = 'internal';
          const titleLower = (data.title || data.courseName || '').toLowerCase();
          
          if (titleLower.includes('cardio') || titleLower.includes('heart')) category = 'cardiology';
          else if (titleLower.includes('neuro') || titleLower.includes('brain')) category = 'neurology';
          else if (titleLower.includes('pedia') || titleLower.includes('child')) category = 'pediatrics';
          else if (titleLower.includes('surg')) category = 'surgery';
          else if (titleLower.includes('path')) category = 'pathology';
          else if (titleLower.includes('pharm')) category = 'pharmacology';
          else if (titleLower.includes('emerg')) category = 'emergency';
          else if (titleLower.includes('radio')) category = 'radiology';
          else if (titleLower.includes('ortho')) category = 'orthopedics';
          
          // Use ONLY actual data from Firebase - no made up data
          fetchedQuizzes.push({
            id: docSnapshot.id,
            title: data.title || data.courseName || '',
            description: data.description || data.summary || '',
            category: data.category || category,
            specialty: data.specialty,
            difficulty: data.difficulty,
            questionCount: questionsSnapshot.size,
            hasExplanations,
            estimatedTime: data.estimatedTime,
            completions: data.completions,
            averageScore: data.averageScore,
            tags: data.tags,
            courseName: data.courseName
          });
        }
        
        // Sort by title
        fetchedQuizzes.sort((a, b) => a.title.localeCompare(b.title));
        
        setQuizzes(fetchedQuizzes);
        setFilteredQuizzes(fetchedQuizzes);
        console.log(`Loaded ${fetchedQuizzes.length} quizzes from Firebase`);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter quizzes
  useEffect(() => {
    let filtered = [...quizzes];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuizzes(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, quizzes]);

  // Pagination
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleQuizClick = (quizId: string) => {
    // Navigate to the quiz page where users can take the quiz
    router.push(`/quiz/${quizId}`);
  };

  const QuizTile = ({ quiz }: { quiz: Quiz }) => {
    const categoryInfo = medicalCategories[quiz.category as keyof typeof medicalCategories] || medicalCategories.internal;
    const Icon = categoryInfo.icon;

    return (
      <div
        onClick={() => handleQuizClick(quiz.id)}
        className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 
                   hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl 
                   transition-all duration-200 cursor-pointer p-5 h-full flex flex-col"
      >
        {/* Category Header */}
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${categoryInfo.color} bg-opacity-10`}>
            <Icon className={`w-4 h-4 mr-2 ${categoryInfo.color.replace('bg-', 'text-')}`} />
            <span className={`text-xs font-semibold ${categoryInfo.color.replace('bg-', 'text-')}`}>
              {categoryInfo.name}
            </span>
          </div>
          {quiz.hasExplanations && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Lightbulb className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Explanations</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
          {quiz.description}
        </p>

        {/* Stats Grid - Only show actual data */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          {quiz.questionCount > 0 && (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4 mr-1" />
              <span>{quiz.questionCount} questions</span>
            </div>
          )}
          {quiz.estimatedTime && (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{quiz.estimatedTime} min</span>
            </div>
          )}
          {quiz.completions && (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 mr-1" />
              <span>{quiz.completions} taken</span>
            </div>
          )}
          {quiz.averageScore && (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{quiz.averageScore}% avg</span>
            </div>
          )}
        </div>

        {/* Bottom Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className={`text-xs px-2 py-1 rounded font-medium
            ${quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {quiz.difficulty}
          </span>
          <button className="flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">
            Start Learning
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading medical courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Medical Education Courses
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {quizzes.length} comprehensive courses with detailed explanations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(medicalCategories).slice(0, 8).map(([key, cat]) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                              transition-all duration-200 ${
                      selectedCategory === key
                        ? `${cat.color} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {cat.name}
                    {key !== 'all' && (
                      <span className="ml-1.5 text-xs opacity-75">
                        {quizzes.filter(q => q.category === key).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {filteredQuizzes.length} Courses Available
                </span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {filteredQuizzes.reduce((acc, q) => acc + q.questionCount, 0).toLocaleString()}+ Questions
                </span>
              </div>
              <div className="flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {filteredQuizzes.filter(q => q.hasExplanations).length} with Explanations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        {paginatedQuizzes.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
            }>
              {paginatedQuizzes.map((quiz) => (
                <QuizTile key={quiz.id} quiz={quiz} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}