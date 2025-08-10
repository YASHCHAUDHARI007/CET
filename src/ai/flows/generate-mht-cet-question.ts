'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating MHT CET-style multiple-choice questions.
 *
 * The flow takes subject, chapters, difficulty mix, and number of questions as input.
 * It uses the Gemini API to generate questions dynamically based on the provided parameters.
 * The output is a JSON object containing the generated questions with their options, correct answer, and explanation.
 *
 * @exports {
 *   generateMHTCETQuestion: (input: GenerateMHTCETQuestionInput) => Promise<GenerateMHTCETQuestionOutput>;
 *   GenerateMHTCETQuestionInput: type
 *   GenerateMHTCETQuestionOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMHTCETQuestionInputSchema = z.object({
  subject: z.enum(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'PCM (Full Syllabus)', 'PCB (Full Syllabus)']).describe('The subject for which to generate questions.'),
  chapters: z.string().describe('A comma-separated list of chapters from which to generate questions. Can be empty for full syllabus tests.'),
  difficultyMix: z.string().describe('The difficulty mix (Easy, Medium, Hard %) for the questions.'),
  numQuestions: z.number().int().positive().describe('The number of questions to generate for the subject.'),
});

export type GenerateMHTCETQuestionInput = z.infer<typeof GenerateMHTCETQuestionInputSchema>;

const GeneratedQuestionSchema = z.object({
  subject: z.enum(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'PCM (Full Syllabus)', 'PCB (Full Syllabus)']).describe('The subject of the question.'),
  chapter: z.string().describe('The chapter from which the question is taken.'),
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).length(4).describe('An array of four possible answers.'),
  answer: z.string().describe('The correct answer (A, B, C, or D).'),
  explanation: z.string().describe('A detailed explanation of the correct answer.'),
});

const GenerateMHTCETQuestionOutputSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).describe('An array of generated MHT CET-style questions.'),
});

export type GenerateMHTCETQuestionOutput = z.infer<typeof GenerateMHTCETQuestionOutputSchema>;

export async function generateMHTCETQuestion(input: GenerateMHTCETQuestionInput): Promise<GenerateMHTCETQuestionOutput> {
  return generateMHTCETQuestionFlow(input);
}

const generateMHTCETQuestionPrompt = ai.definePrompt({
  name: 'generateMHTCETQuestionPrompt',
  input: {schema: GenerateMHTCETQuestionInputSchema},
  output: {schema: GenerateMHTCETQuestionOutputSchema},
  prompt: `You are an expert MHT CET question setter.
  
  {{#if chapters}}
  Generate {{numQuestions}} multiple-choice questions for {{subject}} from the chapters {{chapters}}, with a difficulty mix of: {{difficultyMix}}.
  {{else}}
  Generate {{numQuestions}} multiple-choice questions for a full syllabus MHT CET test for {{subject}}, with a difficulty mix of: {{difficultyMix}}. 
  - For PCM (Full Syllabus), generate 50 questions each from Physics, Chemistry, and Mathematics.
  - For PCB (Full Syllabus), generate 100 questions from Biology, 50 from Physics, and 50 from Chemistry.
  {{/if}}
  
  Follow the MHT CET syllabus and style. Each question must have 4 options (A-D), one correct answer, and a detailed explanation.
  Output only valid JSON with fields: subject, chapter, question, options[], answer, explanation.`,
});

const generateMHTCETQuestionFlow = ai.defineFlow(
  {
    name: 'generateMHTCETQuestionFlow',
    inputSchema: GenerateMHTCETQuestionInputSchema,
    outputSchema: GenerateMHTCETQuestionOutputSchema,
  },
  async (input) => {
    const BATCH_SIZE = 10;
    const numBatches = Math.ceil(input.numQuestions / BATCH_SIZE);
    const promises = [];

    for (let i = 0; i < numBatches; i++) {
      const numQuestionsInBatch =
        i === numBatches - 1
          ? input.numQuestions - i * BATCH_SIZE
          : BATCH_SIZE;

      const batchInput = { ...input, numQuestions: numQuestionsInBatch };
      promises.push(generateMHTCETQuestionPrompt(batchInput));
    }

    const results = await Promise.all(promises);
    const allQuestions = results.flatMap(result => result.output?.questions || []);

    return { questions: allQuestions.slice(0, input.numQuestions) };
  }
);
