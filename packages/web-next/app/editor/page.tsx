'use client';

import { AdvancedRichEditor } from '../../components/editor/AdvancedRichEditor';
import { Container, Title, Space } from '@mantine/core';
import { useState } from 'react';

export default function EditorPage() {
  const [savedContent, setSavedContent] = useState('');

  const handleSave = async (content: string) => {
    try {
      // Integrate with your Supabase storage here
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Save failed');
      setSavedContent(content);
    } catch (error) {
      console.error('Failed to save:', error);
      throw error;
    }
  };

  return (
    <Container size="xl">
      <Title order={1} mb="xl">
        Rich Text Editor
      </Title>
      <AdvancedRichEditor
        initialContent={savedContent}
        onSave={handleSave}
        withAI={true}
        withUpload={true}
      />
      <Space h="xl" />
    </Container>
  );
}
