'use client';

import { MantineRichEditor } from './MantineRichEditor';
import { uploadImage } from '../../lib/editor/uploadthing';
import { useAIEditor } from '../../hooks/editor/useAI';
import { useEditor } from '../../hooks/editor/useEditor';
import { Box, Group, Button, Paper, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { useCallback } from 'react';

interface AdvancedRichEditorProps {
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
  withAI?: boolean;
  withUpload?: boolean;
}

export function AdvancedRichEditor({
  initialContent,
  onSave,
  withAI = true,
  withUpload = true,
}: AdvancedRichEditorProps) {
  const { content, updateContent, saveContent, isSaving } = useEditor({
    initialContent,
    autoSave: true,
  });

  const {
    generateContent,
    improveText,
    isLoading: aiLoading,
  } = useAIEditor({
    enabled: withAI,
  });

  const handleImageUpload = useCallback(
    async (files: File[]) => {
      try {
        const file = files[0];
        if (!file) return;

        const imageUrl = await uploadImage(file);
        // Insert image into editor
        const imageHtml = `<img src="${imageUrl}" alt="Uploaded image" />`;
        updateContent(content + imageHtml);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    },
    [content, updateContent],
  );

  const handleSave = useCallback(async () => {
    try {
      if (onSave) {
        await onSave(content);
      } else {
        await saveContent();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [content, onSave, saveContent]);

  return (
    <Box>
      <Paper p="md" mb="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>
            Rich Text Editor
          </Text>
          <Group>
            {withAI && (
              <Button
                variant="light"
                loading={aiLoading}
                onClick={() => improveText(content)}
              >
                Improve with AI
              </Button>
            )}
            <Button variant="filled" loading={isSaving} onClick={handleSave}>
              Save
            </Button>
          </Group>
        </Group>
      </Paper>

      {withUpload && (
        <Dropzone onDrop={handleImageUpload} accept={IMAGE_MIME_TYPE} mb="md">
          <Group
            justify="center"
            gap="xl"
            mih={50}
            style={{ pointerEvents: 'none' }}
          >
            <Dropzone.Accept>
              <IconUpload size={52} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={52} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={52} stroke={1.5} />
            </Dropzone.Idle>
            <Text size="xl" inline>
              Drag images here or click to select files
            </Text>
          </Group>
        </Dropzone>
      )}

      <MantineRichEditor
        value={content}
        onChange={updateContent}
        withAI={withAI}
        placeholder="Start writing your content..."
      />
    </Box>
  );
}
