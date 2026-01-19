'use server';

import { adjustQuizDifficulty } from '@/ai/flows/adaptive-quiz-difficulty';

export async function getAdjustedDifficulty(
  {currentScore,
  answeredCount,
  currentDifficulty}: {
  currentScore: number,
  answeredCount: number,
  currentDifficulty: 'Easy' | 'Medium' | 'Hard',
}): Promise<{ adjustedDifficulty: 'Easy' | 'Medium' | 'Hard' }> {

  const performance = answeredCount > 0 ? (currentScore / answeredCount) * 100 : 0;
  
  const { adjustedDifficulty, reasoning } = await adjustQuizDifficulty({
    studentPerformance: performance,
    currentDifficulty,
  });

  console.log(`AI Reasoning: ${reasoning}`);

  const newDifficulty = adjustedDifficulty as 'Easy' | 'Medium' | 'Hard';

  return {
    adjustedDifficulty: newDifficulty,
  };
}
