export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  subject?: string;
};
