
'use client';

import * as React from 'react';

import type { SlateEditor } from '@udecode/plate';

import { HEADING_KEYS, isHeading } from '@udecode/plate-heading';
import { useEditorSelector } from '@udecode/plate/react';

import { cn } from '@/lib/utils';

interface DocumentOutlineProps {
  editor: SlateEditor;
}

interface HeadingItem {
  id: string;
  level: number;
  path: number[];
  title: string;
}

function getHeadingList(editor: SlateEditor): HeadingItem[] {
  const headings: HeadingItem[] = [];
  
  const nodes = editor.children || [];
  
  nodes.forEach((node, index) => {
    if (isHeading(node)) {
      const headingKeys = Object.values(HEADING_KEYS) as string[];
      const nodeType = node.type as keyof typeof HEADING_KEYS;
      const level = headingKeys.indexOf(nodeType) + 1;
      
      // Extract text more robustly, handling nested structures
      const extractText = (children: any[]): string => {
        return children.map((child: any) => {
          if (typeof child === 'string') return child;
          if (child.text) return child.text;
          if (child.children) return extractText(child.children);
          return '';
        }).join('').trim();
      };
      
      const title = node.children ? extractText(node.children) : '';
      
      if (title) {
        headings.push({
          id: `heading-${index}`,
          level,
          path: [index],
          title: title.replace(/\s+/g, ' ').trim(), // Normalize whitespace
        });
      }
    }
  });
  
  return headings;
}

export function DocumentOutline({ editor }: DocumentOutlineProps) {
  const [activeHeadingId, setActiveHeadingId] = React.useState<string | null>(null);
  
  const headingList = useEditorSelector(
    (editor) => getHeadingList(editor),
    [editor]
  );

  const scrollToHeading = (path: number[], headingId: string) => {
    const targetHeading = headingList.find(h => h.path.join(',') === path.join(','));
    if (!targetHeading) return;
    
    // Set the active heading
    setActiveHeadingId(headingId);

    // Try multiple approaches to find the heading element
    let element: Element | null = null;
    
    // Method 1: Try data attribute selectors
    const selectors = [
      `[data-slate-node="element"][data-slate-path="${path.join(',')}"]`,
      `[data-slate-path="${path.join(',')}"]`,
      `[data-path="${path.join(',')}"]`
    ];
    
    for (const selector of selectors) {
      element = document.querySelector(selector);
      if (element) break;
    }
    
    // Method 2: Find by exact text content match
    if (!element) {
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [data-slate-node="element"]');
      for (const heading of allHeadings) {
        const headingText = heading.textContent?.trim();
        if (headingText === targetHeading.title) {
          element = heading;
          break;
        }
      }
    }
    
    // Method 3: Find by partial text content match (for multi-line headings)
    if (!element) {
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [data-slate-node="element"]');
      for (const heading of allHeadings) {
        const headingText = heading.textContent?.trim().replace(/\s+/g, ' ');
        const targetText = targetHeading.title.trim().replace(/\s+/g, ' ');
        if (headingText && targetText && 
            (headingText.includes(targetText) || targetText.includes(headingText))) {
          element = heading;
          break;
        }
      }
    }
    
    // Method 4: Try to find by searching within editor content
    if (!element) {
      const editorContent = document.querySelector('[data-slate-editor="true"]');
      if (editorContent) {
        const walker = document.createTreeWalker(
          editorContent,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) => {
              const element = node as Element;
              const text = element.textContent?.trim();
              return text === targetHeading.title ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
          }
        );
        
        let node;
        while (node = walker.nextNode()) {
          element = node as Element;
          break;
        }
      }
    }
    
    if (element) {
      // Account for the fixed header and toolbar height
      const headerHeight = 60;
      const toolbarHeight = 49;
      const offset = headerHeight + toolbarHeight + 20;
      
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
      const targetPosition = elementTop - offset;
      
      window.scrollTo({
        behavior: 'smooth',
        top: targetPosition
      });
    } else {
      console.warn('Could not find heading element for:', targetHeading.title);
    }
  };

  return (
    <div className="fixed top-20 left-0 h-screen w-64 border-r border-border bg-background p-4 overflow-y-auto">
      
      {headingList.length > 0 ? (
        <div className="space-y-1">
          {headingList.map((heading) => (
            <button
              key={heading.id}
              className={cn(
                'w-full text-left text-sm rounded-sm px-2 py-1.5 transition-colors',
                activeHeadingId === heading.id 
                  ? 'bg-black text-white' 
                  : 'hover:bg-accent hover:text-accent-foreground',
                heading.level === 1 && 'font-medium',
                heading.level === 2 && !activeHeadingId && 'pl-4 text-muted-foreground',
                heading.level === 3 && !activeHeadingId && 'pl-6 text-muted-foreground',
                heading.level >= 4 && !activeHeadingId && 'pl-8 text-muted-foreground',
                heading.level === 2 && activeHeadingId === heading.id && 'pl-4',
                heading.level === 3 && activeHeadingId === heading.id && 'pl-6',
                heading.level >= 4 && activeHeadingId === heading.id && 'pl-8'
              )}
              onClick={() => scrollToHeading(heading.path, heading.id)}
            >
              {heading.level === 1 ? `${heading.title}` : `• ${heading.title}`}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No headings found. Add headings to see the document outline.
        </div>
      )}
    </div>
);
}