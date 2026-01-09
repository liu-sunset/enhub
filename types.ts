export interface AppConfig {
  aliyunApiKey: string;
  baseUrl: string;
  githubToken: string;
  repoOwner: string;
  repoName: string;
  defaultModel: string;
}

export interface ProcessedArticle {
  htmlContent: string;
  year: string;
  fileId: string;
}

export type AppStep = 'upload' | 'edit' | 'save' | 'success';

export interface ImageData {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}