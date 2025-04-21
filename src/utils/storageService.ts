import { QuizState, QuizSettings, Statistics, QuizHistory, SavedQuiz } from '../types';

// Storage keys
const SAVED_QUIZ_KEY = 'med_quiz_saved';
const STATS_KEY = 'med_quiz_stats';
const BOOKMARKS_KEY = 'med_quiz_bookmarks';

/**
 * Save the current quiz state to localStorage
 */
export const saveQuizProgress = (state: QuizState, settings: QuizSettings, timeRemaining: number): void => {
  const savedQuiz: SavedQuiz = {
    state,
    settings,
    timeRemaining
  };
  localStorage.setItem(SAVED_QUIZ_KEY, JSON.stringify(savedQuiz));
};

/**
 * Load saved quiz progress from localStorage
 */
export const loadQuizProgress = (): SavedQuiz | null => {
  const saved = localStorage.getItem(SAVED_QUIZ_KEY);
  return saved ? JSON.parse(saved) : null;
};

/**
 * Remove saved quiz progress
 */
export const discardQuizProgress = (): void => {
  localStorage.removeItem(SAVED_QUIZ_KEY);
};

/**
 * Get statistics from localStorage or initialize if not exists
 */
export const getStatistics = (): Statistics => {
  const stats = localStorage.getItem(STATS_KEY);
  if (stats) {
    return JSON.parse(stats);
  }
  return {
    totalQuizzes: 0,
    averageScore: 0,
    history: []
  };
};

/**
 * Save quiz results to statistics
 */
export const saveQuizStatistics = (
  totalQuestions: number,
  correctAnswers: number,
  timeTaken: number
): void => {
  const stats = getStatistics();
  const score = (correctAnswers / totalQuestions) * 100;
  
  const newQuiz: QuizHistory = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    totalQuestions,
    correctAnswers,
    score,
    timeTaken
  };
  
  stats.history.push(newQuiz);
  stats.totalQuizzes += 1;
  
  // Recalculate average score
  const totalScore = stats.history.reduce((sum, quiz) => sum + quiz.score, 0);
  stats.averageScore = totalScore / stats.history.length;
  
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

/**
 * Get bookmarked questions
 */
export const getBookmarkedQuestions = (): number[] => {
  const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
  return bookmarks ? JSON.parse(bookmarks) : [];
};

/**
 * Save bookmarked questions
 */
export const saveBookmarkedQuestions = (bookmarks: number[]): void => {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
};

/**
 * Toggle bookmark status for a question
 */
export const toggleBookmark = (questionNumber: number): number[] => {
  const bookmarks = getBookmarkedQuestions();
  const index = bookmarks.indexOf(questionNumber);
  
  if (index === -1) {
    bookmarks.push(questionNumber);
  } else {
    bookmarks.splice(index, 1);
  }
  
  saveBookmarkedQuestions(bookmarks);
  return bookmarks;
};

/**
 * Clear all bookmarks
 */
export const clearAllBookmarks = (): void => {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
};