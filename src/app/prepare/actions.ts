"use server";

import { generateMHTCETQuestion, GenerateMHTCETQuestionInput } from "@/ai/flows/generate-mht-cet-question";
import { z } from "zod";

const formSchema = z.object({
  subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology"]),
  chapters: z.string().min(3, "Please enter at least one chapter."),
  difficultyMix: z.string().min(3, "Please specify the difficulty mix."),
  numQuestions: z.coerce.number().int().positive("Number of questions must be positive.").min(1, "At least one question is required.").max(50, "You can generate a maximum of 50 questions at a time."),
  timeLimit: z.coerce.number().int().positive("Time limit must be positive."),
});

type FormSchema = z.infer<typeof formSchema>;

export async function generateTest(data: FormSchema) {
  const validatedData = formSchema.safeParse(data);

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data." };
  }

  try {
    const aiInput: GenerateMHTCETQuestionInput = {
      subject: validatedData.data.subject,
      chapters: validatedData.data.chapters,
      difficultyMix: validatedData.data.difficultyMix,
      numQuestions: validatedData.data.numQuestions,
    };
    const result = await generateMHTCETQuestion(aiInput);
    if (result && result.questions) {
      return { success: true, questions: result.questions };
    } else {
      return { success: false, error: "Failed to generate questions. The AI model might be unavailable." };
    }
  } catch (e) {
    console.error(e);
    return { success: false, error: "An unexpected error occurred while generating questions." };
  }
}
