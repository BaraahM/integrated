
'use client';

import * as React from 'react';
import { useState } from 'react';

import { format } from 'date-fns';
import { ChevronDownIcon, ClockIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Version {
  id: string;
  date: Date;
  name: string;
  isCurrent?: boolean;
}

export interface VersionHistoryHeaderProps {
  versions: Version[];
  onSaveNewVersion: () => void;
  onVersionSelect: (version: Version) => void;
  currentVersion?: Version;
}

export function VersionHistoryHeader({
  currentVersion,
  versions,
  onSaveNewVersion,
  onVersionSelect,
}: VersionHistoryHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayVersion = currentVersion || versions[0];
  const displayText = displayVersion 
    ? `Version ${format(displayVersion.date, 'MM/dd/yyyy')} • ${format(displayVersion.date, 'h:mm a')}`
    : 'No versions';

  return (
    <div className="flex justify-center w-full py-2 bg-background border-b border-border">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-sm font-normal text-muted-foreground hover:text-foreground"
          >
            <ClockIcon className="mr-2 h-4 w-4" />
            {displayText}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="center">
          <div className="px-2 py-1.5">
            <h4 className="font-medium">Version History</h4>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSaveNewVersion}>
            <ClockIcon className="mr-2 h-4 w-4" />
            Save new version
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="max-h-60 overflow-y-auto">
            {versions.map((version) => (
              <DropdownMenuItem
                key={version.id}
                className="flex flex-col items-start px-3 py-2"
                onClick={() => onVersionSelect(version)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">
                    {version.name || `Version ${format(version.date, 'MM/dd/yyyy')}`}
                  </span>
                  {version.isCurrent && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(version.date, 'MMMM d, yyyy • h:mm a')}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
