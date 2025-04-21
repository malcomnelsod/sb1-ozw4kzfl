import React, { useState } from 'react';
import { Question, QuizState } from '../types';
import { findCorrectAnswerOption } from '../utils/questionUtils';
import { formatDuration } from '../utils/timeUtils';
import { downloadJson } from '../utils/fileUtils';
import { getIncorrectQuestions } from '../utils/questionUtils';
import { ClipboardCheck, Download, RefreshCw, BookmarkCheck } from 'lucide-react';

interface ResultsReviewProps {
  quizState: QuizState;
  onRestartQuiz: () => void;
  onRetestIncorrect: () => void;
}

const ResultsReview: React.FC<ResultsReviewProps> = ({ 
  quizState, 
  onRestartQuiz,
  onRetestIncorrect 
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  
  const { 
    questions, 
    selectedAnswers, 
    correctAnswers, 
    incorrectAnswers,
    startTime, 
    endTime,
    bookmarkedQuestions 
  } = quizState;
  
  // Calculate score
  const totalAnswered = correctAnswers.length + incorrectAnswers.length;
  const scorePercentage = totalAnswered > 0 
    ? Math.round((correctAnswers.length / totalAnswered) * 100) 
    : 0;
  
  // Calculate time taken
  const timeTaken = endTime && startTime ? Math.floor((endTime - startTime) / 1000) : 0;
  
  // Filter questions based on active tab
  const getFilteredQuestions = (): number[] => {
    switch (activeTab) {
      case 'correct':
        return correctAnswers;
      case 'incorrect':
        return incorrectAnswers;
      case 'bookmarked':
        return bookmarkedQuestions;
      default:
        return questions.map((_, index) => index);
    }
  };
  
  const filteredQuestionIndices = getFilteredQuestions();
  
  // Ensure selected question is in the filtered list
  React.useEffect(() => {
    if (filteredQuestionIndices.length > 0 && !filteredQuestionIndices.includes(selectedQuestionIndex)) {
      setSelectedQuestionIndex(filteredQuestionIndices[0]);
    }
  }, [activeTab, filteredQuestionIndices]);
  
  // Get the currently selected question
  const currentQuestion = questions[selectedQuestionIndex];
  
  // Check if a question was answered
  const wasAnswered = (index: number): boolean => {
    return index in selectedAnswers;
  };
  
  // Check if a question was answered correctly
  const wasCorrect = (index: number): boolean => {
    return correctAnswers.includes(index);
  };
  
  // Get answer status class
  const getAnswerClass = (questionIndex: number, answer: string): string => {
    if (!wasAnswered(questionIndex)) {
      return '';
    }
    
    const selectedAnswer = selectedAnswers[questionIndex];
    const isCorrectAnswer = findCorrectAnswerOption(questions[questionIndex]) === answer;
    
    if (isCorrectAnswer) {
      return 'bg-green-100 border-green-500';
    }
    
    if (selectedAnswer === answer) {
      return 'bg-red-100 border-red-500';
    }
    
    return 'opacity-70';
  };
  
  // Download incorrect questions as JSON
  const handleDownloadIncorrect = () => {
    if (incorrectAnswers.length === 0) return;
    
    const incorrectQs = getIncorrectQuestions(questions, incorrectAnswers);
    downloadJson(incorrectQs, 'incorrect_questions.json');
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Results Summary Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Quiz Results</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-700 mb-2">{scorePercentage}%</div>
            <div className="text-sm text-gray-600">
              {correctAnswers.length} correct out of {totalAnswered} answered
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-700 mb-2">{correctAnswers.length}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-4xl font-bold text-red-700 mb-2">{incorrectAnswers.length}</div>
            <div className="text-sm text-gray-600">Incorrect Answers</div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="text-gray-600">
              <span className="font-medium">Time taken:</span> {formatDuration(timeTaken)}
            </div>
            
            <div className="flex space-x-3 mt-2 sm:mt-0">
              <button
                onClick={onRestartQuiz}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart Quiz
              </button>
              
              {incorrectAnswers.length > 0 && (
                <button
                  onClick={onRetestIncorrect}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition duration-150 flex items-center"
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Retest Incorrect
                </button>
              )}
              
              {incorrectAnswers.length > 0 && (
                <button
                  onClick={handleDownloadIncorrect}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Incorrect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b">
          <nav className="flex flex-wrap">
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('all')}
            >
              All Questions ({questions.length})
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'correct' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('correct')}
            >
              Correct ({correctAnswers.length})
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'incorrect' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('incorrect')}
            >
              Incorrect ({incorrectAnswers.length})
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'bookmarked' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('bookmarked')}
            >
              Bookmarked ({bookmarkedQuestions.length})
            </button>
          </nav>
        </div>
      </div>
      
      {/* Question Review */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Question Numbers Grid */}
        <div className="lg:w-1/4 bg-white rounded-lg shadow-lg p-4 h-min">
          <h3 className="font-medium text-gray-700 mb-3">Question Numbers</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {filteredQuestionIndices.map((index) => (
              <button
                key={index}
                className={`p-2 text-sm rounded ${
                  selectedQuestionIndex === index
                    ? 'bg-blue-600 text-white'
                    : wasAnswered(index)
                    ? wasCorrect(index)
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        
        {/* Question Detail */}
        <div className="lg:w-3/4 bg-white rounded-lg shadow-lg p-6">
          {currentQuestion ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  #{currentQuestion.question_number}
                </span>
                {bookmarkedQuestions.includes(selectedQuestionIndex) && (
                  <BookmarkCheck className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
              
              <div className="space-y-3 mb-6">
                {currentQuestion.answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className={`border p-3 rounded-md ${getAnswerClass(selectedQuestionIndex, answer)}`}
                  >
                    {answer}
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-green-50 rounded-md">
                <div className="font-medium text-green-800">
                  Correct Answer: {findCorrectAnswerOption(currentQuestion)}
                </div>
              </div>
              
              {wasAnswered(selectedQuestionIndex) && (
                <div className={`mt-4 p-4 rounded-md ${
                  wasCorrect(selectedQuestionIndex) ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className={`font-medium ${
                    wasCorrect(selectedQuestionIndex) ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Your Answer: {selectedAnswers[selectedQuestionIndex]}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No questions to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsReview;