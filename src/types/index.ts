export interface Question {
  question_number: number;
  question: string;
  answers: string[];
  correct_answer_text: string;
  is_duplicate: boolean;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: { [key: number]: string };
  checkedAnswers: { [key: number]: boolean };
  correctAnswers: number[];
  incorrectAnswers: number[];
  startTime: number;
  endTime: number | null;
  isFinished: boolean;
  bookmarkedQuestions: number[];
}

export interface QuizSettings {
  startQuestionNumber: number;
  numberOfQuestions: number;
  availableQuestions: number;
}

export interface QuizHistory {
  id: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeTaken: number;
}

export interface SavedQuiz {
  state: QuizState;
  settings: QuizSettings;
  timeRemaining: number;
}

export interface Statistics {
  totalQuizzes: number;
  averageScore: number;
  history: QuizHistory[];
}