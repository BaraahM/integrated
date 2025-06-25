import { useState, useCallback } from 'react';

interface EditorState {
  content: string;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}

interface UseEditorOptions {
  initialContent?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function useEditor({
  initialContent = '',
  autoSave = false,
  autoSaveDelay = 2000,
}: UseEditorOptions = {}) {
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    isLoading: false,
    isSaving: false,
  });

  const updateContent = useCallback((content: string) => {
    setState((prev) => ({ ...prev, content }));
  }, []);

  const saveContent = useCallback(async () => {
    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      // Integrate with your Supabase save logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock save

      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, [state.content]);

  return {
    ...state,
    updateContent,
    saveContent,
  };
}
