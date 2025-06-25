export interface EditorConfig {
  enableAI: boolean;
  enableCollaboration: boolean;
  enableUpload: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

export interface EditorDocument {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

export interface AIGenerationOptions {
  type: 'improve' | 'summarize' | 'expand' | 'custom';
  prompt?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
}
