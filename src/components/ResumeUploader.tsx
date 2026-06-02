import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, FileUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface ResumeUploaderProps {
  onUploadSuccess: (fileContent: { text?: string; base64?: string }, fileName: string) => Promise<void>;
  isLoading?: boolean;
  currentFileName?: string;
}

export default function ResumeUploader({ onUploadSuccess, isLoading = false, currentFileName }: ResumeUploaderProps) {
  const [resumeText, setResumeText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    const lowercaseName = file.name.toLowerCase();
    
    const isText = file.type === 'text/plain' || lowercaseName.endsWith('.txt') || lowercaseName.endsWith('.md') || lowercaseName.endsWith('.json');
    const isPdf = file.type === 'application/pdf' || lowercaseName.endsWith('.pdf');
    const isDoc = file.type === 'application/msword' || lowercaseName.endsWith('.doc');
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowercaseName.endsWith('.docx');

    if (!isText && !isPdf && !isDoc && !isDocx) {
      setError('Please upload a valid resume file (.pdf, .docx, .doc, .txt, .md) or paste the raw content.');
      return;
    }

    const reader = new FileReader();
    if (isText) {
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (text) {
          await onUploadSuccess({ text }, file.name);
        }
      };
      reader.onerror = () => {
        setError('Failed to properly parse file.');
      };
      reader.readAsText(file);
    } else {
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          const base64 = result.split(',')[1];
          await onUploadSuccess({ base64 }, file.name);
        }
      };
      reader.onerror = () => {
        setError('Failed to read binary file data.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resumeText.trim()) {
      setError('Please insert some resume text for parsing.');
      return;
    }
    await onUploadSuccess({ text: resumeText }, 'pasted_resume.txt');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Resume intelligence source</h3>
        </div>
        <button
          type="button"
          onClick={() => setManualInput(!manualInput)}
          className="text-[10px] text-cyan-400 underline hover:text-cyan-300 transition-colors cursor-pointer"
        >
          {manualInput ? 'Switch to text upload' : 'Switch to direct copy/paste'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-xs flex gap-2 items-start">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {currentFileName && !isLoading && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <div>
            Active profile resume: <span className="font-semibold text-white">{currentFileName}</span>
          </div>
        </div>
      )}

      {manualInput ? (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
              Paste Copy of Complete Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              required
              className="w-full bg-slate-900/60 p-3.5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 font-mono resize-none"
              placeholder={`ALEX MERCER - Full Stack Developer
alex.mercer@gmail.com | 555-0199

SKILLS: React, Node, Express, TypeScript, SQL, LLM APIs
EXPERIENCE:
- Sr. Software Engineer at Vortex (2024-Present)
  Built custom vector search layouts improving load score by 40%...`}
            />
          </div>
          <button
            id="text-resume-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing & Indexing candidate...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                Analyze Paste & score Profile
              </>
            )}
          </button>
        </form>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-white/10 hover:border-white/20 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".txt,.md,.json,.pdf,.doc,.docx"
            className="hidden"
          />
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="text-xs font-bold text-slate-200">AI Parser Running ATS scoring parameters...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <FileUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Drag & drop resume, or browse files</p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Supports PDF, Word (.docx, .doc), and Text/MD files</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
