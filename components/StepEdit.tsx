import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/Button';
import { ArrowLeft, ArrowRight, Code, Eye } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';

// Configure Monaco loader to use unpkg.com.
// Monaco's internal loader requires raw AMD files (loader.js etc), not ES modules.
// esm.sh serves ES modules which causes the editor to hang at "Loading...".
loader.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });

export const StepEdit: React.FC = () => {
  const { generatedHtml, setGeneratedHtml, setStep } = useAppStore();
  const [localHtml, setLocalHtml] = useState(generatedHtml);

  // Sync store when user stops typing
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalHtml(value);
      setGeneratedHtml(value);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <Button variant="ghost" onClick={() => setStep('upload')} className="text-slate-500">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <h2 className="text-lg font-semibold text-slate-900">Review & Edit</h2>
        <Button variant="secondary" onClick={() => setStep('save')}>
          Next: Save <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
        {/* Editor Pane */}
        <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Code size={16} /> HTML Source
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="html"
              value={localHtml}
              onChange={handleEditorChange}
              loading={<div className="flex items-center justify-center h-full text-slate-400">Loading Editor...</div>}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                theme: 'light',
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

        {/* Preview Pane */}
        <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
           <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Eye size={16} /> Live Preview
          </div>
          <div className="flex-1 bg-white relative">
            <iframe 
              srcDoc={localHtml} 
              title="Preview" 
              className="w-full h-full border-none"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
};