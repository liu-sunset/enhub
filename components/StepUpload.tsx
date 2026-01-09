import React, { useRef } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/Button';
import { Upload, X, FileImage, Sparkles } from 'lucide-react';
import { generateHtmlFromImages } from '../services/ai';

// Helper to resize images to avoid massive payloads (typical cause of network errors)
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 1536; // Max dimension constraint to keep payload reasonable

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
            // Use JPEG with 0.8 quality for good compression/quality ratio
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
            resolve(e.target?.result as string); // Fallback
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const StepUpload: React.FC = () => {
  const { images, addImage, removeImage, config, isProcessing, setIsProcessing, setGeneratedHtml, setStep } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        // Process/Resize image before adding to store
        try {
            const base64 = await resizeImage(file);
            addImage({
              id: Math.random().toString(36).substr(2, 9),
              file,
              previewUrl: URL.createObjectURL(file), // Keep local blob for preview
              base64: base64 // Use optimized base64 for API
            });
        } catch (e) {
            console.error("Failed to process image", e);
        }
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (images.length === 0) return;
    if (!config.aliyunApiKey) {
        alert("Please configure your Aliyun API Key first.");
        return;
    }

    setIsProcessing(true);
    try {
      // Sort images by ID (creation time essentially) or user interaction if implemented
      // Here we assume insertion order is correct
      const base64Images = images.map(img => img.base64);
      const html = await generateHtmlFromImages(
          base64Images, 
          config.defaultModel, 
          config.aliyunApiKey,
          config.baseUrl
      );
      setGeneratedHtml(html);
      setStep('edit');
    } catch (error) {
      alert(`Error processing images: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Article Pages</h2>
        <p className="text-slate-500">Select images of the English text you want to digitize.</p>
      </div>

      <div 
        className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Click to upload images</h3>
        <p className="text-sm text-slate-500 mt-1">or drag and drop here</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple 
          accept="image/*"
        />
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Queue ({images.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-8">
        <Button 
          variant="secondary" 
          className="w-full max-w-sm h-12 text-lg"
          disabled={images.length === 0}
          isLoading={isProcessing}
          onClick={handleProcess}
        >
           <Sparkles className="mr-2" size={20} />
           {isProcessing ? 'Digitizing...' : 'Digitize Images'}
        </Button>
      </div>
    </div>
  );
};