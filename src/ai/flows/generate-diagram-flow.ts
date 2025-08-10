'use server';
/**
 * @fileOverview A Genkit flow for generating a diagram image from a text description.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DiagramInputSchema = z.object({
  description: z.string().describe('A detailed description of the diagram to be generated.'),
});
export type DiagramInput = z.infer<typeof DiagramInputSchema>;

const DiagramOutputSchema = z.object({
  diagramDataUri: z.string().describe("The generated diagram image as a data URI."),
});
export type DiagramOutput = z.infer<typeof DiagramOutputSchema>;

export async function generateDiagram(input: DiagramInput): Promise<DiagramOutput> {
  return generateDiagramFlow(input);
}

const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: DiagramInputSchema,
    outputSchema: DiagramOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a simple, clean, 2D black and white scientific line-art diagram based on the following description. The diagram should be clear and easy to understand for a test question. Do not include any text or labels unless explicitly asked for in the description. Description: ${input.description}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a data URI.');
    }

    return { diagramDataUri: media.url };
  }
);
