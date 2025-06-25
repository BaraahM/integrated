
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { type PlateEditor, useEditorRef } from '@udecode/plate/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';

interface Placeholder {
  key: string;
  id: string;
  headingId: string;
  label: string;
  position: { offset: number; path: number[] };
  subHeadingId: string;
}

interface Heading {
  id: string;
  level: number;
  placeholders: Placeholder[];
  position: number[];
  text: string;
}

interface SubHeading {
  id: string;
  parentId: string;
  placeholders: Placeholder[];
  text: string;
}

export function FieldInputSidebar() {
  const editor = useEditorRef();
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [subHeadings, setSubHeadings] = useState<SubHeading[]>([]);
  const [selectedSubHeading, setSelectedSubHeading] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [tempFieldValues, setTempFieldValues] = useState<Record<string, string>>({});

  // Scan document for headings and placeholders
  const scanDocument = React.useCallback(() => {
    if (!editor?.children) return;

    const newHeadings: Heading[] = [];
    const newSubHeadings: SubHeading[] = [];
    const newPlaceholders: Placeholder[] = [];
    const placeholderRegex = /\[([^\]]+)\]/g;

    let currentH1: Heading | null = null;
    let currentH2: SubHeading | null = null;

    const traverseNode = (node: any, path: number[]) => {
      if (node.type === 'h1' || node.type === 'h2' || node.type === 'h3') {
        const text = node.children?.map((child: any) => child.text || '').join('') || '';
        const headingId = `heading-${path.join('-')}`;

        if (node.type === 'h1') {
          currentH1 = {
            id: headingId,
            level: 1,
            placeholders: [],
            position: path,
            text,
          };
          newHeadings.push(currentH1);
          currentH2 = null;
        } else if (node.type === 'h2' || node.type === 'h3') {
          const subHeadingId = `subheading-${path.join('-')}`;
          currentH2 = {
            id: subHeadingId,
            parentId: currentH1?.id || 'root',
            placeholders: [],
            text,
          };
          newSubHeadings.push(currentH2);
        }
      }

      // Look for placeholders in text nodes
      if (node.text) {
        const text = node.text;
        let match;
        while ((match = placeholderRegex.exec(text)) !== null) {
          const key = match[1];
          const beforeText = text.substring(0, match.index);
          const label = extractLabel(beforeText);
          
          const placeholder: Placeholder = {
            key,
            id: `placeholder-${path.join('-')}-${match.index}`,
            headingId: currentH1?.id || 'root',
            label,
            position: { offset: match.index, path },
            subHeadingId: currentH2?.id || 'root',
          };

          newPlaceholders.push(placeholder);
          
          if (currentH2) {
            currentH2.placeholders.push(placeholder);
          } else if (currentH1) {
            currentH1.placeholders.push(placeholder);
          }
        }
      }

      // Recursively traverse children
      if (node.children) {
        node.children.forEach((child: any, index: number) => {
          traverseNode(child, [...path, index]);
        });
      }
    };

    editor.children.forEach((node, index) => {
      traverseNode(node, [index]);
    });

    setHeadings(newHeadings);
    setSubHeadings(newSubHeadings);
    setPlaceholders(newPlaceholders);

    // Initialize field values
    const initialValues: Record<string, string> = {};
    newPlaceholders.forEach(p => {
      initialValues[p.id] = p.key;
    });
    setFieldValues(initialValues);
    setTempFieldValues(initialValues);
  }, [editor]);

  // Extract label from text before placeholder
  const extractLabel = (beforeText: string): string => {
    const lines = beforeText.split('\n');
    const lastLine = lines[lines.length - 1];
    
    // Look for patterns like "Co-Founder 1:" or "• Description:"
    const labelMatch = lastLine.match(/([^.]*[:\-•]\s*)$/);
    if (labelMatch) {
      return labelMatch[1].trim();
    }
    
    // Fallback to last few words
    const words = lastLine.trim().split(/\s+/);
    return words.slice(-3).join(' ');
  };

  // Update placeholder in document
  const updatePlaceholder = useCallback((placeholderId: string, newValue: string) => {
    const placeholder = placeholders.find(p => p.id === placeholderId);
    if (!placeholder || !editor) return;

    try {
      const bracketedText = `[${placeholder.key}]`;
      
      // Use Slate's transforms to update the document
      const { children } = editor;
      const plateEditor = editor as PlateEditor;
      
      // Find and replace the placeholder text
      const findAndReplace = (nodes: any[], path: number[] = []) => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const currentPath = [...path, i];
          
          if (node.text && typeof node.text === 'string' && node.text.includes(bracketedText)) {
            const beforeText = node.text.substring(0, node.text.indexOf(bracketedText));
            const afterText = node.text.substring(node.text.indexOf(bracketedText) + bracketedText.length);
            
            // Replace the text using Slate transforms
            plateEditor.tf.withoutNormalizing(() => {
              if (beforeText || afterText) {
                // Split the text node if needed
                const startOffset = beforeText.length;
                const endOffset = startOffset + bracketedText.length;
                
                plateEditor.tf.select({
                  anchor: { offset: startOffset, path: currentPath },
                  focus: { offset: endOffset, path: currentPath }
                });
                
                plateEditor.tf.insertText(newValue);
              } else {
                // Replace entire text node
                plateEditor.tf.setNodes({ text: newValue }, { at: currentPath });
              }
            });
            
            // Update the placeholder key for future references
            setPlaceholders(prev => prev.map(p => 
              p.id === placeholderId ? { ...p, key: newValue } : p
            ));
            
            return true;
          }
          
          // Recursively search children
          if (node.children && Array.isArray(node.children)) {
            if (findAndReplace(node.children, currentPath)) {
              return true;
            }
          }
        }
        return false;
      };

      findAndReplace(children);
      
      // Update local field values
      setFieldValues(prev => ({ ...prev, [placeholderId]: newValue }));
      
    } catch (error) {
      console.error('Error updating placeholder:', error);
    }
  }, [editor, placeholders]);

  // Group subheadings with placeholders by parent heading
  const sectionsWithPlaceholders = useMemo(() => {
    const sections: Record<string, { heading: Heading; subHeadings: SubHeading[] }> = {};
    
    headings.forEach(heading => {
      const headingSubHeadings = subHeadings.filter(
        sub => sub.parentId === heading.id && sub.placeholders.length > 0
      );
      
      if (headingSubHeadings.length > 0 || heading.placeholders.length > 0) {
        sections[heading.id] = {
          heading,
          subHeadings: headingSubHeadings
        };
      }
    });

    return sections;
  }, [headings, subHeadings]);

  // Get available subheadings for navigation
  const availableSubHeadings = useMemo(() => {
    return subHeadings.filter(sub => sub.placeholders.length > 0);
  }, [subHeadings]);

  // Navigate to previous/next subheading
  const navigateSubHeading = (direction: 'next' | 'prev') => {
    if (!selectedSubHeading) return;
    
    const currentIndex = availableSubHeadings.findIndex(sub => sub.id === selectedSubHeading);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(availableSubHeadings.length - 1, currentIndex + 1);
    
    setSelectedSubHeading(availableSubHeadings[newIndex].id);
  };

  // Scroll to heading in editor
  const scrollToHeading = (headingId: string) => {
    // This would need to be implemented based on your editor setup
    console.log('Scroll to heading:', headingId);
  };

  useEffect(() => {
    scanDocument();
  }, [scanDocument]);

  // Re-scan when editor content changes (but avoid infinite loops)
  useEffect(() => {
    if (!editor) return;
    
    // Debounce the scan to avoid performance issues
    const timeoutId = setTimeout(() => {
      scanDocument();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [editor?.children, scanDocument]);

  const selectedSubHeadingData = selectedSubHeading 
    ? subHeadings.find(sub => sub.id === selectedSubHeading)
    : null;

  const parentHeading = selectedSubHeadingData
    ? headings.find(h => h.id === selectedSubHeadingData.parentId)
    : null;

  if (Object.keys(sectionsWithPlaceholders).length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No fields to fill.
      </div>
    );
  }

  if (selectedSubHeading && selectedSubHeadingData) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedSubHeading(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 mx-4 text-center">
            <div className="text-sm font-medium text-gray-900">
              {parentHeading?.text || 'Section'}
            </div>
            <div className="text-xs text-gray-500">
              {selectedSubHeadingData.text}
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={availableSubHeadings.findIndex(sub => sub.id === selectedSubHeading) === 0}
              onClick={() => navigateSubHeading('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={availableSubHeadings.findIndex(sub => sub.id === selectedSubHeading) === availableSubHeadings.length - 1}
              onClick={() => navigateSubHeading('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedSubHeadingData.placeholders.map((placeholder) => (
            <div key={placeholder.id} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {placeholder.label || 'Field'}
              </label>
              <Input
                className="w-full"
                value={tempFieldValues[placeholder.id] || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Update temporary field values for UI responsiveness
                  setTempFieldValues(prev => ({ ...prev, [placeholder.id]: newValue }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newValue = tempFieldValues[placeholder.id] || '';
                    // Update the editor document only on Enter
                    updatePlaceholder(placeholder.id, newValue);
                    // Sync the permanent field values
                    setFieldValues(prev => ({ ...prev, [placeholder.id]: newValue }));
                  }
                }}
                placeholder="Enter value... (Press Enter to confirm)"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {Object.values(sectionsWithPlaceholders).map(({ heading, subHeadings: sectionSubHeadings }) => (
        <div key={heading.id} className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {heading.text}
          </div>
          {sectionSubHeadings.map((subHeading) => (
            <Button
              key={subHeading.id}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-2"
              onClick={() => {
                setSelectedSubHeading(subHeading.id);
                scrollToHeading(subHeading.id);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-600">
                  └─ {subHeading.text}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {subHeading.placeholders.length}
                </span>
              </div>
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
