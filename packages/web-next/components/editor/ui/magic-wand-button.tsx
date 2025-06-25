
'use client';

import React from 'react';

import { Wand2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface MagicWandButtonProps {
  onClick: () => void;
  className?: string;
}

export function MagicWandButton({ className, onClick }: MagicWandButtonProps) {
  return (
    <button
      className={cn(
        'absolute top-16 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#274F2D] text-white shadow-lg transition-all hover:bg-[#1e3d23] hover:shadow-xl',
        className
      )}
      onClick={onClick}
      aria-label="Open AI Assistant"
    >
      <Wand2 className="h-5 w-5" />
    </button>
  );
}
