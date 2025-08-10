
"use server";

import { generateMHTCETQuestion, GenerateMHTCETQuestionInput } from "@/ai/flows/generate-mht-cet-question";
import { generateDiagram } from "@/ai/flows/generate-diagram-flow";
import { z } from "zod";
import type { Question } from "@/lib/types";

const formSchema = z.object({
  subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology", "PCM (Full Syllabus)", "PCB (Full Syllabus)"]),
  chapters: z.array(z.string()),
  difficultyMix: z.enum(["Easy", "Medium", "Hard"]),
  numQuestions: z.coerce.number().int().positive("Number of questions must be positive.").min(1, "At least one question is required.").max(200, "You can generate a maximum of 200 questions at a time."),
  timeLimit: z.coerce.number().int().positive("Time limit must be positive."),
});

type FormSchema = z.infer<typeof formSchema>;

async function generateQuestionsForSubject(subject: "Physics" | "Chemistry" | "Mathematics" | "Biology", numQuestions: number, difficultyMix: string, chapters: string = '') {
    const aiInput: GenerateMHTCETQuestionInput = {
        subject,
        numQuestions,
        difficultyMix,
        chapters,
    };
    const result = await generateMHTCETQuestion(aiInput);
    if (!result || !result.questions || result.questions.length !== numQuestions) {
        throw new Error(`Failed to generate exactly ${numQuestions} questions for ${subject}.`);
    }
    return result.questions;
}


async function processQuestionDiagrams(questions: Question[]): Promise<Question[]> {
    const diagramPromises = questions.map(async (question) => {
        if (question.diagramDescription) {
            try {
                const diagramResult = await generateDiagram({ description: question.diagramDescription });
                if (diagramResult.diagramDataUri) {
                    return { ...question, diagram: diagramResult.diagramDataUri };
                }
            } catch (error) {
                console.error("Failed to generate diagram:", error);
                // Fail gracefully, return question without diagram
                return question;
            }
        }
        return question;
    });

    return Promise.all(diagramPromises);
}


export async function generateTest(data: FormSchema) {
  const validatedData = formSchema.safeParse(data);

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data." };
  }
  
  const { subject, chapters, difficultyMix, numQuestions, timeLimit } = validatedData.data;

  try {
     let allQuestions: Question[] = [];

     if (subject === "PCM (Full Syllabus)") {
        const [physicsQuestions, chemistryQuestions, mathQuestions] = await Promise.all([
            generateQuestionsForSubject("Physics", 50, difficultyMix),
            generateQuestionsForSubject("Chemistry", 50, difficultyMix),
            generateQuestionsForSubject("Mathematics", 50, difficultyMix),
        ]);
        allQuestions = [...physicsQuestions, ...chemistryQuestions, ...mathQuestions];

    } else if (subject === "PCB (Full Syllabus)") {
        const [physicsQuestions, chemistryQuestions, biologyQuestions] = await Promise.all([
            generateQuestionsForSubject("Physics", 50, difficultyMix),
            generateQuestionsForSubject("Chemistry", 50, difficultyMix),
            generateQuestionsForSubject("Biology", 100, difficultyMix),
        ]);
        allQuestions = [...physicsQuestions, ...chemistryQuestions, ...biologyQuestions];
    }
    else {
        if (!chapters || chapters.length === 0) {
            return { success: false, error: "Please select at least one chapter for the selected subject." };
        }
        const subjectAsEnum = subject as "Physics" | "Chemistry" | "Mathematics" | "Biology";
        const generatedQuestions = await generateQuestionsForSubject(subjectAsEnum, numQuestions, difficultyMix, chapters.join(', '));
        allQuestions = generatedQuestions;
    }

    const questionsWithDiagrams = await processQuestionDiagrams(allQuestions);

    return { success: true, questions: questionsWithDiagrams, timeLimit: subject.includes('Syllabus') ? 180 : timeLimit };
    
  } catch (e) {
    console.error(e);
    return { success: false, error: "An unexpected error occurred while generating questions." };
  }
}
