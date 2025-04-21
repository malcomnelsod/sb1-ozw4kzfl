import React, { useState, useEffect } from 'react';
import { Question, QuizState, QuizSettings } from '../types';
import { formatTime } from '../utils/timeUtils';
import { isAnswerCorrect, findCorrectAnswerOption } from '../utils/questionUtils';
import { toggleBookmark } from '../utils/storageService';
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface QuizComponentProps {
  questions: Question[];
  settings: QuizSettings;
  initialState?: QuizState;
  initialTimeRemaining?: number;
  onQuizComplete: (state: QuizState) => void;
  onSaveProgress: (state: QuizState, timeRemaining: number) => void;
}

const QUIZ_TIME = 2.5 * 60 * 60; // 2 hours and 30 minutes in seconds

const QuizComponent: React.FC<QuizComponentProps> = ({
  questions,
  settings,
  initialState,
  initialTimeRemaining,
  onQuizComplete,
  onSaveProgress
}) => {
  const [quizState, setQuizState] = useState<QuizState>(initialState || {
    questions,
    currentQuestionIndex: 0,
    selectedAnswers: {},
    checkedAnswers: {},
    correctAnswers: [],
    incorrectAnswers: [],
    startTime: Date.now(),
    endTime: null,
    isFinished: false,
    bookmarkedQuestions: []
  });
  
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTimeRemaining || QUIZ_TIME);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  
  // Current question being displayed
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  
  // Selected answer for current question
  const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestionIndex] || '';
  
  // Check if current question has been answered
  const isAnswered = quizState.currentQuestionIndex in quizState.checkedAnswers;
  
  // Check if current question is bookmarked
  const isBookmarked = quizState.bookmarkedQuestions.includes(quizState.currentQuestionIndex);

  // Timer countdown
  useEffect(() => {
    if (quizState.isFinished) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizState.isFinished]);

  // Handle time up
  const handleTimeUp = () => {
    const newState = { 
      ...quizState,
      endTime: Date.now(),
      isFinished: true
    };
    setQuizState(newState);
    onQuizComplete(newState);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return; // Don't allow changing answer after checking
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [prev.currentQuestionIndex]: answer
      }
    }));
  };

  // Check if the selected answer is correct
  const handleCheckAnswer = () => {
    if (!selectedAnswer || isAnswered) return;
    
    const isCorrect = isAnswerCorrect(currentQuestion, selectedAnswer);
    
    setQuizState(prev => {
      const newCorrectAnswers = [...prev.correctAnswers];
      const newIncorrectAnswers = [...prev.incorrectAnswers];
      
      if (isCorrect) {
        newCorrectAnswers.push(prev.currentQuestionIndex);
      } else {
        newIncorrectAnswers.push(prev.currentQuestionIndex);
      }
      
      return {
        ...prev,
        checkedAnswers: {
          ...prev.checkedAnswers,
          [prev.currentQuestionIndex]: isCorrect
        },
        correctAnswers: newCorrectAnswers,
        incorrectAnswers: newIncorrectAnswers
      };
    });
    
    setShowAnswer(true);
  };

  // Go to next question
  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
      // Last question, finish quiz
      const newState = {
        ...quizState,
        endTime: Date.now(),
        isFinished: true
      };
      setQuizState(newState);
      onQuizComplete(newState);
      return;
    }
    
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
    setShowAnswer(false);
  };

  // Go to previous question
  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
      setShowAnswer(false);
    }
  };

  // Toggle bookmark for current question
  const handleToggleBookmark = () => {
    setQuizState(prev => {
      const newBookmarks = [...prev.bookmarkedQuestions];
      const index = newBookmarks.indexOf(prev.currentQuestionIndex);
      
      if (index === -1) {
        newBookmarks.push(prev.currentQuestionIndex);
      } else {
        newBookmarks.splice(index, 1);
      }
      
      return {
        ...prev,
        bookmarkedQuestions: newBookmarks
      };
    });
  };

  // Save quiz progress
  const handleSaveProgress = () => {
    onSaveProgress(quizState, timeRemaining);
  };

  // Get CSS class for an answer option
  const getAnswerClass = (answer: string) => {
    if (!isAnswered) {
      return selectedAnswer === answer 
        ? 'bg-blue-100 border-blue-500' 
        : 'hover:bg-gray-50';
    }
    
    const isCorrect = isAnswerCorrect(currentQuestion, answer);
    const isSelected = selectedAnswer === answer;
    
    if (isCorrect) {
      return 'bg-green-100 border-green-500';
    }
    
    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-500';
    }
    
    return 'opacity-70';
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Quiz header with timer and progress */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-700">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </span>
            <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
            <span className="hidden sm:block text-sm text-gray-600">
              {settings.numberOfQuestions} total questions
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              Time: {formatTime(timeRemaining)}
            </div>
            <button
              onClick={handleSaveProgress}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Save Progress
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(quizState.currentQuestionIndex + 1) * 100 / quizState.questions.length}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            #{currentQuestion.question_number}
          </span>
          <button
            onClick={handleToggleBookmark}
            className={`text-gray-400 hover:text-yellow-500 ${isBookmarked ? 'text-yellow-500' : ''}`}
            aria-label="Bookmark question"
          >
            {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>
        
        <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
        
        <div className="space-y-3">
          {currentQuestion.answers.map((answer, index) => (
            <div
              key={index}
              className={`border p-3 rounded-md cursor-pointer transition duration-150 ${getAnswerClass(answer)}`}
              onClick={() => handleAnswerSelect(answer)}
            >
              {answer}
            </div>
          ))}
        </div>
        
        {showAnswer && (
          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <div className="font-medium text-green-800">
              Correct Answer: {findCorrectAnswerOption(currentQuestion)}
            </div>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={handlePreviousQuestion}
          disabled={quizState.currentQuestionIndex === 0}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </button>
        
        <button
          onClick={handleCheckAnswer}
          disabled={!selectedAnswer || isAnswered}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 flex items-center"
        >
          <CheckCircle className="h-5 w-5 mr-1" />
          Check Answer
        </button>
        
        <button
          onClick={handleNextQuestion}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
        >
          {quizState.currentQuestionIndex === quizState.questions.length - 1 ? 'Finish' : 'Next'}
          {quizState.currentQuestionIndex < quizState.questions.length - 1 && (
            <ChevronRight className="h-5 w-5 ml-1" />
          )}
        </button>
      </div>
      
      {/* Score section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-blue-700">
              {quizState.correctAnswers.length + quizState.incorrectAnswers.length}
            </div>
            <div className="text-sm text-gray-500">Answered</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-green-700">
              {quizState.correctAnswers.length}
            </div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-red-700">
              {quizState.incorrectAnswers.length}
            </div>
            <div className="text-sm text-gray-500">Incorrect</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-yellow-700">
              {quizState.bookmarkedQuestions.length}
            </div>
            <div className="text-sm text-gray-500">Bookmarked</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;