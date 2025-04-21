import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizSettings } from '../types';
import { findMinQuestionNumber, findMaxQuestionNumber } from '../utils/questionUtils';
import { readJsonFile, loadDefaultQuestions } from '../utils/fileUtils';
import { loadQuizProgress, discardQuizProgress } from '../utils/storageService';
import { FileUp as FileUpload, FileQuestion } from 'lucide-react';

interface QuizSetupProps {
  onStartQuiz: (questions: Question[], settings: QuizSettings) => void;
  onContinueQuiz: () => void;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ 
  onStartQuiz, 
  onContinueQuiz 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [startQuestionNumber, setStartQuestionNumber] = useState<number>(1);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [maxQuestions, setMaxQuestions] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [hasSavedQuiz, setHasSavedQuiz] = useState<boolean>(false);
  const [isCustomQuestions, setIsCustomQuestions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeQuestions = async () => {
      setIsLoading(true);
      try {
        const defaultQuestions = await loadDefaultQuestions();
        setQuestions(defaultQuestions);
        setMaxQuestions(defaultQuestions.length);
      } catch (error) {
        setError('Failed to load default questions');
      }
      setIsLoading(false);
    };

    initializeQuestions();
    
    // Check if there's a saved quiz
    const savedQuiz = loadQuizProgress();
    setHasSavedQuiz(!!savedQuiz);
  }, []);

  const handleStartNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setStartQuestionNumber(value);
    setError('');
  };

  const handleNumberOfQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumberOfQuestions(value);
    setError('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedQuestions = await readJsonFile(file);
      setQuestions(uploadedQuestions);
      setMaxQuestions(uploadedQuestions.length);
      setIsCustomQuestions(true);
      setError('');
    } catch (err) {
      setError('Failed to parse JSON file. Please check the format.');
    }
  };

  const handleStartQuiz = () => {
    // Validate inputs
    if (numberOfQuestions <= 0) {
      setError('Number of questions must be greater than 0');
      return;
    }

    if (numberOfQuestions > questions.length) {
      setError(`Cannot select more than ${questions.length} questions`);
      return;
    }

    if (startQuestionNumber < 1) {
      setError('Starting question number must be at least 1');
      return;
    }

    onStartQuiz(questions, {
      startQuestionNumber,
      numberOfQuestions,
      availableQuestions: questions.length
    });
  };

  const handleResetCustomQuestions = async () => {
    setIsLoading(true);
    try {
      const defaultQuestions = await loadDefaultQuestions();
      setQuestions(defaultQuestions);
      setMaxQuestions(defaultQuestions.length);
      setIsCustomQuestions(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError('Failed to load default questions');
    }
    setIsLoading(false);
  };

  const handleDiscardSavedQuiz = () => {
    discardQuizProgress();
    setHasSavedQuiz(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center text-gray-600">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Medical Quiz Setup</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question-file">
          Upload Question File (Optional)
        </label>
        <div className="flex items-center">
          <label className="flex items-center justify-center px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-600 cursor-pointer hover:bg-blue-50 transition duration-300">
            <FileUpload className="w-5 h-5 mr-2" />
            <span>{isCustomQuestions ? 'Change Questions' : 'Upload JSON'}</span>
            <input
              id="question-file"
              type="file"
              className="hidden"
              accept=".json"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
          </label>
          {isCustomQuestions && (
            <button
              type="button"
              className="ml-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition duration-300"
              onClick={handleResetCustomQuestions}
            >
              Reset to Default
            </button>
          )}
        </div>
        {isCustomQuestions && (
          <p className="mt-2 text-sm text-green-600">
            Using custom questions ({questions.length} questions loaded)
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start-question">
          Starting Question Number
        </label>
        <input
          id="start-question"
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={startQuestionNumber}
          onChange={handleStartNumberChange}
          min={1}
        />
        <p className="text-xs text-gray-600 mt-1">
          Must be at least 1
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="num-questions">
          Number of Questions
        </label>
        <input
          id="num-questions"
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={numberOfQuestions}
          onChange={handleNumberOfQuestionsChange}
          min={1}
          max={maxQuestions}
        />
        <p className="text-xs text-gray-600 mt-1">
          Total available questions: {maxQuestions}
        </p>
      </div>
      
      <div className="flex flex-col space-y-2">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center"
          onClick={handleStartQuiz}
        >
          <FileQuestion className="w-5 h-5 mr-2" />
          Start New Quiz
        </button>
        
        {hasSavedQuiz && (
          <div className="flex space-x-2">
            <button
              type="button"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              onClick={onContinueQuiz}
            >
              Continue Saved Quiz
            </button>
            <button
              type="button"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              onClick={handleDiscardSavedQuiz}
            >
              Discard Saved Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSetup;