import { Question } from '../types';

/**
 * Read a JSON file and parse its contents
 */
export const readJsonFile = (file: File): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const questions = JSON.parse(result) as Question[];
        resolve(questions);
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Load default questions from JSON file
 */
export const loadDefaultQuestions = async (): Promise<Question[]> => {
  try {
    const response = await fetch('/questions_nodup.json');
    if (!response.ok) {
      throw new Error('Failed to load default questions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading default questions:', error);
    return [];
  }
};

/**
 * Download data as a JSON file
 */
export const downloadJson = (data: any, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};