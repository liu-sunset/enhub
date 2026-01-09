import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/Button';
import { X, Save, AlertTriangle, RotateCcw } from 'lucide-react';
import { PROMPT_PREFIX, DEFAULT_INSTRUCTIONS } from '../services/prompts';

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onClose }) => {
  const { config, setConfig } = useAppStore();
  const [formData, setFormData] = useState(config);

  useEffect(() => {
    if (isOpen) {
        setFormData({
            ...config,
            customInstructions: config.customInstructions || DEFAULT_INSTRUCTIONS
        });
    }
  }, [isOpen, config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setConfig(formData);
    onClose();
  };

  const handleResetPrompt = () => {
    setFormData(prev => ({ ...prev, customInstructions: DEFAULT_INSTRUCTIONS }));
  };

  if (!isOpen) return null;

  const isCustomPrompt = formData.customInstructions !== DEFAULT_INSTRUCTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                  <h3 className="font-medium text-slate-900 border-b pb-2">API Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Aliyun API Key (DashScope)
                    </label>
                    <input
                      type="password"
                      name="aliyunApiKey"
                      value={formData.aliyunApiKey}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="sk-..."
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Get your API Key from <a href="https://bailian.console.aliyun.com/" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Aliyun Bailian Console</a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      API Base URL
                    </label>
                    <input
                      type="text"
                      name="baseUrl"
                      value={formData.baseUrl}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      AI Model (Qwen Vision)
                    </label>
                    <select
                      name="defaultModel"
                      value={formData.defaultModel}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="qwen3-vl-flash">qwen3-vl-flash</option>
                      <option value="qwen-vl-max">qwen-vl-max (Latest)</option>
                      <option value="qwen-vl-plus">qwen-vl-plus</option>
                      <option value="qwen2.5-vl-72b-instruct">qwen2.5-vl-72b-instruct</option>
                    </select>
                  </div>
              </div>

              <div className="space-y-4">
                  <h3 className="font-medium text-slate-900 border-b pb-2">GitHub Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Personal Access Token
                    </label>
                    <input
                      type="password"
                      name="githubToken"
                      value={formData.githubToken}
                      onChange={handleChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="ghp_..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Repo Owner
                      </label>
                      <input
                        type="text"
                        name="repoOwner"
                        value={formData.repoOwner}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Repo Name
                      </label>
                      <input
                        type="text"
                        name="repoName"
                        value={formData.repoName}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        placeholder="repo"
                      />
                    </div>
                  </div>
              </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
             <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  System Prompt Settings
                </label>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isCustomPrompt ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {isCustomPrompt ? 'Customized' : 'Default'}
                    </span>
                    {isCustomPrompt && (
                        <button 
                            onClick={handleResetPrompt}
                            className="text-xs flex items-center gap-1 text-slate-500 hover:text-emerald-600"
                        >
                            <RotateCcw size={12} /> Reset
                        </button>
                    )}
                </div>
             </div>
             
             <div className="border border-slate-300 rounded-md overflow-hidden">
                 <div className="bg-slate-100 px-3 py-2 text-xs text-slate-500 font-mono border-b border-slate-300">
                    {PROMPT_PREFIX}
                 </div>
                 <textarea
                    name="customInstructions"
                    value={formData.customInstructions || DEFAULT_INSTRUCTIONS}
                    onChange={handleChange}
                    className="w-full h-48 px-3 py-2 text-sm font-mono focus:outline-none resize-y"
                    placeholder="Enter custom instructions..."
                 />
             </div>
             
             <div className="flex items-start gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>Warning: Modifying the system prompt instructions may significantly affect the quality and format of the output. Proceed with caution.</p>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end flex-shrink-0">
          <Button onClick={handleSave} variant="secondary">
            <Save size={16} className="mr-2" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
