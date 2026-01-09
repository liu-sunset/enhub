export interface AppConfig {
  aliyunApiKey: string;
  baseUrl: string;
  githubToken: string;
  repoOwner: string;
  repoName: string;
  defaultModel: string;
  customInstructions?: string; // The editable part of the prompt
}

export type GroupStatus = 'idle' | 'processing' | 'success' | 'error';

export interface ArticleGroup {
  id: string;
  images: ImageData[];
  englishArticle: string;
  storagePath: string;
  status: GroupStatus;
  generatedHtml?: string;
  error?: string;
  isSaved?: boolean;
  githubUrl?: string;
}

export type AppStep = 'upload' | 'edit' | 'save' | 'success';

export interface ImageData {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}