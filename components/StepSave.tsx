import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/Button';
import { ArrowLeft, Github, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { uploadFileToRepo } from '../services/github';

export const StepSave: React.FC = () => {
  const { generatedHtml, config, setStep, clearImages } = useAppStore();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [fileId, setFileId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!year || !fileId) {
      setError("Please provide both Year and Article ID.");
      return;
    }
    if (!config.githubToken || !config.repoName) {
      setError("GitHub configuration missing. Check settings.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadFileToRepo(generatedHtml, year, fileId, {
        token: config.githubToken,
        owner: config.repoOwner,
        repo: config.repoName
      });
      setSuccessUrl(url);
      clearImages(); // Cleanup
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  if (successUrl) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 py-12">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Archived Successfully!</h2>
          <p className="text-slate-500">Your article has been committed to GitHub.</p>
        </div>
        
        <div className="p-4 bg-slate-100 rounded-lg flex items-center justify-center break-all text-sm font-mono text-slate-600">
          {`en2/${year}/${fileId}.html`}
        </div>

        <div className="flex gap-4 justify-center">
            <a href={successUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-emerald-600 hover:underline">
                View on GitHub <ExternalLink size={16} className="ml-1" />
            </a>
        </div>

        <Button onClick={() => {
            setStep('upload');
            setSuccessUrl(null);
            setFileId('');
        }} className="mt-8">
            Process Another Article
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setStep('edit')} className="text-slate-500 p-0 hover:bg-transparent hover:text-slate-800">
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-slate-900">Finalize & Archive</h2>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Year
          </label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="e.g., 2012"
          />
          <p className="text-xs text-slate-400 mt-1">This defines the folder structure.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Article ID (Filename)
          </label>
          <input
            type="text"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="e.g., how-to-code"
          />
          <p className="text-xs text-slate-400 mt-1">Will be saved as <code>{fileId || 'filename'}.html</code></p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="pt-4">
          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleUpload}
            isLoading={isUploading}
          >
            <Github className="mr-2" size={20} /> Upload to GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};
