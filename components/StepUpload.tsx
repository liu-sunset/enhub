import React, { useRef, useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/Button';
import { Upload, X, FileImage, Sparkles, Plus, Trash2, AlertCircle, CheckCircle, Save, ExternalLink, RotateCw, ArrowLeft } from 'lucide-react';
import { generateHtmlFromImages } from '../services/ai';
import { uploadFileToRepo } from '../services/github';
import { PROMPT_PREFIX, DEFAULT_INSTRUCTIONS } from '../services/prompts';
import Editor, { loader } from '@monaco-editor/react';

loader.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });

// Helper to resize images
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 1536;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
            resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const StepUpload: React.FC = () => {
  const { 
    articleGroups, 
    addArticleGroup, 
    removeArticleGroup, 
    updateArticleGroup, 
    addImageToGroup, 
    removeImageFromGroup, 
    isProcessing, 
    setIsProcessing,
    config
  } = useAppStore();

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleProcessAll = async () => {
    if (!config.aliyunApiKey) {
        alert("Please configure your Aliyun API Key first.");
        return;
    }

    // Validate paths
    const paths = new Set<string>();
    for (const group of articleGroups) {
        if (!group.storagePath.endsWith('.html')) {
            alert(`Group ${group.id}: Storage path must end with .html`);
            return;
        }
        if (paths.has(group.storagePath)) {
            alert(`Duplicate storage path found: ${group.storagePath}`);
            return;
        }
        paths.add(group.storagePath);
    }

    setIsProcessing(true);
    
    // Process all groups as requested
    const groupsToProcess = articleGroups;
    
    // Set status to processing
    groupsToProcess.forEach(g => updateArticleGroup(g.id, { 
        status: 'processing', 
        error: undefined,
        generatedHtml: '', // Clear previous result
        isSaved: false,
        githubUrl: undefined
    }));

    const processGroup = async (group: typeof articleGroups[0]) => {
        try {
            if (group.images.length === 0 && !group.englishArticle) {
                throw new Error("No content to process");
            }

            const base64Images = group.images.map(img => img.base64);
            const html = await generateHtmlFromImages(
                base64Images,
                group.englishArticle,
                config.defaultModel,
                config.aliyunApiKey,
                config.baseUrl,
                `${PROMPT_PREFIX}\n${config.customInstructions || DEFAULT_INSTRUCTIONS}`
            );
            
            updateArticleGroup(group.id, { 
                status: 'success', 
                generatedHtml: html 
            });
        } catch (error) {
            updateArticleGroup(group.id, { 
                status: 'error', 
                error: (error as Error).message 
            });
        }
    };

    // Parallel processing with Promise.allSettled to ensure all run
    await Promise.allSettled(groupsToProcess.map(g => processGroup(g)));
    
    setIsProcessing(false);
  };

  const hasResults = articleGroups.some(g => g.status === 'success' || g.isSaved);

  const handleBackToStart = () => {
    articleGroups.forEach(g => {
        updateArticleGroup(g.id, { 
            status: 'idle', 
            error: undefined,
            isSaved: false // Reset saved status to ensure UI returns to step 1 completely
        });
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="relative">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Article Groups</h2>
            <p className="text-slate-500">Manage and digitize multiple articles simultaneously.</p>
        </div>
        {hasResults && (
            <div className="absolute top-0 right-0">
                <Button variant="outline" onClick={handleBackToStart}>
                    <ArrowLeft size={16} className="mr-2" /> 返回第一步
                </Button>
            </div>
        )}
      </div>

      <div className="space-y-6">
        {articleGroups.map((group, index) => (
          <GroupCard 
            key={group.id} 
            group={group} 
            index={index} 
            onRemove={() => removeArticleGroup(group.id)}
            canRemove={articleGroups.length > 1}
            onPreviewImage={setPreviewImage}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        {articleGroups.length < 4 && !hasResults && (
            <Button variant="outline" onClick={addArticleGroup} className="w-full max-w-md border-dashed">
                <Plus size={16} className="mr-2" /> Add Article Group
            </Button>
        )}
        
        <Button 
          variant="secondary" 
          className="w-full max-w-md h-12 text-lg"
          isLoading={isProcessing}
          onClick={handleProcessAll}
        >
           <Sparkles className="mr-2" size={20} />
           {isProcessing ? 'Processing...' : 'Process All Groups'}
        </Button>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <img 
              src={previewImage} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const GroupCard: React.FC<{
    group: any, 
    index: number, 
    onRemove: () => void,
    canRemove: boolean,
    onPreviewImage: (url: string) => void
}> = ({ group, index, onRemove, canRemove, onPreviewImage }) => {
    const { updateArticleGroup, addImageToGroup, removeImageFromGroup, config } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isUploadingToGithub, setIsUploadingToGithub] = useState(false);

    const handleRegenerate = async () => {
        if (!config.aliyunApiKey) {
            alert("Please configure your Aliyun API Key first.");
            return;
        }

        updateArticleGroup(group.id, { 
            status: 'processing', 
            error: undefined, 
            generatedHtml: '',
            isSaved: false,
            githubUrl: undefined
        });

        try {
            const base64Images = group.images.map((img: any) => img.base64);
            const html = await generateHtmlFromImages(
                base64Images,
                group.englishArticle,
                config.defaultModel,
                config.aliyunApiKey,
                config.baseUrl,
                `${PROMPT_PREFIX}\n${config.customInstructions || DEFAULT_INSTRUCTIONS}`
            );
            
            updateArticleGroup(group.id, { 
                status: 'success', 
                generatedHtml: html 
            });
        } catch (error) {
            updateArticleGroup(group.id, { 
                status: 'error', 
                error: (error as Error).message 
            });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            // Limit to remaining slots
            const remaining = 3 - group.images.length;
            const toAdd = files.slice(0, remaining);
            
            for (const file of toAdd) {
                if (!file.type.startsWith('image/')) continue;
                try {
                    const base64 = await resizeImage(file);
                    addImageToGroup(group.id, {
                        id: Math.random().toString(36).substr(2, 9),
                        file,
                        previewUrl: URL.createObjectURL(file),
                        base64
                    });
                } catch (e) {
                    console.error("Failed to process image", e);
                }
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveToGithub = async () => {
        if (!group.generatedHtml) return;
        if (!config.githubToken || !config.repoName || !config.repoOwner) {
            alert("Please check GitHub configuration.");
            return;
        }
        
        setIsUploadingToGithub(true);
        try {
            const url = await uploadFileToRepo(group.generatedHtml, "raw_path", group.storagePath, {
                token: config.githubToken,
                owner: config.repoOwner,
                repo: config.repoName
            });
            
            updateArticleGroup(group.id, { 
                isSaved: true, 
                githubUrl: url 
            });
            alert("Saved to GitHub successfully!");
        } catch (e) {
            alert(`Failed to save: ${(e as Error).message}`);
        } finally {
            setIsUploadingToGithub(false);
        }
    };

    return (
        <div className={`bg-white rounded-xl border ${group.status === 'error' ? 'border-red-200' : 'border-slate-200'} shadow-sm overflow-hidden`}>
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded text-sm">#{index + 1}</span>
                    <span className="font-medium text-slate-700">Article Group</span>
                    {group.status === 'processing' && <span className="text-amber-600 text-sm flex items-center"><Sparkles size={14} className="mr-1 animate-spin"/> Processing...</span>}
                    {group.status === 'success' && <span className="text-emerald-600 text-sm flex items-center"><CheckCircle size={14} className="mr-1"/> Ready</span>}
                    {group.status === 'error' && <span className="text-red-600 text-sm flex items-center"><AlertCircle size={14} className="mr-1"/> Failed</span>}
                </div>
                {canRemove && (
                    <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Inputs */}
                {group.status !== 'success' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">English Article Text</label>
                                <textarea 
                                    className="w-full h-32 rounded-md border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                                    placeholder="Paste the English text here..."
                                    value={group.englishArticle}
                                    onChange={(e) => updateArticleGroup(group.id, { englishArticle: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Storage Path (e.g., country/music/text1.html)</label>
                                <input 
                                    type="text"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    placeholder="path/to/file.html"
                                    value={group.storagePath}
                                    onChange={(e) => updateArticleGroup(group.id, { storagePath: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Reference Images (Max 3)</label>
                             <div className="grid grid-cols-3 gap-3 mb-3">
                                {group.images.map((img: any) => (
                                    <div 
                                        key={img.id} 
                                        className="relative aspect-[3/4] bg-slate-100 rounded border border-slate-200 overflow-hidden group/img cursor-pointer"
                                        onClick={() => onPreviewImage(img.previewUrl)}
                                    >
                                        <img src={img.previewUrl} className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <ExternalLink size={20} className="text-white" />
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImageFromGroup(group.id, img.id);
                                            }}
                                            className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity z-10 hover:bg-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {group.images.length < 3 && (
                                    <div 
                                        className="aspect-[3/4] border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Plus size={24} />
                                        <span className="text-xs mt-1">Add Image</span>
                                    </div>
                                )}
                             </div>
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                multiple 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                )}
                
                {group.status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Processing Failed</p>
                                <p>{group.error}</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300"
                            onClick={handleRegenerate}
                        >
                            <RotateCw size={14} className="mr-1" /> Retry
                        </Button>
                    </div>
                )}

                {group.status === 'success' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(!isEditorOpen)}>
                                {isEditorOpen ? 'Hide Editor' : 'View/Edit Result'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleRegenerate}>
                                <RotateCw size={14} className="mr-1" /> Regenerate
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleSaveToGithub} isLoading={isUploadingToGithub}>
                                <Save size={16} className="mr-2" /> Save to GitHub
                            </Button>
                            {group.githubUrl && (
                                <a href={group.githubUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center text-sm">
                                    View on GitHub <ExternalLink size={14} className="ml-1" />
                                </a>
                            )}
                        </div>

                        {isEditorOpen && (
                             <div className="h-[500px] border border-slate-200 rounded-lg overflow-hidden flex flex-col md:flex-row">
                                <div className="flex-1 border-r border-slate-200 flex flex-col">
                                    <div className="bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-200">Editor</div>
                                    <Editor
                                        height="500px"
                                        defaultLanguage="html"
                                        value={group.generatedHtml}
                                        onChange={(val) => updateArticleGroup(group.id, { 
                                            generatedHtml: val,
                                            isSaved: false,
                                            githubUrl: undefined
                                        })}
                                        options={{ minimap: { enabled: false }, wordWrap: 'on' }}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col bg-white">
                                    <div className="bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-200">Preview</div>
                                    <iframe 
                                        srcDoc={group.generatedHtml} 
                                        className="w-full h-full border-none"
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
