
'use client';

import * as React from 'react';
import { useState } from 'react';

import { format } from 'date-fns';
import { ChevronDownIcon, ClockIcon, EditIcon, TrashIcon } from 'lucide-react';

import { useVersionHistoryContext } from '@/components/editor/version-history-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export function VersionHistoryButton() {
  const {
    currentVersion,
    versions,
    handleDeleteVersion,
    handleRenameVersion,
    handleSaveNewVersion,
    handleVersionSelect,
  } = useVersionHistoryContext();

  const [isOpen, setIsOpen] = useState(false);
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const displayVersion = currentVersion || versions[0];
  const displayText = displayVersion 
    ? `${displayVersion.name} • ${format(displayVersion.date, 'MM/dd/yyyy h:mm a')}`
    : 'No versions';

  const handleEdit = (version: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVersionId(version.id);
    setEditingName(version.name);
  };

  const handleSaveEdit = () => {
    if (editingVersionId && editingName.trim()) {
      handleRenameVersion(editingVersionId, editingName.trim());
    }
    setEditingVersionId(null);
    setEditingName('');
  };

  const handleDelete = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteVersionId(versionId);
  };

  const confirmDelete = () => {
    if (deleteVersionId) {
      handleDeleteVersion(deleteVersionId);
      setDeleteVersionId(null);
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-sm font-normal text-muted-foreground hover:text-foreground border border-input"
          >
            <ClockIcon className="mr-2 h-4 w-4" />
            {displayText}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96" align="center">
          <div className="px-2 py-1.5">
            <h4 className="font-medium">Version History</h4>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSaveNewVersion}>
            <ClockIcon className="mr-2 h-4 w-4" />
            Save new version
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="max-h-60 overflow-y-auto">
            {versions.map((version) => (
              <DropdownMenuItem
                key={version.id}
                className="flex items-center justify-between px-3 py-2 cursor-pointer"
                onClick={() => !editingVersionId && handleVersionSelect(version)}
              >
                <div className="flex flex-col items-start flex-1">
                  {editingVersionId === version.id ? (
                    <Input
                      className="h-6 text-sm font-medium"
                      value={editingName}
                      onBlur={handleSaveEdit}
                      onChange={(e) => setEditingName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') {
                          setEditingVersionId(null);
                          setEditingName('');
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        {version.name}
                      </span>
                      {version.isCurrent && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded ml-2">
                          Current
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(version.date, 'MMMM d, yyyy • h:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => handleEdit(version, e)}
                  >
                    <EditIcon className="h-3 w-3" />
                  </Button>
                  {versions.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      onClick={(e) => handleDelete(version.id, e)}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!deleteVersionId} onOpenChange={() => setDeleteVersionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this version? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
            Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
