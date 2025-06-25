'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useEditorRef } from '@udecode/plate/react';

export interface Version {
  id: string;
  content: any;
  date: Date;
  isCurrent: boolean;
  name: string;
}

export function useVersionHistory() {
  const editor = useEditorRef();
  const isLoadingRef = useRef(false);
  const lastSavedContentRef = useRef<any>(null);

  // Initialize versions - will be populated when editor is ready
  const [versions, setVersions] = useState<Version[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize versions once editor is ready
  useEffect(() => {
    if (editor && !isInitialized) {
      const currentContent = editor.children?.length > 0 ? editor.children : getDefaultContent();
      const hasTemplateContent = currentContent.length > 2 || 
        (currentContent[0]?.children?.[0]?.text !== 'New Document' && 
         currentContent[0]?.children?.[0]?.text !== '');

      const defaultVersion: Version = {
        id: 'default',
        content: currentContent,
        date: new Date(),
        isCurrent: true,
        name: hasTemplateContent ? 'Template version' : 'Default version',
      };

      setVersions([defaultVersion]);
      setIsInitialized(true);
    }
  }, [editor, isInitialized]);

  const currentVersion = versions.find(v => v.isCurrent) || null;

  const validateContent = useCallback((content: any) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return [{ children: [{ text: '' }], type: 'p' }];
    }

    // Deep validation and cleanup of content structure
    const validateNode = (node: any): any => {
      if (!node || typeof node !== 'object') {
        return { children: [{ text: '' }], type: 'p' };
      }

      // Clean up node by removing potentially problematic properties
      const cleanNode = { ...node };

      delete cleanNode.isSelected;
      delete cleanNode.isPartiallySelected;

      if (!cleanNode.children || !Array.isArray(cleanNode.children)) {
        cleanNode.children = [{ text: '' }];
      } else {
        // validate children
        cleanNode.children = cleanNode.children.map((child: any) => {
          if (typeof child === 'object' && child !== null) {
            if (child.type) {
              return validateNode(child);
            } else {
              const cleanChild = { ...child };

              // Ensure text property exists
              if (typeof cleanChild.text !== 'string') {
                cleanChild.text = '';
              }

              // Remove any problematic properties while preserving valid marks
              const validMarkProperties = [
                'text', 'bold', 'italic', 'underline', 'strikethrough', 
                'code', 'subscript', 'superscript', 'highlight', 'color', 
                'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight'
              ];

              Object.keys(cleanChild).forEach(key => {
                if (!validMarkProperties.includes(key) && !key.startsWith('comment')) {
                  delete cleanChild[key];
                }
              });

              return cleanChild;
            }
          }
          return { text: '' };
        });
      }

      // Ensure type exists
      if (!cleanNode.type) {
        cleanNode.type = 'p';
      }

      return cleanNode;
    };

    return content.map(validateNode);
  }, []);

  const getCurrentEditorContent = useCallback(() => {
    if (!editor?.children) {
      return [{ children: [{ text: '' }], type: 'p' }];
    }

    try {
      // Deep clone to avoid reference issues
      const content = JSON.parse(JSON.stringify(editor.children));
      return validateContent(content);
    } catch (error) {
      console.error('Error serializing editor content:', error);
      return [{ children: [{ text: '' }], type: 'p' }];
    }
  }, [editor, validateContent]);

  const setEditorContent = useCallback((content: any) => {
    if (!editor) {
      console.error('Editor not available for content update');
      return;
    }

    const validatedContent = validateContent(content);

    try {
      // Store current operation state
      const wasNormalizing = editor.isNormalizing;

      // Disable normalization temporarily
      editor.isNormalizing = false;

      // Clear selection and marks to prevent state conflicts
      if (editor.selection) {
        editor.selection = null;
      }

      // Clear any active marks
      editor.marks = null;

      // Clear the editor content
      editor.children = [];

      // Set new content
      editor.children = validatedContent;

      // Reset selection to start of document
      const startPoint = { offset: 0, path: [0, 0] };
      if (validatedContent.length > 0) {
        try {
          editor.selection = {
            anchor: startPoint,
            focus: startPoint
          };
        } catch (selectionError) {
          // If setting selection fails, leave it null
          editor.selection = null;
        }
      }

      // Restore normalization and normalize
      editor.isNormalizing = wasNormalizing;
      if (typeof editor.normalize === 'function') {
        editor.normalize({ force: true });
      }

      // Trigger onChange to update the editor UI
      if (typeof editor.onChange === 'function') {
        editor.onChange();
      }
    } catch (error) {
      console.error('Error setting editor content:', error);

      // Fallback to safe content with clean state
      const fallbackContent = [{ children: [{ text: '' }], type: 'p' }];
      try {
        editor.selection = null;
        editor.marks = null;
        editor.children = fallbackContent;

        // Set safe selection for fallback
        try {
          editor.selection = {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [0, 0] }
          };
        } catch {
          editor.selection = null;
        }

        if (typeof editor.onChange === 'function') {
          editor.onChange();
        }
      } catch (fallbackError) {
        console.error('Error with fallback content:', fallbackError);
      }
    }
  }, [editor, validateContent]);

  // Initialize editor with current version content
  useEffect(() => {
    if (editor && currentVersion && !isLoadingRef.current) {
      const contentToLoad = currentVersion.name === 'Default version' && 
        (!currentVersion.content || currentVersion.content.length === 0)
        ? getDefaultContent()
        : currentVersion.content;

      setEditorContent(contentToLoad); // 22     setEditorContent(contentToLoad, true);
    }
  }, [editor, currentVersion?.id]); 

  const handleSaveNewVersion = useCallback(() => {
    if (!editor || isLoadingRef.current) {
      console.error('Editor not available or content loading');
      return;
    }

    try {
      const currentContent = getCurrentEditorContent();

      // Count only user-saved versions (exclude initial and default)
      const userVersions = versions.filter(
        v => v.name.startsWith('Version ')
      );
      const nextVersionNumber = userVersions.length + 1;

      const newVersion: Version = {
        id: `v_${Date.now()}`,
        content: currentContent,
        date: new Date(),
        isCurrent: true,
        name: `Version ${nextVersionNumber}`, // sequential name
      };

      setVersions(prev => {
        const updatedVersions = prev.map(v =>
          v.isCurrent
            ? { ...v, content: currentContent, isCurrent: false }
            : { ...v, isCurrent: false }
        );
        return [...updatedVersions, newVersion];
      });

      console.log('New version saved successfully');
    } catch (error) {
      console.error('Error saving new version:', error);
    }
  }, [editor, getCurrentEditorContent, versions]);

  const handleVersionSelect = useCallback((version: Version) => {
    if (!editor || isLoadingRef.current) {
      console.error('Editor not available or content loading');
      return;
    }

    if (version.isCurrent) {
      return; // Already current
    }

    try {
      // Save current editor state before switching
      const currentContent = getCurrentEditorContent();

      setVersions(prev => {
        return prev.map(v => {
          if (v.isCurrent) {
            // Save current editor content to the currently active version
            return { 
              ...v, 
              content: currentContent,
              isCurrent: false 
            };
          }
          return { ...v, isCurrent: v.id === version.id };
        });
      });

      // 22 Load the selected version's content
      let contentToLoad = version.content;

      // 22 Special handling for default version with missing content
      if (version.name === 'Default version' && (!version.content || version.content.length === 0)) {
        contentToLoad = getDefaultContent();
      }

      // 22 Set the content in the editor
      setEditorContent(contentToLoad);

      console.log('Version selected successfully:', version.name);
    } catch (error) {
      console.error('Error selecting version:', error);
    }
  }, [editor, getCurrentEditorContent, setEditorContent]);

  const handleDeleteVersion = useCallback((versionId: string) => {
    setVersions(prev => {
      const versionToDelete = prev.find(v => v.id === versionId);
      const filtered = prev.filter(v => v.id !== versionId);

      if (filtered.length === 0) {
        // 22 If all versions deleted, create a new default one
        const newDefault = {
          id: `v_${Date.now()}`,
          content: getDefaultContent(),
          date: new Date(),
          isCurrent: true,
          name: 'New version',
        };

        if (editor) {
          setEditorContent(newDefault.content);
        }

        return [newDefault];
      }

      // 22 If current version was deleted, make the first remaining version current
      if (versionToDelete?.isCurrent) {
        filtered[0].isCurrent = true;

        // 22 Load the new current version into the editor
        if (editor) {
          let contentToLoad = filtered[0].content;
          if (filtered[0].name === 'Default version' && (!filtered[0].content || filtered[0].content.length === 0)) {
            contentToLoad = getDefaultContent();
          }
          setEditorContent(contentToLoad);
        }
      }

      return filtered;
    });
  }, [editor, setEditorContent]);

  const handleRenameVersion = useCallback((versionId: string, newName: string) => {
    if (!newName.trim()) return;

    setVersions(prev => prev.map(v => 
      v.id === versionId ? { ...v, name: newName.trim() } : v
    ));
  }, []);

  return {
    currentVersion,
    versions,
    handleDeleteVersion,
    handleRenameVersion,
    handleSaveNewVersion,
    handleVersionSelect,
  };
}

