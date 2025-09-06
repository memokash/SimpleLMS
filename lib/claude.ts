// Save as: lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(prompt: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    
    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    logger.error('Error calling Claude:', error);
    throw error;
  }
}
