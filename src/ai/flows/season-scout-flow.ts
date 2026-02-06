'use server';
/**
 * @fileOverview A tournament scout AI agent that analyzes season statistics.
 *
 * - analyzeSeason - A function that generates a tournament status report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeSeasonInputSchema = z.object({
  teams: z.array(z.any()),
  players: z.array(z.any()),
  seasonName: z.string(),
});
export type AnalyzeSeasonInput = z.infer<typeof AnalyzeSeasonInputSchema>;

const AnalyzeSeasonOutputSchema = z.object({
  summary: z.string().describe('A concise, professional scout report of the tournament status.'),
  topTeam: z.string().describe('The name of the team currently dominating the league.'),
  topPlayer: z.string().describe('The name of the player with standout performance.'),
  alert: z.string().describe('Any urgent observations or tactical shifts noted in the data.'),
});
export type AnalyzeSeasonOutput = z.infer<typeof AnalyzeSeasonOutputSchema>;

export async function analyzeSeason(input: AnalyzeSeasonInput): Promise<AnalyzeSeasonOutput> {
  return analyzeSeasonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSeasonPrompt',
  input: { schema: AnalyzeSeasonInputSchema },
  output: { schema: AnalyzeSeasonOutputSchema },
  prompt: `You are a high-level football analyst and tournament scout for the Dongre Football Premier League (DFPL).

You will analyze the following data for {{seasonName}} and provide a professional, tech-forward status report.

Teams Data: {{#each teams}}
- {{name}}: Played {{stats.matchesPlayed}}, Won {{stats.matchesWon}}, Goals {{stats.totalGoals}}
{{/each}}

Players Data: {{#each players}}
- {{name}} ({{teamId}}): Goals {{goals}}, Assists {{assists}}
{{/each}}

Focus on momentum, clinical finishing, and defensive stability. Be concise and use a tone that matches a premium sports management app.`,
});

const analyzeSeasonFlow = ai.defineFlow(
  {
    name: 'analyzeSeasonFlow',
    inputSchema: AnalyzeSeasonInputSchema,
    outputSchema: AnalyzeSeasonOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