// Helper function to get default content
function getDefaultContent() {
  return [
    {
      children: [{ text: "Co-Founders' Agreement" }],
      type: 'h1',
    },
    {
      children: [{ text: '1. Roles and Responsibilities' }],
      type: 'h1',
    },
    {
      children: [{ text: '1.1 Flexible Roles' }],
      type: 'h2',
    },
    {
      children: [
        {
          text: 'The Co-Founders acknowledge and agree that the roles and responsibilities within the Company will be dynamic and subject to change as the business evolves. Each Co-Founder commits to adapting their role as necessary for the benefit of the Company.',
        },
      ],
      type: 'p',
    },
    {
      children: [{ text: '1.2 Initial Role Allocation' }],
      type: 'h2',
    },
    {
      children: [
        {
          text: 'Notwithstanding the flexible nature of the roles, the initial primary responsibilities of each Co-Founder shall be as follows:',
        },
      ],
      type: 'p',
    },
    {
      children: [
        {
          text: 'Co-Founder 1: [DESCRIPTION OF INITIAL RESPONSIBILITIES]',
        },
      ],
      type: 'p',
    },
    {
      children: [
        {
          text: 'Co-Founder 2: [DESCRIPTION OF INITIAL RESPONSIBILITIES]',
        },
      ],
      type: 'p',
    },
    {
      children: [
        {
          text: 'Co-Founder 3: [DESCRIPTION OF INITIAL RESPONSIBILITIES]',
        },
      ],
      type: 'p',
    },
    {
      children: [{ text: '1.3 Duty to Company Success' }],
      type: 'h2',
    },
    {
      children: [
        {
          text: 'Each Co-Founder hereby affirms and agrees that their primary and overriding obligation shall be to promote and ensure the success of the Company. This obligation shall take precedence over individual interests or preferences in all business-related decisions and actions.',
        },
      ],
      type: 'p',
    },
    {
      children: [{ text: '2. Equity Distribution' }],
      type: 'h1',
    },
    {
      children: [{ text: '2.1 Initial Equity' }],
      type: 'h2',
    },
    {
      children: [
        {
          text: 'The total equity of the Company shall be divided among the Co-Founders as follows:',
        },
      ],
      type: 'p',
    },
    {
      children: [
        {
          text: 'Co-Founder 1: [PERCENTAGE]%',
        },
      ],
      type: 'p',
    },
    {
      children: [
        {
          text: 'Co-Founder 2: [PERCENTAGE]%',
        },
      ],
      type: 'p',
    },
    {
      children: [
        {
          text: 'Co-Founder 3: [PERCENTAGE]%',
        },
      ],
      type: 'p',
    },
    {
      children: [{ text: '2.2 Equity Type' }],
      type: 'h2',
    },
  ];
}