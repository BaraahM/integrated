import { useChat } from '@ai-sdk/react';
import { useCallback } from 'react';

interface UseAIEditorOptions {
  apiEndpoint?: string;
  enabled?: boolean;
}

export function useAIEditor({
  apiEndpoint = '/api/ai/chat',
  enabled = true,
}: UseAIEditorOptions = {}) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: apiEndpoint,
    });

  const generateContent = useCallback(
    async (prompt: string) => {
      if (!enabled) return null;

      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        return data.content;
      } catch (error) {
        console.error('AI generation failed:', error);
        return null;
      }
    },
    [enabled],
  );

  const improveText = useCallback(
    async (text: string) => {
      return generateContent(`Improve this text: ${text}`);
    },
    [generateContent],
  );

  const summarizeText = useCallback(
    async (text: string) => {
      return generateContent(`Summarize this text: ${text}`);
    },
    [generateContent],
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    generateContent,
    improveText,
    summarizeText,
  };
}
