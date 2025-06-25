'use client';

import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { Box, Group, Button } from '@mantine/core';
import { IconPhoto, IconTable, IconRobot } from '@tabler/icons-react';

interface MantineRichEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  withAI?: boolean;
  withCollaboration?: boolean;
  readOnly?: boolean;
  minHeight?: number;
}

export function MantineRichEditor({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  withAI = false,
  withCollaboration = false,
  readOnly = false,
  minHeight = 400,
}: MantineRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Color,
      TextStyle,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <Box>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={60}>
          {/* Basic formatting controls */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          {/* Heading controls */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          {/* List and structure controls */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          {/* Link controls */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          {/* Alignment controls */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>

          {/* Action controls */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>

          {/* Custom controls */}
          <RichTextEditor.ControlsGroup>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconPhoto size={16} />}
              onClick={() => {
                // Image upload functionality
                const url = window.prompt('Enter image URL');
                if (url) {
                  editor?.chain().focus().setImage({ src: url }).run();
                }
              }}
            >
              Image
            </Button>

            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconTable size={16} />}
              onClick={() => {
                editor
                  ?.chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
              }}
            >
              Table
            </Button>

            {withAI && (
              <Button
                variant="subtle"
                size="sm"
                leftSection={<IconRobot size={16} />}
                onClick={() => {
                  // AI integration placeholder
                  console.log('AI functionality to be implemented');
                }}
              >
                AI
              </Button>
            )}
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content style={{ minHeight }} />
      </RichTextEditor>
    </Box>
  );
}
