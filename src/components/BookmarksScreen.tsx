import React from 'react';
import { Question } from '../types';
import { getBookmarkedQuestions, toggleBookmark, clearAllBookmarks } from '../utils/storageService';
import { BookmarkX, ArrowLeft, Trash } from 'lucide-react';

interface BookmarksScreenProps {
  questions: Question[];
  onBack: () => void;
}

const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ questions, onBack }) => {
  const [bookmarkedIds, setBookmarkedIds] = React.useState<number[]>([]);
  const [selectedBookmark, setSelectedBookmark] = React.useState<Question | null>(null);
  
  React.useEffect(() => {
    loadBookmarks();
  }, []);
  
  const loadBookmarks = () => {
    const bookmarks = getBookmarkedQuestions();
    setBookmarkedIds(bookmarks);
    
    // Set the first bookmark as selected by default if available
    if (bookmarks.length > 0) {
      const questionId = bookmarks[0];
      const question = questions.find(q => q.question_number === questionId);
      if (question) {
        setSelectedBookmark(question);
      }
    } else {
      setSelectedBookmark(null);
    }
  };
  
  const handleRemoveBookmark = (questionId: number) => {
    toggleBookmark(questionId);
    
    // Update local state
    setBookmarkedIds(prevIds => {
      const newIds = prevIds.filter(id => id !== questionId);
      
      // If we're removing the currently selected bookmark, select another one
      if (selectedBookmark && selectedBookmark.question_number === questionId) {
        if (newIds.length > 0) {
          const nextQuestion = questions.find(q => q.question_number === newIds[0]);
          setSelectedBookmark(nextQuestion || null);
        } else {
          setSelectedBookmark(null);
        }
      }
      
      return newIds;
    });
  };
  
  const handleClearAllBookmarks = () => {
    if (confirm('Are you sure you want to remove all bookmarks?')) {
      clearAllBookmarks();
      setBookmarkedIds([]);
      setSelectedBookmark(null);
    }
  };
  
  const handleSelectBookmark = (questionId: number) => {
    const question = questions.find(q => q.question_number === questionId);
    if (question) {
      setSelectedBookmark(question);
    }
  };
  
  const bookmarkedQuestions = questions.filter(question => 
    bookmarkedIds.includes(question.question_number)
  );
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Bookmarked Questions</h1>
          <div className="flex space-x-2">
            {bookmarkedIds.length > 0 && (
              <button
                onClick={handleClearAllBookmarks}
                className="flex items-center text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash className="h-4 w-4 mr-1" />
                Clear All
              </button>
            )}
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Quiz
            </button>
          </div>
        </div>
        
        {bookmarkedIds.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* List of bookmarked questions */}
            <div className="md:w-1/3">
              <h2 className="text-lg font-medium text-gray-700 mb-3">All Bookmarks</h2>
              <div className="bg-gray-50 rounded-lg border overflow-y-auto max-h-96">
                {bookmarkedQuestions.map(question => (
                  <div 
                    key={question.question_number}
                    className={`p-3 border-b cursor-pointer hover:bg-blue-50 flex justify-between items-start ${
                      selectedBookmark?.question_number === question.question_number
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                    onClick={() => handleSelectBookmark(question.question_number)}
                  >
                    <div className="pr-2">
                      <div className="text-xs text-gray-500 mb-1">#{question.question_number}</div>
                      <div className="text-sm font-medium text-gray-800 line-clamp-2">
                        {question.question}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBookmark(question.question_number);
                      }}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove bookmark"
                    >
                      <BookmarkX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected bookmark details */}
            <div className="md:w-2/3 bg-white rounded-lg border p-6">
              {selectedBookmark ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      #{selectedBookmark.question_number}
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(selectedBookmark.question_number)}
                      className="text-gray-400 hover:text-red-500 flex items-center"
                    >
                      <BookmarkX className="h-4 w-4 mr-1" />
                      Remove Bookmark
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-6">{selectedBookmark.question}</h2>
                  
                  <div className="space-y-3 mb-6">
                    {selectedBookmark.answers.map((answer, index) => (
                      <div
                        key={index}
                        className="border p-3 rounded-md"
                      >
                        {answer}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-md">
                    <div className="font-medium text-green-800">
                      Correct Answer: {selectedBookmark.correct_answer_text}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  Select a bookmark to view its details.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">
            No bookmarks yet. During a quiz, click the bookmark icon to save questions for later review.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksScreen;