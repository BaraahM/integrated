'use client';

import * as React from 'react';

import {
  ListStyleType,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import { useEditorRef } from '@udecode/plate/react';
import { ListIcon, ListOrderedIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

interface IndentListToolbarButtonProps {
  variant: 'bulleted' | 'numbered';
}

export function IndentListToolbarButton({ variant }: IndentListToolbarButtonProps) {
  const editor = useEditorRef();

  const handleClick = () => {
    if (variant === 'numbered') {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
    } else {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    }
  };

  return (
    <ToolbarButton
      onClick={handleClick}
      tooltip={variant === 'numbered' ? 'Numbered List' : 'Bulleted List'}
    >
      {variant === 'numbered' ? <ListOrderedIcon /> : <ListIcon />}
    </ToolbarButton>
  );
}

// Legacy exports for backward compatibility
export function BulletedIndentListToolbarButton(props: any) {
  return <IndentListToolbarButton variant="bulleted" {...props} />;
}

export function NumberedIndentListToolbarButton(props: any) {
  return <IndentListToolbarButton variant="numbered" {...props} />;
}