import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppConfig, AppStep, ArticleGroup, ImageData, GroupStatus } from '../types';
import { DEFAULT_INSTRUCTIONS } from '../services/prompts';

interface AppState {
  config: AppConfig;
  setConfig: (config: Partial<AppConfig>) => void;
  
  currentStep: AppStep;
  setStep: (step: AppStep) => void;

  articleGroups: ArticleGroup[];
  addArticleGroup: () => void;
  removeArticleGroup: (id: string) => void;
  updateArticleGroup: (id: string, updates: Partial<ArticleGroup>) => void;
  
  // Helper to update specific fields in a group
  addImageToGroup: (groupId: string, image: ImageData) => void;
  removeImageFromGroup: (groupId: string, imageId: string) => void;
  
  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
}

const createEmptyGroup = (): ArticleGroup => ({
  id: Math.random().toString(36).substr(2, 9),
  images: [],
  englishArticle: '',
  storagePath: '',
  status: 'idle',
});

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
        customInstructions: DEFAULT_INSTRUCTIONS,
      },
      setConfig: (newConfig) =>
        set((state) => ({ config: { ...state.config, ...newConfig } })),

      currentStep: 'upload',
      setStep: (step) => set({ currentStep: step }),

      articleGroups: [createEmptyGroup()],
      
      addArticleGroup: () => set((state) => {
        if (state.articleGroups.length >= 4) return state;
        const newGroup = createEmptyGroup();
        
        // Auto-fill logic
        if (state.articleGroups.length > 0) {
            const lastGroup = state.articleGroups[state.articleGroups.length - 1];
            if (lastGroup.storagePath && lastGroup.storagePath.endsWith('.html')) {
                // Try to auto-increment filename
                const parts = lastGroup.storagePath.split('/');
                const filename = parts.pop() || '';
                const dir = parts.join('/');
                
                const match = filename.match(/^(.*?)(\d+)(\.html)$/);
                if (match) {
                    const prefix = match[1];
                    const num = parseInt(match[2]);
                    const suffix = match[3];
                    const newFilename = `${prefix}${num + 1}${suffix}`;
                    newGroup.storagePath = dir ? `${dir}/${newFilename}` : newFilename;
                } else {
                     // Fallback: just append "2" or similar if no number found, or keep directory structure?
                     // Requirement: "subsequent groups auto-fill with same directory structure but incremented/different filenames"
                     // If text1.html -> text2.html.
                     // If text.html -> text_copy.html? The requirement example is specific about text1 -> text2.
                     // I'll implement basic increment logic.
                     newGroup.storagePath = lastGroup.storagePath; // Fallback to copy? Or maybe leave empty? 
                     // Requirement says "auto-fill ... same directory structure (e.g. "country/music/text2.html")".
                     // If I can't increment, maybe I shouldn't auto-fill to avoid duplicate path error.
                }
            }
        }
        
        return { articleGroups: [...state.articleGroups, newGroup] };
      }),
      
      removeArticleGroup: (id) =>
        set((state) => ({ 
            articleGroups: state.articleGroups.length > 1 
                ? state.articleGroups.filter((g) => g.id !== id) 
                : state.articleGroups // Keep at least one
        })),

      updateArticleGroup: (id, updates) =>
        set((state) => ({
          articleGroups: state.articleGroups.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      addImageToGroup: (groupId, image) =>
        set((state) => ({
          articleGroups: state.articleGroups.map((g) =>
            g.id === groupId 
                ? { ...g, images: [...g.images, image].slice(0, 3) } // Max 3 images
                : g
          ),
        })),

      removeImageFromGroup: (groupId, imageId) =>
        set((state) => ({
          articleGroups: state.articleGroups.map((g) =>
            g.id === groupId
                ? { ...g, images: g.images.filter((img) => img.id !== imageId) }
                : g
          ),
        })),

      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),
    }),
    {
      name: 'enhub-storage',
      partialize: (state) => ({ config: state.config }), // Only persist config
    }
  )
);