// app/components/QualityAssuranceSystem.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Award,
  RefreshCw,
  Filter
} from 'lucide-react';

interface ReviewItem {
  id: string;
  type: 'categorization' | 'explanation';
  courseId: string;
  courseName: string;
  questionText?: string;
  aiCorrectExplanation?: string;
  aiIncorrectExplanation?: string;
  aiCategory?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  category: string;
}

export default function QualityAssuranceSystem() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load review items
  useEffect(() => {
    loadReviewItems();
  }, []);

  const loadReviewItems = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      // const reviewQuery = query(
      //   collection(db, 'qaReviewItems'),
      //   where('status', '==', 'pending'),
      //   orderBy('submittedAt', 'desc')
      // );
      // const reviewSnapshot = await getDocs(reviewQuery);
      // const items = reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReviewItem));
      // setReviewItems(items);

      // Initialize with empty array until Firebase collection is set up
      setReviewItems([]);
    } catch (error) {
      console.error('Failed to load review items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (decision: 'approved' | 'rejected') => {
    if (!selectedItem) {
      return;
    }

    try {
      const updatedItem = {
        ...selectedItem,
        status: decision,
        reviewedAt: new Date(),
        reviewComments: reviewComment,
        rating: reviewRating
      };

      setReviewItems(prev => 
        prev.map(item => item.id === selectedItem.id ? updatedItem : item)
      );

      setSelectedItem(null);
      setReviewComment('');
      setReviewRating(5);

      console.log('Review submitted:', updatedItem);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const filteredItems = reviewItems.filter(item => {
    return filterStatus === 'all' || item.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Eye className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p>Loading review items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Assurance</h1>
              <p className="text-gray-600">Review and approve AI-generated content</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Filters */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Review Items */}
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedItem?.id === item.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">{item.status}</span>
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">{item.courseName}</h3>
                        
                        {item.questionText && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.questionText}
                          </p>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          {item.submittedAt.toLocaleDateString()} • {item.category}
                        </div>
                      </div>
                      
                      <Eye className="h-5 w-5 text-gray-400 ml-4" />
                    </div>
                  </div>
                ))}
                
                {filteredItems.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No review items found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Details */}
          <div className="lg:col-span-1">
            {selectedItem ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Details</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedItem.status)}`}>
                    {getStatusIcon(selectedItem.status)}
                    <span className="ml-2 capitalize">{selectedItem.status}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Course</h4>
                    <p className="text-sm text-gray-700">{selectedItem.courseName}</p>
                  </div>

                  {selectedItem.questionText && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Question</h4>
                      <p className="text-sm text-gray-700">{selectedItem.questionText}</p>
                    </div>
                  )}

                  {selectedItem.type === 'categorization' && selectedItem.aiCategory && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI Category</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm text-blue-800 font-medium">{selectedItem.aiCategory}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'explanation' && (
                    <>
                      {selectedItem.aiCorrectExplanation && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                            Correct Explanation
                          </h4>
                          <div className="bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-sm text-green-800">
                              {selectedItem.aiCorrectExplanation.substring(0, 200)}...
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedItem.aiIncorrectExplanation && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 text-red-600 mr-1" />
                            Incorrect Explanation
                          </h4>
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800">
                              {selectedItem.aiIncorrectExplanation.substring(0, 200)}...
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Review Actions */}
                {selectedItem.status === 'pending' && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quality Rating
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setReviewRating(rating)}
                              className={`p-1 ${
                                rating <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              <Star className="h-5 w-5 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review Comments
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Add your review comments..."
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleReviewSubmit('approved')}
                          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        
                        <button
                          onClick={() => handleReviewSubmit('rejected')}
                          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a review item to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}