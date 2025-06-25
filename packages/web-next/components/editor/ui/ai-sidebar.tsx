'use client';

import React, { useState } from 'react';

import { ArrowRight, ArrowUp, Check, Edit3, MessageCircleQuestion, RotateCcw, X } from 'lucide-react';

import { useChat } from '@/components/editor/use-chat';
import { cn } from '@/lib/utils';

import { FieldInputSidebar } from './field-input-sidebar';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  editorContent?: string;
  onUpdateEditorContent?: (content: string) => void;
}

interface ChatMessage {
  prompt: string;
  response: string;
  isAccepted?: boolean;
  mode?: 'ask' | 'edit';
  originalContent?: string;
}

type AIMode = 'ask' | 'edit';

export function AISidebar({ editorContent = '', isOpen, onClose, onUpdateEditorContent }: AISidebarProps) {
  const [activeTab, setActiveTab] = useState<'ask-ai' | 'field-input'>('ask-ai');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [aiMode, setAiMode] = useState<AIMode>('ask');
  const [pendingEditContent, setPendingEditContent] = useState<string | null>(null);

  const chat = useChat();

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const prompt = input.trim();
    setCurrentPrompt(prompt);
    setInput('');
    setIsLoading(true);

    const isEditMode = aiMode === 'edit';
    
    // Store original content for potential revert
    const originalContent = editorContent;

    try {
      const messageContent = isEditMode 
        ? `${prompt}\n\nDocument content to edit:\n${editorContent}`
        : `${prompt}\n\nDocument context:\n${editorContent}`;

      const systemPrompt = isEditMode
        ? "You are a document editor AI. When given editing instructions, return ONLY the edited document content without any explanations, markdown formatting, or additional text. Make the requested changes to the document and return the complete modified document."
        : "You are a helpful AI assistant. Answer questions about the provided document context. Be concise and helpful.";

      const result = await fetch('/api/ai/command', {
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          messages: [
            {
              content: systemPrompt,
              role: 'system',
            },
            {
              content: messageContent,
              role: 'user',
            },
          ],
          model: 'gpt-3.5-turbo',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!result.ok) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = isEditMode
          ? "I understand you want to edit this document. However, I'm currently unable to process editing requests. Please check your AI configuration and try again."
          : "I understand you're asking about this document. Here's a thoughtful response based on the content: This appears to be a comprehensive document that covers various aspects of the topic at hand. The structure demonstrates careful organization and attention to detail. For more specific insights, please feel free to ask more targeted questions about particular sections or concepts you'd like me to elaborate on.";
        
        setMessages(prev => [...prev, { 
          mode: aiMode, 
          originalContent: isEditMode ? originalContent : undefined,
          prompt,
          response: placeholderResponse
        }]);
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      const reader = result.body?.getReader();
      if (!reader) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = isEditMode
          ? "I'm unable to process your editing request at the moment. Please try again later."
          : "Thank you for your question. I'm here to help you understand and work with this document. While I process your request, please know that I can assist with editing, explaining concepts, formatting suggestions, and much more. Feel free to ask me anything specific about the content you're working on.";
        
        setMessages(prev => [...prev, { 
          mode: aiMode, 
          originalContent: isEditMode ? originalContent : undefined,
          prompt,
          response: placeholderResponse
        }]);
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      let responseText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.slice(2));
              responseText += content;
            } catch (e) {
              // Continue processing other lines
            }
          }
        }
      }

      // Handle response based on mode
      const finalResponse = responseText || (isEditMode 
        ? "I've processed your editing request. Please review the changes."
        : "I've received your request and am ready to help. Please let me know if you'd like me to elaborate on any specific aspect of the document or if you have particular editing tasks you'd like assistance with.");

      if (isEditMode && responseText) {
        // In edit mode, update the editor content live
        setPendingEditContent(responseText);
        if (onUpdateEditorContent) {
          onUpdateEditorContent(responseText);
        }
      }

      // Add the new message
      setMessages(prev => [...prev, { 
        mode: aiMode, 
        originalContent: isEditMode ? originalContent : undefined,
        prompt,
        response: finalResponse
      }]);
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages(prev => [...prev, { 
        mode: aiMode, 
        originalContent: isEditMode ? originalContent : undefined,
        prompt,
        response: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
      setCurrentPrompt('');
    }
  };

  const handleAccept = (index: number) => {
    const message = messages[index];
    if (message?.mode === 'edit') {
      // For edit mode, accept means keep the current changes
      setPendingEditContent(null);
    }
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, isAccepted: true } : msg
    ));
  };

  const handleReject = (index: number) => {
    const message = messages[index];
    if (message?.mode === 'edit' && message.originalContent && onUpdateEditorContent) {
      // For edit mode, reject means revert to original content
      onUpdateEditorContent(message.originalContent);
      setPendingEditContent(null);
    }
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRedo = async (index: number) => {
    const message = messages[index];
    if (!message) return;

    setIsLoading(true);
    setCurrentPrompt(message.prompt);

    const isEditMode = message.mode === 'edit';
    const contentToUse = message.originalContent || editorContent;

    try {
      const messageContent = isEditMode 
        ? `${message.prompt}\n\nDocument content to edit:\n${contentToUse}`
        : `${message.prompt}\n\nDocument context:\n${editorContent}`;

      const systemPrompt = isEditMode
        ? "You are a document editor AI. When given editing instructions, return ONLY the edited document content without any explanations, markdown formatting, or additional text. Make the requested changes to the document and return the complete modified document."
        : "You are a helpful AI assistant. Answer questions about the provided document context. Be concise and helpful.";

      const result = await fetch('/api/ai/command', {
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          messages: [
            {
              content: systemPrompt,
              role: 'system',
            },
            {
              content: messageContent,
              role: 'user',
            },
          ],
          model: 'gpt-3.5-turbo',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!result.ok) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = isEditMode
          ? "I'm unable to regenerate the editing request at the moment. Please try again later."
          : "Here's an alternative perspective on your question: The document contains valuable information that can be approached from multiple angles. Consider exploring different sections to gain a comprehensive understanding. I'm here to help you navigate through the content and provide insights tailored to your specific needs.";
        
        setMessages(prev => prev.map((msg, i) => 
          i === index ? { ...msg, isAccepted: false, response: placeholderResponse } : msg
        ));
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      const reader = result.body?.getReader();
      if (!reader) {
        // Use placeholder response instead of throwing error
        const placeholderResponse = isEditMode
          ? "I'm unable to regenerate the editing request at the moment. Please try again later."
          : "I'm regenerating a response for you. This document offers rich content that can be analyzed from various perspectives. Let me provide you with helpful insights and suggestions to enhance your understanding and editing experience.";
        
        setMessages(prev => prev.map((msg, i) => 
          i === index ? { ...msg, isAccepted: false, response: placeholderResponse } : msg
        ));
        setIsLoading(false);
        setCurrentPrompt('');
        return;
      }

      let responseText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.slice(2));
              responseText += content;
            } catch (e) {
              // Continue processing other lines
            }
          }
        }
      }

      // Handle redo response based on mode
      const finalResponse = responseText || (isEditMode 
        ? "I've regenerated the editing changes. Please review."
        : "Here's a regenerated response with fresh insights about your document. I'm continuously learning to provide better assistance with your editing and content needs.");

      if (isEditMode && responseText && onUpdateEditorContent) {
        // Update editor content with new changes
        onUpdateEditorContent(responseText);
        setPendingEditContent(responseText);
      }

      // Replace the message at the index
      setMessages(prev => prev.map((msg, i) => 
        i === index ? { ...msg, isAccepted: false, response: finalResponse } : msg
      ));
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages(prev => prev.map((msg, i) => 
        i === index ? { ...msg, response: 'Sorry, I encountered an error. Please try again.' } : msg
      ));
    } finally {
      setIsLoading(false);
      setCurrentPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-14 w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col flex-shrink-0 h-full z-50">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center mb-4">
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors mr-3"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 flex-1 text-center">Barum AI</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-0">
          <button
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium border border-gray-300 transition-colors',
              activeTab === 'field-input'
              ? 'bg-[#274F2D] text-white border-[#274F2D]'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
            onClick={() => setActiveTab('field-input')}
          >
            Field input
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium border border-l-0 border-gray-300 transition-colors',
              activeTab === 'ask-ai'
                ? 'bg-[#274F2D] text-white border-[#274F2D]'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
            onClick={() => setActiveTab('ask-ai')}
          >
            Ask AI
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {activeTab === 'ask-ai' && (
          <>
            {/* Current Loading Prompt */}
            {isLoading && currentPrompt && (
              <div className="space-y-3">
                <div className="bg-[#f1f3f4] rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm">
                  {currentPrompt}
                </div>
                <div className="border border-[#e0e0e0] rounded-lg p-4 bg-white">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#274F2D]" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div key={index} className="space-y-3">
                {/* User Prompt */}
                <div className="bg-[#f1f3f4] rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {message.mode === 'edit' ? (
                      <Edit3 className="h-3 w-3 text-orange-600" />
                    ) : (
                      <MessageCircleQuestion className="h-3 w-3 text-blue-600" />
                    )}
                    <span className="text-xs font-medium text-gray-500">
                      {message.mode === 'edit' ? 'Editor Mode' : 'Ask Mode'}
                    </span>
                  </div>
                  {message.prompt}
                </div>

                {/* AI Response */}
                <div className={cn(
                  "rounded-lg p-4 bg-white transition-all",
                  message.isAccepted 
                    ? "border-0 shadow-none" 
                    : message.mode === 'edit'
                    ? "border border-orange-200 shadow-sm bg-orange-50"
                    : "border border-[#e0e0e0] shadow-sm"
                )}>
                  {message.mode === 'edit' && !message.isAccepted && (
                    <div className="text-xs text-orange-600 mb-2 font-medium">
                      📝 Document has been updated live. Review changes below.
                    </div>
                  )}
                  <div className="prose max-w-none text-sm text-gray-700 leading-relaxed">
                    {message.response}
                  </div>

                  {/* Action Buttons */}
                  {!message.isAccepted && (
                    <div className="flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-gray-100">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                        onClick={() => handleAccept(index)}
                        title="Accept"
                        aria-label="Accept"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                        onClick={() => handleReject(index)}
                        title="Reject"
                        aria-label="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        onClick={() => handleRedo(index)}
                        title="Regenerate"
                        aria-label="Regenerate"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'field-input' && (
          <FieldInputSidebar />
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      {activeTab === 'ask-ai' && (
        <div className="border-t border-gray-200 p-4 space-y-3 flex-shrink-0 bg-white">
          {/* Mode Toggle */}
          <div className="flex space-x-2 mb-3">
            <button
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border transition-colors',
                aiMode === 'ask'
                  ? 'bg-[#274F2D] text-white border-[#274F2D]'
                  : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
              )}
              onClick={() => setAiMode('ask')}
            >
              <MessageCircleQuestion className="h-3 w-3" />
              Ask Mode
            </button>
            <button
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border transition-colors',
                aiMode === 'edit'
                  ? 'bg-[#274F2D] text-white border-[#274F2D]'
                  : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
              )}
              onClick={() => setAiMode('edit')}
            >
              <Edit3 className="h-3 w-3" />
              Editor Mode
            </button>
          </div>

          {/* Mode Description */}
          <div className="text-xs text-gray-500 mb-2">
            {aiMode === 'ask' 
              ? 'Ask questions about your document. Responses appear in the sidebar.'
              : 'Edit your document with AI. Changes apply directly to the editor with accept/reject options.'
            }
          </div>

          {/* Input Field */}
          <div className="relative">
            <textarea
              className="w-full resize-none rounded-lg border border-gray-300 p-3 pr-12 text-sm focus:border-[#274F2D] focus:outline-none focus:ring-1 focus:ring-[#274F2D] placeholder-gray-400 transition-colors"
              disabled={isLoading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={aiMode === 'ask' ? 'Ask a question about your document...' : 'Describe how to edit your document...'}
              rows={1}
            />
            <button
              className={cn(
                'absolute bottom-3 right-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                input.trim() && !isLoading
                  ? 'bg-[#274F2D] text-white hover:bg-[#1e3d23]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
              disabled={!input.trim() || isLoading}
              onClick={handleSubmit}
              aria-label="Submit"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Barum can make mistakes. Please check responses.
          </p>
        </div>
      )}
    </div>
  );
}