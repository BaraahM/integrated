'use client';

import { cn } from '@/lib/utils';

import { Toolbar } from './toolbar';

export function FixedToolbar(props: React.ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar
      {...props}
      className={cn(
        'scrollbar-hide w-full justify-between overflow-x-auto border-b border-b-border bg-background/95 px-1 py-0 backdrop-blur-sm supports-backdrop-blur:bg-background/60 relative z-40',
        props.className
      )}
    />
  );
}
