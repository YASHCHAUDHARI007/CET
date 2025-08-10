import type { GenerateMHTCETQuestionOutput } from "@/ai/flows/generate-mht-cet-question";

export type Question = GenerateMHTCETQuestionOutput['questions'][0];

export type Answers = { [questionIndex: number]: string };

export type MarkedForReview = number[];
