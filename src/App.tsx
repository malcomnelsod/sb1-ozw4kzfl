import React, { useState, useEffect } from 'react';
import QuizSetup from './components/QuizSetup';
import QuizComponent from './components/QuizComponent';
import ResultsReview from './components/ResultsReview';
import StatisticsScreen from './components/StatisticsScreen';
import BookmarksScreen from './components/BookmarksScreen';
import { QuizState, QuizSettings, Question } from './types';
import { prepareQuestions, getIncorrectQuestions } from './utils/questionUtils';
import { loadQuizProgress, saveQuizProgress, discardQuizProgress, getStatistics, saveQuizStatistics } from './utils/storageService';
import { loadDefaultQuestions } from './utils/fileUtils';
import { BookOpen, History, BookmarkIcon } from 'lucide-react';

function App() {
  // App States
  const [appState, setAppState] = useState<'setup' | 'quiz' | 'results' | 'statistics' | 'bookmarks'>('setup');
  
  // Quiz Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // Load default questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      const defaultQuestions = await loadDefaultQuestions();
      setQuestions(defaultQuestions);
    };
    loadQuestions();
  }, []);

  // Start a new quiz
  const handleStartQuiz = (allQuestions: Question[], settings: QuizSettings) => {
    const preparedQuestions = prepareQuestions(
      allQuestions,
      settings.startQuestionNumber,
      settings.numberOfQuestions
    );
    
    setQuestions(preparedQuestions);
    setQuizSettings(settings);
    setAppState('quiz');
  };

  // Continue a saved quiz
  const handleContinueQuiz = () => {
    const savedQuiz = loadQuizProgress();
    if (savedQuiz) {
      setQuizState(savedQuiz.state);
      setQuizSettings(savedQuiz.settings);
      setTimeRemaining(savedQuiz.timeRemaining);
      setAppState('quiz');
    }
  };

  // Save quiz progress
  const handleSaveProgress = (state: QuizState, timeRemaining: number) => {
    if (quizSettings) {
      saveQuizProgress(state, quizSettings, timeRemaining);
      alert('Quiz progress saved! You can continue from where you left off later.');
    }
  };

  // Complete the quiz
  const handleQuizComplete = (state: QuizState) => {
    setQuizState(state);
    setAppState('results');
    discardQuizProgress(); // Remove saved progress after completion
    
    // Save statistics
    saveQuizStatistics(
      state.questions.length,
      state.correctAnswers.length,
      state.endTime && state.startTime 
        ? Math.floor((state.endTime - state.startTime) / 1000)
        : 0
    );
  };

  // Restart the quiz
  const handleRestartQuiz = () => {
    setAppState('setup');
    setQuizState(null);
    setTimeRemaining(null);
  };

  // Retest incorrect answers
  const handleRetestIncorrect = () => {
    if (!quizState) return;
    
    const incorrectQuestions = getIncorrectQuestions(
      quizState.questions,
      quizState.incorrectAnswers
    );
    
    if (incorrectQuestions.length === 0) return;
    
    const newSettings: QuizSettings = {
      startQuestionNumber: incorrectQuestions[0].question_number,
      numberOfQuestions: incorrectQuestions.length,
      availableQuestions: incorrectQuestions.length
    };
    
    setQuestions(incorrectQuestions);
    setQuizSettings(newSettings);
    setQuizState(null);
    setTimeRemaining(null);
    setAppState('quiz');
  };

  // View statistics
  const handleViewStatistics = () => {
    setAppState('statistics');
  };

  // View bookmarks
  const handleViewBookmarks = () => {
    setAppState('bookmarks');
  };

  // Go back to setup
  const handleBackToSetup = () => {
    setAppState('setup');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-800">Medical Quiz App</h1>
          
          {appState !== 'setup' && (
            <div className="flex space-x-2">
              <button
                onClick={handleViewStatistics}
                className="px-3 py-1 text-sm bg-white text-blue-600 rounded border border-blue-200 hover:bg-blue-50 transition duration-300 flex items-center"
              >
                <History className="h-4 w-4 mr-1" />
                Statistics
              </button>
              <button
                onClick={handleViewBookmarks}
                className="px-3 py-1 text-sm bg-white text-blue-600 rounded border border-blue-200 hover:bg-blue-50 transition duration-300 flex items-center"
              >
                <BookmarkIcon className="h-4 w-4 mr-1" />
                Bookmarks
              </button>
              {appState !== 'setup' && (
                <button
                  onClick={handleBackToSetup}
                  className="px-3 py-1 text-sm bg-white text-blue-600 rounded border border-blue-200 hover:bg-blue-50 transition duration-300 flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  New Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-12">
        {appState === 'setup' && (
          <QuizSetup
            onStartQuiz={handleStartQuiz}
            onContinueQuiz={handleContinueQuiz}
          />
        )}
        
        {appState === 'quiz' && quizSettings && (
          <QuizComponent
            questions={questions}
            settings={quizSettings}
            initialState={quizState}
            initialTimeRemaining={timeRemaining}
            onQuizComplete={handleQuizComplete}
            onSaveProgress={handleSaveProgress}
          />
        )}
        
        {appState === 'results' && quizState && (
          <ResultsReview
            quizState={quizState}
            onRestartQuiz={handleRestartQuiz}
            onRetestIncorrect={handleRetestIncorrect}
          />
        )}
        
        {appState === 'statistics' && (
          <StatisticsScreen
            statistics={getStatistics()}
            onBack={handleBackToSetup}
          />
        )}
        
        {appState === 'bookmarks' && (
          <BookmarksScreen
            questions={questions}
            onBack={handleBackToSetup}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-gray-500 text-sm">
        <div className="max-w-4xl mx-auto px-4">
          © {new Date().getFullYear()} Medical Quiz App
        </div>
      </footer>
    </div>
  );
}

export default App;