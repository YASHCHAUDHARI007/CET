"use server";

import { generateMHTCETQuestion, GenerateMHTCETQuestionInput } from "@/ai/flows/generate-mht-cet-question";
import { z } from "zod";

const formSchema = z.object({
  subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology", "PCM (Full Syllabus)", "PCB (Full Syllabus)"]),
  chapters: z.string(),
  difficultyMix: z.enum(["Easy", "Medium", "Hard"]),
  numQuestions: z.coerce.number().int().positive("Number of questions must be positive.").min(1, "At least one question is required.").max(200, "You can generate a maximum of 200 questions at a time."),
  timeLimit: z.coerce.number().int().positive("Time limit must be positive."),
});

type FormSchema = z.infer<typeof formSchema>;

export async function generateTest(data: FormSchema) {
  if (data.subject === "PCM (Full Syllabus)") {
    data.chapters = ""; // No chapters needed for full syllabus
    data.numQuestions = 150;
    data.timeLimit = 180;
  } else if (data.subject === "PCB (Full Syllabus)") {
    data.chapters = "";
    data.numQuestions = 200;
    data.timeLimit = 180;
  }
  else {
    if (!data.chapters || data.chapters.trim().length < 3) {
      return { success: false, error: "Please enter at least one chapter for the selected subject." };
    }
  }

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
      return { success: true, questions: result.questions, timeLimit: validatedData.data.timeLimit };
    } else {
      return { success: false, error: "Failed to generate questions. The AI model might be unavailable." };
    }
  } catch (e) {
    console.error(e);
    return { success: false, error: "An unexpected error occurred while generating questions." };
  }
}
