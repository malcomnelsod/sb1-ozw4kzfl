import { Question } from '../types';
import { shuffleArray } from './shuffleUtils';

/**
 * Prepare questions for quiz by selecting the required range
 */
export const prepareQuestions = (
  allQuestions: Question[],
  startQuestionNumber: number,
  numberOfQuestions: number
): Question[] => {
  // Sort questions by question number to ensure proper ordering
  const sortedQuestions = [...allQuestions];
  
  // Find questions starting from the requested number
  let selectedQuestions = sortedQuestions;
  
  if (startQuestionNumber > 1) {
    const startIndex = sortedQuestions.findIndex(q => q.question_number >= startQuestionNumber);
    if (startIndex !== -1) {
      selectedQuestions = sortedQuestions.slice(startIndex);
    }
  }
  
  // If we don't have enough questions from the starting point,
  // wrap around to the beginning of the array
  if (selectedQuestions.length < numberOfQuestions) {
    const remainingCount = numberOfQuestions - selectedQuestions.length;
    const additionalQuestions = sortedQuestions.slice(0, remainingCount);
    selectedQuestions = [...selectedQuestions, ...additionalQuestions];
  }
  
  // Take only the required number of questions
  selectedQuestions = selectedQuestions.slice(0, numberOfQuestions);
  
  // Shuffle both questions and their answers
  return shuffleArray(selectedQuestions).map(question => ({
    ...question,
    answers: shuffleArray([...question.answers])
  }));
};

/**
 * Find the minimum question number in the collection
 */
export const findMinQuestionNumber = (questions: Question[]): number => {
  if (!questions || questions.length === 0) return 0;
  return 1; // Always allow starting from 1
};

/**
 * Find the maximum question number in the collection
 */
export const findMaxQuestionNumber = (questions: Question[]): number => {
  if (!questions || questions.length === 0) return 0;
  return Math.max(...questions.map(q => q.question_number));
};

/**
 * Extract incorrect questions for review or export
 */
export const getIncorrectQuestions = (
  questions: Question[],
  incorrectIndices: number[]
): Question[] => {
  return incorrectIndices.map(index => questions[index]);
};

/**
 * Check if answer is correct for a question
 */
export const isAnswerCorrect = (question: Question, selectedAnswer: string): boolean => {
  // Extract the answer text without the prefix (a., b., etc.)
  const selectedText = selectedAnswer.replace(/^[a-z]\.|[a-z]\)/i, '').trim();
  return selectedText === question.correct_answer_text;
};

/**
 * Find the correct answer option for a question based on correct_answer_text
 */
export const findCorrectAnswerOption = (question: Question): string => {
  return question.answers.find(answer => 
    answer.replace(/^[a-z]\.|[a-z]\)/i, '').trim() === question.correct_answer_text
  ) || '';
};
