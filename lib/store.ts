import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppConfig, AppStep, ImageData } from '../types';

interface AppState {
  config: AppConfig;
  setConfig: (config: Partial<AppConfig>) => void;
  
  currentStep: AppStep;
  setStep: (step: AppStep) => void;

  images: ImageData[];
  addImage: (image: ImageData) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;

  generatedHtml: string;
  setGeneratedHtml: (html: string) => void;

  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      config: {
        aliyunApiKey: '',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        githubToken: '',
        repoOwner: '',
        repoName: '',
        defaultModel: 'qwen3-vl-flash',
      },
      setConfig: (newConfig) =>
        set((state) => ({ config: { ...state.config, ...newConfig } })),

      currentStep: 'upload',
      setStep: (step) => set({ currentStep: step }),

      images: [],
      addImage: (image) => set((state) => ({ images: [...state.images, image] })),
      removeImage: (id) =>
        set((state) => ({ images: state.images.filter((img) => img.id !== id) })),
      clearImages: () => set({ images: [] }),

      generatedHtml: '',
      setGeneratedHtml: (html) => set({ generatedHtml: html }),

      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),
    }),
    {
      name: 'enhub-storage',
      partialize: (state) => ({ config: state.config }), // Only persist config
    }
  )
);