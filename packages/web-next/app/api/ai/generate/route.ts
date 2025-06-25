import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      prompt: prompt,
      maxTokens: 1000,
    });

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 },
    );
  }
}
