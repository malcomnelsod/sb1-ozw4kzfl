// Utility functions for shuffling questions and answers

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Extracts the letter prefix (a., b., etc.) from an answer string
 */
export function getAnswerPrefix(answer: string): string {
  const match = answer.match(/^([a-z]\.|[a-z]\))/i);
  return match ? match[0] : '';
}

/**
 * Extracts the answer text without the prefix
 */
export function getAnswerText(answer: string): string {
  return answer.replace(/^([a-z]\.|[a-z]\))/, '').trim();
}