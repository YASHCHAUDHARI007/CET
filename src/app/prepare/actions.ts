
"use server";

import { generateMHTCETQuestion, GenerateMHTCETQuestionInput } from "@/ai/flows/generate-mht-cet-question";
import { z } from "zod";

const formSchema = z.object({
  subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology", "PCM (Full Syllabus)", "PCB (Full Syllabus)"]),
  chapters: z.array(z.string()),
  difficultyMix: z.enum(["Easy", "Medium", "Hard"]),
  numQuestions: z.coerce.number().int().positive("Number of questions must be positive.").min(1, "At least one question is required.").max(200, "You can generate a maximum of 200 questions at a time."),
  timeLimit: z.coerce.number().int().positive("Time limit must be positive."),
});

type FormSchema = z.infer<typeof formSchema>;

async function generateQuestionsForSubject(baseInput: Omit<GenerateMHTCETQuestionInput, 'chapters'>, subject: GenerateMHTCETQuestionInput['subject'], numQuestions: number) {
    const aiInput: GenerateMHTCETQuestionInput = {
        ...baseInput,
        subject,
        numQuestions,
        chapters: '', // Always full syllabus for this helper
    };
    const result = await generateMHTCETQuestion(aiInput);
    if (!result || !result.questions) {
        throw new Error(`Failed to generate questions for ${subject}.`);
    }
    return result.questions;
}

export async function generateTest(data: FormSchema) {
  const validatedData = formSchema.safeParse(data);

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data." };
  }
  
  const { subject, chapters, difficultyMix, numQuestions, timeLimit } = validatedData.data;

  try {
     if (subject === "PCM (Full Syllabus)") {
        const baseInput = { difficultyMix };
        const [physicsQuestions, chemistryQuestions, mathQuestions] = await Promise.all([
            generateQuestionsForSubject(baseInput, "Physics", 50),
            generateQuestionsForSubject(baseInput, "Chemistry", 50),
            generateQuestionsForSubject(baseInput, "Mathematics", 50),
        ]);
        const allQuestions = [...physicsQuestions, ...chemistryQuestions, ...mathQuestions];
        return { success: true, questions: allQuestions, timeLimit: 180 };

    } else if (subject === "PCB (Full Syllabus)") {
        const baseInput = { difficultyMix };
        const [physicsQuestions, chemistryQuestions, biologyQuestions] = await Promise.all([
            generateQuestionsForSubject(baseInput, "Physics", 50),
            generateQuestionsForSubject(baseInput, "Chemistry", 50),
            generateQuestionsForSubject(baseInput, "Biology", 100),
        ]);
        const allQuestions = [...physicsQuestions, ...chemistryQuestions, ...biologyQuestions];
        return { success: true, questions: allQuestions, timeLimit: 180 };
    }
    else {
        if (!chapters || chapters.length === 0) {
            return { success: false, error: "Please select at least one chapter for the selected subject." };
        }
        const aiInput: GenerateMHTCETQuestionInput = {
            subject,
            chapters: chapters.join(', '),
            difficultyMix,
            numQuestions,
        };
        const result = await generateMHTCETQuestion(aiInput);
        if (result && result.questions) {
            return { success: true, questions: result.questions, timeLimit };
        } else {
            return { success: false, error: "Failed to generate questions. The AI model might be unavailable." };
        }
    }
  } catch (e) {
    console.error(e);
    return { success: false, error: "An unexpected error occurred while generating questions." };
  }
}
