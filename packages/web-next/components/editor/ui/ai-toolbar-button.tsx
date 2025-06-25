
'use client';

import * as React from 'react';

import { AIChatPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin } from '@udecode/plate/react';
import { Wand2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

export function AIToolbarButton(
  props: React.ComponentProps<typeof Button>
) {
  const { api } = useEditorPlugin(AIChatPlugin);

  return (
    <Button
      {...props}
      size="sm"
      variant="ghost"
      className={cn(
        'bg-accent text-accent-foreground relative flex cursor-default items-center rounded-md px-2 py-1 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 mt-1',
        props.className
      )}
      onClick={() => {
        api.aiChat.show();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      <Wand2 className="h-4 w-4" />
    </Button>
  );
}
