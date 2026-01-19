'use server';

/**
 * @fileOverview Adjusts quiz difficulty based on student performance.
 *
 * - adjustQuizDifficulty - A function that dynamically adjusts the quiz difficulty.
 * - AdjustQuizDifficultyInput - The input type for the adjustQuizDifficulty function.
 * - AdjustQuizDifficultyOutput - The return type for the adjustQuizDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustQuizDifficultyInputSchema = z.object({
  studentPerformance: z
    .number()
    .describe(
      'The student performance score, represented as a percentage (0-100).' // Correct the typo here
    ),
  currentDifficulty: z
    .string()
    .describe(
      'The current difficulty level of the quiz (e.g., Easy, Medium, Hard).' // Added example values
    ),
});
export type AdjustQuizDifficultyInput = z.infer<
  typeof AdjustQuizDifficultyInputSchema
>;

const AdjustQuizDifficultyOutputSchema = z.object({
  adjustedDifficulty: z
    .string()
    .describe(
      'The adjusted difficulty level of the quiz based on student performance (e.g., Easy, Medium, Hard).' // Added example values
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation for why the difficulty was adjusted.'
    ),
});
export type AdjustQuizDifficultyOutput = z.infer<
  typeof AdjustQuizDifficultyOutputSchema
>;

export async function adjustQuizDifficulty(
  input: AdjustQuizDifficultyInput
): Promise<AdjustQuizDifficultyOutput> {
  return adjustQuizDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustQuizDifficultyPrompt',
  input: {schema: AdjustQuizDifficultyInputSchema},
  output: {schema: AdjustQuizDifficultyOutputSchema},
  prompt: `You are an AI quiz master that dynamically adjusts the quiz difficulty based on the student's performance. You receive studentPerformance as a percentage (0-100), and currentDifficulty as Easy, Medium, or Hard.

  Based on the student's performance, increase, decrease, or maintain the difficulty level. If the student's performance is above 80%, increase the difficulty. If the student's performance is below 40%, decrease the difficulty. Otherwise, maintain the current difficulty.

  currentDifficulty: {{{currentDifficulty}}}
  studentPerformance: {{{studentPerformance}}}

  Return the adjustedDifficulty (Easy, Medium, or Hard) and a brief reasoning for the adjustment.
  `,
});

const adjustQuizDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustQuizDifficultyFlow',
    inputSchema: AdjustQuizDifficultyInputSchema,
    outputSchema: AdjustQuizDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
