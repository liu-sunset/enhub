import React, { useState, useEffect } from 'react';
import { useAppStore } from './lib/store';
import { ConfigDialog } from './components/ConfigDialog';
import { StepUpload } from './components/StepUpload';
import { StepEdit } from './components/StepEdit';
import { StepSave } from './components/StepSave';
import { Settings, BookOpen } from 'lucide-react';
import { Button } from './components/ui/Button';

export default function App() {
  const { currentStep, config, articleGroups } = useAppStore();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Calculate effective step for the progress indicator based on group status
  const effectiveStep = React.useMemo(() => {
    // If we're not in the upload step component, follow the store's currentStep
    if (currentStep !== 'upload') return currentStep;
    
    // In the upload/article-groups component, derive progress from groups
    if (articleGroups.some(g => g.isSaved)) return 'save';
    if (articleGroups.some(g => g.status === 'success')) return 'edit';
    return 'upload';
  }, [currentStep, articleGroups]);

  // Prompt for config on first load if missing keys
  useEffect(() => {
    if (!config.aliyunApiKey || !config.githubToken) {
      setIsConfigOpen(true);
    }
  }, [config.aliyunApiKey, config.githubToken]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      <ConfigDialog isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">EnHub Web</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
               <span className={`px-2 py-1 rounded ${effectiveStep === 'upload' ? 'bg-slate-100 text-slate-900 font-medium' : ''}`}>1. Upload</span>
               <span>→</span>
               <span className={`px-2 py-1 rounded ${effectiveStep === 'edit' ? 'bg-slate-100 text-slate-900 font-medium' : ''}`}>2. Edit</span>
               <span>→</span>
               <span className={`px-2 py-1 rounded ${effectiveStep === 'save' ? 'bg-slate-100 text-slate-900 font-medium' : ''}`}>3. Archive</span>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <Button variant="ghost" onClick={() => setIsConfigOpen(true)} size="icon">
              <Settings size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {currentStep === 'upload' && <StepUpload />}
        {currentStep === 'edit' && <StepEdit />}
        {currentStep === 'save' && <StepSave />}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-400 border-t border-slate-200 mt-auto bg-white">
        <p>EnHub Web &copy; {new Date().getFullYear()} • Privacy Focused • Local Browser Processing</p>
      </footer>
    </div>
  );
}